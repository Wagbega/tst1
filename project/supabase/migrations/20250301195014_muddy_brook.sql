/*
  # Fix duplicate data issues

  1. Changes
     - Remove duplicate testimonials
     - Remove duplicate about_us_stats entries
     - Update gallery_items with unique images

  2. Security
     - No security changes
*/

-- Fix duplicate testimonials by keeping only one record per name
DELETE FROM testimonials a
USING testimonials b
WHERE a.id > b.id AND a.name = b.name;

-- Fix duplicate about_us_stats by keeping only one record per title
DELETE FROM about_us_stats a
USING about_us_stats b
WHERE a.id > b.id AND a.title = b.title;

-- Update gallery_items with unique images for each entry
UPDATE gallery_items
SET image_url = 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800'
WHERE title = 'Residential Solar Installation';

UPDATE gallery_items
SET image_url = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
WHERE title = 'Commercial Solar Project';

UPDATE gallery_items
SET image_url = 'https://images.unsplash.com/photo-1548075145-d0fc1a00d249?w=800'
WHERE title = 'Industrial Solar Farm';

UPDATE gallery_items
SET image_url = 'https://images.unsplash.com/photo-1592833167665-45a1a5c94119?w=800'
WHERE title = 'Smart Home Integration';