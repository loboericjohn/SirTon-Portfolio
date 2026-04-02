'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <nav className="container mx-auto flex items-center justify-start w-full px-4 lg:px-8 py-4 relative gap-8 lg:gap-12 text-black dark:text-white">
        
        {/* LOGO SECTION (Stays in its exact original position on the far left) */}
        <div className="logo shrink-0">
          <Link href="#home" className="flex items-center gap-3">
            <img 
              src={theme === 'dark' ? "/images/boston-logo-Dmode.png" : "/images/boston-logo.png"} 
              alt="Boston Logo" 
              className="h-10 w-auto object-contain" 
            />
            <img 
              src={theme === 'dark' ? "/images/AntLeu_Dmode.png" : "/images/AntLeu.png"} 
              alt="AntLeu Logo" 
              className="h-10 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* ALL CONTENT (Moved beside the logo and shifted significantly right) */}
        <div className="flex flex-1 items-center justify-start gap-4 lg:gap-8 ml-12 lg:ml-24 xl:ml-36">
          
          <ul className={`nav-links flex items-center gap-4 lg:gap-8 text-sm font-medium ${mobileMenuOpen ? 'flex-col absolute top-full left-0 w-full bg-white dark:bg-black/95 p-6 shadow-2xl z-50' : 'hidden lg:flex'}`}>
            <li>
              <Link href="#coaching" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                Coaching <ChevronDown size={14} className="opacity-70" />
              </Link>
            </li>
            <li>
              <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                Testimonials <ChevronDown size={14} className="opacity-70" />
              </Link>
            </li>
            <li>
              <Link href="#events" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                Events <ChevronDown size={14} className="opacity-70" />
              </Link>
            </li>
            <li>
              <Link href="#resources" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                Resources <ChevronDown size={14} className="opacity-70" />
              </Link>
            </li>
          </ul>

          <div className="nav-actions-group flex items-center gap-3 lg:gap-6 shrink-0">
            <Link href="/admin/login" className="admin-btn text-sm font-bold px-5 py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-all">
              Admin
            </Link>
            <div 
              className="theme-toggle flex items-center justify-center p-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-sm border border-black/5 dark:border-white/5"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 text-zinc-100" /> : <Sun className="w-5 h-5 text-zinc-900" />}
            </div>
          </div>
          
          <button 
            className="mobile-menu-toggle lg:hidden p-2 ml-auto hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
    </header>
  );
}
