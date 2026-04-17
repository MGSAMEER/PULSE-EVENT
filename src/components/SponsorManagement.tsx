import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, PlusCircle, Trash2, Edit3, X, Link as LinkIcon, RefreshCw } from 'lucide-react';

const SponsorManagement: React.FC = () => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    companyName: '', 
    contactPerson: '', 
    email: '', 
    phone: '', 
    sponsorshipLevel: 'gold', 
    agreementTerms: '', 
    paymentAmount: 0, 
    bannerImage: '', 
    website: '' 
  });
  const [uploading, setUploading] = useState(false);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ sponsorId: '', eventId: '' });

  useEffect(() => {
    fetchSponsors();
    fetchEvents();
  }, []);

  const fetchSponsors = async () => {
    try {
      const res = await api.get('/sponsors');
      setSponsors(res.data.data);
    } catch (error) {
      console.error('Failed to fetch sponsors', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events', { params: { limit: 100 } });
      const payload = res.data.data;
      setEvents(payload?.events ?? payload ?? []);
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Invalid file type. Please upload JPG, PNG, or WebP.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {

      const res = await api.post('/sponsors/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      
      const imageUrl = res.data?.data?.url || res.data?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      setForm({ ...form, bannerImage: imageUrl });
      alert('✅ Logo uploaded successfully!');
    } catch (error: any) {

      const errorMsg = error.response?.data?.message || error.message || 'Cloud upload failed';
      alert(`❌ Upload Error: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDATION CHECKS

    
    // Check required fields
    const errors: string[] = [];
    
    if (!form.companyName?.trim()) {
      errors.push('❌ Company Name is required');
    }
    if (!form.contactPerson?.trim()) {
      errors.push('❌ Contact Person is required');
    }
    if (!form.email?.trim()) {
      errors.push('❌ Email is required');
    } else if (!form.email.includes('@')) {
      errors.push('❌ Invalid email format');
    }
    if (!form.phone?.trim()) {
      errors.push('❌ Phone is required');
    }
    if (form.paymentAmount <= 0) {
      errors.push('❌ Payment amount must be greater than 0');
    }
    if (!form.agreementTerms?.trim()) {
      errors.push('❌ Agreement Terms are required');
    }
    
    // Logo is required for new sponsors
    if (!editingId && !form.bannerImage) {
      errors.push('❌ Sponsor logo is REQUIRED. Please upload before proceeding');
    }
    
    // If validation errors exist, show all of them
    if (errors.length > 0) {

      alert('⚠️ VALIDATION FAILED:\n\n' + errors.join('\n'));
      return;
    }
    

    
    try {
      if (editingId) {
        await api.put(`/sponsors/${editingId}`, form);
      } else {
        await api.post('/sponsors', form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ companyName: '', contactPerson: '', email: '', phone: '', sponsorshipLevel: 'gold', agreementTerms: '', paymentAmount: 0, bannerImage: '', website: '' });
      fetchSponsors();
      alert(`✅ Sponsor entity successfully ${editingId ? 'reconfigured' : 'initialized'}`);
    } catch (error: any) {
      console.error('❌ Error creating/updating sponsor:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Neural link failure';
      alert(`❌ ERROR: ${errorMsg}`);
    }
  };

  const handleLinkSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sponsors/associate', linkForm);
      setShowLinkModal(false);
      alert('Event-Sponsor association established!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to establish association');
    }
  };

  const handleEdit = (sponsor: any) => {
    setEditingId(sponsor._id);
    setForm({ 
      companyName: sponsor.companyName, 
      contactPerson: sponsor.contactPerson, 
      email: sponsor.email, 
      phone: sponsor.phone, 
      sponsorshipLevel: sponsor.sponsorshipLevel, 
      agreementTerms: sponsor.agreementTerms, 
      paymentAmount: sponsor.paymentAmount, 
      bannerImage: sponsor.bannerImage || '', 
      website: sponsor.website || '' 
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
    try {
      await api.delete(`/sponsors/${id}`);
      fetchSponsors();
    } catch (error) {
      console.error('Termination failed:', error);
    }
  };

  if (loading) return <div className="text-center p-10 font-bold uppercase text-[var(--primary)]">Loading Sponsors...</div>;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-end">
         <div className="space-y-2">
            <h3 className="section-title">Partner Ecosystem</h3>
            <p className="label-technical">Manage corporate entity signals and associations</p>
         </div>
         <button 
           onClick={() => { setEditingId(null); setForm({ companyName: '', contactPerson: '', email: '', phone: '', sponsorshipLevel: 'gold', agreementTerms: '', paymentAmount: 0, bannerImage: '', website: '' }); setShowModal(true); }}
           className="btn-primary"
         >
           <PlusCircle className="w-5 h-5"/> INITIALIZE PARTNER
         </button>
      </div>

      <div className="bms-card shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="overflow-x-auto">
          <table className="bms-table">
            <thead>
              <tr>
                <th>Corporate Status</th>
                <th>Protocol Tier</th>
                <th>Financial Terms</th>
                <th className="text-right">Command Intel</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s: any) => (
                <tr key={s._id}>
                  <td>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-1 group-hover:border-primary/50 transition-all">
                           {s.bannerImage ? <img src={s.bannerImage} alt="Logo" className="w-full h-full object-contain" /> : <Tag className="w-5 h-5 text-white/20" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white tracking-tight italic uppercase">{s.companyName}</div>
                          <div className="text-[10px] text-white/40 font-semibold">{s.contactPerson}</div>
                        </div>
                     </div>
                  </td>
                  <td>
                    <span className={`px-4 py-1.5 text-[9px] font-bold border uppercase tracking-widest rounded-lg ${
                      s.sponsorshipLevel === 'gold' ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-500' :
                      s.sponsorshipLevel === 'silver' ? 'border-gray-500/20 bg-gray-500/5 text-gray-500' :
                      'border-orange-500/20 bg-orange-500/5 text-orange-500'
                    }`}>
                      {s.sponsorshipLevel}
                    </span>
                  </td>
                  <td>
                     <div className="text-sm font-bold text-white">₹{s.paymentAmount.toLocaleString()}</div>
                     <div className="text-[10px] text-primary/80 font-bold uppercase tracking-widest mt-1">{s.paymentStatus}</div>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-3">
                       <button onClick={() => { setLinkForm({ sponsorId: s._id, eventId: events[0]?._id }); setShowLinkModal(true); }} className="p-3 glass text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Link to Event"><LinkIcon className="w-4 h-4" /></button>
                       <button onClick={() => handleEdit(s)} className="p-3 glass text-primary rounded-xl hover:bg-primary hover:text-black transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                       <button onClick={() => handleDelete(s._id)} className="p-3 glass text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr><td colSpan={4} className="p-20 text-center label-technical text-white/10">No Partner Entities Detected in Sector</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
           <div className="bg-[#0f1117] rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
              <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                    <h3 className="section-title">{editingId ? 'Reconfigure' : 'Authorize'} Partner</h3>
                    <p className="label-technical text-primary mt-1">Corporate Logic Initialization</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white glass p-3 rounded-2xl transition-all"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleCreateOrUpdate} className="p-10 grid grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto no-scrollbar">
                 <div className="col-span-2 space-y-2">
                    <label className="label-technical ml-1">Company Identity</label>
                    <input required className="bms-input" placeholder="Legal entity name..." value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="label-technical ml-1">Contact Intel (Name)</label>
                    <input required className="bms-input" placeholder="Primary liaison..." value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="label-technical ml-1">Communication Hub (Email)</label>
                    <input type="email" required className="bms-input" placeholder="official@entity.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="label-technical ml-1">Signal Channel (Phone)</label>
                    <input required className="bms-input" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="label-technical ml-1">Global Frequency (Website)</label>
                    <input type="url" className="bms-input" placeholder="https://entity.io" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="label-technical ml-1 text-emerald-500">Capital Provision (₹)</label>
                    <input type="number" required className="bms-input border-emerald-500/20 bg-emerald-500/5 text-emerald-400 focus:border-emerald-500" value={form.paymentAmount} onChange={e => setForm({...form, paymentAmount: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                    <label className="label-technical ml-1">Sponsorship Protocol</label>
                    <select className="bms-input" value={form.sponsorshipLevel} onChange={e => setForm({...form, sponsorshipLevel: e.target.value})}>
                       <option value="gold" className="bg-[#0f1117]">Gold Tier</option>
                       <option value="silver" className="bg-[#0f1117]">Silver Tier</option>
                       <option value="bronze" className="bg-[#0f1117]">Bronze Tier</option>
                    </select>
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="label-technical ml-1">Agreement Parameters</label>
                    <textarea required className="bms-input min-h-[120px] py-4" placeholder="Draft terms and conditions..." value={form.agreementTerms} onChange={e => setForm({...form, agreementTerms: e.target.value})} />
                 </div>
                 <div className="col-span-2 space-y-4">
                    <label className="label-technical ml-1">
                      Corporate Brand ID (Logo) {!editingId && <span className="text-red-500">*</span>}
                    </label>
                    {!editingId && !form.bannerImage && (
                      <div className="text-[10px] text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 uppercase tracking-widest">
                        ⚠️ Logo injection required for protocol initialization
                      </div>
                    )}
                    <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                       <div className="w-24 h-24 bg-white/5 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-2">
                          {form.bannerImage ? <img src={form.bannerImage} alt="Preview" className="w-full h-full object-contain" /> : <Tag className="w-8 h-8 text-white/10" />}
                       </div>
                       <div className="flex-1">
                          <input type="file" onChange={handleFileUpload} className="hidden" id="logo-upload-box" accept="image/*" />
                          <label htmlFor="logo-upload-box" className="w-full glass border-white/5 text-white/40 py-4 rounded-2xl label-technical flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:text-white transition-all">
                             {uploading ? <RefreshCw className="w-4 h-4 animate-spin text-primary" /> : <PlusCircle className="w-4 h-4" />}
                             {form.bannerImage ? 'Replace Identity Asset' : 'Provision Identity Asset'}
                          </label>
                       </div>
                    </div>
                 </div>
                 <div className="col-span-2 pt-6">
                    <button 
                      type="submit" 
                      disabled={!editingId && !form.bannerImage}
                      className="w-full btn-primary h-16"
                    >
                      {editingId ? 'SYNCHRONIZE PARAMETERS' : `INITIALIZE CORPORATE PARTNER`}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
           <div className="bg-[#0f1117] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <h3 className="section-title text-xl">EVENT ASSOCIATION</h3>
                 <button onClick={() => setShowLinkModal(false)} className="text-white/40 hover:text-white glass p-2 rounded-xl transition-all"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleLinkSponsor} className="p-8 space-y-6">
                 <div className="space-y-3">
                    <label className="label-technical ml-1">Target Experience Protocol</label>
                    <select required className="bms-input" value={linkForm.eventId} onChange={e => setLinkForm({...linkForm, eventId: e.target.value})}>
                       <option value="" className="bg-[#0f1117]">Select target frequency...</option>
                       {events.map((ev) => (
                         <option key={ev._id} value={ev._id} className="bg-[#0f1117]">{ev.name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="pt-4">
                    <button type="submit" className="w-full btn-primary h-14">
                       ESTABLISH QUANTUM LINK
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SponsorManagement;
