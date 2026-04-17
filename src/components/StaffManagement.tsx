import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, PlusCircle, Trash2, ShieldCheck, UserMinus, Shield, X } from 'lucide-react';


const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaffList(res.data.data);
    } catch (error) {
      console.error('Failed to fetch staff', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/staff', form);
      alert('Staff personnel authorized successfully');
      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchStaff();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to authorize personnel');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this personnel\'s access?')) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      fetchStaff();
    } catch (error) {
      console.error('Revocation failed:', error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="label-technical animate-pulse">Synchronizing Staff Data...</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header Stat Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="label-technical mb-2 text-primary/80">Active Personnel</div>
            <div className="text-4xl font-bold text-white tracking-tighter italic">{staffList.length}</div>
         </div>
         <div className="glass-card p-8 group overflow-hidden relative">
            <div className="label-technical mb-2 text-white/40">Access Type</div>
            <div className="text-2xl font-bold text-white tracking-tighter uppercase italic">Full Administrative</div>
         </div>
         <div className="glass-card p-8 flex items-center justify-center border-2 border-dashed border-white/5 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setShowModal(true)}>
            <div className="flex items-center gap-3">
               <PlusCircle className="w-6 h-6 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all" />
               <span className="label-technical text-white/40 group-hover:text-white transition-colors">Authorize New Agent</span>
            </div>
         </div>
      </div>

      {/* Table Section */}
      <div className="bms-card shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="px-10 py-10 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                 <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic leading-none">Access Control List</h3>
                <p className="label-technical text-white/20 mt-2">Verified Pulse Personnel</p>
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="bms-table">
            <thead>
              <tr>
                <th>IDENTIFIER</th>
                <th>COMMUNICATION</th>
                <th>CLEARANCE</th>
                <th className="text-right">COMMAND</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s: any) => (
                <tr key={s._id}>
                  <td>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-primary border border-white/5 group-hover:border-primary/50 transition-all">
                           {s.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-tight italic">{s.name}</span>
                     </div>
                  </td>
                  <td>
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{s.email}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <span className={`px-4 py-1.5 text-[9px] font-bold border uppercase tracking-widest rounded-lg bg-primary/5 border-primary/20 text-primary`}>
                        {s.role}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                     <button 
                        onClick={() => handleDeleteStaff(s._id)} 
                        className="p-3 glass text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all transform active:scale-95" 
                        title="Revoke Access"
                    >
                        <UserMinus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr><td colSpan={4} className="p-20 text-center label-technical text-white/10">Vault is Empty — No Personnel Records Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
           <div className="bg-[#0f1117] rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                    <h3 className="text-2xl font-bold text-white tracking-tighter uppercase italic">NEW AUTHORIZATION</h3>
                    <p className="label-technical text-primary mt-1">High-Privilege Access Key Generation</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white glass p-3 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <form onSubmit={handleCreateStaff} className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="label-technical pl-1">Personnel Full Name</label>
                    <input 
                       required 
                       className="bms-input px-6 py-4" 
                       placeholder="e.g. AGENT 007"
                       value={form.name} 
                       onChange={e => setForm({...form, name: e.target.value})} 
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="label-technical pl-1">Communication Channel</label>
                    <input 
                       type="email" 
                       required 
                       className="bms-input px-6 py-4" 
                       placeholder="personnel@pulse.com"
                       value={form.email} 
                       onChange={e => setForm({...form, email: e.target.value})} 
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="label-technical pl-1">Secret Access Key</label>
                    <input 
                       type="password" 
                       required 
                       className="bms-input px-6 py-4" 
                       placeholder="••••••••"
                       value={form.password} 
                       onChange={e => setForm({...form, password: e.target.value})} 
                    />
                 </div>
                 <div className="pt-8">
                    <button type="submit" className="w-full btn-primary h-16 uppercase">
                       <ShieldCheck className="w-5 h-5 mr-3" /> PROVISION SECURE ACCESS
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
