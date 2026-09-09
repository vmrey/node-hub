function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 渲染订阅安全配置 Tab 独立页面 HTML (铺满屏幕，参考普通订阅板块规范)
export function renderSecurityConfigTab(subToken, allowedCountries = [], proxyClientOnly = true) {
  const safeToken = escapeHtml(subToken || "");
  const countriesStr = Array.isArray(allowedCountries) ? allowedCountries.join(", ") : "";

  return `
    <!-- 视图: 订阅安全配置 (全局) -->
    <section class="tab-content" id="tab-security-config">
      <div class="section-card">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">🔑 订阅安全与全局访问策略</h2>
            <span class="badge-global-tip">全站生效</span>
          </div>
          <div class="section-header-actions">
            <button type="button" class="btn-action btn-purple" style="height: 34px; font-size: 12px; padding: 0 14px;" onclick="randomToken()">🎲 随机生成 Token</button>
            <button type="button" class="btn-action btn-success" style="height: 34px; font-size: 12px; padding: 0 16px;" onclick="saveSecurityConfig()">💾 保存安全配置</button>
          </div>
        </div>
        <p class="section-desc">本模块为全局安全基线配置，用于保护全站所有节点与订阅链接。系统采用高强度防盗刷安全令牌作为鉴权凭据，并提供 IP 归属地白名单及代理客户端过滤机制，彻底杜绝扫描与盗刷。</p>

        <!-- 全局生效提示条 -->
        <div class="global-notice-card" style="margin-bottom: 20px; padding: 12px 16px; border-radius: 8px; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.22); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px; flex-shrink: 0;">🌐</span>
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-title);">
            <strong>全局作用域说明：</strong>此处设置的<strong>安全 Token、国家/地区 IP 白名单</strong>及<strong>代理客户端拦截过滤</strong>均为全站全局生效，普通订阅与 CF 优选订阅均统一遵循此安全风控规则。
          </div>
        </div>

        <!-- 响应式栅格 (PC双栏，平板/手机自动单栏铺满) -->
        <div class="settings-grid">
          <!-- 左栏: 核心安全令牌 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-title); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>🔒</span>
              <span>全局订阅鉴权凭证</span>
            </div>

            <div class="form-field">
              <label>全局订阅鉴权令牌 (TOKEN):</label>
              <div class="copy-box">
                <input type="text" class="copy-input" id="cfg-token" value="${safeToken}" placeholder="12-33位高强度随机安全令牌 (a-zA-Z0-9)" />
                <button type="button" class="btn-action btn-secondary" style="height: 38px;" onclick="randomToken()">🎲 随机</button>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">全站订阅 URL 统一鉴权凭证（例如: /:groupId?token=...，未携带正确 Token 的访问请求将被直接阻断拦截）。</p>
            </div>
          </div>

          <!-- 右栏: 访问风控与客户端过滤 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-title); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>🛡️</span>
              <span>访问风控与客户端过滤</span>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                <label style="margin-bottom: 0;">🌍 允许访问订阅的国家/地区 IP:</label>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'CN')">+CN</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'HK')">+HK</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'MO')">+MO</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'TW')">+TW</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'JP')">+JP</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'SG')">+SG</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'US')">+US</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('cfg-allowed-countries')">清空</button>
                </div>
              </div>
              <input type="text" id="cfg-allowed-countries" class="form-input" value="${escapeHtml(countriesStr)}" placeholder="例如: CN, HK, TW, JP, SG (留空则对所有国家/地区开放)" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 5px; line-height: 1.5;">
                基于 Cloudflare 真实 IP 地理位置识别。填写 ISO 两字母大写代码（多个以逗号分隔）。留空表示对所有国家/地区 IP 开放。若某分组配置了专属国家白名单，将优先采用分组配置。
              </p>
            </div>

            <div class="form-field" style="margin-top: 14px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-label);">
                <input type="checkbox" id="cfg-proxy-client-only" ${proxyClientOnly ? "checked" : ""} style="width: 16px; height: 16px; cursor: pointer;" />
                <span>🛡️ 仅允许代理客户端访问订阅 (拦截浏览器/爬虫)</span>
              </label>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; margin-left: 24px; line-height: 1.5;">
                开启后，仅允许主流代理客户端（如 Clash、Shadowrocket、Quantumult X、Sing-box、Surge、V2Ray 等）拉取订阅，直接阻断浏览器直连、爬虫扫描或非法探测。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 渲染 Telegram 订阅通知配置 Tab 独立页面 HTML (铺满屏幕，参考普通订阅板块规范)
export function renderTgConfigTab(tgConfig = {}) {
  const isTgEnabled = tgConfig && (tgConfig.enabled === true || tgConfig.enabled === "true");
  const tgToken = escapeHtml(tgConfig?.token || "");
  const tgChatId = escapeHtml(tgConfig?.chatId || "");
  const tgApiHost = escapeHtml(tgConfig?.apiHost || "https://api.telegram.org");

  return `
    <!-- 视图: TG 订阅通知 (全局) -->
    <section class="tab-content" id="tab-tg-config">
      <div class="section-card">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">✈️ Telegram 机器人订阅通知</h2>
            <span class="badge-global-tip">全站生效</span>
          </div>
          <div class="section-header-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 34px; font-size: 12px; padding: 0 14px;" onclick="testTelegramNotify()">🧪 测试推送</button>
            <button type="button" class="btn-action btn-success" style="height: 34px; font-size: 12px; padding: 0 16px;" onclick="saveTgConfig()">💾 保存通知配置</button>
          </div>
        </div>
        <p class="section-desc">全站订阅访问实时监控与告警。当客户端拉取普通订阅、CF 优选订阅或全局聚合订阅时，系统将通过 Telegram Bot 异步推送访问日志详情，零延迟不影响客户端下发速度。</p>

        <!-- 全局生效提示条 -->
        <div class="global-notice-card" style="margin-bottom: 20px; padding: 12px 16px; border-radius: 8px; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.22); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px; flex-shrink: 0;">🌐</span>
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-title);">
            <strong>全局作用域说明：</strong>此处的<strong>Telegram 机器人通知</strong>为全站全局生效。开启后，全站所有订阅（无论普通订阅还是 CF 优选订阅）的访问均会统一通过该 Telegram Bot 发送实时通知。
          </div>
        </div>

        <!-- 响应式栅格 (PC双栏，平板/手机自动单栏铺满) -->
        <div class="settings-grid">
          <!-- 左栏: Bot 凭证与推送状态 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="font-size: 14px; font-weight: 600; color: var(--text-title); display: flex; align-items: center; gap: 6px;">
                <span>🤖</span>
                <span>Bot 凭证与推送状态</span>
              </div>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-title);">
                <input type="checkbox" id="cfg-tg-enabled" ${isTgEnabled ? "checked" : ""} style="width: 16px; height: 16px; cursor: pointer;" />
                <span>启用通知推送</span>
              </label>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label>Bot Token:</label>
              <input type="password" id="cfg-tg-token" class="form-input" value="${tgToken}" placeholder="例如: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" autocomplete="off" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">由 Telegram @BotFather 创建机器人后获得的 API Token 凭证。</p>
            </div>

            <div class="form-field">
              <label>Chat ID (目标会话 ID):</label>
              <input type="text" id="cfg-tg-chat-id" class="form-input" value="${tgChatId}" placeholder="群组务必以 -100 开头，例如: -1002147483648" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.6;">
                <div>💡 <strong>群组推送注意：</strong></div>
                <div>1. 机器人必须先<strong>加入该 Telegram 群组</strong>并赋予发言权限；</div>
                <div>2. 群组 Chat ID <strong>必须以 <code>-100</code> 开头</strong>（例如 <code>-1002147483648</code>）。若填写纯正数（如 <code>123456789</code>），消息只会发送到个人私聊而不会发到群里！</div>
                <div>3. 快速查群 ID：将 <code>@RawDataBot</code> 或 <code>@getmyid_bot</code> 拉入群即可看到群组 <code>-100...</code> ID。</div>
              </div>
            </div>
          </div>

          <!-- 右栏: API 端点与连通性测试 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-title); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>🌐</span>
              <span>API 端点与连通性测试</span>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label>Telegram API 地址 (反代 / 自建端点):</label>
              <input type="text" id="cfg-tg-api-host" class="form-input" value="${tgApiHost}" placeholder="默认: https://api.telegram.org" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">如因网络环境无法直连官方 API，可填写 Cloudflare Worker 反向代理端点或自定义中转地址。</p>
            </div>

            <div class="form-field" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border-color);">
              <label>连通性与推送测试说明:</label>
              <p style="font-size: 11px; color: var(--text-muted); line-height: 1.6; margin: 0;">
                💡 填写完 Bot Token 与 Chat ID 后，可直接点击右上角<strong>【🧪 测试推送】</strong>按钮实时验证连通性，无需预先保存配置。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
