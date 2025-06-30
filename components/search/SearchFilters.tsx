'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    rooms: number;
    sortBy: string;
  }) => void;
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPrice: 0,
    maxPrice: 5000,
    rooms: 1,
    sortBy: 'newest'
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    const newFilters = { ...filters, minPrice: values[0], maxPrice: values[1] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search listings..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <div>
          <Label>Price Range</Label>
          <div className="px-3 py-4">
            <Slider
              defaultValue={[filters.minPrice, filters.maxPrice]}
              max={10000}
              min={0}
              step={100}
              onValueChange={handlePriceRangeChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="rooms">Minimum Bedrooms</Label>
          <Select value={filters.rooms.toString()} onValueChange={(value) => handleFilterChange('rooms', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+ Bedroom</SelectItem>
              <SelectItem value="2">2+ Bedrooms</SelectItem>
              <SelectItem value="3">3+ Bedrooms</SelectItem>
              <SelectItem value="4">4+ Bedrooms</SelectItem>
              <SelectItem value="5">5+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sortBy">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}