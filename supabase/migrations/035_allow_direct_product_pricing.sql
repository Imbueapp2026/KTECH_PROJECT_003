-- Allow products to retain a manually entered direct price.
alter table products
drop constraint if exists price_auto_calculated_must_be_true;

comment on column products.price_auto_calculated is 'Whether price is calculated from metal pricing fields or manually set';

-- Keep manually priced products unchanged when metal prices are refreshed.
create or replace function recalculate_all_products_with_missing_data(
	p_gold_price_per_gram numeric,
	p_silver_price_per_gram numeric,
	p_material_type text default null
)
returns json
language plpgsql
as $$
declare
	product_record record;
	updated_products jsonb := '[]'::jsonb;
	skipped_products jsonb := '[]'::jsonb;
	missing_fields text[];
	result json;
begin
	for product_record in
		select id, name, price, purity_carats, weight_grams, making_charge_type,
			making_charge_percent, making_charge_flat, material_type
		from products
		where status = 'published'
			and price_auto_calculated = true
			and (p_material_type is null or material_type = p_material_type)
	loop
		missing_fields := array[]::text[];
		if (product_record.material_type is null or product_record.material_type = 'gold')
			and product_record.purity_carats is null then
			missing_fields := array_append(missing_fields, 'purity_carats');
		end if;
		if product_record.weight_grams is null or product_record.weight_grams <= 0 then
			missing_fields := array_append(missing_fields, 'weight_grams');
		end if;
		if product_record.making_charge_type is null then
			missing_fields := array_append(missing_fields, 'making_charge_type');
		elsif product_record.making_charge_type = 'percent'
			and (product_record.making_charge_percent is null or product_record.making_charge_percent < 0) then
			missing_fields := array_append(missing_fields, 'making_charge_percent');
		elsif product_record.making_charge_type = 'flat'
			and (product_record.making_charge_flat is null or product_record.making_charge_flat < 0) then
			missing_fields := array_append(missing_fields, 'making_charge_flat');
		end if;

		if array_length(missing_fields, 1) is null then
			declare
				new_price numeric;
				used_metal_price numeric;
			begin
				new_price := calculate_product_price(
					product_record.purity_carats, product_record.weight_grams,
					product_record.making_charge_type, product_record.making_charge_percent,
					product_record.making_charge_flat, p_gold_price_per_gram,
					p_silver_price_per_gram, product_record.material_type
				);
				used_metal_price := case when product_record.material_type = 'silver'
					then p_silver_price_per_gram else p_gold_price_per_gram end;
				update products set price = new_price, gold_price_used = used_metal_price,
					updated_at = now() where id = product_record.id;
				updated_products := updated_products || jsonb_build_object(
					'id', product_record.id, 'name', product_record.name,
					'old_price', product_record.price, 'new_price', new_price);
			exception when others then
				skipped_products := skipped_products || jsonb_build_object(
					'id', product_record.id, 'name', product_record.name, 'error', SQLERRM);
			end;
		else
			skipped_products := skipped_products || jsonb_build_object(
				'id', product_record.id, 'name', product_record.name,
				'missing_fields', to_jsonb(missing_fields));
		end if;
	end loop;
	result := json_build_object(
		'success', true, 'updated_count', jsonb_array_length(updated_products),
		'updated_products', updated_products, 'skipped_count', jsonb_array_length(skipped_products),
		'skipped_products', skipped_products);
	return result;
end;
$$;