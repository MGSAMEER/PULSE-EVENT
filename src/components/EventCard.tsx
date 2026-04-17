import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

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
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const displayPrice = event.earlyBirdPrice ?? event.price;

  return (
    <div className="interactive-card flex flex-col h-full overflow-hidden">
      {/* Image Area */}
      <div 
        className="relative h-48 w-full bg-[#111217] overflow-hidden"
        onClick={() => navigate(`/event/${event._id}`)}
      >
        {event.flyerImage ? (
          <img
            src={event.flyerImage}
            alt={event.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#26272B]">
             <Calendar size={32} />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-[#111217]/90 backdrop-blur-md border border-[#26272B] px-3 py-1 rounded-[6px] text-xs font-semibold text-[#E4E4E7]">
           {event.category || 'General'}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
           <h3 
             className="text-[18px] font-semibold text-[#FFFFFF] line-clamp-1 mb-3 hover:text-[#A78BFA] transition-colors"
             onClick={() => navigate(`/event/${event._id}`)}
           >
             {event.name}
           </h3>
           
           <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                 <MapPin size={14} className="shrink-0 text-[#7C5CFF]" />
                 <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                 <Calendar size={14} className="shrink-0 text-[#7C5CFF]" />
                 <span>{formatDate(event.date)}</span>
              </div>
           </div>
        </div>

        {/* Footer Area */}
        <div className="mt-auto pt-4 border-t border-[#26272B] flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs text-[#A1A1AA]">Starting from</span>
              <span className="text-lg font-semibold text-[#FFFFFF]">₹{displayPrice.toLocaleString()}</span>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); navigate(`/event/${event._id}`); }}
             className="text-sm font-semibold text-[#FFFFFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-4 py-2 rounded-[8px] hover:bg-[#7C5CFF]/20 hover:border-[#7C5CFF]/40 transition-colors flex items-center gap-1"
           >
              View Event
              <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventCard);
