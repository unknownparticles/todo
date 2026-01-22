
import React, { useState } from 'react';
import { AISettings, AIProvider } from '../types';

interface SettingsModalProps {
    settings: AISettings;
    onSave: (settings: AISettings) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
    // 切换提供商并立即通知父组件
    const handleProviderChange = (p: AIProvider) => {
        onSave({ ...settings, provider: p });
    };

    // 更新 API Key 并立即通知父组件
    const handleKeyChange = (value: string) => {
        const keyMap = {
            gemini: 'geminiKey',
            deepseek: 'deepseekKey',
            glm: 'glmKey'
        };
        onSave({ ...settings, [keyMap[settings.provider]]: value });
    };

    const currentKey = settings.provider === 'gemini'
        ? settings.geminiKey
        : settings.provider === 'deepseek'
            ? settings.deepseekKey
            : settings.glmKey;

    const providerLabel = settings.provider === 'gemini'
        ? 'Gemini'
        : settings.provider === 'deepseek'
            ? 'DeepSeek'
            : 'ChatGLM';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-md rounded-[2.5rem] border border-main/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-main flex items-center">
                            <span className="w-1.5 h-6 bg-brand-primary mr-3 rounded-full" />
                            AI 配置
                        </h2>
                        <button onClick={onClose} className="text-muted hover:text-main transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">模型提供商</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['gemini', 'deepseek', 'glm'] as AIProvider[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handleProviderChange(p)}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${settings.provider === p ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-main/5 bg-main/5 text-muted hover:bg-main/10'}`}
                                    >
                                        {p === 'gemini' ? 'Gemini' : p === 'deepseek' ? 'DeepSeek' : 'ChatGLM'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">{providerLabel} API Key</label>
                                <input
                                    type="password"
                                    value={currentKey}
                                    onChange={e => handleKeyChange(e.target.value)}
                                    placeholder={`在此输入 ${providerLabel} 密钥`}
                                    className="w-full bg-main/5 border border-main/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <p className="text-[10px] text-muted text-center font-medium opacity-60 px-4">
                            修改将立即保存至本地。点击右上角关闭按钮以退出。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
