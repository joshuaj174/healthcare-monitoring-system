import { useState } from 'react';
import { subscribeToHospital, unsubscribeFromHospital } from '../services/hospitalService';

const getDangerRating = (alertCount) => {
  if (alertCount >= 30000) return 5;
  if (alertCount >= 15000) return 4;
  if (alertCount >= 5000)  return 3;
  if (alertCount >= 1000)  return 2;
  return 1;
};

const ratingColors = ['', '#28a745', '#8bc34a', '#ffc107', '#ff7043', '#dc3545'];

const HospitalCard = ({ hospital, isSubscribed, onSubscriptionChange, alertCount = 0 }) => {
  const isCritical = hospital.status === 'Critical';
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const rating = getDangerRating(alertCount);

  const handleSubscription = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromHospital(hospital._id);
        setSubscribed(false);
        onSubscriptionChange && onSubscriptionChange(hospital._id, false);
      } else {
        await subscribeToHospital(hospital._id);
        setSubscribed(true);
        onSubscriptionChange && onSubscriptionChange(hospital._id, true);
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#161b22',
      border: `1px solid ${isCritical ? '#7d0000' : '#30363d'}`,
      borderRadius: '10px',
      padding: '12px 14px',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: 600, color: '#e6edf3',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {hospital.name}
          </div>
          <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '1px' }}>{hospital.region}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
            background: isCritical ? '#3d0000' : '#003d1a',
            color: isCritical ? '#ff6b6b' : '#69db7c',
            border: `1px solid ${isCritical ? '#7d0000' : '#007d35'}`,
          }}>
            {hospital.status}
          </span>
          <button
            onClick={handleSubscription}
            disabled={loading}
            title={subscribed ? 'Unsubscribe from email alerts' : 'Subscribe to email alerts'}
            style={{
              background: subscribed ? '#1a3a1a' : '#21262d',
              border: `1px solid ${subscribed ? '#28a745' : '#30363d'}`,
              borderRadius: '6px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: subscribed ? '#69db7c' : '#8b949e',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '…' : subscribed ? 'Subscribed' : 'Not subscribed'}
          </button>
        </div>
      </div>

      {/* Subscribed strip */}
      {subscribed && (
        <div style={{
          fontSize: '10px', color: '#69db7c', padding: '3px 8px',
          background: '#0d2b0d', borderRadius: '4px',
          border: '1px solid #1a4a1a', marginBottom: '8px',
        }}>
          ✅ Email alerts active
        </div>
      )}

      {/* Danger rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: '#8b949e' }}>Danger:</span>
        <div style={{ display: 'flex', gap: '1px' }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: '12px', color: s <= rating ? ratingColors[rating] : '#30363d' }}>★</span>
          ))}
        </div>
        <span style={{ fontSize: '10px', color: ratingColors[rating], fontWeight: 600 }}>
          {rating}/5
        </span>
      </div>

      {/* Capacity bar */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '10px', color: '#8b949e' }}>Bed Capacity</span>
          <span style={{ fontSize: '10px', color: isCritical ? '#ff6b6b' : '#69db7c', fontWeight: 600 }}>
            {hospital.capacity}%
          </span>
        </div>
        <div style={{ height: '5px', background: '#30363d', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${hospital.capacity}%`,
            background: isCritical ? '#dc3545' : '#28a745',
            borderRadius: '3px', transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Medicine bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '10px', color: '#8b949e' }}>Medicine Supply</span>
          <span style={{ fontSize: '10px', color: hospital.medicineSupply < 30 ? '#ffa94d' : '#74c0fc', fontWeight: 600 }}>
            {hospital.medicineSupply}%
          </span>
        </div>
        <div style={{ height: '5px', background: '#30363d', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${hospital.medicineSupply}%`,
            background: hospital.medicineSupply < 30 ? '#fd7e14' : '#0dcaf0',
            borderRadius: '3px', transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;