
import React from 'react';
import { Task, SessionHistory } from '../types';

interface StatisticsProps {
  tasks: Task[];
  history: SessionHistory[];
}

const Statistics: React.FC<StatisticsProps> = ({ tasks, history }) => {
  const totalMinutes = history.reduce((acc, h) => acc + h.minutes, 0);
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
  
  const completedWithTime = completedTasks.filter(t => t.completedAt);
  const avgHours = completedWithTime.length 
    ? (completedWithTime.reduce((acc, t) => acc + (t.completedAt! - t.createdAt), 0) / completedWithTime.length / (1000 * 60 * 60)).toFixed(1)
    : 0;

  return (
    <div className="w-full px-6 flex flex-col space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-surface border border-main/5 rounded-[2rem] text-center">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">累计专注</p>
          <p className="text-3xl font-black text-brand-primary tracking-tight">
            {Math.floor(totalMinutes / 60)}<span className="text-sm font-bold opacity-30 ml-1">时</span> {totalMinutes % 60}<span className="text-sm font-bold opacity-30 ml-1">分</span>
          </p>
        </div>
        <div className="p-6 bg-surface border border-main/5 rounded-[2rem] text-center">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">平均效率</p>
          <p className="text-3xl font-black text-brand-secondary tracking-tight">
            {avgHours}<span className="text-sm font-bold opacity-30 ml-1">时/任务</span>
          </p>
        </div>
      </div>

      <div className="p-8 bg-surface border border-main/5 rounded-[2.5rem] relative">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xs font-black text-main uppercase tracking-[0.3em]">专注趋势</h3>
          <span className="text-[9px] font-bold text-muted bg-main/5 px-3 py-1 rounded-full uppercase">近 7 日</span>
        </div>
        <div className="flex items-end justify-between h-40 px-2 gap-4">
          {history.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center opacity-20 py-10">
              <div className="w-1 h-20 bg-main/10 rounded-full mb-4" />
              <p className="text-[10px] font-bold tracking-widest uppercase">暂无趋势记录</p>
            </div>
          ) : history.slice(-7).map((day, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group relative">
              <div 
                className="w-full bg-main/5 rounded-full transition-all duration-700 ease-out hover:bg-brand-primary/40 group-hover:bg-brand-primary/60" 
                style={{ height: `${Math.max(8, Math.min(100, (day.minutes / 180) * 100))}%` }} 
              />
              <span className="text-[8px] font-black text-muted mt-4 uppercase tracking-tighter">{day.date.split('-').slice(1).join('/')}</span>
              <div className="absolute -top-12 bg-main text-surface text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-xl">
                {day.minutes}m
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-surface border border-main/5 rounded-[2.5rem]">
        <h3 className="text-xs font-black text-main uppercase tracking-[0.3em] mb-8">任务达成</h3>
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-4xl font-black text-main tabular-nums">{completedTasks.length}</span>
            <span className="text-xs text-muted font-bold ml-2">已完成</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-brand-primary tabular-nums">{completionRate}%</span>
            <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">总成功率</p>
          </div>
        </div>
        <div className="w-full bg-main/5 h-2 rounded-full overflow-hidden">
          <div className="bg-brand-primary h-full transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
