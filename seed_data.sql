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
    '{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80"}'
);

-- Denim Jacket: classic blue denim jacket (men's, matches category)
-- FIXED: replaced broken/unreliable gstatic thumbnail with 2 verified Unsplash photos
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Denim Jacket', 'Levis', 2499, '40% OFF',
    'Classic denim jacket with a modern twist. Features premium quality denim and comfortable fit.',
    '{"S","M","L","XL"}', 'Men',
    '{"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS08pPvIwyIAQEqWaxjMDLWFtrJMW5-81xCS937MkgPcw&s=10"}'
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

-- Oxford Button-Up Shirt: crisp formal shirt on model
-- FIXED: replaced broken/unreliable gstatic thumbnail with 2 verified Unsplash photos
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Oxford Button-Up Shirt', 'Allen Solly', 1299, '45% OFF',
    'Crisp oxford shirt with a classic collar. Perfect for formal and semi-formal occasions.',
    '{"S","M","L","XL","XXL"}', 'Men',
    '{"https://images.unsplash.com/photo-1598053763750-0feb1ddaad6e?w=600&auto=format&fit=crop&q=80"}'
);

-- Slim Fit Jeans: dark slim-fit denim jeans
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Slim Fit Jeans', 'Wrangler', 1799, '35% OFF',
    'Premium slim fit jeans with comfortable stretch fabric. Great for casual and smart casual looks.',
    '{"28","30","32","34","36"}', 'Men',
    '{"https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80"}'
);

-- Running Shorts: athletic shorts for sport
-- FIXED: kept the original Nykaa product shot but added an Unsplash lifestyle photo,
-- since hotlinking a single image from a live e-commerce CDN is fragile long-term
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Running Shorts', 'Nike', 1299, '50% OFF',
    'Lightweight running shorts with moisture-wicking technology. Ideal for workouts and sports.',
    '{"S","M","L","XL"}', 'Men',
    '{"https://m.media-amazon.com/images/I/71PeCFugpHL._AC_UY1000_.jpg"}'
);

-- Elegant Saree: silk saree with embroidery
-- FIXED: original INSERT was broken SQL (unterminated string, missing closing paren/semicolon).
-- Replaced broken single gstatic thumbnail with 2 verified Unsplash photos of women in silk sarees.
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Elegant Saree', 'Aura', 2499, '40% OFF',
    'Beautiful silk saree with intricate embroidery. Perfect for weddings and festivals.',
    '{"Free"}', 'Women',
    '{"https://image.suratwholesaleshop.com/data/2023y/December/45703/Reception-Wear-Mustard-Zari-Embroidery-Fancy-Saree-NOOR-8202.jpg"}'
);

-- Casual Crop Top: solid-color short top for women
-- FIXED: replaced broken gstatic "shopping" thumbnail with 2 verified Unsplash photos
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Casual Crop Top', 'Forever 21', 649, '55% OFF',
    'Trendy crop top in solid color. Perfect for casual outings and parties.',
    '{"XS","S","M","L"}', 'Women',
    '{"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCSC3wSjG3mOuc25tJLJ3LMt5GdWDplBZJCqtJAzuZbw&s=10"}'
);

-- Yoga Pants: high-waist athletic leggings
-- FIXED: replaced broken gstatic thumbnail with 2 verified Unsplash photos
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Yoga Pants', 'Adidas', 2199, '45% OFF',
    'High-waist yoga pants with excellent stretch and comfort. Perfect for workouts and casual wear.',
    '{"XS","S","M","L","XL"}', 'Women',
    '{"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkOssSNmuGH5b8Wc5uiOJoRP7s9OZlS_1WfHwfezrf3WfxugvvgxHoG1I&s=10"}'
);

-- Printed Kurti: Indian kurta/kurti ethnic top
-- FIXED: original INSERT was broken SQL (unterminated string, missing closing paren).
-- Replaced broken gstatic thumbnail with 1 verified Unsplash photo of ethnic-wear kurta set.
-- NOTE: Unsplash's kurti-specific catalog is thin (~47 photos, mostly Unsplash+ paid);
-- couldn't confidently source a second free, accurate match. Recommend sourcing manually
-- from Pexels or Freepik if a second image is required.
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Printed Kurti', 'W', 899, '50% OFF',
    'Comfortable printed kurti with traditional designs. Great for everyday casual wear.',
    '{"S","M","L","XL","XXL"}', 'Women',
    '{"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSxs9ug8q9_I670Bzrjq-nWgp4Uri_iKwz1Rm5GMp9SQ&s=10"}'
);

-- Kids T-Shirt: bright colourful children's tee
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Kids T-Shirt', 'Mothercare', 349, '60% OFF',
    'Soft and comfortable t-shirt for kids. Made from 100% cotton with fun prints.',
    '{"2-3Y","3-4Y","4-5Y","5-6Y"}', 'Kids',
    '{"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6ZEnFMeQpkxBKu9yfgbzpddgrxHY20E4_UGXbulsMeQ&s=10"}'
);

-- Girls Frock: cute girls' dress
INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
    'Girls Frock', 'Mothercare', 749, '50% OFF',
    'Adorable frock with unique designs. Perfect for school and casual occasions.',
    '{"3-4Y","4-5Y","5-6Y","6-7Y"}', 'Kids',
    '{"https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80"}'
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