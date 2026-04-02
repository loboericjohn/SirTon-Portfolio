'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Coaching from "@/components/Coaching";
import Events from "@/components/Events";
import Resources from "@/components/Resources";
import Awards from "@/components/Awards";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MouseFollower from "@/components/MouseFollower";

export default function Home() {
  return (
    <main>
      <MouseFollower />
      <Navbar />
      <Hero />
      <About />
      <Coaching />
      <Events />
      <Resources />
      <Awards />
      <Contact />
      <Footer />
    </main>
  );
}
