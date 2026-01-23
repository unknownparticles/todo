import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SchulteResult, AISettings } from '../types';
import { getAIService } from '../services/factory';

interface SchulteGridProps {
    history: SchulteResult[];
    onSaveResult: (result: SchulteResult) => void;
    aiSettings: AISettings;
}

const SchulteGrid: React.FC<SchulteGridProps> = ({ history, onSaveResult, aiSettings }) => {
    const [grid, setGrid] = useState<number[]>([]);
    const [nextNumber, setNextNumber] = useState(1);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [status, setStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const generateGrid = useCallback(() => {
        const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        setGrid(numbers);
        setNextNumber(1);
        setStartTime(null);
        setCurrentTime(0);
        setStatus('idle');
        setAiAnalysis(null);
    }, []);

    useEffect(() => {
        generateGrid();
    }, [generateGrid]);

    useEffect(() => {
        if (status === 'playing') {
            timerRef.current = setInterval(() => {
                if (startTime) {
                    setCurrentTime((Date.now() - startTime) / 1000);
                }
            }, 100);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, startTime]);

    const handleNumberClick = (num: number) => {
        if (status === 'finished') return;

        if (num === nextNumber) {
            if (num === 1) {
                setStatus('playing');
                setStartTime(Date.now());
            }

            if (num === 25) {
                const endTime = Date.now();
                const timeTaken = startTime ? (endTime - startTime) / 1000 : 0;
                setStatus('finished');
                setCurrentTime(timeTaken);

                const newResult: SchulteResult = {
                    id: crypto.randomUUID(),
                    timestamp: endTime,
                    timeTaken: parseFloat(timeTaken.toFixed(2)),
                    gridSize: 5
                };
                onSaveResult(newResult);
            } else {
                setNextNumber(nextNumber + 1);
            }
        }
    };

    const triggerAIAnalysis = async () => {
        if (history.length === 0) return;

        setIsAnalyzing(true);
        const service = getAIService(aiSettings);
        if (!service) {
            setAiAnalysis("请先在设置中配置 AI。");
            setIsAnalyzing(false);
            return;
        }

        const analysis = await service.getSchulteFocusAnalysis(history.slice(-5));
        setAiAnalysis(analysis);
        setIsAnalyzing(false);
    };

    return (
        <div className="px-6 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col items-center text-center space-y-2">
                <h2 className="text-2xl font-black text-main tracking-tight">舒尔特方格</h2>
                <p className="text-xs text-muted font-bold uppercase tracking-widest">请按顺序点击数字 1-25</p>
            </div>

            <div className="flex justify-between items-center bg-surface p-4 rounded-3xl border border-main/5 px-8">
                <div className="text-center">
                    <p className="text-[10px] text-muted font-black uppercase tracking-tighter">当前目标</p>
                    <p className="text-2xl font-black text-brand-primary">{status === 'finished' ? '✓' : nextNumber}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-muted font-black uppercase tracking-tighter">用时</p>
                    <p className="text-2xl font-black text-main font-mono">{currentTime.toFixed(1)}s</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 aspect-square max-w-md mx-auto">
                {grid.map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className={`
              aspect-square flex items-center justify-center text-xl font-bold rounded-2xl transition-all duration-200
              ${num < nextNumber ? 'bg-brand-primary/10 text-brand-primary/40' : 'bg-surface border border-main/5 text-main active:scale-90 hover:border-brand-primary/30'}
              ${status === 'finished' && 'opacity-50 pointer-events-none'}
            `}
                    >
                        {num}
                    </button>
                ))}
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={generateGrid}
                    className="flex-1 py-4 bg-brand-primary text-surface rounded-2xl font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-brand-primary/20"
                >
                    {status === 'finished' ? '再试一次' : '重新生成'}
                </button>
                <button
                    onClick={triggerAIAnalysis}
                    disabled={isAnalyzing || history.length === 0}
                    className="px-6 py-4 bg-surface border border-brand-primary/20 text-brand-primary rounded-2xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
                >
                    {isAnalyzing ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'AI 分析'}
                </button>
            </div>

            {aiAnalysis && (
                <div className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl relative animate-in fade-in slide-in-from-top-4">
                    <button onClick={() => setAiAnalysis(null)} className="absolute top-3 right-3 text-muted/40 hover:text-main"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    <div className="flex items-start space-x-3">
                        <span className="text-xl">📊</span>
                        <div>
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">专注力洞察</p>
                            <p className="text-xs text-main font-medium leading-relaxed">{aiAnalysis}</p>
                        </div>
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div className="bg-surface rounded-3xl border border-main/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-main/5">
                        <h3 className="text-xs font-black text-muted uppercase tracking-widest">练习历史</h3>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-muted font-bold">
                                    <th className="px-6 py-3">日期</th>
                                    <th className="px-6 py-3 text-right">用时</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-main/5 font-medium">
                                {[...history].reverse().map((res) => (
                                    <tr key={res.id}>
                                        <td className="px-6 py-3 text-main">{new Date(res.timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-6 py-3 text-right font-mono text-brand-primary">{res.timeTaken.toFixed(2)}s</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchulteGrid;
