-- =============================================================================
-- 3D Crit – FILE UNICO DI INSTALLAZIONE (schema + dati iniziali)
-- Generato da supabase/schema.sql + supabase/seed.sql. Incollalo tutto nel
-- SQL Editor di Supabase e premi Run.
-- =============================================================================
-- =============================================================================
-- 3D Crit – Schema completo del database (Supabase / PostgreSQL)
-- -----------------------------------------------------------------------------
-- Da eseguire UNA volta nel SQL Editor di Supabase (è idempotente: si può
-- rieseguire senza perdere dati).
--
-- Sicurezza:
--   * Row Level Security attiva su TUTTE le tabelle.
--   * Il pubblico (anon) può solo LEGGERE prodotti pubblicati, categorie e
--     impostazioni pubbliche; può registrare visite/click SOLO tramite la
--     funzione track_event() (nessun insert diretto).
--   * Solo l'utente presente in public.admins può scrivere.
--   * Il primo utente creato in Authentication diventa admin; qualsiasi utente
--     successivo NON ha alcun permesso.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipi
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.product_status as enum ('available', 'out_of_stock', 'made_to_order');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_type as enum ('view', 'click');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'shipped', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Admin (un solo account)
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
-- Vincolo: al massimo UNA riga nella tabella admins.
create unique index if not exists admins_singleton on public.admins ((true));

-- Restituisce true se l'utente della richiesta è l'admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Il primo utente creato diventa automaticamente admin (solo se non ne esiste già uno).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Se l'utente esiste già prima di eseguire questo script, lo promuove ora.
insert into public.admins (user_id)
select id from auth.users
where not exists (select 1 from public.admins)
order by created_at
limit 1
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Aggiornamento automatico di updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Categorie
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_it    text not null check (char_length(name_it) between 1 and 80),
  name_en    text not null check (char_length(name_en) between 1 and 80),
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Prodotti
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_it        text not null check (char_length(name_it) between 1 and 120),
  name_en        text not null check (char_length(name_en) between 1 and 120),
  description_it text not null default '',
  description_en text not null default '',
  price_cents    int  not null check (price_cents >= 0 and price_cents <= 1000000),
  material       text not null default '',
  dimensions     text not null default '',
  status         public.product_status not null default 'available',
  stock          int  not null default 0 check (stock >= 0),
  featured       boolean not null default false,
  published      boolean not null default true,
  is_demo        boolean not null default false,
  category_id    uuid references public.categories (id) on delete set null,
  vinted_url     text check (vinted_url   is null or vinted_url   ~* '^https://'),
  ebay_url       text check (ebay_url     is null or ebay_url     ~* '^https://'),
  amazon_url     text check (amazon_url   is null or amazon_url   ~* '^https://'),
  wallapop_url   text check (wallapop_url is null or wallapop_url ~* '^https://'),
  sort_order     int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_featured_idx on public.products (featured) where featured;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Foto prodotto
-- -----------------------------------------------------------------------------
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  url          text not null,
  storage_path text,              -- percorso nel bucket (null per le immagini demo locali)
  alt          text not null default '',
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

-- -----------------------------------------------------------------------------
-- Impostazioni del sito (riga unica id = 1)
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id               int primary key default 1 check (id = 1),
  payments_enabled boolean not null default false,  -- interruttore Fase 2
  contact_email    text not null default '',
  tiktok_url       text not null default '',
  updated_at       timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Statistiche: visite pagine prodotto e click marketplace
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  type        public.event_type not null,
  product_id  uuid references public.products (id) on delete cascade,
  marketplace text check (marketplace in ('vinted', 'ebay', 'amazon', 'wallapop')),
  created_at  timestamptz not null default now()
);
create index if not exists events_created_idx on public.events (created_at);
create index if not exists events_product_idx on public.events (product_id);

-- Unico modo per il pubblico di scrivere un evento: validato e senza dati personali.
create or replace function public.track_event(p_type text, p_product_id uuid, p_marketplace text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_type not in ('view', 'click') then
    raise exception 'tipo evento non valido';
  end if;
  if p_type = 'click' and (p_marketplace is null or p_marketplace not in ('vinted', 'ebay', 'amazon', 'wallapop')) then
    raise exception 'marketplace non valido';
  end if;
  if not exists (select 1 from public.products where id = p_product_id and published) then
    return;
  end if;
  insert into public.events (type, product_id, marketplace)
  values (p_type::public.event_type, p_product_id, case when p_type = 'click' then p_marketplace end);
end;
$$;

-- Statistiche aggregate per la dashboard admin.
create or replace function public.admin_stats(p_days int default 30)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  result json;
begin
  if not public.is_admin() then
    raise exception 'accesso negato';
  end if;

  select json_build_object(
    'products_total',     (select count(*) from products),
    'products_published', (select count(*) from products where published),
    'products_demo',      (select count(*) from products where is_demo),
    'views',              (select count(*) from events where type = 'view'  and created_at >= since),
    'clicks',             (select count(*) from events where type = 'click' and created_at >= since),
    'clicks_by_marketplace', (
      select coalesce(json_object_agg(marketplace, n), '{}'::json)
      from (select marketplace, count(*) n from events
            where type = 'click' and created_at >= since group by marketplace) t
    ),
    'top_products', (
      select coalesce(json_agg(t), '[]'::json) from (
        select p.id, p.name_it,
               count(*) filter (where e.type = 'view')  as views,
               count(*) filter (where e.type = 'click') as clicks
        from events e join products p on p.id = e.product_id
        where e.created_at >= since
        group by p.id, p.name_it
        order by views desc, clicks desc
        limit 10
      ) t
    )
  ) into result;
  return result;
end;
$$;

-- -----------------------------------------------------------------------------
-- Ordini (Fase 2) – scritti solo dal server tramite service role (webhook).
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null check (provider in ('stripe', 'paypal')),
  provider_ref text not null,
  status       public.order_status not null default 'pending',
  email        text,
  customer_name text,
  shipping     jsonb,
  items        jsonb not null default '[]'::jsonb,
  total_cents  int not null default 0,
  currency     text not null default 'EUR',
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (provider, provider_ref)
);
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Scala la scorta in modo atomico (usata dal webhook di pagamento, solo service role).
create or replace function public.decrement_stock(p_product_id uuid, p_qty int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
     set stock = greatest(stock - p_qty, 0),
         status = case when status = 'available' and stock - p_qty <= 0 then 'out_of_stock'::public.product_status else status end
   where id = p_product_id;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.admins         enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.site_settings  enable row level security;
alter table public.events         enable row level security;
alter table public.orders         enable row level security;

-- Rimuove le policy esistenti per rendere lo script rieseguibile.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('admins','categories','products','product_images','site_settings','events','orders')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- admins: l'admin vede solo sé stesso; nessuno può scrivere dal client.
create policy "admin legge se stesso" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- categorie: lettura pubblica, scrittura solo admin.
create policy "categorie lettura pubblica" on public.categories
  for select to anon, authenticated using (true);
create policy "categorie scrittura admin" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- prodotti: il pubblico vede solo quelli pubblicati; l'admin vede e modifica tutto.
create policy "prodotti lettura pubblica" on public.products
  for select to anon, authenticated using (published or public.is_admin());
create policy "prodotti scrittura admin" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- foto: visibili se il prodotto è visibile.
create policy "foto lettura pubblica" on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and (p.published or public.is_admin()))
  );
create policy "foto scrittura admin" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- impostazioni: lettura pubblica, modifica solo admin (niente insert/delete).
create policy "impostazioni lettura pubblica" on public.site_settings
  for select to anon, authenticated using (true);
create policy "impostazioni modifica admin" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- eventi: nessun accesso diretto in lettura/scrittura per il pubblico;
-- l'admin può leggerli e cancellarli (azzerare le statistiche).
create policy "eventi lettura admin" on public.events
  for select to authenticated using (public.is_admin());
create policy "eventi cancellazione admin" on public.events
  for delete to authenticated using (public.is_admin());

-- ordini: solo l'admin legge e aggiorna (lo stato). Gli insert arrivano dal
-- server con la service role key, che bypassa RLS.
create policy "ordini lettura admin" on public.orders
  for select to authenticated using (public.is_admin());
create policy "ordini modifica admin" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Permessi sulle funzioni
revoke all on function public.track_event(text, uuid, text)   from public;
revoke all on function public.admin_stats(int)                from public;
revoke all on function public.decrement_stock(uuid, int)      from public;
revoke all on function public.handle_new_user()               from public;
grant execute on function public.track_event(text, uuid, text) to anon, authenticated;
grant execute on function public.admin_stats(int)              to authenticated;
grant execute on function public.is_admin()                    to anon, authenticated;
grant execute on function public.decrement_stock(uuid, int)    to service_role;

-- =============================================================================
-- STORAGE – bucket pubblico per le foto prodotto
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "foto prodotto upload admin"  on storage.objects;
drop policy if exists "foto prodotto modifica admin" on storage.objects;
drop policy if exists "foto prodotto delete admin"  on storage.objects;

-- La lettura è pubblica tramite URL pubblico del bucket; scrittura solo admin.
create policy "foto prodotto upload admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "foto prodotto modifica admin" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "foto prodotto delete admin" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

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
