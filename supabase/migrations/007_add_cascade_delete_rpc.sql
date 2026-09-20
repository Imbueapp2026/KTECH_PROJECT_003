-- =========================================================
-- Migration 007 — Add RPC function for cascade delete of offers
-- - delete_offer_cascade: Transactional delete that clears product references
-- =========================================================

-- ── Create RPC function for cascade delete ───────────────────────────────
create or replace function delete_offer_cascade(offer_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
    product_count int;
begin
    -- Check if offer exists
    if not exists (select 1 from offers where id = offer_id) then
        raise exception 'Offer not found';
    end if;

    -- Count products using this offer
    select count(*) into product_count
    from products
    where offer_id = delete_offer_cascade.offer_id;

    -- Start transaction (implicit in function)
    
    -- Clear offer_id from all products that reference this offer
    update products
    set offer_id = null
    where offer_id = delete_offer_cascade.offer_id;

    -- Delete all discounts associated with this offer
    delete from discounts
    where offer_id = delete_offer_cascade.offer_id;

    -- Delete the offer itself
    delete from offers
    where id = delete_offer_cascade.offer_id;

    -- Log the deletion
    raise notice 'Deleted offer % and % associated discounts. Updated % products.',
        offer_id, product_count, product_count;

    return true;
end;
$$;

-- ── Grant execute permission to service role ─────────────────────────────
grant execute on function delete_offer_cascade(uuid) to service_role;

-- ── Add comment for documentation ─────────────────────────────────────────
comment on function delete_offer_cascade is 'Cascade delete an offer: clears product references, deletes discounts, then deletes the offer. Must be called by service role.';
