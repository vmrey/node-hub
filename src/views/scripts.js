export const dashboardScripts = `
// 页面内全局组数据
const allGroupsData = JSON.parse(document.getElementById('data-plain-groups').textContent);
const allCfGroupsData = JSON.parse(document.getElementById('data-cf-groups').textContent);
const allSourcesData = JSON.parse(document.getElementById('data-sources').textContent);
const blockedIPsData = JSON.parse(document.getElementById('data-blocked-ips')?.textContent || '[]');
const whitelistIPsData = JSON.parse(document.getElementById('data-whitelist-ips')?.textContent || '[]');

// 全局拦截业务 API 请求，只要有 API 请求并成功响应，自动重置 10 分钟倒计时
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args);
  if (response.ok && typeof args[0] === 'string' && args[0].startsWith('/api/')) {
    if (typeof resetSessionCountdown === 'function') {
      resetSessionCountdown();
    }
  }
  return response;
};

// ==========================================
// 全局统一 UI 封装：Toast 提示系统
// ==========================================
function showToast(message, type = 'info', duration = 2500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-item toast-' + type;

  const icons = {
    success: '✅',
    error: '❌',
    info: '💡'
  };

  toast.innerHTML = '<span>' + (icons[type] || '💡') + '</span><span>' + message + '</span>';
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================
// 全局统一 UI 封装：确认/删除/警告 Dialog 系统
// ==========================================
function showConfirmDialog({
  title = '确认操作',
  message = '您确定要继续吗？',
  icon = '⚠️',
  confirmText = '确认',
  confirmType = 'danger'
}) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('app-dialog');
    const titleEl = document.getElementById('dialog-title');
    const msgEl = document.getElementById('dialog-message');
    const iconEl = document.getElementById('dialog-icon');
    const confirmBtn = document.getElementById('dialog-btn-confirm');
    const cancelBtn = document.getElementById('dialog-btn-cancel');

    titleEl.innerText = title;
    msgEl.innerText = message;
    iconEl.innerText = icon;
    confirmBtn.innerText = confirmText;
    confirmBtn.className = 'btn-action btn-' + confirmType;

    dialog.classList.add('active');

    function cleanup() {
      dialog.classList.remove('active');
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      dialog.onclick = null;
      window.removeEventListener('keydown', onKeyDown);
    }

    function onConfirm() {
      cleanup();
      resolve(true);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }

    confirmBtn.onclick = onConfirm;
    cancelBtn.onclick = onCancel;
    dialog.onclick = function(e) {
      if (e.target === dialog) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
  });
}

function addCountryToInput(inputId, code) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const parts = input.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!parts.includes(code.toUpperCase())) {
    parts.push(code.toUpperCase());
  }
  input.value = parts.join(', ');
}

async function testTelegramNotify() {
  const token = document.getElementById('cfg-tg-token').value.trim();
  const chatId = document.getElementById('cfg-tg-chat-id').value.trim();
  const apiHost = document.getElementById('cfg-tg-api-host').value.trim();

  if (!token || !chatId) {
    showToast('请先输入 Bot Token 和 Chat ID 再进行测试！', 'error');
    return;
  }

  showToast('正在向 Telegram 发送测试通知...', 'info');

  try {
    const res = await fetch('/api/test-tg-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId, apiHost })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      const chat = result.chat;
      const chatType = chat ? (chat.type || 'unknown') : 'unknown';
      const chatTitle = chat ? (chat.title || chat.username || (chat.first_name ? chat.first_name : '') || ('ID: ' + chatId)) : ('ID: ' + chatId);

      if (chatType === 'private') {
        showToast('⚠️ 测试已成功发送，但目标是【个人私聊: ' + chatTitle + '】而非群组！若要推送到群组，请将 Bot 拉入群，群组 ID 必须以 -100 开头（例如 -1001234567890）。', 'info', 7000);
      } else {
        showToast('🎉 测试通知已成功送达群组【' + chatTitle + '】(' + chatType + ')！', 'success', 5000);
      }
    } else {
      showToast('发送失败: ' + (result.error || '未知错误'), 'error', 6000);
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error', 5000);
  }
}

async function saveTgConfig() {
  const enabled = document.getElementById('cfg-tg-enabled').checked;
  const token = document.getElementById('cfg-tg-token').value.trim();
  const chatId = document.getElementById('cfg-tg-chat-id').value.trim();
  const apiHost = document.getElementById('cfg-tg-api-host').value.trim();

  if (enabled && (!token || !chatId)) {
    showToast('启用通知时，Bot Token 与 Chat ID 均不可为空！', 'error');
    return;
  }

  const res = await fetch('/api/tg-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled, token, chatId, apiHost })
  });

  if (res.ok) {
    showToast('Telegram 订阅通知配置保存成功！', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    const err = await res.text();
    showToast('保存失败: ' + err, 'error');
  }
}

function randomGroupId() {
  document.getElementById('form-group-id').value = generateRandomString(12, 33).toLowerCase();
}

function updateNodeStats() {
  const textarea = document.getElementById('form-group-nodes');
  const val = textarea ? textarea.value : '';
  const charCount = val.length;
  const lines = val ? val.split('\\n').filter(l => l.trim().length > 0).length : 0;
  const statsEl = document.getElementById('node-stats-info');
  if (statsEl) {
    statsEl.innerText = charCount + ' 个字符 | ' + lines + ' 行';
  }
}

function openAddGroupModal() {
  document.getElementById('modal-group-title').innerText = '添加新普通订阅';
  randomGroupId();
  document.getElementById('form-group-name').value = '';
  document.getElementById('form-group-max-views').value = '';
  const countryEl = document.getElementById('form-group-allowed-countries');
  if (countryEl) countryEl.value = '';
  document.getElementById('form-group-nodes').value = '';
  updateNodeStats();
  document.getElementById('group-modal').classList.add('active');
}

function openEditGroupModal(id) {
  document.getElementById('modal-group-title').innerText = '编辑普通订阅';
  document.getElementById('form-group-id').value = id;
  const target = allGroupsData.find(g => g.id.toLowerCase() === String(id).toLowerCase());
  document.getElementById('form-group-name').value = target ? (target.name || '') : '';
  document.getElementById('form-group-max-views').value = (target && target.maxViews > 0) ? target.maxViews : '';
  const countryEl = document.getElementById('form-group-allowed-countries');
  if (countryEl) countryEl.value = (target && Array.isArray(target.allowedCountries)) ? target.allowedCountries.join(', ') : '';
  document.getElementById('form-group-nodes').value = target ? (target.nodes || '') : '';
  updateNodeStats();
  document.getElementById('group-modal').classList.add('active');
}

function closeGroupModal() {
  document.getElementById('group-modal').classList.remove('active');
}

function generateRandomString(minOrExact = 12, max = null) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let length;
  if (max === null) {
    length = minOrExact;
  } else {
    const minLen = Math.min(minOrExact, max);
    const maxLen = Math.max(minOrExact, max);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const lengthBytes = new Uint8Array(1);
      crypto.getRandomValues(lengthBytes);
      length = minLen + (lengthBytes[0] % (maxLen - minLen + 1));
    } else {
      length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    }
  }
  let result = '';
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomValues = new Uint8Array(length);
      crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
      }
      return result;
    }
  } catch {}
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function randomToken() {
  document.getElementById('cfg-token').value = generateRandomString(12, 33);
}

function randomizeSecurityConfig() {
  randomToken();
}

async function saveSecurityConfig() {
  const token = document.getElementById('cfg-token').value.trim();
  const rawCountries = document.getElementById('cfg-allowed-countries') ? document.getElementById('cfg-allowed-countries').value.trim() : '';
  const allowedCountries = rawCountries ? rawCountries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean) : [];
  const proxyClientOnly = document.getElementById('cfg-proxy-client-only') ? document.getElementById('cfg-proxy-client-only').checked : true;

  if (!token) {
    showToast('订阅鉴权令牌 (TOKEN) 不能为空！', 'error');
    return;
  }

  const res = await fetch('/api/security-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, allowedCountries, proxyClientOnly })
  });

  if (res.ok) {
    showToast('订阅安全配置保存成功！所有订阅访问策略已更新生效。', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    const err = await res.text();
    showToast('保存失败: ' + err, 'error');
  }
}

// ==========================================
// 选项卡路由与状态保持系统
// ==========================================
function toggleMobileSidebar(show) {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (show === undefined) {
    show = !sidebar.classList.contains('active');
  }
  if (show) {
    sidebar.classList.add('active');
    backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('active');
    backdrop.classList.remove('active');
  }
}

function switchTab(tabId, pushHash = true) {
  toggleMobileSidebar(false);
  const validTabs = ['custom-sub', 'cf-sub', 'access-logs', 'ip-whitelist', 'ip-blacklist', 'security-config', 'tg-config'];
  if (!validTabs.includes(tabId)) {
    tabId = 'custom-sub';
  }

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  const navEl = document.getElementById('nav-item-' + tabId);
  if (navEl) navEl.classList.add('active');

  const targetTab = document.getElementById('tab-' + tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  const titles = {
    'custom-sub': '📦 普通订阅管理',
    'cf-sub': '⚡ CF 优选订阅管理',
    'access-logs': '📊 客户端访问实时日志',
    'ip-whitelist': '✨ IP 访问白名单管理',
    'ip-blacklist': '🛡️ IP 访问黑名单管理',
    'security-config': '🔑 订阅安全配置 (全局)',
    'tg-config': '✈️ TG 订阅通知 (全局)'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.innerText = titles[tabId] || '控制台';
  }

  localStorage.setItem('active_dashboard_tab', tabId);

  // 切换 Tab 时自动刷新对应表格分页器
  const tabPaginatorMap = {
    'custom-sub': 'plain-table-row',
    'cf-sub': 'cf-table-row',
    'access-logs': 'logs-table-row',
    'ip-whitelist': 'whitelist-table-row',
    'ip-blacklist': 'blacklist-table-row'
  };
  const activeRowClass = tabPaginatorMap[tabId];
  if (activeRowClass && window._paginators && window._paginators[activeRowClass]) {
    window._paginators[activeRowClass].render();
  }

  if (pushHash && window.location.hash !== '#' + tabId) {
    history.replaceState(null, '', '#' + tabId);
  }
}

function initActiveTab() {
  const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
  const savedTab = localStorage.getItem('active_dashboard_tab') || 'custom-sub';
  const validTabs = ['custom-sub', 'cf-sub', 'access-logs', 'ip-whitelist', 'ip-blacklist', 'security-config', 'tg-config'];
  const targetTab = validTabs.includes(hash) ? hash : (validTabs.includes(savedTab) ? savedTab : 'custom-sub');
  switchTab(targetTab, true);
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
  const validTabs = ['custom-sub', 'cf-sub', 'access-logs', 'ip-whitelist', 'ip-blacklist', 'security-config', 'tg-config'];
  if (validTabs.includes(hash)) {
    switchTab(hash, false);
  }
});

initActiveTab();

async function pasteClipboard(id) {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      document.getElementById(id).value = text.trim();
      updateNodeStats();
      showToast('已成功粘贴剪贴板内容！', 'success');
    } else {
      showToast('剪贴板为空！', 'info');
    }
  } catch (err) {
    showToast('无法读取剪贴板，请直接在输入框中使用快捷键粘贴！', 'error');
  }
}

async function clearInput(id) {
  const confirmed = await showConfirmDialog({
    title: '清空确认',
    message: '确定要清空输入框内的全部内容吗？此操作无法撤销。',
    icon: '🗑️',
    confirmText: '确认清空',
    confirmType: 'danger'
  });
  if (confirmed) {
    document.getElementById(id).value = '';
    updateNodeStats();
    showToast('已清空内容', 'info');
  }
}

async function submitGroupForm(e) {
  e.preventDefault();
  let id = document.getElementById('form-group-id').value.trim();
  if (!id) {
    id = generateRandomString(12, 33).toLowerCase();
    document.getElementById('form-group-id').value = id;
  } else {
    id = id.toLowerCase();
  }

  const name = document.getElementById('form-group-name').value.trim();
  if (!name) {
    showToast('请输入订阅名称！', 'error');
    return;
  }
  if (name.length > 30) {
    showToast('订阅名称/备注不能超过30个字！', 'error');
    return;
  }

  const maxViewsRaw = document.getElementById('form-group-max-views').value.trim();
  let maxViews = 0;
  if (maxViewsRaw) {
    const val = parseInt(maxViewsRaw, 10);
    if (isNaN(val) || val < 0 || val > 999) {
      showToast('最大访问次数必须在 0 ~ 999 之间！', 'error');
      return;
    }
    maxViews = val;
  }

  const rawNodes = document.getElementById('form-group-nodes').value.trim();
  if (!rawNodes) {
    showToast('请至少输入或粘贴一个节点链接！', 'error');
    return;
  }
  const nodes = rawNodes.replace(/\\r\\n|\\r/g, '\\n').split('\\n').map(n => n.trim()).filter(n => n.length > 0);
  if (nodes.length === 0) {
    showToast('未能识别到有效的节点内容，请确认节点格式！', 'error');
    return;
  }

  // 校验节点有效性：至少应包含一个支持的协议链接或 Base64 订阅文本
  const validProtocolRegex = /^(vless|vmess|ss|ssr|trojan|tuic|hysteria|hysteria2|hy2|wireguard|wg|socks|socks5):\\/\\//i;
  const isBase64Block = rawNodes.length > 20 && /^[A-Za-z0-9+\\/=\\r\\n\\s]+$/.test(rawNodes) && !rawNodes.includes('://');
  const hasValidProtocolNode = nodes.some(n => validProtocolRegex.test(n) || n.toLowerCase().startsWith('vless='));
  if (!hasValidProtocolNode && !isBase64Block) {
    showToast('未能识别到有效的节点链接，请确认包含 vless://、vmess://、ss:// 等合法协议节点或 Base64 文本！', 'error');
    return;
  }

  const rawCountries = document.getElementById('form-group-allowed-countries') ? document.getElementById('form-group-allowed-countries').value.trim() : '';
  const allowedCountries = rawCountries ? rawCountries.split(',').map(c => c.trim().toUpperCase()).filter(c => /^[A-Z]{2}$/.test(c)) : [];

  try {
    const res = await fetch('/api/custom-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, maxViews, nodes, allowedCountries })
    });

    if (res.ok) {
      showToast('普通订阅【' + name + '】保存成功！', 'success');
      setTimeout(() => {
        window.location.hash = '#custom-sub';
        location.reload();
      }, 600);
    } else if (res.status === 401) {
      showToast('登录会话已超时，请重新登录！', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      let errMsg = '保存失败';
      try {
        const data = await res.json();
        errMsg = data.error || data.message || JSON.stringify(data);
      } catch {
        errMsg = await res.text();
      }
      showToast('保存失败: ' + errMsg, 'error');
    }
  } catch (err) {
    showToast('网络请求异常: ' + (err.message || '请检查网络'), 'error');
  }
}

async function deleteGroup(id) {
  if (!id) {
    showToast('未能获取到订阅 ID，请刷新页面重试！', 'error');
    return;
  }
  const cleanId = String(id).trim();
  const target = allGroupsData.find(g => g.id.toLowerCase() === cleanId.toLowerCase());
  const name = target ? target.name : cleanId;

  const confirmed = await showConfirmDialog({
    title: '删除普通订阅',
    message: '确定要删除普通订阅【' + name + '】(ID: ' + cleanId + ') 吗？删除后相关客户端将无法继续拉取节点！',
    icon: '🗑️',
    confirmText: '确认删除',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    let res = await fetch('/api/custom-groups/' + encodeURIComponent(cleanId), { method: 'DELETE' });
    if (!res.ok && res.status !== 401) {
      // 容错降级：若浏览器或代理拦截 DELETE 谓词，改用 POST 批量删除
      res = await fetch('/api/custom-groups/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [cleanId] })
      });
    }

    if (res.ok) {
      showToast('普通订阅【' + name + '】已成功删除！', 'success');
      setTimeout(() => {
        window.location.hash = '#custom-sub';
        location.reload();
      }, 500);
    } else if (res.status === 401) {
      showToast('登录会话已超时，请重新登录！', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      let errMsg = '删除失败，请稍后重试';
      try {
        const data = await res.json();
        errMsg = data.error || data.message || errMsg;
      } catch {}
      showToast(errMsg, 'error');
    }
  } catch (err) {
    showToast('网络请求异常: ' + err.message, 'error');
  }
}

// ==========================================
// CF 优选订阅组模态窗口及提交管理
// ==========================================
function openAddCfGroupModal() {
  document.getElementById('modal-cf-group-title').innerText = '添加新 CF 优选订阅';
  document.getElementById('form-cf-group-id').value = generateRandomString(12, 33).toLowerCase();
  document.getElementById('form-cf-group-name').value = '';
  document.getElementById('form-cf-group-max-views').value = '';
  const countryEl = document.getElementById('form-cf-group-allowed-countries');
  if (countryEl) countryEl.value = '';
  document.getElementById('form-cf-group-base').value = '';
  const sourcesTextEl = document.getElementById('global-sources-text');
  if (sourcesTextEl) {
    sourcesTextEl.value = allSourcesData.map(s => (s.name && !s.name.startsWith('源-') ? (s.name + ',' + s.url) : s.url)).join('\\n');
  }
  document.getElementById('cf-group-modal').classList.add('active');
}

function openEditCfGroupModal(id) {
  document.getElementById('modal-cf-group-title').innerText = '编辑 CF 优选订阅';
  document.getElementById('form-cf-group-id').value = id;
  const target = allCfGroupsData.find(g => g.id.toLowerCase() === String(id).toLowerCase());
  document.getElementById('form-cf-group-name').value = target ? (target.name || '') : '';
  document.getElementById('form-cf-group-max-views').value = (target && target.maxViews > 0) ? target.maxViews : '';
  const countryEl = document.getElementById('form-cf-group-allowed-countries');
  if (countryEl) countryEl.value = (target && Array.isArray(target.allowedCountries)) ? target.allowedCountries.join(', ') : '';
  document.getElementById('form-cf-group-base').value = target ? (target.baseVless || '') : '';
  
  const sourcesTextEl = document.getElementById('global-sources-text');
  if (sourcesTextEl) {
    sourcesTextEl.value = allSourcesData.map(s => (s.name && !s.name.startsWith('源-') ? (s.name + ',' + s.url) : s.url)).join('\\n');
  }
  document.getElementById('cf-group-modal').classList.add('active');
}

function closeCfGroupModal() {
  document.getElementById('cf-group-modal').classList.remove('active');
}

async function submitCfGroupForm(e) {
  e.preventDefault();
  let id = document.getElementById('form-cf-group-id').value.trim();
  if (!id) {
    id = generateRandomString(12, 33).toLowerCase();
    document.getElementById('form-cf-group-id').value = id;
  } else {
    id = id.toLowerCase();
  }

  const name = document.getElementById('form-cf-group-name').value.trim();
  if (!name) {
    showToast('请输入优选订阅名称！', 'error');
    return;
  }
  if (name.length > 30) {
    showToast('订阅名称/备注不能超过30个字！', 'error');
    return;
  }

  const maxViewsRaw = document.getElementById('form-cf-group-max-views').value.trim();
  let maxViews = 0;
  if (maxViewsRaw) {
    const val = parseInt(maxViewsRaw, 10);
    if (isNaN(val) || val < 0 || val > 999) {
      showToast('最大访问次数必须在 0 ~ 999 之间！', 'error');
      return;
    }
    maxViews = val;
  }

  const baseVless = document.getElementById('form-cf-group-base').value.trim();
  if (baseVless) {
    const isVless = baseVless.toLowerCase().startsWith('vless://') || baseVless.toLowerCase().startsWith('vless=');
    const isBase64 = /^[A-Za-z0-9+\\/=\\s]+$/.test(baseVless) && baseVless.length > 20;
    if (!isVless && !isBase64) {
      showToast('基础模板节点格式不正确，必须为有效的 vless:// 节点链接（或 Base64 编码）！', 'error');
      return;
    }
  }

  // 1. 如果在弹窗内编辑了优选源文本域，一并同步保存优选源
  const sourcesTextEl = document.getElementById('global-sources-text');
  if (sourcesTextEl) {
    const rawText = sourcesTextEl.value.trim();
    if (rawText) {
      const lines = rawText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
      const parsedSources = [];
      let counter = 1;

      for (const line of lines) {
        let srcName = '';
        let srcUrl = '';
        let srcId = '';

        if (line.includes(',')) {
          const parts = line.split(',');
          srcName = parts[0].trim();
          srcUrl = parts.slice(1).join(',').trim();
        } else {
          srcUrl = line.trim();
        }

        if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
          const existing = allSourcesData.find(s => s.url === srcUrl);
          if (existing) {
            srcId = existing.id;
            if (!srcName) srcName = existing.name;
          } else {
            srcId = 'src_' + counter + '_' + generateRandomString(6).toLowerCase();
            if (!srcName) srcName = '优选源 ' + counter;
          }
          parsedSources.push({
            id: srcId.toLowerCase(),
            name: srcName || ('优选源 ' + counter),
            url: srcUrl,
            enabled: true
          });
          counter++;
        }
      }

      if (parsedSources.length === 0) {
        showToast('优选源配置中未识别到有效的 http:// 或 https:// 接口地址！', 'error');
        return;
      }

      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: parsedSources })
      });
    }
  }

  // 2. 保存 CF 优选订阅
  const rawCountries = document.getElementById('form-cf-group-allowed-countries') ? document.getElementById('form-cf-group-allowed-countries').value.trim() : '';
  const allowedCountries = rawCountries ? rawCountries.split(',').map(c => c.trim().toUpperCase()).filter(c => /^[A-Z]{2}$/.test(c)) : [];

  try {
    const res = await fetch('/api/cf-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, maxViews, baseVless, sources: [], allowedCountries })
    });

    if (res.ok) {
      showToast('CF 优选订阅【' + name + '】保存成功！', 'success');
      setTimeout(() => {
        window.location.hash = '#cf-sub';
        location.reload();
      }, 600);
    } else if (res.status === 401) {
      showToast('登录会话已超时，请重新登录！', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      let errMsg = '保存失败';
      try {
        const data = await res.json();
        errMsg = data.error || data.message || JSON.stringify(data);
      } catch {
        errMsg = await res.text();
      }
      showToast('保存失败: ' + errMsg, 'error');
    }
  } catch (err) {
    showToast('网络请求异常: ' + (err.message || '请检查网络'), 'error');
  }
}

async function deleteCfGroup(id) {
  if (!id) {
    showToast('未能获取到优选订阅 ID，请刷新页面重试！', 'error');
    return;
  }
  const cleanId = String(id).trim();
  const target = allCfGroupsData.find(g => g.id.toLowerCase() === cleanId.toLowerCase());
  const name = target ? target.name : cleanId;

  const confirmed = await showConfirmDialog({
    title: '删除 CF 优选订阅',
    message: '确定要删除 CF 优选订阅【' + name + '】(ID: ' + cleanId + ') 吗？删除后相关客户端将无法获取优选节点！',
    icon: '🗑️',
    confirmText: '确认删除',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    let res = await fetch('/api/cf-groups/' + encodeURIComponent(cleanId), { method: 'DELETE' });
    if (!res.ok && res.status !== 401) {
      // 容错降级：若浏览器或代理拦截 DELETE 谓词，改用 POST 批量删除
      res = await fetch('/api/cf-groups/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [cleanId] })
      });
    }

    if (res.ok) {
      showToast('CF 优选订阅【' + name + '】已成功删除！', 'success');
      setTimeout(() => {
        window.location.hash = '#cf-sub';
        location.reload();
      }, 500);
    } else if (res.status === 401) {
      showToast('登录会话已超时，请重新登录！', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      let errMsg = '删除失败，请稍后重试';
      try {
        const data = await res.json();
        errMsg = data.error || data.message || errMsg;
      } catch {}
      showToast(errMsg, 'error');
    }
  } catch (err) {
    showToast('网络请求异常: ' + err.message, 'error');
  }
}

function copyStringToClipboard(text, successMsg = '已复制到剪贴板！') {
  if (!text) {
    showToast('内容为空，无需复制', 'info');
    return;
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg = '已复制到剪贴板！') {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      showToast(successMsg, 'success');
    } else {
      showToast('复制失败，请长按文本手动复制', 'error');
    }
  } catch {
    showToast('复制失败，请长按文本手动复制', 'error');
  }
}

function copyText(id) {
  const input = document.getElementById(id);
  if (!input) return;
  const text = input.value !== undefined ? input.value : input.innerText;
  copyStringToClipboard(text);
}

// ==========================================
// 优选节点生成测试与结果展示系统
// ==========================================
function showTestResultDialog(title, summary, content) {
  const dialog = document.getElementById('test-result-dialog');
  document.getElementById('test-result-title').innerText = title || '优选节点生成测试结果';
  document.getElementById('test-result-summary').innerText = summary || '';
  document.getElementById('test-result-content').innerText = content || '（未生成任何节点）';
  dialog.classList.add('active');
}

function closeTestResultDialog() {
  document.getElementById('test-result-dialog').classList.remove('active');
}

function copyTestResultContent() {
  const content = document.getElementById('test-result-content')?.innerText;
  copyStringToClipboard(content, '已成功复制全部生成节点到剪贴板！');
}

// 1. 在弹窗抽屉内测试当前编辑的模板节点与优选源
async function testModalCfNodes() {
  const baseVless = document.getElementById('form-cf-group-base').value.trim();
  const rawText = document.getElementById('global-sources-text').value.trim();
  const lines = rawText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsedSources = [];
  let counter = 1;

  for (const line of lines) {
    let srcName = '';
    let srcUrl = '';
    if (line.includes(',')) {
      const parts = line.split(',');
      srcName = parts[0].trim();
      srcUrl = parts.slice(1).join(',').trim();
    } else {
      srcUrl = line.trim();
    }
    if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
      parsedSources.push({
        id: 'test_src_' + counter,
        name: srcName || ('优选源 ' + counter),
        url: srcUrl,
        enabled: true
      });
      counter++;
    }
  }

  const btn = document.getElementById('btn-test-modal-nodes');
  const originalText = btn.innerText;
  btn.innerText = '⏳ 测试中...';
  btn.disabled = true;

  try {
    showToast('正在并发抓取优选源并生成节点...', 'info', 1800);
    const res = await fetch('/api/test-cf-nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseVless, sources: parsedSources })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const nodeCount = data.content ? data.content.split('\\n').filter(l => l.trim().length > 0).length : 0;
      showTestResultDialog(
        '🧪 优选节点测试结果 (实时生成)',
        '共成功实时生成 ' + nodeCount + ' 个优选节点，节点列表如下：',
        data.content
      );
    } else {
      showToast('测试失败: ' + (data.content || '节点格式错误或优选源拉取失败'), 'error', 4000);
    }
  } catch (err) {
    showToast('测试请求异常: ' + err.message, 'error');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// 2. 测试已有 CF 独立订阅组
async function testCfGroup(id) {
  const target = allCfGroupsData.find(g => g.id.toLowerCase() === String(id).toLowerCase());
  const name = target ? target.name : id;
  const baseVless = target ? (target.baseVless || '') : '';
  const sources = target && Array.isArray(target.sources) ? target.sources : [];

  showToast('正在测试【' + name + '】优选节点生成...', 'info', 1800);
  try {
    const res = await fetch('/api/test-cf-nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseVless, sources })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const nodeCount = data.content ? data.content.split('\\n').filter(l => l.trim().length > 0).length : 0;
      showTestResultDialog(
        '🧪【' + name + '】生成测试结果',
        '共成功实时生成 ' + nodeCount + ' 个优选节点，节点列表如下：',
        data.content
      );
    } else {
      showToast('测试失败: ' + (data.content || '节点格式错误'), 'error', 4000);
    }
  } catch (err) {
    showToast('测试请求异常: ' + err.message, 'error');
  }
}


// ==========================================
// 🛡️ IP 黑白名单与访问日志管理
// ==========================================

// 兜底空函数
function toggleBatchPanel() {}

// 校验 IPv4 / IPv6 / CIDR 格式
function isValidIPOrCIDR(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  const parts = s.split('/');
  if (parts.length > 2) return false;
  const ip = parts[0];
  const mask = parts[1];

  // 如果有网段掩码
  if (mask !== undefined) {
    const maskNum = parseInt(mask, 10);
    if (isNaN(maskNum) || String(maskNum) !== mask) return false;
    if (ip.includes(':')) {
      if (maskNum < 0 || maskNum > 128) return false;
    } else {
      if (maskNum < 0 || maskNum > 32) return false;
    }
  }

  // IPv4 单机校验
  if (ip.includes('.')) {
    const octets = ip.split('.');
    if (octets.length !== 4) return false;
    return octets.every(octet => {
      if (!/^[0-9]+$/.test(octet)) return false;
      const n = parseInt(octet, 10);
      return n >= 0 && n <= 255 && String(n) === octet;
    });
  }

  // IPv6 单机校验
  if (ip.includes(':')) {
    const segs = ip.split(':');
    if (segs.length < 3 || segs.length > 8) return false;
    return segs.every(seg => seg === '' || /^[0-9a-fA-F]{1,4}$/.test(seg));
  }

  return false;
}

// 解析输入框中的多个 IP/CIDR（支持回车、逗号、分号、空格）
function parseIPInputList(rawVal) {
  if (!rawVal) return [];
  const LF = String.fromCharCode(10);
  const CR = String.fromCharCode(13);
  return rawVal.split(LF)
    .flatMap(line => line.split(CR))
    .flatMap(line => line.split(','))
    .flatMap(line => line.split(';'))
    .flatMap(line => line.split(' '))
    .map(s => s.trim())
    .filter(Boolean);
}

// 快速添加 IP 到白名单（支持单个或多个，支持 CIDR）
async function quickAddWhitelistIP() {
  const input = document.getElementById('input-quick-add-whitelist');
  const rawVal = input?.value?.trim() || '';
  if (!rawVal) {
    showToast('请输入有效的 IP 或 CIDR 网段', 'warning');
    input?.focus();
    return;
  }

  // 支持以换行、逗号、分号或空格分隔多个输入
  const items = parseIPInputList(rawVal);
  if (items.length === 0) {
    showToast('请输入有效的 IP 或 CIDR 网段', 'warning');
    return;
  }

  // 格式校验
  const invalidItems = items.filter(item => !isValidIPOrCIDR(item));
  if (invalidItems.length > 0) {
    showToast('输入包含不合法的 IP/CIDR 地址: ' + invalidItems.slice(0, 3).join(', '), 'error');
    return;
  }

  // 检查是否已在白名单
  const newItems = items.filter(ip => !whitelistIPsData.includes(ip));
  if (newItems.length === 0) {
    showToast('所填 IP 已全部在白名单中，无需重复添加', 'info');
    return;
  }

  // 检查是否有与黑名单重叠的项
  const overlapWithBlacklist = newItems.filter(ip => blockedIPsData.includes(ip));

  const confirmed = await showConfirmDialog({
    title: '确认加入白名单',
    message: '确定要将 ' + newItems.length + ' 个 IP/网段加入白名单吗？' + 
      (overlapWithBlacklist.length > 0 ? '<br><small style="color:#d97706;">⚠️ 其中 ' + overlapWithBlacklist.length + ' 个项原在黑名单中，将自动解除黑名单拦截并转为信任放行。</small>' : ''),
    icon: '⭐',
    confirmText: '确认加入 (' + newItems.length + ')',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  try {
    const updatedWhitelist = Array.from(new Set([...whitelistIPsData, ...newItems]));
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: updatedWhitelist })
    });
    if (!res.ok) {
      showToast('加入白名单失败', 'error');
      return;
    }

    // 若有与黑名单冲突的项，同步从黑名单移出
    if (overlapWithBlacklist.length > 0) {
      const updatedBlacklist = blockedIPsData.filter(ip => !overlapWithBlacklist.includes(ip));
      await fetch('/api/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ips: updatedBlacklist })
      });
    }

    showToast('已成功添加 ' + newItems.length + ' 个 IP 到白名单！', 'success');
    if (input) input.value = '';
    setTimeout(() => {
      window.location.hash = '#ip-whitelist';
      location.reload();
    }, 600);
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 快速添加单个 IP 到白名单（来自日志等单条操作）
async function addWhitelistIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '确认加入白名单',
    message: '确定要将 IP [' + ip + '] 加入白名单吗？白名单 IP 将永久豁免拦截与登录失败封禁。',
    icon: '⭐',
    confirmText: '确认加入',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  const currentIPs = Array.from(new Set([...whitelistIPsData, ip.trim()]));
  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      // 若原在黑名单中，顺带移出
      if (blockedIPsData.includes(ip.trim())) {
        const updatedBlacklist = blockedIPsData.filter(item => item !== ip.trim());
        await fetch('/api/blocked-ips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ips: updatedBlacklist })
        });
      }
      showToast('已成功将 IP: ' + ip + ' 加入白名单', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('加入白名单失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 快速从白名单移除单个 IP
async function removeWhitelistIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '确认移除白名单',
    message: '确定要从白名单中移除 IP [' + ip + '] 吗？',
    icon: '⚠️',
    confirmText: '确认移除',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  const currentIPs = whitelistIPsData.filter(item => item !== ip.trim());
  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('已成功从白名单移除 IP: ' + ip, 'success');
      setTimeout(() => {
        window.location.hash = '#ip-whitelist';
        location.reload();
      }, 600);
    } else {
      showToast('移除白名单失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 清空所有白名单 IP
async function clearAllWhitelistIPs() {
  if (!whitelistIPsData || whitelistIPsData.length === 0) {
    showToast('当前白名单列表已为空', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '清空所有白名单',
    message: '确定要清空所有白名单（共 ' + whitelistIPsData.length + ' 项）吗？清空后所有之前放行的 IP 将恢复常规安全检测。',
    icon: '🗑️',
    confirmText: '确认清空 (' + whitelistIPsData.length + ')',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: [] })
    });
    if (res.ok) {
      showToast('已成功清空所有白名单 IP', 'success');
      setTimeout(() => {
        window.location.hash = '#ip-whitelist';
        location.reload();
      }, 600);
    } else {
      showToast('清空白名单失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 从白名单一键转移到黑名单
async function moveWhitelistToBlacklist(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '移入黑名单',
    message: '确定要将 IP [' + ip + '] 从白名单移除并立即加入黑名单进行阻断拦截吗？',
    icon: '🚫',
    confirmText: '确认移入黑名单',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  try {
    // 1. 从白名单移除
    const updatedWhitelist = whitelistIPsData.filter(item => item !== ip.trim());
    await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: updatedWhitelist })
    });

    // 2. 加入黑名单
    const updatedBlacklist = Array.from(new Set([...blockedIPsData, ip.trim()]));
    await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: updatedBlacklist })
    });

    showToast('IP [' + ip + '] 已成功转入黑名单并阻断！', 'success');
    setTimeout(() => {
      window.location.hash = '#ip-whitelist';
      location.reload();
    }, 600);
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 快速屏蔽单个或多个 IP / CIDR 网段
async function quickAddBlockedIP() {
  const input = document.getElementById('input-quick-add-blacklist');
  const rawVal = input?.value?.trim() || '';
  if (!rawVal) {
    showToast('请输入有效的 IP 或 CIDR 网段', 'warning');
    input?.focus();
    return;
  }

  const items = parseIPInputList(rawVal);
  if (items.length === 0) {
    showToast('请输入有效的 IP 或 CIDR 网段', 'warning');
    return;
  }

  // 格式校验
  const invalidItems = items.filter(item => !isValidIPOrCIDR(item));
  if (invalidItems.length > 0) {
    showToast('输入包含不合法的 IP/CIDR 地址: ' + invalidItems.slice(0, 3).join(', '), 'error');
    return;
  }

  // 防自锁安全保护：禁止将回环地址加入黑名单
  const loopbackDetected = items.find(ip => ip.startsWith('127.') || ip === '::1' || ip === 'localhost');
  if (loopbackDetected) {
    showToast('安全保护：禁止将本地回环地址 (' + loopbackDetected + ') 加入黑名单！', 'error');
    return;
  }

  // 检查是否已在黑名单
  const newItems = items.filter(ip => !blockedIPsData.includes(ip));
  if (newItems.length === 0) {
    showToast('所填 IP 已全部在黑名单中，无需重复屏蔽', 'info');
    return;
  }

  // 检查是否有与白名单重叠的项
  const overlapWithWhitelist = newItems.filter(ip => whitelistIPsData.includes(ip));

  const confirmed = await showConfirmDialog({
    title: '确认屏蔽 IP',
    message: '确定要将 ' + newItems.length + ' 个 IP/网段列入黑名单吗？被列入后将直接返回 403 阻断访问。' + 
      (overlapWithWhitelist.length > 0 ? '<br><small style="color:#ef4444;">⚠️ 其中 ' + overlapWithWhitelist.length + ' 个项原在白名单中，将自动从白名单移除并生效封禁。</small>' : ''),
    icon: '🚫',
    confirmText: '确认屏蔽 (' + newItems.length + ')',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  try {
    const updatedBlacklist = Array.from(new Set([...blockedIPsData, ...newItems]));
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: updatedBlacklist })
    });
    if (!res.ok) {
      showToast('屏蔽 IP 失败', 'error');
      return;
    }

    // 若有与白名单冲突的项，同步从白名单移出
    if (overlapWithWhitelist.length > 0) {
      const updatedWhitelist = whitelistIPsData.filter(ip => !overlapWithWhitelist.includes(ip));
      await fetch('/api/whitelist-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ips: updatedWhitelist })
      });
    }

    showToast('已成功屏蔽 ' + newItems.length + ' 个 IP！', 'success');
    if (input) input.value = '';
    setTimeout(() => {
      window.location.hash = '#ip-blacklist';
      location.reload();
    }, 600);
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 快速屏蔽单个 IP（来自日志或外部调用）
async function blockIP(ip) {
  if (!ip) return;
  if (ip.startsWith('127.') || ip === '::1' || ip === 'localhost') {
    showToast('安全保护：禁止将本地回环地址加入黑名单！', 'error');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '确认屏蔽 IP',
    message: '确定要将 IP [' + ip + '] 加入黑名单并阻止其访问任何订阅和后台吗？',
    icon: '🚫',
    confirmText: '确认屏蔽',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  const currentIPs = Array.from(new Set([...blockedIPsData, ip.trim()]));
  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      // 若原在白名单中，同步移出
      if (whitelistIPsData.includes(ip.trim())) {
        const updatedWhitelist = whitelistIPsData.filter(item => item !== ip.trim());
        await fetch('/api/whitelist-ips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ips: updatedWhitelist })
        });
      }
      showToast('已成功屏蔽 IP: ' + ip, 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('屏蔽 IP 失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 快速解封单个 IP
async function unblockIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '确认解封 IP',
    message: '确定要解除对 IP [' + ip + '] 的访问拦截吗？',
    icon: '🟢',
    confirmText: '确认解封',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  const currentIPs = blockedIPsData.filter(item => item !== ip.trim());
  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('已成功解封 IP: ' + ip, 'success');
      setTimeout(() => {
        window.location.hash = '#ip-blacklist';
        location.reload();
      }, 600);
    } else {
      showToast('解封 IP 失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 清空所有黑名单 IP
async function clearAllBlockedIPs() {
  if (!blockedIPsData || blockedIPsData.length === 0) {
    showToast('当前黑名单列表已为空', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '清空所有黑名单',
    message: '确定要清空所有黑名单（共 ' + blockedIPsData.length + ' 项）吗？清空后所有被屏蔽的 IP 将立即解封并允许正常访问。',
    icon: '🗑️',
    confirmText: '确认全部解封 (' + blockedIPsData.length + ')',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: [] })
    });
    if (res.ok) {
      showToast('已清空所有黑名单 IP，全部解封成功', 'success');
      setTimeout(() => {
        window.location.hash = '#ip-blacklist';
        location.reload();
      }, 600);
    } else {
      showToast('清空黑名单失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 从黑名单一键转移到白名单
async function moveBlacklistToWhitelist(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '解除阻断并加白',
    message: '确定要解除对 IP [' + ip + '] 的拦截并将其加入信任白名单吗？',
    icon: '⭐',
    confirmText: '确认加白放行',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  try {
    // 1. 从黑名单移除
    const updatedBlacklist = blockedIPsData.filter(item => item !== ip.trim());
    await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: updatedBlacklist })
    });

    // 2. 加入白名单
    const updatedWhitelist = Array.from(new Set([...whitelistIPsData, ip.trim()]));
    await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: updatedWhitelist })
    });

    showToast('IP [' + ip + '] 已解除拦截并加入白名单！', 'success');
    setTimeout(() => {
      window.location.hash = '#ip-blacklist';
      location.reload();
    }, 600);
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 筛选白名单表格
function applyWhitelistFilter() {
  const input = document.getElementById('filter-whitelist-keyword');
  const clearBtn = document.getElementById('whitelist-keyword-clear');
  const query = (input?.value || '').toLowerCase().trim();
  if (clearBtn) clearBtn.style.display = query ? 'inline-block' : 'none';

  const paginator = window._paginators ? window._paginators['whitelist-table-row'] : null;
  const statsEl = document.getElementById('whitelist-filter-stats');

  if (paginator) {
    paginator.setFilter(row => {
      const ip = (row.dataset.ip || '').toLowerCase();
      return !query || ip.includes(query);
    });
    const allCount = paginator.getAllRows().length;
    const matchedCount = paginator.getRows().length;
    if (statsEl) {
      if (query) {
        statsEl.innerHTML = '已筛选出 <strong>' + matchedCount + '</strong> / 共 <strong>' + allCount + '</strong> 个 IP';
      } else {
        statsEl.innerHTML = '显示 <strong>' + matchedCount + '</strong> / 共 <strong>' + allCount + '</strong> 个 IP';
      }
    }
  } else {
    const rows = document.querySelectorAll('.whitelist-table-row');
    let matchCount = 0;
    rows.forEach(row => {
      const ip = (row.dataset.ip || '').toLowerCase();
      const isMatch = !query || ip.includes(query);
      row.style.display = isMatch ? '' : 'none';
      if (isMatch) matchCount++;
    });
    if (statsEl) {
      statsEl.innerHTML = '显示 <strong>' + matchCount + '</strong> / 共 <strong>' + rows.length + '</strong> 个 IP';
    }
    const emptyRow = document.getElementById('whitelist-table-empty-filter-row');
    if (emptyRow) {
      emptyRow.style.display = (matchCount === 0 && rows.length > 0) ? '' : 'none';
    }
    updateBatchSelection('whitelist');
  }
}

function clearWhitelistKeyword() {
  const input = document.getElementById('filter-whitelist-keyword');
  if (input) input.value = '';
  applyWhitelistFilter();
}

// 筛选黑名单表格
function applyBlacklistFilter() {
  const input = document.getElementById('filter-blacklist-keyword');
  const clearBtn = document.getElementById('blacklist-keyword-clear');
  const query = (input?.value || '').toLowerCase().trim();
  if (clearBtn) clearBtn.style.display = query ? 'inline-block' : 'none';

  const paginator = window._paginators ? window._paginators['blacklist-table-row'] : null;
  const statsEl = document.getElementById('blacklist-filter-stats');

  if (paginator) {
    paginator.setFilter(row => {
      const ip = (row.dataset.ip || '').toLowerCase();
      return !query || ip.includes(query);
    });
    const allCount = paginator.getAllRows().length;
    const matchedCount = paginator.getRows().length;
    if (statsEl) {
      if (query) {
        statsEl.innerHTML = '已筛选出 <strong>' + matchedCount + '</strong> / 共 <strong>' + allCount + '</strong> 个 IP';
      } else {
        statsEl.innerHTML = '显示 <strong>' + matchedCount + '</strong> / 共 <strong>' + allCount + '</strong> 个 IP';
      }
    }
  } else {
    const rows = document.querySelectorAll('.blacklist-table-row');
    let matchCount = 0;
    rows.forEach(row => {
      const ip = (row.dataset.ip || '').toLowerCase();
      const isMatch = !query || ip.includes(query);
      row.style.display = isMatch ? '' : 'none';
      if (isMatch) matchCount++;
    });
    if (statsEl) {
      statsEl.innerHTML = '显示 <strong>' + matchCount + '</strong> / 共 <strong>' + rows.length + '</strong> 个 IP';
    }
    const emptyRow = document.getElementById('blacklist-table-empty-filter-row');
    if (emptyRow) {
      emptyRow.style.display = (matchCount === 0 && rows.length > 0) ? '' : 'none';
    }
    updateBatchSelection('blacklist');
  }
}

function clearBlacklistKeyword() {
  const input = document.getElementById('filter-blacklist-keyword');
  if (input) input.value = '';
  applyBlacklistFilter();
}

// 批量编辑文本格式化去重
function formatAndDeduplicateWhitelist() {
  const textarea = document.getElementById('textarea-whitelist-ips');
  if (!textarea) return;
  const lines = textarea.value.replace(/\\r\\n|\\r/g, '\\n').split('\\n').map(l => l.trim()).filter(Boolean);
  const unique = Array.from(new Set(lines));
  textarea.value = unique.join('\\n');
  showToast('已格式化并去重，当前共 ' + unique.length + ' 个独立条目', 'info');
}

function formatAndDeduplicateBlacklist() {
  const textarea = document.getElementById('textarea-blocked-ips');
  if (!textarea) return;
  const lines = textarea.value.replace(/\\r\\n|\\r/g, '\\n').split('\\n').map(l => l.trim()).filter(Boolean);
  const unique = Array.from(new Set(lines));
  textarea.value = unique.join('\\n');
  showToast('已格式化并去重，当前共 ' + unique.length + ' 个独立条目', 'info');
}

// ==========================================
// 🗑️ 表格通用批量选择与批量删除管理
// ==========================================
function updateBatchSelection(type) {
  const allCheckboxes = Array.from(document.querySelectorAll('.' + type + '-row-checkbox'));
  const checkedBoxes = allCheckboxes.filter(cb => cb.checked);
  const selectedCount = checkedBoxes.length;
  
  const countEl = document.getElementById(type + '-selected-count');
  if (countEl) countEl.innerText = selectedCount;

  const toolbar = document.getElementById(type + '-batch-toolbar');
  if (toolbar) {
    if (selectedCount > 0) {
      toolbar.classList.add('active');
    } else {
      toolbar.classList.remove('active');
    }
  }

  // 仅针对当前页可见行判断表头选中状态
  const visibleCheckboxes = allCheckboxes.filter(cb => {
    const row = cb.closest('.' + type + '-table-row') || cb.closest('tr');
    return row && row.style.display !== 'none';
  });
  const visibleSelectedCount = visibleCheckboxes.filter(cb => cb.checked).length;

  const checkAll = document.getElementById(type + '-check-all');
  if (checkAll) {
    checkAll.checked = (visibleCheckboxes.length > 0 && visibleSelectedCount === visibleCheckboxes.length);
    checkAll.indeterminate = (visibleSelectedCount > 0 && visibleSelectedCount < visibleCheckboxes.length);
  }
}

function toggleAllCheckboxes(type, checked) {
  const allCheckboxes = Array.from(document.querySelectorAll('.' + type + '-row-checkbox'));
  // 仅勾选/取消勾选当前页可见行
  const visibleCheckboxes = allCheckboxes.filter(cb => {
    const row = cb.closest('.' + type + '-table-row') || cb.closest('tr');
    return row && row.style.display !== 'none';
  });
  visibleCheckboxes.forEach(cb => {
    cb.checked = checked;
  });
  updateBatchSelection(type);
}

function clearBatchSelection(type) {
  const checkAll = document.getElementById(type + '-check-all');
  if (checkAll) {
    checkAll.checked = false;
    checkAll.indeterminate = false;
  }
  const checkboxes = document.querySelectorAll('.' + type + '-row-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = false;
  });
  updateBatchSelection(type);
}

// 1. 普通订阅批量删除
async function batchDeletePlainGroups() {
  const checkedBoxes = Array.from(document.querySelectorAll('.plain-row-checkbox:checked'));
  const idsToDelete = checkedBoxes.map(cb => cb.value);
  if (idsToDelete.length === 0) {
    showToast('请先勾选需要删除的普通订阅！', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '批量删除普通订阅',
    message: '确定要批量删除选中的 ' + idsToDelete.length + ' 个普通订阅吗？删除后相关客户端将无法继续拉取节点！',
    icon: '🗑️',
    confirmText: '确认批量删除 (' + idsToDelete.length + ')',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await fetch('/api/custom-groups/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idsToDelete })
    });
    if (res.ok) {
      showToast('已成功批量删除 ' + idsToDelete.length + ' 个普通订阅！', 'success');
      setTimeout(() => {
        window.location.hash = '#custom-sub';
        location.reload();
      }, 600);
    } else if (res.status === 401) {
      showToast('登录会话已超时，请重新登录！', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      showToast('批量删除失败，请稍后重试', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 2. CF 优选订阅批量删除
async function batchDeleteCfGroups() {
  const checkedBoxes = Array.from(document.querySelectorAll('.cf-row-checkbox:checked'));
  const idsToDelete = checkedBoxes.map(cb => cb.value);
  if (idsToDelete.length === 0) {
    showToast('请先勾选需要删除的 CF 优选订阅！', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '批量删除 CF 优选订阅',
    message: '确定要批量删除选中的 ' + idsToDelete.length + ' 个 CF 优选订阅吗？删除后相关客户端将无法获取优选节点！',
    icon: '🗑️',
    confirmText: '确认批量删除 (' + idsToDelete.length + ')',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await fetch('/api/cf-groups/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idsToDelete })
    });
    if (res.ok) {
      showToast('已成功批量删除 ' + idsToDelete.length + ' 个 CF 优选订阅！', 'success');
      setTimeout(() => {
        window.location.hash = '#cf-sub';
        location.reload();
      }, 600);
    } else if (res.status === 401) {
      showToast('登录会话已超时，请重新登录！', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      showToast('批量删除失败，请稍后重试', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 白名单批量移除
async function batchDeleteWhitelistIPs() {
  const checkedBoxes = Array.from(document.querySelectorAll('.whitelist-row-checkbox:checked'));
  const ipsToDelete = checkedBoxes.map(cb => cb.value.trim()).filter(Boolean);
  if (ipsToDelete.length === 0) {
    showToast('请先勾选需要移出白名单的 IP！', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '批量移除 IP 白名单',
    message: '确定要批量将选中的 ' + ipsToDelete.length + ' 个 IP 从白名单中移除吗？',
    icon: '⚠️',
    confirmText: '确认批量移除 (' + ipsToDelete.length + ')',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  const currentIPs = whitelistIPsData.filter(ip => !ipsToDelete.includes(ip));
  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('已成功移除选中的 ' + ipsToDelete.length + ' 个白名单 IP', 'success');
      setTimeout(() => {
        window.location.hash = '#ip-whitelist';
        location.reload();
      }, 600);
    } else {
      showToast('批量移除白名单失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 黑名单批量解封
async function batchDeleteBlacklistIPs() {
  const checkedBoxes = Array.from(document.querySelectorAll('.blacklist-row-checkbox:checked'));
  const ipsToDelete = checkedBoxes.map(cb => cb.value.trim()).filter(Boolean);
  if (ipsToDelete.length === 0) {
    showToast('请先勾选需要解除拦截的黑名单 IP！', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '批量解除 IP 拦截',
    message: '确定要批量解封选中的 ' + ipsToDelete.length + ' 个 IP 吗？',
    icon: '🟢',
    confirmText: '确认批量解除 (' + ipsToDelete.length + ')',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  const currentIPs = blockedIPsData.filter(ip => !ipsToDelete.includes(ip));
  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('已成功解除选中的 ' + ipsToDelete.length + ' 个 IP 拦截', 'success');
      setTimeout(() => {
        window.location.hash = '#ip-blacklist';
        location.reload();
      }, 600);
    } else {
      showToast('批量解封黑名单失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}
const batchDeleteBlockedIPs = batchDeleteBlacklistIPs;

// 3. 访问日志批量删除
async function batchDeleteLogs() {
  const checkedBoxes = Array.from(document.querySelectorAll('.logs-row-checkbox:checked'));
  const indicesToDelete = checkedBoxes.map(cb => parseInt(cb.value, 10)).filter(n => !isNaN(n));
  if (indicesToDelete.length === 0) {
    showToast('请先勾选需要删除的访问日志记录！', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '批量删除访问日志',
    message: '确定要批量删除选中的 ' + indicesToDelete.length + ' 条访问日志记录吗？删除后不可恢复。',
    icon: '🗑️',
    confirmText: '确认批量删除 (' + indicesToDelete.length + ')',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await fetch('/api/logs/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indices: indicesToDelete })
    });
    if (res.ok) {
      showToast('已成功批量删除 ' + indicesToDelete.length + ' 条访问日志！', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('批量删除日志失败，请稍后重试', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// 清空所有访问日志
async function clearAllLogs() {
  const confirmed = await showConfirmDialog({
    title: '清空访问日志',
    message: '确定要清空全部客户端访问历史记录吗？清空后不可恢复。',
    icon: '🗑️',
    confirmText: '清空日志',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/clear-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      showToast('已清空所有访问日志', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('清空日志失败', 'error');
    }
  } catch (err) {
    showToast('请求异常: ' + err.message, 'error');
  }
}

// ==========================================
// 📄 通用前端零依赖自适应表格翻页系统 (支持动态条件筛选)
// ==========================================
class TablePaginator {
  constructor(tableId, rowClass, paginationId, defaultPageSize = 10, type = '') {
    this.tableBody = document.getElementById(tableId);
    this.rowClass = rowClass;
    this.paginationContainer = document.getElementById(paginationId);
    this.pageSize = defaultPageSize;
    this.currentPage = 1;
    this.filterFn = null;
    this.type = type || (rowClass ? rowClass.replace(/-table-row$/, '') : '');
    this.init();
  }

  getAllRows() {
    return Array.from(document.querySelectorAll('.' + this.rowClass));
  }

  getRows() {
    const all = this.getAllRows();
    if (typeof this.filterFn === 'function') {
      return all.filter(this.filterFn);
    }
    return all;
  }

  setFilter(fn) {
    this.filterFn = typeof fn === 'function' ? fn : null;
    this.currentPage = 1;
    this.render();
  }

  init() {
    if (!this.tableBody || !this.paginationContainer) return;
    this.render();
  }

  setPage(page) {
    const rows = this.getRows();
    const totalPages = Math.ceil(rows.length / this.pageSize) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;
    this.render();
    if (this.tableBody) {
      const container = this.tableBody.closest('.table-container') || this.tableBody.closest('.section-card');
      if (container && typeof container.scrollIntoView === 'function') {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  setPageSize(size) {
    this.pageSize = parseInt(size, 10) || 10;
    this.currentPage = 1;
    this.render();
  }

  render() {
    const allRows = this.getAllRows();
    const matchedRows = this.getRows();
    const total = matchedRows.length;
    const emptyFilterRow = document.getElementById(this.rowClass.replace('-row', '-empty-filter-row'));

    if (total <= 0) {
      allRows.forEach(r => r.style.display = 'none');
      this.paginationContainer.style.display = 'none';
      if (emptyFilterRow) {
        if (allRows.length > 0) {
          emptyFilterRow.style.display = '';
        }
      }
      if (this.type && typeof updateBatchSelection === 'function') {
        updateBatchSelection(this.type);
      }
      return;
    }

    if (emptyFilterRow) {
      emptyFilterRow.style.display = 'none';
    }

    // 隐藏不满足筛选条件的行
    allRows.forEach(row => {
      if (!matchedRows.includes(row)) {
        row.style.display = 'none';
      }
    });

    this.paginationContainer.style.display = 'flex';

    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    // 分页显示当前匹配行
    matchedRows.forEach((row, index) => {
      if (index >= start && index < end) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // 翻页或筛选后更新全选状态
    if (this.type && typeof updateBatchSelection === 'function') {
      updateBatchSelection(this.type);
    }

    const displayStart = start + 1;
    const displayEnd = Math.min(total, end);

    // 渲染分页按钮
    let pageButtonsHtml = '';
    const maxButtons = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      pageButtonsHtml += '<button class="pagination-btn ' + (p === this.currentPage ? 'active' : '') + '" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + p + ')">' + p + '</button>';
    }

    const selectOptions = [5, 10, 20, 50, 100].map(s => {
      return '<option value="' + s + '" ' + (this.pageSize === s ? 'selected' : '') + '>' + s + ' 条/页</option>';
    }).join('');

    this.paginationContainer.innerHTML = 
      '<div class="pagination-info">' +
        '<span>显示 <strong>' + displayStart + '-' + displayEnd + '</strong> / 共 <strong>' + total + '</strong> 条</span>' +
        '<select class="pagination-select" onchange="window.changeTablePageSize(\\'' + this.rowClass + '\\', this.value)">' +
          selectOptions +
        '</select>' +
      '</div>' +
      '<div class="pagination-controls">' +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', 1)" ' + (this.currentPage <= 1 ? 'disabled' : '') + ' title="首页">⏮️</button>' +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + (this.currentPage - 1) + ')" ' + (this.currentPage <= 1 ? 'disabled' : '') + ' title="上一页">◀</button>' +
        pageButtonsHtml +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + (this.currentPage + 1) + ')" ' + (this.currentPage >= totalPages ? 'disabled' : '') + ' title="下一页">▶</button>' +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + totalPages + ')" ' + (this.currentPage >= totalPages ? 'disabled' : '') + ' title="末页">⏭️</button>' +
      '</div>';
  }
}

window._paginators = {};
window.changeTablePage = function(rowClass, page) {
  if (window._paginators[rowClass]) {
    window._paginators[rowClass].setPage(page);
  }
};
window.changeTablePageSize = function(rowClass, size) {
  if (window._paginators[rowClass]) {
    window._paginators[rowClass].setPageSize(size);
  }
};

// ==========================================
// 🔍 日志表格多条件过滤逻辑
// ==========================================
function applyLogsFilter() {
  const keywordInput = document.getElementById('logs-filter-keyword');
  const clearBtn = document.getElementById('logs-keyword-clear');
  const statusSelect = document.getElementById('logs-filter-status');
  const typeSelect = document.getElementById('logs-filter-type');
  const ipTypeSelect = document.getElementById('logs-filter-ip-type');
  const statsEl = document.getElementById('logs-filter-stats');

  const keyword = (keywordInput ? keywordInput.value.trim().toLowerCase() : '');
  if (clearBtn) {
    clearBtn.style.display = keyword ? 'block' : 'none';
  }

  const status = statusSelect ? statusSelect.value : '';
  const typeVal = typeSelect ? typeSelect.value : '';
  const ipTypeVal = ipTypeSelect ? ipTypeSelect.value : '';

  const paginator = window._paginators ? window._paginators['logs-table-row'] : null;

  const filterFn = function(row) {
    const ip = (row.dataset.ip || '').toLowerCase();
    const location = (row.dataset.location || '').toLowerCase();
    const rowStatus = String(row.dataset.status || '');
    const path = (row.dataset.path || '').toLowerCase();
    const rowType = (row.dataset.type || '').toLowerCase();
    const ua = (row.dataset.ua || '').toLowerCase();
    const isWhite = row.dataset.whitelisted === '1';
    const isBlock = row.dataset.blocked === '1';

    // 1. 状态码过滤
    if (status && rowStatus !== status) {
      return false;
    }

    // 2. IP 类别过滤
    if (ipTypeVal === 'whitelist' && !isWhite) return false;
    if (ipTypeVal === 'blocked' && !isBlock) return false;
    if (ipTypeVal === 'normal' && (isWhite || isBlock)) return false;

    // 3. 请求类型过滤
    if (typeVal) {
      if (typeVal === 'sub') {
        if (!rowType.includes('订阅') && !path.includes('/sub')) return false;
      } else if (typeVal === 'ban') {
        if (!rowType.includes('拦截') && !rowType.includes('封禁') && rowStatus !== '403') return false;
      } else if (typeVal === 'login_fail') {
        if (!rowType.includes('密码') && !rowType.includes('验证码') && !rowType.includes('登录')) return false;
      } else if (typeVal === 'probe') {
        if (!rowType.includes('探测') && !rowType.includes('蜜罐') && !rowType.includes('waf')) return false;
      } else if (typeVal === 'not_found') {
        if (!rowType.includes('不存在') && rowStatus !== '404') return false;
      }
    }

    // 4. 关键词模糊检索 (匹配 IP、地理位置、路径、类型说明、User-Agent、状态)
    if (keyword) {
      const matchIp = ip.includes(keyword);
      const matchLoc = location.includes(keyword);
      const matchPath = path.includes(keyword);
      const matchType = rowType.includes(keyword);
      const matchUa = ua.includes(keyword);
      const matchStatus = rowStatus.includes(keyword);
      if (!matchIp && !matchLoc && !matchPath && !matchType && !matchUa && !matchStatus) {
        return false;
      }
    }

    return true;
  };

  if (paginator) {
    paginator.setFilter(filterFn);
    const allCount = paginator.getAllRows().length;
    const matchedCount = paginator.getRows().length;
    if (statsEl) {
      if (keyword || status || typeVal || ipTypeVal) {
        statsEl.innerHTML = '已筛选出 <strong>' + matchedCount + '</strong> / 共 <strong>' + allCount + '</strong> 条记录';
      } else {
        statsEl.innerHTML = '显示 <strong>' + matchedCount + '</strong> / 共 <strong>' + allCount + '</strong> 条记录';
      }
    }
  }
}

function clearLogsKeyword() {
  const kw = document.getElementById('logs-filter-keyword');
  if (kw) kw.value = '';
  applyLogsFilter();
}

function resetLogsFilter() {
  const kw = document.getElementById('logs-filter-keyword');
  const st = document.getElementById('logs-filter-status');
  const tp = document.getElementById('logs-filter-type');
  const ipt = document.getElementById('logs-filter-ip-type');
  if (kw) kw.value = '';
  if (st) st.value = '';
  if (tp) tp.value = '';
  if (ipt) ipt.value = '';
  applyLogsFilter();
}

// ==========================================
// ⏱️ 会话有效期 (10分钟) 与活跃自动续期机制
// ==========================================
let sessionRemainingSeconds = 10 * 60; // 10 分钟 = 600 秒
let sessionCountdownInterval = null;

function updateSessionCountdownDisplay() {
  const textEl = document.getElementById('session-countdown-text');
  const badgeEl = document.getElementById('session-countdown-badge');
  if (!textEl) return;

  if (sessionRemainingSeconds <= 0) {
    textEl.innerText = '已超时';
    if (badgeEl) {
      badgeEl.style.color = '#dc2626';
      badgeEl.style.background = 'rgba(220, 38, 38, 0.1)';
      badgeEl.style.borderColor = 'rgba(220, 38, 38, 0.25)';
    }
    clearInterval(sessionCountdownInterval);
    showToast('登录会话已超时 (10分钟无操作)，正在返回登录页...', 'error', 3000);
    setTimeout(() => {
      location.href = '/login';
    }, 1500);
    return;
  }

  const mins = Math.floor(sessionRemainingSeconds / 60);
  const secs = sessionRemainingSeconds % 60;
  textEl.innerText = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

  if (sessionRemainingSeconds <= 120) {
    // 剩余最后 2 分钟标黄提醒
    if (badgeEl) {
      badgeEl.style.color = '#d97706';
      badgeEl.style.background = 'rgba(217, 119, 6, 0.1)';
      badgeEl.style.borderColor = 'rgba(217, 119, 6, 0.25)';
    }
  } else {
    if (badgeEl) {
      badgeEl.style.color = '#0284c7';
      badgeEl.style.background = 'rgba(2, 132, 199, 0.1)';
      badgeEl.style.borderColor = 'rgba(2, 132, 199, 0.25)';
    }
  }
}

// 业务操作响应后自动重置 10 分钟倒计时
function resetSessionCountdown() {
  sessionRemainingSeconds = 10 * 60;
  updateSessionCountdownDisplay();
}

function initSessionActivityTracker() {
  updateSessionCountdownDisplay();
  
  if (sessionCountdownInterval) clearInterval(sessionCountdownInterval);
  sessionCountdownInterval = setInterval(() => {
    sessionRemainingSeconds--;
    updateSessionCountdownDisplay();
  }, 1000);
}

function initAllTablePaginators() {
  window._paginators['plain-table-row'] = new TablePaginator('plain-table-body', 'plain-table-row', 'plain-table-pagination', 10, 'plain');
  window._paginators['cf-table-row'] = new TablePaginator('cf-table-body', 'cf-table-row', 'cf-table-pagination', 10, 'cf');
  window._paginators['logs-table-row'] = new TablePaginator('logs-table-body', 'logs-table-row', 'logs-table-pagination', 10, 'logs');
  window._paginators['whitelist-table-row'] = new TablePaginator('whitelist-table-body', 'whitelist-table-row', 'whitelist-table-pagination', 10, 'whitelist');
  window._paginators['blacklist-table-row'] = new TablePaginator('blacklist-table-body', 'blacklist-table-row', 'blacklist-table-pagination', 10, 'blacklist');
}

// 页面加载完成后立即初始化所有表格分页器与会话保活机制
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAllTablePaginators();
    initSessionActivityTracker();
  });
} else {
  initAllTablePaginators();
  initSessionActivityTracker();
}

// 退出登录二次确认弹框
async function handleLogout() {
  const confirmed = await showConfirmDialog({
    title: '退出登录',
    message: '确定要退出订阅控制台吗？退出后需重新输入管理员密码才能登录。',
    icon: '🚪',
    confirmText: '确认退出',
    confirmType: 'danger'
  });
  if (confirmed) {
    window.location.href = '/logout';
  }
}
`;
