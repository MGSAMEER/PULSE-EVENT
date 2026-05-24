import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Ticket, Download, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TicketData {
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

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Use existing booking endpoint for single ticket
        const res = await api.get(`/bookings/${id}`);
        setTicket(res.data?.data || res.data);
      } catch (err: any) {
        setError('Could not load ticket details. It may have been cancelled or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleDownload = async () => {
    if (!ticket || !user) return;
    setDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 18;
      const contentWidth = pageWidth - (margin * 2);
      let y = 12;

      // ========== PREMIUM HEADER / BRANDING ==========
      doc.setFillColor(124, 92, 255);
      doc.rect(0, 0, pageWidth, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PULSE', margin, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('EVENTS', margin + 22, 14);

      doc.setFontSize(9);
      doc.text('OFFICIAL DIGITAL PASS', pageWidth - margin, 14, { align: 'right' });

      y = 30;

      // ========== EVENT BANNER ==========
      doc.setFillColor(20, 20, 28);
      doc.rect(margin, y, contentWidth, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(ticket.eventId.name.toUpperCase(), margin + 6, y + 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('LIVE EXPERIENCE', margin + 6, y + 20);

      doc.setDrawColor(124, 92, 255);
      doc.setLineWidth(1.5);
      doc.line(margin + 6, y + 25, margin + 60, y + 25);

      y += 38;

      // ========== CONFIRMATION BADGE ==========
      const badgeWidth = 48;
      const badgeX = (pageWidth - badgeWidth) / 2;
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(badgeX, y, badgeWidth, 7, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIRMED • VALID', pageWidth / 2, y + 5, { align: 'center' });

      y += 14;

      // ========== DASHED DIVIDER ==========
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      for (let i = margin; i < pageWidth - margin; i += 4) {
        doc.line(i, y, i + 2, y);
      }

      y += 10;

      // ========== EVENT DETAILS SECTION ==========
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('EVENT DETAILS', margin, y);
      y += 6;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(ticket.eventId.name, margin, y);
      y += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text('Date: ' + new Date(ticket.eventId.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }), margin, y);
      y += 6;

      doc.text('Venue: ' + ticket.eventId.venue, margin, y);
      y += 10;

      // ========== TICKET INFO SECTION ==========
      doc.setDrawColor(220, 220, 220);
      for (let i = margin; i < pageWidth - margin; i += 4) {
        doc.line(i, y, i + 2, y);
      }
      y += 7;

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR TICKET', margin, y);
      y += 6;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${ticket.ticketsCount} × General Admission`, margin, y);
      doc.text(`₹${ticket.totalPrice.toLocaleString()}`, pageWidth - margin, y, { align: 'right' });
      y += 8;

      // ========== ATTENDEE SECTION ==========
      doc.setDrawColor(220, 220, 220);
      for (let i = margin; i < pageWidth - margin; i += 4) {
        doc.line(i, y, i + 2, y);
      }
      y += 7;

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUED TO', margin, y);
      y += 6;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Name: ' + (user?.name || 'Guest'), margin, y);
      y += 6;

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Booking Reference: ' + ticket._id, margin, y);
      y += 12;

      // ========== QR SECTION (Real QR Code) ==========
      const qrSize = 42;
      const qrX = (pageWidth - qrSize) / 2;

      // Generate real QR code using dynamic import (avoids TS/CRA import issues)
      const QRCodeMod: any = await import('qrcode');
      const qrDataUrl = await QRCodeMod.toDataURL(ticket._id, {
        width: 300,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('SCAN TO ENTER', pageWidth / 2, y, { align: 'center' });
      y += 6;

      // QR frame
      doc.setDrawColor(124, 92, 255);
      doc.setLineWidth(1.2);
      doc.roundedRect(qrX - 4, y - 4, qrSize + 8, qrSize + 8, 3, 3, 'S');

      // Real QR image
      doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);

      y += qrSize + 14;

      // ========== FOOTER / BRANDING ==========
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('PULSE EVENTS  •  OFFICIAL DIGITAL PASS  •  NON-TRANSFERABLE', pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('© 2026 Pulse Events. All rights reserved. Present this pass at the venue.', pageWidth / 2, y, { align: 'center' });

      doc.save(`Pulse-Pass-${ticket.eventId.name.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container py-12 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="app-container py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm mb-6 text-[var(--text-muted)]">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="premium-card p-8 text-center">
          <Ticket className="mx-auto mb-4 text-[var(--text-dim)]" />
          <div className="text-h3 mb-2">Ticket not found</div>
          <p className="text-body mb-6">{error || 'This ticket may no longer be valid.'}</p>
          <button onClick={() => navigate('/bookings')} className="thumb-button px-6 py-3 bg-[var(--primary)] text-white rounded-2xl">Go to My Tickets</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container pb-24 py-6 max-w-md mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </button>

      <div className="premium-card p-6 space-y-6 text-center">
        <div>
          <div className="uppercase tracking-[3px] text-xs text-[var(--text-muted)]">YOUR DIGITAL PASS</div>
          <div className="text-2xl font-semibold tracking-tight mt-1">{ticket.eventId.name}</div>
        </div>

        <div className="space-y-1 text-sm text-[var(--text-muted)]">
          <div className="flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> {new Date(ticket.eventId.date).toLocaleDateString()}</div>
          <div className="flex items-center justify-center gap-2"><MapPin className="w-4 h-4" /> {ticket.eventId.venue}</div>
          <div>{ticket.ticketsCount} Ticket(s) • ₹{ticket.totalPrice}</div>
        </div>

        {/* QR CODE - CENTERED */}
        <div className="mt-4 flex justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-inner inline-block">
            <QRCodeSVG 
              value={ticket._id} 
              size={180} 
              level="H" 
              includeMargin 
              fgColor="#111217"
            />
          </div>
        </div>

        <div className="text-xs text-[var(--text-muted)]">Present this QR code at the venue entrance</div>

        <div className="pt-4 border-t border-white/10 text-left text-sm space-y-1">
          <div><span className="text-[var(--text-muted)]">Booking ID:</span> <span className="font-mono">{ticket._id}</span></div>
          <div><span className="text-[var(--text-muted)]">Status:</span> <span className="text-green-400 font-medium">{ticket.status.toUpperCase()}</span></div>
          <div><span className="text-[var(--text-muted)]">Issued to:</span> {user?.name}</div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="thumb-button w-full h-14 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center gap-3 text-base font-semibold active:scale-95 disabled:opacity-70"
      >
        {downloading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
        {downloading ? 'GENERATING PDF...' : 'DOWNLOAD TICKET (PDF)'}
      </button>

      <p className="text-center text-xs text-[var(--text-dim)]">This ticket is non-transferable and valid only for the listed event.</p>
    </div>
  );
};

export default TicketDetail;
