import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, User, Moon, Sun, Globe, Radio, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { createPortal } from 'react-dom';
import { LiveClock } from './LiveClock';
import { BreakingNewsTicker } from './BreakingNewsTicker';

interface NewsHeaderProps {
  categories?: any[];
  states?: any[];
  breakingNews?: any[];
  language?: string;
  pathname?: string;
}

export const NewsHeader = ({ 
  categories = [], 
  states = [],
  breakingNews = [],
  language = 'en',
  pathname = ''
}: NewsHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [isViewMoreOpen, setIsViewMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMainHeaderVisible, setIsMainHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { toggleLanguage, t } = useLanguage();
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const statesDropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdownTimer = useRef<NodeJS.Timeout | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ left: number; top: number } | null>(null);
  const [dropdownContainer, setDropdownContainer] = useState<HTMLElement | null>(null);
  const statesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statesDropdownRef.current &&
        !statesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatesOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsStatesOpen(false);
      }
    }
    if (isStatesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isStatesOpen]);

  useEffect(() => {
    setDropdownContainer(document.body);
  }, []);

  const handleStatesButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/state/all-india');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsStatesOpen(true);
      setTimeout(() => {
        const firstLink = statesDropdownRef.current?.querySelector('a');
        (firstLink as HTMLElement)?.focus();
      }, 0);
    }
  };

  const handleStatesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/state/all-india');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false); // Close search on submit
    }
  };

  const handleMouseEnter = () => {
    if (closeDropdownTimer.current) {
      clearTimeout(closeDropdownTimer.current);
      closeDropdownTimer.current = null;
    }
    // Calculate dropdown position
    if (statesButtonRef.current) {
      const rect = statesButtonRef.current.getBoundingClientRect();
      setDropdownCoords({
        left: rect.left,
        top: rect.bottom + 8, // 8px gap below button
      });
    }
    setIsStatesOpen(true);
  };

  const handleMouseLeave = () => {
    closeDropdownTimer.current = setTimeout(() => {
      setIsStatesOpen(false);
    }, 120); // 120ms delay for smoother UX
  };

  // Scroll-based header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up (even slightly) or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsMainHeaderVisible(true);
      } else {
        // Hide header when scrolling down (but only after scrolling down significantly)
        if (currentScrollY > 150) {
          setIsMainHeaderVisible(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Top Bar - Not Sticky */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-3 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <span className="tracking-wide font-medium opacity-90 select-none">
                {new Date().toLocaleDateString(t('date.format'), {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <LiveClock />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-white hover:text-yellow-300 hover:bg-white/10 rounded-full transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-white hover:text-yellow-300 hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === 'en' ? 'हिं' : 'EN'}
              </Button>
              {userProfile ? (
                <div className="hidden md:flex items-center space-x-2">
                  <span className="font-semibold text-white/90">{userProfile.full_name || userProfile.email}</span>
                  {['admin', 'editor'].includes(userProfile.role) && (
                    <Link
                      to="/admin"
                      className="bg-white text-red-800 border border-red-600 hover:bg-red-50 hover:text-red-900 rounded-full shadow-sm font-semibold px-3 py-1 flex items-center gap-1 transition-colors"
                      style={{ lineHeight: 1 }}
                    >
                      <Users className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="bg-white text-red-800 border-white hover:bg-gray-100 hover:text-red-900 rounded-full shadow-sm font-semibold"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth" className="hidden md:block hover:text-yellow-300 font-semibold transition-colors">Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Sticky with Scroll-based Visibility */}
      <div className={`sticky top-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 font-sans ${
        isMainHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`} style={{ '--main-header-height': '80px' } as React.CSSProperties}>
          {/* Main Header */}
        <div className="container mx-auto px-4 py-3 flex items-center justify-between md:py-4 gap-3 relative">
              {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group select-none flex-1">
            <img src="/logo.png" alt="Voice of Bharat Logo" className="h-10 sm:h-12 w-auto drop-shadow-sm" />
              <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight font-sans drop-shadow-sm">Voice Of Bharat</h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">भारत की आवाज़</p>
                </div>
              </Link>
              {/* Mobile Title */}
            <div className="flex-1 text-center md:hidden">
              <h1 className="text-lg font-extrabold text-gray-900 dark:text-white whitespace-nowrap drop-shadow-sm">{t('site.title')}</h1>
              </div>
              {/* Search Bar (desktop only) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
              <form onSubmit={handleSearch} className="relative w-full">
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 pl-4 py-3 rounded-full bg-gray-50/80 dark:bg-gray-900/80 border border-gray-300/50 dark:border-gray-600/50 text-base shadow-sm focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 focus:border-red-500 dark:focus:border-red-400 transition-all backdrop-blur-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-md focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 transition-all"
                  >
                  <Search className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            {/* Mobile Nav Actions */}
            <div className="flex items-center md:hidden gap-2 flex-1 justify-end">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-600/50 shadow-lg rounded-full p-2.5 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
              <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
              className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-600/50 shadow-lg rounded-full p-2.5 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
              {isMenuOpen ? <X className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
            </div>
          {/* Mobile Search - shows on click */}
          {isSearchOpen && (
          <div className="block md:hidden bg-gray-50/95 dark:bg-gray-900/95 border-t border-gray-200/50 dark:border-gray-700/50 p-4 backdrop-blur-xl">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  className="pr-14 pl-5 py-3 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-600/50 text-lg shadow-sm focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 transition-all backdrop-blur-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-md transition-all"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
              </div>
          )}
        </div>

      {/* Sticky Breaking News Only */}
        {breakingNews && breakingNews.length > 0 && (
        <div className={`sticky top-0 z-40 transition-all duration-300 ${
          isMainHeaderVisible ? 'top-[60px] md:top-[80px]' : 'top-0'
        }`}>
          <BreakingNewsTicker news={breakingNews} language={language} />
        </div>
        )}

    {/* Desktop Category Navbar - Not Sticky */}
    {categories && categories.length > 0 && pathname !== '/about-us' && pathname !== '/support-us' &&
    <nav className="hidden md:block border-b border-black/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-row items-center justify-center py-4 gap-4 bg-white dark:bg-black rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
              <Link
                to="/"
                  className="font-extrabold text-black dark:text-white text-base px-6 py-2 rounded-full bg-white dark:bg-black shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/30 scale-100 hover:scale-105 border border-gray-200 dark:border-gray-700"
              >
                {t('nav.home')}
              </Link>
                {/* Show up to 6 categories, then View More always at the end */}
                {categories.length > 6 ? (
                  <>
              {categories.slice(0, 6).map((category) => {
                const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                          className="font-bold text-black dark:text-white text-base px-6 py-2 rounded-full bg-white dark:bg-black shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/30 scale-100 hover:scale-105 border border-gray-200 dark:border-gray-700"
                  >
                    {catName}
                  </Link>
                );
              })}
                    <div className="relative group">
            <button
              type="button"
                        className="font-bold text-black dark:text-white text-base px-6 py-2 rounded-full bg-white dark:bg-black shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 flex items-center gap-1"
              aria-haspopup="true"
                        aria-expanded="false"
            >
                        {t('view_more')}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
                      <div className="absolute right-0 mt-2 min-w-[180px] max-h-80 overflow-y-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2 hidden group-hover:block group-focus-within:block animate-fade-in">
                        {categories.slice(6).map((category) => {
                          const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                          return (
                            <Link
                              key={category.id}
                              to={`/category/${category.slug}`}
                              className="block px-5 py-2 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:bg-gray-300 dark:focus:bg-gray-700 outline-none rounded font-medium text-base"
                            >
                              {catName}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  categories.map((category) => {
                    const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                    return (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="font-bold text-black dark:text-white text-base px-6 py-2 rounded-full bg-white dark:bg-black shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/30 scale-100 hover:scale-105 border border-gray-200 dark:border-gray-700"
                      >
                        {catName}
                      </Link>
                    );
                  })
                )}
                <Link
                  to="/live"
                  className="font-bold text-red-600 flex items-center gap-2 text-base px-6 py-2 rounded-full bg-white dark:bg-black shadow hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 scale-100 hover:scale-105 border border-red-200 dark:border-red-700"
                >
                  <Radio className="h-5 w-5 text-red-600 animate-pulse" />
                  {t('nav.live')}
                </Link>
          </div>
        </div>
      </nav>
    }
    {/* States Bar - Not Sticky */}
    {states && states.length > 0 && pathname !== '/about-us' && pathname !== '/support-us' &&
      <div className="hidden md:block border-b border-black/10 bg-white dark:bg-black shadow-md overflow-visible">
        <div className="container mx-auto px-4 overflow-visible">
          <div className="flex flex-row items-center py-3 gap-3 overflow-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <span className="font-bold text-black dark:text-white text-base uppercase tracking-widest mr-4">States</span>
            {/* States links and View More dropdown */}
            {states.slice(0, 10).map((state) => (
              <Link
                key={state.id}
                to={`/state/${state.slug}`}
                className="font-semibold text-black dark:text-white text-base px-2 py-1 rounded-full bg-white dark:bg-black hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:bg-gray-300 dark:focus:bg-gray-700"
                style={{ minWidth: '80px', textAlign: 'center' }}
              >
                {language === 'hi' && state.name_hi ? state.name_hi : state.name}
              </Link>
            ))}
            {states.length > 10 && (
              <div className="relative group ml-2">
                  <button
                  type="button"
                  className="font-semibold text-black dark:text-white text-base px-2 py-1 rounded-full bg-white dark:bg-black hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:bg-gray-300 dark:focus:bg-gray-700 flex items-center gap-1 border-none shadow-none"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {t('view_more')}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute right-0 mt-2 min-w-[180px] max-h-80 overflow-y-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[9999] py-2 hidden group-hover:block group-focus-within:block animate-fade-in">
                  {states.slice(10).map((state) => (
                    <Link
                    key={state.id}
                      to={`/state/${state.slug}`}
                      className="block px-5 py-2 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:bg-gray-300 dark:focus:bg-gray-700 outline-none rounded font-medium text-base"
                      style={{ minWidth: '140px' }}
                    >
                      {language === 'hi' && state.name_hi ? state.name_hi : state.name}
                    </Link>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    }
    {/* Mobile Menu (Portal) */}
    {dropdownContainer && createPortal(
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <nav
          className={`mobile-menu fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white dark:bg-black shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
              <img src="/logo.png" alt="Voice of Bharat Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-extrabold text-black dark:text-white">Voice Of Bharat</h1>
                <p className="text-xs text-gray-500">भारत की आवाज़</p>
              </div>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-1">
              <Link
                to="/"
                className="w-full block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              {/* Show up to 6 categories, then View More always at the end */}
              {categories.length > 6 ? (
                <>
              {categories.slice(0, 6).map((category) => {
                const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                        className="w-full block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {catName}
                      </Link>
                    );
                  })}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsViewMoreOpen(!isViewMoreOpen)}
                      className="w-full font-medium text-black dark:text-white text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-between"
                      aria-haspopup="true"
                      aria-expanded={isViewMoreOpen}
                    >
                      <span>{t('view_more')}</span>
                      <svg className={`w-4 h-4 ml-1 transition-transform ${isViewMoreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isViewMoreOpen && (
                      <div className="pl-4">
                      {categories.slice(6).map((category) => {
                        const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                        return (
                          <Link
                            key={category.id}
                            to={`/category/${category.slug}`}
                              className="w-full block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsViewMoreOpen(false);
                              }}
                >
                  {catName}
                </Link>
              );
            })}
                    </div>
                    )}
                  </div>
                </>
              ) : (
                categories.map((category) => {
                  const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                  return (
              <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="w-full block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                      {catName}
              </Link>
                  );
                })
              )}
              <Link
                to="/live"
                className="w-full block text-red-600 font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-red-600 bg-white dark:bg-black flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Radio className="h-5 w-5 text-red-600 animate-pulse" />
                {t('nav.live')}
              </Link>
              {/* Support Us Section */}
              <Link
                to="/support-us"
                className="w-full block text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-red-700 dark:focus:bg-red-900 border-l-4 border-red-600 bg-red-600 dark:bg-red-700 flex items-center gap-2 hover:bg-red-700 dark:hover:bg-red-800 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <span role="img" aria-label="Support">🤝</span>
                {t('nav.support_us') || 'Support Us'}
              </Link>
              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-3" />
              {/* States Section */}
              <div className="mb-2 mt-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 pl-1">States</div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-2 flex flex-col gap-1">
              <button
                type="button"
                  className="block text-black dark:text-white font-medium text-base px-3 py-2 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-left w-full mb-1"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/state/all-india');
                }}
              >
                {language === 'hi' ? 'अखिल भारत' : 'All India'}
              </button>
                {states
                  .filter(state => state.slug !== 'all-india')
                  .map((state) => (
                      <Link
                        key={state.id}
                        to={`/state/${state.slug}`}
                    className="block text-black dark:text-white font-medium text-base px-3 py-2 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                      >
                        {language === 'hi' && state.name_hi ? state.name_hi : state.name}
                      </Link>
                    ))}
                  </div>
                </div>
          {/* Footer */}
          <div className="mt-auto px-8 pb-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
            {userProfile && ['admin', 'editor'].includes(userProfile.role) && (
              <Link
                to="/admin"
                className="w-full flex items-center gap-2 text-red-600 font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-red-600 bg-white dark:bg-black hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5 text-red-600" />
                Dashboard
              </Link>
            )}
            {userProfile ? (
              <button
                onClick={() => { setIsMenuOpen(false); signOut(); }}
                className="w-full text-left text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="w-full block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
        </div>
      </nav>
    </div>,
    dropdownContainer
  )}
    </>
  );
};
