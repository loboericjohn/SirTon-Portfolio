'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MouseFollower from '@/components/MouseFollower';
import { Reveal } from '@/components/Reveal';

interface CoachingProgram {
  id: string;
  title: string;
  description: string;
  badge_text: string;
  image_url: string;
}

export default function CoachingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [program, setProgram] = useState<CoachingProgram | null>(null);
  const [otherPrograms, setOtherPrograms] = useState<CoachingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Primary Coaching Program
        const { data: primaryData, error: primaryError } = await supabase
          .from('coaching')
          .select('*')
          .eq('id', id)
          .single();

        if (primaryData) {
          setProgram(primaryData);
        }

        // Fetch Other Programs
        const { data: otherData, error: otherError } = await supabase
          .from('coaching')
          .select('*')
          .neq('id', id)
          .order('created_at', { ascending: true });

        if (otherData) {
          setOtherPrograms(otherData);
        }

      } catch (err) {
        console.warn('Coaching Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="bg-[#060504] min-h-screen flex items-center justify-center text-zinc-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mr-3"></div>
        Loading Program Portfolio...
      </main>
    );
  }

  if (!program) {
    return (
      <main className="bg-[#060504] min-h-screen flex flex-col items-center justify-center text-white text-center">
        <h1 className="text-4xl font-serif mb-4 text-gold">Program Not Found</h1>
        <p className="text-zinc-400 mb-8 max-w-md">The coaching program you are looking for has been moved or retired.</p>
        <Link href="/" className="big-btn">
          Return to Hub
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#060504] relative min-h-screen">
      <MouseFollower />
      <Navbar />

      {/* Hero Presentation */}
      <section className="relative min-h-[90vh] pb-20 overflow-hidden border-b border-white/5" style={{ paddingTop: '120px' }}>
        
        {/* Cinematic Image Background Layer */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-luminosity" 
          style={{
            backgroundImage: `url('${program.image_url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'blur(3px)'
          }}
        />

        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, #060504 5%, transparent 60%)' }}></div>
        <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(circle at center, transparent 30%, #060504 90%)' }}></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-20 flex flex-col md:flex-row items-center md:items-start gap-12 lg:gap-24">
          
          {/* Visual Frameline Group */}
          <div className="flex flex-col items-start gap-4">
            <Reveal delay={0.0}>
              <Link href="/#coaching" className="inline-flex items-center gap-2 text-zinc-500 hover:text-gold uppercase text-[10px] tracking-[4px] font-bold transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Overview
              </Link>
            </Reveal>

            {/* Main Visual Frame */}
            <Reveal delay={0.1}>
              <div className="w-full md:w-[400px] lg:w-[480px] aspect-[4/5] max-h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] shadow-gold/10 relative p-4 group">
              <div className="absolute inset-0 bg-[#141414]">
                <img 
                  src={program.image_url} 
                  alt={program.title} 
                  className="w-full h-full object-cover rounded-[1.2rem] group-hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
              <div className="absolute top-8 right-8 z-30">
                 <span className="uppercase tracking-[3px] text-xs font-bold px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-gold border border-white/10 shadow-lg">
                    {program.badge_text}
                 </span>
              </div>
            </div>
          </Reveal>
          </div>

          {/* Text Framework */}
          <div className="flex-1 max-w-xl text-center md:text-left mt-16 md:mt-32">
            <Reveal delay={0.3}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white leading-[1.05] mb-6">
                {program.title}
              </h1>
            </Reveal>

            <Reveal delay={0.4}>
              <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed mb-12 font-light border-l-2 border-gold pl-6 ml-1">
                {program.description}
              </p>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="mt-12">
                <Link href="#enroll" className="inline-flex items-center justify-center px-16 py-8 rounded-full font-black tracking-widest text-[16px] uppercase transition-all duration-300 group shadow-[0_20px_40px_rgba(220,38,38,0.2)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:scale-105" style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '3px solid #b91c1c' }}>
                  <span className="relative z-10 flex items-center justify-center gap-4 w-full leading-none">
                    Apply for the Program <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Other Ecosystem Options Grid */}
      {otherPrograms.length > 0 && (
        <section className="py-24 relative bg-[#060504]">
          <div className="container mx-auto px-4 lg:px-8">
            <Reveal>
              <div className="mb-16">
                <div className="text-zinc-500 uppercase text-xs font-bold tracking-[4px] mb-4">Ecosystem Architecture</div>
                <h2 className="text-3xl lg:text-4xl font-serif text-white">Explore Additional Coaching Tracks</h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPrograms.map((other, index) => (
                <Reveal key={other.id} delay={index * 0.1}>
                  <Link href={`/coaching/${other.id}`} className="group relative bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gold/5 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                    
                    <div className="w-full h-56 relative overflow-hidden flex-shrink-0">
                      <img 
                        src={other.image_url} 
                        alt={other.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-gold px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-white/10">
                        {other.badge_text}
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-gold transition-colors font-serif">
                        {other.title}
                      </h3>
                      <p className="text-zinc-500 text-sm leading-relaxed flex-grow line-clamp-3">
                        {other.description}
                      </p>
                      
                      <div className="mt-6 flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
                        <span className="text-xs uppercase tracking-[2px] font-bold">Investigate</span>
                        <ArrowRight size={16} className="group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
