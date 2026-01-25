
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, TimerState, FocusTarget, TimerSettings } from '../types';

interface PomodoroProps {
  focusedTarget: FocusTarget | null;
  settings: TimerSettings;
  onSessionComplete: (minutes: number) => void;
  onSettingsChange: (newSettings: TimerSettings) => void;
}

const Pomodoro: React.FC<PomodoroProps> = ({ focusedTarget, settings, onSessionComplete, onSettingsChange }) => {
  const [state, setState] = useState<TimerState>({
    secondsLeft: settings[TimerMode.WORK] * 60,
    isActive: false,
    mode: TimerMode.WORK,
    sessionsCompleted: 0,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state.isActive) {
      setState(prev => ({ ...prev, secondsLeft: settings[prev.mode] * 60 }));
    }
  }, [settings, state.isActive, state.mode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setState(prev => ({
      ...prev,
      mode: newMode,
      secondsLeft: settings[newMode] * 60,
      isActive: false,
    }));
  }, [settings]);

  useEffect(() => {
    if (state.isActive && state.secondsLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setState(prev => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }));
      }, 1000);
    } else if (state.secondsLeft === 0 && state.isActive) {
      if (state.mode === TimerMode.WORK) {
        const newSessionCount = state.sessionsCompleted + 1;
        const nextMode = newSessionCount % 4 === 0 ? TimerMode.LONG_BREAK : TimerMode.SHORT_BREAK;
        onSessionComplete(settings[TimerMode.WORK]);
        setState(prev => ({ ...prev, sessionsCompleted: newSessionCount }));
        switchMode(nextMode);
      } else {
        switchMode(TimerMode.WORK);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isActive, state.secondsLeft, state.mode, state.sessionsCompleted, switchMode, onSessionComplete, settings]);

  const toggleTimer = () => setState(prev => ({ ...prev, isActive: !prev.isActive }));
  const resetTimer = () => setState(prev => ({ ...prev, secondsLeft: settings[prev.mode] * 60, isActive: false }));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (state.secondsLeft / (settings[state.mode] * 60)) * 100;

  const handleDurationChange = (mode: TimerMode, value: string) => {
    const numValue = parseInt(value) || 1;
    onSettingsChange({ ...settings, [mode]: Math.max(1, Math.min(numValue, 120)) });
  };

  return (
    <div className="flex flex-col items-center justify-start space-y-4 p-6 bg-surface border border-main/5 rounded-[2.5rem] w-full max-w-sm mx-auto relative overflow-hidden transition-all duration-500 shadow-sm">
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="absolute top-6 right-6 p-2 text-muted/30 hover:text-brand-primary transition-colors z-20"
      >
        <svg className={`w-5 h-5 transition-transform duration-700 ${isSettingsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
      </button>

      {isSettingsOpen ? (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <h3 className="text-xs font-black text-main uppercase tracking-[0.3em] text-center">时长偏好</h3>
          <div className="space-y-3">
            {[
              { mode: TimerMode.WORK, label: '专注', color: 'text-brand-primary' },
              { mode: TimerMode.SHORT_BREAK, label: '短休', color: 'text-brand-secondary' },
              { mode: TimerMode.LONG_BREAK, label: '长休', color: 'text-main' }
            ].map(item => (
              <div key={item.mode} className="flex items-center justify-between bg-main/5 p-4 rounded-2xl">
                <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.label}</span>
                <div className="flex items-center">
                  <input type="number" min="1" max="120" value={settings[item.mode]} onChange={(e) => handleDurationChange(item.mode, e.target.value)} className="w-12 bg-transparent border-none p-0 text-sm font-black text-center text-main focus:ring-0" />
                  <span className="text-[10px] font-bold text-muted ml-1 uppercase">Mins</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-brand-primary text-surface rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all active:scale-95">完成设置</button>
        </div>
      ) : (
        <>
          <div className="text-center min-h-[3.5rem] flex flex-col justify-center">
            {focusedTarget ? (
              <div className="animate-in fade-in duration-700">
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">专注中</p>
                <h3 className="text-base font-bold text-main px-4 line-clamp-1">{focusedTarget.text}</h3>
              </div>
            ) : (
              <p className="text-xs font-bold text-muted opacity-40 italic tracking-tight">保持专注，进入心流。</p>
            )}
          </div>

          <div className="flex bg-main/5 p-1 rounded-2xl w-full">
            {[TimerMode.WORK, TimerMode.SHORT_BREAK, TimerMode.LONG_BREAK].map(mode => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center space-y-0.5 ${state.mode === mode ? 'bg-surface shadow-sm text-brand-primary' : 'text-muted hover:text-main'}`}
              >
                <span>{mode === TimerMode.WORK ? '专注' : mode === TimerMode.SHORT_BREAK ? '短休' : '长休'}</span>
                <span className="text-[8px] opacity-60 font-bold">{settings[mode]}分钟</span>
              </button>
            ))}
          </div>

          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-main/5" />
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray="283%" strokeDashoffset={`${283 - (283 * progress) / 100}%`} className={`transition-all duration-1000 ease-linear ${state.mode === TimerMode.WORK ? 'text-brand-primary' : 'text-brand-secondary'}`} strokeLinecap="round" />
            </svg>
            <div className="text-center z-10">
              <span className="text-5xl font-black tracking-tighter text-main tabular-nums leading-none">{formatTime(state.secondsLeft)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full">
            <button onClick={toggleTimer} className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-surface shadow-xl transition-all active:scale-95 ${state.isActive ? 'bg-brand-secondary shadow-brand-secondary/10' : 'bg-brand-primary shadow-brand-primary/10'}`}>
              {state.isActive ? '暂停' : '开始专注'}
            </button>
            <button onClick={resetTimer} className="w-16 py-5 bg-main/5 rounded-2xl text-muted/40 hover:text-main transition-colors flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Pomodoro;
