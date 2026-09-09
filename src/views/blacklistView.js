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

// 渲染独立 IP 黑名单管理 Tab 视图
export function renderBlacklistTab(blockedIPs = []) {
  const count = blockedIPs.length;

  return `
    <!-- 视图: 独立 IP 黑名单管理 -->
    <section class="tab-content" id="tab-ip-blacklist">
      <div class="section-card">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">🛡️ IP 访问黑名单 / 屏蔽管理</h2>
            <span class="node-count-badge badge-danger">403 强制阻断</span>
            <span class="node-count-badge" id="blacklist-total-badge">共 ${count} 个屏蔽项</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-action btn-danger" onclick="clearAllBlockedIPs()">🗑️ 清空所有黑名单</button>
          </div>
        </div>
        <p class="section-desc">
          被列入黑名单的 IP / CIDR 网段访问任何订阅链接、短链接或管理页面时，边缘层将直接阻断并返回 <code>403 Forbidden</code>。支持 IPv4、IPv6 及 CIDR 网段（如 <code>10.0.0.0/8</code>）。
        </p>

        <!-- 快速单条添加工具栏 -->
        <div class="quick-add-bar">
          <div class="quick-add-wrap">
            <span class="quick-add-icon">🚫</span>
            <input type="text" id="input-quick-add-blacklist" class="form-input" 
                   placeholder="输入单个或多个 IP / CIDR 网段（如：1.2.3.4、10.0.0.0/8，支持以逗号或空格分隔），按回车屏蔽..."
                   onkeydown="if(event.key === 'Enter') quickAddBlockedIP()" />
          </div>
          <button type="button" class="btn-action btn-purple" style="height: 38px; padding: 0 18px;" onclick="quickAddBlockedIP()">
            🚫 屏蔽该 IP
          </button>
        </div>

        <!-- 搜索与筛选工具栏 -->
        <div class="logs-filter-toolbar" style="margin-top: 14px;">
          <div class="logs-filter-group" style="flex: 1;">
            <div class="filter-input-wrap" style="flex: 1; max-width: 360px;">
              <span class="filter-icon">🔍</span>
              <input type="text" id="filter-blacklist-keyword" class="filter-input" 
                     placeholder="搜索黑名单 IP 或网段..." oninput="applyBlacklistFilter()" />
              <button type="button" class="filter-clear-btn" id="blacklist-keyword-clear" 
                      onclick="clearBlacklistKeyword()" style="display:none;" title="清空搜索">✕</button>
            </div>
            <button type="button" class="btn-action btn-secondary filter-reset-btn" onclick="clearBlacklistKeyword()">
              ↺ 重置
            </button>
          </div>
          <div class="logs-filter-summary">
            <span id="blacklist-filter-stats">显示 <strong>${count}</strong> / 共 <strong>${count}</strong> 个 IP</span>
          </div>
        </div>

        <!-- 批量操作工具栏 -->
        <div class="batch-toolbar" id="blacklist-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>☑️ 已选中 <strong id="blacklist-selected-count">0</strong> 个黑名单 IP</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('blacklist')">取消选择</button>
            <button type="button" class="btn-action btn-primary" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeleteBlockedIPs()">🟢 批量解除屏蔽</button>
          </div>
        </div>

        <!-- 可视化黑名单数据表格 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="blacklist-check-all" onchange="toggleAllCheckboxes('blacklist', this.checked)" title="全选 / 反选当前页" />
                </th>
                <th style="width: 70px;">序号</th>
                <th style="min-width: 240px;">IP / CIDR 网段地址</th>
                <th style="width: 140px;">类别</th>
                <th style="width: 150px;">拦截状态</th>
                <th style="width: 220px; text-align: right;">操作</th>
              </tr>
            </thead>
            <tbody id="blacklist-table-body">
              ${count === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 48px 16px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">当前黑名单列表为空</div>
                    <div style="font-size: 12px;">你可以使用上方的输入框输入 IP 或 CIDR 网段快速屏蔽</div>
                  </td>
                </tr>
              ` : blockedIPs.map((ip, idx) => {
                const safeIp = escapeHtml(ip);
                const typeLabel = getIPTypeLabel(ip);
                return `
                  <tr class="blacklist-table-row" data-index="${idx}" data-ip="${safeIp}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox blacklist-row-checkbox" value="${safeIp}" onchange="updateBatchSelection('blacklist')" />
                    </td>
                    <td style="color: var(--text-muted); font-size: 12px; font-family: monospace;">#${idx + 1}</td>
                    <td>
                      <span style="font-family: monospace; font-size: 13px; font-weight: 700; color: #dc2626;">${safeIp}</span>
                    </td>
                    <td>
                      <span class="node-count-badge" style="font-size: 11px;">${typeLabel}</span>
                    </td>
                    <td>
                      <span class="node-count-badge badge-danger" style="font-size: 11px;">🚫 403 阻断</span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
                        <button type="button" class="btn-action btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="copyStringToClipboard('${safeIp}', '已复制 IP: ${safeIp}')">📋 复制</button>
                        <button type="button" class="btn-action btn-success" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="moveBlacklistToWhitelist('${safeIp}')">⭐ 移入白名单</button>
                        <button type="button" class="btn-action btn-primary" style="height: 28px; font-size: 11px; padding: 0 8px;" onclick="unblockIP('${safeIp}')">🟢 解封</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
              <tr id="blacklist-table-empty-filter-row" style="display: none;">
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 36px;">
                  🔍 没有找到匹配的黑名单 IP，您可以尝试调整或<a href="javascript:void(0)" onclick="clearBlacklistKeyword()" style="color: #0284c7; text-decoration: underline; margin-left: 4px;">清空搜索条件</a>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-pagination" id="blacklist-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>
  `;
}
