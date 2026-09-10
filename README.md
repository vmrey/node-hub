# 节点与订阅管理中枢 (Node Hub)

基于 Cloudflare 边缘计算平台（Workers & Pages）构建的轻量级、高性能订阅生成与节点管理控制台。

---

## 🚀 部署方式全兼容指南（双模式支持）

本项目代码采用标准 Web Standards 与通用 ESM 模块化设计，**完美原生兼容 Cloudflare Pages 与 Cloudflare Workers 双重部署形态**。

### 🌟 推荐方案一：Cloudflare Pages 部署（零变量、零泄露、终身永不掉绑定）

> **为什么最推荐 Pages？**
> - **永远不掉绑定**：在控制台绑定一次 `KV`，以后每次 GitHub 推送代码只更新业务逻辑，Cloudflare 绝对不会去解绑你的 KV，终身无需重复绑定！
> - **无需多余变量**：不需要在代码或控制台添加任何复杂的 `KV_ID`。
> - **零代码泄露**：Git 仓库中不含任何个人私有 ID，完全开源友好。

1. 打开 [Cloudflare 控制台](https://dash.cloudflare.com/) -> 进入 **Workers 和 Pages**；
2. 点击 **创建应用程序** -> 切换到 **Pages** 标签页 -> 点击 **连接到 Git**；
3. 选择你的 `node-hub` 仓库：
   - **构建命令 (Build command)**：`npm run build`
   - **输出目录 (Build output directory)**：留空（或填 `/`）
4. 点击 **保存并部署**，等待首次构建完成；
5. **绑定 KV 存储**：
   - 进入该 Pages 项目 -> **设置 (Settings)** -> **函数 (Functions)** -> **KV 命名空间绑定**；
   - 点击 **添加绑定**：变量名称填写 `KV`，绑定到你现有的 KV 命名空间（或新建一个命名为 `KV` 的空间）；
6. **配置管理员密码**：
   - 在同一页面的 **环境变量与机密** 中添加 `ADMIN`（值填写您的后台密码，建议加密保存）。

---

### ⚡ 方案二：Cloudflare Workers Git 自动化部署

若您习惯使用传统的 Workers Builds：
1. 在 Cloudflare 控制台创建 Worker 并关联本 Git 仓库；
2. 构建命令：`npm run build`，部署命令：`npx wrangler deploy`；
3. 在 Worker 设置 -> **变量与机密** 中绑定 `KV` 并添加 `ADMIN` 密码；
4. *(可选建议)*：在环境变量中添加 `KV_ID = 你的真实KVID`，可让构建脚本在发布时自动注入，防止 Workers 部署机制意外清除控制台已有绑定。

---

### 💻 方案三：本地命令行一键部署（适合已有 Node.js 环境）

项目内置自动化部署脚本，可全自动在你的 Cloudflare 账户下探测或创建专属 KV 并推送发布：

```bash
# 1. 安装项目依赖
npm install

# 2. 授权登录 Cloudflare 账号
npx wrangler login

# 3. 执行一键自动化部署（全自动查找/创建 KV、动态注入、推送到生产环境）
npm run deploy
```

---

### 🛠️ 本地开发调试

```bash
# 启动本地隔离调试服务（自动分配本地独立 KV 存储模拟器，无需线上凭证）
npm run dev
```

