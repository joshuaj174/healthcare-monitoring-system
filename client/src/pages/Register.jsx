import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await registerUser(form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h4 className="text-white text-center mb-1">Create Account</h4>
        <p className="text-secondary text-center mb-4 small">Join the monitoring network</p>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Username</label>
            <input name="username" className="form-control" placeholder="johndoe" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-secondary small">Email</label>
            <input name="email" type="email" className="form-control" placeholder="you@example.com" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-secondary small">Password</label>
            <input name="password" type="password" className="form-control" placeholder="••••••••" onChange={handleChange} required />
          </div>
          <button className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-secondary small mt-3">
          Already have an account? <Link to="/login" className="text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;