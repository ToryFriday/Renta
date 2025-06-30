'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Button } from '@/components/ui/button';
import { getListings, Listing } from '@/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams?.get('q') || '',
    location: '',
    minPrice: 0,
    maxPrice: 5000,
    rooms: 1,
    sortBy: 'newest'
  });

  useEffect(() => {
    loadListings();
  }, [filters, currentPage]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data, count } = await getListings({
        search: filters.search,
        location: filters.location,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        rooms: filters.rooms,
        sortBy: filters.sortBy as any,
        page: currentPage,
        limit: 12
      });
      
      setListings(data || []);
      setTotalPages(Math.ceil((count || 0) / 12));
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search Rentals
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find your perfect rental property
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300">
                {loading ? 'Loading...' : `${listings.length} properties found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onFavoriteChange={loadListings}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            size="sm"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No properties found matching your criteria.
                </p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}