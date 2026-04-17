import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Send, CheckCircle, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const BecomeOrganizer: React.FC = () => {
    const [reason, setReason] = useState('');
    const [businessDetails, setBusinessDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/request-organizer', { reason, businessDetails });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-xl text-center"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Request Transmitted.</h2>
                    <p className="text-gray-400 mt-4 leading-relaxed">Your application for Organizer permissions is now under administrative review. You will be notified once the upgrade is authorized.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="mt-10 bms-btn py-5 w-full flex items-center justify-center gap-3"
                    >
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f1a] py-20 px-6">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest mb-10"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Safety
                </button>

                <div className="mb-12">
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-4">Elevate Your <br/><span className="text-[var(--primary)]">Identity.</span></h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">Application for Organizer Permissions</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">Objective / Reason</label>
                            <textarea 
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all h-32"
                                placeholder="Why do you want to host events on Pulse?"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">Business / Professional Intel</label>
                            <textarea 
                                required
                                value={businessDetails}
                                onChange={(e) => setBusinessDetails(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all h-32"
                                placeholder="Describe your organization or experience..."
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bms-btn py-6 text-base font-black shadow-2xl shadow-purple-500/20 flex items-center justify-center gap-4"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            Transmit Application
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomeOrganizer;
