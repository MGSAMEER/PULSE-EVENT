import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Share2, Ticket, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import api from '../services/api';
import SponsorShowcase from './SponsorShowcase';

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [eventRes, sponsorsRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/sponsors/event/${eventId}`)
        ]);
        const eventData = eventRes.data?.data || eventRes.data;
        const sponsorsData = sponsorsRes.data?.data || sponsorsRes.data || [];
        setEvent(eventData);
        
        // Filter out orphaned associations or null sponsor IDs
        const fetchedSponsors = (Array.isArray(sponsorsData) ? sponsorsData : [])
          .map((es: any) => es.sponsorId)
          .filter(s => s !== null && s !== undefined);
          
        setSponsors(fetchedSponsors);
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [eventId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-6">
       <Loader2 className="animate-spin text-[#7C5CFF] w-12 h-12 mb-4" />
       <p className="text-[#A1A1AA] font-medium">Loading event details...</p>
    </div>
  );

  if (!event) return (
    <div className="min-h-[70vh] bg-[#0B0B0F] flex flex-col items-center justify-center p-6 text-center">
       <div className="w-16 h-16 bg-[#151821] border border-[#26272B] rounded-full flex items-center justify-center mb-6">
          <Calendar className="text-[#A1A1AA] w-8 h-8" />
       </div>
       <h2 className="text-h2 mb-4">Event not found</h2>
       <p className="text-body mb-8">This event may have been removed or doesn't exist.</p>
       <button onClick={() => navigate('/')} className="btn-primary">Browse Events</button>
    </div>
  );

  const displayPrice = event?.earlyBirdPrice || event?.price || 0;

  return (
    <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-32">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FFFFFF] mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to explore
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[28px]">
          
          {/* Left Column: Details (70%) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Hero Image in Left Col */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-[#151821] border border-[#26272B]">
               {event.flyerImage ? (
                  <img src={event.flyerImage} alt={event.name} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#26272B]">
                     <Calendar className="w-16 h-16 mb-4 opacity-50" />
                  </div>
               )}
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <span className="bg-[#151821] border border-[#26272B] text-[#E4E4E7] px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                     {event.category || 'General'}
                  </span>
                  <div className="flex gap-2">
                     <button className="p-2 bg-transparent border border-[#26272B] rounded-full text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#151821] transition-colors">
                        <Share2 size={18} />
                     </button>
                     <button className="p-2 bg-transparent border border-[#26272B] rounded-full text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#151821] hover:border-[#EF4444]/30 transition-colors">
                        <Heart size={18} />
                     </button>
                  </div>
               </div>

               <h1 className="text-h1">
                  {event.name}
               </h1>

               <div className="flex flex-col sm:flex-row gap-6 pt-2 pb-6 border-b border-[#26272B]">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-[10px] bg-[#151821] border border-[#26272B] flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-[#A78BFA]" />
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-[#FFFFFF]">Date</p>
                        <p className="text-sm text-[#A1A1AA]">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-[10px] bg-[#151821] border border-[#26272B] flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-[#A78BFA]" />
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-[#FFFFFF]">Location</p>
                        <p className="text-sm text-[#A1A1AA]">{event.venue}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-[24px] font-semibold text-[#FFFFFF]">About this Event</h3>
               <p className="text-[16px] text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
                  {event.description}
               </p>
               
               {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4">
                     {event.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-[#111217] border border-[#26272B] text-[#A1A1AA] text-sm rounded-full">
                           {tag}
                        </span>
                     ))}
                  </div>
               )}
            </div>

            <div className="pt-8">
               <SponsorShowcase sponsors={sponsors} />
            </div>

          </div>

          {/* Right Column: Checkout Card (30%) */}
          <div className="lg:col-span-4">
             <div className="clean-card p-6 sticky top-28 bg-[#151821]">
                <div className="text-left pb-6 border-b border-[#26272B]">
                   <p className="text-sm text-[#A1A1AA] mb-1">Price starts at</p>
                   <h3 className="text-[32px] font-semibold text-[#FFFFFF]">₹{displayPrice.toLocaleString()}</h3>
                   {event.earlyBirdPrice && (
                      <p className="text-sm text-[#A1A1AA] mt-1">
                         <span className="line-through mr-2">₹{event.price.toLocaleString()}</span>
                         <span className="text-[#7C5CFF] font-medium">Early Bird Discount</span>
                      </p>
                   )}
                </div>

                <div className="py-6 space-y-4">
                   <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Available Seats</span>
                      <span className="font-semibold text-[#FFFFFF]">{event.availableTickets}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Sales End</span>
                      <span className="font-semibold text-[#FFFFFF]">Before event</span>
                   </div>
                </div>

                <button 
                  onClick={() => navigate(`/book/${event._id}`)}
                  className="w-full btn-primary h-[48px] text-base"
                >
                   <Ticket size={18} />
                   Reserve Tickets
                </button>
             </div>
             
             {/* Small Sponsors section under booking if needed */}
             <div className="mt-8">
                <SponsorShowcase sponsors={sponsors} isHero={true} />
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
