'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import '../admin.css'; // Link the provided admin.css

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // On mount, fully clear any bad state / stuck refresh tokens from local storage
  useEffect(() => {
    const clearBadSession = async () => {
      await supabase.auth.signOut().catch(() => {});
    };
    clearBadSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-section" className="admin-container">
      <div className="login-box">
        <h2 style={{ marginBottom: '24px', textAlign: 'center', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '32px' }}>Admin Access</h2>
        <form id="loginForm" onSubmit={handleLogin} className="login-form">
          <input 
            type="email"  
            id="loginEmail" 
            placeholder="Admin Email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            id="loginPassword" 
            placeholder="Password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="submit" 
            className="big-btn" 
            id="loginBtn" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Authenticate Server'}
          </button>
          {error && (
            <div id="loginError" className="form-status" style={{ color: '#e74c3c', marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
