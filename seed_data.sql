-- ==========================================
-- SUPABASE SEED DATA SCRIPT (Updated with accurate product images)
-- ==========================================
-- Run this in your Supabase SQL Editor AFTER running the schema script.
-- Images: carefully matched Unsplash photos per product type/color/category.


-- CATEGORIES
INSERT INTO public.categories (name, image) VALUES ('Men',    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80');
INSERT INTO public.categories (name, image) VALUES ('Women',  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80');
INSERT INTO public.categories (name, image) VALUES ('Kids',   'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80');
INSERT INTO public.categories (name, image) VALUES ('Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80');


-- PRODUCTS

-- Men's White T-Shirt: clean white crew-neck tee on model
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Casual White T-Shirt', 'Roadster', 499, '60% OFF',
    'Classic white t-shirt made from premium cotton. Perfect for everyday wear with a comfortable regular fit.',
    '{"S","M","L","XL"}', 'Men',
    '{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80"}'
);

-- Denim Jacket: classic blue denim jacket
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Denim Jacket', 'Levis', 2499, '40% OFF',
    'Classic denim jacket with a modern twist. Features premium quality denim and comfortable fit.',
    '{"S","M","L","XL"}', 'Men',
    '{"https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80"}'
);

-- Summer Dress: flowy light-coloured summer dress on model
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Summer Dress', 'ONLY', 1299, '50% OFF',
    'Flowy summer dress perfect for warm weather. Made from lightweight fabric with a flattering cut.',
    '{"XS","S","M","L"}', 'Women',
    '{"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80"}'
);

-- Classic Sneakers: white Nike-style running sneakers
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Classic Sneakers', 'Nike', 3499, '30% OFF',
    'Versatile sneakers that combine style and comfort. Perfect for both casual wear and light exercise.',
    '{"UK6","UK7","UK8","UK9","UK10"}', 'Men',
    '{"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&auto=format&fit=crop&q=80"}'
);

-- Oxford Button-Up Shirt: crisp formal shirt on hanger/model
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Oxford Button-Up Shirt', 'Allen Solly', 1299, '45% OFF',
    'Crisp oxford shirt with a classic collar. Perfect for formal and semi-formal occasions.',
    '{"S","M","L","XL","XXL"}', 'Men',
    '{"https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80"}'
);

-- Slim Fit Jeans: dark slim-fit denim jeans
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Slim Fit Jeans', 'Wrangler', 1799, '35% OFF',
    'Premium slim fit jeans with comfortable stretch fabric. Great for casual and smart casual looks.',
    '{"28","30","32","34","36"}', 'Men',
    '{"https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80"}'
);

-- Running Shorts: athletic shorts for sport
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Running Shorts', 'Nike', 1299, '50% OFF',
    'Lightweight running shorts with moisture-wicking technology. Ideal for workouts and sports.',
    '{"S","M","L","XL"}', 'Men',
    '{"https://images.unsplash.com/photo-1539531811137-9e1e5b6e4afd?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1504025468847-0e438279542c?w=600&auto=format&fit=crop&q=80"}'
);

-- Elegant Saree: silk saree with embroidery
-- NOTE: Photo 1561049933 is closest Unsplash match for Indian saree drape
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Elegant Saree', 'Aura', 2499, '40% OFF',
    'Beautiful silk saree with intricate embroidery. Perfect for weddings and festivals.',
    '{"Free"}', 'Women',
    '{"https://images.unsplash.com/photo-1561049933-c8fbef47b329?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop&q=80"}'
);

-- Casual Crop Top: solid-color short top for women
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Casual Crop Top', 'Forever 21', 649, '55% OFF',
    'Trendy crop top in solid color. Perfect for casual outings and parties.',
    '{"XS","S","M","L"}', 'Women',
    '{"https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1558171813-d55b44673774?w=600&auto=format&fit=crop&q=80"}'
);

-- Yoga Pants: high-waist athletic leggings
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Yoga Pants', 'Adidas', 2199, '45% OFF',
    'High-waist yoga pants with excellent stretch and comfort. Perfect for workouts and casual wear.',
    '{"XS","S","M","L","XL"}', 'Women',
    '{"https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"}'
);

-- Printed Kurti: Indian kurta/kurti ethnic top
-- NOTE: Unsplash has limited kurti photos; using closest ethnic-wear match
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Printed Kurti', 'W', 899, '50% OFF',
    'Comfortable printed kurti with traditional designs. Great for everyday casual wear.',
    '{"S","M","L","XL","XXL"}', 'Women',
    '{"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1610189351021-ef1b958e90db?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1561049933-c8fbef47b329?w=600&auto=format&fit=crop&q=80"}'
);

-- Kids T-Shirt: bright colourful children's tee
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Kids T-Shirt', 'Mothercare', 349, '60% OFF',
    'Soft and comfortable t-shirt for kids. Made from 100% cotton with fun prints.',
    '{"2-3Y","3-4Y","4-5Y","5-6Y"}', 'Kids',
    '{"https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1545862332-197b745caea3?w=600&auto=format&fit=crop&q=80"}'
);

-- Girls Frock: cute girls' dress
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Girls Frock', 'Mothercare', 749, '50% OFF',
    'Adorable frock with unique designs. Perfect for school and casual occasions.',
    '{"3-4Y","4-5Y","5-6Y","6-7Y"}', 'Kids',
    '{"https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80"}'
);

-- BB Cream: Maybelline-style BB cream/foundation tube
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'BB Cream', 'Maybelline', 599, '40% OFF',
    'All-in-one BB cream with SPF 18. Provides coverage and hydration for natural-looking skin.',
    '{"Light","Medium","Dark"}', 'Beauty',
    '{"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80"}'
);

-- Lipstick Matte: red/pink matte lipstick
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Lipstick Matte', 'MAC', 799, '35% OFF',
    'Highly pigmented matte lipstick with long-lasting formula. Available in multiple shades.',
    '{"Ruby","Pink","Red","Nude"}', 'Beauty',
    '{"https://images.unsplash.com/photo-1586495777744-4e6232bf2f7d?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80"}'
);

-- Facial Serum: dropper serum bottle (Vitamin C / The Ordinary style)
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Facial Serum', 'The Ordinary', 499, '50% OFF',
    'Lightweight facial serum with Vitamin C. Brightens and hydrates the skin.',
    '{"30ml"}', 'Beauty',
    '{"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&auto=format&fit=crop&q=80"}'
);
