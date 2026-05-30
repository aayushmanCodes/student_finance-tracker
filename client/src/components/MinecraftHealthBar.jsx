import { useState } from 'react';

export default function MinecraftHealthBar({ totalExpenses = 0 }) {
  const [weeklyBudget, setWeeklyBudget] = useState(() => {
    const saved = localStorage.getItem('weeklyBudget');
    return saved ? Number(saved) : 1000;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputLimit, setInputLimit] = useState(weeklyBudget);

  const handleSaveLimit = (e) => {
    e.preventDefault();
    const newLimit = Number(inputLimit);
    if (newLimit > 0) {
      setWeeklyBudget(newLimit);
      localStorage.setItem('weeklyBudget', newLimit);
      setIsEditing(false);
    }
  };

  const remaining = Math.max(0, weeklyBudget - totalExpenses);
  const healthPercentage = weeklyBudget > 0 ? (remaining / weeklyBudget) * 100 : 0;
  
  const totalHearts = 10;
  const currentHealthPoints = Math.round((healthPercentage / 100) * (totalHearts * 2));

  const isDead = remaining <= 0;
  const isCritical = healthPercentage <= 30 && !isDead;

  return (
    <div className="bg-ft-card rounded-2xl p-5 shadow-card border border-ft-border animate-slide-up relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* FIX: The Title and the Edit Limit button are now grouped together and ALWAYS visible */}
          <div className="flex items-center gap-3 mb-1">
            <p className="text-ft-muted font-bold text-xs tracking-widest uppercase font-mono">Weekly Shield</p>
            
            {isEditing ? (
              <form onSubmit={handleSaveLimit} className="flex items-center gap-1 animate-pop">
                <input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  className="w-16 bg-ft-bg border border-ft-accent text-ft-text font-mono rounded-md px-2 py-0.5 text-xs focus:outline-none"
                  autoFocus
                  onBlur={() => setTimeout(() => setIsEditing(false), 200)}
                />
                <button type="submit" className="text-ft-income text-xs font-bold hover:scale-110 transition-transform">✓</button>
              </form>
            ) : (
              <div 
                onClick={() => {
                  setInputLimit(weeklyBudget);
                  setIsEditing(true);
                }} 
                className="flex items-center gap-1.5 cursor-pointer group/limit bg-ft-bg/50 px-2 py-0.5 rounded border border-ft-border/50 hover:border-ft-accent/50 transition-colors"
                title="Click to change weekly budget limit"
              >
                <p className="text-ft-text font-medium text-xs font-mono">₹{weeklyBudget}</p>
                <span className="text-[10px] text-ft-muted group-hover/limit:text-ft-accent transition-colors font-mono">✎</span>
              </div>
            )}
          </div>
          
          {/* FIX: Status messages render below the title/edit bar so they don't overwrite each other */}
          <div className="h-5"> 
            {isDead ? (
              <p className="text-ft-expense font-black text-sm">Shield depleted. Time to pause spending.</p>
            ) : isCritical ? (
              <p className="text-rose-500 font-bold text-sm animate-pulse">Shield is low. Play it safe.</p>
            ) : (
              <p className="text-ft-income/80 font-medium text-sm">Systems nominal.</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-ft-muted font-mono font-medium">Spent</p>
          <p className="text-sm font-bold font-mono text-ft-text">₹{totalExpenses}</p>
        </div>
      </div>

      <div className="flex gap-1 mt-2">
        {Array.from({ length: totalHearts }).map((_, index) => {
          const heartIndex = index * 2;
          let heartIcon = '🖤'; 

          if (currentHealthPoints >= heartIndex + 2) {
            heartIcon = '❤️';
          } else if (currentHealthPoints === heartIndex + 1) {
            heartIcon = '💔'; 
          }

          return (
            <span key={index} className="text-xl transition-all duration-300 transform hover:scale-110 select-none">
              {heartIcon}
            </span>
          );
        })}
      </div>
    </div>
  );
}