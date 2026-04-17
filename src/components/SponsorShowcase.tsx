import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Zap, Globe, Award } from 'lucide-react';

interface Sponsor {
  _id: string;
  companyName: string;
  bannerImage?: string;
  website?: string;
  sponsorshipLevel: 'gold' | 'silver' | 'bronze';
  description?: string;
}

interface SponsorShowcaseProps {
  sponsors: Sponsor[];
  isHero?: boolean;
}

const SponsorShowcase: React.FC<SponsorShowcaseProps> = ({ sponsors, isHero = false }) => {
  if (!sponsors || sponsors.length === 0) return null;

  const validSponsors = sponsors.filter(s => s !== null && s !== undefined);
  if (validSponsors.length === 0) return null;

  const platinumSponsors = validSponsors.filter(s => s.sponsorshipLevel === 'gold');
  const goldSponsors = validSponsors.filter(s => s.sponsorshipLevel === 'silver');
  const silverSponsors = validSponsors.filter(s => s.sponsorshipLevel === 'bronze');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isHero) {
    const mainSponsor = platinumSponsors[0] || validSponsors[0];
    if (!mainSponsor) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group w-full"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/0 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative glass rounded-[3rem] p-12 md:p-16 overflow-hidden min-h-[300px] flex items-center justify-center border-white/5">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full"></div>
          
          <div className="flex flex-col items-center gap-10 relative z-10 w-full text-center">
               <div className="relative">
                  <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full"></div>
                  <img 
                    src={mainSponsor.bannerImage || 'https://via.placeholder.com/200'} 
                    alt={mainSponsor.companyName}
                    className="h-24 md:h-36 w-auto object-contain relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
                  />
               </div>
            
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                     <Award className="w-4 h-4 text-primary" />
                     <span className="label-technical text-primary">Strategic Partner</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tighter uppercase leading-none">
                    {mainSponsor.companyName}
                  </h2>
                  {mainSponsor.website && (
                     <a 
                       href={mainSponsor.website} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors group/link"
                     >
                       Explore Mission <ExternalLink size={12} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                     </a>
                  )}
               </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-20 w-full">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-20"
      >
        {platinumSponsors.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <span className="label-technical text-primary">Tier I</span>
               <div className="h-px flex-grow bg-white/[0.05]"></div>
               <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.5em]">Platinum Ledger</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {platinumSponsors.map(sponsor => (
                <SponsorCard key={sponsor._id} sponsor={sponsor} size="large" />
              ))}
            </div>
          </div>
        )}

        {goldSponsors.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <span className="label-technical text-white/40">Tier II</span>
               <div className="h-px flex-grow bg-white/[0.05]"></div>
               <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.5em]">Gold Network</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {goldSponsors.map(sponsor => (
                <SponsorCard key={sponsor._id} sponsor={sponsor} size="medium" />
              ))}
            </div>
          </div>
        )}

        {silverSponsors.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <span className="label-technical text-white/20">Tier III</span>
               <div className="h-px flex-grow bg-white/[0.05]"></div>
               <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.5em]">Associate Band</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-8">
              {silverSponsors.map(sponsor => (
                <SponsorCard key={sponsor._id} sponsor={sponsor} size="small" />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Ticker */}
      <div className="py-20 border-t border-white/[0.02] overflow-hidden relative">
         <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10"></div>
         <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10"></div>
         
          <motion.div 
            animate={{ x: [0, -1500] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="flex gap-32 items-center whitespace-nowrap opacity-20 hover:opacity-100 transition-opacity duration-1000"
         >
            {[...validSponsors, ...validSponsors, ...validSponsors].map((sponsor, i) => (
               <div key={i} className="shrink-0 flex items-center gap-8 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <img src={sponsor?.bannerImage || 'https://via.placeholder.com/200'} alt="" className="h-10 md:h-14 w-auto object-contain" />
                  <span className="text-white font-bold text-[10px] uppercase tracking-[0.3em] opacity-30">{sponsor?.companyName || 'Anonymous Partner'}</span>
               </div>
            ))}
         </motion.div>
      </div>
    </div>
  );
};

const SponsorCard = ({ sponsor, size }: { sponsor: Sponsor, size: 'large' | 'medium' | 'small' }) => {
  return (
    <motion.a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      variants={{
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
      }}
      className="glass rounded-[2rem] p-10 flex flex-col items-center justify-center gap-8 group relative overflow-hidden h-full border-white/5 hover:border-primary/20 transition-all duration-500"
    >
       <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
       <img 
         src={sponsor.bannerImage || 'https://via.placeholder.com/200'} 
         alt={sponsor.companyName}
         className={`object-contain transition-all duration-700 grayscale group-hover:grayscale-0 ${
            size === 'large' ? 'h-24 md:h-32' : size === 'medium' ? 'h-16 md:h-24' : 'h-12 md:h-20'
         }`}
       />
       <div className="text-center space-y-2">
          <h4 className="text-white font-semibold uppercase text-sm tracking-tight">{sponsor.companyName}</h4>
          <p className="label-technical !text-primary !bg-primary/10 tracking-[0.2em]">Verified Entity</p>
       </div>
    </motion.a>
  );
};

export default SponsorShowcase;
