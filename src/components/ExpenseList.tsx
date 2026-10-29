import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Copy, 
  Search, 
  Filter, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  HeartPulse, 
  Home, 
  GraduationCap, 
  Sparkles, 
  MoreHorizontal,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { CategoryId, Expense } from '../types/finance';
import { CATEGORIES } from '../utils/storage';
import { feedback } from '../utils/haptics';

interface ExpenseListProps {
  expenses: Expense[];
  currency: string;
  onDelete: (id: string) => void;
  onDuplicate: (expense: Expense) => void;
  onSelectCategory: (catId: CategoryId) => void;
  onOpenQuickAdd: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currency,
  onDelete,
  onDuplicate,
  onSelectCategory,
  onOpenQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const getCategoryIcon = (catId: CategoryId) => {
    switch (catId) {
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'transit':
        return <Car className="w-4 h-4 text-cyan-400" />;
      case 'groceries':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'entertainment':
        return <Film className="w-4 h-4 text-purple-400" />;
      case 'utilities':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'bills':
        return <Home className="w-4 h-4 text-blue-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-teal-400" />;
      case 'shopping':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'other':
      default:
        return <MoreHorizontal className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter expenses
  const filtered = expenses.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      CATEGORIES[item.category].name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Group by relative date (Today, Yesterday, Date)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const groups: { [key: string]: Expense[] } = {};
  filtered.forEach((exp) => {
    let groupKey = exp.date;
    if (exp.date === todayStr) {
      groupKey = 'Today';
    } else if (exp.date === yesterdayStr) {
      groupKey = 'Yesterday';
    }
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(exp);
  });

  const groupKeys = Object.keys(groups).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return b.localeCompare(a);
  });

  return (
    <div className="space-y-4">
      {/* Search and Category Filter Strip */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, notes, or merchants..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter categories tabs (button controls with active states) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              filterCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All
          </button>
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                filterCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span style={{ color: filterCategory === cat.id ? '#020617' : cat.color }}>
                {getCategoryIcon(cat.id)}
              </span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gesture hint banner */}
      <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-semibold">Touch Tip:</span>
          <span>Swipe item left to delete, right to quick-repeat.</span>
        </span>
        <span className="font-mono text-slate-500">{filtered.length} logs</span>
      </div>

      {/* Grouped Transaction Feed */}
      {groupKeys.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">No expenses found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {searchQuery || filterCategory !== 'all'
              ? 'Try clearing your search or category filter to view all logged records.'
              : 'Tap the back of your phone 3 times or tap Add to log an expense.'}
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Add Expense Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupKeys.map((groupKey) => {
            const items = groups[groupKey];
            const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);

            return (
              <div key={groupKey} className="space-y-2">
                {/* Clean unboxed section header */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{groupKey}</span>
                  <div className="flex items-center gap-1 font-mono text-slate-400">
                    <span>Total:</span>
                    <span className="text-white font-bold tabular-nums">
                      {currency}{groupTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Swipeable List */}
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const meta = CATEGORIES[item.category] || CATEGORIES.other;

                      return (
                        <div key={item.id} className="relative overflow-hidden rounded-2xl">
                          {/* Left background action (Duplicate) */}
                          <div className="absolute inset-y-0 left-0 w-24 bg-emerald-600/90 text-white flex items-center px-4 gap-1.5 text-xs font-bold z-0">
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </div>

                          {/* Right background action (Delete) */}
                          <div className="absolute inset-y-0 right-0 w-24 bg-rose-600/90 text-white flex items-center justify-end px-4 gap-1.5 text-xs font-bold z-0">
                            <span>Delete</span>
                            <Trash2 className="w-4 h-4" />
                          </div>

                          {/* Foreground draggable card - snaps cleanly to center on release */}
                          <motion.div
                            layout
                            drag="x"
                            dragSnapToOrigin
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.25}
                            dragTransition={{ bounceStiffness: 700, bounceDamping: 38 }}
                            onDragEnd={(_, info) => {
                              if (info.offset.x < -80) {
                                // Swipe Left = Delete
                                feedback.vibrate(40);
                                feedback.playDeleteSound();
                                onDelete(item.id);
                              } else if (info.offset.x > 80) {
                                // Swipe Right = Duplicate
                                feedback.vibrate(30);
                                feedback.playGestureSuccessSound();
                                onDuplicate(item);
                              }
                            }}
                            className="relative z-10 bg-slate-900 border border-slate-800/90 p-3.5 rounded-2xl flex items-center justify-between gap-3 active:cursor-grabbing hover:border-slate-700 transition-colors"
                          >
                            {/* Left: Category Icon */}
                            <div
                              style={{ backgroundColor: meta.bgTint }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-700/40"
                            >
                              {getCategoryIcon(item.category)}
                            </div>

                            {/* Middle: Title & Metadata */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">
                                {item.title}
                              </h4>
                              {/* Clean unboxed metadata with separators (zero-pill rule) */}
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                                <span>{meta.name}</span>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span>{item.time || '12:00'}</span>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span>{item.paymentMethod}</span>
                                {item.notes && (
                                  <>
                                    <span aria-hidden="true" className="text-slate-600">·</span>
                                    <span className="truncate italic text-slate-500">{item.notes}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right: Amount & Quick Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-bold font-mono text-white tabular-nums">
                                -{currency}{item.amount.toFixed(2)}
                              </span>

                              {/* Clickable fallback for desktop users who prefer clicking over swiping */}
                              <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onDuplicate(item)}
                                  title="Duplicate entry"
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDelete(item.id)}
                                  title="Delete entry"
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
