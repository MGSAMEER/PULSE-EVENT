import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Lock, ShieldCheck, Zap, Activity } from 'lucide-react';
import api from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Booking {
  _id: string;
  eventId: {
    name: string;
    date: string;
    venue: string;
  };
  ticketsCount: number;
  totalPrice: number;
  status: string;
}

const Payment: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Razorpay script is already in index.html, but safety check
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const res = await api.get(`/bookings/${bookingId}`); 
        setBooking(res.data.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!booking) return;

    setLoading(true);

    try {

      
      // Create Razorpay order
      const orderResponse = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });

      const { orderId, amount, currency, key } = orderResponse.data.data;


      const options = {
        key,
        amount,
        currency,
        name: 'PULSE EVENTS',
        description: `Tickets for ${booking.eventId.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {


            // Verify payment signature
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });



            // Step 3: Navigate to success
            navigate('/success', { 
              state: { 
                bookingData: {
                  bookingId: booking._id,
                  eventName: booking.eventId.name,
                  date: new Date(booking.eventId.date).toLocaleDateString(),
                  venue: booking.eventId.venue,
                  ticketsCount: booking.ticketsCount,
                  totalPrice: booking.totalPrice,
                  paymentId: response.razorpay_payment_id
                } 
              } 
            });
          } catch (verifyError: any) {

            const errorMsg = verifyError.response?.data?.message || 'Payment verification failed';
            alert(`❌ Verification Error: ${errorMsg}\n\nYour payment may have been processed. Please check your bank account and contact support if needed.`);
            // Still navigate but with error state
            navigate('/success', { 
              state: { 
                error: true,
                message: errorMsg,
                bookingId: booking._id
              } 
            });
          }
        },
        modal: {
          ondismiss: async () => {

            try {
              // Inform backend that this booking failed/cancelled to release inventory
              await api.post('/bookings/mark-failed', { bookingId: booking._id });

              alert('Payment cancelled or closed. Your booking reservation has been released.');
            } catch (err) {

              alert('Payment cancelled. Please try again from the event page.');
            }
          },
          backdropClose: false,
        },
        prefill: {
          name: 'Authorized User',
          email: 'user@pulse.events',
        },
        theme: {
          color: '#8B5CF6',
        },
      };


      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {

      const errorMsg = error.response?.data?.message || error.message || 'Failed to initiate payment';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Activity className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Loading payment details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-gray-300 uppercase">Booking Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-6 bms-btn px-10 py-4">Go to Events</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in">
       {/* Breadcrumbs */}
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-10 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Booking
       </button>

       <div className="bms-card p-0 overflow-hidden bg-white border-none shadow-2xl relative">
          {/* Header */}
          <div className="bg-gray-900 p-10 text-white">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">Secure Checkout</p>
                   <h2 className="text-3xl font-black tracking-tighter uppercase">CONFIRM PAYMENT</h2>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                   <Lock className="w-6 h-6 text-white" />
                </div>
             </div>
          </div>

          <div className="p-10 space-y-10">
             {/* Order Details */}
             <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-400">
                   <Zap className="w-5 h-5" />
                   <p className="text-[11px] font-black uppercase tracking-widest">Confirmation Summary</p>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Event</span>
                      <span className="text-sm font-black text-gray-900 uppercase">{booking.eventId.name}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Tickets</span>
                      <span className="text-sm font-black text-gray-900">{booking.ticketsCount} Ticket(s)</span>
                   </div>
                   <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Total</span>
                      <span className="text-3xl font-black text-[var(--primary)]">₹{booking.totalPrice.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             {/* Verification Banner */}
             <div className="flex gap-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-50 items-center">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider leading-relaxed">
                   Transaction secured by Razorpay with industry-standard encryption.
                </p>
             </div>

             {/* Action */}
             <button
               onClick={handlePayment}
               disabled={loading}
               className="w-full bms-btn py-6 text-lg font-black flex items-center justify-center gap-4 shadow-2xl shadow-red-100"
             >
                {loading ? <Activity className="animate-spin w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                {loading ? 'PROCESSING...' : `PAY NOW (₹${booking.totalPrice})`}
             </button>
             
             <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                By clicking, you agree to be charged the amount shown above.
             </p>
          </div>
       </div>
    </div>
  );
};

export default Payment;
