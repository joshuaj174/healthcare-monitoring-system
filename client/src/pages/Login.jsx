import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await loginUser(form);
      // Check role matches selected mode
      if (isAdmin && data.role !== 'admin') {
        setError('This account does not have admin privileges');
        setLoading(false);
        return;
      }
      if (!isAdmin && data.role === 'admin') {
        setError('Please use the Admin Login option for admin accounts');
        setLoading(false);
        return;
      }
      login(data);
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0d1117',
    }}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d',
        borderRadius: '14px', padding: '40px',
        width: '100%', maxWidth: '420px',
      }}>
        {/* Toggle: User / Admin */}
        <div style={{
          display: 'flex', background: '#0d1117',
          borderRadius: '8px', padding: '4px',
          marginBottom: '24px', border: '1px solid #30363d',
        }}>
          {[
            { label: 'User Login',  value: false },
            { label: 'Admin Login', value: true  },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => { setIsAdmin(opt.value); setError(''); }}
              style={{
                flex: 1, padding: '8px', borderRadius: '6px',
                border: 'none', cursor: 'pointer', fontSize: '13px',
                fontWeight: isAdmin === opt.value ? 600 : 400,
                background: isAdmin === opt.value
                  ? (opt.value ? '#3d1f00' : '#1f3a5f')
                  : 'transparent',
                color: isAdmin === opt.value
                  ? (opt.value ? '#ffd43b' : '#58a6ff')
                  : '#8b949e',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h4 style={{
          color: '#e6edf3', textAlign: 'center',
          marginBottom: '4px', fontWeight: 700,
        }}>
          {isAdmin ? 'Admin Portal' : 'Healthcare Monitor'}
        </h4>
        <p style={{
          color: '#8b949e', textAlign: 'center',
          fontSize: '13px', marginBottom: '28px',
        }}>
          {isAdmin ? 'Sign in with your admin credentials' : 'Sign in to your account'}
        </p>

        {isAdmin && (
          <div style={{
            background: '#3d1f00', border: '1px solid #7d4f00',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '12px', color: '#ffd43b', marginBottom: '16px',
          }}>
          Admin access only. Unauthorized access is prohibited.
          </div>
        )}

        {error && (
          <div style={{
            background: '#3d0000', border: '1px solid #7d0000',
            color: '#ff6b6b', borderRadius: '8px',
            padding: '10px 14px', fontSize: '13px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontSize: '12px', color: '#8b949e',
              display: 'block', marginBottom: '6px',
            }}>
              {isAdmin ? 'Admin Email' : 'Email'}
            </label>
            <input
              name="email" type="email"
              placeholder={isAdmin ? 'admin@healthcare.com' : 'you@example.com'}
              onChange={handleChange} required
              style={{
                width: '100%', background: '#0d1117',
                border: `1px solid ${isAdmin ? '#7d4f00' : '#30363d'}`,
                borderRadius: '8px', color: '#e6edf3',
                fontSize: '13px', padding: '10px 12px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '12px', color: '#8b949e',
              display: 'block', marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              name="password" type="password"
              placeholder="••••••••"
              onChange={handleChange} required
              style={{
                width: '100%', background: '#0d1117',
                border: `1px solid ${isAdmin ? '#7d4f00' : '#30363d'}`,
                borderRadius: '8px', color: '#e6edf3',
                fontSize: '13px', padding: '10px 12px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%',
              background: isAdmin ? '#7d4f00' : '#1f6feb',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px',
              fontWeight: 600, padding: '11px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : isAdmin ? 'Admin Sign In' : 'Sign In'}
          </button>
        </form>

        {!isAdmin && (
          <p style={{
            textAlign: 'center', fontSize: '12px',
            color: '#8b949e', marginTop: '20px', marginBottom: 0,
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#58a6ff', textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;