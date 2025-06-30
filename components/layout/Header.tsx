'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Search, Heart, User, Settings, LogOut, Sun, Moon, Plus } from 'lucide-react';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin' });
  };

  const toggleAuthMode = () => {
    setAuthModal(prev => ({
      ...prev,
      mode: prev.mode === 'signin' ? 'signup' : 'signin'
    }));
  };

  return (
    <>
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Built with Bolt.new badge */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-xl">
                  renta
                </div>
              </Link>
              
              {/* Built with Bolt.new badge */}
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:block"
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

            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link href="/search" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Search className="w-4 h-4" />
                  Search
                </Link>
                <Link href="/favorites" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Heart className="w-4 h-4" />
                  Favorites
                </Link>
                {profile?.role === 'landlord' && (
                  <Link href="/create-listing" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" />
                    List Property
                  </Link>
                )}
              </nav>
            )}

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => openAuthModal('signin')}>
                    Sign In
                  </Button>
                  <Button onClick={() => openAuthModal('signup')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onToggleMode={toggleAuthMode}
      />
    </>
  );
}