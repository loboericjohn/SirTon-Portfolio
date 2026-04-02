'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const { error: supabaseError } = await supabase
        .from('contacts')
        .insert([data]);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.warn('Error submitting form:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <div className="grid-2 reveal">
          <div className="contact-info">
            <h2 className="section-title">Let's Work Together</h2>
            <p>Feel free to reach out for speaking engagements, business inquiries, or partnerships.</p>
            <ul className="contact-list">
              <li><MapPin size={20} /> Cebu City, Philippines</li>
              <li><Phone size={20} /> +63 (032) 123-4567</li>
              <li><Mail size={20} /> info@anthony-leuterio.com</li>
            </ul>
          </div>
          <form id="contact-form" className="card" onSubmit={handleSubmit}>
            {success && <p className="form-success">Message sent successfully!</p>}
            {error && <p className="form-error">{error}</p>}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select id="subject" name="subject" disabled={loading}>
                <option value="general">General Inquiry</option>
                <option value="speaking">Speaking Engagement</option>
                <option value="property">Property Inquiry</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required disabled={loading}></textarea>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
