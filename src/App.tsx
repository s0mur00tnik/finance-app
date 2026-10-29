import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Plus, 
  RotateCcw, 
  Calendar, 
  WifiOff,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { 
  Expense, 
  FinanceTask, 
  CategoryId, 
  AppSettings 
} from './types/finance';
import { 
  loadExpenses, 
  saveExpenses, 
  loadTasks, 
  saveTasks, 
  loadSettings, 
  saveSettings,
  CATEGORIES,
  INITIAL_EXPENSES,
  INITIAL_TASKS
} from './utils/storage';
import { feedback } from './utils/haptics';
import { useBackTap } from './hooks/useBackTap';
import { useAndroidSystem } from './hooks/useAndroidSystem';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { MiniExpenseWindow } from './components/MiniExpenseWindow';
import { QuickExpenseDrawer } from './components/QuickExpenseDrawer';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { ExpenseList } from './components/ExpenseList';
import { FinanceTasksView } from './components/FinanceTasksView';
import { AnalyticsView } from './components/AnalyticsView';
import { GestureSettingsView } from './components/GestureSettingsView';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [tasks, setTasks] = useState<FinanceTask[]>(() => loadTasks());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<NavTab>('expenses');

  // Mini App Pop-up Window state (Triggered automatically by physical phone gesture)
  const [isMiniWindowOpen, setIsMiniWindowOpen] = useState(false);
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<CategoryId>('food');
  const [isInstallBannerDismissed, setIsInstallBannerDismissed] = useState(false);

  // Hardware Sensor Hook: detects physical 3-tap gesture on the back of your phone
  useBackTap({
    enabled: settings.backTapConfig?.enabled ?? true,
    sensitivity: settings.backTapConfig?.sensitivity || 'medium',
    onGestureTrigger: () => {
      setIsMiniWindowOpen(true);
    },
  });

  // Android Native System Integration: Back gesture, shortcuts, PWA install prompt
  const { isInstallable, installToAndroid } = useAndroidSystem({
    isMiniWindowOpen,
    onCloseMiniWindow: () => setIsMiniWindowOpen(false),
    isQuickDrawerOpen,
    onCloseQuickDrawer: () => setIsQuickDrawerOpen(false),
    activeTab,
    onChangeTab: setActiveTab,
    onTriggerQuickAdd: () => setIsMiniWindowOpen(true),
  });

  // Toast notifications & Undo
  const [toastMessage, setToastMessage] = useState<{ text: string; undoAction?: () => void } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to storage on update
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const showToast = (text: string, undoAction?: () => void) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, undoAction });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add Expense (Fast and lightweight)
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    const newExpense: Expense = {
      id,
      ...newExpData,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Logged ${settings.currency}${newExpense.amount.toFixed(2)} in ${CATEGORIES[newExpense.category]?.name || 'expenses'}`, () => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    });
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    const deletedItem = expenses.find((e) => e.id === id);
    if (!deletedItem) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(`Removed "${deletedItem.title}"`, () => {
      setExpenses((prev) => [deletedItem, ...prev]);
    });
  };

  // Duplicate Expense (Swipe right)
  const handleDuplicateExpense = (expense: Expense) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const todayStr = now.toISOString().split('T')[0];
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      date: todayStr,
      time: timeStr,
      notes: `Repeated from previous log`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Repeated ${settings.currency}${newExp.amount.toFixed(2)} for ${newExp.title}`);
  };

  // Task Management
  const handleToggleTask = (taskId: string, recordAsExpense?: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const willBeCompleted = !task.isCompleted;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              isCompleted: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString().split('T')[0] : undefined,
            }
          : t
      )
    );

    // If marked completed and has amount, record corresponding expense
    if (willBeCompleted && recordAsExpense && task.amount && task.amount > 0) {
      const now = new Date();
      const expCategory: CategoryId = task.category === 'Bill' ? 'bills' : task.category === 'Subscription' ? 'entertainment' : 'other';
      const autoExp: Expense = {
        id: `exp-${Date.now()}`,
        title: `Bill: ${task.title}`,
        amount: task.amount,
        category: expCategory,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        paymentMethod: 'Bank / UPI',
        notes: `Paid via Kite Task Manager`,
      };
      setExpenses((prev) => [autoExp, ...prev]);
      showToast(`Task completed and ${settings.currency}${task.amount.toFixed(2)} logged to expenses!`);
    } else {
      showToast(willBeCompleted ? `Completed "${task.title}"` : `Marked "${task.title}" pending`);
    }
  };

  const handleAddTask = (taskData: Omit<FinanceTask, 'id' | 'isCompleted'>) => {
    const newTask: FinanceTask = {
      id: `task-${Date.now()}`,
      isCompleted: false,
      ...taskData,
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Added financial task: ${newTask.title}`);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (task) {
      showToast(`Deleted task "${task.title}"`);
    }
  };

  const handleSnoozeTask = (taskId: string, days: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const d = new Date(t.dueDate);
          d.setDate(d.getDate() + days);
          return { ...t, dueDate: d.toISOString().split('T')[0] };
        }
        return t;
      })
    );
    showToast(`Snoozed task by +${days} days`);
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      appName: 'KiteFinance',
      exportedAt: new Date().toISOString(),
      settings,
      expenses,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kite_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON backup exported successfully');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Title', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = expenses.map((e) => [
      e.date,
      e.time,
      `"${e.title.replace(/"/g, '""')}"`,
      CATEGORIES[e.category]?.name || e.category,
      e.amount.toFixed(2),
      e.paymentMethod,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kite_finance_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Expenses CSV exported successfully');
  };

  // Reset Data
  const handleResetData = () => {
    if (window.confirm('Reset all expenses and tasks to initial sample data?')) {
      setExpenses(INITIAL_EXPENSES);
      setTasks(INITIAL_TASKS);
      showToast('Sample financial ledger restored');
    }
  };

  // Pending tasks count
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <AndroidFrame
      mode={settings.deviceFrameMode}
      onToggleMode={() =>
        setSettings((prev) => ({
          ...prev,
          deviceFrameMode: prev.deviceFrameMode === 'frame' ? 'fullscreen' : 'frame',
        }))
      }
    >
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-slate-950 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 z-40">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Changes saved locally to Android device.</span>
        </div>
      )}

      {/* Top Bar Contract: 3 zones */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-950/90 border-b border-slate-900 sticky top-0 z-30 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
            KiteFinance
          </span>
        </div>

        {/* Zone 2: Navigation / Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-400">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              feedback.vibrate(20);
              setIsMiniWindowOpen(true);
            }}
            title="Add Expense (or tap back of phone 3 times)"
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 p-4 pb-12 overflow-y-auto">
        {/* Android PWA Install Prompt Banner */}
        <AndroidInstallBanner
          isInstallable={isInstallable && !isInstallBannerDismissed}
          onInstall={installToAndroid}
          onDismiss={() => setIsInstallBannerDismissed(true)}
        />

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {/* Expense Transaction List */}
            <ExpenseList
              expenses={expenses}
              currency={settings.currency}
              onDelete={handleDeleteExpense}
              onDuplicate={handleDuplicateExpense}
              onSelectCategory={(catId) => {
                setPreselectedCategory(catId);
                setIsMiniWindowOpen(true);
              }}
              onOpenQuickAdd={() => setIsMiniWindowOpen(true)}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <FinanceTasksView
            tasks={tasks}
            currency={settings.currency}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onSnoozeTask={handleSnoozeTask}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            expenses={expenses}
            tasks={tasks}
            currency={settings.currency}
            monthlyBudget={settings.monthlyBudget}
            dailyBudgetGoal={settings.dailyBudgetGoal}
          />
        )}

        {activeTab === 'settings' && (
          <GestureSettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Floating Undo Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between p-3 rounded-2xl bg-slate-800/95 border border-slate-700 text-white text-xs shadow-2xl backdrop-blur-md max-w-sm mx-auto animate-in fade-in duration-150">
          <span className="truncate pr-2 font-medium">{toastMessage.text}</span>
          {toastMessage.undoAction && (
            <button
              onClick={() => {
                feedback.vibrate(20);
                toastMessage.undoAction?.();
                setToastMessage(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shrink-0"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Bottom Navigation with Thumb-Zone Ergonomics */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Triple Back Tap Mini App Window Pop-up */}
      <MiniExpenseWindow
        isOpen={isMiniWindowOpen}
        onClose={() => setIsMiniWindowOpen(false)}
        onSave={handleAddExpense}
        currency={settings.currency}
      />

      {/* Full Keypad Drawer */}
      <QuickExpenseDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
        onSave={handleAddExpense}
        currency={settings.currency}
        initialCategory={preselectedCategory}
      />
    </AndroidFrame>
  );
}
