import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'tenant' | 'landlord';
  bio?: string;
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  rent_price: number;
  location: string;
  coordinates?: any;
  available_from?: string;
  rooms: number;
  bathrooms: number;
  amenities: string[];
  image_urls: string[];
  embed_url?: string;
  is_available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfile;
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
};

export type Review = {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_profiles?: UserProfile;
};

export type Favorite = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listings?: Listing;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  max_price?: number;
  min_price: number;
  preferred_locations: string[];
  min_rooms: number;
  required_amenities: string[];
  created_at: string;
  updated_at: string;
};

// Auth helpers
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Listing helpers
export async function getListings(filters?: {
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}) {
  let query = supabase
    .from('listings')
    .select(`
      *,
      user_profiles (full_name, avatar_url),
      reviews (rating)
    `)
    .eq('is_available', true);

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.minPrice) {
    query = query.gte('rent_price', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('rent_price', filters.maxPrice);
  }

  if (filters?.rooms) {
    query = query.gte('rooms', filters.rooms);
  }

  // Sorting
  switch (filters?.sortBy) {
    case 'price_low':
      query = query.order('rent_price', { ascending: true });
      break;
    case 'price_high':
      query = query.order('rent_price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  query = query.range(start, end);

  const { data, error, count } = await query;

  if (error) throw error;

  // Calculate average ratings
  const listingsWithRatings = data?.map(listing => {
    const reviews = listing.reviews || [];
    const average_rating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0;
    
    return {
      ...listing,
      average_rating: Math.round(average_rating * 10) / 10,
      review_count: reviews.length
    };
  });

  return { data: listingsWithRatings, count };
}

export async function uploadImage(file: File, bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}