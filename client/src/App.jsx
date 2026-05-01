import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Dashboard   from './pages/Dashboard';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Watchlist   from './pages/Watchlist';
import BedFinder   from './pages/BedFinder';
import AdminPanel  from './pages/AdminPanel';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"       element={<Dashboard />}  />
          <Route path="/login"  element={<Login />}       />
          <Route path="/register" element={<Register />}  />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/find"   element={<BedFinder />}  />
          <Route path="/admin"  element={<AdminPanel />} />
          <Route path="*"       element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;