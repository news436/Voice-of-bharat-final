import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, User, Moon, Sun, Globe, Radio } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { createPortal } from 'react-dom';
import { LiveClock } from './LiveClock';

interface NewsHeaderProps {
  categories?: any[];
  states?: any[];
}

export const NewsHeader = ({ categories = [], states = [] }: NewsHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const statesDropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdownTimer = useRef<NodeJS.Timeout | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ left: number; top: number } | null>(null);
  const [dropdownContainer, setDropdownContainer] = useState<HTMLElement | null>(null);
  const statesButtonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <>
    <div className="sticky top-0 z-50 bg-white/70 dark:bg-black/80 backdrop-blur-2xl shadow-2xl border-b border-black/10 dark:border-white/10 transition-all font-sans">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-2 border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <span className="tracking-wide font-medium opacity-80 select-none">
                {new Date().toLocaleDateString(t('date.format'), {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex-1">
              <LiveClock />
            </div>
            <div className="flex-1 flex items-center justify-end space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-white hover:text-red-400 hover:bg-black/30 rounded-full transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-white hover:text-red-400 hover:bg-black/30 rounded-full transition-colors"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === 'en' ? 'हिं' : 'EN'}
              </Button>
              {userProfile ? (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white/90">{userProfile.full_name || userProfile.email}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="bg-white text-black border-black hover:bg-gray-100 hover:text-black rounded-full shadow-sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth" className="hover:text-red-400 font-semibold transition-colors">Login</Link>
              )}
              <Link to="/newsletter" className="hover:text-red-400 font-semibold transition-colors">{t('newsletter.title')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Mobile/Tablet: Compact, glassy, floating */}
      <div className="container mx-auto px-4 py-2 flex items-center justify-between md:py-3 gap-2 relative">
          {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group select-none">
          <img src="/logo.png" alt="Voice of Bharat Logo" className="h-12 w-auto" />
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-tight font-sans drop-shadow-sm">Voice Of Bharat</h1>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">भारत की आवाज़</p>
            </div>
          </Link>
          {/* Search Bar (desktop only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
          <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 pl-4 py-2 rounded-full bg-white/90 dark:bg-black/80 border border-gray-300 dark:border-gray-700 text-base shadow-inner focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 focus:border-red-500 dark:focus:border-red-400 transition-all"
              />
              <Button
                type="submit"
                size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-md focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
              >
              <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        {/* Mobile Menu Button - glassy, floating, pill-shaped */}
        <button
          className="md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-lg border border-black/10 shadow-lg rounded-full p-2 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        </div>
      {/* Mobile Search - always visible on mobile, glassy, spaced */}
      <div className="block md:hidden bg-white/80 dark:bg-black/80 border-t border-black/10 p-4 backdrop-blur-xl">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-14 pl-5 py-3 rounded-full bg-gray-100/80 dark:bg-gray-900/80 border border-black/20 text-lg shadow-inner focus:ring-2 focus:ring-black/30 transition-all"
            />
            <Button
              type="submit"
              size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white hover:bg-gray-900 rounded-full shadow"
            >
            <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    {/* Desktop Category Navbar */}
    {categories && categories.length > 0 &&
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
                        View More
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
    {/* States Bar - below category bar */}
    {states && states.length > 0 &&
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
                  View More
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
    {/* Mobile Menu Overlay & Drawer (now outside header) */}
    {isMenuOpen && (
      <>
        {/* Dimmed backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Redesigned Drawer */}
        <nav className="fixed top-0 right-0 z-50 w-[85vw] max-w-xs h-full bg-white dark:bg-black/95 backdrop-blur-md border-l border-gray-200 dark:border-gray-800 shadow-xl rounded-l-2xl flex flex-col transition-transform duration-300 animate-slide-in">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 border border-gray-200 dark:border-gray-700 shadow rounded-full p-2 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
          {/* Logo/Header */}
          <div className="flex flex-col items-center pt-8 pb-2 px-8">
            <div className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-4 py-2 font-semibold text-xl shadow mb-1 border border-gray-300 dark:border-gray-700">VOB</div>
            <span className="text-base font-medium text-gray-800 dark:text-gray-200 tracking-tight">Voice Of Bharat</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mx-8 mb-3" />
          {/* Main Nav Links */}
          <div className="flex-1 min-h-0 flex flex-col gap-1 px-6 overflow-y-auto">
            <Link
              to="/"
              className="block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
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
                      className="block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {catName}
                    </Link>
                  );
                })}
                <div className="relative group">
                  <button
                    type="button"
                    className="font-medium text-black dark:text-white text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-1"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    View More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute right-0 mt-2 min-w-[180px] max-h-80 overflow-y-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl shadow z-50 py-2 hidden group-hover:block group-focus-within:block animate-fade-in">
                    {categories.slice(6).map((category) => {
                      const catName = language === 'hi' && category.name_hi ? category.name_hi : category.name;
                      return (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="block px-5 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors focus:bg-gray-200 dark:focus:bg-gray-800 outline-none rounded font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
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
                    className="block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
                    {catName}
            </Link>
                );
              })
            )}
            <Link
              to="/live"
              className="block text-red-600 font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-red-600 bg-white dark:bg-black flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-400"
              onClick={() => setIsMenuOpen(false)}
            >
              <Radio className="h-5 w-5 text-red-600 animate-pulse" />
              {t('nav.live')}
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
              All India
            </button>
              {states.map((state) => (
                    <Link
                      key={state.id}
                      to={`/state/${state.slug}`}
                  className="block text-black dark:text-white font-medium text-base px-3 py-2 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                    >
                      {state.name}
                    </Link>
                  ))}
                </div>
              </div>
          {/* Footer */}
          <div className="mt-auto px-8 pb-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
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
            <Link
              to="/newsletter"
              className="w-full block text-black dark:text-white font-medium text-base px-4 py-3 rounded transition-all duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 border-l-4 border-transparent hover:border-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('newsletter.title')}
            </Link>
        </div>
      </nav>
      </>
    )}
    </>
  );
};
