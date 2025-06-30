'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-xl">
                renta
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Find your perfect rental home or list your property with ease. 
              Connecting tenants and landlords across the city.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Image 
                  src="/boltlogo.png"
                  alt="Built with Bolt.new"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              For Tenants
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Search Rentals
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Saved Properties
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Your Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              For Landlords
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/create-listing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  List Property
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © 2025 Renta. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}