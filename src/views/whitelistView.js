function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getIPTypeLabel(ip) {
  if (!ip) return '未知';
  if (ip.includes('/')) return 'CIDR 网段';
  if (ip.includes(':')) return 'IPv6 单机';
  return 'IPv4 单机';
}

// 渲染独立 IP 白名单管理 Tab 视图
export function renderWhitelistTab(whitelistIPs = []) {
  const count = whitelistIPs.length;

  return `
    <!-- 视图: 独立 IP 白名单管理 -->
    <section class="tab-content" id="tab-ip-whitelist">
      <div class="section-card">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">✨ IP 访问白名单管理</h2>
            <span class="node-count-badge badge-success">永久豁免拦截</span>
            <span class="node-count-badge" id="whitelist-total-badge">共 ${count} 个放行项</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-action btn-danger" onclick="clearAllWhitelistIPs()">🗑️ 清空所有白名单</button>
          </div>
        </div>
        <p class="section-desc">
          白名单内的 IP / CIDR 网段拥有最高通行权限：完全豁免黑名单拦截、豁免 404 探测拦截，且登录后台免除密码防爆破封禁。支持 IPv4（如 <code>1.1.1.1</code>）、IPv6 及 CIDR 网段（如 <code>192.168.1.0/24</code>）。
        </p>

        <!-- 快速单条添加工具栏 -->
        <div class="quick-add-bar">
          <div class="quick-add-wrap">
            <span class="quick-add-icon">✨</span>
            <input type="text" id="input-quick-add-whitelist" class="form-input" 
                   placeholder="输入单个或多个 IP / CIDR 网段（如：1.1.1.1、192.168.1.0/24，支持以逗号或空格分隔），按回车添加..."
                   onkeydown="if(event.key === 'Enter') quickAddWhitelistIP()" />
          </div>
          <button type="button" class="btn-action btn-success" style="height: 38px; padding: 0 18px;" onclick="quickAddWhitelistIP()">
            ➕ 添加到白名单
          </button>
        </div>

        <!-- 搜索与筛选工具栏 -->
        <div class="logs-filter-toolbar" style="margin-top: 14px;">
          <div class="logs-filter-group" style="flex: 1;">
            <div class="filter-input-wrap" style="flex: 1; max-width: 360px;">
              <span class="filter-icon">🔍</span>
              <input type="text" id="filter-whitelist-keyword" class="filter-input" 
                     placeholder="搜索白名单 IP 或网段..." oninput="applyWhitelistFilter()" />
              <button type="button" class="filter-clear-btn" id="whitelist-keyword-clear" 
                      onclick="clearWhitelistKeyword()" style="display:none;" title="清空搜索">✕</button>
            </div>
            <button type="button" class="btn-action btn-secondary filter-reset-btn" onclick="clearWhitelistKeyword()">
              ↺ 重置
            </button>
          </div>
          <div class="logs-filter-summary">
            <span id="whitelist-filter-stats">显示 <strong>${count}</strong> / 共 <strong>${count}</strong> 个 IP</span>
          </div>
        </div>

        <!-- 批量操作工具栏 -->
        <div class="batch-toolbar" id="whitelist-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>☑️ 已选中 <strong id="whitelist-selected-count">0</strong> 个白名单 IP</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('whitelist')">取消选择</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeleteWhitelistIPs()">🗑️ 批量移除选中</button>
          </div>
        </div>

        <!-- 可视化白名单数据表格 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="whitelist-check-all" onchange="toggleAllCheckboxes('whitelist', this.checked)" title="全选 / 反选当前页" />
                </th>
                <th style="width: 70px;">序号</th>
                <th style="min-width: 240px;">IP / CIDR 网段地址</th>
                <th style="width: 140px;">类别</th>
                <th style="width: 150px;">权限状态</th>
                <th style="width: 220px; text-align: right;">操作</th>
              </tr>
            </thead>
            <tbody id="whitelist-table-body">
              ${count === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 48px 16px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">当前白名单列表为空</div>
                    <div style="font-size: 12px;">你可以使用上方的输入框输入 IP 或 CIDR 网段快速添加到白名单</div>
                  </td>
                </tr>
              ` : whitelistIPs.map((ip, idx) => {
                const safeIp = escapeHtml(ip);
                const typeLabel = getIPTypeLabel(ip);
                return `
                  <tr class="whitelist-table-row" data-index="${idx}" data-ip="${safeIp}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox whitelist-row-checkbox" value="${safeIp}" onchange="updateBatchSelection('whitelist')" />
                    </td>
                    <td style="color: var(--text-muted); font-size: 12px; font-family: monospace;">#${idx + 1}</td>
                    <td>
                      <span style="font-family: monospace; font-size: 13px; font-weight: 700; color: var(--text-title);">${safeIp}</span>
                    </td>
                    <td>
                      <span class="node-count-badge" style="font-size: 11px;">${typeLabel}</span>
                    </td>
                    <td>
                      <span class="node-count-badge badge-success" style="font-size: 11px;">⭐ 永久放行</span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
                        <button type="button" class="btn-action btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="copyStringToClipboard('${safeIp}', '已复制 IP: ${safeIp}')">📋 复制</button>
                        <button type="button" class="btn-action btn-purple" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="moveWhitelistToBlacklist('${safeIp}')">🚫 移入黑名单</button>
                        <button type="button" class="btn-action btn-danger" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="removeWhitelistIP('${safeIp}')">🗑️ 移除</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
              <tr id="whitelist-table-empty-filter-row" style="display: none;">
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 36px;">
                  🔍 没有找到匹配的白名单 IP，您可以尝试调整或<a href="javascript:void(0)" onclick="clearWhitelistKeyword()" style="color: #0284c7; text-decoration: underline; margin-left: 4px;">清空搜索条件</a>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-pagination" id="whitelist-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>
  `;
}
