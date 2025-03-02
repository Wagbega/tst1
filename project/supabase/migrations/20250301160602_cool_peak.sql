/*
  # Check About Us Stats Data

  1. Purpose
    - Verify existing about_us_stats data
    - Ensure all required stats are present
  2. Note
    - This is a diagnostic migration to check data integrity
    - Will only insert missing data if needed
*/

-- Check if all expected stats exist, insert any missing ones
INSERT INTO about_us_stats (title, value, icon, "order")
SELECT 
  title, value, icon, "order"
FROM (
  VALUES
    ('Projects Completed', '500+', 'check-circle', 1),
    ('Solar Capacity Installed', '5MW+', 'zap', 2),
    ('Happy Clients', '1,000+', 'smile', 3),
    ('Years of Experience', '15+', 'calendar', 4)
) AS t(title, value, icon, "order")
WHERE NOT EXISTS (
  SELECT 1 FROM about_us_stats 
  WHERE title = t.title
);

-- Update the AboutUsStats component to improve debugging