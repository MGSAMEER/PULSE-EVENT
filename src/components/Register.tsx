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
  AlertCircle,
  User
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (password.length < 6) newErrors.password = 'Security protocol requires at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Neural signatures do not match (passwords differ).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      setErrors({});
      navigate('/login');
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Registration failed. Please try again.' });
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
          <div className="w-10 h-10 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold text-xl ring-4 ring-[#7C5CFF]/20">
             P
          </div>
          <p className="text-2xl font-bold tracking-tight">PULSE</p>
        </div>
        
        <div className="z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-xl md:text-2xl leading-relaxed text-[#A1A1AA] font-normal italic">
              &ldquo;Pulse provides an incredibly low-friction way for our attendees to secure their spot. I wouldn't use anything else.&rdquo;
            </p>
            <footer className="font-medium text-[#FFFFFF] flex items-center gap-2">
              <div className="w-8 h-px bg-[#7C5CFF]"></div>
              Sarah Jenkins <span className="text-[#A1A1AA] font-normal ml-2 text-sm uppercase tracking-widest">Festival Director</span>
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

        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-8 h-8 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold">P</div>
            <p className="text-xl font-bold tracking-tight">PULSE</p>
          </div>

          <div className="flex flex-col space-y-3">
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-[#FFFFFF] leading-tight">
              Create Account
            </h1>
            <p className="text-[#A1A1AA] text-base">
              Join the ecosystem to start discovering experiences.
            </p>
          </div>

          {errors.submit && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex gap-3 animate-fade-in items-center">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
               <div>
                  <label className="text-sm font-medium text-[#E4E4E7] block mb-2">Full Name</label>
                  <div className="relative h-max">
                     <Input
                        placeholder="John Doe"
                        className="ps-10 h-12"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                     />
                     <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-[#A1A1AA]">
                        <User className="size-4" />
                     </div>
                  </div>
               </div>

               <div>
                  <label className="text-sm font-medium text-[#E4E4E7] block mb-2">Email Address</label>
                  <div className="relative h-max">
                     <Input
                        placeholder="your.email@example.com"
                        className="ps-10 h-12"
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

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#E4E4E7] block mb-2">Password</label>
                    <div className="relative h-max">
                       <Input
                          placeholder="••••••••"
                          className={`ps-10 h-12 ${errors.password ? 'border-red-500/50' : ''}`}
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
                  <div>
                    <label className="text-sm font-medium text-[#E4E4E7] block mb-2">Confirm</label>
                    <div className="relative h-max">
                       <Input
                          placeholder="••••••••"
                          className={`ps-10 h-12 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                       />
                       <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-[#A1A1AA]">
                          <LockIcon className="size-4" />
                       </div>
                    </div>
                  </div>
                  {(errors.password || errors.confirmPassword) && (
                    <p className="col-span-2 text-[10px] text-red-400/80 font-medium uppercase tracking-wider">
                      {errors.password || errors.confirmPassword}
                    </p>
                  )}
               </div>
            </div>

            <Button type="submit" className="w-full h-12 mt-4 btn-primary" disabled={loading}>
               {loading ? <Loader className="animate-spin size-5" /> : "Initialize Identity"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-[#0B0B0F] px-4 text-[#A1A1AA]">OR USE NEURAL SSO</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrors({ submit: 'Authentication terminal disconnected' });
              }}
              theme="filled_black"
              shape="pill"
              text="signup_with"
            />
          </div>

          <p className="text-[#A1A1AA] text-center text-sm pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#A78BFA] font-medium hover:text-[#7C5CFF] transition-all underline-offset-4 hover:underline">
               Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
