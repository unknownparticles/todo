
import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ day: number, tasks: Task[] } | null>(null);
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  const getTasksForDay = (day: number) => {
    const d = new Date(year, month, day).toDateString();
    return tasks.filter(t => new Date(t.createdAt).toDateString() === d || (t.completedAt && new Date(t.completedAt).toDateString() === d));
  };

  const handleDayClick = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length > 0) setSelectedDayTasks({ day, tasks: dayTasks });
    else setSelectedDayTasks(null);
  };

  return (
    <div className="w-full px-6 space-y-6">
      <div className="bg-surface border border-main/5 p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-main tracking-tighter">{month + 1}月</h2>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-1">{year}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="w-10 h-10 flex items-center justify-center bg-main/5 hover:bg-main/10 rounded-full transition-all active:scale-90 text-main"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="w-10 h-10 flex items-center justify-center bg-main/5 hover:bg-main/10 rounded-full transition-all active:scale-90 text-main"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-3 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="text-[10px] font-black text-muted/30 pb-4 uppercase tracking-widest">{d}</div>)}
          {Array.from({ length: offset }).map((_, i) => <div key={`off-${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const dayTasks = getTasksForDay(day);
            const hasTasks = dayTasks.length > 0;
            const allDone = hasTasks && dayTasks.every(t => t.completed);
            const isSelected = selectedDayTasks?.day === day;
            return (
              <button key={day} onClick={() => handleDayClick(day)} className="aspect-square flex items-center justify-center relative group">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-300 ${isSelected ? 'ring-2 ring-brand-primary' : ''} ${allDone ? 'bg-brand-primary text-surface' : hasTasks ? 'bg-brand-primary/10 text-brand-primary' : 'text-main/40 hover:bg-main/5'}`}>
                  {day}
                </div>
                {hasTasks && !allDone && <div className="absolute bottom-1 w-1 h-1 bg-brand-secondary rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDayTasks && (
        <div className="bg-surface border border-main/5 p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-main uppercase tracking-widest">{selectedDayTasks.day}日 任务回顾</h3>
            <button onClick={() => setSelectedDayTasks(null)} className="text-muted/30 hover:text-main p-1 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="space-y-3">
            {selectedDayTasks.tasks.map(task => (
              <div key={task.id} className="flex items-center space-x-4 p-4 bg-main/5 rounded-2xl">
                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-brand-primary' : 'bg-muted/20'}`} />
                <span className={`flex-1 text-xs font-bold ${task.completed ? 'line-through text-muted' : 'text-main'}`}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
