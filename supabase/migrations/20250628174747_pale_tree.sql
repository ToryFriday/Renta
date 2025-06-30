/*
  # Create Renta Marketplace Database Schema

  1. New Tables
    - `user_profiles` - Extended user information (avatar, role, preferences)
    - `listings` - Rental property listings with images and details
    - `reviews` - User reviews and ratings for listings
    - `favorites` - User saved/bookmarked listings
    - `user_preferences` - Tenant search preferences and filters

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Restrict sensitive operations based on user roles

  3. Storage
    - Create buckets for user avatars and listing images
    - Set up proper storage policies
*/

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord')),
  bio text,
  phone text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  rent_price numeric NOT NULL,
  location text NOT NULL,
  coordinates geography,
  available_from date,
  rooms int DEFAULT 1,
  bathrooms int DEFAULT 1,
  amenities text[] DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  embed_url text,
  is_available boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_price numeric,
  min_price numeric DEFAULT 0,
  preferred_locations text[] DEFAULT '{}',
  min_rooms int DEFAULT 1,
  required_amenities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Listings Policies
CREATE POLICY "Anyone can view available listings"
  ON listings FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Users can view all listings"
  ON listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() != (SELECT user_id FROM listings WHERE id = listing_id)
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);
CREATE INDEX IF NOT EXISTS listings_location_idx ON listings(location);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(rent_price);
CREATE INDEX IF NOT EXISTS listings_available_idx ON listings(is_available);
CREATE INDEX IF NOT EXISTS reviews_listing_id_idx ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON favorites(listing_id);

-- Create storage buckets
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('listing-images', 'listing-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for listing images
CREATE POLICY "Listing images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Users can update listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listing-images');

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;