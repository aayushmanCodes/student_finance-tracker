import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../api/services';
import StatsBar from '../components/StatsBar'; 
import MinecraftHealthBar from '../components/MinecraftHealthBar';
import GuiltTripWishlist from '../components/GuiltTripWishlist';
import AddTransaction from '../components/AddTransaction';
import TransactionList from '../components/TransactionList';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Single, cached fetch for all necessary data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins to prevent spamming the backend
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ft-accent font-mono animate-pulse tracking-widest uppercase text-sm">Booting System...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-ft-expense/10 border border-ft-expense/20 rounded-xl text-center text-ft-expense mt-10">
        <p className="font-bold">System Failure</p>
        <p className="text-xs">Failed to connect to backend telemetry.</p>
      </div>
    );
  }

  const { transactions, wishlist } = data;

// Add this calculation above your return statement:
  const balance = transactions.reduce((acc, t) => 
    t.type === 'income' ? acc + t.amount : acc - t.amount, 0
  );

  const calculatedExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, current) => sum + current.amount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <StatsBar balance={balance} streak={user?.streak || 0} xp={user?.xp || 0} />
      
      {/* FIX: Pass calculatedExpenses instead of transactions/goals */}
      <MinecraftHealthBar totalExpenses={calculatedExpenses} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddTransaction /> 
        <GuiltTripWishlist wishlist={wishlist} transactions={transactions} />
      </div>
      
      <TransactionList transactions={transactions} />
    </div>
  );
}