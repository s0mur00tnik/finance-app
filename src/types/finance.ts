export type CategoryId =
  | 'food'
  | 'transit'
  | 'groceries'
  | 'shopping'
  | 'entertainment'
  | 'utilities'
  | 'health'
  | 'bills'
  | 'education'
  | 'other';

export type PaymentMethod = 'Card' | 'Cash' | 'Bank / UPI' | 'Digital Wallet';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Bill' | 'Subscription' | 'Savings' | 'Tax / Legal' | 'Debt Payoff' | 'Review';
export type RecurrenceType = 'Once' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface FinanceTask {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  amount?: number;
  isCompleted: boolean;
  completedAt?: string;
  priority: TaskPriority;
  recurrence: RecurrenceType;
  notes?: string;
  autoDeduct?: boolean;
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  bgTint: string;
  defaultQuickAmount: number;
}

export interface BackTapConfig {
  enabled: boolean;
  tapsRequired: 3;
  hapticFeedback: boolean;
  sensitivity: 'low' | 'medium' | 'high';
}

export interface AppSettings {
  currency: string;
  monthlyBudget: number;
  dailyBudgetGoal: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  deviceFrameMode: 'frame' | 'fullscreen';
  backTapConfig: BackTapConfig;
}
