import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Heart, Share2 } from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  earlyBirdPrice?: number;
  availableTickets: number;
  category?: string;
  flyerImage?: string;
}

interface EventCardProps {
  event: Event;
  onBook: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onBook }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  };

  const displayPrice = event.earlyBirdPrice ?? event.price;
  const d = formatDate(event.date);

  // Saved state per card (localStorage)
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    setIsSaved(saved.includes(event._id));
  }, [event._id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((id: string) => id !== event._id);
    } else {
      newSaved = [...saved, event._id];
    }
    localStorage.setItem('savedEvents', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/event/${event._id}`;
    if (navigator.share) {
      navigator.share({ title: event.name, text: `Check out ${event.name}`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'));
    }
  };

  // Dynamic status badges
  const getStatusBadge = () => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (event.availableTickets < 25) return { label: 'Few Left', color: 'bg-orange-500/90' };
    if (daysUntil <= 7) return { label: 'Trending', color: 'bg-emerald-500/90' };
    if (event.availableTickets > 100) return { label: 'Selling Fast', color: 'bg-rose-500/90' };
    return null;
  };
  const status = getStatusBadge();

  // Dynamic CTA
  const ctaText = event.availableTickets > 0 ? `Book Now • ₹${displayPrice}` : 'Sold Out';
  const ctaDisabled = event.availableTickets === 0;

  return (
    <div onClick={() => navigate(`/event/${event._id}`)} className="rounded-2xl p-4 space-y-3 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col h-full active:scale-[0.985] hover:border-[var(--primary)]/30 transition-all duration-200">
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-[var(--bg-surface)]">
        {event.flyerImage ? (
          <img src={event.flyerImage} alt={event.name} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Calendar className="w-8 h-8 text-white/20" /></div>
        )}
        <div className="absolute top-2 left-2 text-[10px] px-2.5 py-0.5 rounded-lg bg-black/70 dark:bg-black/70 backdrop-blur text-white/90 dark:text-white/90">{event.category || 'General'}</div>
        
        {status && (
          <div className={`absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-semibold text-white ${status.color}`}>
            {status.label}
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          <button 
            onClick={toggleSave} 
            className={`p-1.5 rounded-full backdrop-blur bg-black/50 hover:bg-black/70 transition-all ${isSaved ? 'text-red-500' : 'text-white'}`}
            aria-label={isSaved ? "Unsave event" : "Save event"}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleShare} 
            className="p-1.5 rounded-full backdrop-blur bg-black/50 hover:bg-black/70 text-white transition-all"
            aria-label="Share event"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1 px-0.5">
        <div className="text-lg font-semibold leading-tight line-clamp-2">{event.name}</div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <MapPin className="w-3.5 h-3.5" /> <span className="truncate">{event.venue}</span>
        </div>
        <div className="text-xs text-[var(--text-muted)]">{d.full}</div>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between px-0.5">
        <div>
          <div className="text-[10px] text-[var(--text-dim)]">FROM</div>
          <div className="text-[var(--primary)] font-bold text-xl tabular-nums">₹{displayPrice}</div>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); if (!ctaDisabled) navigate(`/event/${event._id}`); }} 
        disabled={ctaDisabled}
        className={`thumb-button w-full h-12 rounded-2xl text-sm font-semibold mt-1 transition-all active:scale-[0.96] ${ctaDisabled ? 'bg-[var(--bg-surface)] text-[var(--text-dim)] cursor-not-allowed' : 'btn-primary'}`}
      >
        {ctaText}
      </button>
    </div>
  );
};

export default React.memo(EventCard);
