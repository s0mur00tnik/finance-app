import React from 'react';
import { 
  ReceiptText, 
  CheckSquare, 
  BarChart3, 
  Sliders
} from 'lucide-react';
import { feedback } from '../utils/haptics';

export type NavTab = 'expenses' | 'tasks' | 'analytics' | 'settings';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendingTasksCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  pendingTasksCount,
}) => {
  const handleTabClick = (tab: NavTab) => {
    feedback.vibrate(15);
    feedback.playTapSound();
    onChangeTab(tab);
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 shrink-0">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {/* Tab 1: Expenses */}
        <button
          onClick={() => handleTabClick('expenses')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'expenses' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Expenses</span>
        </button>

        {/* Tab 2: Tasks */}
        <button
          onClick={() => handleTabClick('tasks')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'tasks' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 bg-amber-500 text-slate-950 text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                {pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Tasks</span>
        </button>

        {/* Tab 3: Analytics */}
        <button
          onClick={() => handleTabClick('analytics')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Budget</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Settings</span>
        </button>
      </div>
    </div>
  );
};
