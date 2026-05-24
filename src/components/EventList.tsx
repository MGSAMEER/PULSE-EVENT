import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from './EventCard';
import { Search, Loader2, X, Filter } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

const EventCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl h-[420px] flex flex-col overflow-hidden">
     <div className="h-56 bg-[var(--bg-surface)]"></div>
     <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="h-5 bg-[var(--bg-surface)] rounded w-4/5"></div>
        <div className="space-y-2 mt-2">
           <div className="h-3.5 bg-[var(--bg-surface)] rounded w-full"></div>
           <div className="h-3.5 bg-[var(--bg-surface)] rounded w-3/4"></div>
        </div>
        <div className="mt-auto h-9 bg-[var(--bg-surface)] rounded-xl w-full"></div>
     </div>
  </div>
);

const PAGE_LIMIT = 9;
const categories = ['All', 'Music', 'Technology', 'Art', 'Business', 'General'];
const locations  = ['All', 'Mumbai', 'Nashik', 'Pune', 'Bangalore', 'Delhi'];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const EventList: React.FC = () => {
  const [events, setEvents]                     = useState<any[]>([]);
  const [initialLoading, setInitialLoading]     = useState(true);
  const [loadingMore, setLoadingMore]           = useState(false);
  const [hasMore, setHasMore]                   = useState(true);
  const [page, setPage]                         = useState(1);

  const [search, setSearch]                     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [recentSearches, setRecentSearches]     = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);

  const debouncedSearch   = useDebounce(search, 400);
  const navigate          = useNavigate();
  const sentinelRef       = useRef<HTMLDivElement>(null);
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: 'start', 
    skipSnaps: false,
    containScroll: 'trimSnaps'
  });

  const featuredEvents = React.useMemo(() => events.slice(0, 3), [events]);

  const fetchInitial = useCallback(async () => {
    setInitialLoading(true);
    try {
      const params: any = { page: 1, limit: PAGE_LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLocation && selectedLocation !== 'All') params.location = selectedLocation;

      const res = await api.get('/events', { params });
      
      const payload = res.data.data;
      const eventList = payload?.events ?? payload ?? [];
      const pagination = payload?.pagination;

      setEvents(eventList);
      setHasMore(pagination?.hasMore ?? false);
      setPage(1);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedLocation]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [term, ...recents.filter((r: string) => r !== term)].slice(0, 8);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 2) {
      // Auto save after typing pause via debounce in effect if needed, but simple on blur
    }
  };

  const selectSuggestion = (term: string) => {
    setSearch(term);
    saveRecentSearch(term);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setShowSuggestions(false);
  };

  const openSearchOverlay = () => {
    setIsSearchOpen(true);
    setShowSuggestions(false);
  };

  const closeSearchOverlay = () => {
    setIsSearchOpen(false);
  };

  const applySearchFilters = () => {
    // Filters are already live via state, just close overlay
    // In future could have pending state, but for now live
    closeSearchOverlay();
  };

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const params: any = { page: nextPage, limit: PAGE_LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLocation && selectedLocation !== 'All') params.location = selectedLocation;

      const res = await api.get('/events', { params });
      const payload = res.data.data;
      const newEvents  = payload?.events ?? payload ?? [];
      const pagination = payload?.pagination;

      setEvents(prev => [...prev, ...newEvents]);
      setPage(nextPage);
      setHasMore(pagination?.hasMore ?? false);
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, debouncedSearch, selectedCategory, selectedLocation]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  useEffect(() => {
    const recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recents.slice(0, 5));
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) fetchMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchMore]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-6 pb-6 sm:space-y-8 sm:pb-8">
      <div className="pt-2">
        <h1 className="text-h1">Discover Events</h1>
        <p className="text-body mt-2 max-w-xl">Premium experiences near you. Handpicked for you.</p>
      </div>

      {/* Optimized Embla Carousel - GPU accel, limited items, reduced effects */}
      {!initialLoading && featuredEvents.length > 0 && (
        <div 
          className="overflow-hidden rounded-3xl" 
          ref={emblaRef}
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        >
          <div className="flex">
            {featuredEvents.map((event, index) => (
              <div 
                key={event._id}
                onClick={() => navigate(`/event/${event._id}`)}
                className="min-w-full flex-[0_0_100%] relative h-52 sm:h-64 cursor-pointer active:scale-[0.985] transition-all duration-200 bg-cover bg-center group"
                style={{ 
                  backgroundImage: event.flyerImage ? `url(${event.flyerImage})` : 'linear-gradient(135deg, #1a1d26, #0B0B0F)',
                  willChange: 'transform',
                  transform: 'translateZ(0)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 dark:from-black/30 via-black/70 dark:via-black/70 to-black/90 dark:to-black/90" />
                <div className="absolute bottom-0 p-6 text-white w-full">
                  <div className="uppercase text-xs tracking-[3px] bg-white/10 inline-block px-3 py-0.5 rounded mb-2">FEATURED</div>
                  <div className="text-2xl font-semibold leading-tight tracking-tight line-clamp-2 group-active:scale-[0.99] transition">{event.name}</div>
                  <div className="text-sm mt-1.5 opacity-90 flex items-center gap-2">{event.venue} • {new Date(event.date).toLocaleDateString()}</div>
                </div>
                {index === 0 && <div className="absolute top-4 right-4 text-[10px] px-3 py-1 rounded-full bg-white/10 text-white">Swipe →</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Search Bar - mobile friendly, opens full-screen overlay */}
      <div className="px-1">
        <button 
          onClick={openSearchOverlay}
          className="w-full flex items-center gap-3 px-4 h-11 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-left text-[var(--text-muted)] active:scale-[0.985] transition-all"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">Search events, artists, venues or locations...</span>
          <Filter className="w-4 h-4 ml-auto opacity-60" />
        </button>
      </div>

      {/* Active filters summary (compact, always visible) */}
      {(search || selectedCategory !== 'All' || selectedLocation !== 'All') && (
        <div className="px-1 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar -mx-1 px-1">
          {search && <span onClick={openSearchOverlay} className="cursor-pointer bg-[var(--primary)]/10 text-[var(--primary)] px-2.5 py-0.5 rounded-full whitespace-nowrap">"{search}"</span>}
          {selectedCategory !== 'All' && <span onClick={openSearchOverlay} className="cursor-pointer bg-white/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">{selectedCategory}</span>}
          {selectedLocation !== 'All' && <span onClick={openSearchOverlay} className="cursor-pointer bg-white/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">{selectedLocation}</span>}
          <button onClick={clearFilters} className="text-[var(--primary)] underline ml-1 text-xs shrink-0">Clear</button>
        </div>
      )}

      {initialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="premium-card flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[var(--bg-card)]">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-[var(--text-dim)]" />
          </div>
          <div className="text-h3 mb-1">Nothing here yet</div>
          <p className="text-body max-w-xs">Try different keywords or clear your filters to see what's happening.</p>
          <button onClick={clearFilters} className="mt-5 thumb-button px-6 py-2 text-sm bg-white/10 rounded-full">Clear everything</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event._id} event={event} onBook={(id) => navigate(`/event/${id}`)} />
            ))}
            {loadingMore && Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
           <div ref={sentinelRef} className="h-8 flex justify-center">
             {loadingMore && <Loader2 className="animate-spin text-[var(--primary)] w-5 h-5" />}
           </div>
         </>
       )}

       {/* Full-screen Search Overlay - Mobile First Premium Dark UI */}
       {isSearchOpen && (
         <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex flex-col">
           <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
             <button onClick={closeSearchOverlay} className="p-2 -ml-2 text-[var(--text-muted)]">
               <X className="w-5 h-5" />
             </button>
             <div className="flex-1 relative">
               <Search className="absolute left-3 top-3 text-[var(--text-muted)] w-4 h-4" />
               <input
                 type="text"
                 autoFocus
                 className="input-field h-11 pl-10 text-base w-full"
                 placeholder="Search events..."
                 value={search}
                 onChange={handleSearchChange}
               />
             </div>
             <button onClick={applySearchFilters} className="text-sm font-semibold text-[var(--primary)] px-3 py-1">Done</button>
           </div>

           <div className="flex-1 overflow-auto p-4 space-y-6">
             {/* Location Filter */}
             <div>
               <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Location</div>
               <div className="flex flex-wrap gap-2">
                 {locations.map(loc => (
                   <button
                     key={loc}
                     onClick={() => setSelectedLocation(loc)}
                     className={`px-4 py-1.5 text-sm rounded-full transition-all ${selectedLocation === loc ? 'bg-white text-black' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]'}`}
                   >
                     {loc}
                   </button>
                 ))}
               </div>
             </div>

             {/* Categories */}
             <div>
               <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Categories</div>
               <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-4 py-1.5 text-sm rounded-full transition-all ${selectedCategory === cat ? 'bg-white text-black' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]'}`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>

             {/* Recent searches */}
             {recentSearches.length > 0 && (
               <div>
                 <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Recent Searches</div>
                 <div className="space-y-1">
                   {recentSearches.map((rec, i) => (
                     <div key={i} onClick={() => { selectSuggestion(rec); closeSearchOverlay(); }} className="px-3 py-2 text-sm bg-[var(--bg-card)] rounded-xl cursor-pointer active:bg-white/5">
                       {rec}
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>

           <div className="p-4 border-t border-[var(--border-color)] flex gap-3">
             <button onClick={clearFilters} className="flex-1 h-12 rounded-2xl border border-[var(--border-color)] text-sm font-medium">Clear All</button>
             <button onClick={applySearchFilters} className="flex-1 h-12 rounded-2xl bg-[var(--primary)] text-sm font-semibold text-white">Apply Filters</button>
           </div>
         </div>
       )}
     </div>
   );
 };

export default EventList;
