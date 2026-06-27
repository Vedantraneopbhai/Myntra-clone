const fs = require('fs');

const categories = require('./backend/category.json');
const products = require('./backend/product.json');

let sql = `-- ==========================================
-- SUPABASE SEED DATA SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor AFTER running the schema script.

`;

sql += `\n-- CATEGORIES\n`;
categories.forEach(cat => {
    sql += `INSERT INTO public.categories (name, image) VALUES ('${cat.name.replace(/'/g, "''")}', '${cat.image}');\n`;
});

sql += `\n-- PRODUCTS\n`;
products.forEach(prod => {
    const sizes = `{${prod.sizes.map(s => `"${s}"`).join(',')}}`;
    const images = `{${prod.images.map(i => `"${i}"`).join(',')}}`;
    
    sql += `INSERT INTO public.products (name, brand, price, discount, description, sizes, category, images) VALUES (
        '${prod.name.replace(/'/g, "''")}',
        '${prod.brand.replace(/'/g, "''")}',
        ${prod.price},
        '${prod.discount.replace(/'/g, "''")}',
        '${prod.description.replace(/'/g, "''")}',
        '${sizes}',
        '${prod.category.replace(/'/g, "''")}',
        '${images}'
    );\n`;
});

fs.writeFileSync('seed_data.sql', sql);
console.log('Successfully generated seed_data.sql');
