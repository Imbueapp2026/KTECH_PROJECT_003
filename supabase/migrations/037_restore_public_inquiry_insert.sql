-- Restore the anonymous contact-form insert policy.
-- Public clients may submit inquiries but may not read, update, or delete them.
drop policy if exists "inquiries: public insert" on inquiries;

create policy "inquiries: public insert"
  on inquiries
  for insert
  to anon, authenticated
  with check (true);