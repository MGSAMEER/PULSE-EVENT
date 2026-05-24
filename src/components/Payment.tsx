import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Lock, ShieldCheck, Activity } from 'lucide-react';
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
    <div className="max-w-xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] mb-2 text-xs font-semibold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Booking
      </button>

      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold tracking-[2px] text-[var(--primary)]">SECURE CHECKOUT</div>
              <div className="text-2xl font-semibold tracking-tight mt-1">Confirm Payment</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl">
              <Lock className="w-5 h-5 text-[var(--primary)]" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="uppercase text-[10px] tracking-[2px] text-[var(--text-muted)]">Order Summary</div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Event</span>
                <span className="font-medium text-right">{booking.eventId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Tickets</span>
                <span>{booking.ticketsCount} ×</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Total Due</span>
                <span className="text-3xl font-semibold tabular-nums">₹{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[var(--primary)]" />
            <span>Payments processed securely by Razorpay. Your data is encrypted end-to-end.</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="thumb-button w-full h-14 rounded-2xl bg-[var(--primary)] text-white text-base font-semibold flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Activity className="animate-spin w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            {loading ? 'PROCESSING PAYMENT...' : `PAY ₹${booking.totalPrice.toLocaleString()} NOW`}
          </button>

          <p className="text-center text-[10px] text-[var(--text-dim)]">By proceeding you agree to the charge shown above.</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
