'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reveal } from './Reveal';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';

interface Event {
  id: string;
  event_date: string;
  title: string;
  description: string;
  image_url?: string; // Prepared for future pictures
}

const FALLBACK_EVENTS: Event[] = [
  {
    id: '1',
    event_date: 'APR 24',
    title: 'Success Summit 2024',
    description: 'Learn the exact scripts and strategies the top 1% are using to dominate the current market.',
  },
  {
    id: '2',
    event_date: 'MAY 15',
    title: 'Marketing Mastermind',
    description: 'A deep dive into social media, AI tools, and advanced advertising for real estate.',
  },
  {
    id: '3',
    event_date: 'JUN 10',
    title: 'Leadership Retreat',
    description: 'An exclusive gathering for team leaders to master the art of building a high-performance culture.',
  },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Supabase Warning:', error);
          setEvents(FALLBACK_EVENTS);
        } else if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      } catch (err) {
        console.warn('Fetch Warning:', err);
        setEvents(FALLBACK_EVENTS);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <section id="events" className="py-24 bg-[#060504] relative overflow-hidden">
      {/* Dark Architectural Background Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-luminosity" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <Reveal>
          <div className="text-center w-full mb-16 px-4 flex flex-col items-center">
            <h2 className="section-title !text-center !mx-auto inline-block">
              Live Training & Events
            </h2>
          </div>
        </Reveal>
        
        {loading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mr-3"></div>
            Loading events...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.1}>
                <div className="group relative bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gold/5 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full cursor-pointer">
                  
                  {/* Image Container */}
                  <div className="w-full h-56 bg-white/5 relative overflow-hidden flex-shrink-0">
                    <img 
                      src={event.image_url || '/images/Event.jpg'} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-gold px-4 py-2 rounded-xl text-sm font-bold shadow-lg border border-white/10">
                      {event.event_date}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gold transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-zinc-400 text-base leading-relaxed flex-grow">
                      {event.description}
                    </p>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        Explore Event <ArrowRight size={16} />
                      </span>
                    </div>
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
