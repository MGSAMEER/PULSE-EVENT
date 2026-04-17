import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Ticket, Calendar, MapPin, ArrowLeft, Plus, Minus, Loader2, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const Booking: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [ticketsCount, setTicketsCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data?.data || res.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-6">
       <Loader2 className="animate-spin text-[#7C5CFF] w-12 h-12 mb-4" />
       <p className="text-[#A1A1AA] font-medium">Preparing checkout...</p>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0F]">
      <h2 className="text-h2 mb-2">Event Not Found</h2>
      <p className="text-body mb-6">This event might be unavailable.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary">
         Go Back
      </button>
    </div>
  );

  const unitPrice = event?.earlyBirdPrice || event?.price || 0;
  const totalPrice = unitPrice * ticketsCount;
  const maxTickets = Math.min(10, event?.availableTickets || 10);
  const platformFee = 0;

  const handleBooking = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/bookings', { eventId, ticketsCount });
      navigate(`/payment/${response.data?._id || response.data?.data?._id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FFFFFF] mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to details
        </button>

        <div className="mb-10 text-center md:text-left">
           <h1 className="text-[32px] font-semibold text-[#FFFFFF] tracking-tight mb-2">Checkout</h1>
           <p className="text-[#A1A1AA]">Review your order and securely complete your purchase.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Left Column: Event Summary */}
          <div className="md:col-span-7 space-y-6">
            
            <div className="clean-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
               <div className="w-full md:w-32 h-32 rounded-xl bg-[#0B0B0F] border border-[#26272B] overflow-hidden shrink-0">
                  {event.flyerImage ? (
                     <img src={event.flyerImage} alt={event.name} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-[#26272B]">
                        <Calendar size={32} />
                     </div>
                  )}
               </div>
               
               <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/20 px-2 py-1 rounded inline-block">
                     {event.category || 'General'}
                  </span>
                  <h3 className="text-[20px] font-semibold text-[#FFFFFF]">{event.name}</h3>
                  <div className="text-sm text-[#A1A1AA] space-y-1">
                     <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{event.venue}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar size={14} className="shrink-0" />
                        <span>{new Date(event.date).toDateString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="clean-card p-6 md:p-8 flex flex-col gap-6">
               <h4 className="text-[18px] font-semibold text-[#FFFFFF]">Select Tickets</h4>
               <div className="flex items-center justify-between pb-4 border-b border-[#26272B]">
                  <div className="flex flex-col">
                     <span className="font-medium text-[#FFFFFF]">General Admission</span>
                     <span className="text-sm text-[#A1A1AA]">₹{unitPrice.toLocaleString()} each</span>
                  </div>
                  
                  <div className="flex items-center bg-[#111217] border border-[#26272B] rounded-lg overflow-hidden">
                     <button 
                        onClick={() => setTicketsCount(Math.max(1, ticketsCount - 1))}
                        className="w-10 h-10 flex items-center justify-center text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#26272B] transition-colors border-none"
                     >
                        <Minus size={16} />
                     </button>
                     <span className="w-10 text-center font-medium text-[#FFFFFF]">{ticketsCount}</span>
                     <button 
                        onClick={() => setTicketsCount(Math.min(maxTickets, ticketsCount + 1))}
                        className="w-10 h-10 flex items-center justify-center text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#26272B] transition-colors border-none"
                     >
                        <Plus size={16} />
                     </button>
                  </div>
               </div>
               {maxTickets > 0 && ticketsCount === maxTickets && (
                  <p className="text-xs text-[#F59E0B] font-medium text-right">Max {maxTickets} tickets allowed per user.</p>
               )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5">
             <div className="clean-card p-6 md:p-8 sticky top-28 bg-[#151821]">
                <h3 className="text-[18px] font-semibold text-[#FFFFFF] mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-[#A1A1AA] text-sm">
                      <span>{ticketsCount} x General Admission</span>
                      <span>₹{(unitPrice * ticketsCount).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-[#A1A1AA] text-sm">
                      <span>Platform Fee</span>
                      <span>₹{platformFee.toLocaleString()}</span>
                   </div>
                </div>

                <div className="border-t border-[#26272B] pt-4 mb-8">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[16px] font-medium text-[#FFFFFF]">Total</span>
                      <span className="text-[24px] font-semibold text-[#FFFFFF]">₹{(totalPrice + platformFee).toLocaleString()}</span>
                   </div>
                   <p className="text-[12px] text-[#A1A1AA] text-right">Includes all applicable taxes</p>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={submitting}
                  className="w-full btn-primary h-[48px] text-base"
                >
                   {submitting ? (
                      <>
                         <Loader2 className="animate-spin" size={20} />
                         Processing...
                      </>
                   ) : (
                      <>
                         <Ticket size={20} />
                         Pay Now
                      </>
                   )}
                </button>
                
                <div className="mt-6 flex justify-center items-center gap-2 text-[#6B7280]">
                   <ShieldCheck size={16} className="text-[#A1A1AA]" />
                   <span className="text-[12px] font-medium">Secured by Pulse Global</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;
