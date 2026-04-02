'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reveal } from './Reveal';

interface Award {
  id: string;
  title: string;
  description: string;
  tag: string;
  image_url: string;
  link: string;
}

const FALLBACK_AWARDS: Award[] = [
  {
    id: '1',
    title: '#1 Real Estate Coach',
    description: 'Recognized as the premier real estate coach in the Philippines.',
    tag: 'Excellence',
    image_url: '/images/SirtonAwards.jpg',
    link: '#',
  },
  {
    id: '2',
    title: 'Top PropTech Innovator',
    description: 'Leading digital transformation in real estate technology.',
    tag: 'Innovation',
    image_url: '/images/SirtonAwards.jpg',
    link: '#',
  },
  {
    id: '3',
    title: 'Philanthropic Leader',
    description: 'Making a difference through community outreach and charity work.',
    tag: 'Community',
    image_url: '/images/SirtonAwards.jpg',
    link: '#',
  },
  {
    id: '4',
    title: 'Global Industry Icon',
    description: 'Influencing real estate practices across the ASEAN region.',
    tag: 'Global',
    image_url: '/images/SirtonAwards.jpg',
    link: '#',
  },
];

export default function Awards() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAwards() {
      try {
        const { data, error } = await supabase
          .from('awards')
          .select('*');

        if (error) {
          console.warn('Supabase Warning:', error);
          setAwards(FALLBACK_AWARDS);
        } else if (data && data.length > 0) {
          setAwards(data);
        } else {
          setAwards(FALLBACK_AWARDS);
        }
      } catch (err) {
        console.warn('Fetch Warning:', err);
        setAwards(FALLBACK_AWARDS);
      } finally {
        setLoading(false);
      }
    }

    fetchAwards();
  }, []);

  return (
    <section id="awards" className="licenses section">
      <div className="container">
        <Reveal>
          <h2 className="section-title">Awards & Recognition</h2>
        </Reveal>
        
        {loading ? (
          <div className="loading-indicator">
            Connecting to database...
          </div>
        ) : (
          <div className="staggered-grid">
            {awards.map((award, index) => (
              <Reveal key={award.id}>
                <div className={`card venture-card coach-card-${(index % 3) + 1}`}>
                  <img src={award.image_url} alt={award.title} className="card-bg-img" />
                  <span className="tag top-tag">{award.tag}</span>
                  <div className="card-content card-content-low">
                    <div className="text-group-low">
                      <h3>{award.title}</h3>
                      <p>{award.description}</p>
                    </div>
                    <Link href={award.link || '#'} className="btn-text">
                      Learn More <ArrowRight size={18} />
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
