import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, Activity } from 'lucide-react';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initiate reset protocol');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-xl">
                <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest mb-10">
                    <ArrowLeft className="w-4 h-4" /> Back to Base
                </Link>

                {!submitted ? (
                    <>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">RECOVERY.</h2>
                        <p className="text-gray-400 text-sm mb-10 font-medium">Enter your identity mail to receive a reset transmission.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] pl-2">Mail Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="email" 
                                        required 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl text-center">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bms-btn py-5 flex items-center justify-center gap-3 shadow-2xl shadow-red-500/10"
                            >
                                {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {loading ? 'TRANSMITTING...' : 'INITIATE RECOVERY'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Email Sent.</h2>
                        <p className="text-gray-400 mt-4 leading-relaxed font-medium">If an account exists for <span className="text-white">{email}</span>, a recovery link has been sent to your inbox.</p>
                        <p className="text-gray-500 mt-6 text-xs italic">Check your spam folder if the email is not visible.</p>
                        
                        <div className="mt-10 pt-10 border-t border-white/5">
                            <Link to="/login" className="bms-btn py-5 w-full block text-center">Return to Login</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
