'use client';

import { Facebook, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Anthony Leuterio. All rights reserved.</p>
        <div className="social-links">
          <Link href="#"><Facebook size={24} /></Link>
          <Link href="#"><Linkedin size={24} /></Link>
          <Link href="#"><Twitter size={24} /></Link>
        </div>
      </div>
    </footer>
  );
}
