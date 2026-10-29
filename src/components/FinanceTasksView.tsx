import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Clock, 
  DollarSign, 
  CalendarPlus, 
  Trash2, 
  ArrowUpRight,
  Sparkles,
  Repeat,
  Check
} from 'lucide-react';
import { FinanceTask, TaskCategory, TaskPriority, RecurrenceType } from '../types/finance';
import { feedback } from '../utils/haptics';

interface FinanceTasksViewProps {
  tasks: FinanceTask[];
  currency: string;
  onToggleTask: (taskId: string, recordAsExpense?: boolean) => void;
  onAddTask: (task: Omit<FinanceTask, 'id' | 'isCompleted'>) => void;
  onDeleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, days: number) => void;
}

export const FinanceTasksView: React.FC<FinanceTasksViewProps> = ({
  tasks,
  currency,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onSnoozeTask,
}) => {
  const [filterState, setFilterState] = useState<'active' | 'completed'>('active');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Bill');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('Monthly');
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (task: FinanceTask) => {
    if (!task.isCompleted) {
      // Trigger confetti & chime
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#06B6D4', '#3B82F6', '#F59E0B'],
        });
      } catch {}
      feedback.vibrate([30, 60, 30]);
      feedback.playSuccessChime();

      // Check if user wants to log as expense if task has an amount
      const shouldLog = task.amount && task.amount > 0 ? true : false;
      onToggleTask(task.id, shouldLog);
    } else {
      feedback.vibrate(20);
      feedback.playTapSound();
      onToggleTask(task.id, false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    feedback.vibrate(25);
    feedback.playGestureSuccessSound();

    onAddTask({
      title: title.trim(),
      amount: amount ? parseFloat(amount) : undefined,
      dueDate,
      category,
      priority,
      recurrence,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmount('');
    setDueDate('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  // Generate .ics calendar event for android / google calendar
  const handleExportToCalendar = (task: FinanceTask) => {
    const start = task.dueDate.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KiteFinance//Android Personal Finance Task//EN
BEGIN:VEVENT
SUMMARY:Finance Task: ${task.title}
DESCRIPTION:${task.amount ? `Amount: ${currency}${task.amount}. ` : ''}${task.notes || ''}
DTSTART;VALUE=DATE:${start}
DTEND;VALUE=DATE:${start}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT12H
ACTION:DISPLAY
DESCRIPTION:Reminder for ${task.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${task.title.replace(/\s+/g, '_')}_reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    feedback.vibrate(20);
  };

  const getDueStatus = (due: string, isCompleted: boolean) => {
    if (isCompleted) return { label: 'Paid / Completed', color: 'text-emerald-400', isOverdue: false };
    if (due < todayStr) {
      const diffDays = Math.ceil((new Date(todayStr).getTime() - new Date(due).getTime()) / (1000 * 3600 * 24));
      return { label: `Overdue by ${diffDays}d`, color: 'text-rose-400 font-bold', isOverdue: true };
    }
    if (due === todayStr) {
      return { label: 'Due Today', color: 'text-amber-400 font-bold', isOverdue: false };
    }
    const diffDays = Math.ceil((new Date(due).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'text-amber-300 font-medium', isOverdue: false };
    return { label: `Due in ${diffDays} days`, color: 'text-slate-400', isOverdue: false };
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesState = filterState === 'active' ? !t.isCompleted : t.isCompleted;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesState && matchesCategory;
  });

  const activeCount = tasks.filter((t) => !t.isCompleted).length;
  const overdueCount = tasks.filter((t) => !t.isCompleted && t.dueDate < todayStr).length;
  const upcomingBillsTotal = tasks
    .filter((t) => !t.isCompleted && t.amount)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top summary card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Finance Commitments
            </span>
            <h3 className="text-lg font-bold text-white">Tasks & Upcoming Bills</h3>
          </div>
          <button
            onClick={() => {
              feedback.vibrate(20);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Metric strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 block">Pending</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {activeCount}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Due Amount</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
              {currency}{upcomingBillsTotal.toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Overdue</span>
            <span className={`text-base font-bold font-mono tabular-nums ${overdueCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {overdueCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter tabs: Active vs Completed */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterState('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterState === 'active' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterState('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterState === 'completed' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({tasks.length - activeCount})
          </button>
        </div>

        {/* Category filter dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Categories</option>
          <option value="Bill">Bills</option>
          <option value="Subscription">Subscriptions</option>
          <option value="Savings">Savings Goals</option>
          <option value="Debt Payoff">Debt Payoff</option>
          <option value="Tax / Legal">Tax & Legal</option>
          <option value="Review">Reviews</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-10 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No tasks in this view</h4>
            <p className="text-xs text-slate-400 mt-1">
              {filterState === 'active'
                ? "You're all caught up! No bills or personal finance tasks pending."
                : 'No completed tasks archived yet.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const dueStatus = getDueStatus(task.dueDate, task.isCompleted);

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl bg-slate-900 border transition-all ${
                  task.isCompleted
                    ? 'border-slate-800/60 opacity-70'
                    : dueStatus.isOverdue
                    ? 'border-rose-900/50 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggle(task)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as paid'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-105 transition-transform" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          task.isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.amount && (
                        <span className="text-sm font-bold font-mono text-emerald-400 shrink-0 tabular-nums">
                          {currency}{task.amount.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Unboxed metadata line with typographic separators (anti-slop rule) */}
                    <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-400 mt-1">
                      <span className={dueStatus.color}>{dueStatus.label}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{task.category}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-0.5">
                        <Repeat className="w-3 h-3 text-slate-500" />
                        {task.recurrence}
                      </span>
                      {task.priority === 'High' && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-rose-400 font-medium">High Priority</span>
                        </>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-xs text-slate-400 mt-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                        {task.notes}
                      </p>
                    )}

                    {/* Action buttons footer */}
                    {!task.isCompleted && (
                      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-xs">
                        {/* Auto-record as expense quick button */}
                        {task.amount && (
                          <button
                            onClick={() => handleToggle(task)}
                            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Pay & Log Expense
                          </button>
                        )}

                        <button
                          onClick={() => {
                            feedback.vibrate(20);
                            onSnoozeTask(task.id, 3);
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Snooze +3d
                        </button>

                        <button
                          onClick={() => handleExportToCalendar(task)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                          title="Export calendar reminder (.ics) for Android / Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          Calendar
                        </button>

                        <button
                          onClick={() => {
                            feedback.vibrate(30);
                            onDeleteTask(task.id);
                          }}
                          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl pb-safe">
            <h3 className="text-base font-bold text-white mb-4">Add Personal Finance Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task or Bill Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electric Bill, Rent, Vanguard Roth IRA"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 120.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bill">Bill</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Savings">Savings</option>
                    <option value="Debt Payoff">Debt Payoff</option>
                    <option value="Tax / Legal">Tax</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Recurrence</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Once">Once</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Account number, portal link, or reminders"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
