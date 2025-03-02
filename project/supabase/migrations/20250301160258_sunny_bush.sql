/*
  # Insert testimonial data

  1. Data
    - Insert initial testimonial data into the existing testimonials table
  2. Note
    - The testimonials table already exists from a previous migration
    - This migration only adds sample data
*/

-- Insert initial testimonials data if the table is empty
INSERT INTO testimonials (name, role, content, image_url)
SELECT 
  name, role, content, image_url
FROM (
  VALUES
    (
      'Sarah Johnson',
      'Homeowner',
      'The solar installation team was professional and efficient. Our energy bills have been cut in half, and the system has been working flawlessly for over a year now!',
      'https://randomuser.me/api/portraits/women/12.jpg'
    ),
    (
      'Michael Chen',
      'Business Owner',
      'Investing in solar for our office building was one of the best business decisions we've made. The ROI has been impressive, and we're proud to be reducing our carbon footprint.',
      'https://randomuser.me/api/portraits/men/22.jpg'
    ),
    (
      'Emily Rodriguez',
      'School Principal',
      'Our school's solar project has not only reduced our operating costs but has also become an educational tool for our students to learn about renewable energy.',
      'https://randomuser.me/api/portraits/women/33.jpg'
    ),
    (
      'David Wilson',
      'Farm Owner',
      'The off-grid solar system installed on our farm has been a game-changer. We now have reliable power for all our operations, even during grid outages.',
      'https://randomuser.me/api/portraits/men/44.jpg'
    )
) AS t(name, role, content, image_url)
WHERE NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1);