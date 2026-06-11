# 印花成品一站式服务平台

这是一个基于 Next.js 的印花成品门户网站前端，用于展示从客户素材库到 AI 分析、趋势增强、AI 生图、AI 打板、成品图、AI 视频和一键交付的完整业务流程。

项目当前是门户展示版，重点覆盖首页、AI 流程、素材库、趋势库、产品中心和帮助中心等核心入口。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- App Router
- CSS Variables + 原生 CSS
- `next/font` 字体加载

## 页面路由

| 路由 | 页面 |
|---|---|
| `/` | 首页 |
| `/ai-flow` | AI 流程 |
| `/materials` | 素材库 |
| `/trends` | 趋势库 |
| `/products` | 产品中心 |
| `/help` | 帮助中心 |

## 核心功能

- 首页能力轮播图
- AI 流程 8 阶段展示
- 暗色控制台风格导航
- 任务队列与系统通知模块
- 各业务菜单独立介绍页
- 响应式布局

## AI 流程

当前首页和 AI 流程页展示以下业务链路：

1. 素材上传
2. AI 分析
3. 趋势增强
4. AI 生图
5. AI 打板
6. 成品图
7. AI 视频
8. 一键交付

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

如果需要指定端口：

```bash
npm run dev -- --port 5174
```

生产构建：

```bash
npm run build
```

启动生产服务：

```bash
npm run start
```

## 项目结构

```text
apparel_printing_react/
├── app/
│   ├── ai-flow/
│   ├── components/
│   ├── help/
│   ├── materials/
│   ├── products/
│   ├── trends/
│   ├── data.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── AGENT.md
├── DESIGN.md
├── package.json
└── tsconfig.json
```

## 设计规范

视觉风格遵循 `DESIGN.md`：

- 暗色终端风格
- 黑色与灰阶面板为主
- 暖白文字
- 紫色仅作为轻量点缀
- 使用边框和层级表达卡片结构
- 状态色只用于进度、风险和流程状态

## 开发约定

- 默认使用 Server Components。
- 只有需要浏览器交互时才使用 `"use client"`。
- 菜单必须使用 Next.js 路由跳转。
- 不提交 `.next/`、`node_modules/`、环境变量文件。
- 数据库连接信息不写入前端项目。
