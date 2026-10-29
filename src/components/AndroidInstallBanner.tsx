import React from 'react';
import { Smartphone, Download, X } from 'lucide-react';

interface AndroidInstallBannerProps {
  isInstallable: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  isInstallable,
  onInstall,
  onDismiss,
}) => {
  if (!isInstallable) return null;

  return (
    <div className="mx-4 mb-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-lg flex items-center justify-between gap-3 animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold text-white block truncate">
            Install Android App
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            Add KiteFinance to home screen & app drawer
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onInstall}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={onDismiss}
          className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
