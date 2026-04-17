import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertCircle, Ticket, Zap, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnimatedTicket } from './ui/ticket-confirmation-card';

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
  qrCode?: string;
  createdAt: string;
  currentSponsor?: any; 
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [eventSponsors, setEventSponsors] = useState<Record<string, any>>({});
  
  const ticketTemplateRef = useRef<HTMLDivElement>(null);
  const [activeTicket, setActiveTicket] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      const bookingsData = response.data.data.filter((b: any) => b.status === 'confirmed');
      setBookings(bookingsData);

      const eventIds = Array.from(new Set(bookingsData.map((b: any) => b.eventId._id)));
      const sponsorMap: Record<string, any> = {};
      
      await Promise.all(eventIds.map(async (id: any) => {
        try {
          const res = await api.get(`/sponsors/event/${id}`);
          const sponsorsData = res.data?.data || [];
          const sponsors = (Array.isArray(sponsorsData) ? sponsorsData : []).map((es: any) => es.sponsorId);
          const plat = sponsors.find((s: any) => s.sponsorshipLevel === 'gold');
          if (plat) sponsorMap[id] = plat;
        } catch (e) {
          console.error('Sponsor fetch error:', id, e);
        }
      }));
      
      setEventSponsors(sponsorMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownload = async (booking: Booking) => {
    if (downloadingId) return;
    setDownloadingId(booking._id);
    
    try {
      const sponsorsRes = await api.get(`/sponsors/event/${booking.eventId._id}`);
      const sponsorsData = sponsorsRes.data?.data || [];
      const sponsors = (Array.isArray(sponsorsData) ? sponsorsData : []).map((es: any) => es.sponsorId);
      const platSponsor = sponsors.find((s: any) => s.sponsorshipLevel === 'gold');
      
      setActiveTicket({ ...booking, currentSponsor: platSponsor });
      
      setTimeout(async () => {
        if (!ticketTemplateRef.current) {
          setDownloadingId(null);
          return;
        }

        const canvas = await html2canvas(ticketTemplateRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0A0A0B'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`Pulse_Ticket_${booking._id.slice(-6)}.pdf`);
        setDownloadingId(null);
        setActiveTicket(null);
      }, 500);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF ticket.');
      setDownloadingId(null);
      setActiveTicket(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="w-10 h-10 text-primary animate-spin mb-6" />
        <p className="label-technical text-primary">Synchronizing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-7xl mx-auto space-y-16">
      {/* --- HIDDEN TICKET TEMPLATE --- */}
      <div className="fixed -left-[3000px] top-0 overflow-hidden">
        {activeTicket && (
          <div 
            ref={ticketTemplateRef}
            className="w-[1000px] bg-[#0A0A0B] text-white p-20 font-sans relative"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="relative z-10 border border-white/10 rounded-[4rem] overflow-hidden bg-white/5 backdrop-blur-3xl p-1">
               <div className="relative h-80 overflow-hidden rounded-[3.8rem]">
                  {activeTicket.eventId.flyerImage ? (
                     <img src={activeTicket.eventId.flyerImage} alt="" className="w-full h-full object-cover grayscale-[0.2]" />
                  ) : (
                     <div className="w-full h-full bg-[#1A1A1B]"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent"></div>
                  <div className="absolute inset-x-16 bottom-12 flex justify-between items-end">
                     <div>
                        <div className="flex items-center gap-4 mb-4">
                           <Zap className="w-8 h-8 text-primary fill-primary" />
                           <span className="text-2xl font-bold uppercase tracking-[0.4em]">Pulse Vault</span>
                        </div>
                        <h2 className="text-6xl font-semibold tracking-tighter uppercase leading-none">Admission Pass</h2>
                     </div>
                     <div className="text-right space-y-2">
                        <p className="label-technical opacity-50">Secure Identifier</p>
                        <p className="text-3xl font-mono font-bold tracking-tighter text-primary">#{activeTicket._id.slice(-8).toUpperCase()}</p>
                     </div>
                  </div>
               </div>

               <div className="p-20 space-y-16">
                  <div className="flex justify-between items-start">
                     <div className="space-y-12">
                        <div className="space-y-4">
                           <p className="label-technical text-primary">Event Particulars</p>
                           <h3 className="text-5xl font-semibold leading-tight uppercase max-w-xl">{activeTicket.eventId.name}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-16">
                           <div className="space-y-3 border-l-2 border-primary/20 pl-6">
                              <p className="label-technical opacity-40">Scheduled Date</p>
                              <p className="text-2xl font-semibold">{new Date(activeTicket.eventId.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                           </div>
                           <div className="space-y-3 border-l-2 border-primary/20 pl-6">
                              <p className="label-technical opacity-40">Operational Venue</p>
                              <p className="text-2xl font-semibold">{activeTicket.eventId.venue}</p>
                           </div>
                           <div className="space-y-3 border-l-2 border-primary/20 pl-6">
                              <p className="label-technical opacity-40">Admission Count</p>
                              <p className="text-2xl font-semibold">{activeTicket.ticketsCount} Confirmed</p>
                           </div>
                           <div className="space-y-3 border-l-2 border-primary/20 pl-6">
                              <p className="label-technical opacity-40">Identity Verified</p>
                              <p className="text-2xl font-semibold uppercase">{user?.name}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center gap-8">
                        <div className="bg-white p-8 rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-primary/20">
                           <QRCodeSVG 
                            value={activeTicket.qrCode || ''} 
                            size={220} 
                            fgColor="#000"
                            level="H" 
                           />
                        </div>
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="text-primary w-5 h-5" />
                           <p className="label-technical text-primary tracking-[0.4em]">AUTHENTICATED SIGNAL</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-16 border-t border-white/5 flex justify-between items-center opacity-40">
                     <p className="text-xs font-medium max-w-md uppercase tracking-widest leading-relaxed">Present this encrypted baseline QR upon arrival. Unauthorized duplication strictly prohibited.</p>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xl">P</div>
                        <span className="text-xl font-bold uppercase tracking-widest">Pulse</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <Ticket className="text-primary w-5 h-5" />
              <span className="label-technical text-primary">Personnel Vault</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter uppercase leading-none">
              Your <br /> <span className="text-[#8E8E93]">Bookings.</span>
           </h1>
        </div>
        <div className="glass px-8 py-6 rounded-3xl border-white/5 flex flex-col items-end">
           <p className="label-technical !text-[#8E8E93] mb-1">Active Credentials</p>
           <p className="text-3xl font-semibold text-white tabular-nums">{bookings.length} Events</p>
        </div>
      </div>

      {error && (
        <div className="p-6 glass border-red-500/20 bg-red-500/5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-red-400 text-sm font-semibold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* --- GRID --- */}
      {bookings.length === 0 ? (
        <div className="glass rounded-[3rem] p-32 text-center border-white/5 space-y-10">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto blur-sm">
             <Ticket className="w-10 h-10 text-primary opacity-20" />
          </div>
          <div className="space-y-4">
             <h3 className="text-3xl font-semibold text-white uppercase tracking-tight">Vault is Empty</h3>
             <p className="text-[#8E8E93] font-medium max-w-sm mx-auto text-lg leading-relaxed">
               No active admission passes found in your pulse ledger.
             </p>
          </div>
          <button onClick={() => window.location.href='/discover'} className="btn-primary px-12 h-16">
            ESTABLISH CONNECTION
          </button>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start justify-center">
          {bookings.map((booking) => (
             <div key={booking._id} className="flex justify-center w-full h-max group relative">
                <AnimatedTicket
                  ticketId={booking._id.slice(-8).toUpperCase()}
                  eventName={booking.eventId.name}
                  amount={booking.totalPrice}
                  date={new Date(booking.eventId.date)}
                  cardHolder={user?.name || "Pulse Member"}
                  last4Digits="0123"
                  barcodeValue={booking._id} 
                  className="w-full h-max group-hover:-translate-y-2 transition-transform duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.3)] group-hover:shadow-[0_20px_40px_rgba(124,92,255,0.15)]"
               />
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
