import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Save, CheckCircle, Activity, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        setStatus('idle');
        try {
            const res = await api.post('/auth/reset-password', {
                email,
                token,
                newPassword: password
            });
            setStatus('success');
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Reset protocol failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-xl">
                {status === 'success' ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Override Success.</h2>
                        <p className="text-gray-400 mt-4 leading-relaxed">{message}</p>
                        <p className="text-[var(--primary)] mt-6 text-[10px] font-black uppercase tracking-[0.3em]">Redirecting to base...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">NEW SECRET.</h2>
                        <p className="text-gray-400 text-sm mb-10 font-medium">Establish a new security key for <span className="text-white italic">{email}</span></p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] pl-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="password" 
                                        required 
                                        minLength={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] pl-2">Confirm Secret</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="password" 
                                        required 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
                                        placeholder="Repeat secret..."
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">{message}</p>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bms-btn py-5 flex items-center justify-center gap-3 shadow-2xl shadow-red-500/10"
                            >
                                {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {loading ? 'UPDATING CORE...' : 'UPDATE PASSWORD'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
