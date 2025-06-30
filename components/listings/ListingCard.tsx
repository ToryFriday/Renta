'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, Bed, Bath } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Listing } from '@/lib/supabase';

interface ListingCardProps {
  listing: Listing;
  onFavoriteChange?: () => void;
}

export function ListingCard({ listing, onFavoriteChange }: ListingCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: listing.id });
        setIsFavorite(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const primaryImage = listing.image_urls?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600';

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/listing/${listing.id}`}>
        <div className="relative">
          <Image
            src={primaryImage}
            alt={listing.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              onClick={toggleFavorite}
              disabled={favoriteLoading}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </Button>
          )}
          
          {listing.featured && (
            <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">
              Featured
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {listing.location}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(listing.rent_price)}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              
              {listing.average_rating && listing.review_count ? (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {listing.average_rating} ({listing.review_count})
                </div>
              ) : null}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {listing.rooms} bed{listing.rooms !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
              </div>
            </div>
            
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {listing.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {listing.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{listing.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}