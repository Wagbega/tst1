/*
  # Add testimonials table

  1. New Tables
    - `testimonials`
      - `id` (bigint, primary key)
      - `created_at` (timestamptz)
      - `name` (text)
      - `role` (text)
      - `content` (text)
      - `image_url` (text)

  2. Security
    - Enable RLS on `testimonials` table
    - Add policies for public read access
    - Add policies for authenticated write access
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read testimonials
CREATE POLICY "Anyone can read testimonials"
  ON testimonials
  FOR SELECT
  TO anon
  USING (true);

-- Only authenticated users can manage testimonials
CREATE POLICY "Only authenticated users can insert testimonials"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update testimonials"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete testimonials"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);