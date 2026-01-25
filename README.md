# ZenFlow AI - 极简专注

极简 AI 待办与番茄钟应用，支持多 AI 提供商（Gemini、DeepSeek、ChatGLM）。

## ✨ 功能特性

- ✅ 任务管理（优先级、标签、子任务）
- 💥 **任务爆炸**：AI 驱动的任务拆解，支持任务描述并伴随动态视觉动效
- 🔃 **智能排序**：利用 AI 逻辑优化任务列表优先级顺序
- 🍅 番茄钟计时器（优化布局，确保首屏可见）
- 🧩 **舒尔特方格**：专注力训练，布局优化适配各种屏幕
- 🌅 **跨天自动化**：自动清理旧任务，遗留任务自动标记日期（如 `2026年1月25日遗留`）
- 📊 统计与生产力追踪
- 🤖 AI 每日总结与专注力分析
- 🎨 多主题切换（极简、青春、商务、自然）
- 🌙 深色模式支持
- 📱 PWA 支持，可安装到桌面

## 🚀 本地开发

**前置要求：** Node.js

1. 安装依赖：
   ```bash
   npm install
   ```

2. 运行开发服务器：
   ```bash
   npm run dev
   ```

## 🌐 部署到 GitHub Pages

### 方法一：GitHub Actions 自动部署（推荐）

1. 在 GitHub 仓库设置中，进入 **Settings** → **Pages**
2. 在 **Source** 下拉菜单中选择 **GitHub Actions**
3. 推送代码到 `main` 分支，Actions 会自动构建并部署

工作流文件已创建在 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### 方法二：手动部署

```bash
npm run build
# 将 dist 目录内容推送到 gh-pages 分支
```

## 🔑 AI 配置

应用支持三种 AI 提供商：

- **Gemini**：Google 的 Gemini API
- **DeepSeek**：DeepSeek 聊天 API
- **ChatGLM**：智谱 AI 的 GLM API

在应用右上角点击"设置"图标（⚙️），输入对应的 API Key 即可使用 AI 功能。

## 📦 技术栈

- React 19
- TypeScript
- Vite
- TailwindCSS
- PWA (Service Worker + Manifest)
