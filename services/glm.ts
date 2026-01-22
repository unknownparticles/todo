
import { Task } from "../types";
import { BaseAIService } from "./ai";

export class GLMService extends BaseAIService {
    private apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

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
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "glm-4",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            return data.choices[0].message.content || "保持动力，明天又是新的一天！";
        } catch (error) {
            console.error("GLM Review Error:", error);
            return "今天辛苦了！休息好，明天再继续。";
        }
    }

    async getTaskPrioritySuggestion(tasks: Task[]): Promise<string[]> {
        const unfinished = tasks.filter(t => !t.completed).map(t => t.text);
        if (unfinished.length === 0) return [];

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "glm-4",
                    messages: [{
                        role: "user",
                        content: `Given these tasks: ${unfinished.join(', ')}, suggest the top 3 priorities to focus on first to maximize productivity. Return ONLY a JSON list of strings.`
                    }]
                })
            });
            const data = await response.json();
            const text = data.choices[0].message.content;
            const jsonMatch = text.match(/\[.*\]/s);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : unfinished.slice(0, 3);
        } catch {
            return unfinished.slice(0, 3);
        }
    }
}
