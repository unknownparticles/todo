import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";
import { BaseAIService } from "./ai";

export class GeminiService extends BaseAIService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.ai = new GoogleGenAI(apiKey);
  }

  async getEndDayReview(tasks: Task[]): Promise<string> {
    const unfinished = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    const prompt = `
      The user is ending their day. 
      Completed tasks: ${completed.length}
      Unfinished tasks: ${unfinished.length}
      Unfinished task list: ${unfinished.map(t => t.text).join(', ')}
      
      Provide a concise, encouraging review (2-3 sentences). 
      If there are unfinished tasks, gently suggest how to tackle them tomorrow. 
      Keep it motivational and professional. Respond in Chinese as requested by context.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "保持动力，明天又是新的一天！";
    } catch (error) {
      console.error("AI Review Error:", error);
      return "今天辛苦了！休息好，明天再继续。";
    }
  }

  async getTaskPrioritySuggestion(tasks: Task[]): Promise<string[]> {
    const unfinished = tasks.filter(t => !t.completed).map(t => t.text);
    if (unfinished.length === 0) return [];

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given these tasks: ${unfinished.join(', ')}, suggest the top 3 priorities to focus on first to maximize productivity. Return as a simple JSON list of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    try {
      return JSON.parse(response.text.trim());
    } catch {
      return unfinished.slice(0, 3);
    }
  }
}
