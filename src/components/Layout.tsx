import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Ticket, 
  Smartphone, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Home,
  Search,
  User,
  Sun,
  Moon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const commonNav = [
    { name: 'Explore', href: '/', icon: Home },
    { name: 'My Bookings', href: '/bookings', icon: Ticket },
  ];

  const adminTools = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Validator', href: '/scanner', icon: Smartphone },
  ];

  const organizerTools = [
    { name: 'Organizer Panel', href: '/admin', icon: LayoutDashboard },
    { name: 'Create Event', href: '/admin?tab=events&action=new', icon: Home }, 
  ];

  const currentNav = user?.role === 'ADMIN' 
    ? [...commonNav, ...adminTools] 
    : user?.role === 'ORGANIZER'
      ? [...commonNav, ...organizerTools]
      : commonNav;

  const bottomNavItems = (user?.role === 'ADMIN' || user?.role === 'ORGANIZER')
    ? [
        { name: 'Home', href: '/admin', icon: Home },
        { name: 'Explore', href: '/admin', icon: Search },
        { name: 'Tickets', href: '/bookings', icon: Ticket },
        { name: 'Profile', href: '/admin', icon: User },
      ]
    : [
        { name: 'Home', href: '/discover', icon: Home },
        { name: 'Explore', href: '/discover', icon: Search },
        { name: 'Tickets', href: '/bookings', icon: Ticket },
        { name: 'Profile', href: '/profile', icon: User },
      ];

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[var(--bg-main)]">
      <header className="bg-[var(--bg-surface)]/95 border-b border-[var(--border-color)] backdrop-blur-lg sticky top-0 z-50 transition-colors duration-500">
        <div className="app-container">
          <div className="flex justify-between items-center h-16">
            <Link to="/discover" className="flex items-center gap-2.5 group">
              <div className="bg-[var(--primary)] p-2 rounded-2xl group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-[-0.03em] text-[var(--text-main)]">PULSE</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-sm">
              {currentNav.map((item) => {
                const isActive = location.pathname === item.href || (item.href === '/discover' && location.pathname === '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 transition-colors ${isActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]" aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:bg-[var(--bg-surface)]">
                  <div className="w-8 h-8 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
                  <div className="hidden md:block text-left leading-none pr-1">
                    <div className="text-xs font-semibold text-[var(--text-main)]">{user?.name?.split(' ')[0]}</div>
                  </div>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] shadow-2xl py-2 z-[70]">
                    <div className="px-5 py-3 border-b border-[var(--border-color)]">
                      <div className="font-semibold text-[var(--text-main)]">{user?.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{user?.email}</div>
                    </div>
                    <button onClick={() => { navigate('/bookings'); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--bg-main)] text-[var(--text-main)]">
                      <Ticket className="w-4 h-4" /> My Tickets
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[var(--primary)] hover:bg-[var(--bg-main)]">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2.5 text-[var(--text-main)]">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
            <div className="app-container py-4 flex flex-col gap-1">
              {currentNav.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-main)] hover:bg-[var(--bg-main)]">
                  <item.icon className="w-4 h-4 text-[var(--primary)]" /> {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="app-container py-6 pb-24 lg:pb-10 min-h-[65vh]">
        {children}
      </main>

      <div className="bottom-nav lg:hidden">
        {bottomNavItems.map((item) => {
          const isActive = 
            location.pathname === item.href ||
            (item.href === '/discover' && (location.pathname === '/' || location.pathname.startsWith('/event') || location.pathname.startsWith('/discover'))) ||
            (item.href === '/bookings' && location.pathname.startsWith('/ticket')) ||
            (item.href === '/profile' && location.pathname === '/profile');
          return (
            <Link key={item.name} to={item.href} className={`bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}>
              <item.icon className="w-5 h-5" />
              <span className="bottom-nav__label">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-color)] py-12 mt-16 text-[var(--text-muted)] hidden lg:block">
        <div className="app-container grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[var(--text-main)]">
              <div className="bg-[var(--primary)] p-1.5 rounded-xl"><Ticket className="w-4 h-4 text-white" /></div>
              <span className="font-bold tracking-tight">PULSE</span>
            </div>
            <div>Premium event experiences.</div>
          </div>
          <div className="space-y-1.5">
            <div className="font-semibold text-[var(--text-main)] mb-1">Platform</div>
            <div><Link to="/discover" className="hover:text-[var(--text-main)]">Explore</Link></div>
            <div><Link to="/bookings" className="hover:text-[var(--text-main)]">Tickets</Link></div>
          </div>
          <div className="space-y-1.5">
            <div className="font-semibold text-[var(--text-main)] mb-1">Company</div>
            <div>Mumbai, India</div>
            <div>support@pulse.events</div>
          </div>
          <div className="text-[10px] pt-8 md:pt-0">© 2026 Pulse Events</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
