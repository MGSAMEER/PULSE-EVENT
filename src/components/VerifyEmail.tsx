import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const VerifyEmail: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-xl text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-[var(--primary)] animate-spin mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Synchronizing Identity...</h2>
                        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">Verifying your electronic mail</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Verified.</h2>
                        <p className="text-gray-400 mt-4 leading-relaxed">{message}</p>
                        <Link 
                            to="/login"
                            className="mt-10 bms-btn py-5 w-full flex items-center justify-center gap-3"
                        >
                            PROCEED TO AUTH <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Verification Failed.</h2>
                        <p className="text-red-400/80 mt-4 font-medium">{message}</p>
                        <p className="text-gray-500 mt-2 text-sm italic">The verification link may be invalid or expired.</p>
                        <Link 
                            to="/register"
                            className="mt-10 block text-[var(--primary)] font-black uppercase text-[10px] tracking-[0.3em] hover:opacity-80 transition-all"
                        >
                            Re-initialize Registration
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
