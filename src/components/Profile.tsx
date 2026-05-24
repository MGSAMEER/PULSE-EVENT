import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail, Shield, ArrowLeft } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="app-container py-10">Please log in to view your profile.</div>;
  }

  return (
    <div className="app-container pb-24 py-6 max-w-md mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="premium-card p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-4xl font-bold mb-4">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="text-2xl font-semibold">{user.name}</div>
        <div className="text-[var(--text-muted)] mt-1 flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" /> {user.email}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Shield className="w-3 h-3" /> {user.role}
        </div>
      </div>

      <div className="premium-card p-6 space-y-4 text-sm">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3 text-[var(--text-muted)]"><User className="w-4 h-4" /> Account Type</div>
          <div className="font-medium">{user.role}</div>
        </div>
        <div className="border-t border-white/10 pt-4 text-[var(--text-muted)] text-xs leading-relaxed">
          Manage your profile, view past activity, and update preferences. More settings coming soon.
        </div>
      </div>

      <button 
        onClick={handleLogout} 
        className="thumb-button w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl active:scale-95"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      <div className="text-center text-[10px] text-[var(--text-dim)] pt-4">Pulse Events • Secure &amp; Private</div>
    </div>
  );
};

export default Profile;
