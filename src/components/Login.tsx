import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FloatingPaths } from './ui/background-paths';
import {
  AtSignIcon,
  ChevronLeftIcon,
  LockIcon,
  Loader,
  AlertCircle
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      setErrors({});
      navigate('/');
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
        await googleLogin(credentialResponse.credential);
        setErrors({});
        navigate('/');
    } catch (err: any) {
        setErrors({ submit: err.response?.data?.message || 'Google synchronization failure.' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0B0B0F] md:overflow-hidden lg:grid lg:grid-cols-2 text-white">
      {/* Left Column (Hero Graphic) */}
      <div className="relative hidden h-full flex-col border-r border-[#26272B] p-10 lg:flex overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0B0F] to-transparent/50" />
        <div className="absolute inset-0 opacity-50 mix-blend-screen overflow-hidden">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        
        <div className="z-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold text-xl">
             P
          </div>
          <p className="text-2xl font-bold tracking-tight">PULSE</p>
        </div>
        
        <div className="z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-xl md:text-2xl leading-relaxed text-[#A1A1AA] font-normal">
              &ldquo;Pulse has completely transformed how we manage our events. The sheer speed of discovery and the native booking experience is unmatched.&rdquo;
            </p>
            <footer className="font-medium text-[#FFFFFF]">
              ~ Alex Chen <span className="text-[#A1A1AA] font-normal ml-2">Event Organizer</span>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Column (Auth Form) */}
      <div className="relative flex min-h-screen flex-col justify-center p-6 bg-[#0B0B0F]">
        {/* Glow Effects */}
        <div aria-hidden className="absolute inset-0 isolate contain-strict -z-10 opacity-30">
          <div className="absolute top-0 right-0 h-[40vh] w-[40vh] bg-[#7C5CFF]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        <Button 
           variant="ghost" 
           className="absolute top-6 left-6 text-[#A1A1AA] hover:text-[#FFFFFF] cursor-pointer" 
           onClick={() => navigate('/')}
        >
          <ChevronLeftIcon className='size-4 me-2' />
          Back to Explore
        </Button>

        <div className="mx-auto w-full max-w-[400px] space-y-6">
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-8 h-8 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold">P</div>
            <p className="text-xl font-bold tracking-tight">PULSE</p>
          </div>

          <div className="flex flex-col space-y-2">
            <h1 className="text-[32px] font-semibold tracking-tight text-[#FFFFFF]">
              Welcome Back
            </h1>
            <p className="text-[#A1A1AA] text-base">
              Enter your credentials to access your Pulse account.
            </p>
          </div>

          {errors.submit && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex gap-3 animate-fade-in items-center">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-4">
               <div>
                  <label className="text-sm font-medium text-[#E4E4E7] block mb-2">Email Address</label>
                  <div className="relative h-max">
                     <Input
                        placeholder="your.email@example.com"
                        className="ps-10"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                     <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-[#A1A1AA]">
                        <AtSignIcon className="size-4" />
                     </div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-[#E4E4E7]">Password</label>
                    <Link to="/forgot-password" className="text-sm text-[#A78BFA] hover:text-[#7C5CFF] transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative h-max">
                     <Input
                        placeholder="••••••••"
                        className="ps-10"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                     <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-[#A1A1AA]">
                        <LockIcon className="size-4" />
                     </div>
                  </div>
               </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
               {loading ? <Loader className="animate-spin size-5" /> : "Sign In"}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#26272B]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0B0B0F] px-2 text-[#A1A1AA]">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrors({ submit: 'Google authentication aborted' });
              }}
              theme="filled_black"
              shape="pill"
            />
          </div>

          <p className="text-[#A1A1AA] text-center text-sm pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#A78BFA] font-medium hover:text-[#7C5CFF] underline-offset-4 hover:underline">
               Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
