
import { AISettings, IAIService } from "../types";
import { GeminiService } from "./gemini";
import { DeepSeekService } from "./deepseek";
import { GLMService } from "./glm";

export function getAIService(settings: AISettings): IAIService | null {
    const { provider, geminiKey, deepseekKey, glmKey } = settings;

    switch (provider) {
        case 'gemini':
            return geminiKey ? new GeminiService(geminiKey) : null;
        case 'deepseek':
            return deepseekKey ? new DeepSeekService(deepseekKey) : null;
        case 'glm':
            return glmKey ? new GLMService(glmKey) : null;
        default:
            return null;
    }
}
