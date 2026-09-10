function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 渲染登录页面 HTML（支持图形验证码、指数退避锁定冷却倒计时与防爆破提示）
export function renderLoginPage(errorMessage = '', captchaSvgDataUri = '', captchaToken = '', lockSeconds = 0) {
  const isLocked = lockSeconds > 0;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="cloudflare-insights-beacon" content="false">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <title>登陆面板</title>
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #1e293b;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 28px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 20px 48px rgba(0, 0, 0, 0.05);
    }
    .card-icon {
      font-size: 38px;
      text-align: center;
      margin-bottom: 8px;
      line-height: 1;
    }
    .card h2 {
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 6px;
      color: #0f172a;
    }
    .card p.subtitle {
      font-size: 13px;
      color: #64748b;
      text-align: center;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }
    .form-group input {
      width: 100%;
      padding: 11px 14px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #0f172a;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-group input:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      background: #ffffff;
    }
    .form-group input:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
      color: #94a3b8;
    }
    .password-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-wrap input {
      padding-right: 42px;
    }
    .toggle-password-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 6px;
      transition: color 0.2s, background-color 0.2s;
    }
    .toggle-password-btn:hover {
      color: #334155;
      background-color: #f1f5f9;
    }
    .captcha-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .captcha-row input {
      flex: 1;
      min-width: 0;
    }
    .captcha-img-box {
      width: 120px;
      height: 42px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      transition: opacity 0.2s;
    }
    .captcha-img-box:hover {
      opacity: 0.85;
    }
    .captcha-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .btn {
      width: 100%;
      padding: 12px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 6px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn:hover:not(:disabled) {
      background: #0369a1;
    }
    .btn:active:not(:disabled) {
      transform: scale(0.99);
    }
    .btn:disabled {
      background: #94a3b8;
      cursor: not-allowed;
      opacity: 0.75;
    }
    .error-msg {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
      font-weight: 500;
      line-height: 1.5;
    }
    .security-notice {
      margin-top: 18px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.5;
    }
    @media (max-width: 640px) {
      .form-group input {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-icon">⚡</div>
    <h2>登陆面板</h2>
    <p class="subtitle">请输入管理员密码及验证码以进入控制面板</p>
    ${errorMessage ? `<div class="error-msg" id="error-alert">${escapeHtml(errorMessage)}</div>` : ''}
    <form method="POST" id="login-form">
      <input type="hidden" name="captcha_token" id="captcha-token-input" value="${escapeHtml(captchaToken)}" />
      
      <div class="form-group">
        <label for="password">管理员密码</label>
        <div class="password-wrap">
          <input type="password" id="password" name="password" placeholder="请输入密码" ${isLocked ? 'disabled' : ''} required autofocus autocomplete="current-password" />
          <button type="button" class="toggle-password-btn" id="toggle-password-btn" onclick="togglePasswordVisibility()" title="显示/隐藏密码" tabindex="-1">
            <svg id="eye-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="captcha">图形验证码 (点击图片刷新)</label>
        <div class="captcha-row">
          <input type="text" id="captcha" name="captcha" placeholder="4位字符" maxlength="6" ${isLocked ? 'disabled' : ''} required autocomplete="off" />
          <div class="captcha-img-box" id="captcha-box" onclick="refreshCaptcha()" title="点击换一张">
            <img id="captcha-img" src="${captchaSvgDataUri}" alt="验证码" />
          </div>
        </div>
      </div>

      <button type="submit" class="btn" id="login-submit-btn" ${isLocked ? 'disabled' : ''}>${isLocked ? `⏳ 请稍后 (${lockSeconds}s)` : '登 录'}</button>
    </form>
  </div>

  <script>
    let remainingLockSeconds = ${lockSeconds || 0};
    if (remainingLockSeconds > 0) {
      const btn = document.getElementById('login-submit-btn');
      const pwdInput = document.getElementById('password');
      const captchaInput = document.getElementById('captcha');
      const timer = setInterval(() => {
        remainingLockSeconds--;
        if (remainingLockSeconds <= 0) {
          clearInterval(timer);
          btn.disabled = false;
          btn.textContent = '登 录';
          if (pwdInput) pwdInput.disabled = false;
          if (captchaInput) captchaInput.disabled = false;
          const errBox = document.getElementById('error-alert');
          if (errBox) {
            errBox.style.background = '#f0fdf4';
            errBox.style.borderColor = '#bbf7d0';
            errBox.style.color = '#15803d';
            errBox.textContent = '✅ 冷却时间已结束，请重新输入密码登录。';
          }
        } else {
          const m = Math.floor(remainingLockSeconds / 60);
          const s = remainingLockSeconds % 60;
          const timeStr = m > 0 ? (m + '分' + (s < 10 ? '0' : '') + s + '秒') : (s + '秒');
          btn.textContent = '⏳ 冷却锁定中 (' + timeStr + ')';
        }
      }, 1000);
    }

    function togglePasswordVisibility() {
      const pwdInput = document.getElementById('password');
      const eyeIcon = document.getElementById('eye-icon');
      if (!pwdInput) return;
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        if (eyeIcon) {
          eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        }
      } else {
        pwdInput.type = 'password';
        if (eyeIcon) {
          eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
      }
    }

    async function refreshCaptcha() {
      try {
        const img = document.getElementById('captcha-img');
        const tokenInput = document.getElementById('captcha-token-input');
        img.style.opacity = '0.5';
        const res = await fetch('/api/captcha');
        const data = await res.json();
        if (data && data.svg && data.token) {
          img.src = data.svg;
          tokenInput.value = data.token;
        }
      } catch (err) {
        console.error('刷新验证码失败', err);
      } finally {
        document.getElementById('captcha-img').style.opacity = '1';
      }
    }
  </script>
</body>
</html>`;
}

// 渲染未完成初始化配置（未绑定 KV / 未配置管理员密码）引导页面
export function renderSetupNoticePage({ hasKV = false, hasAdmin = false, hasKvId = false, isPages = false } = {}) {
  let title = '系统初始化配置未完成';
  const platformName = isPages ? 'Cloudflare Pages' : 'Cloudflare Workers';
  let subtitle = `当前检测到运行环境为 <strong>${platformName}</strong>，请按下方指引完成基础配置`;
  let icon = '⚡';
  let warningText = '';

  if (!hasKV && !hasAdmin) {
    title = '未绑定 KV 且未配置密码';
    icon = '⚠️';
    warningText = `系统检测到当前尚未绑定 <code>KV</code> 数据库，也未配置 <code>ADMIN</code> 密码。请前往 ${platformName} 控制台完成必要设置。`;
  } else if (!hasKV) {
    title = '未绑定 KV 命名空间';
    icon = '🗄️';
    warningText = isPages
      ? '系统检测到尚未绑定 <code>KV</code> 命名空间。Pages 部署仅需在函数设置中绑定一次即可终身生效。'
      : '系统检测到尚未绑定 <code>KV</code> 命名空间。若您使用 GitHub 自动发包，请务必同时配置 <code>KV_ID</code> 环境变量以防止每次发布被解绑。';
  } else {
    title = '未配置管理员密码';
    icon = '🔐';
    warningText = '系统未检测到 <code>ADMIN</code> 环境变量。为保障节点与订阅安全，必须先在控制台设置管理员密码。';
  }

  const steps = [];
  if (isPages) {
    // ==========================================
    // 🌸 场景 A：Cloudflare Pages 部署指引（用不到 KV_ID，完全不提示）
    // ==========================================
    if (!hasKV) {
      steps.push('进入 Cloudflare 控制台 -> <strong>Workers 和 Pages</strong> -> 点击进入当前 Pages 项目。');
      steps.push('进入 <strong>设置 (Settings)</strong> -> 点击 <strong>函数 (Functions)</strong> -> 下滑至 <strong>KV 命名空间绑定</strong>。');
      steps.push('点击 <strong>添加绑定 (Add binding)</strong>：变量名称严格填写为 <code>KV</code>，选择你创建好的 KV 空间并保存。<em>（Pages 天生永久锁定绑定，无需配置 KV_ID！）</em>');
    }
    if (!hasAdmin) {
      steps.push('在 Pages 项目设置 -> 进入 <strong>环境变量 (Environment variables)</strong> -> 点击 <strong>添加变量</strong>：变量名填 <code>ADMIN</code>，值填你的登录密码。');
    }
    steps.push('配置完成后点击 <strong>保存并部署</strong>，完成后点击下方按钮刷新页面即可进入系统。');
  } else {
    // ==========================================
    // ⚡ 场景 B：Cloudflare Workers 部署指引（需用到 KV、ADMIN，若缺少 KV_ID 则精准提示）
    // ==========================================
    steps.push('登录 Cloudflare 控制台 -> <strong>Workers 和 Pages</strong> -> 点击进入当前 Worker。');
    steps.push('切换到 <strong>设置 (Settings)</strong> 选项卡 -> 点击 <strong>变量与机密 (Variables and Secrets)</strong>。');
    if (!hasKV) {
      steps.push('在 <strong>KV 命名空间绑定</strong> 区域点击添加绑定：变量名称必须填写 <code>KV</code>，选择对应的 KV 空间。');
    }
    if (!hasAdmin) {
      steps.push('在 <strong>环境变量与机密</strong> 区域点击添加：变量名称填写 <code>ADMIN</code>，值填写您的管理密码。');
    }
    if (!hasKvId) {
      steps.push('<strong>【重要防解绑变量 KV_ID】</strong>：前往控制台 <strong>存储与数据库 -> KV</strong> 复制 <code>KV</code> 的 32 位真实 ID。在同一页面环境变量中添加：变量名 <code>KV_ID</code>，值为该 32 位 ID。<em>（配置后可彻底阻止 GitHub 自动发包时 Cloudflare 强制清除 KV 绑定！）</em>');
    }
    steps.push('💡 <em>提示：您也可以转为 <strong>Cloudflare Pages</strong> 部署，Pages 天生无需配置 KV_ID 且永不解绑！</em>');
    steps.push('点击 <strong>保存并部署</strong>，完成后点击下方按钮刷新页面。');
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="cloudflare-insights-beacon" content="false">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <title>${title} - 节点管理系统</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      color: #1e293b;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 32px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 20px 48px rgba(0, 0, 0, 0.05);
    }
    .card-icon {
      font-size: 42px;
      text-align: center;
      margin-bottom: 12px;
      line-height: 1;
    }
    .card h2 {
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
      color: #0f172a;
    }
    .card p.subtitle {
      font-size: 13px;
      color: #64748b;
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .status-box {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .status-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 8px;
      border-radius: 10px;
      text-align: center;
    }
    .status-item.status-ok {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }
    .status-item.status-err {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }
    .status-item.status-warn {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
    .status-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 700;
    }
    .status-ok .status-badge {
      background: #dcfce7;
      color: #15803d;
    }
    .status-err .status-badge {
      background: #fee2e2;
      color: #dc2626;
    }
    .status-warn .status-badge {
      background: #fef3c7;
      color: #b45309;
    }
    .status-name {
      color: #334155;
      font-size: 12px;
      font-weight: 600;
    }
    .warning-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .warning-icon {
      font-size: 20px;
      line-height: 1.3;
      flex-shrink: 0;
    }
    .warning-text {
      font-size: 13px;
      color: #92400e;
      line-height: 1.6;
    }
    .steps-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .steps-title {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .steps-list {
      list-style: none;
      counter-reset: step-counter;
    }
    .steps-list li {
      counter-increment: step-counter;
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 12px;
      position: relative;
      padding-left: 26px;
    }
    .steps-list li:last-child {
      margin-bottom: 0;
    }
    .steps-list li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 1px;
      width: 18px;
      height: 18px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    code {
      background: #e2e8f0;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      font-weight: 600;
    }
    .btn {
      width: 100%;
      padding: 12px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn:hover {
      background: #0369a1;
    }
    .btn:active {
      transform: scale(0.99);
    }
    .footer-note {
      margin-top: 18px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-icon">${icon}</div>
    <h2>${title}</h2>
    <p class="subtitle">${subtitle}</p>

    <!-- 动态变量状态卡片：根据是否为 Pages 智能调整 -->
    <div class="status-box">
      <div class="status-item ${hasKV ? 'status-ok' : 'status-err'}">
        <span class="status-badge">${hasKV ? '✓ 已绑定' : '✕ 未绑定'}</span>
        <span class="status-name">存储空间 (KV)</span>
      </div>
      <div class="status-item ${hasAdmin ? 'status-ok' : 'status-err'}">
        <span class="status-badge">${hasAdmin ? '✓ 已配置' : '✕ 未配置'}</span>
        <span class="status-name">后台密码 (ADMIN)</span>
      </div>
      ${!isPages ? `
        <div class="status-item ${hasKvId ? 'status-ok' : 'status-warn'}">
          <span class="status-badge">${hasKvId ? '✓ 已配置' : '⚠️ 建议配置'}</span>
          <span class="status-name">防解绑密钥 (KV_ID)</span>
        </div>
      ` : ''}
    </div>

    <div class="warning-box">
      <div class="warning-icon">⚠️</div>
      <div class="warning-text">${warningText}</div>
    </div>

    <div class="steps-container">
      <div class="steps-title">📋 ${platformName} 专属配置步骤：</div>
      <ol class="steps-list">
        ${steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    <button type="button" class="btn" onclick="window.location.reload()">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      已完成配置，刷新页面
    </button>

    <div class="footer-note">
      配置完成并点击保存部署后，点击上方按钮刷新即可进入登录页面
    </div>
  </div>
</body>
</html>`;
}
