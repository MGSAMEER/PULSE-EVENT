import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Calendar, MapPin, Loader2, Search } from 'lucide-react';
import api from '../services/api';

interface Booking {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    date: string;
    venue: string;
    flyerImage?: string;
  };
  ticketsCount: number;
  totalPrice: number;
  status: string;
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      const data = res.data?.data || [];
      const confirmed = data.filter((b: any) => b.status === 'confirmed');
      setBookings(confirmed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="app-container space-y-8 py-6 pb-24">
      <div>
        <h1 className="text-h1">My Tickets</h1>
        <p className="text-body">All your confirmed passes. Tap a ticket to view QR and download.</p>
      </div>

      {error && (
        <div className="premium-card p-4 text-red-400 text-sm">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="premium-card p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
          <div className="text-h3 mb-2">No tickets yet 🎟️</div>
          <p className="text-body mb-6 max-w-xs mx-auto">Book your first event and it will appear here instantly.</p>
          <button 
            onClick={() => navigate('/discover')} 
            className="thumb-button px-8 py-3 bg-[var(--primary)] text-white rounded-2xl font-semibold"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() => navigate(`/ticket/${booking._id}`)}
              className="premium-card p-5 space-y-3 cursor-pointer active:scale-[0.985] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-3">
                  <div className="font-semibold text-lg leading-tight line-clamp-2">{booking.eventId.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(booking.eventId.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{booking.eventId.venue}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--text-dim)]">QTY</div>
                  <div className="font-mono text-2xl font-semibold tabular-nums">{booking.ticketsCount}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <div className="font-semibold text-[var(--primary)]">₹{booking.totalPrice.toLocaleString()}</div>
                <div className="text-[10px] px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium">CONFIRMED</div>
              </div>

              <div className="text-xs text-[var(--text-muted)] text-center pt-1">Tap to view QR & download →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
