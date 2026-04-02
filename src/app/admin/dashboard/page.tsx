'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import '../admin.css';

type Tab = 'tab-coaching' | 'tab-ecosystem' | 'tab-developers' | 'tab-news';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('tab-coaching');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading && !user) return <div className="admin-container" style={{ alignItems: 'center', justifyContent: 'center' }}>Connecting...</div>;

  return (
    <div id="dashboard-section" className="admin-container">
      <div className="dash-header">
        <div>
          <span className="overline">Control Panel</span>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span id="adminEmail" style={{ color: 'var(--gray)', fontSize: '14px' }}>{user.email}</span>
          <button id="logoutBtn" onClick={handleLogout} className="text-link" style={{ background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid var(--gray)', cursor: 'pointer', color: 'var(--gray)' }}>
            Disconnect &rarr;
          </button>
        </div>
      </div>
      
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'tab-coaching' ? 'active' : ''}`} onClick={() => setActiveTab('tab-coaching')}>Coaching Grid</button>
        <button className={`tab-btn ${activeTab === 'tab-ecosystem' ? 'active' : ''}`} onClick={() => setActiveTab('tab-ecosystem')}>Ecosystem Panel</button>
        <button className={`tab-btn ${activeTab === 'tab-developers' ? 'active' : ''}`} onClick={() => setActiveTab('tab-developers')}>Dev Partners</button>
        <button className={`tab-btn ${activeTab === 'tab-news' ? 'active' : ''}`} onClick={() => setActiveTab('tab-news')}>Media News</button>
      </div>

      {activeTab === 'tab-coaching' && <CoachingTab />}
      {activeTab === 'tab-ecosystem' && <EcosystemTab />}
      {activeTab === 'tab-developers' && <DevelopersTab />}
      {activeTab === 'tab-news' && <NewsTab />}

    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// COACHING TAB
// -------------------------------------------------------------------------------------------------
function CoachingTab() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '', badge_text: '', title: '', sort_order: 0, description: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    let { data: res, error } = await supabase.from('coaching').select('*').order('created_at', { ascending: false });
    if (error && (error.message?.includes('created_at') || error.code === '42703')) {
      const fallback = await supabase.from('coaching').select('*');
      res = fallback.data;
    }
    setData(res || []);
  };

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading Image...');
    try {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('portfolio_images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio_images').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      setStatus('Image Uploaded.');
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(editingId ? 'Updating...' : 'Publishing...');
    try {
      if (editingId) {
        const { error } = await supabase.from('coaching').update(formData).eq('id', editingId);
        if (error) throw error;
        setStatus('Success! Coaching Card Updated.');
      } else {
        const { error } = await supabase.from('coaching').insert([{ ...formData, id: crypto.randomUUID() }]);
        if (error) throw error;
        setStatus('Success! Coaching Card Published.');
      }
      setEditingId(null);
      setFormData({ image_url: '', badge_text: '', title: '', sort_order: 0, description: '' });
      (document.getElementById('c-image') as HTMLInputElement).value = '';
      fetchData();
    } catch (err: any) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setStatus('Editing mode active.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this card?')) {
      await supabase.from('coaching').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="tab-content" id="tab-coaching">
      <h3>{editingId ? 'Edit' : 'Add'} Coaching Card</h3>
      <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>Automatically uploads image and pushes layout to frontend grid.</p>
      
      <form id="form-coaching" onSubmit={handleSubmit} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
        <div className="form-row">
          <input type="file" id="c-image" accept="image/*" onChange={uploadFile} required={!formData.image_url} style={{ paddingTop: '12px' }} />
          <input type="text" id="c-badge" placeholder="Badge Text (e.g. Pillar 01)" required value={formData.badge_text || ''} onChange={e => setFormData({...formData, badge_text: e.target.value})} />
        </div>
        {(formData.image_url) && (
          <div style={{ marginBottom: '16px' }}>
            <img src={formData.image_url} alt="Preview" style={{ height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
          </div>
        )}
        <div className="form-row">
          <input type="text" id="c-title" placeholder="Title" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
          <input type="number" id="c-sort" placeholder="Sort Order" required value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
        </div>
        <textarea id="c-desc" placeholder="Card Description" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} style={{ height: '80px' }}></textarea>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="big-btn" disabled={loading}>{loading ? 'Processing...' : (editingId ? 'Update Coaching Card' : 'Publish Coaching Card')}</button>
          {editingId && (
            <button type="button" className="big-btn" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={() => { setEditingId(null); setFormData({ image_url: '', badge_text: '', title: '', sort_order: 0, description: '' }); setStatus(''); }}>Cancel Edit</button>
          )}
        </div>
        <div className="form-status" style={{ marginTop: '12px', color: 'var(--gold)', fontSize: '14px' }}>{status}</div>
      </form>

      <div className="manage-section">
        <div className="manage-header">
          <h4 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: '20px' }}>Manage Coaching Cards</h4>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Badge</th>
                <th>Sort Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.image_url ? <img src={item.image_url} alt="" /> : <span style={{color:'var(--gray)'}}>No img</span>}
                  </td>
                  <td style={{ color: 'var(--white)', fontWeight: 600 }}>{item.title}</td>
                  <td>{item.badge_text}</td>
                  <td>{item.sort_order}</td>
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      <button onClick={() => startEdit(item)} className="action-btn edit">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="action-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// ECOSYSTEM TAB
// -------------------------------------------------------------------------------------------------
function EcosystemTab() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ image_url: '', company_name: '', website_url: '', sort_order: 0, description: '' });

  useEffect(() => { fetchData() }, []);

  const fetchData = async () => {
    let { data: res, error } = await supabase.from('ecosystem').select('*').order('created_at', { ascending: false });
    if (error && (error.message?.includes('created_at') || error.code === '42703')) {
      const fallback = await supabase.from('ecosystem').select('*');
      res = fallback.data;
    }
    setData(res || []);
  };

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading Image...');
    try {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('portfolio_images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio_images').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      setStatus('Image Uploaded.');
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(editingId ? 'Updating...' : 'Publishing...');
    try {
      if (editingId) {
        await supabase.from('ecosystem').update(formData).eq('id', editingId);
        setStatus('Success! Ecosystem Updated.');
      } else {
        await supabase.from('ecosystem').insert([{ ...formData, id: crypto.randomUUID() }]);
        setStatus('Success! Ecosystem Published.');
      }
      setEditingId(null);
      setFormData({ image_url: '', company_name: '', website_url: '', sort_order: 0, description: '' });
      (document.getElementById('e-image') as HTMLInputElement).value = '';
      fetchData();
    } catch (err: any) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setStatus('Editing mode active.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this company?')) {
      await supabase.from('ecosystem').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="tab-content" id="tab-ecosystem">
      <h3>{editingId ? 'Edit' : 'Add'} Ecosystem Company</h3>
      <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>Appears in the horizontal snapping scroll section.</p>
      
      <form id="form-ecosystem" onSubmit={handleSubmit} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
        <div className="form-row">
          <input type="file" id="e-image" accept="image/*" onChange={uploadFile} required={!formData.image_url} style={{ paddingTop: '12px' }} />
          <input type="text" id="e-name" placeholder="Company Name" required value={formData.company_name || ''} onChange={e => setFormData({...formData, company_name: e.target.value})} />
        </div>
        {(formData.image_url) && (
          <div style={{ marginBottom: '16px' }}>
            <img src={formData.image_url} alt="Preview" style={{ height: '60px', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}
        <div className="form-row">
          <input type="url" id="e-url" placeholder="Website URL (https://...)" required value={formData.website_url || ''} onChange={e => setFormData({...formData, website_url: e.target.value})} />
          <input type="number" id="e-sort" placeholder="Sort Order" required value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
        </div>
        <textarea id="e-desc" placeholder="Company Description" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} style={{ height: '80px' }}></textarea>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="big-btn" disabled={loading}>{loading ? 'Processing...' : (editingId ? 'Update Ecosystem' : 'Publish Ecosystem')}</button>
          {editingId && (
            <button type="button" className="big-btn" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={() => { setEditingId(null); setFormData({ image_url: '', company_name: '', website_url: '', sort_order: 0, description: '' }); setStatus(''); }}>Cancel Edit</button>
          )}
        </div>
        <div className="form-status" style={{ marginTop: '12px', color: 'var(--gold)', fontSize: '14px' }}>{status}</div>
      </form>

      <div className="manage-section">
        <div className="manage-header">
          <h4 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: '20px' }}>Manage Ecosystem</h4>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Company Name</th>
                <th>Website URL</th>
                <th>Sort Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.image_url ? <img src={item.image_url} alt="" /> : <span style={{color:'var(--gray)'}}>No img</span>}</td>
                  <td style={{ color: 'var(--white)', fontWeight: 600 }}>{item.company_name}</td>
                  <td><a href={item.website_url} target="_blank" style={{color:'var(--gold)'}}>{item.website_url}</a></td>
                  <td>{item.sort_order}</td>
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      <button onClick={() => startEdit(item)} className="action-btn edit">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="action-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// DEVELOPERS TAB
// -------------------------------------------------------------------------------------------------
function DevelopersTab() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ image_url: '', developer_name: '', website_url: '', sort_order: 0 });

  useEffect(() => { fetchData() }, []);

  const fetchData = async () => {
    let { data: res, error } = await supabase.from('developers').select('*').order('created_at', { ascending: false });
    if (error && (error.message?.includes('created_at') || error.code === '42703')) {
      const fallback = await supabase.from('developers').select('*');
      res = fallback.data;
    }
    setData(res || []);
  };

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading Image...');
    try {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('portfolio_images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio_images').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      setStatus('Image Uploaded.');
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(editingId ? 'Updating...' : 'Publishing...');
    try {
      if (editingId) {
        await supabase.from('developers').update(formData).eq('id', editingId);
        setStatus('Success! Developer Updated.');
      } else {
        await supabase.from('developers').insert([{ ...formData, id: crypto.randomUUID() }]);
        setStatus('Success! Developer Published.');
      }
      setEditingId(null);
      setFormData({ image_url: '', developer_name: '', website_url: '', sort_order: 0 });
      (document.getElementById('d-image') as HTMLInputElement).value = '';
      fetchData();
    } catch (err: any) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setStatus('Editing mode active.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this developer?')) {
      await supabase.from('developers').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="tab-content" id="tab-developers">
      <h3>{editingId ? 'Edit' : 'Add'} Trusted Developer</h3>
      <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>Appears in the grid and marquee tracking strip.</p>
      
      <form id="form-developers" onSubmit={handleSubmit} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
        <div className="form-row">
          <input type="file" id="d-image" accept="image/*" onChange={uploadFile} required={!formData.image_url} style={{ paddingTop: '12px' }} />
          <input type="text" id="d-name" placeholder="Developer Name" required value={formData.developer_name || ''} onChange={e => setFormData({...formData, developer_name: e.target.value})} />
        </div>
        {(formData.image_url) && (
          <div style={{ marginBottom: '16px' }}>
            <img src={formData.image_url} alt="Preview" style={{ height: '60px', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}
        <div className="form-row">
          <input type="url" id="d-url" placeholder="Website URL (https://...)" required value={formData.website_url || ''} onChange={e => setFormData({...formData, website_url: e.target.value})} />
          <input type="number" id="d-sort" placeholder="Sort Order" required value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="big-btn" disabled={loading}>{loading ? 'Processing...' : (editingId ? 'Update Developer' : 'Publish Developer')}</button>
          {editingId && (
            <button type="button" className="big-btn" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={() => { setEditingId(null); setFormData({ image_url: '', developer_name: '', website_url: '', sort_order: 0 }); setStatus(''); }}>Cancel Edit</button>
          )}
        </div>
        <div className="form-status" style={{ marginTop: '12px', color: 'var(--gold)', fontSize: '14px' }}>{status}</div>
      </form>

      <div className="manage-section">
        <div className="manage-header">
          <h4 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: '20px' }}>Manage Developers</h4>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Developer Name</th>
                <th>Website URL</th>
                <th>Sort Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.image_url ? <img src={item.image_url} alt="" /> : <span style={{color:'var(--gray)'}}>No img</span>}</td>
                  <td style={{ color: 'var(--white)', fontWeight: 600 }}>{item.developer_name}</td>
                  <td><a href={item.website_url} target="_blank" style={{color:'var(--gold)'}}>{item.website_url}</a></td>
                  <td>{item.sort_order}</td>
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      <button onClick={() => startEdit(item)} className="action-btn edit">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="action-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// NEWS TAB
// -------------------------------------------------------------------------------------------------
function NewsTab() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ image_url: '', title: '', tag: '', article_date: '', description: '' });

  useEffect(() => { fetchData() }, []);

  const fetchData = async () => {
    let { data: res, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (error && (error.message?.includes('created_at') || error.code === '42703')) {
      const fallback = await supabase.from('news').select('*');
      res = fallback.data;
    }
    setData(res || []);
  };

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading Image...');
    try {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('portfolio_images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio_images').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      setStatus('Image Uploaded.');
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(editingId ? 'Updating...' : 'Publishing...');
    try {
      if (editingId) {
        await supabase.from('news').update(formData).eq('id', editingId);
        setStatus('Success! Article Updated.');
      } else {
        await supabase.from('news').insert([{ ...formData, id: crypto.randomUUID() }]);
        setStatus('Success! Article Published.');
      }
      setEditingId(null);
      setFormData({ image_url: '', title: '', tag: '', article_date: '', description: '' });
      (document.getElementById('n-image') as HTMLInputElement).value = '';
      fetchData();
    } catch (err: any) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setStatus('Editing mode active.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this article?')) {
      await supabase.from('news').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="tab-content" id="tab-news">
      <h3>{editingId ? 'Edit' : 'Add'} News Article</h3>
      <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>Appears in the dynamic grid cards.</p>
      
      <form id="form-news" onSubmit={handleSubmit} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
        <div className="form-row">
          <input type="file" id="n-image" accept="image/*" onChange={uploadFile} required={!formData.image_url} style={{ paddingTop: '12px' }} />
          <input type="text" id="n-title" placeholder="Article Headline" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        {(formData.image_url) && (
          <div style={{ marginBottom: '16px' }}>
            <img src={formData.image_url} alt="Preview" style={{ height: '60px', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}
        <div className="form-row">
          <input type="text" id="n-tag" placeholder="Tag (e.g. Technology)" required value={formData.tag || ''} onChange={e => setFormData({...formData, tag: e.target.value})} />
          <input type="date" id="n-date" required value={formData.article_date || ''} onChange={e => setFormData({...formData, article_date: e.target.value})} style={{ colorScheme: 'dark' }} />
        </div>
        <textarea id="n-desc" placeholder="Article Summary" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} style={{ height: '80px' }}></textarea>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="big-btn" disabled={loading}>{loading ? 'Processing...' : (editingId ? 'Update Article' : 'Publish Article')}</button>
          {editingId && (
            <button type="button" className="big-btn" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={() => { setEditingId(null); setFormData({ image_url: '', title: '', tag: '', article_date: '', description: '' }); setStatus(''); }}>Cancel Edit</button>
          )}
        </div>
        <div className="form-status" style={{ marginTop: '12px', color: 'var(--gold)', fontSize: '14px' }}>{status}</div>
      </form>

      <div className="manage-section">
        <div className="manage-header">
          <h4 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: '20px' }}>Manage News</h4>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Headline</th>
                <th>Tag</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.image_url ? <img src={item.image_url} alt="" /> : <span style={{color:'var(--gray)'}}>No img</span>}</td>
                  <td style={{ color: 'var(--white)', fontWeight: 600 }}>{item.title}</td>
                  <td>{item.tag}</td>
                  <td>{item.article_date}</td>
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      <button onClick={() => startEdit(item)} className="action-btn edit">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="action-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
