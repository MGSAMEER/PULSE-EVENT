import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { CheckCircle, XCircle, RefreshCw, ShieldAlert, Info, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface ValidationResult {
  success: boolean;
  message?: string;
  booking?: {
    id: string;
    eventName: string;
    userName: string;
    ticketsCount: number;
  };
}

const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isScanning = useRef(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'STAFF') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = null;

    const startScanning = async () => {
      if (videoRef.current && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
        if (videoRef.current.srcObject) return;

        codeReader = new BrowserMultiFormatReader();
        try {
          setScanning(true);
          const decodePromise = codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current);
          const decodeResult = await decodePromise;

          if (isScanning.current) return;
          isScanning.current = true;

          const response = await api.post('/qr/validate', { qrData: decodeResult.getText() });
          
          if (codeReader) {
            codeReader.reset();
          }

          setResult({
            success: response.data.success,
            message: response.data.message,
            booking: response.data.data
          });
          setScanning(false);
        } catch (error: any) {
          console.error('Scan Error:', error);
          setScanning(false);
          isScanning.current = false;
          
          if (codeReader) {
            codeReader.reset();
          }

          if (error.response?.data?.message) {
             setErrorMessage(error.response.data.message);
             setResult({ success: false, message: error.response.data.message });
          } else {
             setCameraError(true);
          }
        }
      }
    };

    startScanning();

    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [user]);

  const resetScanner = () => {
    window.location.reload(); 
  };

  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] p-6 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-8 blur-[1px]" />
        <h2 className="text-4xl font-semibold text-white tracking-tighter uppercase mb-2 leading-none">Access Restricted.</h2>
        <p className="label-technical !text-[#8E8E93] mb-12">Insufficient Clearance Level</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary px-10"
        >
          RETURN TO HUB
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6">
           <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary w-5 h-5" />
              <span className="label-technical text-primary">Biometric Sync Interface</span>
           </div>
           <h1 className="text-5xl font-semibold text-white tracking-tighter uppercase">Entry <span className="text-[#8E8E93]">Validator.</span></h1>
        </div>

        <div className="glass-card p-0 border-white/5 overflow-hidden">
          {/* Operator Status */}
          <div className="bg-white/5 px-10 py-6 flex justify-between items-center border-b border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="label-technical !text-white text-[10px]">Active Terminal</span>
             </div>
             <div className="text-right">
                <p className="label-technical !text-[#8E8E93] text-[8px] mb-1">Operator ID</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight">{user?.name}</p>
             </div>
          </div>

          {!result ? (
            <div className="p-10 space-y-10">
              {/* Scan HUD */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-square border-4 border-white/5 shadow-2xl">
                <video
                   ref={videoRef}
                   className="w-full h-full object-cover grayscale opacity-60"
                   playsInline
                   muted
                />

                {/* Cyberpunk HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                   <div className="w-full h-full border border-white/10 rounded-[2rem] relative">
                      {/* Corners */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-2x"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-2x"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-2x"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-2x"></div>
                      
                      {/* Scanning Line */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/30 shadow-[0_0_15px_rgba(229,192,123,0.5)] animate-scan"></div>
                   </div>
                </div>

                {scanning && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <div className="glass px-6 py-3 rounded-full border-white/10 flex items-center gap-3">
                       <Activity className="w-4 h-4 text-primary animate-pulse" />
                       <span className="label-technical !text-white !bg-transparent text-[9px]">Capturing Payload...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 p-6 glass border-white/5 bg-white/[0.02]">
                  <Info className="text-primary w-5 h-5 shrink-0" />
                  <p className="text-[#8E8E93] text-xs font-medium leading-relaxed">
                     Point terminal at attendee credential. Ensure QR is centered within the focus brackets for signal lock.
                  </p>
              </div>

              {cameraError && (
                <div className="p-6 glass border-red-500/20 bg-red-500/5 rounded-3xl flex items-center gap-4">
                   <ShieldAlert className="w-8 h-8 text-red-500" />
                   <div className="space-y-1">
                     <p className="label-technical text-red-500">Hardware Error</p>
                     <p className="text-white/60 text-xs font-medium uppercase tracking-tight">Camera interface failed to initialize. Re-authenticate hardware access.</p>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center animate-in fade-in zoom-in-95 duration-500 space-y-12">
              {result.success ? (
                <div className="space-y-10">
                  <div className="w-24 h-24 glass border-green-500/20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-semibold text-white tracking-tighter uppercase leading-none">
                       {result.message?.includes('ALREADY') ? 'Signal Duplicate' : 'Clearance Hub'}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                       <span className={`label-technical ${result.message?.includes('ALREADY') ? 'text-amber-500' : 'text-green-500'}`}>
                          {result.message || 'Identity Confirmed'}
                       </span>
                    </div>
                  </div>
                  
                  <div className="glass p-10 rounded-[2.5rem] border-white/5 text-left space-y-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl"></div>
                     <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-1">
                           <p className="label-technical opacity-40">Subject Name</p>
                           <p className="text-xl font-semibold text-white uppercase tracking-tight truncate">{result.booking?.userName}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="label-technical opacity-40">Entitlements</p>
                           <p className="text-xl font-semibold text-white uppercase tracking-tight">{result.booking?.ticketsCount} Passes</p>
                        </div>
                        <div className="col-span-2 pt-8 border-t border-white/5 space-y-1">
                           <p className="label-technical opacity-40">Manifest</p>
                           <p className="text-2xl font-semibold text-primary uppercase tracking-tighter">{result.booking?.eventName}</p>
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="w-24 h-24 glass border-red-500/20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-semibold text-white tracking-tighter uppercase leading-none">Access Invalid</h3>
                    <p className="label-technical text-red-500">Validation Protocol Failed</p>
                  </div>
                  <div className="p-8 glass border-red-500/20 bg-red-500/5 rounded-[2rem]">
                     <p className="text-red-400 font-medium text-sm tracking-tight uppercase leading-relaxed">{result.message || errorMessage || "The provided credential could not be cross-referenced with the event ledger."}</p>
                  </div>
                </div>
              )}

              <button
                onClick={resetScanner}
                className="w-full h-18 btn-primary text-sm shadow-2xl"
              >
                <RefreshCw size={18} className="mr-2" />
                INITIATE NEXT SCAN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
