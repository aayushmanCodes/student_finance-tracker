import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTransaction } from '../api/services';

const EXPENSE_CATEGORIES = ['Food', 'Boba & Drinks', 'Shopping', 'Transport', 'Gaming', 'Going Out', 'Misc'];
const INCOME_CATEGORIES = ['Salary', 'Allowance', 'Other'];

export default function AddTransaction() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  
  const [form, setForm] = useState({ 
    type: 'expense', 
    amount: '', 
    category: EXPENSE_CATEGORIES[0], 
    note: '', 
    date: today 
  });
  
  const [rating, setRating] = useState(null);
  const [shake, setShake] = useState(false);

  // Add this state at the top of your component with your other useState hooks:
const [error, setError] = useState('');

// Update your addMutation to this:
const addMutation = useMutation({
  mutationFn: addTransaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    setForm({ ...form, amount: '', note: '', date: today });
    setRating(null);
    setError(''); // Clear errors on success
  },
  onError: (err) => {
    // This will catch backend errors and display them!
    setError(err.response?.data?.message || 'System Error: Could not save transaction.');
  }
});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) return;

    if (rating === 'regret') {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    addMutation.mutate({ 
      ...form, 
      amount: Number(form.amount), 
      spendRating: form.type === 'expense' ? rating : null 
    });
  };

  {error && (
  <div className="bg-ft-expense/10 border border-ft-expense/30 text-ft-expense text-xs font-medium px-3 py-2 rounded-xl mb-4">
    {error}
  </div>
)}

  // Determine which list to render based on the current toggle state
  const activeCategories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className={`bg-ft-card rounded-2xl p-5 shadow-card border border-ft-border animate-slide-up ${shake ? 'animate-shake' : ''}`}>
      <p className="text-ft-text font-semibold mb-4">Log Transaction</p>
      
      <div className="flex gap-2 mb-4 bg-ft-bg rounded-xl p-1">
        {['expense', 'income'].map(t => (
          <button 
            key={t}
            onClick={() => { 
              // Instantly swap the category to the correct list's default to prevent mismatched data
              const defaultCategory = t === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
              setForm({ ...form, type: t, category: defaultCategory }); 
              setRating(null); 
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.type === t ? (t === 'expense' ? 'bg-ft-expense text-white' : 'bg-ft-income text-ft-bg') : 'text-ft-muted hover:text-ft-text'}`}
          >
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="w-1/3 bg-ft-bg border border-ft-border text-ft-text font-mono rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
          type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required
        />
        <input
          className="w-1/3 bg-ft-bg border border-ft-border text-ft-text font-mono rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
          type="number" placeholder="₹ Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required
        />
        <select 
          className="w-1/3 bg-ft-bg border border-ft-border text-ft-text rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
          value={form.category} onChange={e => setForm({...form, category: e.target.value})}
        >
          {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <input
          className="w-full bg-ft-bg border border-ft-border text-ft-text rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
          type="text" placeholder="Note (e.g., Zomato late night)" value={form.note} onChange={e => setForm({...form, note: e.target.value})}
        />
      </div>

      {form.type === 'expense' && (
        <div className="flex gap-2 mb-4">
          <p className="text-ft-muted text-xs self-center mr-1">Rate it:</p>
          <button onClick={() => setRating(rating === 'w' ? null : 'w')} className={`btn-lift flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${rating === 'w' ? 'bg-ft-income/20 border-ft-income text-ft-income' : 'border-ft-border text-ft-muted hover:border-ft-accent/40'}`}>W Spend</button>
          <button onClick={() => setRating(rating === 'regret' ? null : 'regret')} className={`btn-lift flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${rating === 'regret' ? 'bg-ft-expense/20 border-ft-expense text-ft-expense' : 'border-ft-border text-ft-muted hover:border-ft-accent/40'}`}>Regret</button>
        </div>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={addMutation.isPending}
        className="btn-lift w-full bg-ft-accent text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        Log it
      </button>
    </div>
  );
}