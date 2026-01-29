-- FINAL FIX: Create explicit public read policies for all tables
-- Run this in Supabase SQL Editor.

-- 1. Reset: Disable RLS first to clear any weird state
alter table profiles disable row level security;
alter table products disable row level security;
alter table categories disable row level security;
alter table brands disable row level security;
alter table chat_rooms disable row level security;
alter table messages disable row level security;

-- 2. Clean up existing policies to avoid conflicts
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Public products are viewable by everyone" on products;
drop policy if exists "Public categories are viewable by everyone" on categories;
drop policy if exists "Public brands are viewable by everyone" on brands;
drop policy if exists "Users can insert their own products" on products;
drop policy if exists "Users can update their own products" on products;
drop policy if exists "Users can update own profile" on profiles;

-- 3. Re-enable RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table chat_rooms enable row level security;
alter table messages enable row level security;

-- Drop new policies if they exist (to make script idempotent)
drop policy if exists "Public Read Profiles" on profiles;
drop policy if exists "Public Read Products" on products;
drop policy if exists "Public Read Categories" on categories;
drop policy if exists "Public Read Brands" on brands;
drop policy if exists "Auth Insert Products" on products;
drop policy if exists "Auth Update Products" on products;
drop policy if exists "Auth Insert Categories" on categories;
drop policy if exists "Auth Insert Brands" on brands;
drop policy if exists "Auth Update Profiles" on profiles;
drop policy if exists "Chat Room Participants Select" on chat_rooms;
drop policy if exists "Chat Room Insert" on chat_rooms;
drop policy if exists "Message Select" on messages;
drop policy if exists "Message Insert" on messages;

-- 4. Create "Permissive" Policies (Public Read)
create policy "Public Read Profiles" on profiles for select using (true);
create policy "Public Read Products" on products for select using (true);
create policy "Public Read Categories" on categories for select using (true);
create policy "Public Read Brands" on brands for select using (true);

-- 5. Create "Authenticated Write" Policies
create policy "Auth Insert Products" on products for insert with check (auth.uid() = user_id);
create policy "Auth Update Products" on products for update using (auth.uid() = user_id);
create policy "Auth Insert Categories" on categories for insert with check (auth.role() = 'authenticated');
create policy "Auth Insert Brands" on brands for insert with check (auth.role() = 'authenticated');
create policy "Auth Update Profiles" on profiles for update using (auth.uid() = id);

-- 6. Chat Policies
create policy "Chat Room Participants Select" on chat_rooms for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Chat Room Insert" on chat_rooms for insert with check (auth.uid() = buyer_id);
create policy "Message Select" on messages for select using (exists (
    select 1 from chat_rooms where id = messages.room_id and (buyer_id = auth.uid() or seller_id = auth.uid())
));
create policy "Message Insert" on messages for insert with check (auth.uid() = sender_id);

-- 7. Grant Usage
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
