import { GoogleGenAI, Type } from "@google/genai";
import { Task, SchulteResult } from "../types";
import { BaseAIService } from "./ai";

export class GeminiService extends BaseAIService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getEndDayReview(tasks: Task[]): Promise<string> {
    const unfinished = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    const prompt = `
      用户当天的任务执行情况如下:
      总计任务: ${tasks.length}
      已完成: ${completed.length}
      未完成: ${unfinished.length}
      未完成列表: ${unfinished.map(t => t.text).join(', ')}
      
      请以此为据进行智能分析:
      1. 任务评价: 对已完成的工作给予肯定或客观评价。
      2. 进度分析: 分析当前任务分配的合理性或紧迫度。
      3. 安排建议: 针对未完成任务，给出接下来的行动建议或明天的安排。
      
      要求: 语气极简、专业且有启发性。总字数控制在 100 字以内。必须使用中文回答。
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
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

  async getSchulteFocusAnalysis(results: SchulteResult[]): Promise<string> {
    if (results.length === 0) return "暂无最近练习记录。";

    const stats = results.map(r => `${new Date(r.timestamp).toLocaleDateString()} ${r.timeTaken}秒`).join('\n');
    const prompt = `
      用户最近的舒尔特方格练习记录如下:
      ${stats}
      
      请分析用户的专注力状态:
      1. 趋势分析: 时间是变快了还是变慢了？
      2. 专注力评价: 根据时间判断当前的专注程度（平均 20-30 秒为优秀）。
      3. 练习建议: 给出简洁的练习建议。
      
      要求: 语气极简、专业且有启发性。总字数控制在 100 字以内。必须使用中文回答。
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });
      return response.text || "保持练习，专注力会持续提升！";
    } catch (error) {
      console.error("Gemini Schulte Analysis Error:", error);
      return "练习是提升专注力的关键，继续加油！";
    }
  }

  async explodeTask(taskText: string, description?: string): Promise<string[]> {
    const prompt = `将任务 "${taskText}" 拆分为 3-5 个具体的子任务。描述背景: ${description || '无'}。请确保子任务清晰、可操作。返回为简单的 JSON 字符串数组。`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Gemini Explode Error:", error);
      return [];
    }
  }

  async reorderTasks(tasks: Task[]): Promise<string[]> {
    const taskInfo = tasks.filter(t => !t.completed).map(t => `ID: ${t.id}, 内容: ${t.text}, 优先级: ${t.priority}`).join('\n');
    if (!taskInfo) return tasks.map(t => t.id);

    const prompt = `根据任务的逻辑继承关系和优先级，对以下任务进行最优排序建议。返回有序的 ID 数组 JSON。\n\n${taskInfo}`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Gemini Reorder Error:", error);
      return tasks.map(t => t.id);
    }
  }
}
