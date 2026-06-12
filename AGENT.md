# Apparel Printing React Project Agent Guide

## 项目定位

这是“印花成品一站式服务平台”的 Next.js 门户网站前端，用于展示 AI 印花成品流水线、素材库、趋势库、产品中心与帮助中心。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- App Router：`app/`
- 样式：原生 CSS + CSS Variables
- 字体：`next/font` 加载 Inter 与 JetBrains Mono

## 运行命令

```bash
npm install
npm run dev
npm run build
```

## 目录约定

- `app/layout.tsx`：全局布局、字体、metadata
- `app/page.tsx`：门户首页
- `app/components/`：共享导航、轮播、流程管线和介绍页组件
- `app/data.ts`：菜单、流程、指标和介绍页文案数据
- `app/globals.css`：全局设计 token、组件样式、响应式样式
- `DESIGN.md`：必须遵循的视觉规范

## 设计规范

- 严格遵循 `DESIGN.md` 的暗色终端风格：
  - 背景以 `#000000` / `#121212` / `#1e1e1d` 为主
  - 主文字使用暖白 `#faf9f6`
  - 紫色 `#cbb0f7` 只作为图标、链接、流程高亮等点缀
  - 不使用大面积渐变背景、投影、玻璃拟态、装饰光斑
  - 卡片以 1px 边框和灰阶层级表达结构
- 状态色可以使用蓝、绿、红、橙，但只用于流程状态、进度、风险提示等语义表达。
- 首页签名体验是横向 AI 流程管线：素材上传 -> AI 分析 -> 趋势增强 -> AI 生图 -> AI 打板 -> 成品图 -> AI 视频 -> 一键交付。
- 首页必须保留能力轮播图，用于展示素材、标签、产品链路等平台核心价值。

## 开发约定

- 默认使用 Server Components；只有需要浏览器状态或事件时才添加 `"use client"`。
- 后台管理页面优先使用 Ant Design 组件（如 Card、Tree、Input、Select、Upload、Progress、Tag、Checkbox、Button）。
- 图标统一优先使用 `lucide-react`，不要再用零散字符图标临时替代。
- 不新增动画库或其它 UI 组件库，除非明确需要。
- 语义上导航使用 `<a>`，动作使用 `<button>`。
- 所有新 UI 需要兼顾移动端，避免文本溢出和卡片重叠。
- 动效必须尊重 `prefers-reduced-motion`。
- 不把数据库连接信息写入这个前端项目。

## 内容约定

- 菜单保持：
  - 首页
  - AI 流程
  - 素材库
  - 趋势库
  - 产品中心
  - 帮助中心
- 菜单必须使用 Next.js 路由跳转，不使用纯锚点占位。
- 首页默认路由为 `/`，默认高亮“首页”。
- AI 流程内容参考 `../apparel_printing_design/门户网站设计.png`。
