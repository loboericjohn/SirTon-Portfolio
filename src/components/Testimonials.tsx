'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reveal } from './Reveal';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  quote: string;
  author_image_url?: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author_name: 'John Doe',
    author_role: 'Founder & CEO',
    quote: 'This coaching transformed my entire business approach. Highly recommended.',
    author_image_url: '/images/default-avatar.jpg'
  },
  {
    id: '2',
    author_name: 'Jane Smith',
    author_role: 'Marketing Director',
    quote: 'The level of insight and clarity provided is simply unmatched.',
    author_image_url: '/images/default-avatar.jpg'
  }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('id', { ascending: false }); // Usually good to show newest first

        if (error) {
          console.warn('Supabase Warning:', error);
          setTestimonials(FALLBACK_TESTIMONIALS);
        } else if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch (err) {
        console.warn('Fetch Warning:', err);
        setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="ecosystem-section py-24 relative z-10">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal>
          <div className="text-center w-full mb-20 px-4">
            <h2 className="section-title !text-center !mx-auto inline-block">
              Client <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Transformations</em>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Real results from those who took the leap and leveled up their careers.
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mr-3"></div>
            Loading testimonials...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 pt-4 max-w-6xl mx-auto">
            {testimonials.map((testi, index) => (
              <Reveal key={testi.id} delay={index * 0.1}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:bg-white/10 hover:border-gold/30 transition-all duration-300 shadow-xl group h-full">
                  
                  {/* Portrait Visual */}
                  <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-gold/50 shadow-lg bg-[#0d0b08] isolate">
                    <img 
                      src={testi.author_image_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop'} 
                      alt={testi.author_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col text-center sm:text-left flex-grow">
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--white)', marginBottom: '4px', lineHeight: 1.2 }}>
                      {testi.author_name}
                    </h3>
                    <div style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
                      {testi.author_role}
                    </div>
                    <p className="text-zinc-400 italic text-[15px] leading-relaxed">
                      "{testi.quote}"
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
