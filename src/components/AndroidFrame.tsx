import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  mode: 'frame' | 'fullscreen';
  onToggleMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  mode,
  onToggleMode,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 overflow-x-hidden">
      {/* Desktop Mode Toggle Bar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-sm mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Android 15 Experience</span>
          <span className="text-[11px] text-slate-500 font-mono">Pixel Shell</span>
        </div>
        <button
          onClick={onToggleMode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
          title="Toggle between phone frame and full desktop view"
        >
          {mode === 'frame' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          mode === 'frame'
            ? 'md:max-w-[420px] md:h-[880px] md:rounded-[48px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] bg-slate-950 overflow-hidden min-h-screen md:min-h-0'
            : 'max-w-4xl min-h-screen bg-slate-950 md:rounded-3xl md:border md:border-slate-800 md:p-4'
        }`}
      >
        {/* Android Native Status Bar */}
        <div className="w-full h-10 px-6 pt-1.5 flex items-center justify-between text-xs text-slate-300 font-medium select-none z-30 shrink-0 bg-slate-950/90 border-b border-slate-900/40">
          <span className="font-mono text-[13px] font-semibold text-slate-200">
            {timeStr}
          </span>

          {/* Camera hole punch on frame mode */}
          {mode === 'frame' && (
            <div className="hidden md:block w-3.5 h-3.5 rounded-full bg-black border border-slate-800/80 shadow-inner" />
          )}

          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span>96%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Content Body Area */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>

        {/* Android Gesture Navigation Pill at bottom */}
        <div className="w-full h-6 flex items-center justify-center shrink-0 bg-slate-950 select-none pb-1 pointer-events-none z-30">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
