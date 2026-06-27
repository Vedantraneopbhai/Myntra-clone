-- ==========================================
-- SUPABASE SEED DATA SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor AFTER running the schema script.


-- CATEGORIES
INSERT INTO public.categories (name, image) VALUES ('Men', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop');
INSERT INTO public.categories (name, image) VALUES ('Women', 'https://images.unsplash.com/photo-1618244972963-dbad0c4abf18?w=500&auto=format&fit=crop');
INSERT INTO public.categories (name, image) VALUES ('Kids', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop');
INSERT INTO public.categories (name, image) VALUES ('Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop');

-- PRODUCTS
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Casual White T-Shirt',
        'Roadster',
        499,
        '60% OFF',
        'Classic white t-shirt made from premium cotton. Perfect for everyday wear with a comfortable regular fit.',
        '{"S","M","L","XL"}',
        'Men',
        '{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Denim Jacket',
        'Levis',
        2499,
        '40% OFF',
        'Classic denim jacket with a modern twist. Features premium quality denim and comfortable fit.',
        '{"S","M","L","XL"}',
        'Men',
        '{"https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Summer Dress',
        'ONLY',
        1299,
        '50% OFF',
        'Flowy summer dress perfect for warm weather. Made from lightweight fabric with a flattering cut.',
        '{"XS","S","M","L"}',
        'Women',
        '{"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Classic Sneakers',
        'Nike',
        3499,
        '30% OFF',
        'Versatile sneakers that combine style and comfort. Perfect for both casual wear and light exercise.',
        '{"UK6","UK7","UK8","UK9","UK10"}',
        'Men',
        '{"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Oxford Button-Up Shirt',
        'Allen Solly',
        1299,
        '45% OFF',
        'Crisp oxford shirt with a classic collar. Perfect for formal and semi-formal occasions.',
        '{"S","M","L","XL","XXL"}',
        'Men',
        '{"https://images.unsplash.com/photo-1596217957745-b1e842dad7e3?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1598880877289-d7e8fe72e83e?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1508243539899-2c8da0ebbf12?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Slim Fit Jeans',
        'Wrangler',
        1799,
        '35% OFF',
        'Premium slim fit jeans with comfortable stretch fabric. Great for casual and smart casual looks.',
        '{"28","30","32","34","36"}',
        'Men',
        '{"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1603256906505-6a6d6c8d1cba?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Running Shorts',
        'Nike',
        1299,
        '50% OFF',
        'Lightweight running shorts with moisture-wicking technology. Ideal for workouts and sports.',
        '{"S","M","L","XL"}',
        'Men',
        '{"https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1618354691551-b1326def007d?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1591088323297-8cf9f9b91b72?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Elegant Saree',
        'Aura',
        2499,
        '40% OFF',
        'Beautiful silk saree with intricate embroidery. Perfect for weddings and festivals.',
        '{"Free"}',
        'Women',
        '{"https://images.unsplash.com/photo-1610253840897-82c4bbfb1aea?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1629814656019-a8a58e4905ba?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1591228127359-3909bbc60f36?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Casual Crop Top',
        'Forever 21',
        649,
        '55% OFF',
        'Trendy crop top in solid color. Perfect for casual outings and parties.',
        '{"XS","S","M","L"}',
        'Women',
        '{"https://images.unsplash.com/photo-1585399361357-d4fbb0bef60f?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1490481869428-dfc41acbee6f?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1554620519-b5949e9cc8b9?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Yoga Pants',
        'Adidas',
        2199,
        '45% OFF',
        'High-waist yoga pants with excellent stretch and comfort. Perfect for workouts and casual wear.',
        '{"XS","S","M","L","XL"}',
        'Women',
        '{"https://images.unsplash.com/photo-1506629082632-33cccc2b2eae?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1561043666-d8a40a979055?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Printed Kurti',
        'W',
        899,
        '50% OFF',
        'Comfortable printed kurti with traditional designs. Great for everyday casual wear.',
        '{"S","M","L","XL","XXL"}',
        'Women',
        '{"https://images.unsplash.com/photo-1585299810414-fee339b60d92?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1571746282562-40fed08220d0?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1589308078519-add4f82ea07d?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Kids T-Shirt',
        'Mothercare',
        349,
        '60% OFF',
        'Soft and comfortable t-shirt for kids. Made from 100% cotton with fun prints.',
        '{"2-3Y","3-4Y","4-5Y","5-6Y"}',
        'Kids',
        '{"https://images.unsplash.com/photo-1545862332-197b745caea3?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1532453290872-0db78fe8c39f?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1618354691551-b1326def007d?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Girls Frock',
        'Mothercare',
        749,
        '50% OFF',
        'Adorable frock with unique designs. Perfect for school and casual occasions.',
        '{"3-4Y","4-5Y","5-6Y","6-7Y"}',
        'Kids',
        '{"https://images.unsplash.com/photo-1588215457850-cb6bcc3b8f5c?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1519074069444-1ba904df3d60?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'BB Cream',
        'Maybelline',
        599,
        '40% OFF',
        'All-in-one BB cream with SPF 18. Provides coverage and hydration for natural-looking skin.',
        '{"Light","Medium","Dark"}',
        'Beauty',
        '{"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1559056199-641a0ac8b8d5?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Lipstick Matte',
        'MAC',
        799,
        '35% OFF',
        'Highly pigmented matte lipstick with long-lasting formula. Available in multiple shades.',
        '{"Ruby","Pink","Red","Nude"}',
        'Beauty',
        '{"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1597455856512-b95e5b325b70?w=500&auto=format&fit=crop"}'
    );
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        'Facial Serum',
        'The Ordinary',
        499,
        '50% OFF',
        'Lightweight facial serum with Vitamin C. Brightens and hydrates the skin.',
        '{"30ml"}',
        'Beauty',
        '{"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&auto=format&fit=crop","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop"}'
    );
