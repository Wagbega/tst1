/*
  # Insert sample gallery items

  1. Changes
    - Insert 4 sample gallery items with different categories
    - Images are from placeholder URLs
    - Categories include: residential, commercial, industrial
*/

INSERT INTO gallery_items (title, description, image_url, category, "order")
VALUES
  (
    'Residential Solar Installation',
    'A 10kW solar system installation for a modern family home in the suburbs, featuring premium solar panels and smart monitoring system.',
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800',
    'residential',
    1
  ),
  (
    'Commercial Solar Project',
    'Large-scale 100kW commercial installation for a shopping center, maximizing roof space utilization with high-efficiency panels.',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    'commercial',
    2
  ),
  (
    'Industrial Solar Farm',
    'Massive 1MW ground-mounted solar installation for an industrial complex, featuring automated tracking systems.',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    'industrial',
    3
  ),
  (
    'Smart Home Integration',
    'Residential installation featuring seamless integration with home automation systems and battery storage.',
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800',
    'residential',
    4
  );