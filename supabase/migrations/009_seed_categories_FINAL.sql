-- =========================================================
-- Migration 002 — Seed: Indian Jewellery Categories
--
-- 16 classic Indian jewellery types, each with:
--   • name + slug  (display & URL-safe key)
--   • icon_svg     (hand-crafted minimal SVG, safe to inline in HTML)
--   • sort_order   (editorial order for the UI grid)
--   • is_system = true (admin cannot delete these)
-- =========================================================

insert into categories (name, slug, sort_order, is_system, icon_svg)
values

-- 1. Rings
(
  'Rings', 'rings', 1, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="27" r="14"/><circle cx="24" cy="27" r="8"/><path d="M18 14c0-3.31 2.69-6 6-6s6 2.69 6 6"/><path d="M20 14h8"/></svg>'
),

-- 2. Necklaces
(
  'Necklaces', 'necklaces', 2, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10c0 0 4 22 16 22s16-22 16-22"/><circle cx="24" cy="36" r="5"/><path d="M12 10a4 4 0 0 1-4 0"/><path d="M36 10a4 4 0 0 1-4 0"/></svg>'
),

-- 3. Bangles
(
  'Bangles', 'bangles', 3, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="10"/></svg>'
),

-- 4. Earrings
(
  'Earrings', 'earrings', 4, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="6" x2="16" y2="12"/><path d="M13 12h6a2 2 0 0 1 2 2v2a8 8 0 0 1-8 8 8 8 0 0 1-8-8v-2a2 2 0 0 1 2-2h6z"/><circle cx="16" cy="34" r="4"/><line x1="32" y1="6" x2="32" y2="12"/><path d="M29 12h6a2 2 0 0 1 2 2v2a8 8 0 0 1-8 8 8 8 0 0 1-8-8v-2a2 2 0 0 1 2-2h6z"/><circle cx="32" cy="34" r="4"/></svg>'
),

-- 5. Bracelets
(
  'Bracelets', 'bracelets', 5, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 24a14 14 0 0 1 28 0"/><path d="M10 24a14 14 0 0 0 28 0"/><circle cx="24" cy="10" r="3"/><circle cx="37" cy="17" r="2"/><circle cx="11" cy="17" r="2"/></svg>'
),

-- 6. Anklets (Payal)
(
  'Anklets', 'anklets', 6, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="24" cy="22" rx="14" ry="10"/><path d="M14 29l-2 6"/><path d="M20 31l-1 7"/><path d="M24 32v7"/><path d="M28 31l1 7"/><path d="M34 29l2 6"/><circle cx="12" cy="36" r="2"/><circle cx="19" cy="38" r="2"/><circle cx="24" cy="39" r="2"/><circle cx="29" cy="38" r="2"/><circle cx="36" cy="36" r="2"/></svg>'
),

-- 7. Maang Tikka (Head Ornament)
(
  'Maang Tikka', 'maang-tikka', 7, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6 L18 18 L30 18 Z"/><path d="M14 8 Q24 4 34 8"/><circle cx="24" cy="22" r="5"/><line x1="24" y1="27" x2="24" y2="38"/><circle cx="24" cy="41" r="3"/></svg>'
),

-- 8. Nose Ring (Nath)
(
  'Nose Rings', 'nose-rings', 8, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="14"/><circle cx="24" cy="26" r="8"/><path d="M24 12 Q30 6 36 10"/><circle cx="36" cy="11" r="2.5" fill="currentColor"/></svg>'
),

-- 9. Mangalsutra
(
  'Mangalsutra', 'mangalsutra', 9, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6 Q12 18 24 22 Q36 18 36 6"/><circle cx="18" cy="10" r="2" fill="currentColor"/><circle cx="24" cy="8" r="2" fill="currentColor"/><circle cx="30" cy="10" r="2" fill="currentColor"/><path d="M24 22 L24 34"/><path d="M20 28 Q24 34 28 28"/><ellipse cx="24" cy="38" rx="6" ry="4"/></svg>'
),

-- 10. Waist Belt (Kamarbandh)
(
  'Kamarbandh', 'kamarbandh', 10, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="18" width="40" height="12" rx="6"/><circle cx="12" cy="24" r="3"/><circle cx="24" cy="24" r="4"/><circle cx="36" cy="24" r="3"/><path d="M4 24 L8 20 M44 24 L40 20"/></svg>'
),

-- 11. Jhumkas (Bell Earrings)
(
  'Jhumkas', 'jhumkas', 11, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="10" r="3"/><rect x="11" y="13" width="10" height="6" rx="2"/><path d="M11 19 Q10 28 16 32 Q22 28 21 19"/><line x1="16" y1="32" x2="16" y2="38"/><circle cx="32" cy="10" r="3"/><rect x="27" y="13" width="10" height="6" rx="2"/><path d="M27 19 Q26 28 32 32 Q38 28 37 19"/><line x1="32" y1="32" x2="32" y2="38"/></svg>'
),

-- 12. Haar (Long Necklace)
(
  'Haar', 'haar', 12, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 8 Q10 28 24 38 Q38 28 38 8"/><circle cx="15" cy="14" r="2" fill="currentColor"/><circle cx="20" cy="10" r="2" fill="currentColor"/><circle cx="24" cy="9" r="2.5" fill="currentColor"/><circle cx="28" cy="10" r="2" fill="currentColor"/><circle cx="33" cy="14" r="2" fill="currentColor"/><ellipse cx="24" cy="40" rx="5" ry="6"/></svg>'
),

-- 13. Pendant
(
  'Pendants', 'pendants', 13, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8 Q24 6 36 8"/><line x1="24" y1="8" x2="24" y2="20"/><path d="M14 20 L24 44 L34 20 Z"/><circle cx="24" cy="30" r="4"/></svg>'
),

-- 14. Cuff / Kada
(
  'Kada', 'kada', 14, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 24 A14 14 0 0 1 38 24"/><path d="M10 24 A14 14 0 0 0 38 24"/><rect x="8" y="20" width="32" height="8" rx="4"/></svg>'
),

-- 15. Matha Patti (Forehead Jewel)
(
  'Matha Patti', 'matha-patti', 15, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14 Q24 10 42 14"/><path d="M10 14 L14 26"/><path d="M38 14 L34 26"/><path d="M14 26 Q24 22 34 26"/><line x1="24" y1="22" x2="24" y2="36"/><circle cx="24" cy="39" r="4"/><circle cx="14" cy="26" r="3"/><circle cx="34" cy="26" r="3"/></svg>'
),

-- 16. Choker
(
  'Choker', 'choker', 16, true,
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20 Q24 14 40 20"/><path d="M8 20 Q24 28 40 20"/><circle cx="16" cy="21" r="2" fill="currentColor"/><circle cx="24" cy="18" r="3"/><circle cx="32" cy="21" r="2" fill="currentColor"/></svg>'
)

on conflict (slug) do update set
  name       = excluded.name,
  icon_svg   = excluded.icon_svg,
  sort_order = excluded.sort_order,
  is_system  = excluded.is_system;
