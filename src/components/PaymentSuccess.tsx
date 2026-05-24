import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = (location.state as any) || {};

  useEffect(() => {
    if (!bookingData) {
      navigate('/');
    }
  }, [bookingData, navigate]);

  useEffect(() => {
    if (bookingData) {
      const t = setTimeout(() => navigate('/bookings'), 4200);
      return () => clearTimeout(t);
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  return (
    <div className="pb-24 flex items-center justify-center px-4 py-8 bg-[var(--bg-main)]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Celebration Icon */}
        <div className="relative mb-10 inline-block">
           <div className="absolute inset-0 bg-[var(--primary)] blur-[80px] opacity-20 scale-150 animate-pulse"></div>
            <div className="relative bg-[var(--bg-card)] w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border border-white/10 animate-bounce-short">
               <CheckCircle className="w-12 h-12 text-[var(--primary)]" />
            </div>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
           Booking Confirmed
        </h1>
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mb-12">
           Payment Completed Successfully
        </p>

        {/* Summary Card */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-50 mb-10 relative overflow-hidden text-left group hover:scale-[1.02] transition-transform duration-500">
           {/* Graphic Pattern */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 -mr-10 -mt-10 rounded-full group-hover:bg-[var(--primary)]/10 transition-colors"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                 <span className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">Digital Receipt</span>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-6 group-hover:text-[var(--primary)] transition-colors">
                 {bookingData.eventName}
              </h3>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{bookingData.date}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{bookingData.venue}</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm">
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Confirmed Slots</p>
                    <p className="text-lg font-black text-gray-900">{bookingData.ticketsCount} Tickets</p>
                 </div>
                 <div className="text-right">
                     <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Amount Paid</p>
                    <p className="text-lg font-black text-[var(--primary)]">₹{bookingData.totalPrice}</p>
                 </div>
              </div>
           </div>
        </div>

         {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/bookings')} className="thumb-button flex-1 h-12 rounded-2xl bg-[var(--primary)] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-95">View My Tickets</button>
            <button onClick={() => navigate('/discover')} className="thumb-button flex-1 h-12 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold flex items-center justify-center gap-2 active:scale-95">Explore More Events</button>
         </div>

         <div className="text-xs text-[var(--text-muted)]">You will be redirected to your tickets shortly...</div>

        {/* Support Note */}
        <p className="mt-12 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-10">
            A confirmation email has been sent to your registered email address. 
            Please have your QR code ready at the gate.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
