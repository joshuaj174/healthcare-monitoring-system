import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHospitals, getAlerts, getMySubscriptions, subscribeToHospital, unsubscribeFromHospital } from '../services/hospitalService';
import { useAuth } from '../context/AuthContext';

const getDangerRating = (alertCount) => {
  if (alertCount >= 30000) return 5;
  if (alertCount >= 15000) return 4;
  if (alertCount >= 5000)  return 3;
  if (alertCount >= 1000)  return 2;
  return 1;
};

const ratingColors = ['', '#28a745', '#8bc34a', '#ffc107', '#ff7043', '#dc3545'];

const Watchlist = () => {
  const [hospitals, setHospitals]           = useState([]);
  const [alerts, setAlerts]                 = useState([]);
  const [subscriptions, setSubscriptions]   = useState([]);
  const [alertCounts, setAlertCounts]       = useState({});
  const [loading, setLoading]               = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [loadingId, setLoadingId]           = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const [hRes, aRes, sRes] = await Promise.all([
        getHospitals(), getAlerts(), getMySubscriptions(),
      ]);
      setHospitals(hRes.data);
      setAlerts(aRes.data);
      setSubscriptions(sRes.data);

      // Build alert counts
      const counts = {};
      hRes.data.forEach(h => { counts[h._id] = 0; });
      aRes.data.forEach(a => {
        const id = a.hospitalId?._id || a.hospitalId;
        if (id && counts[id] !== undefined) counts[id]++;
      });
      setAlertCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (hospitalId) => {
    setLoadingId(hospitalId);
    try {
      await unsubscribeFromHospital(hospitalId);
      setSubscriptions(prev => prev.filter(id => id !== hospitalId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSubscribe = async (hospitalId) => {
    setLoadingId(hospitalId);
    try {
      await subscribeToHospital(hospitalId);
      setSubscriptions(prev => [...prev, hospitalId]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // Get unique regions from all hospitals
  const regions = ['All', ...new Set(hospitals.map(h => {
    const parts = h.region.split(',');
    return parts[parts.length - 1].trim();
  }))].sort();

  // Hospitals filtered by region
  const hospitalsByRegion = selectedRegion === 'All'
    ? hospitals
    : hospitals.filter(h => h.region.includes(selectedRegion));

  // Subscribed hospitals
  const subscribedHospitals = hospitals.filter(h => subscriptions.includes(h._id));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', background: '#0d1117' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', padding: '24px' }}>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#e6edf3', margin: '0 0 4px', fontWeight: 700 }}>Watchlist & Subscriptions</h4>
        <p style={{ color: '#8b949e', margin: 0, fontSize: '13px' }}>
          Manage your hospital email alerts. Select a region and hospital below to subscribe.
        </p>
      </div>

      <div className="row g-4">

        {/* Left — Subscribe to new hospitals */}
        <div className="col-lg-5">
          <div style={{
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: '12px', padding: '20px',
          }}>
            <h6 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '16px', fontSize: '13px' }}>
            Subscribe to a Hospital
            </h6>

            {/* Region dropdown */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                SELECT REGION
              </label>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  color: '#e6edf3',
                  fontSize: '13px',
                  padding: '10px 12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {regions.map(r => (
                  <option key={r} value={r} style={{ background: '#0d1117' }}>{r}</option>
                ))}
              </select>
            </div>

            {/* Hospital list for selected region */}
            <div style={{ marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                HOSPITALS IN REGION ({hospitalsByRegion.length})
              </label>
            </div>

            <div style={{ maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hospitalsByRegion.map(h => {
                const isSubscribed = subscriptions.includes(h._id);
                const isCritical   = h.status === 'Critical';
                const rating       = getDangerRating(alertCounts[h._id] || 0);
                return (
                  <div key={h._id} style={{
                    background: '#0d1117',
                    border: `1px solid ${isCritical ? '#7d0000' : '#30363d'}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px', fontWeight: 600, color: '#e6edf3',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {h.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
                          background: isCritical ? '#3d0000' : '#003d1a',
                          color: isCritical ? '#ff6b6b' : '#69db7c',
                        }}>
                          {h.status}
                        </span>
                        <span style={{ fontSize: '11px', color: ratingColors[rating] }}>
                          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                        </span>
                        <span style={{ fontSize: '10px', color: '#8b949e' }}>
                          Cap: {h.capacity}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => isSubscribed ? handleUnsubscribe(h._id) : handleSubscribe(h._id)}
                      disabled={loadingId === h._id}
                      style={{
                        background: isSubscribed ? '#1a3a1a' : '#1f3a5f',
                        border: `1px solid ${isSubscribed ? '#28a745' : '#1f6feb'}`,
                        borderRadius: '6px',
                        color: isSubscribed ? '#69db7c' : '#58a6ff',
                        fontSize: '11px',
                        padding: '5px 12px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}
                    >
                      {loadingId === h._id ? '…' : isSubscribed ? ' Subscribed' : ' Subscribe'}
                    </button>
                  </div>
                );
              })}
              {hospitalsByRegion.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8b949e', padding: '30px', fontSize: '13px' }}>
                  No hospitals in this region.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Current subscriptions */}
        <div className="col-lg-7">
          <div style={{
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h6 style={{ color: '#e6edf3', fontWeight: 600, margin: 0, fontSize: '13px' }}>
                📋 Your Active Subscriptions
              </h6>
              <span style={{
                fontSize: '11px', background: '#1f3a5f',
                color: '#74c0fc', padding: '2px 10px',
                borderRadius: '20px', border: '1px solid #1f6feb',
              }}>
                {subscribedHospitals.length} hospitals
              </span>
            </div>

            {subscribedHospitals.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                color: '#8b949e', fontSize: '13px',
              }}>
                <div style={{ fontWeight: 500, marginBottom: '6px', color: '#e6edf3' }}>
                  No subscriptions yet
                </div>
                <div>Select a region and subscribe to hospitals on the left to receive email alerts when they go critical.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {subscribedHospitals.map(h => {
                  const isCritical = h.status === 'Critical';
                  const rating     = getDangerRating(alertCounts[h._id] || 0);
                  return (
                    <div key={h._id} style={{
                      background: '#0d1117',
                      border: `1px solid ${isCritical ? '#7d0000' : '#30363d'}`,
                      borderRadius: '10px',
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{h.name}</div>
                          <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>{h.region}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                            background: isCritical ? '#3d0000' : '#003d1a',
                            color: isCritical ? '#ff6b6b' : '#69db7c',
                            border: `1px solid ${isCritical ? '#7d0000' : '#007d35'}`,
                          }}>
                            {h.status}
                          </span>
                          <button
                            onClick={() => handleUnsubscribe(h._id)}
                            disabled={loadingId === h._id}
                            style={{
                              background: 'transparent',
                              border: '1px solid #f85149',
                              borderRadius: '6px',
                              color: '#f85149',
                              fontSize: '11px',
                              padding: '3px 10px',
                              cursor: 'pointer',
                            }}
                          >
                            {loadingId === h._id ? '…' : 'Unsubscribe'}
                          </button>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '10px', color: '#8b949e' }}>Bed Capacity</span>
                            <span style={{ fontSize: '10px', color: isCritical ? '#ff6b6b' : '#69db7c', fontWeight: 600 }}>{h.capacity}%</span>
                          </div>
                          <div style={{ height: '4px', background: '#30363d', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${h.capacity}%`, background: isCritical ? '#dc3545' : '#28a745', borderRadius: '2px' }} />
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '10px', color: '#8b949e' }}>Medicine Supply</span>
                            <span style={{ fontSize: '10px', color: h.medicineSupply < 30 ? '#ffa94d' : '#74c0fc', fontWeight: 600 }}>{h.medicineSupply}%</span>
                          </div>
                          <div style={{ height: '4px', background: '#30363d', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${h.medicineSupply}%`, background: h.medicineSupply < 30 ? '#fd7e14' : '#0dcaf0', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </div>

                      {/* Danger rating + alert count */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #21262d' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8b949e' }}>Danger:</span>
                          <span style={{ fontSize: '13px', color: ratingColors[rating], letterSpacing: '-1px' }}>
                            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                          </span>
                          <span style={{ fontSize: '10px', color: ratingColors[rating], fontWeight: 600 }}>{rating}/5</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#8b949e' }}>
                          {(alertCounts[h._id] || 0).toLocaleString()} alerts generated
                        </div>
                        <div style={{
                          fontSize: '10px', color: '#69db7c',
                          background: '#0d2b0d', padding: '2px 8px',
                          borderRadius: '10px', border: '1px solid #1a4a1a',
                          marginLeft: 'auto',
                        }}>
                        Email alerts ON
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watchlist;