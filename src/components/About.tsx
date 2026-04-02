'use client';

import { Reveal } from './Reveal';

export default function About() {
  return (
    <section id="about" className="about section">
      <div className="container">
        <Reveal>
          <h2 className="section-title">Who is Anthony Leuterio?</h2>
        </Reveal>
        <Reveal>
          <div className="moving-border-box">
            <div className="about-grid">
              <div className="about-image">
                <img src="/images/About-Serton.jpg" alt="Who is Anthony Leuterio" />
              </div>
              <div className="about-text">
                <p className="about-description">
                  Anthony Leuterio is a visionary leader, the founder of Filipino Homes, and the most influential real estate broker in the Philippines. With over 15 years of experience, he has transformed the industry by empowering thousands of agents through cutting-edge digital strategies and world-class coaching.
                </p>
                <div className="about-details">
                  <p>Known for his innovative approach to PropTech and his commitment to professionalizing the real estate industry, Anthony continues to set the benchmark for excellence in the ASEAN region.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
