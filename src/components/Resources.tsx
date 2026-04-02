'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reveal } from './Reveal';

interface Resource {
  id: string;
  title: string;
  description: string;
  tag: string;
  caption: string;
  image_url: string;
  link: string;
}

const FALLBACK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'The Anthony Leuterio Show',
    description: "Interviews with the world's most successful entrepreneurs and agents sharing their billion-dollar secrets.",
    tag: 'Podcast',
    caption: 'New Episode Every Monday',
    image_url: '/images/update1.jpg',
    link: '#',
  },
  {
    id: '2',
    title: '2024 Real Estate Marketing Plan',
    description: 'Download the exact blueprint we use to help our clients generate 100+ leads per month.',
    tag: 'Free Guide',
    caption: 'Free PDF Download',
    image_url: '/images/update2.jpg',
    link: '#',
  },
];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Supabase Warning:', error);
          setResources(FALLBACK_RESOURCES);
        } else if (data && data.length > 0) {
          setResources(data);
        } else {
          setResources(FALLBACK_RESOURCES);
        }
      } catch (err) {
        console.warn('Fetch Warning:', err);
        setResources(FALLBACK_RESOURCES);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  return (
    <section id="resources" className="news section">
      <div className="container">
        <Reveal>
          <h2 className="section-title">Free Real Estate Resources</h2>
        </Reveal>
        
        {loading ? (
          <div className="loading-indicator">
            Connecting to database...
          </div>
        ) : (
          <div className="grid-2">
            {resources.map((resource) => (
              <Reveal key={resource.id}>
                <article className="card news-card">
                  <div className="news-image-container">
                    <img src={resource.image_url} alt={resource.title} className="news-image" />
                    <div className="news-caption">{resource.caption}</div>
                  </div>
                  <span className="tag">{resource.tag}</span>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <Link href={resource.link || '#'} className="btn-text">
                    Listen Now <ArrowRight size={18} />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
