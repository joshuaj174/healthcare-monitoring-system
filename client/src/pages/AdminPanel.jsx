import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAllUsers, addHospital, deleteHospital } from '../services/adminService';

const AdminPanel = () => {
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('overview');
  const [deleteId, setDeleteId]     = useState(null);
  const [form, setForm]             = useState({
    name: '', region: '', status: 'Normal',
    capacity: 50, latitude: '', longitude: '', medicineSupply: 50,
  });
  const [formMsg, setFormMsg]       = useState('');
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (!user)              { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/');  return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const [sRes, uRes] = await Promise.all([getAdminStats(), getAllUsers()]);
      setStats(sRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg('');
    setFormError('');
    try {
      await addHospital(form);
      setFormMsg('Hospital added successfully!');
      setForm({
        name: '', region: '', status: 'Normal',
        capacity: 50, latitude: '', longitude: '', medicineSupply: 50,
      });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHospital(id);
      setDeleteId(null);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = {
    width: '100%', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px',
    color: '#e6edf3', fontSize: '13px',
    padding: '9px 12px', outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '11px', color: '#8b949e',
    display: 'block', marginBottom: '5px', fontWeight: 500,
  };

  const tabs = [
    { id: 'overview',  label: 'Overview'    },
    { id: 'users',     label: 'Users'        },
    { id: 'hospitals', label: 'Add Hospital' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', background: '#0d1117' }}>
      <div className="spinner-border text-warning" />
    </div>
  );

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ color: '#ffd43b', margin: '0 0 4px', fontWeight: 700 }}>
           Admin Control Panel
          </h4>
          <p style={{ color: '#8b949e', margin: 0, fontSize: '13px' }}>
            Logged in as <span style={{ color: '#ffd43b' }}>{user?.username}</span>
          </p>
        </div>
        <span style={{
          fontSize: '11px', background: '#3d1f00',
          color: '#ffd43b', padding: '4px 12px',
          borderRadius: '20px', border: '1px solid #7d4f00',
          fontWeight: 600,
        }}>
          ADMIN
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: activeTab === t.id ? 600 : 400,
            background: activeTab === t.id ? '#3d1f00' : '#161b22',
            border: `1px solid ${activeTab === t.id ? '#7d4f00' : '#30363d'}`,
            color: activeTab === t.id ? '#ffd43b' : '#8b949e',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[
              { label: 'Total Hospitals',  value: stats.totalHospitals, color: '#e6edf3' },
              { label: 'Critical Now',     value: stats.criticalCount,  color: '#ff6b6b' },
              { label: 'Registered Users', value: stats.totalUsers,     color: '#69db7c' },
              { label: 'Total Alerts',     value: stats.totalAlerts.toLocaleString(), color: '#ffd43b' },
              { label: 'Subscriptions',    value: stats.totalSubs,      color: '#74c0fc' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1 1 150px', background: '#161b22',
                border: '1px solid #30363d', borderRadius: '10px',
                padding: '16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: '12px', padding: '20px',
          }}>
            <h6 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '12px', fontSize: '13px' }}>
              System status
            </h6>
            {[
              { label: 'Simulation engine',      status: 'Running',  color: '#69db7c' },
              { label: 'WHO API sync',            status: 'Active',   color: '#69db7c' },
              { label: 'OSM location sync',       status: 'Active',   color: '#69db7c' },
              { label: 'Email notification system', status: 'Active', color: '#69db7c' },
              { label: 'MongoDB Atlas',           status: 'Connected', color: '#69db7c' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 0',
                borderBottom: i < 4 ? '1px solid #21262d' : 'none',
              }}>
                <span style={{ fontSize: '13px', color: '#e6edf3' }}>{item.label}</span>
                <span style={{
                  fontSize: '11px', padding: '2px 10px',
                  borderRadius: '20px', fontWeight: 600,
                  background: '#003d1a', color: item.color,
                  border: '1px solid #007d35',
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
  <div style={{
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: '12px', padding: '20px',
  }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: '16px',
    }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
      Registered Users ({users.length})
      </span>
    </div>

    {users.length === 0 ? (
      <div style={{ textAlign: 'center', color: '#8b949e', padding: '40px' }}>
        No users registered yet.
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map(u => (
          <div key={u._id} style={{
            background: '#0d1117', border: '1px solid #30363d',
            borderRadius: '10px', padding: '16px',
          }}>
            {/* User header row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: u.subscriptions.length > 0 ? '12px' : '0',
              flexWrap: 'wrap', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Avatar circle */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#1f3a5f', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: '#58a6ff',
                  flexShrink: 0,
                }}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                    {u.username}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>
                    {u.email}
                  </div>
                </div>
              </div>

              {/* Right side — subscription count + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {/* Subscription count badge */}
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: u.subscriptionCount > 0 ? '#1f3a5f' : '#21262d',
                  border: `1px solid ${u.subscriptionCount > 0 ? '#1f6feb' : '#30363d'}`,
                  borderRadius: '8px', padding: '6px 12px', minWidth: '60px',
                }}>
                  <div style={{
                    fontSize: '18px', fontWeight: 700,
                    color: u.subscriptionCount > 0 ? '#58a6ff' : '#8b949e',
                    lineHeight: 1,
                  }}>
                    {u.subscriptionCount}
                  </div>
                  <div style={{ fontSize: '9px', color: '#8b949e', marginTop: '2px' }}>
                    {u.subscriptionCount === 1 ? 'hospital' : 'hospitals'}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscribed hospitals */}
            {u.subscriptions.length > 0 && (
              <div>
                <div style={{
                  fontSize: '10px', color: '#8b949e',
                  marginBottom: '6px', fontWeight: 500,
                  letterSpacing: '0.05em',
                }}>
                  SUBSCRIBED HOSPITALS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {u.subscriptions.map(h => (
                    <span key={h._id} style={{
                      fontSize: '11px', padding: '3px 10px',
                      borderRadius: '20px',
                      background: h.status === 'Critical' ? '#3d0000' : '#003d1a',
                      color: h.status === 'Critical' ? '#ff6b6b' : '#69db7c',
                      border: `1px solid ${h.status === 'Critical' ? '#7d0000' : '#007d35'}`,
                    }}>
                      {h.name}
                      <span style={{
                        marginLeft: '6px', opacity: 0.7,
                        fontSize: '10px',
                      }}>
                        {h.status === 'Critical' ? '🔴' : '🟢'}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {u.subscriptions.length === 0 && (
              <div style={{
                fontSize: '11px', color: '#8b949e',
                fontStyle: 'italic',
              }}>
                No hospital subscriptions yet
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}  

      {/* Add Hospital Tab */}
      {activeTab === 'hospitals' && (
        <div style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: '12px', padding: '24px',
          maxWidth: '640px',
        }}>
          <h6 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '20px', fontSize: '13px' }}>
          Add New Hospital
          </h6>

          {formMsg && (
            <div style={{
              background: '#003d1a', border: '1px solid #007d35',
              color: '#69db7c', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', marginBottom: '16px',
            }}>
            Connected{formMsg}
            </div>
          )}

          {formError && (
            <div style={{
              background: '#3d0000', border: '1px solid #7d0000',
              color: '#ff6b6b', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', marginBottom: '16px',
            }}>
            Not Connected{formError}
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div className="row g-3">
              <div className="col-12">
                <label style={labelStyle}>HOSPITAL NAME *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Al-Shifa Medical Complex"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label style={labelStyle}>REGION *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Gaza, Palestine"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label style={labelStyle}>LATITUDE *</label>
                <input
                  style={inputStyle}
                  type="number" step="any"
                  placeholder="e.g. 31.5017"
                  value={form.latitude}
                  onChange={e => setForm({ ...form, latitude: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label style={labelStyle}>LONGITUDE *</label>
                <input
                  style={inputStyle}
                  type="number" step="any"
                  placeholder="e.g. 34.4667"
                  value={form.longitude}
                  onChange={e => setForm({ ...form, longitude: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>STATUS</label>
                <select
                  style={inputStyle}
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Normal">Normal</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>CAPACITY % ({form.capacity})</label>
                <input
                  style={inputStyle}
                  type="range" min="0" max="100"
                  value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })}
                />
              </div>

              <div className="col-md-4">
                <label style={labelStyle}>MEDICINE SUPPLY % ({form.medicineSupply})</label>
                <input
                  style={inputStyle}
                  type="range" min="0" max="100"
                  value={form.medicineSupply}
                  onChange={e => setForm({ ...form, medicineSupply: parseInt(e.target.value) })}
                />
              </div>

              <div className="col-12" style={{ marginTop: '8px' }}>
                <button
                  type="submit" disabled={submitting}
                  style={{
                    background: '#7d4f00', border: 'none',
                    borderRadius: '8px', color: '#ffd43b',
                    fontSize: '14px', fontWeight: 600,
                    padding: '11px 28px', cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Adding...' : 'Add Hospital'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;