
import { Task } from "../types";
import { BaseAIService } from "./ai";

export class GLMService extends BaseAIService {
    private apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

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
      Keep it motivational and professional. Respond in Chinese (Simplified).
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
