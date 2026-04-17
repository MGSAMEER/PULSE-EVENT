import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Activity, PlusCircle, Tag, Download, Send, Megaphone, Trash2, X, Check, Edit3, Moon, Sun, RefreshCw } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement
} from 'chart.js';
import StaffManagement from './StaffManagement';
import SponsorManagement from './SponsorManagement';
import AreaChart1 from './ui/demo';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<any[]>([]);
  const [externalEvents, setExternalEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  // Event Form State
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    price: 0,
    category: 'General',
    tags: '',
    earlyBirdPrice: 0,
    earlyBirdDeadline: '',
    capacity: 100
  });

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    message: '',
    eventId: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const actionParam = params.get('action');

    if (tabParam) setActiveTab(tabParam.toLowerCase());
    if (actionParam === 'new') handleOpenCreateModal();
  }, [location.search]);



  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {


    if (authLoading) return;

    // Check admin/organizer role
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ORGANIZER')) {
      console.warn('⚠️ Unauthorized access detected - Redirecting');
      navigate('/');
      return;
    }

    // Fetch data for current tab
    fetchData();
  }, [activeTab, user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data.data);
      } else if (activeTab === 'events') {
        const res = await api.get('/events', { params: { limit: 100 } });
        const payload = res.data.data;
        setEvents(payload?.events ?? payload ?? []);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsersList(res.data.data);
      } else if (activeTab === 'sponsors') {
        const res = await api.get('/sponsors');
        setSponsors(res.data.data);
      } else if (activeTab === 'requests') {
        const res = await api.get('/auth/organizer-requests');
        setOrganizerRequests(res.data.data);
      } else if (activeTab === 'discovery' || activeTab === 'external events') {
        const res = await api.get('/external-events');
        setExternalEvents(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    if (!analytics) return;
    const doc = new (jsPDF as any)();

    doc.setFontSize(20);
    doc.text("EventHub Pulse Analytical Report", 14, 22);

    doc.setFontSize(12);
    doc.text(`Total Users: ${analytics.totalUsers || 0}`, 14, 32);
    doc.text(`Total Bookings: ${analytics.totalBookings || 0}`, 14, 40);
    doc.text(`Total Revenue: INR ${(analytics.totalRevenue || 0).toLocaleString()}`, 14, 48);
    const conversion = (analytics.totalUsers || 0) > 0 ? (((analytics.totalBookings || 0) / (analytics.totalUsers || 1)) * 100).toFixed(2) : '0';
    doc.text(`Conversion Rate: ${conversion}%`, 14, 56);

    const tableData = analytics.eventBookings?.map((e: any) => [
      e.eventName || 'Unnamed Event',
      e.bookingsCount || 0,
      `INR ${(e.revenue || 0).toLocaleString()}`
    ]) || [];

    autoTable(doc, {
      startY: 65,
      head: [['Event Name', 'Total Bookings', 'Total Revenue']],
      body: tableData,
    });

    doc.save('pulse_analytics_report.pdf');
  };

  const handleExport = () => {
    if (activeTab === 'analytics' || activeTab === 'overview') {
      if (!analytics) {
        alert('Analytics data is still syncing. Please wait.');
        return;
      }
      exportToPDF();
    } else {
      let data: any[] = [];
      let fileName = `pulse_${activeTab}_report`;

      switch (activeTab) {
        case 'users': data = usersList; break;
        case 'events': data = events; break;
        case 'sponsors': data = sponsors; break;
        case 'requests': data = organizerRequests; break;
        case 'discovery': data = externalEvents; break;
        default: data = [];
      }

      if (data.length === 0) {
        alert(`No data available in the ${activeTab} section to export.`);
        return;
      }

      // Cleanup data for Excel (removing MongoDB specific complex objects if needed)
      const cleanData = data.map(item => {
        const { _id, __v, ...rest } = item;
        // Transform nested objects for better Excel view
        const flattened: any = { ...rest };
        if (rest.userId && typeof rest.userId === 'object') {
           flattened.userName = rest.userId.name;
           flattened.userEmail = rest.userId.email;
           delete flattened.userId;
        }
        if (rest.eventId && typeof rest.eventId === 'object') {
          flattened.eventName = rest.eventId.name || rest.eventId.title;
          delete flattened.eventId;
       }
        return flattened;
      });

      exportToExcel(cleanData, fileName);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setFlyerFile(null);
    setFlyerPreview(null);
    setEventForm({
      name: '', description: '', date: '', venue: '', price: 0, category: 'General', tags: '', earlyBirdPrice: 0, earlyBirdDeadline: '', capacity: 100
    });
    setShowEventModal(true);
  };

  const handleOpenEditModal = (event: any) => {
    setEditingEventId(event._id);
    setFlyerFile(null);
    setFlyerPreview(event.flyerImage || null);
    setEventForm({
      name: event.name,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      venue: event.venue,
      price: event.price,
      category: event.category || 'General',
      tags: event.tags?.join(', ') || '',
      earlyBirdPrice: event.earlyBirdPrice || 0,
      earlyBirdDeadline: event.earlyBirdDeadline ? new Date(event.earlyBirdDeadline).toISOString().split('T')[0] : '',
      capacity: event.capacity
    });
    setShowEventModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerFile(file);
      setFlyerPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is irreversible.')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchData();
      alert('Event successfully deleted.');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete event');
    }
  };

  const handleExternalAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await api.patch(`/external-events/${id}/status`, { status: action });
      setExternalEvents(prev => prev.map(e => e._id === id ? { ...e, status: action, isApproved: action === 'approved' } : e));
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const deleteExternal = async (id: string) => {
    if (!window.confirm('Purge this external record?')) return;
    try {
      await api.delete(`/external-events/${id}`);
      setExternalEvents(prev => prev.filter(e => e._id !== id));
    } catch (error) {
      console.error('Purge failed:', error);

    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', eventForm.name);
      formData.append('description', eventForm.description);
      formData.append('venue', eventForm.venue);
      formData.append('category', eventForm.category);
      formData.append('price', String(eventForm.price));
      formData.append('capacity', String(eventForm.capacity));
      formData.append('date', eventForm.date ? new Date(eventForm.date).toISOString() : '');

      const tagsArray = eventForm.tags.split(',').map(tag => tag.trim()).filter(t => t !== '');
      formData.append('tags', JSON.stringify(tagsArray));

      if (eventForm.earlyBirdPrice && eventForm.earlyBirdPrice > 0) {
        formData.append('earlyBirdPrice', String(eventForm.earlyBirdPrice));
      }

      if (eventForm.earlyBirdDeadline) {
        formData.append('earlyBirdDeadline', new Date(eventForm.earlyBirdDeadline).toISOString());
      }

      if (flyerFile) {
        formData.append('flyerImage', flyerFile);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, formData, config);
      } else {
        await api.post('/events', formData, config);
      }

      setShowEventModal(false);
      fetchData();
      alert(editingEventId ? 'Event details updated.' : 'Event successfully created!');
    } catch (error: any) {
      console.error('Operation failed:', error);
      let message = error.response?.data?.message || 'Failed to save event';
      alert('System Error:\n' + message);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastLoading(true);
    try {
      await api.post('/admin/broadcast', broadcastForm);
      setShowBroadcastModal(false);
      setBroadcastForm({ subject: '', message: '', eventId: '' });
      alert('Broadcast transmission successful!');
    } catch (error) {
      console.error('Broadcast failed:', error);
      alert('Failed to send broadcast');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post('/auth/approve-organizer', { requestId, action });
      fetchData();
      alert(`Request has been ${action.toLowerCase()}`);
    } catch (error) {
      console.error('Action failed:', error);
      alert('Failed to update request status');
    }
  };

  const handleCleanup = async () => {
    const confirmed = window.confirm('Are you sure you want to sync all event data?\n\nThis will:\n1. Terminate stale PENDING bookings (15+ min)\n2. Restore event inventory\n3. Synchronize the system');
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      const res = await api.post('/bookings/cleanup');
      alert(`System Synchronized: ${res.data.message || 'Cleanup complete.'}`);
      fetchData();
    } catch (err) {
      console.error('Cleanup failed:', err);
      alert('Failed to execute cleanup protocol.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics && activeTab === 'overview') return <div className="min-h-[60vh] flex flex-col items-center justify-center text-[var(--primary)] font-black uppercase tracking-[0.4em]">Syncing Admin Dashboard...</div>;

  const chartData = {
    labels: analytics?.eventBookings?.map((e: any) => e.eventName.substring(0, 15) + '...') || [],
    datasets: [{
      label: 'Bookings',
      data: analytics?.eventBookings?.map((e: any) => e.bookingsCount) || [],
      backgroundColor: 'var(--primary)',
      borderRadius: 4,
    }],
  };



  return (
    <div className="bg-[#0A0A0B] min-h-screen pb-20 pt-16 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 glass rounded-full label-technical text-primary/80 border-primary/20">Administrative Console</div>
              <div className="h-px w-8 bg-white/10"></div>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl glass border-white/5 text-white/40 hover:text-primary transition-all group"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              Command <span className="text-white/30">Center.</span>
            </h1>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-6 py-4 glass rounded-2xl text-primary font-bold text-[10px] uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-black transition-all shadow-xl"
            >
              <Megaphone size={16} className="inline mr-2" />
              Pulse Announcement
            </button>

            <button
              onClick={handleExport}
              className="btn-outline px-6 py-4"
            >
              <Download className="w-4 h-4" />
              Export Intel
            </button>
            
            <button
              onClick={handleCleanup}
              className="px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              title="Synchronize Frequencies and Inventory"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Sync
            </button>
          </div>
        </div>

        <div className="flex gap-2 glass p-2 rounded-2xl w-fit border border-white/5 mb-16 overflow-x-auto no-scrollbar animate-slide-up">
          {[
            { id: 'overview', label: 'Metrics' },
            { id: 'events', label: 'Experiences' },
            { id: 'sponsors', label: 'Partners' },
            { id: 'users', label: 'Audience' },
            { id: 'staff', label: 'Agents' },
            { id: 'analytics', label: 'Reports' },
            { id: 'requests', label: 'Clearance' },
            { id: 'discovery', label: 'Global' }
          ]
            .filter(tab => user?.role === 'ADMIN' || ['overview', 'events', 'analytics'].includes(tab.id))
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl text-[10px] font-bold tracking-[0.1em] uppercase transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
        </div>



        {/* TAB CONTENT RENDERER */}
        <div className="animate-fade-in">
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'sponsors' && <SponsorManagement />}
          {activeTab === 'overview' && (
            <div className="space-y-16 animate-slide-up">
              <AreaChart1 analytics={analytics} />

              {/* Quick Actions & Search Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-5 space-y-4">
                  <label className="label-technical ml-1">Live Intelligence Search</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Users className="w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="SCAN TRANSACTIONS..." 
                      className="bms-input pl-12 h-14 bg-white/[0.03] border-white/5 hover:border-white/10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-3 pb-1">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mr-2">Frequencies:</span>
                  <button onClick={handleOpenCreateModal} className="flex items-center gap-3 glass hover:bg-white/10 px-5 py-3 rounded-xl border-white/5 text-[10px] font-bold uppercase tracking-widest group transition-all">
                    <PlusCircle size={14} className="text-primary group-hover:scale-110 transition-transform" /> 
                    Create Event
                  </button>
                  <button onClick={() => setActiveTab('requests')} className="flex items-center gap-3 glass hover:bg-white/10 px-5 py-3 rounded-xl border-white/5 text-[10px] font-bold uppercase tracking-widest group transition-all">
                    <Activity size={14} className="text-orange-500 group-hover:scale-110 transition-transform" /> 
                    Clearance
                  </button>
                  <button onClick={() => setActiveTab('sponsors')} className="flex items-center gap-3 glass hover:bg-white/10 px-5 py-3 rounded-xl border-white/5 text-[10px] font-bold uppercase tracking-widest group transition-all">
                    <Tag size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" /> 
                    Sponsors
                  </button>
                </div>
              </div>

              <div className="bms-card shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="px-10 py-10 border-b border-white/[0.03] flex flex-col md:flex-row justify-between items-center bg-white/[0.01] gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Recent Transactions</h3>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]"></div>
                      <span className="label-technical text-primary/80">Live Signal Output</span>
                    </div>
                  </div>

                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {['all', 'confirmed', 'pending', 'failed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setBookingFilter(status)}
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${bookingFilter === status
                          ? 'bg-white/10 text-white shadow-inner'
                          : 'text-white/30 hover:text-white/60'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="bms-table">
                    <thead>
                      <tr>
                        <th>Subscriber ID</th>
                        <th>Experience</th>
                        <th>Qty</th>
                        <th>Net Revenue</th>
                        <th>Status</th>
                        <th className="text-right">Intelligence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.recentBookings?.filter((b: any) => {
                        const matchesStatus = bookingFilter === 'all' || b.status.toLowerCase() === bookingFilter;
                        const matchesSearch = b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            b.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            b.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                        return matchesStatus && matchesSearch;
                      }).map((b: any) => (
                        <tr key={b._id}>
                          <td>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white tracking-tight italic uppercase">{b.userId?.name}</span>
                              <span className="text-[10px] text-white/30 font-medium mt-0.5">{b.userId?.email}</span>
                            </div>
                          </td>
                          <td>
                            <div className="max-w-[200px] truncate">
                              <span className="text-xs font-semibold text-white/80">{b.eventId?.name || b.eventId?.title}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-sm font-bold text-white">{b.ticketsCount}</span>
                          </td>
                          <td>
                            <span className="text-sm font-bold text-primary">₹{b.totalPrice}</span>
                          </td>
                          <td>
                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                             ${b.status === 'confirmed' ? 'bg-primary/10 text-primary border-primary/20' : ''}
                             ${b.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : ''}
                             ${b.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                            `}>
                              {b.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button className="px-4 py-2 glass hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">Audit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EVENTS TAB CONTAINS CRUD */}
          {activeTab === 'events' && (
            <div className="animate-slide-up space-y-8">
              <div className="flex justify-between items-end">
                 <div className="space-y-2">
                    <h3 className="section-title">Experience Catalog</h3>
                    <p className="label-technical">Modify and manage live event protocols</p>
                 </div>
                 <button
                   onClick={handleOpenCreateModal}
                   className="btn-primary"
                 >
                   <PlusCircle className="w-5 h-5" /> CREATE EXPERIENCE
                 </button>
              </div>

              <div className="bms-card shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="bms-table">
                    <thead>
                      <tr>
                        <th>Experience Detail</th>
                        <th>Deployment Signal</th>
                        <th>Capacity Pulse</th>
                        <th>Protocol Value</th>
                        <th className="text-right">Intelligence Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {events
                        .filter((e: any) => user?.role === 'ADMIN' || (e.organizer && e.organizer.toString() === user?.id))
                        .map((e: any) => (
                          <tr key={e._id}>
                            <td>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-white italic uppercase tracking-tighter mb-1">{e.name}</span>
                                <span className="text-[10px] text-primary/80 font-black uppercase tracking-[0.2em]">{e.category}</span>
                              </div>
                            </td>
                            <td>
                              <div className="text-xs font-bold text-white uppercase tracking-tight">
                                <div>{new Date(e.date).toLocaleDateString()}</div>
                                <div className="text-[10px] text-white/30 font-bold mt-1 uppercase tracking-widest">{e.venue}</div>
                              </div>
                            </td>
                            <td>
                              <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden mb-3">
                                <div className="bg-primary h-full shadow-[0_0_8px_var(--primary)]" style={{ width: `${(e.availableTickets / e.capacity) * 100}%` }}></div>
                              </div>
                              <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{e.availableTickets} / {e.capacity} Available</div>
                            </td>
                            <td>
                              <span className="text-sm font-black text-white italic">₹{e.price}</span>
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => handleOpenEditModal(e)}
                                    className="p-3 glass text-primary rounded-xl hover:bg-primary hover:text-black transition-all"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(e._id)}
                                    className="p-3 glass text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bms-card p-12 bg-[var(--bg-surface)]">
                <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.4em] mb-8">Event Distribution Map</h3>
                <div className="h-96"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
              </div>
              <div className="bms-card p-12 bg-[var(--bg-surface)]">
                <h3 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-8">Revenue Analytics Hub</h3>
                <div className="h-96">
                  <Line
                    data={{
                      labels: analytics?.eventBookings?.map((e: any) => e.eventName.substring(0, 10)) || [],
                      datasets: [{
                        label: 'Revenue',
                        data: analytics?.eventBookings?.map((e: any) => e.revenue) || [],
                        borderColor: '#10b981',
                        borderWidth: 5,
                        pointRadius: 6,
                        pointBackgroundColor: '#10b981',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.05)'
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="bms-card p-0 overflow-hidden">
              <div className="px-10 py-8 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center">
                <div>
                  <h3 className="font-black text-[var(--text-main)] text-sm uppercase tracking-[0.3em]">Discovery Center</h3>
                  <p className="text-[9px] text-[var(--text-muted)] font-black uppercase mt-1 tracking-widest">External event synchronization feed</p>
                </div>
                <button onClick={fetchData} className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.3em]">
                    <tr>
                      <th className="px-10 py-5">Event Detail</th>
                      <th className="px-10 py-5">Source</th>
                      <th className="px-10 py-5">Date</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5 text-right pr-14">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-surface)]">
                    {externalEvents.length > 0 ? externalEvents.map((e: any) => (
                      <tr key={e._id} className="hover:bg-[var(--bg-main)] transition-colors">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            {e.image && <img src={e.image} className="w-12 h-12 rounded-lg object-cover" />}
                            <div>
                              <div className="font-black text-sm text-[var(--text-main)] mb-1">{e.title}</div>
                              <div className="text-[10px] text-[var(--text-muted)] font-bold">{e.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-md font-black uppercase tracking-widest text-gray-500">{e.source}</span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-xs font-bold text-[var(--text-main)]">{new Date(e.date).toLocaleDateString()}</div>
                          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{e.location}, {e.city}</div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${e.status === 'approved' ? 'bg-green-100 text-green-600' :
                              e.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right pr-14">
                          <div className="flex justify-end gap-2">
                            {e.status !== 'approved' && (
                              <button onClick={() => handleExternalAction(e._id, 'approved')} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {e.status !== 'rejected' && (
                              <button onClick={() => handleExternalAction(e._id, 'rejected')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteExternal(e._id)} className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all" title="Purge Record">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-10 py-20 text-center text-gray-500 font-black uppercase tracking-widest">No discovery events found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bms-card p-0 overflow-hidden">
              <div className="px-10 py-8 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
                <h3 className="font-black text-[var(--text-main)] text-sm uppercase tracking-[0.3em]">Organizer Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.3em]">
                    <tr>
                      <th className="px-10 py-5">Applicant</th>
                      <th className="px-10 py-5">Request Reason</th>
                      <th className="px-10 py-5">Business Details</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5 text-right pr-14">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-surface)]">
                    {organizerRequests.length > 0 ? organizerRequests.map((r: any) => (
                      <tr key={r._id} className="hover:bg-[var(--bg-main)] transition-colors">
                        <td className="px-10 py-8">
                          <div className="font-black text-sm text-[var(--text-main)] mb-1">{r.userId?.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-bold">{r.userId?.email}</div>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-xs text-[var(--text-main)] font-medium max-w-xs">{r.reason}</p>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-xs text-[var(--text-muted)] font-medium max-w-xs italic">{r.businessDetails}</p>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                              r.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right pr-14">
                          {r.status === 'PENDING' ? (
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleApproveRequest(r._id, 'APPROVED')} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleApproveRequest(r._id, 'REJECTED')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PROCESSED</span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-10 py-20 text-center text-gray-500 font-black uppercase tracking-widest">No pending applications found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL SYSTEM (REUSABLE FOR CREATE/EDIT) */}
        {showEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
            <div className="bg-[#0f1117] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
              <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="section-title">
                    {editingEventId ? 'Sync Protocols' : 'Authorize Event'}
                  </h3>
                  <p className="label-technical text-primary/80">Experience Initialization Hub</p>
                </div>
                <button onClick={() => setShowEventModal(false)} className="text-white/40 hover:text-white p-3 glass rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveEvent} className="p-12 space-y-10 max-h-[75vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  {/* Media Section */}
                  <div className="col-span-2 space-y-4">
                    <label className="label-technical ml-1">Hero Asset (Flyer)</label>
                    <div className="relative group/upload h-[400px] rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 transition-all overflow-hidden flex items-center justify-center bg-white/[0.02]">
                      {flyerPreview ? (
                        <>
                          <img src={flyerPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <label className="cursor-pointer btn-primary">Change Asset</label>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-10">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PlusCircle className="w-10 h-10 text-primary" />
                          </div>
                          <label className="cursor-pointer block">
                            <span className="btn-primary">Provision Intelligence</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </label>
                          <p className="label-technical text-white/20 mt-6 lowercase tracking-normal">Recommended Dimensions: 1920x1080 (Cinematic)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} id="flyer-upload-main" />
                    </div>
                  </div>

                  {/* Basic Info Group */}
                  <div className="col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="w-2 h-2 bg-primary rounded-full"></span>
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Base Logic Parameters</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="col-span-2 md:col-span-1 space-y-3">
                        <label className="label-technical ml-1">Registry Name</label>
                        <input required className="bms-input" placeholder="Enter identification string..." value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
                      </div>
                      <div className="col-span-2 md:col-span-1 space-y-3">
                        <label className="label-technical ml-1">Classification</label>
                        <select className="bms-input" value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                          {['Music', 'Technology', 'Art', 'Business', 'General'].map(c => <option key={c} className="bg-[#0f1117]">{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling & Location Group */}
                  <div className="col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Spatio-Temporal Data</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                        <label className="label-technical ml-1">Chronicle Date</label>
                        <input type="date" required className="bms-input invert-selection" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                      </div>
                      <div className="space-y-3">
                        <label className="label-technical ml-1">Coordinate Venue</label>
                        <input required className="bms-input" placeholder="Physical location..." value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Financial Parameters */}
                  <div className="col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Economic Protocols</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                        <label className="label-technical ml-1">Standard Value (₹)</label>
                        <input type="number" required className="bms-input" value={eventForm.price} onChange={e => setEventForm({ ...eventForm, price: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-3">
                        <label className="label-technical ml-1">Human Capacity</label>
                        <input type="number" required className="bms-input" value={eventForm.capacity} onChange={e => setEventForm({ ...eventForm, capacity: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-3">
                        <label className="label-technical ml-1 text-emerald-500">Early Access Value</label>
                        <input type="number" className="bms-input border-emerald-500/20 bg-emerald-500/5 text-emerald-400 focus:border-emerald-500" placeholder="Early Bird..." value={eventForm.earlyBirdPrice} onChange={e => setEventForm({ ...eventForm, earlyBirdPrice: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-3">
                        <label className="label-technical ml-1 text-emerald-500">Incentive Deadline</label>
                        <input type="date" className="bms-input border-emerald-500/20 bg-emerald-500/5 text-emerald-400 focus:border-emerald-500" value={eventForm.earlyBirdDeadline} onChange={e => setEventForm({ ...eventForm, earlyBirdDeadline: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-3">
                    <label className="label-technical ml-1">Operational Description</label>
                    <textarea required className="bms-input min-h-[160px]" placeholder="Broadcasting narrative..." value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                  </div>

                  <div className="col-span-2 space-y-3">
                    <label className="label-technical ml-1">Meta Frequencies (Tags - CSV)</label>
                    <input className="bms-input bg-indigo-500/5 border-indigo-500/20" placeholder="e.g. tech, culture, futuristic..." value={eventForm.tags} onChange={e => setEventForm({ ...eventForm, tags: e.target.value })} />
                  </div>
                </div>

                <div className="pt-10 flex gap-6 sticky bottom-0 bg-[#0f1117] py-6 border-t border-white/5">
                  <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 btn-outline">Discard</button>
                  <button type="submit" className="flex-1 btn-primary text-base">
                    {editingEventId ? 'Synchronize Data' : 'Execute Creation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBroadcastModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
            <div className="bg-[#111217] rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">Platform Notification</h3>
                  <p className="label-technical text-primary mt-1">Global Broadcast Protocol</p>
                </div>
                <button onClick={() => setShowBroadcastModal(false)} className="text-white/40 hover:text-white p-2 glass rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBroadcast} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="label-technical ml-1">Transmission Subject</label>
                  <input required className="bms-input" placeholder="Enter subject header..." value={broadcastForm.subject} onChange={e => setBroadcastForm({ ...broadcastForm, subject: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <label className="label-technical ml-1">Target Frequency</label>
                  <select className="bms-input" value={broadcastForm.eventId} onChange={e => setBroadcastForm({ ...broadcastForm, eventId: e.target.value })}>
                    <option value="" className="bg-[#111217]">All Authorized Users</option>
                    {events.map(e => <option key={e._id} value={e._id} className="bg-[#111217]">{e.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="label-technical ml-1">Signal Content</label>
                  <textarea required className="bms-input py-4 h-40 leading-relaxed" placeholder="Enter broadcast message protocol..." value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} />
                </div>
                <div className="pt-6">
                  <button type="submit" disabled={broadcastLoading} className="w-full btn-primary h-16">
                    {broadcastLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5 mr-3" />}
                    {broadcastLoading ? 'TRANSMITTING...' : 'SEND BROADCAST SIGNAL'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendColor = "text-primary" }: any) => {
  return (
    <div className="glass-card p-8 h-[160px] flex flex-col justify-between group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <span className={`px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="label-technical text-white/40">
          {title}
        </p>
        <h2 className="text-3xl font-bold text-white mt-1 tracking-tighter">
          {value}
        </h2>
      </div>
    </div>
  );
};

export default AdminDashboard;
