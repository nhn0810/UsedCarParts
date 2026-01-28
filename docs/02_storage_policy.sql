-- Storage Bucket 생성 ('product-images')
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- RLS 활성화 (혹시 안 되어 있을 경우)
-- alter table storage.objects enable row level security;

-- 1. 조회 정책: 누구나 이미지 보기 가능 (Public)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- 2. 업로드 정책: 로그인한 사용자는 누구나 업로드 가능
-- (더 엄격하게 하려면: and exists (select 1 from profiles where id = auth.uid() and is_admin = true) 추가)
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'product-images' 
  and auth.role() = 'authenticated'
);

-- 3. 수정/삭제 정책: 자신의 파일만 (또는 관리자만)
create policy "Users can update/delete own files"
on storage.objects for update
using (
  bucket_id = 'product-images' 
  and auth.uid() = owner
);

create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'product-images' 
  and auth.uid() = owner
);
