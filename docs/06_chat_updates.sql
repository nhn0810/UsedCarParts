-- 1. Add Exit Status Columns to chat_rooms
ALTER TABLE chat_rooms 
ADD COLUMN IF NOT EXISTS buyer_left boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS seller_left boolean DEFAULT false;

-- 2. Add Message Type and Media URL to messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text', -- 'text', 'image'
ADD COLUMN IF NOT EXISTS image_url text;

-- 3. Create Storage Bucket for Chat Images
-- Note: This is usually done via UI or specific storage setup, but we can try SQL if extension enabled.
-- Insert into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policies for Chat Images
-- Allow Authenticated upload
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-images' );

-- Allow Public read (or authenticated only, but public is easier for UI)
CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'chat-images' );

-- 5. Trigger to Delete Room if Both Left (Optional, or handle in app)
-- Let's create a function to clean up
CREATE OR REPLACE FUNCTION delete_empty_chat_rooms()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.buyer_left = true AND NEW.seller_left = true THEN
    DELETE FROM chat_rooms WHERE id = NEW.id;
    RETURN NULL; -- Row is deleted, no further processing
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_empty_rooms ON chat_rooms;

CREATE TRIGGER trigger_delete_empty_rooms
BEFORE UPDATE ON chat_rooms
FOR EACH ROW
EXECUTE FUNCTION delete_empty_chat_rooms();

-- 6. RPC Function for Leaving a Chat Room
-- This function handles the logic: determine if caller is buyer or seller, set flag, trigger handles deletion.
CREATE OR REPLACE FUNCTION leave_chat_room(room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_room chat_rooms%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  
  -- Get room
  SELECT * INTO v_room FROM chat_rooms WHERE id = room_id;
  
  IF v_room.id IS NULL THEN
    RAISE EXCEPTION 'Room not found or permission denied';
  END IF;
  
  -- Check role and update
  IF v_room.buyer_id = v_user_id THEN
    UPDATE chat_rooms SET buyer_left = true WHERE id = room_id;
  ELSIF v_room.seller_id = v_user_id THEN
    UPDATE chat_rooms SET seller_left = true WHERE id = room_id;
  ELSE
    RAISE EXCEPTION 'User is not a participant of this room';
  END IF;
END;
$$;
