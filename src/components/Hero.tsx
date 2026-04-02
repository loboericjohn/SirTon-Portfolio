'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from './Reveal';

export default function Hero() {
  const [scrolled, setScrolled] = useState(false);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroFrameRef.current || !heroImgRef.current) return;
    const { left, top, width, height } = heroFrameRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    heroImgRef.current.style.transform = `rotateY(${x * 20}deg) rotateX(${y * -20}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!heroImgRef.current) return;
    heroImgRef.current.style.transform = `rotateY(0deg) rotateX(0deg) scale(1)`;
  };

  return (
    <section id="home" className="hero">
      <div className="bg-blob"></div>
      <div className="container hero-layout">
        <div className="hero-content">
          <Reveal>
            <h1>Anthony Leuterio</h1>
          </Reveal>
          <Reveal>
            <p className="subtitle">The #1 Real Estate Coach in PH</p>
          </Reveal>
          <Reveal>
            <p className="mission">Helping real estate professionals build predictable, scalable businesses through proven coaching systems and digital innovation.</p>
          </Reveal>
          <Reveal>
            <div className="hero-btns">
              <Link href="#coaching" className="btn-primary">Find Your Coaching Program</Link>
            </div>
          </Reveal>
        </div>
        
        <Reveal width="fit-content">
          <div 
            ref={heroFrameRef}
            className="hero-image-frame"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="glow-ring"></div>
            <img 
              ref={heroImgRef}
              src="/images/Sirton.jpg" 
              alt="Anthony Leuterio" 
              className="hero-img-main" 
            />
          </div>
        </Reveal>

        <div className="hero-stats-container">
          <Reveal width="fit-content">
            <div className="stat-badge badge-1">
              <span>20k+</span>
              <small>Agents Coached</small>
            </div>
          </Reveal>
          <Reveal width="fit-content">
            <div className="stat-badge badge-3">
              <span>$5B+</span>
              <small>Sales Volume Influenced</small>
            </div>
          </Reveal>
          <Reveal width="fit-content">
            <div className="stat-badge badge-2">
              <span>#1</span>
              <small>Broker in PH</small>
            </div>
          </Reveal>
        </div>
      </div>
      <div className={`scroll-indicator ${scrolled ? 'hidden' : ''}`}>
        <Reveal width="fit-content">
          <span>Scroll</span>
          <ArrowDown size={24} />
        </Reveal>
      </div>
    </section>
  );
}
