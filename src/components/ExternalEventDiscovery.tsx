import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { ExternalLink, Calendar, MapPin, Globe, Sparkles, ChevronRight, ChevronLeft, Info, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const ExternalEventDiscovery: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExternalEvents();
  }, []);

  const fetchExternalEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/external-events?approved=true`);
      const sorted = (res.data.data || []).sort((a: any, b: any) => {
        if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setEvents(sorted);
    } catch (error) {
      console.error('Failed to fetch global events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && events.length === 0) return null;

  const trendingEvents = events.slice(0, 3);
  const musicEvents = events.filter(e => e.category?.toLowerCase().includes('music') || e.source === 'Ticketmaster').slice(0, 8);
  const weekEvents = events.filter(e => {
    const diff = new Date(e.date).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).slice(0, 4);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#0A0A0B] py-32 px-6 overflow-hidden space-y-40">
      <div className="max-w-7xl mx-auto">
        
        {/* --- SECTION 1: TRENDING --- */}
        <div className="space-y-12">
          <div className="flex flex-col space-y-4">
             <div className="flex items-center gap-3">
                <Activity className="text-primary w-4 h-4" />
                <span className="label-technical text-primary">High Velocity Events</span>
             </div>
             <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight uppercase">Trending Now.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? [1,2,3].map(i => (
              <div key={i} className="aspect-[16/10] glass animate-pulse rounded-[2.5rem]" />
            )) : trendingEvents.map((event, i) => (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card border-none hover:border-primary/20 aspect-[16/10] relative rounded-[2.5rem] overflow-hidden"
              >
                <img src={event.image || "/fallback-event.jpg"} alt={event.title} className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/20 to-transparent" />
                
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-3 py-1 bg-primary text-black text-[8px] font-bold uppercase tracking-widest rounded-full">🔥 Top Rated</span>
                  <span className="px-3 py-1 glass text-[8px] font-bold text-white uppercase tracking-widest rounded-full border-white/10">{event.source}</span>
                </div>

                <div className="absolute bottom-10 left-10 right-10 space-y-3">
                  <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-none uppercase group-hover:text-primary transition-colors">{event.title}</h3>
                  <div className="flex items-center gap-6 text-[#8E8E93]">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{event.city}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                      <Calendar size={12} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: HORIZONTAL CAROUSEL --- */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="text-primary w-4 h-4" />
                <span className="label-technical text-primary">Global Network</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight uppercase">Concerts & Festivals.</h2>
            </div>
            <div className="flex gap-3">
               <button onClick={() => scroll('left')} className="p-4 glass rounded-2xl hover:bg-white/5 transition-all border-white/5"><ChevronLeft size={20} /></button>
               <button onClick={() => scroll('right')} className="p-4 glass rounded-2xl hover:bg-white/5 transition-all border-white/5"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto no-scrollbar pb-10"
          >
            {musicEvents.map((event) => (
              <div 
                key={event._id}
                className="flex-shrink-0 w-[350px] glass p-2 rounded-[2.5rem] border-white/5 hover:border-primary/10 transition-all group"
              >
                <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden">
                  <img src={event.image || "/fallback-event.jpg"} alt={event.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 glass text-[8px] font-bold text-white uppercase tracking-widest rounded-lg border-white/10">External Access</span>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                     <p className="label-technical !text-primary">{event.category || 'General'}</p>
                     <h4 className="text-xl font-semibold text-white tracking-tight line-clamp-2 leading-tight uppercase group-hover:text-primary transition-colors">{event.title}</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest flex items-center gap-2"><MapPin size={12} className="text-primary" />{event.city}</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                  </div>
                  <a
                    href={event.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center h-14 bg-white/5 hover:bg-primary hover:text-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-white/5"
                  >
                    Establish Connection <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 3: THIS WEEK --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center pt-20">
          <div className="space-y-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <Sparkles className="text-primary w-4 h-4" />
                 <span className="label-technical text-primary">Temporal Sync</span>
               </div>
               <h2 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter uppercase leading-[0.9]">
                  Happening <br />
                  <span className="text-primary italic font-light">This Week.</span>
               </h2>
            </div>
            <p className="text-[#8E8E93] text-lg font-medium max-w-sm leading-relaxed">
               Immediate opportunities for high-fidelity engagement. Valid for the next 168 hours.
            </p>
            <div className="flex items-center gap-3 text-white/20">
               <Info size={16} />
               <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Global Ledger Updated 2m ago</span>
            </div>
          </div>

          <div className="space-y-6">
            {weekEvents.map((event, i) => (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-8 p-6 glass rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="w-28 h-28 rounded-3xl overflow-hidden flex-shrink-0 border border-white/5">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="flex-grow pt-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-semibold text-white tracking-tight uppercase leading-none group-hover:text-primary transition-colors">{event.title}</h4>
                    <span className="label-technical text-primary !bg-primary/10 px-2 rounded">Active</span>
                  </div>
                  <div className="flex items-center gap-4 text-[#8E8E93]">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{event.location || event.city}</span>
                    <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">
                    Access Details <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ExternalEventDiscovery;
