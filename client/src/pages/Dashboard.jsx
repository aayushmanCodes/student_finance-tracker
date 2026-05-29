import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Flame, Trophy, Plus, LogOut, TriangleAlert, Clock, Quote, Minus, Edit2, Trash2, X, Target } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';

// Fixed categories
const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];
const INCOME_CATEGORIES = ['Allowance', 'Salary', 'Other'];

export default function Dashboard() {
  const { user, setUser, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // States for Modals & Filters
  const [activeModal, setActiveModal] = useState(null); // 'expense', 'income', 'logout', 'transaction', 'goal', or null
  const [spentFilter, setSpentFilter] = useState('month'); 
  const [formData, setFormData] = useState({ amount: '', category: '', note: '' });
  const [goalFormData, setGoalFormData] = useState({ category: '', limit: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // States for Viewing/Editing
  const [selectedTx, setSelectedTx] = useState(null);
  const [isEditingTx, setIsEditingTx] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false); // NEW: Tracks if we are editing an existing goal

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const txRes = await axios.get('/transactions');
        const goalsRes = await axios.get('/goals');
        
        if (isMounted) {
          setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
          setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  // --- Transaction Handlers ---
  const handleAddTransaction = async (e, type) => {
    e.preventDefault();
    try {
      const payload = { ...formData, type, category: formData.category || (type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]) };
      const res = await axios.post('/transactions', payload);
      
      if (res.data.streak !== undefined && res.data.xp !== undefined) {
        setUser(prev => ({ ...prev, streak: res.data.streak, xp: res.data.xp }));
      }
      
      setFormData({ amount: '', category: '', note: '' });
      setActiveModal(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/transactions/${selectedTx._id}`, formData);
      setActiveModal(null);
      setSelectedTx(null);
      setIsEditingTx(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await axios.delete(`/transactions/${selectedTx._id}`);
      setActiveModal(null);
      setSelectedTx(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const openTransactionDetails = (tx) => {
    setSelectedTx(tx);
    setFormData({ amount: tx.amount, category: tx.category, note: tx.note || '' });
    setIsEditingTx(false);
    setActiveModal('transaction');
  };

  // --- Goal Handlers ---
  const handleSetGoal = async (e) => {
    e.preventDefault();
    try {
      const currentMonthString = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}`;
      
      const payload = { 
        category: goalFormData.category || EXPENSE_CATEGORIES[0], 
        limit: Number(goalFormData.limit), 
        month: currentMonthString 
      };
      
      await axios.post('/goals', payload);
      setGoalFormData({ category: '', limit: '' });
      setIsEditingGoal(false);
      setActiveModal(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to set goal:", error);
    }
  };

  // NEW: Open Goal Edit Modal
  const openEditGoal = (goal) => {
    setGoalFormData({ category: goal.category, limit: goal.limit });
    setIsEditingGoal(true);
    setActiveModal('goal');
  };

  // --- Core Calculations ---
  const balance = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const calculateFilteredSpent = () => {
    const today = new Date();
    return expenses.filter(t => {
      const txDate = new Date(t.date);
      if (spentFilter === 'day') return txDate.toDateString() === today.toDateString();
      if (spentFilter === 'week') {
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        return txDate >= sevenDaysAgo;
      }
      if (spentFilter === 'month') return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
      return true;
    }).reduce((acc, curr) => acc + curr.amount, 0);
  };
  const filteredSpent = calculateFilteredSpent();

  const totalExpenseAmount = expenses.reduce((a, b) => a + b.amount, 0);
  const chartData = expenses.reduce((acc, curr) => {
    const existing = acc.find(x => x.name === curr.category);
    if (existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  const COLORS = ['var(--color-accent)', 'var(--color-alert)', '#4F46E5', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];

  const quotes = [
    "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
    "A budget is telling your money where to go instead of wondering where it went.",
    "Wealth is not about having a lot of money; it's about having a lot of options.",
    "Small daily habits create massive long-term results. Keep logging!"
  ];
  const dailyQuote = quotes[currentTime.getDate() % quotes.length];

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto pb-32 relative">
      {/* Top Navbar & Clock */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Player: {user?.name || 'Loading...'}</h1>
          <div className="flex gap-4 mt-2 font-mono text-sm">
            <span className="flex items-center text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full"><Flame size={16} className="mr-1"/> {user?.streak || 0} Day Streak</span>
            <span className="flex items-center text-accent bg-accent/10 px-3 py-1 rounded-full"><Trophy size={16} className="mr-1"/> {user?.xp || 0} XP</span>
          </div>
        </div>
        <div className="flex items-center glass-card px-4 py-2 text-sm font-mono opacity-80">
          <Clock size={16} className="mr-2 text-accent" />
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString()}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Row 1: Balance, Spent, Actions */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col justify-center">
            <p className="text-textMuted text-sm font-medium">Total Balance</p>
            <h2 className="text-4xl font-mono font-bold mt-2 text-success">
              $<AnimatedNumber value={balance} duration={1500} />
            </h2>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-textMuted text-sm font-medium">Total Spent</p>
              <select className="bg-appBg text-xs p-1 rounded border border-transparent outline-none cursor-pointer"
                value={spentFilter} onChange={(e) => setSpentFilter(e.target.value)}>
                <option value="day">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <h2 className="text-4xl font-mono font-bold text-alert">
              $<AnimatedNumber value={filteredSpent} duration={1000} />
            </h2>
          </div>

          <div className="glass-card p-6 flex flex-col gap-3 justify-center">
            <button onClick={() => { setFormData({ amount: '', category: '', note: '' }); setActiveModal('income'); }} className="bg-success/10 text-success hover:bg-success hover:text-white transition-colors p-3 rounded-xl font-bold flex justify-center items-center">
              <Plus size={20} className="mr-2" /> ADD INCOME
            </button>
            <button onClick={() => { setFormData({ amount: '', category: '', note: '' }); setActiveModal('expense'); }} className="bg-alert/10 text-alert hover:bg-alert hover:text-white transition-colors p-3 rounded-xl font-bold flex justify-center items-center">
              <Minus size={20} className="mr-2" /> ADD EXPENSE
            </button>
          </div>
        </div>

        {/* Row 2: Chart & Breakdown */}
        <div className="md:col-span-3 glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 flex flex-col justify-center items-center">
            <h3 className="font-bold self-start w-full mb-2">Expense Distribution</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center text-textMuted text-sm font-mono">No expenses yet.</div>}
          </div>

          <div className="h-64 overflow-y-auto pr-2">
            <h3 className="font-bold mb-4">Category Breakdown</h3>
            {chartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span>{item.name}</span>
                </div>
                <div className="font-mono">
                  <span className="font-bold mr-2">${item.value}</span>
                  <span className="text-textMuted text-xs">({totalExpenseAmount ? ((item.value / totalExpenseAmount) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-64 overflow-y-auto pr-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Budget Alerts</h3>
              <button onClick={() => { setGoalFormData({ category: '', limit: '' }); setIsEditingGoal(false); setActiveModal('goal'); }} className="text-accent hover:text-white bg-accent/10 hover:bg-accent p-1.5 rounded-lg transition-colors">
                <Target size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {goals.length === 0 ? <p className="text-textMuted text-sm opacity-60">No limits set.</p> : goals.map(goal => (
                <div key={goal._id} className={`p-4 rounded-xl mb-3 border ${goal.alert ? 'bg-alert/10 border-alert text-alert' : 'bg-appBg border-transparent text-textMain'}`}>
                  {/* NEW: Added flex container and Edit button for Goal updating */}
                  <div className="flex justify-between font-mono text-sm mb-2 items-center">
                    <span className="font-bold">{goal.category}</span>
                    <div className="flex items-center gap-3">
                      <span>${goal.spent} / ${goal.limit}</span>
                      <button onClick={() => openEditGoal(goal)} className="text-textMuted hover:text-accent transition-colors p-1">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${goal.alert ? 'bg-alert' : 'bg-success'}`} style={{ width: `${Math.min((goal.spent/goal.limit)*100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Recent Activity & Motivation */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col">
            <h3 className="font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
              {transactions.length === 0 ? <p className="text-textMuted text-sm">No activity yet.</p> : transactions.map(tx => (
                <div 
                  key={tx._id} 
                  onClick={() => openTransactionDetails(tx)}
                  className="flex justify-between items-center p-3 rounded-xl bg-appBg cursor-pointer hover:bg-surface border border-transparent hover:border-textMuted/20 transition-all"
                >
                  <div>
                    <p className="font-bold text-sm">{tx.category}</p>
                    <p className="text-xs text-textMuted">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-mono font-bold ${tx.type === 'income' ? 'text-success' : 'text-textMain'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center text-center bg-accent/5 border-accent/20">
            <Quote size={40} className="text-accent/30 mb-4" />
            <p className="font-mono text-sm md:text-base italic font-medium leading-relaxed">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* --- XP Lore / System Info Footer --- */}
      <div className="mt-8 text-center px-4">
        <p className="text-[11px] text-textMuted/60 max-w-3xl mx-auto leading-relaxed font-mono">
          SYSTEM LORE: Financial discipline is a game of consistency. Logging your transactions yields XP and builds your Daily Streak. A higher streak acts as an active multiplier for your XP gains. Missing a daily log will result in a streak reset to 0. Level up by holding yourself accountable and consistently tracking your expenditure.
        </p>
      </div>

      {/* Secure Logout Button */}
      <button onClick={() => setActiveModal('logout')} className="absolute bottom-6 right-6 flex items-center text-textMuted hover:text-alert transition-colors text-sm font-bold bg-surface px-4 py-2 rounded-full shadow-sm border border-black/5 dark:border-white/5">
        <LogOut size={16} className="mr-2" /> LOGOUT
      </button>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md animate-[fadeIn_0.2s_ease-out] relative">
            
            <button onClick={() => { setActiveModal(null); setIsEditingTx(false); setIsEditingGoal(false); }} className="absolute top-4 right-4 text-textMuted hover:text-textMain transition-colors">
              <X size={20} />
            </button>

            {/* LOGOUT CONFIRMATION MODAL */}
            {activeModal === 'logout' && (
              <div className="text-center mt-4">
                <TriangleAlert size={48} className="text-alert mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">End Session?</h2>
                <p className="text-textMuted mb-6 text-sm">Are you sure you want to log out? Your streak progress is saved.</p>
                <div className="flex gap-4">
                  <button onClick={() => setActiveModal(null)} className="flex-1 p-3 rounded-xl bg-appBg font-bold hover:bg-surface transition-colors">CANCEL</button>
                  <button onClick={logout} className="flex-1 p-3 rounded-xl bg-alert text-white font-bold hover:opacity-90 transition-opacity">CONFIRM</button>
                </div>
              </div>
            )}

            {/* ADD INCOME / EXPENSE MODAL */}
            {(activeModal === 'income' || activeModal === 'expense') && (
              <form onSubmit={(e) => handleAddTransaction(e, activeModal)} className="mt-2">
                <h2 className="text-xl font-bold mb-6 capitalize border-b border-textMuted/20 pb-2">Add {activeModal}</h2>
                <div className="space-y-4">
                  <input type="number" placeholder="Amount ($)" required min="1" className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                  
                  <select required className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="" disabled>Select a Category...</option>
                    {(activeModal === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <input type="text" placeholder="Note (Optional)" className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                    value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className={`w-full p-3 rounded-xl text-white font-bold transition-opacity hover:opacity-90 ${activeModal === 'income' ? 'bg-success' : 'bg-alert'}`}>
                    SAVE LOG
                  </button>
                </div>
              </form>
            )}

            {/* ADD/UPDATE GOAL MODAL */}
            {activeModal === 'goal' && (
              <form onSubmit={handleSetGoal} className="mt-2">
                <h2 className="text-xl font-bold mb-6 border-b border-textMuted/20 pb-2">
                  {isEditingGoal ? 'Update Budget Goal' : 'Set Budget Goal'}
                </h2>
                <p className="text-sm text-textMuted mb-4">Set a monthly spending limit for a specific category. Goals automatically reset each month.</p>
                <div className="space-y-4">
                  <select required disabled={isEditingGoal} className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={goalFormData.category} onChange={(e) => setGoalFormData({...goalFormData, category: e.target.value})}>
                    <option value="" disabled>Select Expense Category...</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <input type="number" placeholder="Monthly Limit ($)" required min="1" className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                    value={goalFormData.limit} onChange={(e) => setGoalFormData({...goalFormData, limit: Number(e.target.value)})} />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="w-full p-3 rounded-xl bg-accent text-white font-bold transition-opacity hover:opacity-90">
                    {isEditingGoal ? 'UPDATE GOAL' : 'SET GOAL'}
                  </button>
                </div>
              </form>
            )}

            {/* TRANSACTION DETAILS / EDIT MODAL */}
            {activeModal === 'transaction' && selectedTx && (
              <div className="mt-2">
                {!isEditingTx ? (
                  // VIEW MODE
                  <>
                    <div className="flex justify-between items-center mb-6 border-b border-textMuted/20 pb-2 pr-6">
                      <h2 className="text-xl font-bold capitalize">Transaction Log</h2>
                    </div>
                    
                    <div className="space-y-4 bg-appBg p-4 rounded-xl">
                      <div>
                        <p className="text-xs text-textMuted font-mono mb-1">Amount</p>
                        <p className={`text-2xl font-mono font-bold ${selectedTx.type === 'income' ? 'text-success' : 'text-textMain'}`}>
                          {selectedTx.type === 'income' ? '+' : '-'}${selectedTx.amount}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-textMuted font-mono mb-1">Category</p>
                          <p className="font-bold">{selectedTx.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-textMuted font-mono mb-1">Date</p>
                          <p className="font-bold text-sm">{new Date(selectedTx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {selectedTx.note && (
                        <div>
                          <p className="text-xs text-textMuted font-mono mb-1">Note</p>
                          <p className="text-sm bg-surface p-2 rounded-lg italic">"{selectedTx.note}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button onClick={() => setIsEditingTx(true)} className="flex-1 p-3 rounded-xl bg-accent/10 text-accent font-bold hover:bg-accent hover:text-white transition-colors flex justify-center items-center">
                        <Edit2 size={16} className="mr-2" /> EDIT
                      </button>
                      <button onClick={handleDeleteTransaction} className="flex-1 p-3 rounded-xl bg-alert/10 text-alert font-bold hover:bg-alert hover:text-white transition-colors flex justify-center items-center">
                        <Trash2 size={16} className="mr-2" /> DELETE
                      </button>
                    </div>
                  </>
                ) : (
                  // EDIT MODE
                  <form onSubmit={handleUpdateTransaction}>
                    <h2 className="text-xl font-bold mb-6 border-b border-textMuted/20 pb-2 pr-6">Edit Log</h2>
                    <div className="space-y-4">
                      <input type="number" required min="1" className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                        value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                      
                      <select required className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                        value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {(selectedTx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      <input type="text" placeholder="Note (Optional)" className="w-full p-3 rounded-xl bg-appBg outline-none focus:ring-2 focus:ring-accent"
                        value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button type="button" onClick={() => setIsEditingTx(false)} className="flex-1 p-3 rounded-xl bg-appBg font-bold hover:bg-surface transition-colors">CANCEL</button>
                      <button type="submit" className="flex-1 p-3 rounded-xl bg-accent text-white font-bold hover:opacity-90 transition-opacity">SAVE CHANGES</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}