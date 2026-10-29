import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  CheckCircle, 
  Target, 
  Flame,
  CreditCard,
  Calendar
} from 'lucide-react';
import { Expense, CategoryId, FinanceTask } from '../types/finance';
import { CATEGORIES } from '../utils/storage';

interface AnalyticsViewProps {
  expenses: Expense[];
  tasks: FinanceTask[];
  currency: string;
  monthlyBudget: number;
  dailyBudgetGoal: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  tasks,
  currency,
  monthlyBudget,
  dailyBudgetGoal,
}) => {
  // Current month's expenses
  const now = new Date();
  const currentMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

  const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalMonthSpent);
  const percentageUsed = Math.min(100, Math.round((totalMonthSpent / (monthlyBudget || 1)) * 100));

  // Today's total
  const todayStr = now.toISOString().split('T')[0];
  const todaySpent = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Payment methods breakdown
  const methodTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    methodTotals[e.paymentMethod] = (methodTotals[e.paymentMethod] || 0) + e.amount;
  });

  return (
    <div className="space-y-4">
      {/* Monthly Budget Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Budget Overview
          </span>
          <span className="text-xs font-mono text-slate-400">
            {percentageUsed}% Used
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
              {currency}{totalMonthSpent.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-sans">
              spent of {currency}{monthlyBudget}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              {currency}{remainingBudget.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block font-sans">
              left to spend
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            style={{ width: `${percentageUsed}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              percentageUsed > 90
                ? 'bg-rose-500'
                : percentageUsed > 75
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
          />
        </div>
      </div>

      {/* Daily Velocity & Financial Rhythm */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's Burn</span>
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">
            {currency}{todaySpent.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] mt-1 text-slate-400">
            <span>Goal:</span>
            <span className="font-mono text-slate-300">{currency}{dailyBudgetGoal}/day</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pace Health</span>
          </div>
          <div className={`text-lg font-bold ${todaySpent <= dailyBudgetGoal ? 'text-emerald-400' : 'text-amber-400'}`}>
            {todaySpent <= dailyBudgetGoal ? 'Within Cap' : 'Above Target'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {todaySpent <= dailyBudgetGoal ? 'Great discipline today' : 'Watch evening logs'}
          </div>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Category Breakdown</span>
          <span className="text-xs font-normal text-slate-400 font-mono">This Month</span>
        </h3>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No expenses logged this month yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([catId, amount]) => {
              const meta = CATEGORIES[catId as CategoryId] || CATEGORIES.other;
              const catPercent = Math.round((amount / (totalMonthSpent || 1)) * 100);

              return (
                <div key={catId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{meta.name}</span>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">{catPercent}%</span>
                      <span className="text-white font-bold tabular-nums">
                        {currency}{amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${catPercent}%`,
                        backgroundColor: meta.color,
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Channel Distribution */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">Payment Methods Used</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(methodTotals).map(([method, amt]) => (
            <div key={method} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">{method}</span>
              <span className="text-sm font-bold font-mono text-white tabular-nums">
                {currency}{amt.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
