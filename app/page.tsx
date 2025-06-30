'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getListings, Listing } from '@/lib/supabase';
import { Search, MapPin, Star, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedListings();
  }, []);

  const loadFeaturedListings = async () => {
    try {
      const { data } = await getListings({ limit: 6, sortBy: 'newest' });
      setFeaturedListings(data || []);
    } catch (error) {
      console.error('Error loading featured listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Find Your Perfect
                <span className="block text-yellow-400">Rental Home</span>
              </h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Discover amazing rental properties, connect with trusted landlords, and find your next home with confidence.
              </p>
              
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-4 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Input
                    placeholder="Search by location, property type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-white text-black placeholder:text-gray-500"
                  />
                  <Button onClick={handleSearch} size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Renta?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We make finding and listing rental properties simple and secure
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Advanced filters help you find exactly what you're looking for
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    All properties are verified for authenticity and accuracy
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Read reviews and ratings from real tenants and landlords
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of happy tenants and landlords using Renta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3">
                Sign Up as Tenant
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                List Your Property
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Dashboard for authenticated users */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover your next home or manage your listings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/search">
              <CardContent className="p-6 text-center">
                <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search Properties</h3>
                <p className="text-gray-600 dark:text-gray-300">Find your perfect rental home</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/favorites">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your Favorites</h3>
                <p className="text-gray-600 dark:text-gray-300">View saved properties</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/create-listing">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">List Property</h3>
                <p className="text-gray-600 dark:text-gray-300">Add your rental listing</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Listings */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Listings
            </h2>
            <Link href="/search">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavoriteChange={loadFeaturedListings}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}