
import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import Pomodoro from './components/Pomodoro';
import Calendar from './components/Calendar';
import Statistics from './components/Statistics';
import SchulteGrid from './components/SchulteGrid';
import { Task, Priority, SessionHistory, TimerSettings, TimerMode, FocusTarget, AppTheme, AppMode, AISettings, IAIService, SchulteResult } from './types';
import { getAIService } from './services/factory';
import SettingsModal from './components/SettingsModal';

type Tab = 'todo' | 'pomodoro' | 'calendar' | 'stats' | 'schulte';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zenflow_tasks_v2');
    let loadedTasks: Task[] = saved ? JSON.parse(saved) : [];
    const todayStr = new Date().toDateString();
    const lastVisit = localStorage.getItem('zenflow_last_visit');

    if (lastVisit && lastVisit !== todayStr) {
      // 隔天自动清除所有已完成
      loadedTasks = loadedTasks.filter(t => !t.completed);
    }
    localStorage.setItem('zenflow_last_visit', todayStr);
    return loadedTasks;
  });

  const [history, setHistory] = useState<SessionHistory[]>(() => {
    const saved = localStorage.getItem('zenflow_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [schulteHistory, setSchulteHistory] = useState<SchulteResult[]>(() => {
    const saved = localStorage.getItem('zenflow_schulte_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('zenflow_timer_settings');
    return saved ? JSON.parse(saved) : {
      [TimerMode.WORK]: 25,
      [TimerMode.SHORT_BREAK]: 5,
      [TimerMode.LONG_BREAK]: 15,
    };
  });

  const [theme, setTheme] = useState<AppTheme>(() => (localStorage.getItem('zenflow_theme') as AppTheme) || 'minimalist');
  const [mode, setMode] = useState<AppMode>(() => (localStorage.getItem('zenflow_mode') as AppMode) || 'light');

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('zenflow_ai_settings');
    return saved ? JSON.parse(saved) : {
      provider: 'gemini',
      geminiKey: '',
      deepseekKey: '',
      glmKey: ''
    };
  });

  const [activeTab, setActiveTab] = useState<Tab>('todo');
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [lastAnalyzedState, setLastAnalyzedState] = useState<string>(() => localStorage.getItem('zenflow_last_analyzed') || '');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('zenflow_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('zenflow_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zenflow_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('zenflow_timer_settings', JSON.stringify(timerSettings));
  }, [timerSettings]);

  useEffect(() => {
    localStorage.setItem('zenflow_schulte_history', JSON.stringify(schulteHistory));
  }, [schulteHistory]);

  useEffect(() => {
    localStorage.setItem('zenflow_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('zenflow_last_analyzed', lastAnalyzedState);
  }, [lastAnalyzedState]);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const addTask = (text: string, priority: Priority, tags: string[]) => {
    setTasks([...tasks, {
      id: crypto.randomUUID(), text, completed: false, createdAt: Date.now(),
      priority, tags, subtasks: [], focusTime: 0
    }]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isCompleted = !t.completed;
        return { ...t, completed: isCompleted, completedAt: isCompleted ? Date.now() : undefined };
      }
      return t;
    }));
  };

  const addSubtask = (taskId: string, text: string) => {
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t, subtasks: [...t.subtasks, { id: crypto.randomUUID(), text, completed: false }]
    } : t));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
    } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (focusTarget?.id === id || focusTarget?.parentId === id) setFocusTarget(null);
  };

  const clearCompletedTasks = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  const handleSessionComplete = (minutes: number) => {
    const effectiveMins = minutes > 0 ? Math.max(1, Math.ceil(minutes)) : 0;
    if (effectiveMins === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = history.findIndex(h => h.date === today);
    if (existingIndex > -1) {
      const updated = [...history];
      updated[existingIndex].minutes += effectiveMins;
      setHistory(updated);
    } else {
      setHistory([...history, { date: today, minutes: effectiveMins, tasksCompleted: 0 }]);
    }
    if (focusTarget) {
      const targetId = focusTarget.type === 'task' ? focusTarget.id : focusTarget.parentId;
      if (targetId) {
        setTasks(tasks.map(t => t.id === targetId ? { ...t, focusTime: t.focusTime + effectiveMins * 60 } : t));
      }
    }
  };

  const triggerReview = async () => {
    if (tasks.length === 0) {
      setAiReview("当前还没有待办任务，先写下你的目标吧！");
      return;
    }

    const currentState = JSON.stringify(tasks.map(t => ({ id: t.id, text: t.text, completed: t.completed })));
    if (currentState === lastAnalyzedState && aiReview) {
      setAiReview("任务状态未变更，无需重复分析。继续加油！");
      return;
    }

    setIsReviewLoading(true);
    const service = getAIService(aiSettings);
    if (!service) {
      setAiReview("请先在设置中配置并开启 AI 密钥。");
      setIsReviewLoading(false);
      return;
    }
    const review = await service.getEndDayReview(tasks);
    setAiReview(review);
    setLastAnalyzedState(currentState);
    setIsReviewLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto pb-32 transition-colors duration-500">
      <header className="px-6 py-8 flex justify-between items-end sticky top-0 bg-page/90 backdrop-blur-sm z-30">
        <div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tight leading-none">专注</h1>
          <p className="text-xs text-muted font-bold mt-2 flex items-center">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            className="w-10 h-10 flex items-center justify-center bg-surface border border-main/5 rounded-full text-main transition-transform active:scale-90"
            title="切换模式"
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-surface border border-main/5 rounded-full text-main active:scale-90"
            title="AI 设置"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button
            onClick={triggerReview}
            disabled={isReviewLoading}
            className="w-10 h-10 flex items-center justify-center bg-surface border border-main/5 rounded-full text-main active:scale-90"
            title="AI 每日总结"
          >
            {isReviewLoading ? <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          </button>
        </div>
      </header>

      {aiReview && (
        <div className="mx-6 mb-8 p-5 bg-surface border border-brand-primary/10 rounded-2xl relative animate-in fade-in slide-in-from-top-4 duration-500">
          <button onClick={() => setAiReview(null)} className="absolute top-3 right-3 text-muted/40 hover:text-main transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          <div className="flex items-start space-x-4">
            <span className="text-2xl mt-1">✨</span>
            <div className="flex-1">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">每日洞察</p>
              <p className="text-sm text-main font-medium leading-relaxed">{aiReview}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'todo' && <TodoList tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onAddSubtask={addSubtask} onToggleSubtask={toggleSubtask} onClearCompleted={clearCompletedTasks} onSetFocus={(t) => { setFocusTarget(t); setActiveTab('pomodoro'); }} />}
        {activeTab === 'pomodoro' && <div className="pt-2 pb-6"><Pomodoro focusedTarget={focusTarget} settings={timerSettings} onSettingsChange={setTimerSettings} onSessionComplete={handleSessionComplete} /></div>}
        {activeTab === 'calendar' && <Calendar tasks={tasks} />}
        {activeTab === 'schulte' && <SchulteGrid history={schulteHistory} onSaveResult={(res) => setSchulteHistory([...schulteHistory, res])} aiSettings={aiSettings} />}
        {activeTab === 'stats' && (
          <div className="space-y-6 pb-6">
            <Statistics tasks={tasks} history={history} />
            <div className="mx-6 p-8 bg-surface rounded-[2rem] border border-main/5">
              <h3 className="text-sm font-bold text-main mb-6 flex items-center">
                <span className="w-1 h-4 bg-brand-primary mr-2 rounded-full" />
                视觉主题
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'minimalist', label: '极简主义', desc: '纯净黑白', color: 'bg-zinc-800' },
                  { id: 'youthful', label: '青春活力', desc: '灵感撞色', color: 'bg-violet-500' },
                  { id: 'business', label: '商务沉稳', desc: '高效利落', color: 'bg-blue-900' },
                  { id: 'nature', label: '简约自然', desc: '治愈森系', color: 'bg-emerald-700' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as AppTheme)}
                    className={`flex items-center p-4 rounded-2xl transition-all border-2 ${theme === t.id ? 'border-brand-primary bg-brand-primary/5' : 'border-transparent bg-main/5 hover:bg-main/10'}`}
                  >
                    <div className={`w-8 h-8 rounded-full shrink-0 ${t.color}`} />
                    <div className="ml-3 text-left">
                      <p className="text-xs font-bold text-main">{t.label}</p>
                      <p className="text-[9px] text-muted font-medium mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-surface/90 backdrop-blur-xl border border-main/5 rounded-[2.5rem] shadow-2xl p-2 z-40 flex items-center justify-around">
        {[
          { id: 'todo', label: '待办', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { id: 'pomodoro', label: '计时', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { id: 'schulte', label: '专注', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
          { id: 'calendar', label: '日历', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: 'stats', label: '成就', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-col items-center py-2 px-5 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-brand-primary text-surface' : 'text-muted hover:text-main'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
            <span className="text-[9px] font-bold mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
      {isSettingsOpen && (
        <SettingsModal
          settings={aiSettings}
          onSave={setAiSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
