"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles'
      };
      setCurrentTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };

    // Update immediately
    updateTime();
    
    // Then update every second
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate header height based on whether menu is open
  const headerHeight = menuOpen ? 'auto' : '120px'; // Adjust this value based on your header's actual height

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 w-full bg-gray-900/90"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 50,
          height: 'auto'
        }}
      >
        <div className="relative">
          {/* Mask overlay with blur effect - constrained to header height */}
          <div 
            className="absolute inset-0 pointer-events-none backdrop-blur-sm bg-gradient-to-b from-gray-900 to-transparent opacity-80 mask-image"
            style={{ height: '100%' }}
          ></div>
          
          {/* Top bar with location and time - more compact on mobile */}
          <div className="container mx-auto px-3 py-1 sm:px-4 sm:py-2 relative z-10 border-b border-gray-800/50">
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-xs font-mono tracking-widest text-gray-600 hover:text-gray-300 transition-colors uppercase"
                >
                  ← Squaloo
                </Link>
                <span className="text-gray-800 hidden sm:inline">|</span>
                <div className="hidden sm:flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  USA / Los Angeles
                </div>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentTime} <span className="hidden sm:inline">PST</span>
              </div>
            </div>
          </div>
          
          {/* Main navigation - more compact on mobile */}
          <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-3 relative z-10">
            <div className="flex justify-between items-center">
              <Link href="/marshal-qr" className="text-lg sm:text-xl font-bold">MA</Link>
              
              {/* Mobile menu button */}
              <button 
                className="sm:hidden p-1 focus:outline-none" 
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              
              {/* Desktop navigation */}
              <nav className="hidden sm:block">
                <ul className="flex gap-4 sm:gap-6 text-sm sm:text-base">
                  <li><Link href="/marshal-qr" className="hover:text-gray-300 transition">Home</Link></li>
                  <li><Link href="/marshal-qr/work" className="hover:text-gray-300 transition">Work</Link></li>
                  <li><Link href="/marshal-qr/blog" className="hover:text-gray-300 transition">Blog</Link></li>
                  <li><Link href="/marshal-qr/about" className="hover:text-gray-300 transition">About</Link></li>
                  <li><Link href="/marshal-qr/contact" className="hover:text-gray-300 transition">Contact</Link></li>
                </ul>
              </nav>
            </div>
            
            {/* Mobile navigation menu - maintaining transparency */}
            {menuOpen && (
              <div className="sm:hidden mt-2 pb-2 border-t border-gray-800/50 pt-2">
                <ul className="flex flex-col gap-2 text-sm">
                  <li><Link href="/marshal-qr" className="block hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Home</Link></li>
                  <li><Link href="/marshal-qr/work" className="block hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Work</Link></li>
                  <li><Link href="/marshal-qr/blog" className="block hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Blog</Link></li>
                  <li><Link href="/marshal-qr/about" className="block hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>About</Link></li>
                  <li><Link href="/marshal-qr/contact" className="block hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Contact</Link></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Add a spacer div to push content below the fixed header */}
      <div style={{ height: headerHeight }}></div>
    </>
  );
} 