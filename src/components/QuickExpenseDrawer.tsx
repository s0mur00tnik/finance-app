import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Delete, 
  Check, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Wallet, 
  Building2, 
  Banknote,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  HeartPulse,
  Home,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { CategoryId, Expense, PaymentMethod } from '../types/finance';
import { CATEGORIES } from '../utils/storage';
import { feedback } from '../utils/haptics';

interface QuickExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  currency: string;
  initialCategory?: CategoryId;
}

export const QuickExpenseDrawer: React.FC<QuickExpenseDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  initialCategory = 'food',
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [dateStr, setDateStr] = useState('');
  const [isNaturalMode, setIsNaturalMode] = useState(false);
  const [naturalText, setNaturalText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setTitle('');
      setSelectedCategory(initialCategory);
      setPaymentMethod('Card');
      setDateStr(new Date().toISOString().split('T')[0]);
      setIsNaturalMode(false);
      setNaturalText('');
    }
  }, [isOpen, initialCategory]);

  // Keypad click handler
  const handleKeyClick = (val: string) => {
    feedback.vibrate(15);
    feedback.playTapSound();

    if (val === 'DEL') {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }

    if (val === 'CLEAR') {
      setAmountStr('');
      return;
    }

    if (val === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr((prev) => (prev === '' ? '0.' : prev + '.'));
      return;
    }

    // Limit decimal precision to 2 digits
    const parts = amountStr.split('.');
    if (parts[1] && parts[1].length >= 2) return;
    if (amountStr.length >= 8) return;

    setAmountStr((prev) => (prev === '0' ? val : prev + val));
  };

  const addPreset = (increment: number) => {
    feedback.vibrate(20);
    feedback.playTapSound();
    const current = parseFloat(amountStr) || 0;
    const nextVal = (current + increment).toFixed(2).replace(/\.00$/, '');
    setAmountStr(nextVal);
  };

  // Smart natural language parser
  const parseNaturalInput = (text: string) => {
    setNaturalText(text);
    // Find amount e.g. $14.50 or 14.50 or 20
    const match = text.match(/[$€£₹¥]?\s*(\d+(\.\d{1,2})?)/);
    if (match && match[1]) {
      setAmountStr(match[1]);
    }
    // Infer category
    const lower = text.toLowerCase();
    if (lower.includes('coffee') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('burger') || lower.includes('cafe')) {
      setSelectedCategory('food');
    } else if (lower.includes('uber') || lower.includes('lyft') || lower.includes('gas') || lower.includes('transit') || lower.includes('bus') || lower.includes('train')) {
      setSelectedCategory('transit');
    } else if (lower.includes('grocery') || lower.includes('market') || lower.includes('trader') || lower.includes('walmart') || lower.includes('milk')) {
      setSelectedCategory('groceries');
    } else if (lower.includes('movie') || lower.includes('game') || lower.includes('steam') || lower.includes('netflix')) {
      setSelectedCategory('entertainment');
    } else if (lower.includes('bill') || lower.includes('electric') || lower.includes('wifi') || lower.includes('water')) {
      setSelectedCategory('utilities');
    }
    // Clean title
    const cleanTitle = text.replace(/[$€£₹¥]?\s*(\d+(\.\d{1,2})?)/, '').trim();
    if (cleanTitle) {
      setTitle(cleanTitle);
    }
  };

  const handleSave = () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    feedback.vibrate([25, 50]);
    feedback.playGestureSuccessSound();

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const finalTitle = title.trim() || `${CATEGORIES[selectedCategory].name} expense`;

    onSave({
      title: finalTitle,
      amount,
      category: selectedCategory,
      date: dateStr || now.toISOString().split('T')[0],
      time: timeStr,
      paymentMethod,
      notes: isNaturalMode && naturalText ? `Quick parsed: "${naturalText}"` : undefined,
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
      case 'shopping':
        return <Sparkles className="w-4 h-4" />;
      case 'other':
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountStr) || 0;
  const isValid = parsedAmount > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
        {/* Backdrop */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Material 3 Bottom Sheet with drag-down dismiss */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.velocity.y > 400) {
              feedback.vibrate(20);
              onClose();
            }
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-t-3xl bg-slate-900 border-t border-slate-800 p-5 pt-3 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto pb-safe z-10"
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-3 cursor-grab" />

          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Add Expense</span>
              <button
                onClick={() => setIsNaturalMode(!isNaturalMode)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 font-medium ${
                  isNaturalMode
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Smart Express
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Natural Express Mode Prompt */}
          {isNaturalMode && (
            <div className="mt-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <label className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
                Natural Express Text Log
              </label>
              <input
                type="text"
                value={naturalText}
                onChange={(e) => parseNaturalInput(e.target.value)}
                placeholder="e.g. Sushi dinner $38 or Uber to station 14"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Type naturally — auto-fills amount, merchant title, and category.
              </span>
            </div>
          )}

          {/* Large Amount Display */}
          <div className="my-3 py-4 px-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1">
              Expense Amount
            </span>
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-2xl font-bold text-emerald-400">{currency}</span>
              <span className="text-4xl font-extrabold font-mono tracking-tight tabular-nums">
                {amountStr || '0.00'}
              </span>
            </div>

            {/* Quick +Increment buttons */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
              {[5, 10, 20, 50, 100].map((inc) => (
                <button
                  key={inc}
                  onClick={() => addPreset(inc)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0 font-mono"
                >
                  +{currency}{inc}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Merchant Input */}
          <div className="mb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What was this for? (e.g. Starbucks, Gasoline)"
              className="w-full bg-slate-800/70 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Horizontal Pill Scroller */}
          <div className="mb-3">
            <span className="text-xs text-slate-400 font-medium block mb-2">Category</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      feedback.vibrate(15);
                      setSelectedCategory(cat.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/50'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method & Date in compact row */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setPaymentMethod('Card')}
                className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                  paymentMethod === 'Card' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Card
              </button>
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                  paymentMethod === 'Cash' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('Digital Wallet')}
                className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                  paymentMethod === 'Digital Wallet' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Wallet
              </button>
            </div>

            <div className="flex items-center bg-slate-800/60 rounded-xl border border-slate-700/50 px-2.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Tactile Android Number Pad */}
          <div className="grid grid-cols-3 gap-2 mb-4 select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyClick(key)}
                className="h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-lg font-bold text-slate-100 flex items-center justify-center transition-all shadow-sm active:bg-emerald-500/20"
              >
                {key === 'DEL' ? <Delete className="w-5 h-5 text-slate-400" /> : key}
              </button>
            ))}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isValid
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-105 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>Record Expense ({currency}{parsedAmount.toFixed(2)})</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
