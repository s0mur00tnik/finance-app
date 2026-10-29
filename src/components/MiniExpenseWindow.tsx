import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Sparkles, 
  Film, 
  Zap, 
  HeartPulse, 
  Home, 
  GraduationCap,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { CategoryId, Expense } from '../types/finance';
import { CATEGORIES } from '../utils/storage';
import { feedback } from '../utils/haptics';

interface MiniExpenseWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  currency: string;
}

export const MiniExpenseWindow: React.FC<MiniExpenseWindowProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('food');
  const [amountStr, setAmountStr] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setTitle('');
      setSelectedCategory('food');
      // Focus input automatically for immediate entry
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSelectCategory = (catId: CategoryId) => {
    feedback.vibrate(15);
    feedback.playTapSound();
    setSelectedCategory(catId);
  };

  const addPreset = (val: number) => {
    feedback.vibrate(15);
    feedback.playTapSound();
    const curr = parseFloat(amountStr) || 0;
    setAmountStr((curr + val).toFixed(2).replace(/\.00$/, ''));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(amountStr);
    if (!parsed || parsed <= 0) return;

    feedback.vibrate([25, 40]);
    feedback.playGestureSuccessSound();

    const now = new Date();
    const finalTitle = title.trim() || `${CATEGORIES[selectedCategory].name}`;

    onSave({
      title: finalTitle,
      amount: parsed,
      category: selectedCategory,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      paymentMethod: 'Card',
      notes: 'Added via Back Tap Quick Window',
    });

    onClose();
  };

  const getCategoryIcon = (catId: CategoryId) => {
    switch (catId) {
      case 'food':
        return <Utensils className="w-4 h-4" />;
      case 'transit':
        return <Car className="w-4 h-4" />;
      case 'groceries':
        return <ShoppingBag className="w-4 h-4" />;
      case 'shopping':
        return <Sparkles className="w-4 h-4" />;
      case 'entertainment':
        return <Film className="w-4 h-4" />;
      case 'utilities':
        return <Zap className="w-4 h-4" />;
      case 'health':
        return <HeartPulse className="w-4 h-4" />;
      case 'bills':
        return <Home className="w-4 h-4" />;
      case 'education':
        return <GraduationCap className="w-4 h-4" />;
      case 'other':
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getCategoryShortLabel = (catId: CategoryId) => {
    switch (catId) {
      case 'food':
        return 'Food';
      case 'transit':
        return 'Transit';
      case 'groceries':
        return 'Grocery';
      case 'shopping':
        return 'Shop';
      case 'entertainment':
        return 'Leisure';
      case 'utilities':
        return 'Utilities';
      case 'health':
        return 'Health';
      case 'bills':
        return 'Housing';
      case 'education':
        return 'Edu';
      case 'other':
      default:
        return 'Misc';
    }
  };

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountStr) || 0;
  const isValid = parsedAmount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Floating Mini App Window */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col">
        {/* Android Window Titlebar */}
        <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/70 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-xs font-bold text-white tracking-wide">
              Quick Expense
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Step 1: Select Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                1. Select Category
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {CATEGORIES[selectedCategory]?.name || 'Miscellaneous'}
              </span>
            </div>

            {/* 5x2 Category Grid with all 10 categories including Miscellaneous */}
            <div className="grid grid-cols-5 gap-1.5">
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    title={cat.name}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-bold scale-[1.02]'
                        : 'bg-slate-800/70 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div style={{ color: isSelected ? '#020617' : cat.color }}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <span className="text-[10px] mt-1 truncate max-w-full leading-tight font-medium">
                      {getCategoryShortLabel(cat.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Amount Entry */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              2. Enter Amount
            </span>

            <div className="relative flex items-center">
              <span className="absolute left-3 text-lg font-bold text-emerald-400 font-mono">
                {currency}
              </span>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Fast Quick Add Amount Increments */}
            <div className="flex items-center gap-1.5 mt-2">
              {[5, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addPreset(val)}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Quick Merchant / Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Note (Optional, e.g. ${CATEGORIES[selectedCategory].name})`}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Add Instantly Button */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              isValid
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Add to Expenses ({currency}{parsedAmount ? parsedAmount.toFixed(2) : '0.00'})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
