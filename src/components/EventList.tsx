import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from './EventCard';
import { Search, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const EventCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-[#151821] border border-[#26272B] rounded-2xl h-[400px] flex flex-col">
     <div className="h-48 bg-[#1B1E28] rounded-t-2xl border-b border-[#26272B]"></div>
     <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="h-6 bg-[#1B1E28] rounded w-3/4"></div>
        <div className="space-y-2 mt-4">
           <div className="h-4 bg-[#1B1E28] rounded w-full"></div>
           <div className="h-4 bg-[#1B1E28] rounded w-5/6"></div>
        </div>
        <div className="mt-auto h-10 bg-[#1B1E28] rounded w-full"></div>
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

  const debouncedSearch   = useDebounce(search, 400);
  const navigate          = useNavigate();
  const sentinelRef       = useRef<HTMLDivElement>(null);

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
    <div className="pt-28 pb-32 max-w-[1200px] mx-auto px-6 bg-[#0B0B0F] min-h-screen">
      
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 space-y-6">
        <h1 className="text-h1">Explore Events</h1>
        <p className="text-body max-w-2xl text-lg">Discover and book the best experiences near you. Sort by category, location, or search directly.</p>
      </motion.div>

      {/* STICKY SEARCH & FILTERS */}
      <div className="sticky top-[80px] z-[90] bg-[#0B0B0F]/95 backdrop-blur-xl py-4 mb-10 border-b border-[#26272B]">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
           
           {/* Search Input */}
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] h-5 w-5" />
              <input 
                 type="text" 
                 className="w-full h-[52px] pl-12 pr-4 bg-[#111217] border border-[#26272B] rounded-[10px] text-[#FFFFFF] outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30 transition-all placeholder:text-[#6B7280]"
                 placeholder="Search for events, artists, or venues..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
              />
           </div>

           {/* Location Dropdown */}
           <div className="lg:w-[250px]">
              <select 
                 className="w-full h-[52px] bg-[#111217] border border-[#26272B] rounded-[10px] px-4 text-[#FFFFFF] outline-none focus:border-[#7C5CFF] transition-all cursor-pointer"
                 value={selectedLocation}
                 onChange={(e) => setSelectedLocation(e.target.value)}
              >
                 {locations.map(loc => (
                    <option key={loc} value={loc} className="bg-[#151821] text-[#FFFFFF]">{loc}</option>
                 ))}
              </select>
           </div>
        </div>
        
        {/* Category Pills (Sub-row) */}
        <div className="flex flex-wrap gap-2 mt-4">
           {categories.map(cat => (
              <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat 
                       ? 'bg-[#E4E4E7] text-[#0B0B0F]' 
                       : 'bg-[#151821] text-[#A1A1AA] border border-[#26272B] hover:text-[#FFFFFF] hover:border-[#7C5CFF]/50'
                 }`}
              >
                 {cat}
              </button>
           ))}
        </div>
      </div>

      {/* EVENT GRID */}
      {initialLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px]">
            {Array.from({ length: 9 }).map((_, i) => <EventCardSkeleton key={i} />)}
         </div>
      ) : events.length === 0 ? (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[40vh] flex flex-col items-center justify-center bg-[#151821] rounded-2xl border border-[#26272B]">
            <div className="bg-[#111217] w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-[#26272B]">
               <Search className="text-[#A1A1AA] w-8 h-8" />
            </div>
            <h3 className="text-h3 mb-2">No events found</h3>
            <p className="text-body text-center max-w-md">Try adjusting your filters or search criteria to find what you're looking for.</p>
            <button 
               onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedLocation('All'); }}
               className="mt-6 text-[#A78BFA] font-medium hover:text-[#7C5CFF] transition-colors"
            >
               Clear all filters
            </button>
         </motion.div>
      ) : (
         <>
            <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px]"
            >
               {events.map((event) => (
                  <motion.div key={event._id} variants={itemVariants}>
                     <EventCard event={event} onBook={(id) => navigate(`/event/${id}`)} />
                  </motion.div>
               ))}
               {loadingMore && Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </motion.div>
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-8">
               {loadingMore && <Loader2 className="animate-spin text-[#7C5CFF] w-6 h-6" />}
            </div>
         </>
      )}

    </div>
  );
};

export default EventList;
