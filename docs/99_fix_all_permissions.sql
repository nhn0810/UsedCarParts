-- 모든 권한 문제 해결을 위한 통합 SQL (99_fix_all_permissions.sql)

-- 1. Storage 권한 설정 (이미지 업로드)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;

-- 기존 정책 초기화 (충돌 방지를 위해 DROP 먼저 실행)
drop policy if exists "Authenticated users can upload" on storage.objects;
create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'product-images' );

-- 2. Brands, Categories 조회(Select) 권한 (누구나 조회 가능)
alter table brands enable row level security;
drop policy if exists "Public brands are viewable by everyone" on brands;
create policy "Public brands are viewable by everyone" on brands for select using (true);

alter table categories enable row level security;
drop policy if exists "Public categories are viewable by everyone" on categories;
create policy "Public categories are viewable by everyone" on categories for select using (true);

-- 3. Brands, Categories 생성(Insert) 권한 (로그인한 유저는 누구나 생성 가능)
-- (관리자만 하게 하려면 auth.uid() 체크 로직 추가 필요하지만, 지금은 테스트 편의상 authenticated 허용)
drop policy if exists "Authenticated users can insert brands" on brands;
create policy "Authenticated users can insert brands" on brands for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert categories" on categories;
create policy "Authenticated users can insert categories" on categories for insert with check (auth.role() = 'authenticated');

-- 4. Products 생성(Insert) 권한
alter table products enable row level security;
-- 기존 정책 삭제 후 재생성
drop policy if exists "Authenticated users can insert products" on products;
create policy "Authenticated users can insert products" on products for insert with check (auth.role() = 'authenticated');

drop policy if exists "Public products are viewable by everyone" on products;
create policy "Public products are viewable by everyone" on products for select using (true);

-- 5. Profiles 업데이트 권한 (관리자 인증 등)
alter table profiles enable row level security;
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

-- 완료 메시지
select 'All permissions fixed successfully' as result;
