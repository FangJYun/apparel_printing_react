# Handoff

用于新开 Codex 会话、切换账号或交接开发时快速恢复 `apparel_printing_react` 项目上下文。

## 项目概览

- 项目目录：`/Users/fangjiayun/myproject/trend/apparel_printing_react`
- GitHub 仓库：`git@github.com:FangJYun/apparel_printing_react.git`
- 当前最新提交：`75d54f2 Support subpath deployment`
- 技术栈：
  - Next.js `15.3.3`
  - React `19.0.0`
  - TypeScript `5.8.3`
  - npm
- UI 规范：
  - 遵循项目内 `DESIGN.md`
  - 门户参考 `../apparel_printing_design/门户网站设计.png`
  - 后台参考 `../apparel_printing_design/工作台界面设计.png`

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
- 已推送 GitHub：
  - `1c65fe6 Initial apparel printing portal`
  - `2a8f13f Add project README`
  - `43d17b2 Add hero image carousel`
  - `bf242e5 Add login and admin dashboard`
  - `75d54f2 Support subpath deployment`

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

## 下一步建议

1. 浏览器访问 `http://54.232.61.198/apparel`，检查首页轮播和菜单跳转。
2. 登录 `admin / admin` 后检查后台菜单占位页。
3. 后续按业务补后台真实功能页。
4. 如果要绑定独立域名，可在现有 Docker nginx 内新增域名 server 配置。

## 最近更新时间

- 日期：2026-06-11
- 更新人：Codex
