function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 渲染普通订阅 Tab 页面与抽屉组件 HTML
export function renderPlainSubTab(origin, subToken, plainGroups) {
  return `
    <!-- 视图 1: 普通订阅管理 -->
    <section class="tab-content active" id="tab-custom-sub">
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">📦 普通订阅列表</h2>
          <button class="btn-action btn-success" onclick="openAddGroupModal()">+ 添加新订阅</button>
        </div>
        <p class="section-desc">每个订阅均分配独立的专属订阅直连短链接（支持单次或限制次数访问），达到次数上限后自动物理销毁。</p>

        <!-- 批量操作工具栏 -->
        <div class="batch-toolbar" id="plain-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>☑️ 已选中 <strong id="plain-selected-count">0</strong> 个订阅</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('plain')">取消选择</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeletePlainGroups()">🗑️ 批量删除选中</button>
          </div>
        </div>

        <!-- 普通订阅列表表格 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="plain-check-all" onchange="toggleAllCheckboxes('plain', this.checked)" title="全选 / 反选当前页" />
                </th>
                <th style="min-width: 260px;">独立直连订阅链接</th>
                <th style="width: 170px; white-space: nowrap;">访问限制 (已访问 / 上限)</th>
                <th style="min-width: 140px; white-space: nowrap;">订阅备注 / 名称</th>
                <th style="width: 180px; text-align: right; white-space: nowrap;">操作</th>
              </tr>
            </thead>
            <tbody id="plain-table-body">
              ${plainGroups.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    暂无普通订阅，点击右上角 “+ 添加新订阅” 开始创建
                  </td>
                </tr>
              ` : plainGroups.map((g, idx) => {
                const directSubUrl = `${origin}/${g.id}${subToken ? `?token=${encodeURIComponent(subToken)}` : ''}`;
                const maxLimit = (g.maxViews !== undefined && g.maxViews !== null && g.maxViews > 0) ? g.maxViews : 0;
                const currentViews = g.views || 0;
                const safeName = escapeHtml(g.name || '未命名订阅');
                const safeId = escapeHtml(g.id);
                const nodeCount = g.nodes ? g.nodes.split('\n').map(l => l.trim()).filter(Boolean).length : 0;
                return `
                  <tr class="plain-table-row" data-index="${idx}" data-id="${safeId}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox plain-row-checkbox" value="${safeId}" onchange="updateBatchSelection('plain')" />
                    </td>
                    <td>
                      <div class="copy-box" style="gap: 6px;">
                        <input type="text" class="copy-input" id="plain-link-${idx}" value="${escapeHtml(directSubUrl)}" readonly style="padding: 6px 10px; font-size: 12px; width: 100%; min-width: 160px;" />
                        <button class="btn-action" style="height: 32px; padding: 0 10px; font-size: 12px; flex-shrink: 0;" onclick="copyText('plain-link-${idx}')">📋 复制</button>
                      </div>
                    </td>
                    <td style="white-space: nowrap;">
                      ${maxLimit > 0 ? `
                        <span class="node-count-badge badge-limit">
                          🔥 ${currentViews} / ${maxLimit} 次
                        </span>
                      ` : `
                        <span class="node-count-badge badge-unlimited">
                          ♾️ 无限制 (${currentViews} 次)
                        </span>
                      `}
                    </td>
                    <td style="font-weight: 600; color: var(--text-title); font-size: 14px;" title="${safeName}">
                      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span>${safeName}</span>
                        ${nodeCount > 0 ? `
                          <span class="node-count-badge" style="background: #eef2ff; color: #4338ca; font-size: 11px;">
                            📦 ${nodeCount} 个节点
                          </span>
                        ` : `
                          <span class="node-count-badge" style="background: #fee2e2; color: #b91c1c; font-size: 11px;">
                            ⚠️ 0 个节点
                          </span>
                        `}
                        ${g.allowedCountries && g.allowedCountries.length > 0 ? `
                          <span class="node-count-badge" style="background: #e0f2fe; color: #0369a1; font-size: 11px;" title="仅开放指定国家: ${escapeHtml(g.allowedCountries.join(', '))}">
                            🌍 ${escapeHtml(g.allowedCountries.join(', '))}
                          </span>
                        ` : ''}
                      </div>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div class="table-actions">
                        <button class="btn-action btn-secondary" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${safeId}" onclick="openEditGroupModal(this.dataset.id)">✏️ 编辑</button>
                        <button class="btn-action btn-danger" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${safeId}" onclick="deleteGroup(this.dataset.id)">🗑️ 删除</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="table-pagination" id="plain-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>

    <!-- 添加/编辑普通订阅抽屉 (从右侧滑出) -->
    <div class="drawer-overlay" id="group-modal">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 id="modal-group-title">添加新普通订阅</h3>
          <button class="drawer-close" onclick="closeGroupModal()">&times;</button>
        </div>
        <form onsubmit="submitGroupForm(event)" style="display: flex; flex-direction: column; flex: 1; height: calc(100% - 65px);">
          <input type="hidden" id="form-group-id" />
          <div class="drawer-body">
            <div class="form-field">
              <label>订阅名称 / 备注 (最多30字):</label>
              <input type="text" id="form-group-name" placeholder="例如: 香港自建专线 / 日本备用节点" maxlength="30" required />
            </div>
            <div class="form-field">
              <label>最大访问次数限制 (1~999 次，达到次数后自动物理销毁该订阅，0 或留空表示不限制):</label>
              <input type="number" id="form-group-max-views" min="0" max="999" placeholder="0 (不限制) 或输入 1 ~ 999" />
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">开放国家/地区 IP (可选，留空则继承全局配置):</label>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'CN')">+CN</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'HK')">+HK</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'MO')">+MO</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'TW')">+TW</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'JP')">+JP</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'SG')">+SG</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'US')">+US</button>
                  <button type="button" class="btn-action btn-danger" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="clearInput('form-group-allowed-countries')">清空</button>
                </div>
              </div>
              <input type="text" id="form-group-allowed-countries" placeholder="例如: CN, HK, JP (留空继承全局安全配置)" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                <span>💡 允许访问此订阅的 IP 地区代码，多个以逗号分隔；留空则使用全局订阅安全配置</span>
              </div>
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">节点列表（一行一个，支持多协议批量粘贴）:</label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('form-group-nodes')">📋 粘贴</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('form-group-nodes')">清空</button>
                </div>
              </div>
              <textarea class="form-textarea" style="min-height: 240px; margin-bottom: 6px;" id="form-group-nodes" placeholder="在此粘贴该订阅的节点链接...&#10;vless://...&#10;vmess://...&#10;ss://...&#10;trojan://..." oninput="updateNodeStats()" required></textarea>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                <span>💡 支持多行批量粘贴</span>
                <span id="node-stats-info" style="color: var(--code-color); font-family: monospace; font-weight: 600;">0 个字符 | 0 行</span>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button type="button" class="btn-action btn-secondary" onclick="closeGroupModal()">取消</button>
            <button type="submit" class="btn-action btn-success">💾 保存订阅</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
