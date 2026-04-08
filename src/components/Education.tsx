'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reveal } from './Reveal';

interface Credential {
  id: string;
  institution: string;
  title: string;
  organization: string;
  category: string;
}

export default function Education() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const { data, error } = await supabase
          .from('credentials')
          .select('*');

        if (!error && data && data.length > 0) {
          setCredentials(data);
        }
      } catch (err) {
        console.warn('Fetch Warning:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCredentials();
  }, []);

  return (
    <section id="education" className="py-32 relative bg-[#060504] overflow-hidden border-t border-white/5">
      {/* Ambient background light */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-gold/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <Reveal>
          <div className="text-center w-full mb-24 px-4">
            <h2 className="text-zinc-500 uppercase text-[10px] font-bold tracking-[6px] mb-6">Academic & Professional</h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white mb-6">Education & Credentials</h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Continuous learning and mastery mapped through formalized certifications and global degrees.
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mr-3"></div>
            Loading credentials...
          </div>
        ) : (
          <div className="max-w-5xl mx-auto relative px-2 sm:px-0">
            {/* Timeline center line - Hidden on Mobile */}
            <div className="absolute left-1/2 top-8 bottom-8 w-[2px] bg-white/5 hidden md:block rounded-full"></div>

            <div className="flex flex-col gap-16 lg:gap-24">
              {credentials.map((cred, index) => {
                const isEven = index % 2 === 0;
                return (
                  <Reveal key={cred.id} delay={0.2}>
                    <div className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>

                      {/* Center Timeline Glow Dot */}
                      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gold rounded-full shadow-[0_0_20px_#C9A84C] border-[4px] border-[#060504] z-20 transition-transform duration-500 hover:scale-150"></div>

                      {/* Academic Organization Icon Block */}
                      <div className={`w-full md:w-1/2 flex justify-center md:justify-${isEven ? 'start' : 'end'}`}>
                        {(() => {
                          const institutionName = (cred.institution || '').toUpperCase();
                          const categoryName = (cred.category || '').toUpperCase();
                          const combined = `${institutionName} ${categoryName}`;

                          let themeColor = 'border-gold';
                          let bgColor = 'bg-gold/10';
                          let textColor = 'text-gold';

                          if (combined.includes('HARVARD')) {
                            themeColor = 'border-[#a51c30]';
                            bgColor = 'bg-[#a51c30]/10';
                            textColor = 'text-[#a51c30]';
                          } else if (combined.includes('MIT')) {
                            themeColor = 'border-[#A31F34]'; // MIT Red
                            bgColor = 'bg-[#A31F34]/10';
                            textColor = 'text-[#A31F34]';
                          } else if (combined.includes('OXFORD')) {
                            themeColor = 'border-[#002147]'; // Oxford Blue
                            bgColor = 'bg-[#002147]/10';
                            textColor = 'text-[#002147]';
                          }

                          let logoSrc = '';
                          let logoAlt = '';

                          if (combined.includes('USJ')) {
                            logoSrc = '/images/USJRlogo.png';
                            logoAlt = 'USJR Logo';
                          } else if (combined.includes('HARVARD')) {
                            logoSrc = '/images/HARVARDlogo.png';
                            logoAlt = 'Harvard Logo';
                          } else if (combined.includes('MIT')) {
                            logoSrc = '/images/MITlogo.png';
                            logoAlt = 'MIT Logo';
                          } else if (combined.includes('OXFORD')) {
                            logoSrc = '/images/OXFORDlogo.png';
                            logoAlt = 'Oxford Logo';
                          } else if (combined.includes('PRC')) {
                            logoSrc = '/images/PRClogo.png';
                            logoAlt = 'PRC Logo';
                          }

                          return (
                            <div className={`w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden bg-white border ${themeColor} p-6 shadow-2xl relative flex items-center justify-center group hover:scale-105 transition-all duration-500`}>
                              <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                              {logoSrc ? (
                                <img
                                  src={logoSrc}
                                  alt={logoAlt}
                                  className="w-[90%] h-[90%] object-contain transition-all duration-500"
                                />
                              ) : (
                                <span className={`font-serif text-center font-bold tracking-widest uppercase ${textColor}`}>
                                  {cred.institution || cred.category || 'ACADEMY'}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Information Block */}
                      <div className={`w-full md:w-1/2 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                        <div className={`bg-white/5 border border-white/10 p-8 lg:p-10 rounded-3xl hover:bg-white/10 hover:border-gold/40 transition-all duration-500 shadow-xl relative overflow-hidden group w-full ${isEven ? 'md:ml-auto' : 'md:mr-auto'} flex flex-col items-center text-center`}>

                          <div className={`absolute top-0 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isEven ? 'left-0' : 'right-0'}`}></div>

                          <div className="text-gold font-bold tracking-[4px] text-[10px] uppercase mb-4 opacity-80">
                            {cred.institution}
                          </div>
                          <h3 className="text-2xl lg:text-3xl font-serif text-white mb-4 leading-[1.2] group-hover:text-gold transition-colors duration-300">
                            {cred.title}
                          </h3>
                          <p className="text-zinc-400 text-[15px] leading-relaxed font-light">
                            {cred.organization}
                          </p>
                        </div>
                      </div>

                    </div>
                  </Reveal>
                );
              })}

              {credentials.length === 0 && !loading && (
                <div className="text-center text-zinc-500 py-10 italic">
                  Awaiting credentials configuration.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
