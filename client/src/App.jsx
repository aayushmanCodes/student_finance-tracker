import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// The Bouncer: Kicks unauthenticated users to the login screen
const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-text font-sans selection:bg-ft-accent/30">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
      </Routes>
    </div>
  );
}