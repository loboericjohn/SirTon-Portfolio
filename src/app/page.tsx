'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Coaching from "@/components/Coaching";
import Events from "@/components/Events";
import Resources from "@/components/Resources";
import Education from "@/components/Education";
import Awards from "@/components/Awards";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MouseFollower from "@/components/MouseFollower";

export default function Home() {
  return (
    <main className="bg-[#060504] relative">
      <div 
        className="fixed inset-0 z-0 opacity-[0.08] pointer-events-none mix-blend-luminosity" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="relative z-10">
        <MouseFollower />
        <Navbar />
        <Hero />
        <About />
        <Testimonials />
        <Coaching />
        <Events />
        <Resources />
        <Education />
        <Awards />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
