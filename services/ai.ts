
import { Task } from "../types";

export interface IAIService {
    getEndDayReview(tasks: Task[]): Promise<string>;
    getTaskPrioritySuggestion(tasks: Task[]): Promise<string[]>;
    getSchulteFocusAnalysis(results: any[]): Promise<string>;
}

export abstract class BaseAIService implements IAIService {
    protected apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    abstract getEndDayReview(tasks: Task[]): Promise<string>;
    abstract getTaskPrioritySuggestion(tasks: Task[]): Promise<string[]>;
    abstract getSchulteFocusAnalysis(results: any[]): Promise<string>;
}
