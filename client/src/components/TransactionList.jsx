import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTransaction, updateTransaction } from '../api/services';
import { Pencil, Trash2, X } from 'lucide-react';

const CATEGORIES = ['Food', 'Boba & Drinks', 'Shopping', 'Transport', 'Gaming', 'Going Out', 'Misc'];

export default function TransactionList({ transactions }) {
  const queryClient = useQueryClient();
  
  // State for Delete Confirmation (Holds the ID of the transaction to delete)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // State for the Edit Modal (Holds the form data of the transaction being edited)
  const [editForm, setEditForm] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      setConfirmDeleteId(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      setEditForm(null); // Close modal on success
    }
  });

  const handleEditClick = (tx) => {
    // Format MongoDB date to YYYY-MM-DD for the HTML input
    const formattedDate = new Date(tx.date).toISOString().split('T')[0];
    setEditForm({ ...tx, date: formattedDate, note: tx.note || '' });
  };

  const handleSaveEdit = () => {
    if (!editForm.amount || !editForm.date) return;
    updateMutation.mutate({ 
      id: editForm._id, 
      data: { ...editForm, amount: Number(editForm.amount) } 
    });
  };

  return (
    <div className="bg-ft-card rounded-2xl p-5 shadow-card border border-ft-border animate-slide-up relative">
      <p className="text-ft-text font-semibold mb-4">Recent Activity</p>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {transactions.length === 0 ? (
          <p className="text-ft-muted text-sm text-center py-8">Nothing here yet</p>
        ) : (
          transactions.map(t => (
            <div key={t._id} className="card-lift flex items-center justify-between p-3 rounded-xl bg-ft-bg border border-ft-border group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${t.type === 'income' ? 'bg-ft-income/10 text-ft-income' : 'bg-ft-expense/10 text-ft-expense'}`}>
                  {t.type === 'income' ? '+' : '-'}
                </div>
                <div>
                  <p className="text-ft-text text-sm font-medium">
                    {t.category}
                    {t.spendRating === 'regret' && <span className="ml-2 text-[10px] bg-ft-expense/20 text-ft-expense px-2 py-0.5 rounded-full uppercase tracking-widest">Regret</span>}
                    {t.spendRating === 'w' && <span className="ml-2 text-[10px] bg-ft-income/20 text-ft-income px-2 py-0.5 rounded-full uppercase tracking-widest">W</span>}
                  </p>
                  <p className="text-ft-muted text-xs">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {t.note && <span className="ml-1 opacity-75">— {t.note}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-mono font-semibold text-sm ${t.type === 'income' ? 'text-ft-income' : 'text-ft-expense'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount}
                </span>

                {/* Inline Delete Confirmation OR Standard Actions */}
                {confirmDeleteId === t._id ? (
                  <div className="flex items-center gap-2 ml-2 bg-ft-expense/10 px-2 py-1 rounded-lg border border-ft-expense/20">
                    <span className="text-[10px] text-ft-expense font-bold uppercase tracking-widest mr-1">Sure?</span>
                    <button onClick={() => deleteMutation.mutate(t._id)} className="text-ft-expense hover:text-white text-xs font-bold transition-colors">Yes</button>
                    <span className="text-ft-muted text-xs">|</span>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-ft-muted hover:text-white text-xs font-bold transition-colors">No</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={() => handleEditClick(t)} className="text-ft-muted hover:text-ft-accent transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(t._id)} className="text-ft-muted hover:text-ft-expense transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT MODAL OVERLAY */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-ft-card rounded-2xl p-6 w-full max-w-sm border border-ft-border shadow-2xl animate-slide-up relative">
            
            <button onClick={() => setEditForm(null)} className="absolute top-4 right-4 text-ft-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <p className="text-ft-text font-semibold mb-5">Edit Transaction</p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  className="w-1/2 bg-ft-bg border border-ft-border text-ft-text font-mono rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
                  type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})}
                />
                <input
                  className="w-1/2 bg-ft-bg border border-ft-border text-ft-text font-mono rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
                  type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})}
                />
              </div>

              <select 
                className="w-full bg-ft-bg border border-ft-border text-ft-text rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
                value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <input
                className="w-full bg-ft-bg border border-ft-border text-ft-text rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ft-accent"
                type="text" placeholder="Note" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})}
              />
              
              <button 
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="btn-lift w-full bg-ft-accent text-white font-bold py-3 rounded-xl mt-2 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}