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

  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[var(--primary)] p-2 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-red-500/20">
                 <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">PULSE</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {currentNav.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                      isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-6">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-3 bg-[var(--bg-main)] text-[var(--text-muted)] rounded-2xl hover:text-[var(--text-main)] transition-all border border-[var(--border-color)] shadow-sm"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] p-1 pl-4 rounded-full transition-all border border-[var(--border-color)]"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-[var(--text-main)] leading-none">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{user?.role}</p>
                  </div>
                  <div className="w-9 h-9 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-500/10">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-[var(--bg-surface)] rounded-[1.5rem] shadow-2xl py-4 z-50 border border-[var(--border-color)] animate-scale-up">
                    <div className="px-6 py-4 border-b border-[var(--border-color)] mb-3 opacity-90">
                       <p className="text-xs font-black text-[var(--text-main)]">{user?.name}</p>
                       <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => {navigate('/bookings'); setProfileDropdownOpen(false);}}
                      className="flex items-center gap-3 w-full px-6 py-3 text-sm text-[var(--text-main)] font-bold hover:bg-[var(--bg-main)] transition-colors"
                    >
                       <Ticket className="w-4 h-4" /> My Bookings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-6 py-4 text-sm text-[var(--primary)] font-black hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
                    >
                       <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[var(--text-main)] hover:bg-[var(--bg-main)] rounded-xl"
              >
                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--bg-surface)] border-t border-[var(--border-color)] animate-slide-down">
            <div className="px-6 py-8 space-y-4">
              {currentNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-5 px-6 py-5 text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em] bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-[var(--primary)]" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-[70vh]">
         {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-color)] py-20 mt-20 transition-colors duration-500">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-3 mb-8">
                  <div className="bg-[var(--primary)] p-2 rounded-xl shadow-lg shadow-red-500/20">
                     <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">PULSE</span>
               </div>
               <p className="text-[var(--text-muted)] text-[10px] font-black leading-relaxed max-w-sm uppercase tracking-widest">
                  Your all-in-one platform for discovering, booking, and managing events with ease.
               </p>
            </div>
            <div>
               <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] mb-8 opacity-50">Quick Links</h4>
               <ul className="space-y-5 text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">
                  <li><Link to="/" className="hover:text-[var(--primary)] transition-colors">Explore Events</Link></li>
                  <li><Link to="/bookings" className="hover:text-[var(--primary)] transition-colors">My Tickets</Link></li>
                  <li><Link to="/scanner" className="hover:text-[var(--primary)] transition-colors">Entry Validator</Link></li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] mb-8 opacity-50">Contact</h4>
               <p className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] leading-loose">
                  Pulse Events HQ<br/>
                  Mumbai, India<br/>
                  support@pulse.events
               </p>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-[var(--border-color)] flex justify-between items-center text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <span>© 2026 PULSE EVENTS. All rights reserved.</span>
            <span>Built with ❤️ in India</span>
         </div>
      </footer>
    </div>
  );
};

export default Layout;
