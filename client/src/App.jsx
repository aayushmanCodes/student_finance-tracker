import { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary'; // <-- IMPORT THIS
import { Moon, Sun } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="h-screen flex justify-center items-center font-mono animate-pulse">LOADING...</div>;
  return user ? children : <Navigate to="/auth" />;
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)} className="fixed top-6 right-6 p-3 rounded-full glass-card text-accent z-50">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeToggle />
        {/* WRAP YOUR ROUTES IN THE ERROR BOUNDARY */}
        <ErrorBoundary>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}