/*
  # Create about_us_stats table

  1. New Tables
    - `about_us_stats`
      - `id` (bigint, primary key)
      - `created_at` (timestamptz)
      - `title` (text)
      - `value` (text)
      - `icon` (text)
      - `order` (integer)
  2. Security
    - Enable RLS on `about_us_stats` table
    - Add policy for anyone to read stats
    - Add policy for authenticated users to manage stats
  3. Initial Data
    - Insert initial stats data
*/

CREATE TABLE IF NOT EXISTS about_us_stats (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  value text NOT NULL,
  icon text NOT NULL,
  "order" integer NOT NULL DEFAULT 0
);

ALTER TABLE about_us_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read about_us_stats
CREATE POLICY "Anyone can read about_us_stats"
  ON about_us_stats
  FOR SELECT
  TO anon
  USING (true);

-- Only authenticated users can manage about_us_stats
CREATE POLICY "Only authenticated users can insert about_us_stats"
  ON about_us_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update about_us_stats"
  ON about_us_stats
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete about_us_stats"
  ON about_us_stats
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial stats data
INSERT INTO about_us_stats (title, value, icon, "order")
VALUES
  ('Projects Completed', '500+', 'check-circle', 1),
  ('Solar Capacity Installed', '5MW+', 'zap', 2),
  ('Happy Clients', '1,000+', 'smile', 3),
  ('Years of Experience', '15+', 'calendar', 4);