import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenIcon, InfoIcon, LifeBuoyIcon, LogOut, Ticket, LayoutDashboard, Search, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { cn } from '../lib/utils';

interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const dynamicLinks = [
    { label: 'Explore Events', path: '/', icon: Search },
    { label: 'My Bookings', path: '/bookings', icon: Ticket, role: 'USER' },
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, role: 'ADMIN' },
    { label: 'Organizer Dashboard', path: '/admin', icon: LayoutDashboard, role: 'ORGANIZER' },
    { label: 'Staff Scanner', path: '/scanner', icon: Search, role: 'STAFF' },
  ].filter(item => !item.role || user?.role === item.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-[#26272B] bg-[#0B0B0F]/90 backdrop-blur-md px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4 max-w-[1200px] mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#151821]"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {dynamicLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink onClick={() => navigate(link.path)} className="py-2.5 px-3 block text-[#E4E4E7] hover:text-white hover:bg-[#151821] rounded-md cursor-pointer flex items-center gap-3">
                          <link.icon size={16} />
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                    
                    {!user && (
                       <>
                          <div role="separator" className="bg-[#26272B] -mx-1 my-2 h-px w-full" />
                          <NavigationMenuItem className="w-full">
                             <NavigationMenuLink onClick={() => navigate('/login')} className="py-2.5 px-3 block text-[#A1A1AA] hover:text-white hover:bg-[#151821] rounded-md cursor-pointer">
                                Sign In
                             </NavigationMenuLink>
                             <NavigationMenuLink onClick={() => navigate('/register')} className="py-2.5 px-3 block text-[#A78BFA] hover:text-[#7C5CFF] hover:bg-[#151821] rounded-md cursor-pointer">
                                Create Account
                             </NavigationMenuLink>
                          </NavigationMenuItem>
                       </>
                    )}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          
          {/* Main nav */}
          <div className="flex items-center gap-6 lg:gap-10">
            <div 
               className="flex items-center gap-3 cursor-pointer group" 
               onClick={() => navigate('/')}
             >
               <div className="w-8 h-8 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold text-lg leading-none transition-transform group-hover:scale-105">
                  P
               </div>
               <span className="text-xl font-bold text-[#FFFFFF] tracking-tight">PULSE</span>
             </div>
             
            {/* Desktop Navigation menu */}
            <div className="max-md:hidden">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Dynamic Discovery & Dashboard links mapped directly into top tier nav */}
                  {dynamicLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                       <NavigationMenuLink asChild>
                          <a
                             onClick={() => navigate(link.path)}
                             className={`hover:text-white py-1.5 px-3 font-medium cursor-pointer rounded-lg transition-colors flex items-center gap-2 ${isActive(link.path) ? 'text-white bg-[#151821]' : 'text-[#A1A1AA] hover:bg-[#151821]/50'}`}
                           >
                             {link.label}
                           </a>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}

                  {/* Enhanced Dropdown Menu based strictly on provided template */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-[#A1A1AA] hover:text-white bg-transparent px-3 py-1.5 font-medium border-0 focus:border-0 hover:bg-[#151821]/50">
                      Resources
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                         <li>
                           <NavigationMenuLink asChild>
                             <a onClick={() => navigate('/')} className="block cursor-pointer select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#151821] hover:text-white focus:bg-[#151821] focus:text-white">
                               <div className="flex items-center gap-2 text-[#FFFFFF]">
                                 <BookOpenIcon size={16} className="text-[#A1A1AA]" />
                                 <div className="text-sm font-medium leading-none">Getting Started</div>
                               </div>
                               <p className="line-clamp-2 text-sm leading-snug text-[#A1A1AA] pt-1.5">
                                 Learn exactly how to start buying and organizing tickets.
                               </p>
                             </a>
                           </NavigationMenuLink>
                         </li>
                         <li>
                           <NavigationMenuLink asChild>
                             <a onClick={() => navigate('/')} className="block cursor-pointer select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#151821] hover:text-white focus:bg-[#151821] focus:text-white">
                               <div className="flex items-center gap-2 text-[#FFFFFF]">
                                 <InfoIcon size={16} className="text-[#A1A1AA]" />
                                 <div className="text-sm font-medium leading-none">About Us</div>
                               </div>
                               <p className="line-clamp-2 text-sm leading-snug text-[#A1A1AA] pt-1.5">
                                 Read about the Pulse platform origin and our dedicated team.
                               </p>
                             </a>
                           </NavigationMenuLink>
                         </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
        
        {/* Right side Auth */}
        <div className="flex items-center gap-4">
          {user ? (
              <div className="relative" ref={dropdownRef}>
                 <button
                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                   className="flex items-center gap-2 lg:gap-3 p-1 pr-3 rounded-full border border-[#26272B] hover:bg-[#151821] transition-colors"
                 >
                   <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#7C5CFF]/20 text-[#A78BFA] flex items-center justify-center font-bold text-sm">
                     {user.name?.charAt(0) || 'U'}
                   </div>
                   <div className="hidden lg:flex flex-col items-start pr-1">
                     <span className="text-sm font-medium text-[#FFFFFF]">{user.name?.split(' ')[0]}</span>
                   </div>
                 </button>

                 {profileDropdownOpen && (
                   <div className="absolute right-0 mt-2 w-56 bg-[#151821] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-[#26272B] overflow-hidden animate-fade-in py-2">
                     <div className="px-4 py-3 border-b border-[#26272B]">
                       <p className="text-sm font-semibold text-[#FFFFFF] truncate">{user.name}</p>
                       <p className="text-xs text-[#A1A1AA] truncate">{user.email}</p>
                       <div className="mt-2 inline-flex border border-[#26272B] px-2 py-0.5 rounded-md text-[10px] font-medium text-[#A1A1AA]">
                          ROLE: {user.role}
                       </div>
                     </div>
                     <div className="px-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                     </div>
                   </div>
                 )}
              </div>
          ) : (
             <>
               <Button asChild variant="ghost" className="text-sm text-[#A1A1AA] hover:text-[#FFFFFF] hidden sm:inline-flex px-0 hover:bg-transparent cursor-pointer">
                 <a onClick={() => navigate('/login')}>Sign In</a>
               </Button>
               <Button asChild className="text-sm bg-[#7C5CFF] text-[#FFFFFF] hover:bg-[#6D4EFF] hidden sm:inline-flex cursor-pointer transition-colors shadow-sm">
                 <a onClick={() => navigate('/register')}>Get Started</a>
               </Button>
             </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar;
