-- V191 test-only shared stores. No changes to existing accounts or listings.
create table public.sooqak_v191_test_stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account_id uuid not null references public.sooqak_accounts(id) on delete cascade,
  slot smallint not null check (slot between 1 and 10),
  name text not null check (name like 'اختبار V191 — %' and char_length(btrim(name)) between 18 and 80),
  city text not null default '' check (char_length(city)<=70),
  about text not null default '' check (char_length(about)<=350),
  hours_text text not null default '' check (char_length(hours_text)<=140),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(owner_id,slot)
);
create index sooqak_v191_test_stores_account_idx on public.sooqak_v191_test_stores(account_id);
alter table public.sooqak_v191_test_stores enable row level security;
revoke all on public.sooqak_v191_test_stores from public, anon, authenticated;
grant select(id,name,city,about,hours_text,published) on public.sooqak_v191_test_stores to anon;
grant select on public.sooqak_v191_test_stores to authenticated;
grant insert(account_id,slot,name,city,about,hours_text,published) on public.sooqak_v191_test_stores to authenticated;
grant update(name,city,about,hours_text,published) on public.sooqak_v191_test_stores to authenticated;
create policy v191_store_public on public.sooqak_v191_test_stores for select to anon,authenticated using (published);
create policy v191_store_own_read on public.sooqak_v191_test_stores for select to authenticated using (owner_id=(select auth.uid()));
create policy v191_store_own_insert on public.sooqak_v191_test_stores for insert to authenticated with check (
  owner_id=(select auth.uid()) and exists(
    select 1 from public.sooqak_accounts a where a.id=account_id and a.owner_id=(select auth.uid()) and a.kind='business'
  )
);
create policy v191_store_own_update on public.sooqak_v191_test_stores for update to authenticated using (owner_id=(select auth.uid())) with check (
  owner_id=(select auth.uid()) and exists(
    select 1 from public.sooqak_accounts a where a.id=account_id and a.owner_id=(select auth.uid()) and a.kind='business'
  )
);
create table public.sooqak_v191_test_store_products (
  store_id uuid not null references public.sooqak_v191_test_stores(id) on delete cascade,
  listing_id uuid not null references public.sooqak_listings(id) on delete cascade,
  label text not null default '' check (char_length(label)<=60),
  position smallint not null default 0 check (position between 0 and 1000),
  primary key(store_id,listing_id)
);
create index sooqak_v191_test_products_listing_idx on public.sooqak_v191_test_store_products(listing_id);
alter table public.sooqak_v191_test_store_products enable row level security;
revoke all on public.sooqak_v191_test_store_products from public, anon, authenticated;
grant select on public.sooqak_v191_test_store_products to anon,authenticated;
grant insert(store_id,listing_id,label,position), update(label,position), delete on public.sooqak_v191_test_store_products to authenticated;
create policy v191_products_public on public.sooqak_v191_test_store_products for select to anon,authenticated using (
  exists(select 1 from public.sooqak_v191_test_stores s where s.id=store_id and s.published)
  and exists(select 1 from public.sooqak_listings l where l.id=listing_id and l.title like 'اختبار V191 — %' and l.seller_kind='business' and l.hidden_at is null and l.status in ('active','reserved') and l.expires_at>now())
);
create policy v191_products_own_read on public.sooqak_v191_test_store_products for select to authenticated using (
  exists(select 1 from public.sooqak_v191_test_stores s where s.id=store_id and s.owner_id=(select auth.uid()))
);
create policy v191_products_own_insert on public.sooqak_v191_test_store_products for insert to authenticated with check (
  exists(select 1 from public.sooqak_v191_test_stores s join public.sooqak_listings l on l.account_id=s.account_id
    where s.id=store_id and s.owner_id=(select auth.uid()) and l.id=listing_id and l.seller_user_id=(select auth.uid()) and l.seller_kind='business' and l.title like 'اختبار V191 — %')
);
create policy v191_products_own_update on public.sooqak_v191_test_store_products for update to authenticated using (
  exists(select 1 from public.sooqak_v191_test_stores s where s.id=store_id and s.owner_id=(select auth.uid()))
) with check (
  exists(select 1 from public.sooqak_v191_test_stores s join public.sooqak_listings l on l.account_id=s.account_id
    where s.id=store_id and s.owner_id=(select auth.uid()) and l.id=listing_id and l.seller_user_id=(select auth.uid()) and l.seller_kind='business' and l.title like 'اختبار V191 — %')
);
create policy v191_products_own_delete on public.sooqak_v191_test_store_products for delete to authenticated using (
  exists(select 1 from public.sooqak_v191_test_stores s where s.id=store_id and s.owner_id=(select auth.uid()))
);
