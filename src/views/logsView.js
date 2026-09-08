function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 渲染访问日志与 IP 拦截管理 Tab 视图
export function renderLogsTab(logs = [], blockedIPs = [], whitelistIPs = []) {
  return `
    <!-- 视图 3: 访问日志与 IP 拦截管理 -->
    <section class="tab-content" id="tab-access-logs">
      <!-- 左右双栏：IP 白名单与黑名单管理 -->
      <div class="ip-management-grid">
        <!-- 左侧: IP 白名单放行配置卡片 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-group">
              <h2 class="section-title">✨ IP 访问白名单</h2>
              <span class="node-count-badge badge-success">永久豁免拦截</span>
            </div>
            <button class="btn-action btn-success" onclick="saveWhitelistIPsBatch()">💾 保存白名单</button>
          </div>
          <p class="section-desc">加入白名单的 IP 拥有最高放行权限：豁免黑名单拦截、豁免登录失败连续封禁，且可一键直接加入（支持一行一个 IP）。</p>
          
          <div class="form-field" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="margin-bottom: 0;">已放行的 IP 列表（一行一个 IP）:</label>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('textarea-whitelist-ips')">📋 粘贴</button>
                <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('textarea-whitelist-ips')">清空</button>
              </div>
            </div>
            <textarea id="textarea-whitelist-ips" class="form-textarea" style="min-height: 100px; font-family: monospace; font-size: 12px; line-height: 1.6;" placeholder="1.1.1.1&#10;8.8.8.8">${escapeHtml(whitelistIPs.join('\n'))}</textarea>
            <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px; margin-top: 4px;">
              <span>💡 当前共放行 <strong>${whitelistIPs.length}</strong> 个白名单 IP</span>
            </div>
          </div>
        </div>

        <!-- 右侧: IP 黑名单屏蔽配置卡片 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-group">
              <h2 class="section-title">🛡️ IP 访问黑名单 / 屏蔽</h2>
              <span class="node-count-badge badge-danger">403 强制阻断</span>
            </div>
            <button class="btn-action btn-purple" onclick="saveBlockedIPsBatch()">💾 保存黑名单</button>
          </div>
          <p class="section-desc">被列入黑名单的 IP 访问任何订阅或后台页面时，将直接被系统拦截并返回 <code>403 Forbidden</code>（支持一行一个 IP）。</p>
          
          <div class="form-field" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="margin-bottom: 0;">已屏蔽的 IP 列表（一行一个 IP）:</label>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('textarea-blocked-ips')">📋 粘贴</button>
                <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('textarea-blocked-ips')">清空</button>
              </div>
            </div>
            <textarea id="textarea-blocked-ips" class="form-textarea" style="min-height: 100px; font-family: monospace; font-size: 12px; line-height: 1.6;" placeholder="1.2.3.4&#10;5.6.7.8">${escapeHtml(blockedIPs.join('\n'))}</textarea>
            <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px; margin-top: 4px;">
              <span>💡 当前共屏蔽 <strong>${blockedIPs.length}</strong> 个 IP</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 下部：实时访问日志记录表格卡片 -->
      <div class="section-card">
        <div class="section-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 class="section-title">📊 客户端订阅访问实时日志</h2>
            <span class="node-count-badge">最近 ${logs.length} 条记录</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-action btn-secondary" onclick="location.reload()">🔄 刷新日志</button>
            <button class="btn-action btn-danger" onclick="clearAllLogs()">🗑️ 清空所有日志</button>
          </div>
        </div>
        <p class="section-desc">自动记录客户端拉取订阅、访问短链接及管理操作的实时日志（包含客户端真实 IP、地理位置、访问时间、请求路径、状态码与客户端 User-Agent）。</p>

        <!-- 日志多条件筛选工具栏 -->
        <div class="logs-filter-toolbar">
          <div class="logs-filter-group">
            <div class="filter-input-wrap">
              <span class="filter-icon">🔍</span>
              <input type="text" id="logs-filter-keyword" class="filter-input" placeholder="搜索 IP / 路径 / 类型 / UA..." oninput="applyLogsFilter()" />
              <button type="button" class="filter-clear-btn" id="logs-keyword-clear" onclick="clearLogsKeyword()" style="display:none;" title="清空搜索">✕</button>
            </div>

            <select id="logs-filter-status" class="filter-select" onchange="applyLogsFilter()">
              <option value="">全部状态 (HTTP)</option>
              <option value="200">200 正常 (OK)</option>
              <option value="403">403 拦截 (Forbidden)</option>
              <option value="401">401 鉴权 (Unauthorized)</option>
              <option value="404">404 不存在 (Not Found)</option>
              <option value="429">429 限流 (Too Many)</option>
            </select>

            <select id="logs-filter-type" class="filter-select" onchange="applyLogsFilter()">
              <option value="">全部请求类型</option>
              <option value="sub">⚡ 订阅请求</option>
              <option value="ban">🚫 IP拦截 / 封禁</option>
              <option value="login_fail">⚠️ 密码/验证码错误</option>
              <option value="probe">🛡️ 漏洞探测 / 蜜罐</option>
              <option value="not_found">⚠️ 探测不存在路径</option>
            </select>

            <select id="logs-filter-ip-type" class="filter-select" onchange="applyLogsFilter()">
              <option value="">全部 IP 类别</option>
              <option value="whitelist">⭐ 仅白名单 IP</option>
              <option value="blocked">🚫 仅已屏蔽 IP</option>
              <option value="normal">🌐 仅普通访客 IP</option>
            </select>

            <button type="button" class="btn-action btn-secondary filter-reset-btn" onclick="resetLogsFilter()" title="重置所有筛选条件">
              ↺ 重置
            </button>
          </div>

          <div class="logs-filter-summary">
            <span id="logs-filter-stats">显示 <strong>${logs.length}</strong> / 共 <strong>${logs.length}</strong> 条记录</span>
          </div>
        </div>

        <!-- 批量操作工具栏 -->
        <div class="batch-toolbar" id="logs-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>☑️ 已选中 <strong id="logs-selected-count">0</strong> 条日志</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('logs')">取消选择</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeleteLogs()">🗑️ 批量删除选中</button>
          </div>
        </div>

        <!-- 日志表格 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="logs-check-all" onchange="toggleAllCheckboxes('logs', this.checked)" title="全选 / 反选当前页" />
                </th>
                <th style="width: 160px;">访问时间</th>
                <th style="width: 200px;">客户端 IP / 地理位置</th>
                <th style="width: 100px;">状态</th>
                <th style="min-width: 180px;">请求路径 / 类型</th>
                <th style="min-width: 220px;">客户端 User-Agent</th>
                <th style="width: 180px; text-align: right;">快速操作</th>
              </tr>
            </thead>
            <tbody id="logs-table-body">
              ${logs.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    暂无访问日志记录，客户端发起订阅拉取或访问后将在此实时显示
                  </td>
                </tr>
              ` : logs.map((log, idx) => {
                const isWhitelisted = whitelistIPs.includes(log.ip);
                const isBlocked = blockedIPs.includes(log.ip);
                const statusBadge = log.status === 200 
                  ? '<span class="node-count-badge badge-success">200 OK</span>' 
                  : (log.status === 403 
                    ? '<span class="node-count-badge badge-danger">403 拦截</span>' 
                    : (log.status === 401 
                      ? '<span class="node-count-badge badge-warning">401 鉴权</span>' 
                      : `<span class="node-count-badge">${escapeHtml(String(log.status || 200))}</span>`));
                
                const safeIp = escapeHtml(log.ip || '未知 IP');
                const safeLocation = escapeHtml(log.location || '全球 / 本地');
                const safeTime = escapeHtml(log.time || '-');
                const safePath = escapeHtml(log.path || '/');
                const safeType = escapeHtml(log.type || '订阅请求');
                const safeUa = escapeHtml(log.ua || '-');

                return `
                  <tr class="logs-table-row" data-index="${idx}"
                      data-ip="${safeIp}"
                      data-location="${safeLocation}"
                      data-status="${log.status || 200}"
                      data-path="${safePath}"
                      data-type="${safeType}"
                      data-ua="${safeUa}"
                      data-whitelisted="${isWhitelisted ? '1' : '0'}"
                      data-blocked="${isBlocked ? '1' : '0'}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox logs-row-checkbox" value="${idx}" onchange="updateBatchSelection('logs')" />
                    </td>
                    <td style="white-space: nowrap; font-size: 12px; color: var(--text-muted);">${safeTime}</td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                          <span style="font-family: monospace; font-weight: 600; color: var(--text-title);">${safeIp}</span>
                          ${isWhitelisted ? '<span style="font-size: 10px; color: #059669; background: #ecfdf5; padding: 1px 5px; border-radius: 4px; border: 1px solid #a7f3d0; white-space: nowrap; flex-shrink: 0;">白名单</span>' : ''}
                        </div>
                        <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap;">${safeLocation}</span>
                      </div>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-family: monospace; font-size: 12px; color: var(--code-color); font-weight: 600;">${safePath}</span>
                        <span style="font-size: 11px; color: var(--text-muted);">${safeType}</span>
                      </div>
                    </td>
                    <td style="font-size: 12px; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${safeUa}">${safeUa}</td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
                        ${isWhitelisted ? `
                          <button class="btn-action btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${safeIp}" onclick="removeWhitelistIP(this.dataset.ip)">移除白名单</button>
                        ` : `
                          <button class="btn-action btn-success" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${safeIp}" onclick="addWhitelistIP(this.dataset.ip)">⭐ 白名单</button>
                        `}
                        ${isBlocked ? `
                          <button class="btn-action btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${safeIp}" onclick="unblockIP(this.dataset.ip)">🟢 解封</button>
                        ` : `
                          <button class="btn-action btn-danger" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${safeIp}" onclick="blockIP(this.dataset.ip)">🚫 屏蔽</button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
              <tr id="logs-table-empty-filter-row" style="display: none;">
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">
                  🔍 没有找到符合当前筛选条件的日志记录，您可以尝试调整或<a href="javascript:void(0)" onclick="resetLogsFilter()" style="color: #0284c7; text-decoration: underline; margin-left: 4px;">重置筛选条件</a>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-pagination" id="logs-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>
  `;
}
