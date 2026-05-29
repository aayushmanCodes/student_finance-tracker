import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Wallet size={48} className="text-accent mb-4" />
          <h1 className="text-2xl font-bold">Welcome to Finance Tracker</h1>
          <p className="text-textMuted text-sm mt-2">Level up your money management.</p>
        </div>

        {error && <div className="bg-alert/10 text-alert p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input type="text" placeholder="Full Name" required
              className="w-full p-3 rounded-xl bg-appBg border border-transparent focus:border-accent outline-none transition-colors"
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          )}
          <input type="email" placeholder="Email" required
            className="w-full p-3 rounded-xl bg-appBg border border-transparent focus:border-accent outline-none transition-colors"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required
            className="w-full p-3 rounded-xl bg-appBg border border-transparent focus:border-accent outline-none transition-colors"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" className="w-full bg-accent text-white font-bold p-3 rounded-xl hover:opacity-90 transition-opacity mt-2 shadow-[0_0_15px_var(--accent)] shadow-accent/20">
            {isLogin ? 'INITIATE LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-6 text-sm text-textMuted hover:text-accent transition-colors">
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}