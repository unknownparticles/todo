
import React, { useState, useMemo } from 'react';
import { Task, Priority, Subtask, FocusTarget } from '../types';

interface TodoListProps {
  tasks: Task[];
  onAddTask: (text: string, priority: Priority, tags: string[]) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onClearCompleted: () => void;
  onSetFocus: (target: FocusTarget) => void;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onAddSubtask, onToggleSubtask, onClearCompleted, onSetFocus }) => {
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    tasks.forEach(t => {
      total++;
      if (t.completed) completed++;
      t.subtasks.forEach(st => {
        total++;
        if (st.completed) completed++;
      });
    });
    return { 
      percentage: total ? Math.round((completed / total) * 100) : 0,
      unfinishedCount: tasks.filter(t => !t.completed).length
    };
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue.trim(), priority, []);
      setInputValue('');
      setPriority('medium');
    }
  };

  const handleSubtaskSubmit = (taskId: string) => {
    const text = subtaskInputs[taskId];
    if (text?.trim()) {
      onAddSubtask(taskId, text.trim());
      setSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
    }
  };

  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    setTouchStartX(e.touches[0].clientX);
    setSwipingId(taskId);
  };

  const handleTouchEnd = (e: React.TouchEvent, taskId: string, isCompleted: boolean) => {
    if (touchStartX !== null) {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      if (deltaX > 70 && isCompleted) {
        onDeleteTask(taskId);
      }
    }
    setTouchStartX(null);
    setSwipingId(null);
  };

  const getPriorityLabel = (p: Priority) => {
    switch (p) {
      case 'high': return '优先';
      case 'medium': return '普通';
      case 'low': return '稍后';
      default: return '';
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-zinc-400';
      case 'low': return 'bg-zinc-200';
      default: return 'bg-zinc-300';
    }
  };

  return (
    <div className="w-full px-6 flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-sm font-black text-brand-primary uppercase tracking-widest">任务进度</h2>
            <div className="flex items-baseline mt-1 space-x-2">
              <span className="text-4xl font-black text-main">{stats.percentage}%</span>
              <span className="text-xs text-muted font-bold tracking-tight">已完成今日目标</span>
            </div>
          </div>
          <button 
            onClick={onClearCompleted}
            className="text-[10px] font-bold text-muted hover:text-main transition-colors uppercase tracking-widest bg-main/5 px-3 py-1.5 rounded-full"
          >
            清理完成项
          </button>
        </div>
        <div className="w-full bg-main/5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-brand-primary h-full transition-all duration-1000 ease-out" style={{ width: `${stats.percentage}%` }} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="下一步要做什么？"
            className="w-full px-6 py-5 bg-surface border border-main/5 rounded-3xl focus:border-brand-primary/20 transition-all font-medium text-main placeholder:text-muted/40"
          />
          <button type="submit" className="absolute right-3 top-3 w-10 h-10 flex items-center justify-center bg-brand-primary text-surface rounded-2xl shadow-lg shadow-brand-primary/10 transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <div className="flex space-x-2 px-1">
          {(['low', 'medium', 'high'] as Priority[]).map(p => (
            <button key={p} type="button" onClick={() => setPriority(p)} className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all border ${priority === p ? `bg-brand-primary border-brand-primary text-surface` : 'bg-surface border-main/5 text-muted hover:bg-main/5'}`}>
              {getPriorityLabel(p)}
            </button>
          ))}
        </div>
      </form>

      <div className="space-y-4 pb-12">
        {tasks.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <div className="w-12 h-12 border-2 border-dashed border-main rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-lg">+</span>
            </div>
            <p className="text-sm font-bold tracking-tight">点击上方添加新任务</p>
          </div>
        ) : tasks
          .sort((a, b) => {
            if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
            return b.createdAt - a.createdAt;
          })
          .map(task => (
            <div 
              key={task.id} 
              className={`group rounded-3xl border transition-all duration-500 relative overflow-hidden touch-pan-y ${
                task.completed ? 'bg-main/5 border-transparent opacity-50' : 'bg-surface border-main/5'
              }`}
              onTouchStart={(e) => handleTouchStart(e, task.id)}
              onTouchEnd={(e) => handleTouchEnd(e, task.id, task.completed)}
            >
              {swipingId === task.id && task.completed && (
                <div className="absolute inset-0 bg-orange-500 flex items-center justify-end pr-6 pointer-events-none animate-in fade-in duration-200">
                  <span className="text-surface text-[10px] font-black uppercase tracking-widest">释放以删除</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <button 
                      onClick={() => onToggleTask(task.id)} 
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-brand-primary border-brand-primary text-surface' : 'border-main/10 group-hover:border-brand-primary/40'}`}
                    >
                      {task.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <div className="ml-4">
                      <h3 className={`font-bold text-main leading-tight transition-all ${task.completed ? 'line-through opacity-40' : ''}`}>{task.text}</h3>
                      {!task.completed && (
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-surface ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {task.subtasks.length === 0 && (
                      <button onClick={() => onSetFocus({ type: 'task', id: task.id, text: task.text })} className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    )}
                    <button onClick={() => onDeleteTask(task.id)} className="p-2 text-muted/30 hover:text-orange-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                <div className={`mt-5 ml-10 space-y-3 transition-all ${task.completed ? 'opacity-30' : ''}`}>
                  {task.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center group/sub">
                      <button onClick={() => onToggleSubtask(task.id, sub.id)} className={`w-4.5 h-4.5 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${sub.completed ? 'bg-brand-primary border-brand-primary text-surface' : 'border-main/5 hover:border-brand-primary/20'}`}>
                        {sub.completed && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`flex-1 ml-3 text-xs font-semibold text-main/80 ${sub.completed ? 'line-through opacity-40' : ''}`}>{sub.text}</span>
                      <button 
                        onClick={() => onSetFocus({ type: 'subtask', id: sub.id, parentId: task.id, text: sub.text })} 
                        className="opacity-0 group-hover/sub:opacity-100 text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 transition-all"
                        title="专注子任务"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </div>
                  ))}
                  {!task.completed && (
                    <div className="flex items-center pt-2 group-focus-within:border-brand-primary/10 border-t border-transparent">
                      <input
                        type="text"
                        value={subtaskInputs[task.id] || ''}
                        onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [task.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubtaskSubmit(task.id)}
                        placeholder="添加子任务..."
                        className="flex-1 bg-transparent text-[10px] font-bold border-none p-0 placeholder:text-muted/20 tracking-widest"
                      />
                      {subtaskInputs[task.id] && (
                        <button onClick={() => handleSubtaskSubmit(task.id)} className="text-brand-primary ml-2 animate-in fade-in slide-in-from-right-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default TodoList;
