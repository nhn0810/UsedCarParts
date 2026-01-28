-- Create Chat Rooms Table
create table if not exists chat_rooms (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references products(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  seller_id uuid references auth.users(id) on delete cascade not null,
  
  -- Ensure unique chat room per product per buyer
  unique(product_id, buyer_id)
);

-- Create Messages Table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  room_id uuid references chat_rooms(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  is_read boolean default false
);

-- Add indexes for performance
create index if not exists messages_room_id_idx on messages(room_id);
create index if not exists chat_rooms_buyer_id_idx on chat_rooms(buyer_id);
create index if not exists chat_rooms_seller_id_idx on chat_rooms(seller_id);

-- Enable RLS
alter table chat_rooms enable row level security;
alter table messages enable row level security;

-- Policies for Chat Rooms
-- Users can see rooms where they are the buyer or the seller
create policy "Users can view their own chat rooms"
  on chat_rooms for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Only authenticated users can create rooms (logic usually handled by server, but good to have)
create policy "Authenticated users can create chat rooms"
  on chat_rooms for insert
  with check (auth.role() = 'authenticated');

-- Policies for Messages
-- Users can see messages in rooms they belong to
create policy "Users can view messages in their rooms"
  on messages for select
  using (
    exists (
      select 1 from chat_rooms
      where chat_rooms.id = messages.room_id
      and (chat_rooms.buyer_id = auth.uid() or chat_rooms.seller_id = auth.uid())
    )
  );

-- Users can insert messages if they belong to the room
create policy "Users can send messages in their rooms"
  on messages for insert
  with check (
    exists (
      select 1 from chat_rooms
      where chat_rooms.id = messages.room_id
      and (chat_rooms.buyer_id = auth.uid() or chat_rooms.seller_id = auth.uid())
    )
  );

-- Function to handle new chat creation safely
create or replace function create_new_chat(
  p_product_id uuid,
  p_seller_id uuid,
  p_initial_message text
) returns uuid
language plpgsql
security definer
as $$
declare
  v_room_id uuid;
  v_current_user_id uuid;
begin
  v_current_user_id := auth.uid();
  
  -- Check if room already exists
  select id into v_room_id
  from chat_rooms
  where product_id = p_product_id
  and buyer_id = v_current_user_id;
  
  -- If exists, return it
  if v_room_id is not null then
    return v_room_id;
  end if;
  
  -- Create new room
  insert into chat_rooms (product_id, buyer_id, seller_id)
  values (p_product_id, v_current_user_id, p_seller_id)
  returning id into v_room_id;
  
  -- Insert initial message
  insert into messages (room_id, sender_id, content)
  values (v_room_id, v_current_user_id, p_initial_message);
  
  return v_room_id;
end;
$$;
