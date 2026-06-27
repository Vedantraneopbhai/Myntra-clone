-- ==========================================
-- SUPABASE RESET SCRIPT
-- ==========================================
-- Run this script to completely clear the Myntra clone database.
-- It will DROP all tables and the trigger created by our schema script.
-- After running this, you will have a clean slate to run `supabase_schema.sql` again.

-- 1. Drop the trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop all tables (using CASCADE to automatically drop dependent foreign keys)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Done! Your public schema is now clean.
