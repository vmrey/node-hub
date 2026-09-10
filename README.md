# ⚡ Node Hub (节点与订阅管理中枢)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers%20%26%20Pages-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ESM](https://img.shields.io/badge/Module-ESM-success.svg)](src/index.js)

基于 Cloudflare 边缘计算平台构建的高性能、高安全节点管理与订阅中枢，原生兼具 **Cloudflare Pages** 与 **Cloudflare Workers** 双部署架构。

---

## ✨ 核心特性

- 🚀 **双平台原生支持**：既可通过 **Cloudflare Pages** 实现“零死 ID、永不掉绑”的免维护部署，亦可无缝部署至传统 **Cloudflare Workers**。
- ⚡ **CF 优选节点实时聚合**：内置移动/联通/电信等优质优选接口源，支持自定义扩展与多源并发测速聚合下发。
- 🛡️ **军工级边缘高防网关**：内置威胁指纹 WAF 阻断、60 秒滑动窗口 CC 攻击限流、后台登录指数退避防爆破。
- 🔒 **端到端加密落盘**：所有节点明文、模板配置均使用 AES-GCM 动态随机密钥加密存储，KV 数据库只存密文。
- ✈️ **Telegram 实时推送**：客户端拉取订阅、节点异常或安全事件实时直推你的 Telegram 机器人。
- 🎯 **阅后即焚与访问控制**：支持为指定订阅设置最大访问次数（达限自动物理销毁）及客户端国家/地区白名单限制。

---

## 📖 部署教程（两种部署方式任选其一）

---

### 🌟 方案一：Cloudflare Pages 部署（强烈推荐 ⭐⭐⭐⭐⭐）

> **为什么最推荐 Pages？**
> - **终身永不掉绑定**：在控制台绑定一次 `KV`，以后每次 GitHub 推送代码只更新业务逻辑，Cloudflare 绝对不会解绑你的 KV，**彻底告别每次发包重新绑定的烦恼！**
> - **零多余变量**：不需要在代码或控制台添加任何复杂的 `KV_ID`。
> - **零代码泄露**：Git 仓库代码干干净净，没有半个私有 ID，开源与多人 Fork 极其友好。

#### 详细部署步骤：

1. **新建并连接仓库**：
   - 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，在左侧侧边栏点击 **Workers 和 Pages**；
   - 点击 **创建应用程序** -> 切换到 **Pages** 标签页 -> 点击 **连接到 Git**；
   - 授权并选择你的 `node-hub` 仓库。

2. **配置构建参数**：
   - **项目名称 (Project name)**：自定义（如 `node-hub`）
   - **生产分支 (Production branch)**：`main`
   - **框架预设 (Framework preset)**：选择 `None` (无)
   - **构建命令 (Build command)**：`npm run build`
   - **构建输出目录 (Build output directory)**：`_worker.js` 所在的根目录，直接**留空**（或填 `/`）
   - 点击 **保存并部署 (Save and Deploy)**，等待首次构建完成。

3. **绑定 KV 存储空间**（只需操作一次，终身不掉）：
   - 如果尚未创建 KV：在左侧菜单进入 **存储与数据库** -> **KV** -> 点击 **创建命名空间**，名称填写 `KV` 并点击添加；
   - 返回刚才创建的 Pages 项目页面，进入 **设置 (Settings)** -> 点击 **函数 (Functions)**；
   - 下滑找到 **KV 命名空间绑定 (KV namespace bindings)** -> 点击 **添加绑定 (Add binding)**：
     - **变量名称 (Variable name)**：必须填写 `KV`（大写）
     - **KV 命名空间**：下拉选择刚才创建的 `KV`
   - 点击 **保存 (Save)**。

4. **配置管理员后台登录密码**：
   - 进入 Pages 项目设置 -> **环境变量 (Environment variables)**；
   - 在生产环境点击 **添加变量 (Add variable)**：
     - **变量名称**：`ADMIN`
     - **值**：设置您的后台管理登录密码（建议选择 Encrypt 加密保护）
   - 点击 **保存**。

🎉 **部署完成！** 点击 Pages 分配的专属域名，即可直接进入后台使用。以后只要你在 GitHub 推送新代码，Cloudflare 会自动更新发布，且**绑定的 KV 永远都在！**

---

### ⚡ 方案二：Cloudflare Workers Git 自动化部署（适合传统 Workers 用户）

> **注意**：Cloudflare Workers 平台默认具有“每次发布自动覆盖线上绑定”的特性。为了防止自动发布时清除您在控制台绑定的 KV，请遵循以下规范。

#### 详细部署步骤：

1. **创建 Worker**：
   - 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) -> 进入 **Workers 和 Pages** -> 点击 **创建应用程序** -> 点击 **创建 Worker**；
   - 点击 **部署** 生成初始 Worker。

2. **关联 Git 仓库**：
   - 进入该 Worker 页面 -> **设置 (Settings)** -> **构建与部署 (Builds)**；
   - 点击 **连接 Git (Connect Git)**，选择你的 `node-hub` 仓库；
   - **构建命令**：`npm run build`；**部署命令**：`npx wrangler deploy`。

3. **绑定 KV 存储与密码**：
   - 在该 Worker 设置中点击 **变量与机密 (Variables and Secrets)**；
   - 在 **KV 命名空间绑定** 区域添加绑定：变量名称填写 `KV`，并选择对应的真实 KV 命名空间；
   - 在 **环境变量与机密** 区域添加管理员密码：变量名称 `ADMIN`，值为你的密码。

4. **✨ 防止发包后 KV 解绑的关键一步（配置 KV_ID 变量）**：
   - 在左侧菜单 **存储与数据库** -> **KV** 中，找到你的 `KV` 命名空间，复制其 32 位的真实 ID（形如 `04c612dbf2624db6a4fa153295943f82`）；
   - 回到该 Worker 的 **变量与机密** 中，添加环境变量：
     - **变量名称**：`KV_ID`
     - **值**：粘贴刚才复制的真实 32 位 ID
   - **作用**：项目构建脚本会在每次自动发布时，自动将此安全变量注入配置，**彻底阻止 Workers 每次部署冲掉控制台绑定的问题，实现零代码泄露与免维护！**

---

### 💻 方案三：本地命令行一键部署（适合熟悉 Node.js 的开发者）

无需在网页上手动点选，直接一条命令全自动查询、创建 KV 并发布到云端：

```bash
# 1. 安装项目依赖
npm install

# 2. 授权登录您的 Cloudflare 账号
npx wrangler login

# 3. 执行全自动发布（全自动探测/新建账号下的 KV、动态注入并推送）
npm run deploy
```

---

### 🛠️ 本地独立运行与调试

```bash
# 启动本地隔离沙箱调试（自动分配独立的本地虚拟 KV 模拟器，无需线上网络凭据）
npm run dev
```


