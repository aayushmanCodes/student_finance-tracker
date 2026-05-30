import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/register', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-6">
          <p className="text-ft-muted text-[10px] tracking-widest uppercase mb-1 font-mono">New Agent Entry</p>
          <h1 className="text-2xl font-mono font-black text-ft-text tracking-tight">Create Account</h1>
          <p className="text-ft-muted text-xs mt-1.5">Level up your money game.</p>
        </div>
        
        <div className="bg-ft-card rounded-2xl p-6 shadow-card border border-ft-border animate-slide-up">
          {error && (
            <div className="bg-ft-expense/10 border border-ft-expense/30 text-ft-expense text-xs font-medium px-3 py-2.5 rounded-xl mb-5">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-ft-muted text-[10px] uppercase tracking-widest mb-1.5 block font-mono">Alias (Name)</label>
              <input
                className="w-full bg-ft-bg border border-ft-border text-ft-text rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-ft-accent transition-colors"
                type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-ft-muted text-[10px] uppercase tracking-widest mb-1.5 block font-mono">Email</label>
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
                type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required minLength="6"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-lift w-full bg-ft-accent text-white font-bold py-2.5 rounded-xl mt-2 text-sm transition-colors hover:bg-(--accent-hover) disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Execute Registration →'}
            </button>
          </form>
          
          <p className="text-center text-ft-muted text-xs mt-6">
            Already in the system?{' '}
            <Link to="/login" className="text-ft-accent font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}