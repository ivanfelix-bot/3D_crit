-- =============================================================================
-- 3D Crit – Dati iniziali: categorie + 4 prodotti DEMO
-- -----------------------------------------------------------------------------
-- I prodotti demo hanno is_demo = true e si eliminano dall'admin con il
-- bottone "Elimina prodotti demo". Le foto demo sono illustrazioni segnaposto.
-- Rieseguibile senza creare duplicati.
-- =============================================================================

insert into public.categories (slug, name_it, name_en, sort_order) values
  ('casa',          'Casa',              'Home',             10),
  ('scrivania',     'Scrivania',         'Desk',             20),
  ('cucina',        'Cucina',            'Kitchen',          30),
  ('gaming',        'Setup gaming',      'Gaming setup',     40),
  ('garage',        'Garage',            'Garage',           50),
  ('gadget-fidget', 'Gadget & Fidget',   'Gadgets & Fidgets', 60)
on conflict (slug) do nothing;

insert into public.products
  (slug, name_it, name_en, description_it, description_en, price_cents, material, dimensions,
   status, stock, featured, published, is_demo, category_id, sort_order)
values
  ('demo-organizer-scrivania',
   '[DEMO] Organizer da scrivania',
   '[DEMO] Desk organizer',
   'Prodotto dimostrativo. Organizer modulare per penne, cavi e piccoli oggetti. Sostituiscilo con i tuoi prodotti reali dall''admin.',
   'Demo product. Modular organizer for pens, cables and small items. Replace it with your real products from the admin panel.',
   1500, 'PLA', '18 × 10 × 8 cm', 'available', 5, true, true, true,
   (select id from public.categories where slug = 'scrivania'), 10),

  ('demo-supporto-cuffie',
   '[DEMO] Supporto per cuffie',
   '[DEMO] Headphone stand',
   'Prodotto dimostrativo. Supporto stabile per cuffie gaming, con base antiscivolo.',
   'Demo product. Sturdy stand for gaming headphones with a non-slip base.',
   2200, 'PETG', '12 × 12 × 26 cm', 'made_to_order', 0, true, true, true,
   (select id from public.categories where slug = 'gaming'), 20),

  ('demo-portaspezie',
   '[DEMO] Porta spezie impilabile',
   '[DEMO] Stackable spice rack',
   'Prodotto dimostrativo. Ripiano impilabile per barattoli di spezie.',
   'Demo product. Stackable shelf for spice jars.',
   1200, 'PLA', '25 × 9 × 6 cm', 'available', 3, true, true, true,
   (select id from public.categories where slug = 'cucina'), 30),

  ('demo-fidget-cubo',
   '[DEMO] Fidget cubo snodato',
   '[DEMO] Articulated fidget cube',
   'Prodotto dimostrativo. Gadget antistress stampato in un unico pezzo, già snodato.',
   'Demo product. Print-in-place stress-relief gadget, articulated straight off the printer.',
   1000, 'PLA', '5 × 5 × 5 cm', 'out_of_stock', 0, false, true, true,
   (select id from public.categories where slug = 'gadget-fidget'), 40)
on conflict (slug) do nothing;

-- Foto segnaposto (file locali in /public/demo)
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, v.url, p.name_it, v.ord
from public.products p
join (values
  ('demo-organizer-scrivania', '/demo/organizer.svg', 0),
  ('demo-organizer-scrivania', '/demo/organizer-2.svg', 1),
  ('demo-supporto-cuffie',     '/demo/cuffie.svg', 0),
  ('demo-portaspezie',         '/demo/spezie.svg', 0),
  ('demo-fidget-cubo',         '/demo/fidget.svg', 0)
) as v(slug, url, ord) on v.slug = p.slug
where p.is_demo
  and not exists (select 1 from public.product_images i where i.product_id = p.id and i.url = v.url);
