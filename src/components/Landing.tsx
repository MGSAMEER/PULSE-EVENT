import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, ShieldCheck, Ticket, Users } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { BackgroundPaths } from './ui/background-paths';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0F] text-black dark:text-[#FFFFFF] overflow-x-hidden">
      
      <nav className="border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur sticky top-0 z-50">
        <div className="app-container h-16 flex justify-between items-center">
           <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-[#7C5CFF] text-white rounded-2xl flex items-center justify-center font-bold text-lg group-active:scale-95">P</div>
              <span className="text-xl font-bold tracking-[-0.025em]">PULSE</span>
           </div>
           <div className="flex gap-3 text-sm">
              <button onClick={() => navigate('/login')} className="hidden sm:block text-[var(--text-muted)] hover:text-white px-4">Log in</button>
              <button onClick={() => navigate('/register')} className="thumb-button px-5 bg-white text-black rounded-2xl text-sm font-semibold h-9">Get started</button>
           </div>
        </div>
      </nav>

      <BackgroundPaths 
        title="Discover extraordinary events near you."
        subtitle="Explore Events"
        onAction={() => navigate('/')} 
      />

      <section className="bg-[var(--bg-surface)] border-y border-[var(--border-color)] py-16">
         <div className="app-container">
            <div className="text-center mb-16">
               <h2 className="text-[32px] md:text-[40px] font-semibold mb-4 text-[#FFFFFF] tracking-tight">Engineered for Performance.</h2>
               <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">Built on modern infrastructure to provide an unmatched user experience.</p>
            </div>
            
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-100px" }}
               variants={stagger}
               className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
               {[
                 { icon: Search, title: "Lightning Discovery", desc: "Instantly filter thousands of events with optimized search." },
                 { icon: ShieldCheck, title: "Secure Architecture", desc: "Data and payments protected by industry encryption." },
                 { icon: Ticket, title: "Digital Vault", desc: "Store tickets safely, accessible from any device." }
               ].map((feat, i) => (
                 <motion.div key={i} variants={fadeUp} className="premium-card p-8">
                    <div className="w-11 h-11 bg-black/40 rounded-2xl flex items-center justify-center mb-5">
                       <feat.icon className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                    <p className="text-[var(--text-muted)] text-[15px] leading-relaxed">{feat.desc}</p>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* Quick Categories Setup */}
      <section className="py-24 max-w-[1200px] mx-auto px-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
               <h2 className="text-[32px] md:text-[40px] font-semibold mb-3 text-[#FFFFFF] tracking-tight">Explore Categories</h2>
               <p className="text-[#A1A1AA] text-[18px]">Every major experience, covered.</p>
            </div>
            <button onClick={() => navigate('/')} className="text-[#A78BFA] hover:text-[#7C5CFF] font-medium flex items-center gap-2 transition-colors">
               View all events <ArrowRight size={18} />
            </button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
               { name: "Music Concerts", icon: Search },
               { name: "Tech Conferences", icon: Users },
               { name: "Local Workshops", icon: MapPin },
               { name: "Art Exhibitions", icon: Calendar }
            ].map((cat, i) => (
               <div 
                  key={i} 
                  onClick={() => navigate('/')}
                  className="interactive-card p-8 flex flex-col items-center text-center gap-4 bg-[#151821]"
               >
                  <div className="w-12 h-12 rounded-full bg-[#111217] border border-[#26272B] text-[#A78BFA] flex items-center justify-center">
                     <cat.icon size={20} />
                  </div>
                  <span className="font-medium text-[16px] text-[#FFFFFF]">{cat.name}</span>
               </div>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111217] border-t border-[#26272B] py-12 mt-10">
         <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#7C5CFF] text-[#FFFFFF] rounded-md flex items-center justify-center font-bold">P</div>
               <span className="text-[18px] font-semibold text-[#FFFFFF] tracking-tight">PULSE</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[14px] font-medium text-[#A1A1AA]">
               <button className="hover:text-[#FFFFFF] transition-colors">About</button>
               <button className="hover:text-[#FFFFFF] transition-colors">Contact</button>
               <button className="hover:text-[#FFFFFF] transition-colors">Terms</button>
               <button className="hover:text-[#FFFFFF] transition-colors">Privacy</button>
            </div>
            <div className="text-[14px] text-[#6B7280]">
               &copy; {new Date().getFullYear()} Pulse Platforms.
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Landing;
