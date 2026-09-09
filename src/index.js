import {
  sha256,
  getCookie,
  safeBase64Encode,
  getBaseVless,
  getSources,
  saveSources,
  getCustomNodeGroups,
  saveCustomNodeGroups,
  getCfNodeGroups,
  saveCfNodeGroups,
  generateSecureRandomString,
  getToken,
  saveToken,
  getAllowedCountries,
  saveAllowedCountries,
  getProxyClientOnly,
  saveProxyClientOnly,
  getBlockedIPs,
  saveBlockedIPs,
  getWhitelistIPs,
  saveWhitelistIPs,
  getAccessLogs,
  saveAccessLogs,
  recordAccessLog,
  clearAccessLogs,
  getLoginFailedAttempts,
  recordLoginFailure,
  resetLoginFailedAttempts,
  getSecretKey,
  createSessionToken,
  verifySessionToken,
  isIPInList,
  isLoopbackIP,
  recordSubTokenFailure,
  resetSubTokenFailure,
  getTgConfig,
  saveTgConfig,
  sendTelegramMessage
} from './storage.js';
import { encrypt, decrypt } from './cipherTool.js';
import { createCaptchaPayload, verifyCaptcha } from './captcha.js';
import { fetchIPsAndGenerateNodes, standardizeNodesText } from './nodes.js';
import { renderLoginPage, renderSetupNoticePage } from './views/loginView.js';
import { renderDashboardPage } from './views/dashboardView.js';

// ==========================================
// 🛡️ 高防组件：内存限流计数器 (60秒滑动窗口)
// ==========================================
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + 60000 };
    rateLimitMap.set(ip, record);
    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
    return { allowed: true, count: 1 };
  }
  record.count += 1;
  // 超过 100 次/分：判定为严重恶意 CC 攻击
  if (record.count > 100) {
    return { allowed: false, banned: true, count: record.count };
  }
  // 超过 30 次/分：柔性限流
  if (record.count > 30) {
    return { allowed: false, banned: false, count: record.count };
  }
  return { allowed: true, count: record.count };
}

// ==========================================
// 🛡️ 高防组件：WAF 威胁特征指纹检测
// ==========================================
function checkWafThreat(targetUrl) {
  let fullTarget = '';
  try {
    fullTarget = decodeURIComponent(targetUrl.pathname + targetUrl.search).toLowerCase();
  } catch {
    fullTarget = (targetUrl.pathname + targetUrl.search).toLowerCase();
  }
  const attackPatterns = [
    { name: '敏感扩展名扫描', regex: /\.(php\d?|asp|aspx|jsp|jspx|cgi|sh|bash|sql|bak|swp|zip|tar|gz|rar|7z)(\?|$)/i },
    { name: '典型探测路径', regex: /(^|\/)(wp-admin|wp-login|wp-content|wordpress|phpmyadmin|pma|adminer|actuator|swagger|api-docs|solr|struts)(\/|$)/i },
    { name: '敏感配置文件扫描', regex: /(^|\/)(\.env|\.git|\.svn|\.docker|\.aws|\.ssh|\.htaccess|\.config)(\/|$)/i },
    { name: '注入特征', regex: /(union\s+select|select\s+.*from|exec\s*\(|eval\s*\(|base64_decode|system\s*\(|cmd\.exe|\/bin\/(ba)?sh)/i },
    { name: 'XSS 跨站特征', regex: /(<script|javascript:|alert\(|document\.cookie)/i },
    { name: '路径穿越特征', regex: /(\.\.\/|\.\.\\)/ }
  ];
  for (const p of attackPatterns) {
    if (p.regex.test(fullTarget)) return p.name;
  }
  return null;
}

// ==========================================
// 🛡️ 高防组件：已封禁 IP 频控与智能日志聚合 (防刷爆 KV 写配额)
// ==========================================
const blockedLogThrottleMap = new Map(); // ip -> { lastLoggedAt, blockedCount }

function shouldLogBlockedIP(ip) {
  const now = Date.now();
  const record = blockedLogThrottleMap.get(ip);
  // 5 分钟 (300,000 毫秒) 频控合并窗口
  if (!record || now - record.lastLoggedAt > 300000) {
    const prevCount = record ? record.blockedCount : 1;
    blockedLogThrottleMap.set(ip, { lastLoggedAt: now, blockedCount: 1 });
    if (blockedLogThrottleMap.size > 2000) {
      for (const [k, v] of blockedLogThrottleMap.entries()) {
        if (now - v.lastLoggedAt > 600000) blockedLogThrottleMap.delete(k);
      }
    }
    return { shouldLog: true, count: prevCount };
  }
  record.blockedCount += 1;
  return { shouldLog: false, count: record.blockedCount };
}

// ==========================================
// 🛡️ 订阅安全防护：主流代理客户端特征库与访问白名单校验
// ==========================================
const PROXY_CLIENT_KEYWORDS = [
  'clash', 'mihomo', 'meta', 'stash', 'shadowrocket',
  'quantumult', 'surge', 'loon', 'sing-box', 'singbox',
  'v2ray', 'v2rayn', 'v2rayng', 'v2rayu', 'v2rayx', 'xray',
  'nekoray', 'nekobox', 'matsuri', 'hiddify', 'egern',
  'passwall', 'openwrt', 'surfboard', 'flclash', 'karing',
  'potatso', 'pharos', 'subconverter', 'leaf', 'trojan'
];

function checkSubscriptionAccess({ request, userAgent, isAuthed, isWhitelisted, groupAllowedCountries, globalAllowedCountries, proxyClientOnly, isLocal }) {
  // 管理员已登录会话、本地回环开发调试或 IP 白名单客户端永久豁免
  if (isAuthed || isWhitelisted || isLocal) {
    return { allowed: true };
  }

  // 1. 代理客户端 User-Agent 限制校验
  if (proxyClientOnly) {
    const ua = (userAgent || '').toLowerCase();
    const isProxyClient = ua ? PROXY_CLIENT_KEYWORDS.some(kw => ua.includes(kw)) : false;
    if (!isProxyClient) {
      return {
        allowed: false,
        status: 403,
        reason: '非代理客户端拦截',
        message: '403 Forbidden'
      };
    }
  }

  // 2. 国家/地区 IP 访问白名单校验 (优先采用该订阅专属配置，未指定则继承全局配置)
  const allowedList = (Array.isArray(groupAllowedCountries) && groupAllowedCountries.length > 0)
    ? groupAllowedCountries
    : globalAllowedCountries;

  if (Array.isArray(allowedList) && allowedList.length > 0) {
    const rawCountry = request.cf ? (request.cf.country || '').toUpperCase() : '';
    if (!rawCountry || !allowedList.includes(rawCountry)) {
      const displayCountry = rawCountry || '未知地区';
      return {
        allowed: false,
        status: 403,
        reason: `国家地区受限 [${displayCountry}]`,
        message: '403 Forbidden'
      };
    }
  }

  return { allowed: true };
}

// 辅助方法：转义 Telegram HTML 实体字符
function escapeTgHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 辅助方法：客户端拉取订阅时异步推送 Telegram 通知
function sendSubTelegramNotification(env, tgConfig, details, ctx) {
  if (!tgConfig || !tgConfig.enabled || !tgConfig.token || !tgConfig.chatId) {
    return;
  }
  const {
    subType,
    subName,
    ip,
    location,
    ua,
    time,
    viewsInfo
  } = details;

  const text = `📢 <b>订阅拉取通知</b>\n\n` +
    `📌 <b>订阅类型:</b> ${escapeTgHtml(subType)}\n` +
    (subName ? `🏷️ <b>订阅名称:</b> ${escapeTgHtml(subName)}\n` : '') +
    `🌐 <b>客户端 IP:</b> <code>${escapeTgHtml(ip)}</code>\n` +
    `📍 <b>地理位置:</b> ${escapeTgHtml(location || '未知')}\n` +
    (viewsInfo ? `📊 <b>访问统计:</b> ${escapeTgHtml(viewsInfo)}\n` : '') +
    `⏰ <b>拉取时间:</b> ${escapeTgHtml(time)}\n` +
    `📱 <b>User-Agent:</b> <code>${escapeTgHtml(ua || '未知')}</code>`;

  const notifyPromise = sendTelegramMessage(env, text, tgConfig);
  if (ctx && ctx.waitUntil) {
    ctx.waitUntil(notifyPromise);
  } else {
    notifyPromise.catch(err => console.error('[TG Notify Error]:', err));
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const adminPassword = (env.ADMIN || '').trim();
      const adminHash = adminPassword ? await sha256(adminPassword) : '';
      const hasKV = Boolean(env.KV && typeof env.KV.get === 'function');
      const hasAdmin = Boolean(adminPassword);

      // 1. 浏览器与移动设备后台静默请求直接豁免（防止 iPhone/Android 打开网页因查图标触发 404 误封）
      if (
        url.pathname === '/favicon.ico' ||
        url.pathname.startsWith('/favicon') ||
        url.pathname.startsWith('/apple-touch-icon') ||
        url.pathname === '/site.webmanifest' ||
        url.pathname === '/browserconfig.xml'
      ) {
        return new Response(null, { status: 204 });
      }
      if (url.pathname === '/robots.txt') {
        return new Response("User-agent: *\nDisallow: /\n", {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

    // 提取客户端真实 IP（规范化清洗，优先 CF-Connecting-IP）、位置和 User-Agent
    const rawForwarded = request.headers.get('x-forwarded-for') || '';
    const clientIP = request.headers.get('CF-Connecting-IP') || (rawForwarded ? rawForwarded.split(',')[0].trim() : '') || '127.0.0.1';
    const clientLocation = request.cf ? `${request.cf.country || 'Global'} ${request.cf.city || ''}`.trim() : 'Local';
    const userAgent = request.headers.get('User-Agent') || '';
    const nowTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
    const isHttps = url.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';

    // 检查 Session Cookie 是否登录成功且在 10 分钟有效期内
    const sessionCookie = getCookie(request, 'auth_session');
    const isAuthed = await verifySessionToken(env, sessionCookie, adminHash, adminPassword);

    // 辅助方法：快捷生成验证码 Payload
    const getCaptcha = () => createCaptchaPayload(env, getSecretKey, encrypt);
    // 辅助方法：校验验证码
    const checkCaptcha = (txt, token) => verifyCaptcha(txt, token, env, getSecretKey, decrypt);
    // 辅助方法：生成会话令牌
    const getSessionToken = () => createSessionToken(env, adminHash);

    // 辅助方法：为后台操作响应自动附加滑动续期 10 分钟的 Set-Cookie
    async function attachSessionRenewal(response) {
      if (!isAuthed || !adminPassword) return response;
      try {
        const renewedToken = await getSessionToken();
        const headers = new Headers(response.headers);
        headers.set('Set-Cookie', `auth_session=${renewedToken}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=600`);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch {
        return response;
      }
    }

    // 读取 IP 黑白名单 (并发拉取，降低边缘拦截延迟)
    const [whitelistIPs, blockedIPs] = await Promise.all([
      getWhitelistIPs(env),
      getBlockedIPs(env)
    ]);
    const isLocal = isLoopbackIP(clientIP);
    const isWhitelisted = isIPInList(clientIP, whitelistIPs);
    const isBlocked = !isLocal && isIPInList(clientIP, blockedIPs);

    // 3. 检查 IP 黑名单拦截（支持 CIDR，白名单 IP 永远豁免；智能频控聚合防刷爆 KV 写配额）
    if (!isWhitelisted && isBlocked) {
      const throttle = shouldLogBlockedIP(clientIP);
      if (throttle.shouldLog) {
        const logType = throttle.count > 1
          ? `🚫 IP拦截拒绝 (近5分钟累计拦截 ${throttle.count} 次)`
          : '🚫 IP拦截拒绝';
        const logPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: 403,
          path: url.pathname,
          type: logType,
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(logPromise);
        else await logPromise;
      }

      return new Response('403 Forbidden', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 2. 检查 WAF 威胁特征指纹（敏感文件探测、注入特征、目录穿越）
    if (!isWhitelisted) {
      const wafThreat = checkWafThreat(url);
      if (wafThreat) {
        if (!isIPInList(clientIP, blockedIPs) && !isLocal) {
          blockedIPs.push(clientIP);
          await saveBlockedIPs(env, blockedIPs);
        }
        const wafLogPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: 403,
          path: url.pathname,
          type: `🚫 触发 WAF 威胁指纹阻断 [${wafThreat}] (${url.pathname})，IP 已被永久封禁`,
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(wafLogPromise);
        else await wafLogPromise;

        return new Response('403 Forbidden', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      // 3. 检查高频访问限流与防 CC (60秒滑动窗口，管理员会话与本地开发豁免)
      if (!isLocal && !isAuthed) {
        const rateCheck = checkRateLimit(clientIP);
        if (!rateCheck.allowed) {
        if (rateCheck.banned) {
          if (!isIPInList(clientIP, blockedIPs) && !isLocal) {
            blockedIPs.push(clientIP);
            await saveBlockedIPs(env, blockedIPs);
          }
          const ccLogPromise = recordAccessLog(env, {
            time: nowTime,
            ip: clientIP,
            location: clientLocation,
            status: 403,
            path: url.pathname,
            type: `🚫 触发 CC 刷频恶意攻击 (${rateCheck.count} 次/分)，IP 已被永久封禁`,
            ua: userAgent
          });
          if (ctx && ctx.waitUntil) ctx.waitUntil(ccLogPromise);
          else await ccLogPromise;

          return new Response('403 Forbidden', {
            status: 403,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        } else {
          const limitLogPromise = recordAccessLog(env, {
            time: nowTime,
            ip: clientIP,
            location: clientLocation,
            status: 429,
            path: url.pathname,
            type: `⚠️ 触发高频限流保护 (${rateCheck.count} 次/分)`,
            ua: userAgent
          });
          if (ctx && ctx.waitUntil) ctx.waitUntil(limitLogPromise);
          else await limitLogPromise;

          return new Response('429 Too Many Requests', {
            status: 429,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Retry-After': '60'
            }
          });
        }
      }
    }

    }

    // 辅助方法：处理订阅令牌暴力破解尝试
    async function handleSubTokenFail(subTypeName) {
      const failCount = await recordSubTokenFailure(env, clientIP);
      if (failCount >= 3 && !isWhitelisted) {
        if (!isIPInList(clientIP, blockedIPs) && !isLocal) {
          blockedIPs.push(clientIP);
          await saveBlockedIPs(env, blockedIPs);
        }
        const banLogPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: 403,
          path: url.pathname,
          type: `🚫 订阅令牌暴力破解尝试连续达 3 次 (${subTypeName})，IP 已被永久封禁`,
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(banLogPromise);
        else await banLogPromise;

        return new Response('403 Forbidden', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      const remaining = Math.max(0, 3 - failCount);
      const failLogPromise = recordAccessLog(env, {
        time: nowTime,
        ip: clientIP,
        location: clientLocation,
        status: 401,
        path: url.pathname,
        type: `🔒 ${subTypeName}鉴权未通过 (第 ${failCount} 次失败${isWhitelisted ? '，白名单豁免' : `，剩余 ${remaining} 次将被永久封禁`})`,
        ua: userAgent
      });
      if (ctx && ctx.waitUntil) ctx.waitUntil(failLogPromise);
      else await failLogPromise;

      return new Response('401 Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 获取当前配置（并发拉取全部加密 KV 项，将串行网络等待降低至 1 次并发周期）
    const [
      sources,
      currentBaseVless,
      currentCustomGroups,
      currentCfGroups,
      currentToken,
      globalAllowedCountries,
      proxyClientOnly,
      tgConfig
    ] = await Promise.all([
      getSources(env),
      getBaseVless(env),
      getCustomNodeGroups(env),
      getCfNodeGroups(env),
      getToken(env),
      getAllowedCountries(env),
      getProxyClientOnly(env),
      getTgConfig(env)
    ]);

    const cleanPath = url.pathname.replace(/^\/+|\/+$/g, '');

    // ==========================================================
    // 路由 0-A: 极简独立普通订阅路由直接访问 (http://domain/:groupId)
    // 鉴权逻辑：匹配 TOKEN 或 ADMIN 密码；已登录会话免鉴权
    // 支持“阅后即焚 / 访问次数限制”，达到限制次数后自动物理销毁
    // ==========================================================
    const matchedDirectGroup = currentCustomGroups.find(g => g.id.toLowerCase() === cleanPath.toLowerCase());
    if (matchedDirectGroup) {
      const subAccess = checkSubscriptionAccess({
        request,
        userAgent,
        isAuthed,
        isWhitelisted,
        groupAllowedCountries: matchedDirectGroup.allowedCountries,
        globalAllowedCountries,
        proxyClientOnly,
        isLocal
      });

      if (!subAccess.allowed) {
        const subLogPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: subAccess.status,
          path: url.pathname,
          type: `🚫 普通订阅拦截 [${subAccess.reason}]`,
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(subLogPromise);
        else await subLogPromise;

        return new Response(subAccess.message, {
          status: subAccess.status,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      const reqToken = url.searchParams.get('token') || url.searchParams.get('pwd') || '';
      if (currentToken && !isAuthed && reqToken !== currentToken) {
        return handleSubTokenFail('普通订阅');
      }

      // 验证成功重置失败计数
      const resetSubPromise = resetSubTokenFailure(env, clientIP);
      if (ctx && ctx.waitUntil) ctx.waitUntil(resetSubPromise);
      else await resetSubPromise;

      const maxLimit = (matchedDirectGroup.maxViews !== undefined && matchedDirectGroup.maxViews !== null && matchedDirectGroup.maxViews > 0) ? matchedDirectGroup.maxViews : 0;
      const currentViews = (matchedDirectGroup.views || 0) + 1;

      // 异步更新访问计数或达到阈值时直接物理销毁
      if (maxLimit > 0 && currentViews >= maxLimit) {
        // 达到限制次数：从订阅列表中彻底物理移除
        const remaining = currentCustomGroups.filter(g => g.id.toLowerCase() !== matchedDirectGroup.id.toLowerCase());
        const savePromise = saveCustomNodeGroups(env, remaining);
        if (ctx && ctx.waitUntil) ctx.waitUntil(savePromise);
        else await savePromise;
      } else {
        // 累加访问次数并保存
        matchedDirectGroup.views = currentViews;
        const savePromise = saveCustomNodeGroups(env, currentCustomGroups);
        if (ctx && ctx.waitUntil) ctx.waitUntil(savePromise);
        else await savePromise;
      }

      // 记录访问日志
      const logPromise = recordAccessLog(env, {
        time: nowTime,
        ip: clientIP,
        location: clientLocation,
        status: 200,
        path: url.pathname,
        type: `普通订阅 [${matchedDirectGroup.name || matchedDirectGroup.id}]`,
        ua: userAgent
      });
      if (ctx && ctx.waitUntil) ctx.waitUntil(logPromise);
      else await logPromise;

      // 发送 Telegram 通知
      sendSubTelegramNotification(env, tgConfig, {
        subType: '独立普通订阅',
        subName: matchedDirectGroup.name || matchedDirectGroup.id,
        ip: clientIP,
        location: clientLocation,
        ua: userAgent,
        time: nowTime,
        viewsInfo: maxLimit > 0 ? `${currentViews} / ${maxLimit} 次 (阅后即焚)` : `${currentViews} 次`
      }, ctx);

      const format = url.searchParams.get('format') || 'base64';
      const lines = standardizeNodesText(matchedDirectGroup.nodes);
      
      if (lines.length === 0) {
        return new Response('404 Not Found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      const content = lines.join('\n');
      const responseBody = format === 'raw' ? content : safeBase64Encode(content);

      return new Response(responseBody, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Subscription-Userinfo': 'upload=0; download=0; total=1073741824000; expire=0',
          'Profile-Update-Interval': '24'
        }
      });
    }

    // ==========================================================
    // 路由 0-B: 极简独立 CF 优选订阅路由直接访问 (http://domain/:cfGroupId)
    // 鉴权逻辑：匹配 TOKEN 或 ADMIN 密码；已登录会话免鉴权
    // 支持“阅后即焚 / 访问次数限制”，达到限制次数后自动物理销毁
    // ==========================================================
    const matchedCfGroup = currentCfGroups.find(g => g.id.toLowerCase() === cleanPath.toLowerCase());
    if (matchedCfGroup) {
      const subAccess = checkSubscriptionAccess({
        request,
        userAgent,
        isAuthed,
        isWhitelisted,
        groupAllowedCountries: matchedCfGroup.allowedCountries,
        globalAllowedCountries,
        proxyClientOnly,
        isLocal
      });

      if (!subAccess.allowed) {
        const subLogPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: subAccess.status,
          path: url.pathname,
          type: `🚫 CF优选订阅拦截 [${subAccess.reason}]`,
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(subLogPromise);
        else await subLogPromise;

        return new Response(subAccess.message, {
          status: subAccess.status,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      const reqToken = url.searchParams.get('token') || url.searchParams.get('pwd') || '';
      if (currentToken && !isAuthed && reqToken !== currentToken) {
        return handleSubTokenFail('CF优选订阅');
      }

      // 验证成功重置失败计数
      const resetSubPromise = resetSubTokenFailure(env, clientIP);
      if (ctx && ctx.waitUntil) ctx.waitUntil(resetSubPromise);
      else await resetSubPromise;

      const maxLimit = (matchedCfGroup.maxViews !== undefined && matchedCfGroup.maxViews !== null && matchedCfGroup.maxViews > 0) ? matchedCfGroup.maxViews : 0;
      const currentViews = (matchedCfGroup.views || 0) + 1;

      // 异步更新访问计数或达到阈值时直接物理销毁
      if (maxLimit > 0 && currentViews >= maxLimit) {
        const remaining = currentCfGroups.filter(g => g.id.toLowerCase() !== matchedCfGroup.id.toLowerCase());
        const savePromise = saveCfNodeGroups(env, remaining);
        if (ctx && ctx.waitUntil) ctx.waitUntil(savePromise);
        else await savePromise;
      } else {
        matchedCfGroup.views = currentViews;
        const savePromise = saveCfNodeGroups(env, currentCfGroups);
        if (ctx && ctx.waitUntil) ctx.waitUntil(savePromise);
        else await savePromise;
      }

      // 记录访问日志
      const logPromise = recordAccessLog(env, {
        time: nowTime,
        ip: clientIP,
        location: clientLocation,
        status: 200,
        path: url.pathname,
        type: `CF优选订阅 [${matchedCfGroup.name || matchedCfGroup.id}]`,
        ua: userAgent
      });
      if (ctx && ctx.waitUntil) ctx.waitUntil(logPromise);
      else await logPromise;

      // 发送 Telegram 通知
      sendSubTelegramNotification(env, tgConfig, {
        subType: '独立 CF 优选订阅',
        subName: matchedCfGroup.name || matchedCfGroup.id,
        ip: clientIP,
        location: clientLocation,
        ua: userAgent,
        time: nowTime,
        viewsInfo: maxLimit > 0 ? `${currentViews} / ${maxLimit} 次 (阅后即焚)` : `${currentViews} 次`
      }, ctx);

      const format = url.searchParams.get('format') || 'base64';
      const groupBaseVless = (matchedCfGroup.baseVless && matchedCfGroup.baseVless.trim()) ? matchedCfGroup.baseVless.trim() : currentBaseVless;

      // 确定优选源（若指定了 sources 则使用指定的，否则使用全部优选源）
      let groupSources = sources;
      if (Array.isArray(matchedCfGroup.sources) && matchedCfGroup.sources.length > 0) {
        if (typeof matchedCfGroup.sources[0] === 'object') {
          groupSources = matchedCfGroup.sources;
        } else {
          const targetIds = matchedCfGroup.sources.map(id => String(id).toLowerCase());
          groupSources = sources.filter(s => s && s.id && targetIds.includes(String(s.id).toLowerCase()));
          if (groupSources.length === 0) groupSources = sources;
        }
      }

      return await fetchIPsAndGenerateNodes(groupBaseVless, groupSources, format);
    }

    // ==========================================================
    // 🛡️ API 安全网关：未登录直接探测/调用后台管理接口，一律立即永久封禁 IP（白名单 IP 豁免）
    // ==========================================================
    if (url.pathname.startsWith('/api/') && url.pathname !== '/api/captcha') {
      if (!isAuthed) {
        if (!isWhitelisted) {
          const currentBlocked = await getBlockedIPs(env);
          if (!currentBlocked.includes(clientIP) && !isLocal) {
            currentBlocked.push(clientIP);
            await saveBlockedIPs(env, currentBlocked);
          }
        }
        const unauthLogPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: 403,
          path: url.pathname,
          type: '🚫 未经登录越权探测API，IP 已被永久封禁',
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(unauthLogPromise);
        else await unauthLogPromise;

        return new Response('403 Forbidden', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      if (!hasKV || !hasAdmin) {
        return new Response(JSON.stringify({
          success: false,
          error: '系统尚未完成初始化配置'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // 统一为所有后台管理 API 响应附加滑动会话续期 Set-Cookie
    async function authedJsonResponse(payload, status = 200) {
      const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
      return attachSessionRenewal(new Response(bodyStr, {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }));
    }

    // 会话活动心跳保活接口 (/api/session-ping)
    if (url.pathname === '/api/session-ping' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      return authedJsonResponse({ success: true });
    }

    // ==========================================================
    // 路由 2: 管理接口 - 保存订阅安全配置 TOKEN (/api/security-config)
    // ==========================================================
    if (url.pathname === '/api/security-config' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        await saveToken(env, body.token || '');
        if (body.allowedCountries !== undefined) {
          await saveAllowedCountries(env, body.allowedCountries);
        }
        if (body.proxyClientOnly !== undefined) {
          await saveProxyClientOnly(env, body.proxyClientOnly);
        }
        return authedJsonResponse({ success: true });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 2-B: 管理接口 - 保存 Telegram 订阅通知配置 (/api/tg-config)
    // ==========================================================
    if (url.pathname === '/api/tg-config' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        await saveTgConfig(env, {
          enabled: !!body.enabled,
          token: (body.token || '').trim(),
          chatId: (body.chatId || '').trim(),
          apiHost: (body.apiHost || '').trim() || 'https://api.telegram.org'
        });
        return authedJsonResponse({ success: true });
      } catch (err) {
        return authedJsonResponse({ error: err.message || 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 2-C: 管理接口 - 发送 Telegram 测试通知 (/api/test-tg-notify)
    // ==========================================================
    if (url.pathname === '/api/test-tg-notify' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const testConfig = {
          enabled: true,
          force: true,
          token: (body.token || '').trim(),
          chatId: (body.chatId || '').trim(),
          apiHost: (body.apiHost || '').trim() || 'https://api.telegram.org'
        };

        if (!testConfig.token || !testConfig.chatId) {
          return authedJsonResponse({ error: 'Bot Token 和 Chat ID 不能为空' }, 400);
        }

        const testMsg = `🎉 <b>Telegram 订阅通知连通性测试成功！</b>\n\n` +
          `📡 <b>推送服务:</b> CF Workers 订阅通知引擎\n` +
          `🌐 <b>发起 IP:</b> <code>${escapeTgHtml(clientIP)}</code>\n` +
          `📍 <b>发起位置:</b> ${escapeTgHtml(clientLocation)}\n` +
          `⏰ <b>测试时间:</b> ${escapeTgHtml(nowTime)}\n` +
          `💬 <b>Chat ID:</b> <code>${escapeTgHtml(testConfig.chatId)}</code>\n\n` +
          `✅ 机器人配置正确，当有客户端拉取节点订阅时，将会在此处实时收到推送！`;

        const result = await sendTelegramMessage(env, testMsg, testConfig);
        return authedJsonResponse(result, result.success ? 200 : 400);
      } catch (err) {
        return authedJsonResponse({ error: err.message }, 500);
      }
    }

    // 系统保留路径黑名单（禁止作为订阅组 ID，防止路由劫持与冲突）
    const RESERVED_GROUP_IDS = ['api', 'login', 'logout', 'favicon.ico', 'robots.txt', 'sub', 'assets', 'static', 'dashboard'];

    // 校验优选源 URL 安全性（必须为合法 http/https，禁止私有内网 SSRF）
    function isValidPublicUrl(rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        const host = parsed.hostname.toLowerCase();
        // 拦截私有地址、本地回环及云元数据 IP
        if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host === '[::1]') return false;
        if (host.startsWith('127.') || host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) return false;
        if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false;
        if (host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) return false;
        return true;
      } catch {
        return false;
      }
    }

    // ==========================================================
    // 路由 4: 管理接口 - 添加/更新普通订阅组 (/api/custom-groups)
    // ==========================================================
    if (url.pathname === '/api/custom-groups' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const targetId = (body.id || '').trim() || generateSecureRandomString(12, 33);
        const targetName = (body.name || '').trim();
        if (!targetName) {
          return authedJsonResponse({ error: '订阅名称不能为空' }, 400);
        }
        if (RESERVED_GROUP_IDS.includes(targetId.toLowerCase())) {
          return authedJsonResponse({ error: '此订阅 ID 为系统保留关键字，请使用其他名称' }, 400);
        }
        const existing = currentCustomGroups.find(g => g.id.toLowerCase() === targetId);
        const updated = currentCustomGroups.filter(g => g.id.toLowerCase() !== targetId);
        const rawMax = typeof body.maxViews === 'number' ? body.maxViews : parseInt(body.maxViews, 10);
        const maxViews = (!isNaN(rawMax) && rawMax > 0) ? Math.min(999, Math.max(0, rawMax)) : 0;
        
        let newViews = 0;
        if (existing && existing.maxViews === maxViews) {
          newViews = existing.views || 0;
        } else {
          newViews = 0; // 修改了限制值或新建，重新计数
        }

        const cleanNodes = standardizeNodesText(body.nodes || '').join('\n');
        const groupAllowed = Array.isArray(body.allowedCountries)
          ? body.allowedCountries.map(c => String(c).trim().toUpperCase()).filter(Boolean)
          : (typeof body.allowedCountries === 'string'
              ? body.allowedCountries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
              : []);

        updated.push({
          id: targetId,
          name: targetName,
          maxViews: maxViews,
          views: newViews,
          nodes: cleanNodes,
          allowedCountries: groupAllowed
        });
        await saveCustomNodeGroups(env, updated);
        return authedJsonResponse({ success: true, id: targetId, group: { id: targetId, name: targetName } });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 5: 管理接口 - 删除普通订阅组 (/api/custom-groups/:id) 与批量删除 (/api/custom-groups/batch-delete)
    // ==========================================================
    if (url.pathname === '/api/custom-groups/batch-delete' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const idsToDelete = (Array.isArray(body.ids) ? body.ids : []).map(id => String(id).toLowerCase().trim());
        const updated = currentCustomGroups.filter(g => !idsToDelete.includes(g.id.toLowerCase()));
        await saveCustomNodeGroups(env, updated);
        return authedJsonResponse({ success: true, count: idsToDelete.length });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    if (url.pathname.startsWith('/api/custom-groups/') && request.method === 'DELETE') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      const idToDelete = decodeURIComponent(url.pathname.replace('/api/custom-groups/', '')).toLowerCase();
      const updated = currentCustomGroups.filter(g => g.id !== idToDelete);
      await saveCustomNodeGroups(env, updated);
      return authedJsonResponse({ success: true });
    }

    // ==========================================================
    // 路由 6: 管理接口 - 添加/更新 CF 优选订阅组 (/api/cf-groups)
    // ==========================================================
    if (url.pathname === '/api/cf-groups' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        if (!body.name) {
          return authedJsonResponse({ error: '缺少必填字段' }, 400);
        }
        const targetId = (body.id || '').trim() || generateSecureRandomString(12, 33);
        if (RESERVED_GROUP_IDS.includes(targetId.toLowerCase())) {
          return authedJsonResponse({ error: '此订阅 ID 为系统保留关键字，请使用其他名称' }, 400);
        }
        const existing = currentCfGroups.find(g => g.id === targetId);
        const updated = currentCfGroups.filter(g => g.id !== targetId);
        const rawMax = typeof body.maxViews === 'number' ? body.maxViews : parseInt(body.maxViews, 10);
        const maxViews = (!isNaN(rawMax) && rawMax > 0) ? Math.min(999, Math.max(0, rawMax)) : 0;
        
        let newViews = 0;
        if (existing && existing.maxViews === maxViews) {
          newViews = existing.views || 0;
        } else {
          newViews = 0;
        }

        const groupAllowed = Array.isArray(body.allowedCountries)
          ? body.allowedCountries.map(c => String(c).trim().toUpperCase()).filter(Boolean)
          : (typeof body.allowedCountries === 'string'
              ? body.allowedCountries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
              : []);

        updated.push({
          id: targetId,
          name: body.name,
          maxViews: maxViews,
          views: newViews,
          baseVless: body.baseVless || '',
          sources: Array.isArray(body.sources) ? body.sources : [],
          allowedCountries: groupAllowed
        });
        await saveCfNodeGroups(env, updated);
        return authedJsonResponse({ success: true, id: targetId, group: { id: targetId, name: body.name } });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 7: 管理接口 - 删除 CF 优选订阅组 (/api/cf-groups/:id) 与批量删除 (/api/cf-groups/batch-delete)
    // ==========================================================
    if (url.pathname === '/api/cf-groups/batch-delete' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const idsToDelete = (Array.isArray(body.ids) ? body.ids : []).map(id => String(id).toLowerCase().trim());
        const updated = currentCfGroups.filter(g => !idsToDelete.includes(g.id.toLowerCase()));
        await saveCfNodeGroups(env, updated);
        return authedJsonResponse({ success: true, count: idsToDelete.length });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    if (url.pathname.startsWith('/api/cf-groups/') && request.method === 'DELETE') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      const idToDelete = decodeURIComponent(url.pathname.replace('/api/cf-groups/', '')).toLowerCase();
      const updated = currentCfGroups.filter(g => g.id !== idToDelete);
      await saveCfNodeGroups(env, updated);
      return authedJsonResponse({ success: true });
    }

    // ==========================================================
    // 路由 8: 管理接口 - 批量或单条保存优选源 (/api/sources)
    // ==========================================================
    if (url.pathname === '/api/sources' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        // 支持批量传递 { sources: [...] }
        if (body.sources && Array.isArray(body.sources)) {
          const validated = body.sources.filter(s => s && s.url && isValidPublicUrl(s.url.trim())).map((s, idx) => ({
            id: (s.id || ('src_' + (idx + 1))).toLowerCase().trim(),
            name: s.name || ('优选源 ' + (idx + 1)),
            url: s.url.trim(),
            enabled: s.enabled !== false
          }));
          await saveSources(env, validated);
          return authedJsonResponse({ success: true, count: validated.length });
        }

        // 兼容单条传递 { id, name, url }
        if (!body.name || !body.url) {
          return authedJsonResponse({ error: '缺少必填字段（名称和地址为必填）' }, 400);
        }
        if (!isValidPublicUrl(body.url.trim())) {
          return authedJsonResponse({ error: '优选源地址必须为合法的公共 HTTP/HTTPS 地址，禁止私有网络地址' }, 400);
        }
        const targetId = (body.id || ('src_' + generateSecureRandomString(8, 25))).toLowerCase().trim();
        const updated = sources.filter(s => s.id !== targetId);
        const newSource = {
          id: targetId,
          name: body.name.trim(),
          url: body.url.trim(),
          enabled: true
        };
        updated.push(newSource);
        await saveSources(env, updated);
        return authedJsonResponse({ success: true, source: newSource });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 9: 管理接口 - 删除优选源 (/api/sources/:id)
    // ==========================================================
    if (url.pathname.startsWith('/api/sources/') && request.method === 'DELETE') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      const idToDelete = decodeURIComponent(url.pathname.replace('/api/sources/', '')).toLowerCase();
      const updated = sources.filter(s => s.id !== idToDelete);
      await saveSources(env, updated);
      return authedJsonResponse({ success: true });
    }

    // ==========================================================
    // 路由 9.5: 管理接口 - 测试实时生成 CF 优选节点 (/api/test-cf-nodes)
    // ==========================================================
    if (url.pathname === '/api/test-cf-nodes' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const testBase = body.baseVless || currentBaseVless || env.BASE_VLESS || '';
        let testSources = sources;

        if (Array.isArray(body.sources) && body.sources.length > 0) {
          testSources = body.sources;
        }

        const res = await fetchIPsAndGenerateNodes(testBase, testSources, 'raw');
        const text = await res.text();
        return authedJsonResponse({
          success: res.ok,
          status: res.status,
          content: text
        }, res.status);
      } catch (err) {
        return authedJsonResponse({
          success: false,
          content: '生成测试节点失败: ' + (err.message || String(err))
        }, 500);
      }
    }

    // ==========================================================
    // 路由 9.6: 管理接口 - 保存 IP 黑名单 (/api/blocked-ips)
    // ==========================================================
    if (url.pathname === '/api/blocked-ips' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const ips = Array.isArray(body.ips) ? body.ips.map(ip => String(ip).trim()).filter(ip => ip && !isLoopbackIP(ip)) : [];
        const oldBlocked = await getBlockedIPs(env);
        const removedIPs = oldBlocked.filter(ip => !ips.includes(ip));
        for (const rip of removedIPs) {
          await resetLoginFailedAttempts(env, rip);
        }
        await saveBlockedIPs(env, ips);
        return authedJsonResponse({ success: true, count: ips.length });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 9.65: 管理接口 - 保存 IP 白名单 (/api/whitelist-ips)
    // ==========================================================
    if (url.pathname === '/api/whitelist-ips' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const ips = Array.isArray(body.ips) ? body.ips.map(ip => String(ip).trim()).filter(Boolean) : [];
        await saveWhitelistIPs(env, ips);
        return authedJsonResponse({ success: true, count: ips.length });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    // ==========================================================
    // 路由 9.7: 管理接口 - 清空访问日志 (/api/clear-logs) 与批量删除日志 (/api/logs/batch-delete)
    // ==========================================================
    if (url.pathname === '/api/logs/batch-delete' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await request.json();
        const indicesToDelete = (Array.isArray(body.indices) ? body.indices : []).map(Number);
        const currentLogs = await getAccessLogs(env);
        const updated = currentLogs.filter((log, idx) => log && !indicesToDelete.includes(idx));
        await saveAccessLogs(env, updated);
        return authedJsonResponse({ success: true, count: indicesToDelete.length });
      } catch {
        return authedJsonResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }

    if (url.pathname === '/api/clear-logs' && request.method === 'POST') {
      if (!isAuthed) return new Response('Unauthorized', { status: 401 });
      await clearAccessLogs(env);
      return authedJsonResponse({ success: true });
    }





    // ==========================================================
    // 路由 9.8: 验证码异步获取/刷新接口 (/api/captcha)
    // ==========================================================
    if (url.pathname === '/api/captcha') {
      const { svgDataUri, captchaToken } = await getCaptcha();
      return new Response(JSON.stringify({ svg: svgDataUri, token: captchaToken }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }

    // ==========================================================
    // 路由 10: 登录提交 (/login)
    // ==========================================================
    if (url.pathname === '/login' && request.method === 'POST') {
      if (!hasKV || !hasAdmin) {
        return new Response(renderSetupNoticePage({ hasKV, hasAdmin }), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      try {
        // 先检查当前 IP 是否处于指数退避锁定冷却期内（本地回环与白名单豁免）
        const failStatus = await getLoginFailedAttempts(env, clientIP);
        if (!isLocal && !isWhitelisted && failStatus.count >= 3 && failStatus.lockSeconds > 0) {
          const { svgDataUri, captchaToken } = await getCaptcha();
          return new Response(
            renderLoginPage(
              '操作过于频繁，请稍后再试。',
              svgDataUri,
              captchaToken,
              failStatus.lockSeconds
            ),
            {
              status: 429,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        }

        const formData = await request.formData();
        const inputPassword = formData.get('password') || '';
        const inputCaptcha = formData.get('captcha') || '';
        const inputCaptchaToken = formData.get('captcha_token') || '';
        const isHttps = url.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';

        // 1. 验证码校验
        const isCaptchaValid = await checkCaptcha(inputCaptcha, inputCaptchaToken);
        const isPasswordValid = adminPassword && inputPassword === adminPassword;

        // 如果验证码和密码全部校验通过
        if (isCaptchaValid && isPasswordValid) {
          // 登录成功：重置该 IP 的登录失败计数与锁定状态
          await resetLoginFailedAttempts(env, clientIP);


          const sessionToken = await getSessionToken();
          return new Response(null, {
            status: 302,
            headers: {
              'Location': '/',
              'Set-Cookie': `auth_session=${sessionToken}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=600`
            }
          });
        }

        // 登录失败（无论是因为验证码错误还是密码错误）：统一记录递增失败次数并触发指数退避锁定
        const failResult = await recordLoginFailure(env, clientIP);
        const failCount = failResult.count;
        const lockDuration = failResult.lockSeconds;
        const lockMins = Math.ceil(lockDuration / 60);

        // 内部审计日志记录精确错误原因，对外模糊化
        let errorReason = '';
        let logErrorType = '';
        if (!isCaptchaValid) {
          errorReason = '验证码错误或已失效';
          logErrorType = '⚠️ 验证码错误';
        } else {
          errorReason = '管理员密码错误';
          logErrorType = '⚠️ 管理员密码错误';
        }

        // 若累计失败达到 3 次（白名单 IP 与本地开发环境豁免封禁），立即永久加入 IP 黑名单
        if (failCount >= 3 && !isWhitelisted && !isLocal) {
          const currentBlocked = await getBlockedIPs(env);
          if (!currentBlocked.includes(clientIP)) {
            currentBlocked.push(clientIP);
            await saveBlockedIPs(env, currentBlocked);
          }

          // 记录封禁日志
          const banLogPromise = recordAccessLog(env, {
            time: nowTime,
            ip: clientIP,
            location: clientLocation,
            status: 403,
            path: '/login',
            type: `🚫 连续登录失败达3次 (${errorReason})，IP 已被永久封禁`,
            ua: userAgent
          });
          if (ctx && ctx.waitUntil) ctx.waitUntil(banLogPromise);
          else await banLogPromise;

          return new Response('403 Forbidden', {
            status: 403,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }

        // 记录失败日志（未达3次或为白名单）
        const remaining = Math.max(0, 3 - failCount);
        const logPromise = recordAccessLog(env, {
          time: nowTime,
          ip: clientIP,
          location: clientLocation,
          status: 401,
          path: '/login',
          type: `${logErrorType} (第 ${failCount} 次失败，冷却锁定 ${lockMins} 分钟${isWhitelisted ? '，白名单豁免封禁' : `，剩余 ${remaining} 次将被永久封禁`})`,
          ua: userAgent
        });
        if (ctx && ctx.waitUntil) ctx.waitUntil(logPromise);
        else await logPromise;

        const { svgDataUri, captchaToken } = await getCaptcha();
        const errorMsg = '验证码或密码错误，请重试。';
        return new Response(
          renderLoginPage(errorMsg, svgDataUri, captchaToken, isWhitelisted ? 0 : lockDuration),
          {
            status: 401,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        );
      } catch {
        return new Response('Bad Request', { status: 400 });
      }
    }

    // ==========================================================
    // 路由 11: 退出登录 (/logout)
    // ==========================================================
    if (url.pathname === '/logout') {
      const isHttps = url.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login',
          'Set-Cookie': `auth_session=; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=0`
        }
      });
    }

    // ==========================================================
    // 路由 12: 控制台与管理员登录入口
    // ==========================================================
    if (url.pathname === '/login') {
      if (!hasKV || !hasAdmin) {
        return new Response(renderSetupNoticePage({ hasKV, hasAdmin }), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      if (isAuthed) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': '/' }
        });
      }
      const { svgDataUri, captchaToken } = await getCaptcha();
      const failStatus = await getLoginFailedAttempts(env, clientIP);
      const lockSec = isWhitelisted ? 0 : failStatus.lockSeconds;
      const initErrMsg = lockSec > 0
        ? `⚠️ 当前 IP 处于冷却锁定状态（剩余 ${lockSec} 秒），请稍后再试。`
        : '';
      return new Response(renderLoginPage(initErrMsg, svgDataUri, captchaToken, lockSec), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (url.pathname === '/') {
      if (!hasKV || !hasAdmin) {
        return new Response(renderSetupNoticePage({ hasKV, hasAdmin }), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      if (!isAuthed) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': '/login' }
        });
      }

      const logs = await getAccessLogs(env);
      const dashboardHtml = renderDashboardPage(
        url.origin,
        currentToken,
        sources,
        currentCustomGroups,
        currentCfGroups,
        logs,
        blockedIPs,
        whitelistIPs,
        globalAllowedCountries,
        proxyClientOnly,
        tgConfig
      );
      return attachSessionRenewal(new Response(dashboardHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }));
    }

    // ==========================================================
    // 路由 13: 404 未知路径兜底（高防探测防御：访问不存在页面直接拉黑 IP）
    // ==========================================================
    if (!isWhitelisted) {
      const currentBlocked = await getBlockedIPs(env);
      if (!currentBlocked.includes(clientIP) && !isLocal) {
        currentBlocked.push(clientIP);
        await saveBlockedIPs(env, currentBlocked);
      }

      const banLogPromise = recordAccessLog(env, {
        time: nowTime,
        ip: clientIP,
        location: clientLocation,
        status: 403,
        path: url.pathname,
        type: `🚫 恶意探测不存在路径 [${url.pathname}]，IP 已被自动封禁`,
        ua: userAgent
      });
      if (ctx && ctx.waitUntil) ctx.waitUntil(banLogPromise);
      else await banLogPromise;

      return new Response('403 Forbidden', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 白名单 IP 豁免封禁，仅记录日志并返回 404
    const notFoundLogPromise = recordAccessLog(env, {
      time: nowTime,
      ip: clientIP,
      location: clientLocation,
      status: 404,
      path: url.pathname,
      type: `⚠️ 访问不存在页面 [${url.pathname}] (白名单豁免)`,
      ua: userAgent
    });
    if (ctx && ctx.waitUntil) ctx.waitUntil(notFoundLogPromise);
    else await notFoundLogPromise;

    return new Response('404 Not Found', { status: 404 });
    } catch (err) {
      console.error('Unhandled Worker Exception:', err);
      return new Response(`500 Internal Server Error: ${err.message || String(err)}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }
};
