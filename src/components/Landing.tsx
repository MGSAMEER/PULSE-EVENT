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
    <div className="min-h-screen bg-[#0B0B0F] text-[#FFFFFF] overflow-x-hidden">
      
      {/* Navbar (Static version for Landing) */}
      <nav className="border-b border-[#26272B] bg-[#111217]/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex justify-between items-center">
           <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold text-lg md:text-xl transition-transform group-hover:scale-105">
                 P
              </div>
              <span className="text-xl md:text-2xl font-bold tracking-tight text-[#FFFFFF]">PULSE</span>
           </div>
           <div className="flex gap-4 items-center">
              <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors">
                 Log in
              </button>
              <button 
                 onClick={() => navigate('/register')}
                 className="btn-primary h-[36px]"
              >
                 Sign Up
              </button>
           </div>
        </div>
      </nav>

      <BackgroundPaths 
        title="Discover extraordinary events near you."
        subtitle="Explore Events"
        onAction={() => navigate('/')} 
      />

      {/* Value Proposition / Features Grid */}
      <section className="bg-[#111217] border-y border-[#26272B] py-24">
         <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-[32px] md:text-[40px] font-semibold mb-4 text-[#FFFFFF] tracking-tight">Engineered for Performance.</h2>
               <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">Built on modern infrastructure to provide an unmatched user experience.</p>
            </div>
            
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-100px" }}
               variants={stagger}
               className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
               {[
                 {
                    icon: Search,
                    title: "Lightning Discovery",
                    desc: "Instantly filter thousands of events with our highly optimized search protocols."
                 },
                 {
                    icon: ShieldCheck,
                    title: "Secure Architecture",
                    desc: "Your data and transactions are protected by industry-leading encryption standards."
                 },
                 {
                    icon: Ticket,
                    title: "Digital Vault",
                    desc: "Store your tickets safely in the cloud, always accessible right from your device."
                 }
               ].map((feat, i) => (
                 <motion.div key={i} variants={fadeUp} className="clean-card p-10 flex flex-col items-start hover:-translate-y-1 hover:border-[#7C5CFF]/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-[#0B0B0F] border border-[#26272B] rounded-[12px] flex items-center justify-center mb-6">
                       <feat.icon className="w-6 h-6 text-[#A78BFA]" />
                    </div>
                    <h3 className="text-[20px] font-semibold mb-3 text-[#FFFFFF]">{feat.title}</h3>
                    <p className="text-[#A1A1AA] leading-relaxed text-[16px]">{feat.desc}</p>
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
