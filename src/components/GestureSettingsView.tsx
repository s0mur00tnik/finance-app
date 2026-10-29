import React, { useState } from 'react';
import { 
  Sliders, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Download, 
  RotateCcw, 
  Check, 
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  Globe,
  Info
} from 'lucide-react';
import { AppSettings } from '../types/finance';
import { feedback } from '../utils/haptics';

interface GestureSettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
}

export const GestureSettingsView: React.FC<GestureSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportJSON,
  onExportCSV,
  onResetData,
}) => {
  const [savedNotice, setSavedNotice] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    feedback.vibrate(15);
    feedback.playTapSound();
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const CURRENCIES = [
    { symbol: '$', code: 'USD - United States Dollar' },
    { symbol: '€', code: 'EUR - Euro' },
    { symbol: '£', code: 'GBP - British Pound' },
    { symbol: '₹', code: 'INR - Indian Rupee' },
    { symbol: '¥', code: 'JPY - Japanese Yen' },
    { symbol: 'C$', code: 'CAD - Canadian Dollar' },
    { symbol: 'A$', code: 'AUD - Australian Dollar' },
  ];

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Android Controls & Settings
            </span>
            <h3 className="text-lg font-bold text-white">Gestures & System</h3>
          </div>
          {savedNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>


      {/* Android Back Tap 3x Configuration */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Backside Triple-Tap Gesture</h4>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-semibold">Active</span>
        </div>
        
        <p className="text-xs text-slate-400">
          Tap the backside of your phone <strong>3 times</strong> rapidly to immediately open the quick expense window, select a category, and record an expense.
        </p>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Gesture Status</span>
            <input
              type="checkbox"
              checked={settings.backTapConfig?.enabled ?? true}
              onChange={(e) =>
                updateSetting('backTapConfig', {
                  ...settings.backTapConfig,
                  enabled: e.target.checked,
                  tapsRequired: 3,
                  hapticFeedback: true,
                  sensitivity: settings.backTapConfig?.sensitivity || 'medium',
                })
              }
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Sensor Tap Sensitivity (Z-axis Shock Deceleration)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() =>
                    updateSetting('backTapConfig', {
                      ...settings.backTapConfig,
                      enabled: true,
                      tapsRequired: 3,
                      hapticFeedback: true,
                      sensitivity: lvl,
                    })
                  }
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    (settings.backTapConfig?.sensitivity || 'medium') === lvl
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Medium is optimized for most Android devices (Pixel, Samsung Galaxy, OnePlus).
            </span>
          </div>
        </div>
      </div>

      {/* Currency & Monthly Budget Settings */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Currency & Budget Limits</span>
        </h4>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => updateSetting('currency', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.code}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Monthly Budget Cap</label>
            <input
              type="number"
              value={settings.monthlyBudget}
              onChange={(e) => updateSetting('monthlyBudget', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Daily Spending Target</label>
            <input
              type="number"
              value={settings.dailyBudgetGoal}
              onChange={(e) => updateSetting('dailyBudgetGoal', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Audio & Haptic Feedback Toggles */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white">Tactile Feedback</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Keypad & Gesture Audio</span>
              <span className="text-[11px] text-slate-400">Synthesized audio clicks & chimes</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Haptic Vibration</span>
              <span className="text-[11px] text-slate-400">Android tactile vibration on actions</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.hapticsEnabled}
            onChange={(e) => updateSetting('hapticsEnabled', e.target.checked)}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Display Android Device Frame</span>
              <span className="text-[11px] text-slate-400">Simulate Pixel/Galaxy frame on desktop</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.deviceFrameMode === 'frame'}
            onChange={(e) => updateSetting('deviceFrameMode', e.target.checked ? 'frame' : 'fullscreen')}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <h4 className="text-sm font-bold text-white mb-2">Data Backup & Export</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportCSV}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onExportJSON}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup</span>
          </button>
        </div>

        <button
          onClick={onResetData}
          className="w-full mt-2 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/40 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Fresh Sample Ledger</span>
        </button>
      </div>

      {/* App Version Info */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
              1.0
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">KiteFinance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Version 1.0.0 by <span className="text-emerald-400 font-medium font-mono">p1ngsw33p</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Stable</span>
        </div>
      </div>
    </div>
  );
};
