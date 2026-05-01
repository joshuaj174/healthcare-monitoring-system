import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHospitals, getAlerts, getAlertCounts, getMySubscriptions } from '../services/hospitalService';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import HospitalCard from '../components/HospitalCard';

const getDangerRating = (alertCount) => {
  if (alertCount >= 30000) return 5;
  if (alertCount >= 15000) return 4;
  if (alertCount >= 5000)  return 3;
  if (alertCount >= 1000)  return 2;
  return 1;
};

const ratingColors = ['', '#28a745', '#8bc34a', '#ffc107', '#ff7043', '#dc3545'];

const Dashboard = () => {
  const [hospitals, setHospitals]         = useState([]);
  const [alerts, setAlerts]               = useState([]);
  const [alertCounts, setAlertCounts]     = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [lastUpdated, setLastUpdated]     = useState('');
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('All');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [hRes, aRes, cRes] = await Promise.all([
        getHospitals(),
        getAlerts(),
        getAlertCounts(),   // ← real counts from full DB
      ]);
      setHospitals(hRes.data);
      setAlerts(aRes.data);
      setAlertCounts(cRes.data);   // { hospitalId: totalCount }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await getMySubscriptions();
      setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscriptionChange = (hospitalId, isNowSubscribed) => {
    setSubscriptions(prev =>
      isNowSubscribed ? [...prev, hospitalId] : prev.filter(id => id !== hospitalId)
    );
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
    fetchSubscriptions();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const critical = hospitals.filter(h => h.status === 'Critical').length;
  const normal   = hospitals.filter(h => h.status === 'Normal').length;

  const filteredHospitals = hospitals.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        h.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', background: '#0d1117' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', paddingBottom: '40px' }}>

      {/* Stats Row */}
      <div style={{ padding: '20px 24px 16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { label: 'Total Hospitals', value: hospitals.length,    color: '#e6edf3' },
            { label: 'Critical',        value: critical,             color: '#ff6b6b' },
            { label: 'Operational',     value: normal,               color: '#69db7c' },
            { label: 'Live Alerts',     value: alerts.length,        color: '#ffd43b' },
            { label: 'My Watchlist',    value: subscriptions.length, color: '#74c0fc' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: '1 1 120px',
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '10px',
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#8b949e' }}>
        Auto-refreshing every 5s · Last updated:
        <span style={{ color: '#58a6ff', marginLeft: '6px' }}>{lastUpdated}</span>
        </div>
      </div>

      {/* Full Width Map */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
            Live Hospital Map
            </span>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8b949e' }}>
              <span>🟢 Normal ({normal})</span>
              <span>🔴 Critical ({critical})</span>
            </div>
          </div>
          <div style={{ height: '440px' }}>
            <MapView hospitals={hospitals} />
          </div>
        </div>
      </div>

      {/* Hospitals + Alerts */}
      <div style={{ padding: '0 24px' }}>
        <div className="row g-4">

          {/* Hospital Cards */}
          <div className="col-lg-7">
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
                Hospitals ({filteredHospitals.length}/{hospitals.length})
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <input
                    placeholder="Search name or region..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      background: '#0d1117', border: '1px solid #30363d',
                      borderRadius: '6px', color: '#e6edf3',
                      fontSize: '12px', padding: '5px 10px',
                      width: '190px', outline: 'none',
                    }}
                  />
                  {['All', 'Critical', 'Normal'].map(f => (
                    <button key={f} onClick={() => setStatusFilter(f)} style={{
                      background: statusFilter === f ? '#21262d' : 'transparent',
                      border: `1px solid ${statusFilter === f ? '#58a6ff' : '#30363d'}`,
                      borderRadius: '6px',
                      color: statusFilter === f ? '#58a6ff' : '#8b949e',
                      fontSize: '11px', padding: '4px 10px', cursor: 'pointer',
                    }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                maxHeight: '560px', overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))',
                gap: '10px', paddingRight: '4px',
              }}>
                {filteredHospitals.map(h => (
                  <HospitalCard
                    key={h._id}
                    hospital={h}
                    isSubscribed={subscriptions.includes(h._id)}
                    onSubscriptionChange={handleSubscriptionChange}
                    alertCount={alertCounts[h._id] || 0}
                  />
                ))}
                {filteredHospitals.length === 0 && (
                  <div style={{
                    gridColumn: '1/-1', textAlign: 'center',
                    color: '#8b949e', padding: '40px', fontSize: '13px',
                  }}>
                    No hospitals match your search.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="col-lg-5">
            <div style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: '12px', padding: '16px', height: '100%',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '12px',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
                Live Alerts
                </span>
                <span style={{
                  fontSize: '11px', background: '#3d1f00',
                  color: '#ffd43b', padding: '2px 10px',
                  borderRadius: '20px', border: '1px solid #7d4f00',
                }}>
                  {alerts.length.toLocaleString()} shown
                </span>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '560px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#161b22' }}>
                    <tr style={{ borderBottom: '1px solid #30363d' }}>
                      {['Hospital', 'Type', 'Rating', 'Time'].map(h => (
                        <th key={h} style={{
                          padding: '6px 8px', color: '#8b949e',
                          fontWeight: 500, textAlign: 'left', fontSize: '11px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.slice(0, 50).map((alert, i) => {
                      const hId    = alert.hospitalId?._id || alert.hospitalId;
                      const hName  = alert.hospitalId?.name || 'Unknown';
                      const count  = alertCounts[hId] || 0;
                      const rating = getDangerRating(count);
                      return (
                        <tr key={i} style={{
                          borderBottom: '1px solid #21262d',
                          background: i % 2 === 0 ? 'transparent' : '#0d1117',
                        }}>
                          <td style={{
                            padding: '7px 8px', color: '#e6edf3',
                            maxWidth: '120px', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {hName}
                          </td>
                          <td style={{ padding: '7px 8px' }}>
                            <span style={{
                              fontSize: '10px', padding: '2px 6px', borderRadius: '10px',
                              background: alert.type === 'capacity' ? '#3d0000' : '#2d1500',
                              color: alert.type === 'capacity' ? '#ff6b6b' : '#ffa94d',
                              border: `1px solid ${alert.type === 'capacity' ? '#7d0000' : '#7d3500'}`,
                            }}>
                              {alert.type === 'capacity' ? 'Capacity' : 'Medicine'}
                            </span>
                          </td>
                          <td style={{ padding: '7px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{
                                fontSize: '12px',
                                color: ratingColors[rating],
                                letterSpacing: '-1px',
                              }}>
                                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '7px 8px', color: '#8b949e', whiteSpace: 'nowrap' }}>
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {alerts.length > 50 && (
                <div style={{
                  marginTop: '10px', textAlign: 'center',
                  fontSize: '11px', color: '#8b949e',
                  borderTop: '1px solid #30363d', paddingTop: '10px',
                }}>
                  Showing latest 50 of {alerts.length.toLocaleString()} alerts
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;