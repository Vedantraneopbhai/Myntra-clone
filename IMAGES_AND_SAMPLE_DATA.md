# 🖼️ IMAGE REQUIREMENTS & SAMPLE DATA

**For Fully Functional Myntra Clone**

---

## 📸 **WHERE IMAGES ARE NEEDED**

### **1. PRODUCT IMAGES** (Database Field)
**MongoDB Collection:** `products`  
**Field Name:** `images` (Array of URLs)

```javascript
{
  "_id": ObjectId("..."),
  "name": "Blue Casual T-Shirt",
  "category": "Men",
  "brand": "Nike",
  "price": 999,
  "images": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502674900100-6534db3f61d1?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548584328-9de7c59d7dd6?w=500&auto=format&fit=crop"
  ]
}
```

### **2. CATEGORY IMAGES** (Database Field)
**MongoDB Collection:** `categories`  
**Field Name:** `image` (Single URL)

```javascript
{
  "_id": ObjectId("..."),
  "name": "Men",
  "image": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop"
}
```

### **3. BANNER IMAGES** (Hard-coded in Home Page)
**Location:** `/myntra/app/(tabs)/index.tsx`  
**Update the `deals` array:**

```javascript
const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop",
  },
];
```

---

## 🎯 **SAMPLE UNSPLASH IMAGES (Ready to Use)**

### **Men's Clothing**
```
T-Shirts:
- https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1502674900100-6534db3f61d1?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1548584328-9de7c59d7dd6?w=500&auto=format&fit=crop

Shirts:
- https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1596106594858-b8e19d9fbf76?w=500&auto=format&fit=crop

Jeans:
- https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1505618346881-b72b27e84530?w=500&auto=format&fit=crop
```

### **Women's Clothing**
```
Dresses:
- https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1595614174216-8ab12078511d?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1596807633874-4ca4b8e83688?w=500&auto=format&fit=crop

Tops:
- https://images.unsplash.com/photo-1551986782-d244ca7d14a6?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500&auto=format&fit=crop

Sarees:
- https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=500&auto=format&fit=crop
```

### **Footwear**
```
Casual Shoes:
- https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1463562879469-bda037e0ad41?w=500&auto=format&fit=crop

Sports Shoes:
- https://images.unsplash.com/photo-1542119016-69f34cf3d9ca?w=500&auto=format&fit=crop

Heels:
- https://images.unsplash.com/photo-1543163521-9145f4c6f4b4?w=500&auto=format&fit=crop
```

### **Accessories**
```
Bags:
- https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1491637639811-60e2b1bab925?w=500&auto=format&fit=crop

Watches:
- https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop
- https://images.unsplash.com/photo-1529260830369-96dd20feb4a0?w=500&auto=format&fit=crop

Belts:
- https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop
```

### **Category Banner Images**
```
Men:
- https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop

Women:
- https://images.unsplash.com/photo-1595883707802-a9fe3669912d?w=500&auto=format&fit=crop

Kids:
- https://images.unsplash.com/photo-1503454537688-e6c6ff1e7ac7?w=500&auto=format&fit=crop

Footwear:
- https://images.unsplash.com/photo-1533487335343-c44fe32c1199?w=500&auto=format&fit=crop

Beauty:
- https://images.unsplash.com/photo-1596462502278-af242a95dc4d?w=500&auto=format&fit=crop
```

---

## 📝 **HOW TO ADD SAMPLE DATA WITH IMAGES**

### **Method 1: Using MongoDB Compass (GUI)**

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `products` collection
4. Click "Add Data" → "Insert Document"
5. Paste this template:

```json
{
  "name": "Premium Blue T-Shirt",
  "category": "Men",
  "brand": "Nike",
  "price": 1299,
  "discount": "20% OFF",
  "description": "Comfortable and stylish blue t-shirt perfect for casual wear",
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "stock": {
    "XS": 5,
    "S": 8,
    "M": 10,
    "L": 7,
    "XL": 6,
    "XXL": 4
  },
  "images": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502674900100-6534db3f61d1?w=500&auto=format&fit=crop"
  ],
  "isDiscontinued": false
}
```

### **Method 2: Using MongoDB Shell**

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Switch to database
use myntra_db

# Insert product with images
db.products.insertOne({
  name: "Premium Blue T-Shirt",
  category: "Men",
  brand: "Nike",
  price: 1299,
  discount: "20% OFF",
  description: "Comfortable and stylish blue t-shirt",
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  stock: {
    "XS": 5,
    "S": 8,
    "M": 10,
    "L": 7,
    "XL": 6,
    "XXL": 4
  },
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502674900100-6534db3f61d1?w=500&auto=format&fit=crop"
  ],
  isDiscontinued: false
})
```

### **Method 3: Update seed.js Script**

Edit `/backend/seed.js` and update the products array:

```javascript
const products = [
  {
    name: "Blue Casual T-Shirt",
    category: "Men",
    brand: "Nike",
    price: 999,
    discount: "15% OFF",
    description: "High quality casual t-shirt",
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 10, M: 15, L: 12, XL: 8 },
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502674900100-6534db3f61d1?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Black Formal Shirt",
    category: "Men",
    brand: "Allen Solly",
    price: 1499,
    discount: "10% OFF",
    description: "Premium formal shirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 5, M: 8, L: 10, XL: 7, XXL: 4 },
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596106594858-b8e19d9fbf76?w=500&auto=format&fit=crop"
    ]
  },
  // Add more products...
];
```

Then run: `node seed.js`

---

## 🔗 **BEST FREE IMAGE SOURCES**

### **1. Unsplash** (Best)
- Free, high-quality images
- No login required
- Direct URL linking works
- https://unsplash.com/

### **2. Pexels**
- Free stock photos
- Good variety
- https://www.pexels.com/

### **3. Pixabay**
- Royalty-free images
- Large collection
- https://pixabay.com/

### **4. Shopify Burst**
- Free stock photos for e-commerce
- Great for shopping sites
- https://burst.shopify.com/

### **5. Generate AI Images**
- Stable Diffusion (Hugging Face)
- DALL-E (OpenAI)
- Midjourney

---

## ⚡ **QUICK START: ADD 10 PRODUCTS WITH IMAGES**

Run this MongoDB command to add 10 sample products:

```javascript
db.products.insertMany([
  {
    name: "Blue T-Shirt",
    category: "Men",
    brand: "Nike",
    price: 999,
    discount: "20% OFF",
    sizes: ["S", "M", "L"],
    stock: { S: 10, M: 15, L: 12 },
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Red Dress",
    category: "Women",
    brand: "Zara",
    price: 1999,
    discount: "30% OFF",
    sizes: ["XS", "S", "M", "L"],
    stock: { XS: 5, S: 8, M: 10, L: 7 },
    images: [
      "https://images.unsplash.com/photo-1595614174216-8ab12078511d?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Black Jeans",
    category: "Men",
    brand: "Levi's",
    price: 2499,
    discount: "15% OFF",
    sizes: ["28", "30", "32", "34"],
    stock: { "28": 8, "30": 12, "32": 10, "34": 6 },
    images: [
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "White Sneakers",
    category: "Footwear",
    brand: "Adidas",
    price: 3999,
    discount: "25% OFF",
    sizes: ["6", "7", "8", "9", "10"],
    stock: { "6": 5, "7": 8, "8": 12, "9": 10, "10": 6 },
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Brown Leather Bag",
    category: "Accessories",
    brand: "Fossil",
    price: 4999,
    discount: "10% OFF",
    sizes: ["OneSize"],
    stock: { OneSize: 20 },
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Yellow Kids T-Shirt",
    category: "Kids",
    brand: "H&M",
    price: 599,
    discount: "40% OFF",
    sizes: ["2-3Y", "3-4Y", "4-5Y"],
    stock: { "2-3Y": 15, "3-4Y": 12, "4-5Y": 10 },
    images: [
      "https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Silver Watch",
    category: "Accessories",
    brand: "Timex",
    price: 5999,
    discount: "20% OFF",
    sizes: ["OneSize"],
    stock: { OneSize: 15 },
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Pink Sports Bra",
    category: "Women",
    brand: "Puma",
    price: 1499,
    discount: "35% OFF",
    sizes: ["XS", "S", "M", "L"],
    stock: { XS: 8, S: 12, M: 10, L: 7 },
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Black Formal Shoes",
    category: "Footwear",
    brand: "Bata",
    price: 2999,
    discount: "18% OFF",
    sizes: ["6", "7", "8", "9", "10"],
    stock: { "6": 6, "7": 9, "8": 11, "9": 8, "10": 5 },
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop"
    ]
  },
  {
    name: "Saree - Silk",
    category: "Women",
    brand: "Kanchipuram",
    price: 8999,
    discount: "12% OFF",
    sizes: ["OneSize"],
    stock: { OneSize: 10 },
    images: [
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=500&auto=format&fit=crop"
    ]
  }
])
```

---

## 🎯 **VERIFICATION CHECKLIST**

After adding images, verify:

- [ ] Home page shows product images in grid
- [ ] Product detail page shows carousel
- [ ] Carousel auto-scrolls every 3 seconds
- [ ] Categories page shows category images
- [ ] Search results show product images
- [ ] Bag page shows product images
- [ ] Wishlist page shows product images
- [ ] All images load correctly (no broken links)

---

## 🚀 **DEPLOYMENT WITH IMAGES**

Once images are added:

```bash
# Test locally
npm run dev

# Verify everything works

# Deploy
git push origin main  # Vercel auto-deploys frontend
# Manual backend deploy if needed
```

---

*All image URLs are directly from Unsplash and work immediately without any setup!*
