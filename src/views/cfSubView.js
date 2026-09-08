function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 渲染 CF 优选订阅 Tab 页面与抽屉组件 HTML
export function renderCfSubTab(origin, subToken, cfGroups, sources) {
  return `
    <!-- 视图 2: CF 优选订阅管理 -->
    <section class="tab-content" id="tab-cf-sub">
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">⚡ CF 优选订阅列表</h2>
          <button class="btn-action btn-success" onclick="openAddCfGroupModal()">+ 添加优选订阅</button>
        </div>
        <p class="section-desc">支持创建多个不同用途的 CF 优选订阅，每个订阅可独立指定基础 VLESS 模板节点、关联优选接口源及访问次数限制。</p>

        <!-- 批量操作工具栏 -->
        <div class="batch-toolbar" id="cf-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>☑️ 已选中 <strong id="cf-selected-count">0</strong> 个优选订阅</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('cf')">取消选择</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeleteCfGroups()">🗑️ 批量删除选中</button>
          </div>
        </div>

        <!-- CF 优选订阅表格 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="cf-check-all" onchange="toggleAllCheckboxes('cf', this.checked)" title="全选 / 反选当前页" />
                </th>
                <th style="min-width: 260px;">独立直连订阅链接</th>
                <th style="width: 170px; white-space: nowrap;">访问限制 (已访问 / 上限)</th>
                <th style="min-width: 140px; white-space: nowrap;">订阅备注 / 名称</th>
                <th style="width: 240px; text-align: right; white-space: nowrap;">操作</th>
              </tr>
            </thead>
            <tbody id="cf-table-body">
              ${cfGroups.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    暂无独立 CF 优选订阅，点击右上角 “+ 添加优选订阅” 创建个性化优选订阅组
                  </td>
                </tr>
              ` : cfGroups.map((g, idx) => {
                const directSubUrl = `${origin}/${g.id}${subToken ? `?token=${encodeURIComponent(subToken)}` : ''}`;
                const maxLimit = (g.maxViews !== undefined && g.maxViews !== null && g.maxViews > 0) ? g.maxViews : 0;
                const currentViews = g.views || 0;
                const safeName = escapeHtml(g.name || '未命名优选订阅');
                const safeId = escapeHtml(g.id);
                return `
                  <tr class="cf-table-row" data-index="${idx}" data-id="${safeId}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox cf-row-checkbox" value="${safeId}" onchange="updateBatchSelection('cf')" />
                    </td>
                    <td>
                      <div class="copy-box" style="gap: 6px;">
                        <input type="text" class="copy-input" id="cf-link-${idx}" value="${escapeHtml(directSubUrl)}" readonly style="padding: 6px 10px; font-size: 12px; width: 100%; min-width: 160px;" />
                        <button class="btn-action" style="height: 32px; padding: 0 10px; font-size: 12px; flex-shrink: 0;" onclick="copyText('cf-link-${idx}')">📋 复制</button>
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
                      ${safeName}
                      ${g.allowedCountries && g.allowedCountries.length > 0 ? `
                        <span class="node-count-badge" style="background: #e0f2fe; color: #0369a1; font-size: 11px; margin-left: 6px;" title="仅开放指定国家: ${escapeHtml(g.allowedCountries.join(', '))}">
                          🌍 ${escapeHtml(g.allowedCountries.join(', '))}
                        </span>
                      ` : ''}
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div class="table-actions">
                        <button class="btn-action btn-purple" style="height: 32px; padding: 0 10px; font-size: 12px;" data-id="${safeId}" onclick="testCfGroup(this.dataset.id)">🧪 测试</button>
                        <button class="btn-action btn-secondary" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${safeId}" onclick="openEditCfGroupModal(this.dataset.id)">✏️ 编辑</button>
                        <button class="btn-action btn-danger" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${safeId}" onclick="deleteCfGroup(this.dataset.id)">🗑️ 删除</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="table-pagination" id="cf-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>

    <!-- 添加/编辑 CF 优选订阅抽屉 (从右侧滑出) -->
    <div class="drawer-overlay" id="cf-group-modal">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 id="modal-cf-group-title">添加新 CF 优选订阅</h3>
          <button class="drawer-close" onclick="closeCfGroupModal()">&times;</button>
        </div>
        <form onsubmit="submitCfGroupForm(event)" style="display: flex; flex-direction: column; flex: 1; height: calc(100% - 65px);">
          <input type="hidden" id="form-cf-group-id" />
          <div class="drawer-body">
            <div class="form-field">
              <label>订阅名称 / 备注 (最多30字):</label>
              <input type="text" id="form-cf-group-name" placeholder="例如: 极速 4K 优选专线 / 移动专享优选" maxlength="30" required />
            </div>
            <div class="form-field">
              <label>最大访问次数限制 (1~999 次，达到次数后自动物理销毁该订阅，0 或留空表示不限制):</label>
              <input type="number" id="form-cf-group-max-views" min="0" max="999" placeholder="0 (不限制) 或输入 1 ~ 999" />
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">开放国家/地区 IP (可选，留空则继承全局配置):</label>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'CN')">+CN</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'HK')">+HK</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'MO')">+MO</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'TW')">+TW</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'JP')">+JP</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'SG')">+SG</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'US')">+US</button>
                  <button type="button" class="btn-action btn-danger" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="clearInput('form-cf-group-allowed-countries')">清空</button>
                </div>
              </div>
              <input type="text" id="form-cf-group-allowed-countries" placeholder="例如: CN, HK, JP (留空继承全局安全配置)" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                <span>💡 允许访问此订阅的 IP 地区代码，多个以逗号分隔；留空则使用全局订阅安全配置</span>
              </div>
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">基础 VLESS 模板节点 (支持标准格式与 Base64/小火箭等客户端格式):</label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('form-cf-group-base')">📋 粘贴</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('form-cf-group-base')">清空</button>
                </div>
              </div>
              <textarea class="form-textarea" style="min-height: 110px; margin-bottom: 6px;" id="form-cf-group-base" placeholder="在此粘贴该优选订阅专用的基础 vless:// 节点链接...（支持标准格式及 Base64 格式，留空则使用全局基础节点）"></textarea>
              <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                <span>💡 优选 IP 将自动提取并替换模板节点的服务器地址与端口，保留全部传输与伪装参数</span>
              </div>
            </div>

            <!-- 优选 IP 接口源配置 (多行文本域批量配置) -->
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">优选 IP 接口源配置 (多行批量输入，格式：名称,URL 或 单纯 URL):</label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('global-sources-text')">📋 粘贴</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('global-sources-text')">清空</button>
                </div>
              </div>
              <textarea id="global-sources-text" class="form-textarea" style="min-height: 140px; font-family: monospace; font-size: 12px; line-height: 1.6;" placeholder="https://cf.090227.xyz/cmcc?ips=10&#10;中国联通,https://cf.090227.xyz/cu?ips=10&#10;https://cf.090227.xyz/ct?ips=10">${sources.map(s => (s.name && !s.name.startsWith('源-') ? `${s.name},${s.url}` : s.url)).join('\n')}</textarea>
              <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                <span>💡 一行一个优选 API 接口，保存优选订阅时将一并更新优选源配置</span>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button type="button" class="btn-action btn-purple" id="btn-test-modal-nodes" onclick="testModalCfNodes()">🧪 测试生成节点</button>
            <button type="button" class="btn-action btn-secondary" onclick="closeCfGroupModal()">取消</button>
            <button type="submit" class="btn-action btn-success">💾 保存优选订阅</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
