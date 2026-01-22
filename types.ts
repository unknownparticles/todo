
export type Priority = 'high' | 'medium' | 'low';
export type AppTheme = 'minimalist' | 'youthful' | 'business' | 'nature';
export type AppMode = 'light' | 'dark';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority: Priority;
  tags: string[];
  subtasks: Subtask[];
  focusTime: number;
}

export type FocusTarget = {
  type: 'task' | 'subtask';
  id: string;
  parentId?: string;
  text: string;
};

export interface SessionHistory {
  date: string;
  minutes: number;
  tasksCompleted: number;
}

export enum TimerMode {
  WORK = '专注时间',
  SHORT_BREAK = '短休时间',
  LONG_BREAK = '长休时间'
}

export interface TimerSettings {
  [TimerMode.WORK]: number;
  [TimerMode.SHORT_BREAK]: number;
  [TimerMode.LONG_BREAK]: number;
}

export interface TimerState {
  secondsLeft: number;
  isActive: boolean;
  mode: TimerMode;
  sessionsCompleted: number;
}
export interface IAIService {
  getEndDayReview(tasks: Task[]): Promise<string>;
  getTaskPrioritySuggestion(tasks: Task[]): Promise<string[]>;
}

export type AIProvider = 'gemini' | 'deepseek' | 'glm';

export interface AISettings {
  provider: AIProvider;
  geminiKey: string;
  deepseekKey: string;
  glmKey: string;
}
