import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const userLinks = [
    { path: '/',          label: 'Dashboard'    },
    { path: '/watchlist', label: 'Watchlist'     },
    { path: '/find',      label: 'Find Hospital' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Panel' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <nav style={{
      background: user?.role === 'admin'
        ? 'linear-gradient(135deg, #3d1f00, #1a1a2e)'
        : 'linear-gradient(135deg, #0f3460, #1a1a2e)',
      borderBottom: `1px solid ${user?.role === 'admin' ? '#7d4f00' : '#30363d'}`,
      padding: '0 24px', display: 'flex',
      alignItems: 'center', height: '54px',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <Link to={user?.role === 'admin' ? '/admin' : '/'} style={{
        color: user?.role === 'admin' ? '#ffd43b' : '#e6edf3',
        fontWeight: 700, fontSize: '15px',
        textDecoration: 'none', marginRight: '24px', whiteSpace: 'nowrap',
      }}>
      Healthcare Monitor
      </Link>

      {user && (
        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {links.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} style={{
                color: active
                  ? (user?.role === 'admin' ? '#ffd43b' : '#58a6ff')
                  : '#8b949e',
                fontSize: '13px', textDecoration: 'none',
                padding: '6px 14px', borderRadius: '6px',
                background: active ? '#21262d' : 'transparent',
                border: active
                  ? `1px solid ${user?.role === 'admin' ? '#7d4f00' : '#388bfd'}`
                  : '1px solid transparent',
                fontWeight: active ? 600 : 400,
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <span style={{ fontSize: '12px', color: '#8b949e' }}>
              {user?.role === 'admin' ? '' : ''} {user.username}
            </span>
            {user?.role === 'admin' && (
              <span style={{
                fontSize: '10px', background: '#3d1f00',
                color: '#ffd43b', padding: '2px 8px',
                borderRadius: '10px', border: '1px solid #7d4f00',
                fontWeight: 600,
              }}>
                ADMIN
              </span>
            )}
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1px solid #f85149', borderRadius: '6px',
              color: '#f85149', fontSize: '12px',
              padding: '5px 14px', cursor: 'pointer',
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: '#8b949e', fontSize: '13px', textDecoration: 'none',
              padding: '5px 14px', border: '1px solid #30363d', borderRadius: '6px',
            }}>Login</Link>
            <Link to="/register" style={{
              color: '#fff', fontSize: '13px', textDecoration: 'none',
              padding: '5px 14px', background: '#1f6feb', borderRadius: '6px',
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;