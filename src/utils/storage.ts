import { AppSettings, CategoryId, CategoryMeta, Expense, FinanceTask } from '../types/finance';

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F59E0B',
    bgTint: 'rgba(245, 158, 11, 0.12)',
    defaultQuickAmount: 12.5,
  },
  transit: {
    id: 'transit',
    name: 'Transit & Fuel',
    icon: 'Car',
    color: '#06B6D4',
    bgTint: 'rgba(6, 182, 212, 0.12)',
    defaultQuickAmount: 8.0,
  },
  groceries: {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingBag',
    color: '#10B981',
    bgTint: 'rgba(16, 185, 129, 0.12)',
    defaultQuickAmount: 38.0,
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'Sparkles',
    color: '#EC4899',
    bgTint: 'rgba(236, 72, 153, 0.12)',
    defaultQuickAmount: 25.0,
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8B5CF6',
    bgTint: 'rgba(139, 92, 246, 0.12)',
    defaultQuickAmount: 15.0,
  },
  utilities: {
    id: 'utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#EAB308',
    bgTint: 'rgba(234, 179, 8, 0.12)',
    defaultQuickAmount: 45.0,
  },
  health: {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'HeartPulse',
    color: '#EF4444',
    bgTint: 'rgba(239, 68, 68, 0.12)',
    defaultQuickAmount: 20.0,
  },
  bills: {
    id: 'bills',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#3B82F6',
    bgTint: 'rgba(59, 130, 246, 0.12)',
    defaultQuickAmount: 120.0,
  },
  education: {
    id: 'education',
    name: 'Books & Courses',
    icon: 'GraduationCap',
    color: '#14B8A6',
    bgTint: 'rgba(20, 184, 166, 0.12)',
    defaultQuickAmount: 19.99,
  },
  other: {
    id: 'other',
    name: 'Miscellaneous',
    icon: 'MoreHorizontal',
    color: '#94A3B8',
    bgTint: 'rgba(148, 163, 184, 0.12)',
    defaultQuickAmount: 10.0,
  },
};

const getTodayString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: '$',
  monthlyBudget: 2400,
  dailyBudgetGoal: 80,
  soundEnabled: true,
  hapticsEnabled: true,
  deviceFrameMode: 'frame',
  backTapConfig: {
    enabled: true,
    tapsRequired: 3,
    hapticFeedback: true,
    sensitivity: 'medium',
  },
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Morning Cold Brew & Croissant',
    amount: 7.85,
    category: 'food',
    date: getTodayString(0),
    time: '08:42',
    paymentMethod: 'Digital Wallet',
    notes: 'Quick gesture log',
  },
  {
    id: 'exp-2',
    title: 'Subway Metro Pass recharge',
    amount: 15.0,
    category: 'transit',
    date: getTodayString(0),
    time: '12:15',
    paymentMethod: 'Card',
  },
  {
    id: 'exp-3',
    title: 'Trader Joe’s Weekly Groceries',
    amount: 48.6,
    category: 'groceries',
    date: getTodayString(0),
    time: '17:30',
    paymentMethod: 'Card',
    notes: 'Vegetables, oats, almond milk',
  },
  {
    id: 'exp-4',
    title: 'Steam Indie Game',
    amount: 14.99,
    category: 'entertainment',
    date: getTodayString(-1),
    time: '21:04',
    paymentMethod: 'Card',
  },
  {
    id: 'exp-5',
    title: 'Pharmacy Vitamins',
    amount: 22.4,
    category: 'health',
    date: getTodayString(-1),
    time: '14:10',
    paymentMethod: 'Card',
  },
  {
    id: 'exp-6',
    title: 'Fiber Internet Bill',
    amount: 65.0,
    category: 'utilities',
    date: getTodayString(-2),
    time: '10:00',
    paymentMethod: 'Bank / UPI',
    isRecurring: true,
  },
  {
    id: 'exp-7',
    title: 'Lunch with Tech Team',
    amount: 24.5,
    category: 'food',
    date: getTodayString(-3),
    time: '13:05',
    paymentMethod: 'Card',
  },
  {
    id: 'exp-8',
    title: 'Noise Cancelling Headphones Ear-tips',
    amount: 18.0,
    category: 'shopping',
    date: getTodayString(-4),
    time: '16:20',
    paymentMethod: 'Digital Wallet',
  },
  {
    id: 'exp-9',
    title: 'Hardware store replacement screws',
    amount: 6.25,
    category: 'other',
    date: getTodayString(0),
    time: '11:15',
    paymentMethod: 'Cash',
    notes: 'Miscellaneous household supplies',
  },
];

export const INITIAL_TASKS: FinanceTask[] = [
  {
    id: 'task-1',
    title: 'Pay Chase Sapphire Card Statement',
    category: 'Bill',
    dueDate: getTodayString(1),
    amount: 428.5,
    isCompleted: false,
    priority: 'High',
    recurrence: 'Monthly',
    notes: 'Avoid interest, minimum due $40',
    autoDeduct: false,
  },
  {
    id: 'task-2',
    title: 'Apartment Monthly Rent & Maintenance',
    category: 'Bill',
    dueDate: getTodayString(4),
    amount: 1250.0,
    isCompleted: false,
    priority: 'High',
    recurrence: 'Monthly',
    notes: 'Direct transfer to landlord portal',
  },
  {
    id: 'task-3',
    title: 'Transfer $200 to High-Yield Savings Goal',
    category: 'Savings',
    dueDate: getTodayString(2),
    amount: 200.0,
    isCompleted: false,
    priority: 'Medium',
    recurrence: 'Monthly',
    notes: 'Target: 6 months emergency cushion',
  },
  {
    id: 'task-4',
    title: 'Spotify Family Subscription Renewal',
    category: 'Subscription',
    dueDate: getTodayString(-1),
    amount: 16.99,
    isCompleted: false,
    priority: 'Low',
    recurrence: 'Monthly',
    notes: 'Auto-charged on Mastercard',
  },
  {
    id: 'task-5',
    title: 'Review Quarterly Utility Bills & Electric Spike',
    category: 'Review',
    dueDate: getTodayString(7),
    isCompleted: false,
    priority: 'Low',
    recurrence: 'Quarterly',
    notes: 'Compare heat usage with previous month',
  },
  {
    id: 'task-6',
    title: 'Roth IRA Monthly Index Fund Auto-Deposit',
    category: 'Savings',
    dueDate: getTodayString(-5),
    amount: 250.0,
    isCompleted: true,
    completedAt: getTodayString(-5),
    priority: 'Medium',
    recurrence: 'Monthly',
    notes: 'Vanguard Total Stock Market (VTSAX)',
  },
];

const STORAGE_KEYS = {
  EXPENSES: 'kite_finance_expenses_v1',
  TASKS: 'kite_finance_tasks_v1',
  SETTINGS: 'kite_finance_settings_v1',
};

export const loadExpenses = (): Expense[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load expenses', e);
  }
  return INITIAL_EXPENSES;
};

export const saveExpenses = (expenses: Expense[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
};

export const loadTasks = (): FinanceTask[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  return INITIAL_TASKS;
};

export const saveTasks = (tasks: FinanceTask[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};
