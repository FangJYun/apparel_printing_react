export const navItems = [
  { label: "首页", href: "/" },
  { label: "AI 流程", href: "/ai-flow" },
  { label: "素材库", href: "/materials" },
  { label: "趋势库", href: "/trends" },
  { label: "产品中心", href: "/products" },
  { label: "帮助中心", href: "/help" }
];

export const metrics = [
  { label: "今日处理任务", value: "128", delta: "+23%", tone: "up" },
  { label: "素材分析准确率", value: "98.6%", delta: "+2.1%", tone: "up" },
  { label: "平均打板时间", value: "18.6 分钟", delta: "-12%", tone: "down" },
  { label: "今日交付包", value: "36", delta: "+38%", tone: "up" }
];

export const pipeline = [
  {
    step: "01",
    title: "素材上传",
    status: "分类完成",
    state: "done",
    bodyTitle: "素材库",
    summary: "842 张",
    details: ["JPG / PNG / TIFF / PSD", "批量去重", "缩略图生成"],
    tiles: ["rose", "linen", "navy", "botanic", "ink", "cream", "orchid", "mist", "ruby"]
  },
  {
    step: "02",
    title: "AI 分析",
    status: "分类完成",
    state: "done",
    bodyTitle: "分类结果",
    summary: "准确率 96%",
    details: ["植物花卉 312 张", "几何图形 198 张", "动物纹理 124 张"]
  },
  {
    step: "03",
    title: "趋势增强",
    status: "标签归纳",
    state: "done",
    bodyTitle: "标签归纳",
    summary: "216 条素材",
    details: ["花卉 / 热带 / 水彩", "清新 / 度假 / 波西米亚", "趋势匹配 87 分"]
  },
  {
    step: "04",
    title: "AI 生图",
    status: "生图完成",
    state: "done",
    bodyTitle: "生成方案",
    summary: "48 组",
    details: ["最佳匹配度 92%", "成衣图案延展", "色系变体生成"],
    tiles: ["petal", "aqua", "sunset", "marine", "olive", "porcelain"]
  },
  {
    step: "05",
    title: "AI 打板",
    status: "打板中",
    state: "active",
    bodyTitle: "打板任务",
    summary: "进度 62%",
    details: ["任务号 DP20240521001", "主款 / 搭配款 / 配件", "S / M / L / XL"]
  },
  {
    step: "06",
    title: "成品图",
    status: "生成完成",
    state: "done",
    bodyTitle: "成品图预览",
    summary: "已生成 12 张",
    details: ["分辨率 3000*4500", "多姿态展示", "电商主图可用"]
  },
  {
    step: "07",
    title: "AI 视频",
    status: "视频生成中",
    state: "warning",
    bodyTitle: "视频预览",
    summary: "进度 45%",
    details: ["模特展示 15s", "场景切换 5 段", "预计剩余 00:04:18"]
  },
  {
    step: "08",
    title: "一键交付",
    status: "待交付",
    state: "idle",
    bodyTitle: "交付包清单",
    summary: "8 项",
    details: ["PSD 源文件", "AI 矢量文件", "分色图 / 色卡 / Mockup"]
  }
];

export const queue = [
  { id: "DP20240521002", label: "AI 打板", progress: 62, tone: "blue" },
  { id: "DP20240521003", label: "成品图", progress: 100, tone: "green" },
  { id: "DP20240521004", label: "AI 视频", progress: 45, tone: "red" },
  { id: "DP20240521005", label: "AI 打板", progress: 30, tone: "blue" },
  { id: "DP20240521006", label: "成品图", progress: 70, tone: "green" }
];

export const featurePages = {
  "/ai-flow": {
    eyebrow: "AI FLOW",
    title: "AI 流程",
    intro: "把素材上传、标签识别、趋势增强、生图、打板、成品图、AI 视频和交付包串成一条可追踪流水线。",
    points: ["8 阶段可视化任务链路", "每个阶段都有进度、状态和交付物", "适合运营、设计、打板和客户经理共同协作"],
    stat: "8",
    statLabel: "核心流程节点"
  },
  "/materials": {
    eyebrow: "MATERIAL LIBRARY",
    title: "素材库",
    intro: "集中管理客户上传、爬取采集和历史沉淀的印花素材，统一生成缩略图、文件信息和 AI 原始识别结果。",
    points: ["支持 JPG / PNG / TIFF / PSD", "文件去重、缩略图和来源信息归档", "按业务类型与标签树快速筛选"],
    stat: "842",
    statLabel: "今日入库素材"
  },
  "/trends": {
    eyebrow: "TREND ATLAS",
    title: "趋势库",
    intro: "把印花标签、热度分、趋势分和生成表现沉淀为趋势看板，辅助选款、上新和客户提案。",
    points: ["热度分与趋势分 0-100", "按风格、图案内容、工艺和色系分析", "连接素材、成品和交付表现"],
    stat: "87",
    statLabel: "春夏女装趋势分"
  },
  "/products": {
    eyebrow: "PRODUCT CENTER",
    title: "产品中心",
    intro: "服装、裤子、T 恤与印花统一为产品对象，支持上下级来源关系，方便追踪印花从哪件服装提取或生成。",
    points: ["统一 product 表管理服装与印花", "产品标签沉淀到 product_tag", "支持父子产品链路和成品交付"],
    stat: "216",
    statLabel: "已清洗产品"
  },
  "/help": {
    eyebrow: "HELP CENTER",
    title: "帮助中心",
    intro: "面向业务、设计和生产角色的操作说明中心，解释标签体系、AI 流程、交付包标准和常见异常处理。",
    points: ["流程说明和字段口径", "交付包内容清单", "模型识别失败与人工修正指引"],
    stat: "24h",
    statLabel: "响应支持"
  }
} as const;

export const adminMenuItems = [
  { label: "工作台", href: "/admin", iconKey: "dashboard" },
  { label: "素材库", href: "/admin/materials", iconKey: "library" },
  { label: "AI 分析", href: "/admin/ai-analysis", iconKey: "analysis" },
  { label: "趋势增强", href: "/admin/trend-boost", iconKey: "trend" },
  { label: "AI 生图", href: "/admin/ai-image", iconKey: "generate" },
  { label: "AI 打板", href: "/admin/ai-pattern", iconKey: "pattern" },
  { label: "成品图", href: "/admin/product-image", iconKey: "productImage" },
  { label: "AI 视频", href: "/admin/ai-video", iconKey: "video" },
  { label: "一键交付", href: "/admin/delivery", iconKey: "delivery" },
  { label: "订单归档", href: "/admin/orders", iconKey: "archive" }
];

export const adminPipeline = [
  { title: "素材上传", status: "已完成", progress: 100, state: "done" },
  { title: "AI 分析", status: "已完成", progress: 100, state: "done" },
  { title: "趋势增强", status: "已完成", progress: 94, state: "done" },
  { title: "AI 生图", status: "已完成", progress: 86, state: "done" },
  { title: "AI 打板", status: "复核中", progress: 68, state: "active" },
  { title: "成品图", status: "生成中", progress: 48, state: "active" },
  { title: "AI 视频", status: "排队中", progress: 18, state: "active" }
];

export const adminStats = [
  { label: "素材入库", value: "286", note: "已分类 241 张，待复核 18 张" },
  { label: "趋势匹配", value: "94%", note: "26SS 新中式植物" },
  { label: "图案方案", value: "16", note: "4 个系列，3 个待打板" },
  { label: "交付包", value: "7/8", note: "等待最终复核" }
];
