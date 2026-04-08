"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import '../admin.css'; 

export default function AdminDashboard() {
    const [session, setSession] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('tab-coaching');
    const [loading, setLoading] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    // Data state
    const [data, setData] = useState<{
        coaching: any[];
        events: any[];
        testimonials: any[];
        media: any[];
        credentials: any[];
        awards: any[];
    }>({
        coaching: [],
        events: [],
        testimonials: [],
        media: [],
        credentials: [],
        awards: []
    });
    const [editingItem, setEditingItem] = useState<any>(null);
    const [notification, setNotification] = useState<{ show: boolean, type: 'success' | 'error' | 'confirm', title: string, message: string, onConfirm?: () => void }>({
        show: false,
        type: 'success',
        title: '',
        message: '',
    });

    const showNotify = (type: 'success' | 'error' | 'confirm', title: string, message: string, onConfirm?: () => void) => {
        setNotification({ show: true, type, title, message, onConfirm });
    };

    const closeNotify = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    const fetchData = async () => {
        const [coaching, events, testimonials, media, credentials, awards] = await Promise.all([
            supabase.from('coaching').select('*'),
            supabase.from('events').select('*').order('id', { ascending: false }),
            supabase.from('testimonials').select('*').order('id', { ascending: false }),
            supabase.from('media').select('*').order('id', { ascending: false }),
            supabase.from('credentials').select('*'),
            supabase.from('awards').select('*').order('year', { ascending: false })
        ]);

        setData({
            coaching: coaching.data || [],
            events: events.data || [],
            testimonials: testimonials.data || [],
            media: media.data || [],
            credentials: credentials.data || [],
            awards: awards.data || []
        });
    };

    const startEdit = (item: any) => {
        setEditingItem(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingItem(null);
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session, activeTab]);

    useEffect(() => {
        console.log('Checking session...');
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (!session) {
                    console.log('No session found, redirecting to login...');
                    router.push('/admin/login');
                } else {
                    console.log('Session active:', session.user.email);
                    setSession(session);
                }
            } catch (err) {
                console.error('Session check error:', err);
                // Clear any corrupted local tokens manually
                await supabase.auth.signOut().catch(() => {});
                router.push('/admin/login');
            } finally {
                setAuthChecked(true);
            }
        };

        checkSession();

        // Fallback timeout: if still loading after 3 seconds, show fallback
        const timer = setTimeout(() => {
            if (!authChecked) {
                console.log('Auth check taking too long, showing fallback UI');
                setAuthChecked(true);
            }
        }, 3000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            if (event === 'SIGNED_IN' && session) {
                setSession(session);
            }
            if (event === 'SIGNED_OUT') {
                setSession(null);
                router.push('/admin/login');
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const uploadImage = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(filePath, file);
        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error(`Storage Error: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from('portfolio_images').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleDelete = async (table: string, id: string) => {
        showNotify('confirm', 'Are you sure?', 'This action cannot be undone. This item will be permanently removed.', async () => {
            setLoading(true);
            try {
                console.log(`[DEBUG] Attempting to delete from ${table} where id=${id}`);
                const { error, count } = await supabase.from(table).delete({ count: 'exact' }).eq('id', id);

                if (error) {
                    console.error(`[DEBUG] Supabase Delete Error:`, error);
                    throw error;
                }

                console.log(`[DEBUG] Delete operation successful. Count of deleted rows:`, count);

                if (count === 0) {
                    showNotify('error', 'Not Found', 'The item could not be found or you do not have permission to delete it.');
                } else {
                    showNotify('success', 'Deleted', 'Item has been removed successfully.');
                    await fetchData();
                }
            } catch (err: any) {
                console.error('[DEBUG] Delete catch block:', err);
                showNotify('error', 'Delete Failed', err.message || 'Unknown error occurred');
            }
            setLoading(false);
        });
    };

    const handleCoaching = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            let publicUrl = editingItem?.image_url || '';
            const file = e.target['c-image'].files[0];
            if (file) {
                publicUrl = await uploadImage(file, 'uploads');
            }

            const payload = {
                image_url: publicUrl,
                badge_text: e.target['c-badge'].value,
                title: e.target['c-title'].value,
                description: e.target['c-desc'].value
            };

            if (editingItem) {
                const { error } = await supabase.from('coaching').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                showNotify('success', 'Updated', 'Coaching card updated successfully.');
            } else {
                const { error } = await supabase.from('coaching').insert([{
                    id: crypto.randomUUID(),
                    ...payload
                }]);
                if (error) throw error;
                showNotify('success', 'Published', 'New coaching card has been added.');
            }

            e.target.reset();
            setEditingItem(null);
            await fetchData();
        } catch (err: any) {
            showNotify('error', 'Error', err.message);
        }
        setLoading(false);
    };

    const handleEvents = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            let publicUrl = editingItem?.image_url || '';
            const file = e.target['ev-image']?.files[0];
            if (file) publicUrl = await uploadImage(file, 'uploads');

            const payload = {
                image_url: publicUrl || null,
                title: e.target['ev-title'].value,
                description: e.target['ev-desc'].value,
                event_date: e.target['ev-date'].value
            };

            if (editingItem) {
                const { error } = await supabase.from('events').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                showNotify('success', 'Updated', 'Event updated.');
            } else {
                const { error } = await supabase.from('events').insert([payload]);
                if (error) throw error;
                showNotify('success', 'Published', 'New event added.');
            }
            e.target.reset();
            setEditingItem(null);
            await fetchData();
        } catch (err: any) { showNotify('error', 'Error', err.message); }
        setLoading(false);
    };

    const handleTestimonials = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            let publicUrl = editingItem?.author_image_url || '';
            const file = e.target['t-image'].files[0];
            if (file) publicUrl = await uploadImage(file, 'uploads');

            const payload = {
                author_image_url: publicUrl || null,
                author_name: e.target['t-name'].value,
                author_role: e.target['t-role'].value,
                quote: e.target['t-quote'].value
            };

            if (editingItem) {
                const { error } = await supabase.from('testimonials').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                showNotify('success', 'Updated', 'Testimonial updated.');
            } else {
                const { error } = await supabase.from('testimonials').insert([payload]);
                if (error) throw error;
                showNotify('success', 'Published', 'New testimonial added.');
            }
            e.target.reset();
            setEditingItem(null);
            await fetchData();
        } catch (err: any) { showNotify('error', 'Error', err.message); }
        setLoading(false);
    };

    const handleMedia = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            let publicUrl = editingItem?.image_url || '';
            const file = e.target['m-image'].files[0];
            if (file) publicUrl = await uploadImage(file, 'uploads');

            const payload = {
                image_url: publicUrl,
                title: e.target['m-title'].value
            };

            if (editingItem) {
                const { error } = await supabase.from('media').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                showNotify('success', 'Updated', 'Media updated.');
            } else {
                const { error } = await supabase.from('media').insert([payload]);
                if (error) throw error;
                showNotify('success', 'Published', 'New media added.');
            }
            e.target.reset();
            setEditingItem(null);
            await fetchData();
        } catch (err: any) { showNotify('error', 'Error', err.message); }
        setLoading(false);
    };

    const handleCredentials = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                institution: e.target['cred-institution'].value,
                title: e.target['cred-title'].value,
                organization: e.target['cred-org'].value,
                category: e.target['cred-category'].value
            };

            if (editingItem) {
                const { error } = await supabase.from('credentials').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                showNotify('success', 'Updated', 'Credential updated.');
            } else {
                const { error } = await supabase.from('credentials').insert([{ id: crypto.randomUUID(), ...payload }]);
                if (error) throw error;
                showNotify('success', 'Published', 'New educational credential added.');
            }
            e.target.reset();
            setEditingItem(null);
            await fetchData();
        } catch (err: any) { showNotify('error', 'Error', err.message); }
        setLoading(false);
    };

    const handleAwards = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: e.target['award-title'].value,
                organization: e.target['award-org'].value,
                year: e.target['award-year'].value
            };

            if (editingItem) {
                const { error } = await supabase.from('awards').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                showNotify('success', 'Updated', 'Award updated.');
            } else {
                const { error } = await supabase.from('awards').insert([{ id: crypto.randomUUID(), ...payload }]);
                if (error) throw error;
                showNotify('success', 'Published', 'New award recognition added.');
            }
            e.target.reset();
            setEditingItem(null);
            await fetchData();
        } catch (err: any) { showNotify('error', 'Error', err.message); }
        setLoading(false);
    };

    if (!session) {
        return (
            <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div className="overline">Security Check</div>
                <div style={{ fontSize: '18px' }}>{authChecked ? 'Access Denied or Session Expired' : 'Connecting to Server...'}</div>
                {!authChecked && <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                {authChecked && (
                    <button onClick={() => router.push('/admin/login')} className="big-btn" style={{ padding: '12px 24px', cursor: 'pointer' }}>
                        Go to Login Page
                    </button>
                )}
                <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="dash-header">
                <div>
                    <span className="overline">Control Panel</span>
                    <h2 style={{ margin: 0 }}>Dashboard</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ color: 'var(--gray)', fontSize: '14px' }}>{session.user.email}</span>
                    <button onClick={handleLogout} className="text-link" style={{ background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}>Disconnect →</button>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'tab-coaching' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-coaching'); setEditingItem(null); }}>
                    <span className="tab-icon">🎯</span>
                    Coaching Grid
                </button>
                <button className={`tab-btn ${activeTab === 'tab-events' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-events'); setEditingItem(null); }}>
                    <span className="tab-icon">📅</span>
                    Events
                </button>
                <button className={`tab-btn ${activeTab === 'tab-testimonials' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-testimonials'); setEditingItem(null); }}>
                    <span className="tab-icon">💬</span>
                    Testimonials
                </button>
                <button className={`tab-btn ${activeTab === 'tab-media' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-media'); setEditingItem(null); }}>
                    <span className="tab-icon">🖼️</span>
                    Gallery Media
                </button>

                <button className={`tab-btn ${activeTab === 'tab-credentials' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-credentials'); setEditingItem(null); }}>
                    <span className="tab-icon">🎓</span>
                    Education
                </button>
                <button className={`tab-btn ${activeTab === 'tab-awards' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-awards'); setEditingItem(null); }}>
                    <span className="tab-icon">🏆</span>
                    Awards
                </button>
            </div>


            {activeTab === 'tab-coaching' && (
                <div className="tab-content">
                    <h3>{editingItem ? 'Edit' : 'Add'} Coaching Card</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>{editingItem ? 'Update the selected card.' : 'Automatically uploads image and pushes layout to frontend grid.'}</p>
                    <form onSubmit={handleCoaching} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
                        <div className="form-row">
                            <input type="file" id="c-image" accept="image/*" required={!editingItem} style={{ paddingTop: '12px' }} />
                            <input type="text" id="c-badge" placeholder="Badge Text (e.g. Pillar 01)" defaultValue={editingItem?.badge_text || ''} required />
                        </div>
                        <div className="form-row">
                            <input type="text" id="c-title" placeholder="Title" defaultValue={editingItem?.title || ''} required />
                        </div>
                        <textarea id="c-desc" placeholder="Card Description" defaultValue={editingItem?.description || ''} required style={{ height: '80px' }}></textarea>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="big-btn" disabled={loading} style={{ border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, flex: 1 }}>
                                {loading ? 'Processing...' : (editingItem ? 'Update Coaching Card' : 'Publish Coaching Card')}
                            </button>
                            {editingItem && <button type="button" onClick={cancelEdit} className="big-btn" style={{ background: 'var(--bg)', flex: 0.3 }}>Cancel</button>}
                        </div>
                    </form>

                    <div className="manage-section">
                        <div className="manage-header">
                            <h4>Manage Coaching Cards</h4>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Logo</th>
                                        <th>Badge</th>
                                        <th>Title</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.coaching.map((item: any) => (
                                        <tr key={item.id}>
                                            <td><img src={item.image_url} alt="" /></td>
                                            <td>{item.badge_text}</td>
                                            <td>{item.title}</td>
                                            <td className="actions-cell">
                                                <div className="actions-wrapper">
                                                    <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDelete('coaching', item.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tab-events' && (
                <div className="tab-content">
                    <h3>{editingItem ? 'Edit' : 'Add'} Event</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>{editingItem ? 'Update the selected event.' : 'Add a new upcoming event or mentorship program.'}</p>
                    <form onSubmit={handleEvents} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
                        <div className="form-row">
                            <input type="file" id="ev-image" accept="image/*" style={{ paddingTop: '12px' }} />
                            <input type="text" id="ev-title" placeholder="Event Title" defaultValue={editingItem?.title || ''} required />
                        </div>
                        <div className="form-row">
                            <input type="text" id="ev-date" placeholder="Event Date (e.g. TBA Online)" defaultValue={editingItem?.event_date || ''} required />
                        </div>
                        <textarea id="ev-desc" placeholder="Event Description" defaultValue={editingItem?.description || ''} required style={{ height: '80px' }}></textarea>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="big-btn" disabled={loading} style={{ border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, flex: 1 }}>
                                {loading ? 'Processing...' : (editingItem ? 'Update Event' : 'Publish Event')}
                            </button>
                            {editingItem && <button type="button" onClick={cancelEdit} className="big-btn" style={{ background: 'var(--bg)', flex: 0.3 }}>Cancel</button>}
                        </div>
                    </form>

                    <div className="manage-section">
                        <div className="manage-header">
                            <h4>Manage Events</h4>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Poster</th>
                                        <th>Title</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.events.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.image_url ? <img src={item.image_url} alt="" /> : 'None'}</td>
                                            <td><strong>{item.title}</strong></td>
                                            <td>{item.event_date}</td>
                                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                                            <td className="actions-cell">
                                                <div className="actions-wrapper">
                                                    <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDelete('events', item.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tab-testimonials' && (
                <div className="tab-content">
                    <h3>{editingItem ? 'Edit' : 'Add'} Testimonial</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>{editingItem ? 'Update the selected testimonial.' : 'Publish a client success story.'}</p>
                    <form onSubmit={handleTestimonials} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
                        <div className="form-row">
                            <input type="file" id="t-image" accept="image/*" style={{ paddingTop: '12px' }} />
                            <input type="text" id="t-name" placeholder="Author Name" defaultValue={editingItem?.author_name || ''} required />
                        </div>
                        <div className="form-row">
                            <input type="text" id="t-role" placeholder="Author Role (Optional)" defaultValue={editingItem?.author_role || ''} />
                        </div>
                        <textarea id="t-quote" placeholder="Testimonial Quote" defaultValue={editingItem?.quote || ''} required style={{ height: '80px' }}></textarea>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="big-btn" disabled={loading} style={{ border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, flex: 1 }}>
                                {loading ? 'Processing...' : (editingItem ? 'Update Testimonial' : 'Publish Testimonial')}
                            </button>
                            {editingItem && <button type="button" onClick={cancelEdit} className="big-btn" style={{ background: 'var(--bg)', flex: 0.3 }}>Cancel</button>}
                        </div>
                    </form>

                    <div className="manage-section">
                        <div className="manage-header">
                            <h4>Manage Testimonials</h4>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Author</th>
                                        <th>Quote</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.testimonials.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.author_image_url ? <img src={item.author_image_url} alt="" /> : 'None'}</td>
                                            <td><strong>{item.author_name}</strong><br /><span style={{ fontSize: '11px', color: 'var(--gray)' }}>{item.author_role}</span></td>
                                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.quote}</td>
                                            <td className="actions-cell">
                                                <div className="actions-wrapper">
                                                    <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDelete('testimonials', item.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tab-media' && (
                <div className="tab-content">
                    <h3>{editingItem ? 'Edit' : 'Add'} Gallery Media</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>{editingItem ? 'Update the selected media.' : 'Add photos to the gallery reel.'}</p>
                    <form onSubmit={handleMedia} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
                        <div className="form-row">
                            <input type="file" id="m-image" accept="image/*" required={!editingItem} style={{ paddingTop: '12px' }} />
                            <input type="text" id="m-title" placeholder="Photo Title" defaultValue={editingItem?.title || ''} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="big-btn" disabled={loading} style={{ border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, flex: 1 }}>
                                {loading ? 'Processing...' : (editingItem ? 'Update Media' : 'Publish Media')}
                            </button>
                            {editingItem && <button type="button" onClick={cancelEdit} className="big-btn" style={{ background: 'var(--bg)', flex: 0.3 }}>Cancel</button>}
                        </div>
                    </form>

                    <div className="manage-section">
                        <div className="manage-header">
                            <h4>Manage Media Gallery</h4>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.media.map((item: any) => (
                                        <tr key={item.id}>
                                            <td><img src={item.image_url} alt="" /></td>
                                            <td>{item.title || 'Untitled'}</td>
                                            <td className="actions-cell">
                                                <div className="actions-wrapper">
                                                    <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDelete('media', item.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}



            {activeTab === 'tab-credentials' && (
                <div className="tab-content">
                    <h3>{editingItem ? 'Edit' : 'Add'} Education Credential</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>{editingItem ? 'Update the selected credential.' : 'Appears in the Executive Credentials section.'}</p>
                    <form onSubmit={handleCredentials} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
                        <div className="form-row">
                            <input type="text" id="cred-institution" placeholder="Institution (e.g. Harvard, MIT, Oxford)" defaultValue={editingItem?.institution || ''} required />
                            <select id="cred-category" defaultValue={editingItem?.category || ''} required style={{ padding: '12px', background: 'var(--card)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px' }}>
                                <option value="">Select Category</option>
                                <option value="harvard">Harvard</option>
                                <option value="usjr">USJR</option>
                                <option value="mit">MIT</option>
                                <option value="oxford">Oxford</option>
                                <option value="prc">PRC</option>
                                <option value="other">Other Institutions</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <input type="text" id="cred-title" placeholder="Credential Title (e.g. Disruptive Strategy)" defaultValue={editingItem?.title || ''} required />
                            <input type="text" id="cred-org" placeholder="Organization & Year (e.g. Harvard Business School Online — 2025)" defaultValue={editingItem?.organization || ''} required />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="big-btn" disabled={loading} style={{ border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, flex: 1 }}>
                                {loading ? 'Processing...' : (editingItem ? 'Update Credential' : 'Publish Credential')}
                            </button>
                            {editingItem && <button type="button" onClick={cancelEdit} className="big-btn" style={{ background: 'var(--bg)', flex: 0.3 }}>Cancel</button>}
                        </div>
                    </form>

                    <div className="manage-section">
                        <div className="manage-header">
                            <h4>Manage Education</h4>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Institution</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.credentials.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.institution}</td>
                                            <td>{item.title}</td>
                                            <td>{item.category}</td>
                                            <td className="actions-cell">
                                                <div className="actions-wrapper">
                                                    <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDelete('credentials', item.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tab-awards' && (
                <div className="tab-content">
                    <h3>{editingItem ? 'Edit' : 'Add'} Award / Recognition</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '24px' }}>{editingItem ? 'Update the selected award.' : 'Appears in the Awards & Recognition wall.'}</p>
                    <form onSubmit={handleAwards} className="admin-form connect-form" style={{ maxWidth: '100%' }}>
                        <div className="form-row">
                            <input type="text" id="award-title" placeholder="Award Title (e.g. Entrepreneur of the Year)" defaultValue={editingItem?.title || ''} required />
                            <input type="text" id="award-year" placeholder="Year (e.g. 2024)" defaultValue={editingItem?.year || ''} required />
                        </div>
                        <div className="form-row">
                            <input type="text" id="award-org" placeholder="Awarding Organization" defaultValue={editingItem?.organization || ''} required />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="big-btn" disabled={loading} style={{ border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, flex: 1 }}>
                                {loading ? 'Processing...' : (editingItem ? 'Update Award' : 'Publish Award')}
                            </button>
                            {editingItem && <button type="button" onClick={cancelEdit} className="big-btn" style={{ background: 'var(--bg)', flex: 0.3 }}>Cancel</button>}
                        </div>
                    </form>

                    <div className="manage-section">
                        <div className="manage-header">
                            <h4>Manage Awards</h4>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Title</th>
                                        <th>Organization</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.awards.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.year}</td>
                                            <td>{item.title}</td>
                                            <td>{item.organization}</td>
                                            <td className="actions-cell">
                                                <div className="actions-wrapper">
                                                    <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDelete('awards', item.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {notification.show && (
                <div className="modal-overlay" onClick={closeNotify}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <span className="modal-icon">
                            {notification.type === 'success' ? '✅' : notification.type === 'confirm' ? '⚠️' : '❌'}
                        </span>
                        <h3 className="modal-title">{notification.title}</h3>
                        <p className="modal-message">{notification.message}</p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {notification.type === 'confirm' ? (
                                <>
                                    <button onClick={closeNotify} className="big-btn" style={{ background: 'var(--bg)', flex: 1 }}>Cancel</button>
                                    <button onClick={() => { notification.onConfirm?.(); closeNotify(); }} className="big-btn" style={{ background: '#e74c3c', border: 'none', flex: 1 }}>Delete</button>
                                </>
                            ) : (
                                <button onClick={closeNotify} className="big-btn" style={{ flex: 1 }}>Dismiss</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
