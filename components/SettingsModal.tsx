
import React, { useState } from 'react';
import { AISettings, AIProvider } from '../types';

interface SettingsModalProps {
    settings: AISettings;
    onSave: (settings: AISettings) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
    const [localSettings, setLocalSettings] = useState<AISettings>(settings);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

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
                                        onClick={() => setLocalSettings({ ...localSettings, provider: p })}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${localSettings.provider === p ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-main/5 bg-main/5 text-muted hover:bg-main/10'}`}
                                    >
                                        {p === 'gemini' ? 'Gemini' : p === 'deepseek' ? 'DeepSeek' : 'ChatGLM'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Gemini API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.geminiKey}
                                    onChange={e => setLocalSettings({ ...localSettings, geminiKey: e.target.value })}
                                    placeholder="在此输入 Gemini 密钥"
                                    className="w-full bg-main/5 border border-main/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">DeepSeek API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.deepseekKey}
                                    onChange={e => setLocalSettings({ ...localSettings, deepseekKey: e.target.value })}
                                    placeholder="在此输入 DeepSeek 密钥"
                                    className="w-full bg-main/5 border border-main/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">ChatGLM API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.glmKey}
                                    onChange={e => setLocalSettings({ ...localSettings, glmKey: e.target.value })}
                                    placeholder="在此输入 GLM 密钥"
                                    className="w-full bg-main/5 border border-main/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full bg-brand-primary text-surface font-black py-4 rounded-2xl shadow-lg shadow-brand-primary/20 active:scale-95 transition-all mt-4"
                        >
                            保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
