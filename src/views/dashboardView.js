import { dashboardStyles } from './styles.js';
import { dashboardScripts } from './scripts.js';
import { renderPlainSubTab } from './plainSubView.js';
import { renderCfSubTab } from './cfSubView.js';
import { renderLogsTab } from './logsView.js';
import { renderWhitelistTab } from './whitelistView.js';
import { renderBlacklistTab } from './blacklistView.js';
import { renderSecurityConfigTab, renderTgConfigTab } from './globalConfigView.js';

// 渲染管理后台主页面 HTML
export function renderDashboardPage(origin, subToken, sources, plainGroups = [], cfGroups = [], logs = [], blockedIPs = [], whitelistIPs = [], allowedCountries = [], proxyClientOnly = true, tgConfig = {}) {

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="cloudflare-insights-beacon" content="false">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <title>控制台 - CF Workers 节点与订阅管理</title>
  <script>
    // 拦截并阻断 Cloudflare 边缘自动注入的 beacon 性能探针脚本，防止报错
    (function() {
      // 1. 彻底拦截动态插入的 Cloudflare beacon / insights 脚本
      const isBeacon = (node) => node && node.tagName === 'SCRIPT' && (
        (node.src && (node.src.includes('cloudflareinsights.com') || node.src.includes('beacon.min.js'))) ||
        node.hasAttribute('data-cf-beacon')
      );
      const originalAppendChild = Node.prototype.appendChild;
      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.appendChild = function(child) {
        if (isBeacon(child)) return child;
        return originalAppendChild.apply(this, arguments);
      };
      Node.prototype.insertBefore = function(newNode, referenceNode) {
        if (isBeacon(newNode)) return newNode;
        return originalInsertBefore.apply(this, arguments);
      };

      // 2. 增强 performance API 容错保护，防止第三方脚本或 DevTools 读取 startTime 时报空指针
      if (typeof window !== 'undefined' && window.performance) {
        const dummyEntry = {
          name: location.href,
          entryType: 'navigation',
          startTime: 0,
          duration: 0,
          responseStart: 0,
          responseEnd: 0,
          domInteractive: 0,
          domContentLoadedEventStart: 0,
          domContentLoadedEventEnd: 0,
          domComplete: 0,
          loadEventStart: 0,
          loadEventEnd: 0
        };
        if (typeof window.performance.getEntriesByType === 'function') {
          const rawGetEntries = window.performance.getEntriesByType.bind(window.performance);
          window.performance.getEntriesByType = function(type) {
            try {
              const res = rawGetEntries(type);
              if (Array.isArray(res) && res.length > 0) return res;
              return [{ ...dummyEntry, entryType: type }];
            } catch {
              return [{ ...dummyEntry, entryType: type }];
            }
          };
        }
        if (typeof window.performance.getEntriesByName === 'function') {
          const rawGetByName = window.performance.getEntriesByName.bind(window.performance);
          window.performance.getEntriesByName = function(name, type) {
            try {
              const res = rawGetByName(name, type);
              if (Array.isArray(res) && res.length > 0) return res;
              return [{ ...dummyEntry, name: name, entryType: type || 'resource' }];
            } catch {
              return [{ ...dummyEntry, name: name, entryType: type || 'resource' }];
            }
          };
        }
      }
    })();
  </script>
  <style>
    ${dashboardStyles}
  </style>
</head>
<body>
  <!-- 移动端侧边栏遮罩背景 -->
  <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>

  <!-- 左侧导航菜单 (PC侧边栏 / 移动端滑出抽屉) -->
  <aside class="sidebar" id="app-sidebar">
    <div class="sidebar-header">
      <h2>⚡ 订阅控制台</h2>
      <button class="sidebar-close-btn" onclick="toggleMobileSidebar(false)" aria-label="关闭菜单">&times;</button>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-title">业务功能</div>
      <a class="nav-item active" id="nav-item-custom-sub" onclick="switchTab('custom-sub')">
        <span class="nav-icon">📦</span>
        <span>普通订阅</span>
      </a>
      <a class="nav-item" id="nav-item-cf-sub" onclick="switchTab('cf-sub')">
        <span class="nav-icon">⚡</span>
        <span>CF 优选订阅</span>
      </a>
      <a class="nav-item" id="nav-item-access-logs" onclick="switchTab('access-logs')">
        <span class="nav-icon">📊</span>
        <span>访问日志</span>
      </a>

      <div class="nav-section-divider"></div>

      <div class="nav-section-title">安全管控</div>
      <a class="nav-item" id="nav-item-ip-whitelist" onclick="switchTab('ip-whitelist')">
        <span class="nav-icon">✨</span>
        <span style="flex: 1;">IP 白名单</span>
        <span class="nav-badge-pill badge-success-pill" id="badge-whitelist-count">${whitelistIPs.length}</span>
      </a>
      <a class="nav-item" id="nav-item-ip-blacklist" onclick="switchTab('ip-blacklist')">
        <span class="nav-icon">🛡️</span>
        <span style="flex: 1;">IP 黑名单</span>
        <span class="nav-badge-pill badge-danger-pill" id="badge-blacklist-count">${blockedIPs.length}</span>
      </a>

      <div class="nav-section-divider"></div>

      <div class="nav-section-title">
        <span>🌐 全局配置</span>
        <span class="nav-badge-pill" title="此处的配置对全站所有订阅统一生效">全站生效</span>
      </div>
      <a class="nav-item" id="nav-item-security-config" onclick="switchTab('security-config')" title="配置全局订阅路由、安全Token、国家IP白名单与代理客户端限制">
        <span class="nav-icon">🔑</span>
        <span style="flex: 1;">订阅安全配置</span>
        <span class="nav-badge-tag">全局</span>
      </a>
      <a class="nav-item" id="nav-item-tg-config" onclick="switchTab('tg-config')" title="配置全局 Telegram Bot 订阅访问实时推送通知">
        <span class="nav-icon">✈️</span>
        <span style="flex: 1;">TG 订阅通知</span>
        <span class="nav-badge-tag">全局</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <a href="javascript:void(0)" onclick="handleLogout()" class="logout-btn">
        <span>🚪</span>
        <span>退出登录</span>
      </a>
    </div>
  </aside>

  <!-- 右侧主工作区 -->
  <main class="main-wrapper">
    <div class="topbar">
      <div style="display: flex; align-items: center; gap: 10px;">
        <button class="mobile-menu-btn" onclick="toggleMobileSidebar(true)" aria-label="打开菜单">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="topbar-title" id="page-title">📦 普通订阅管理</div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="badge-session" id="session-countdown-badge" title="10分钟无操作将自动登出，任意操作自动续期10分钟">
          <span>⏱️</span>
          <span id="session-countdown-text">10:00</span>
        </div>
        <div class="badge-status">
          <span class="status-dot"></span>
          <span>KV 运行中</span>
        </div>
      </div>
    </div>

    <div class="content-area">
      ${renderPlainSubTab(origin, subToken, plainGroups)}
      ${renderCfSubTab(origin, subToken, cfGroups, sources)}
      ${renderLogsTab(logs, blockedIPs, whitelistIPs)}
      ${renderWhitelistTab(whitelistIPs)}
      ${renderBlacklistTab(blockedIPs)}
      ${renderSecurityConfigTab(subToken, allowedCountries, proxyClientOnly)}
      ${renderTgConfigTab(tgConfig)}
    </div>
  </main>

  <!-- 全局自定义通知 Toast 容器 -->
  <div class="toast-container" id="toast-container"></div>

  <!-- 全局自定义确认/删除/警告对话框 -->
  <div class="dialog-overlay" id="app-dialog">
    <div class="dialog-box">
      <div class="dialog-header">
        <span class="dialog-icon" id="dialog-icon">⚠️</span>
        <h4 class="dialog-title" id="dialog-title">确认操作</h4>
      </div>
      <p class="dialog-message" id="dialog-message">您确定要执行此操作吗？</p>
      <div class="dialog-actions">
        <button type="button" class="btn-action btn-secondary" id="dialog-btn-cancel">取消</button>
        <button type="button" class="btn-action btn-danger" id="dialog-btn-confirm">确认删除</button>
      </div>
    </div>
  </div>

  <!-- CF 优选节点生成测试结果弹窗 -->
  <div class="dialog-overlay" id="test-result-dialog">
    <div class="dialog-box dialog-box-large">
      <div class="dialog-header">
        <span class="dialog-icon">🧪</span>
        <h4 class="dialog-title" id="test-result-title">优选节点生成测试结果</h4>
      </div>
      <p class="dialog-message" id="test-result-summary" style="margin-bottom: 12px;">已成功根据模板和优选源生成以下节点：</p>
      <div class="test-result-box" id="test-result-content"></div>
      <div class="dialog-actions" style="margin-top: 16px;">
        <button type="button" class="btn-action btn-secondary" onclick="closeTestResultDialog()">关闭</button>
        <button type="button" class="btn-action btn-primary" onclick="copyTestResultContent()">📋 复制全部生成节点</button>
      </div>
    </div>
  </div>

  <!-- 页面 JSON 数据载荷 -->
  <script type="application/json" id="data-plain-groups">${JSON.stringify(plainGroups).replace(/</g, '\\u003c')}</script>
  <script type="application/json" id="data-cf-groups">${JSON.stringify(cfGroups).replace(/</g, '\\u003c')}</script>
  <script type="application/json" id="data-sources">${JSON.stringify(sources).replace(/</g, '\\u003c')}</script>
  <script type="application/json" id="data-blocked-ips">${JSON.stringify(blockedIPs).replace(/</g, '\\u003c')}</script>
  <script type="application/json" id="data-whitelist-ips">${JSON.stringify(whitelistIPs).replace(/</g, '\\u003c')}</script>

  <script>
    ${dashboardScripts}
  </script>
</body>
</html>`;
}
