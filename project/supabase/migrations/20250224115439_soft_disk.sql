/*
  # Create gallery table

  1. New Tables
    - `gallery_items`
      - `id` (bigint, primary key)
      - `created_at` (timestamptz)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `category` (text)
      - `order` (integer)

  2. Security
    - Enable RLS on `gallery_items` table
    - Allow anyone to read gallery items
    - Only authenticated users can manage gallery items
*/

CREATE TABLE IF NOT EXISTS gallery_items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  "order" integer NOT NULL DEFAULT 0
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read gallery items
CREATE POLICY "Anyone can read gallery items"
  ON gallery_items
  FOR SELECT
  TO anon
  USING (true);

-- Only authenticated users can manage gallery items
CREATE POLICY "Only authenticated users can insert gallery items"
  ON gallery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update gallery items"
  ON gallery_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete gallery items"
  ON gallery_items
  FOR DELETE
  TO authenticated
  USING (true);