/*
  # Add phone number to contact messages

  1. Changes
    - Add phone_number column to contact_messages table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_messages' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN phone_number text;
  END IF;
END $$;