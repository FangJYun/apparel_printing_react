# Handoff

用于新开 Codex 会话、切换账号或交接开发时快速恢复 `apparel_printing_react` 项目上下文。

## 2026-06-23 最新交接摘要：AI 生图页面与可复用标签组件

本轮主要完成后台 `AI 生图` 菜单页前端实现和后端接口代理对接，页面路径为 `/admin/ai-image`。

### 已实现页面能力

- 新增 `app/admin/ai-image/page.tsx`，挂载 `AiImagePanel`。
- 新增核心组件 `app/components/AiImagePanel.tsx`：
  - 左侧生成设置，右侧生成结果和最近生成任务。
  - 支持业务类型选择，切换业务类型会清空已选参考图和标签。
  - 参考图片默认不选中；从素材库产品列表选择参考图。
  - 参考图片选中后展示缩略图、文件名、文件大小和素材标签。
  - 参考图片右上角提供“更换参考图片”和“清空参考图片”，文件名超出省略并支持 hover 查看完整文件名。
  - 支持模型选择，模型列表来自后端 `/image2/models.do`。
  - 图片尺寸来自 `/image2/size-configs.do`，参数使用当前业务类型 `bizTypeId`。
  - 提示词 placeholder 只作为示例，不占用字数。
  - 反向提示词保留“反向提示词（可选）”描述。
  - 生成数量选项为 `1/2/3/4`，默认选中 `1`。
  - 创建任务调用后端 `generate.do`，随后轮询任务详情。
  - 生成结果区预留 4 图网格；图片支持预览、保存、下载。
  - 最近生成任务区展示任务表格，操作列已移除，状态用小字展示，失败进度条为红色。
- 新增可复用标签选择组件 `app/components/TagTreePicker.tsx`：
  - 使用 Ant Design `Popover`、`Input`、`Checkbox`、`Tag`、`Button`，图标来自 `lucide-react`。
  - 触发器显示 `请选择叶子标签` 或 `已选 N 个标签`。
  - 下拉浮层宽度收窄到 `360px`。
  - 初次点开树默认不展开；搜索时自动展开匹配路径。
  - 只能选择叶子节点。
  - 父级节点会根据子叶子选择状态展示半选/全选图标，但父级复选框是只读展示，点击父级只展开/收起，不会勾选或取消整组。
  - 组件不在触发器下方回显已选标签 chips，避免占用生成设置区空间。

### 前端代理接口

新增 `app/api/image2/` 下的 Next.js API 代理，统一转发 Java 后端：

```text
POST /api/image2/generate-task      -> /apparel-printing/image2/generate.do
GET  /api/image2/size-configs       -> /apparel-printing/image2/size-configs.do
GET  /api/image2/models             -> /apparel-printing/image2/models.do
GET  /api/image2/task-detail        -> /apparel-printing/image2/task-detail.do
GET  /api/image2/recent-tasks       -> /apparel-printing/image2/recent-tasks.do
POST /api/image2/save-result        -> /apparel-printing/image2/save-result.do
GET  /api/image2/download-result    -> /apparel-printing/image2/download-result.do
POST /api/image2/template/save      -> /apparel-printing/image2/template/save.do
```

注意：

- 后端曾移除 `generate-task.do`，当前前端代理路径仍叫 `/api/image2/generate-task`，但实际转发到后端 `generate.do`。
- 本地前端代理默认后端地址依赖项目已有后端 URL 工具；BS 服务器环境需要确认后端地址指向 `http://54.232.61.198:8090/apparel-printing/web/` 或对应内网地址。

### 本轮相关文件

```text
app/admin/ai-image/page.tsx
app/components/AiImagePanel.tsx
app/components/TagTreePicker.tsx
app/api/image2/*
app/globals.css
```

## 项目概览

- 项目目录：`/Users/fangjiayun/myproject/trend/apparel_printing_react`
- GitHub 仓库：`git@github.com:FangJYun/apparel_printing_react.git`
- 当前最新提交：`20696ea Build material library integration`
- 技术栈：
  - Next.js `15.5.19`
  - React `19.0.0`
  - TypeScript `5.8.3`
  - npm
  - Ant Design `6.4.4`
  - lucide-react `1.17.0`
- UI 规范：
  - 遵循项目内 `DESIGN.md`
  - 门户参考 `../apparel_printing_design/门户网站设计.png`
  - 后台参考 `../apparel_printing_design/工作台界面设计.png`
  - 后台页面组件库统一优先使用 Ant Design，图标统一优先使用 `lucide-react`

## 当前线上地址

- 门户首页：`http://54.232.61.198/apparel`
- 登录页：`http://54.232.61.198/apparel/login`
- 后台首页：`http://54.232.61.198/apparel/admin`
- 登录账号密码：`admin / admin`

## 当前会话已完成

- 2026-06-12 检查 Vercel 构建提示 `Vulnerable version of Next.js detected`：
  - 原版本：`next@15.3.3`
  - 升级到：`next@15.5.19`
  - 同步升级：`eslint-config-next@15.5.19`
  - 增加 `overrides.postcss=8.5.15`，用于覆盖 Next 间接依赖中的 vulnerable PostCSS 版本。
  - `npm audit --json` 已验证漏洞数为 0。
  - `node node_modules/typescript/bin/tsc --noEmit` 通过。
  - `NEXT_PUBLIC_APP_BASE_PATH=/apparel npm run build` 通过。
- 根据门户设计图和 `DESIGN.md` 完成 Next.js 门户网站。
- 首页默认展示为门户首页。
- 首页顶部增加大图自动轮播。
- 每个门户菜单都可点击，并跳转到对应介绍页：
  - 首页
  - AI 流程
  - 素材库
  - 趋势库
  - 产品中心
  - 帮助中心
- 根据用户反馈删除了设计图中不需要的两个菜单。
- 增加登录按钮。
- 增加登录页：
  - 默认账号：`admin`
  - 默认密码：`admin`
  - 登录成功跳转 `/admin`
- 增加后台管理页面：
  - 样式和菜单参考 `工作台界面设计.png`
  - 菜单点击可跳转
  - 非首页菜单先做空白占位页
- 已创建项目级 `AGENT.md`，记录技术栈和项目规范。
- 已创建 `README.md` 项目介绍。
- 2026-06-13 完成后台“素材库”菜单页前后端对接与样式迭代：
  - 页面路径：`/admin/materials`
  - 核心组件：`app/components/MaterialUploadPanel.tsx`
  - 使用 Ant Design 的 `Card`、`Tree`、`Input`、`Upload.Dragger`、`Progress`、`Tag`、`Checkbox`、`Button` 等组件。
  - 使用 `lucide-react` 图标，并新增 `app/components/AdminIcon.tsx` 统一后台菜单图标。
  - 类型分类默认选择“印花”，标签树默认不展开；搜索标签时自动展开命中路径，叶子标签支持多选/取消，上方已选标签支持删除和清空。
  - 产品素材区只展示后端产品接口返回的数据，不再混入上传/识别任务。
  - 最近任务区从后端最近任务接口初始化，最多显示三条高度，超过部分内部滚动。
  - 上传图片后先展示本地任务进度，后续轮询识别状态；识别成功入库后自动刷新产品素材区。
  - 产品列表搜索栏改为“文件名搜索 + 搜索按钮”，后端参数为 `fileName`。
  - 文件名搜索不会再按标签/描述做前端本地过滤。
- 2026-06-13 新增前端素材库 API 代理：
  - `GET /api/materials/biz-types` -> `/apparel-printing/biz-type/tree.do`
  - `GET /api/materials/tags?bizTypeId=...` -> `/apparel-printing/tag/tree.do`
  - `POST /api/materials/upload` -> `/apparel-printing/file/upload-images.do`
  - `GET /api/materials/list?rawIds=...` -> `/apparel-printing/file/list-by-ids.do`
  - `GET /api/materials/recent-tasks` -> `/apparel-printing/file/recent-upload-tasks.do`
  - `POST /api/materials/products` -> `/apparel-printing/product/list-by-tag.do`
  - 产品列表请求体支持 `bizTypeId`、`tagIds`、`fileName`、`page`、`pageSize`。
- 2026-06-13 修复本地 `npm run build` 覆盖 dev `.next` 导致样式丢失的问题：
  - `next.config.ts` 支持 `NEXT_DIST_DIR`
  - `npm run build` 改为 `node scripts/build-next.mjs`
  - build 输出目录改为 `.next-build/`
  - `.gitignore` 忽略 `.next-build/`
  - `scripts/build-next.mjs` 构建后会恢复 `next-env.d.ts` 的 dev routes 引用，减少 dev/build 切换污染。
- 2026-06-23 完成后台“AI 生图”菜单页：
  - 页面路径：`/admin/ai-image`
  - 核心组件：`app/components/AiImagePanel.tsx`
  - 可复用标签组件：`app/components/TagTreePicker.tsx`
  - 新增 `app/api/image2/*` 代理接口，转发 Java 后端 AI 生图接口。
  - 业务类型、参考图、标签、模型、尺寸、提示词、生成数量、生成结果、最近任务均已接入页面。
  - 标签组件最终交互：默认不展开、只允许叶子节点选择、父级只读展示选中/半选状态。
- 已推送 GitHub：
  - `1c65fe6 Initial apparel printing portal`
  - `2a8f13f Add project README`
  - `43d17b2 Add hero image carousel`
  - `bf242e5 Add login and admin dashboard`
  - `75d54f2 Support subpath deployment`
  - `20696ea Build material library integration`

## 子路径部署适配

线上通过已有 Docker nginx 挂载到 `/apparel`，因此项目已支持子路径部署。

关键文件：

- `next.config.ts`
  - 读取 `NEXT_PUBLIC_APP_BASE_PATH`
  - 线上设置为 `/apparel`
- `app/path.ts`
  - 提供 `withBasePath(path)` 辅助方法
- `app/components/HeroCarousel.tsx`
  - 首页轮播图路径使用 `withBasePath`
- `app/components/LoginForm.tsx`
  - 登录表单 action 使用 `withBasePath("/admin")`

本地开发不需要设置 `NEXT_PUBLIC_APP_BASE_PATH`，仍然按根路径访问。

## 服务器部署状态

- bs 测试服务器：
  - IP：`54.232.61.198`
  - SSH 用户：`ubuntu`
  - SSH key：`/Users/fangjiayun/myproject/server_secret_key/business_server_key.pem`
- 服务器项目目录：
  - `/home/ubuntu/apps/apparel_printing_react`
- 运行方式：
  - Next.js 运行在宿主机 `3001`
  - PM2 进程名：`apparel-printing-react`
  - 启动环境变量：`NEXT_PUBLIC_APP_BASE_PATH=/apparel`
- 已安装：
  - Node.js `v22.22.3`
  - npm `10.9.8`
  - PM2 `7.0.1`
- PM2 已设置开机自启：
  - systemd 服务：`pm2-ubuntu`
  - 状态已验证为 `enabled`

## Docker nginx 配置

服务器已有 Dify 的 Docker nginx 占用 `80/443`，不要启动宿主机 nginx 抢端口。

当前通过 Docker nginx 反向代理：

```nginx
location = /apparel {
  proxy_pass http://172.17.0.1:3001;
  include proxy.conf;
}

location ^~ /apparel/ {
  proxy_pass http://172.17.0.1:3001;
  include proxy.conf;
}
```

配置文件：

- `/opt/dify/docker/nginx/conf.d/default.conf`
- `/opt/dify/docker/nginx/conf.d/default.conf.template`

模板也已同步，避免容器重建后丢配置。

## 验证记录

本地已验证：

```bash
node node_modules/typescript/bin/tsc --noEmit
NEXT_PUBLIC_APP_BASE_PATH=/apparel npm run build
```

2026-06-13 素材库对接后本地验证：

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run build
curl -X POST http://localhost:3000/api/materials/products \
  -H 'content-type: application/json' \
  --data '{"bizTypeId":2,"tagIds":[],"fileName":"VN0065","page":1,"pageSize":20}'
```

验证结果：

- TypeScript 检查通过。
- Next build 通过。
- 文件名搜索 `VN0065` 返回 `total: 1`。
- 浏览器实测 `/admin/materials` 默认产品 4 条，搜索 `VN0065` 后产品区变为 1 条。
- 右侧素材库内容区无横向滚动；最近任务超过三条时内部纵向滚动。

2026-06-23 AI 生图页面和标签组件验证：

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

验证结果：

- TypeScript 检查通过。
- Next build 通过。
- `/admin/ai-image` 页面本地可访问。
- 标签组件默认不展开；搜索时才展开匹配树。
- 标签组件只提交叶子标签 ID；父级节点只展示汇总状态。

服务器已验证：

```bash
npm ci
NEXT_PUBLIC_APP_BASE_PATH=/apparel npm run build
pm2 list
systemctl is-enabled pm2-ubuntu
```

公网内容验证通过：

- `curl http://54.232.61.198/apparel` 能看到 `印花成品一站式服务平台`
- `curl http://54.232.61.198/apparel/login` 能看到 `登录后台管理`
- `curl http://54.232.61.198/apparel/admin` 能看到 `项目生产驾驶舱`
- 静态资源路径为 `/apparel/_next/static/...`

## 常用命令

本地开发：

```bash
cd /Users/fangjiayun/myproject/trend/apparel_printing_react
npm run dev
```

本地构建：

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run build
NEXT_PUBLIC_APP_BASE_PATH=/apparel npm run build
```

注意：当前 `npm run build` 输出到 `.next-build/`，本地 `npm run dev` 仍使用 `.next/`，避免 build 后 dev 样式丢失。

推送代码：

```bash
git status --short
git add <明确文件>
git commit -m "<message>"
git push
```

服务器 SSH：

```bash
ssh -i /Users/fangjiayun/myproject/server_secret_key/business_server_key.pem -o StrictHostKeyChecking=no ubuntu@54.232.61.198
```

服务器发布更新：

```bash
cd /home/ubuntu/apps/apparel_printing_react
git pull
npm ci
NEXT_PUBLIC_APP_BASE_PATH=/apparel npm run build
pm2 restart apparel-printing-react --update-env
pm2 save
```

服务器检查：

```bash
pm2 list
pm2 logs apparel-printing-react
systemctl is-enabled pm2-ubuntu
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
sudo ss -ltnp | grep -E ":80|:443|:3001"
curl -I http://127.0.0.1/apparel
curl -I http://127.0.0.1:3001/apparel
```

Docker nginx 检查和重载：

```bash
docker exec docker-nginx-1 nginx -t
docker exec docker-nginx-1 nginx -s reload
sudo sed -n "1,220p" /opt/dify/docker/nginx/conf.d/default.conf
sudo sed -n "1,220p" /opt/dify/docker/nginx/conf.d/default.conf.template
```

## Git 和素材注意事项

- 只在 `apparel_printing_react/` 仓库内提交前端项目代码。
- 不要在父目录 `/Users/fangjiayun/myproject/trend` 随手执行 `git add .`。
- 用户明确要求：`pic/素材/` 永远不要 `git add` 或提交。
- 如果需要引用 `../pic` 中素材，优先复制必要的、可提交的轻量资源到本项目 `public/`，不要直接提交原始素材目录。

## 已知风险

- `npm audit` 在服务器提示过 1 个 moderate 和 1 个 critical 漏洞；没有执行 `npm audit fix --force`，避免自动升级造成破坏。
- 服务器根路径 `http://54.232.61.198/` 是现有 Dify 服务，不要覆盖。
- `http://54.232.61.198:3001` 公网曾超时，推测 AWS 安全组未开放 3001；当前通过 Docker nginx 的 80 端口访问，不需要开放 3001。
- 如果 Dify Docker nginx 后续重建或升级，需要确认 `/apparel` 反代配置仍存在。
- 素材库依赖本地/服务器 Java 后端接口；若 `localhost:8080` 未启动，前端代理会返回 `fetch failed` 或 code 900。
- 最近任务接口要求后端包含 `GET /apparel-printing/file/recent-upload-tasks.do`。
- 只改前端仓库代码；不要在 `apparel_printing_java` 中为前端问题做后端代码改动，除非用户明确要求。

## 下一步建议

1. 把本次前端变更发布到服务器后，访问 `http://54.232.61.198/apparel/admin/ai-image` 验证 AI 生图页面。
2. 和最新 Java 后端一起验证模型列表、尺寸配置、参考图选择、标签选择、生成任务、保存和下载。
3. 继续根据真实生成结果调整生成结果卡片和最近任务表格的密度。
4. 如后续其它页面需要标签选择，直接复用 `TagTreePicker`，不要再单独做 Modal + Tree。

## 最近更新时间

- 日期：2026-06-23
- 更新人：Codex
