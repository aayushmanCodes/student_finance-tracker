import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addWishlistItem, deleteWishlistItem } from '../api/services';

export default function GuiltTripWishlist({ wishlist, transactions }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', price: '', emoji: '⌚' });

  // Elegant React Query mutations. No prop drilling required.
  const addMutation = useMutation({
    mutationFn: addWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      setForm({ ...form, name: '', price: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const regretTotal = transactions.filter(t => {
    const txMonth = new Date(t.date).toISOString().slice(0, 7);
    return t.type === 'expense' && t.spendRating === 'regret' && txMonth === currentMonth;
  }).reduce((a, t) => a + t.amount, 0);

  return (
    <div className="bg-ft-card rounded-2xl p-5 shadow-card border border-ft-border animate-slide-up">
      <p className="text-ft-text font-semibold mb-1">Wishlist</p>
      <p className="text-ft-muted text-xs mb-4">See what your money could've bought instead.</p>
      
      <div className="flex gap-2 mb-5">
        <input 
          className="w-12 bg-ft-bg border border-ft-border rounded-xl px-2 py-2 text-center focus:outline-none focus:border-ft-accent text-lg" 
          value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} 
        />
        <input
          className="flex-1 bg-ft-bg border border-ft-border text-ft-text rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-ft-accent"
          placeholder="I want..." value={form.name} onChange={e => setForm({...form, name: e.target.value})}
        />
        <input
          className="w-24 bg-ft-bg border border-ft-border text-ft-text font-mono rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-ft-accent"
          type="number" placeholder="₹ Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
        />
        <button 
          onClick={() => { if(form.name && form.price) addMutation.mutate(form) }} 
          className="btn-lift bg-ft-accent text-white px-4 rounded-xl font-medium disabled:opacity-50"
          disabled={addMutation.isPending}
        >
          +
        </button>
      </div>

      {regretTotal > 0 && wishlist.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-ft-expense/10 border border-ft-expense/25">
          <p className="text-ft-expense text-xs">
            You wasted <span className="font-mono font-bold">₹{regretTotal}</span> on regret buys this month.
            That could've gone toward <span className="font-semibold">{wishlist[0].emoji} {wishlist[0].name}</span>.
            {regretTotal >= wishlist[0].price ? ' You would\'ve had it already.' : ` (You'd be ${Math.round((regretTotal / wishlist[0].price) * 100)}% there).`}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {wishlist.map(item => (
          <div key={item._id} className="card-lift bg-ft-bg rounded-xl p-4 border border-ft-border flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-medium text-ft-text">{item.name}</p>
                <p className="text-xs text-ft-muted font-mono">₹{item.price}</p>
              </div>
            </div>
            <button onClick={() => deleteMutation.mutate(item._id)} className="text-ft-muted hover:text-ft-expense transition-colors text-sm">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}