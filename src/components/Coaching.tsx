'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reveal } from './Reveal';

interface CoachingProgram {
  id: string;
  title: string;
  description: string;
  badge_text: string;
  image_url: string;
  link?: string;
}

const FALLBACK_PROGRAMS: CoachingProgram[] = [
  {
    id: '1',
    title: 'Core Coaching',
    description: 'Master lead generation and conversion systems.',
    badge_text: 'Fundamentals',
    image_url: '/images/coach-ton2.jpg',
  },
  {
    id: '2',
    title: 'Elite Coaching',
    description: 'Scale your team with advanced recruitment and AI tools.',
    badge_text: 'High Growth',
    image_url: '/images/coach-ton3.jpg',
  },
  {
    id: '3',
    title: 'Team & Brokerage',
    description: "Customized strategies for ASEAN's top brokerage owners.",
    badge_text: 'Leadership',
    image_url: '/images/coach-ton4.png',
  },
];

export default function Coaching() {
  const [programs, setPrograms] = useState<CoachingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const { data, error } = await supabase
          .from('coaching')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Supabase Warning:', error);
          setPrograms(FALLBACK_PROGRAMS);
        } else if (data && data.length > 0) {
          setPrograms(data);
        } else {
          setPrograms(FALLBACK_PROGRAMS);
        }
      } catch (err) {
        console.warn('Fetch Warning:', err);
        setPrograms(FALLBACK_PROGRAMS);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  return (
    <section id="coaching" className="ventures section">
      <div className="container">
        <Reveal>
          <h2 className="section-title">Real Estate Coaching Programs</h2>
        </Reveal>

        {loading ? (
          <div className="loading-indicator">
            Connecting to database...
          </div>
        ) : (
          <div className="staggered-grid">
            {programs.map((program, index) => (
              <Reveal key={program.id}>
                <div className={`card venture-card coach-card-${(index % 3) + 1}`}>
                  <img src={program.image_url} alt={program.title} className="card-bg-img" />
                  <span className="tag top-tag">{program.badge_text}</span>
                  <div className="card-content card-content-low">
                    <div className="text-group-low">
                      <h3>{program.title}</h3>
                      <p>{program.description}</p>
                    </div>
                    <Link href={program.link || `/coaching/${program.id}`} className="btn-text">
                      Explore Program <ArrowRight size={18} />
                    </Link>
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
