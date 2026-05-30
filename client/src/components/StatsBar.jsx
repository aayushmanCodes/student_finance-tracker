import { useCountUp } from '../hooks/useCountUp';

export default function StatsBar({ balance, streak, xp }) {
  // Animate the numbers for that satisfying UI odometer feel
  const animatedBalance = useCountUp(balance);
  const animatedXp = useCountUp(xp);

  // RPG Logic: Every 100 XP is a level
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
      
      {/* 1. Total Balance */}
      <div className="bg-ft-card rounded-2xl p-5 border border-ft-border shadow-card">
        <p className="text-ft-muted text-xs uppercase tracking-widest mb-1 font-mono">Total Balance</p>
        <p className={`text-3xl font-mono font-black ${balance >= 0 ? 'text-ft-income' : 'text-ft-expense'}`}>
          ₹{Math.abs(animatedBalance).toFixed(0)}
          <span className="text-sm ml-1">{balance < 0 ? '↓' : '↑'}</span>
        </p>
      </div>

      {/* 2. Streak Counter (Gamified) */}
      <div className="bg-ft-card rounded-2xl p-5 border border-ft-border shadow-card">
        <p className="text-ft-muted text-xs uppercase tracking-widest mb-1 font-mono">Current Streak</p>
        <div className="flex items-center gap-2">
          {/* Dynamic emoji based on how high the streak is */}
          <span className="text-3xl">
            {streak === 0 ? '💀' : streak < 3 ? '🔥' : streak < 7 ? '⚡' : '👑'}
          </span>
          <p className="text-3xl font-mono font-black text-ft-text">
            {streak} <span className="text-sm text-ft-muted font-sans font-medium">days</span>
          </p>
        </div>
      </div>

      {/* 3. Level & XP Progress */}
      <div className="bg-ft-card rounded-2xl p-5 border border-ft-border shadow-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-end mb-1">
            <p className="text-ft-muted text-xs uppercase tracking-widest font-mono">Level {level}</p>
            <p className="text-xs text-ft-muted font-mono">{xpProgress} / 100 XP</p>
          </div>
          <p className="text-3xl font-mono font-black text-ft-accent">
            {Math.round(animatedXp)} <span className="text-sm text-ft-muted font-sans font-medium">Total XP</span>
          </p>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-3 h-1.5 bg-ft-bg rounded-full overflow-hidden border border-ft-border/50">
          <div
            className="h-full bg-ft-accent rounded-full transition-all duration-700 ease-out"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

    </div>
  );
}