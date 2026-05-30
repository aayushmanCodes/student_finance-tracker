import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'System rejection. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      {/* TIGHTENED CONTAINER: max-w-sm instead of max-w-md */}
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-6">
          <p className="text-ft-muted text-[10px] tracking-widest uppercase mb-1 font-mono">System Protocol</p>
          <h1 className="text-2xl font-mono font-black text-ft-text tracking-tight">Finance Tracker</h1>
          <p className="text-ft-muted text-xs mt-1.5">Face your financial reality.</p>
        </div>
        
        {/* REDUCED PADDING: p-6 instead of p-8 */}
        <div className="bg-ft-card rounded-2xl p-6 shadow-card border border-ft-border animate-slide-up">
          {error && (
            <div className="bg-ft-expense/10 border border-ft-expense/30 text-ft-expense text-xs font-medium px-3 py-2.5 rounded-xl mb-5">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-ft-muted text-[10px] uppercase tracking-widest mb-1.5 block font-mono">Email</label>
              {/* SLIMMER INPUTS: py-2.5 instead of py-3 */}
              <input
                className="w-full bg-ft-bg border border-ft-border text-ft-text rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-ft-accent transition-colors"
                type="email" placeholder="agent@system.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="text-ft-muted text-[10px] uppercase tracking-widest mb-1.5 block font-mono">Password</label>
              <input
                className="w-full bg-ft-bg border border-ft-border text-ft-text rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-ft-accent transition-colors"
                type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            
            {/* SLIMMER BUTTON: py-2.5 */}
            <button
              type="submit"
              disabled={loading}
              className="btn-lift w-full bg-ft-accent text-white font-bold py-2.5 rounded-xl mt-2 text-sm transition-colors hover:bg-(--accent-hover) disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Initialize Session →'}
            </button>
          </form>
          
          <p className="text-center text-ft-muted text-xs mt-6">
            No account found?{' '}
            <Link to="/register" className="text-ft-accent font-semibold hover:underline">Register Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}