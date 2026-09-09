import { encrypt, decrypt } from './cipherTool.js';

// 默认内置优选源配置
const DEFAULT_SOURCES = [
  { id: 'cmcc', name: '中国移动 (CMCC)', url: 'https://cf.090227.xyz/cmcc?ips=10', enabled: true },
  { id: 'cu', name: '中国联通 (CU)', url: 'https://cf.090227.xyz/cu?ips=10', enabled: true },
  { id: 'ct', name: '中国电信 (CT)', url: 'https://cf.090227.xyz/ct?ips=10', enabled: true }
];

// 获取底层数据加解密口令密钥（优先读取环境变量，若未配置则从 KV 读取或自动生成 64~128 位真随机密钥并持久化锁定）
let memorySecretKey = null;

export async function getSecretKey(env) {
  if (memorySecretKey) {
    return memorySecretKey;
  }
  if (env.CIPHER_KEY && env.CIPHER_KEY.trim()) {
    memorySecretKey = env.CIPHER_KEY.trim();
    return memorySecretKey;
  }
  const kv = getKV(env);
  if (kv) {
    try {
      const storedKey = await kv.get('sys_cipher_key');
      if (storedKey && storedKey.trim() && storedKey.trim().length >= 16) {
        memorySecretKey = storedKey.trim();
        return memorySecretKey;
      }
    } catch (e) {
      console.error('Failed to read sys_cipher_key from KV', e);
    }
  }

  // 默认自动在 64 ~ 128 长度区间动态随机生成高强度安全真随机密钥并持久化写入 KV
  const randomLenArray = new Uint8Array(1);
  crypto.getRandomValues(randomLenArray);
  const randomLen = 64 + (randomLenArray[0] % 65); // 动态生成 64 到 128 之间任意长度
  const generatedKey = generateSecureRandomString(randomLen);
  if (kv) {
    try {
      await kv.put('sys_cipher_key', generatedKey);
    } catch (e) {
      console.error('Failed to save auto-generated sys_cipher_key to KV', e);
    }
  }
  memorySecretKey = generatedKey;
  return memorySecretKey;
}

// 计算 SHA-256 哈希值
export async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 解析 Cookie
export function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

// UTF-8 安全 Base64 编码
export function safeBase64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// UTF-8 安全 Base64 解码
export function safeBase64Decode(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    // 清理首尾空格及内部换行符，兼容 URL-Safe Base64
    let clean = str.trim().replace(/\s+/g, '');
    let base64 = clean.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

// 获取 KV 命名空间绑定对象
function getKV(env) {
  return env.KV || null;
}

// 读取基础节点配置（从 KV 读取加密密文并解密，兜底取 env.BASE_VLESS）
export async function getBaseVless(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_base_vless');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted && decrypted.trim()) {
          return decrypted.trim();
        }
        if (stored.trim().startsWith('vless://')) {
          return stored.trim();
        }
      }
    } catch (e) {
      console.error('Failed to read custom_base_vless from KV', e);
    }
  }
  return env.BASE_VLESS || '';
}

// 保存基础节点配置到存储（加密写入 custom_base_vless）
export async function saveBaseVless(env, baseVless) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const encrypted = encrypt((baseVless || '').trim(), secret);
    await kv.put('custom_base_vless', encrypted);
  }
}

// 读取存储中的优选源列表（从 KV 读取加密密文并解密）
export async function getSources(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_sources');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        let parsed = null;
        if (decrypted) {
          try { parsed = JSON.parse(decrypted); } catch {}
        }
        if (!parsed && (stored.startsWith('[') || stored.startsWith('{'))) {
          try { parsed = JSON.parse(stored); } catch {}
        }
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read from KV', e);
    }
  }
  return DEFAULT_SOURCES;
}

// 保存优选源列表到存储（使用 cipherTool.encrypt 加密存储）
export async function saveSources(env, sources) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const jsonStr = JSON.stringify(sources);
    const encrypted = encrypt(jsonStr, secret);
    await kv.put('custom_sources', encrypted);
  }
}

// 读取多组普通订阅列表配置（从 KV 读取加密密文并解密，返回数组）
export async function getCustomNodeGroups(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_plain_groups');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          try {
            const parsed = JSON.parse(decrypted);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
        }
      }
    } catch (e) {
      console.error('Failed to read custom_plain_groups from KV', e);
    }
  }
  return [];
}

// 保存多组普通订阅列表配置到存储（物理覆盖写入，确保删除项彻底清除）
export async function saveCustomNodeGroups(env, groups) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const jsonStr = JSON.stringify(groups);
    const encrypted = encrypt(jsonStr, secret);
    await kv.put('custom_plain_groups', encrypted);
  }
}

// 读取多组 CF 优选订阅列表配置（从 KV 读取加密密文并解密，返回数组）
export async function getCfNodeGroups(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_cf_groups');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          try {
            const parsed = JSON.parse(decrypted);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
        }
      }
    } catch (e) {
      console.error('Failed to read custom_cf_groups from KV', e);
    }
  }
  return [];
}

// 保存多组 CF 优选订阅列表配置到存储（物理覆盖写入，确保删除彻底）
export async function saveCfNodeGroups(env, groups) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const jsonStr = JSON.stringify(groups);
    const encrypted = encrypt(jsonStr, secret);
    await kv.put('custom_cf_groups', encrypted);
  }
}

// 生成高强度安全随机字符串（字符集包含大小写字母与数字：a-zA-Z0-9，支持指定长度或动态区间）
export function generateSecureRandomString(minOrExact = 12, max = null) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let length;
  if (max === null) {
    length = minOrExact;
  } else {
    const minLen = Math.min(minOrExact, max);
    const maxLen = Math.max(minOrExact, max);
    const lengthBytes = new Uint8Array(1);
    crypto.getRandomValues(lengthBytes);
    length = minLen + (lengthBytes[0] % (maxLen - minLen + 1));
  }
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

// 读取自定义订阅路由路径 (严格读取最新配置，优先从 KV 覆盖层读取)
export async function getSubPath(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_sub_path');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted && decrypted.trim()) {
          return decrypted.trim().replace(/^\/+|\/+$/g, '');
        }
      }
    } catch (e) {
      console.error('Failed to read custom_sub_path from KV', e);
    }
  }
  
  if (env.SUB_PATH && env.SUB_PATH.trim()) {
    return env.SUB_PATH.trim().replace(/^\/+|\/+$/g, '');
  }

  // 默认自动生成 12 ~ 33 位高强度随机路由路径 (a-zA-Z0-9) 并持久化覆盖保存
  const randomPath = generateSecureRandomString(12, 33);
  if (kv) {
    try {
      await saveSubPath(env, randomPath);
    } catch {}
  }
  return randomPath;
}

// 保存自定义订阅路由路径 (直接物理覆盖旧值)
export async function saveSubPath(env, subPath) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const cleanPath = (subPath || generateSecureRandomString(12, 33)).trim().replace(/^\/+|\/+$/g, '');
    const encrypted = encrypt(cleanPath, secret);
    await kv.put('custom_sub_path', encrypted);
  }
}

// 读取自定义订阅令牌 TOKEN (严格读取最新配置，优先从 KV 覆盖层读取)
export async function getToken(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_token');
      if (stored !== null && stored !== undefined) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        // 若 KV 存在记录且成功解密（即使是空字符串，也代表用户显式清空了 Token），直接采纳
        if (typeof decrypted === 'string') {
          return decrypted.trim();
        }
      }
    } catch (e) {
      console.error('Failed to read custom_token from KV', e);
    }
  }

  if (env.TOKEN && env.TOKEN.trim()) {
    return env.TOKEN.trim();
  }

  // 默认自动生成 12 ~ 33 位高强度防盗刷安全令牌 (a-zA-Z0-9) 并持久化覆盖保存
  const randomTokenStr = generateSecureRandomString(12, 33);
  if (kv) {
    try {
      await saveToken(env, randomTokenStr);
    } catch {}
  }
  return randomTokenStr;
}

// 保存自定义订阅令牌 TOKEN (允许保存为空串实现免 Token 访问)
export async function saveToken(env, token) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const val = (token === undefined || token === null) ? '' : String(token).trim();
    const encrypted = encrypt(val, secret);
    await kv.put('custom_token', encrypted);
  }
}

// 读取全局允许访问订阅的国家/地区代码列表 (空数组表示全开放)
export async function getAllowedCountries(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_allowed_countries');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          if (Array.isArray(parsed)) return parsed.map(c => String(c).trim().toUpperCase()).filter(Boolean);
        }
      }
    } catch (e) {
      console.error('Failed to read custom_allowed_countries from KV', e);
    }
  }
  if (env.ALLOWED_COUNTRIES && env.ALLOWED_COUNTRIES.trim()) {
    return env.ALLOWED_COUNTRIES.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
  }
  return [];
}

// 保存全局允许访问订阅的国家/地区代码列表
export async function saveAllowedCountries(env, countries) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const list = Array.isArray(countries)
      ? countries.map(c => String(c).trim().toUpperCase()).filter(Boolean)
      : (typeof countries === 'string' ? countries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean) : []);
    const encrypted = encrypt(JSON.stringify(list), secret);
    await kv.put('custom_allowed_countries', encrypted);
  }
}

// 读取是否开启“仅限代理客户端访问” (默认为 true)
export async function getProxyClientOnly(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_proxy_client_only');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted !== null && decrypted !== undefined) {
          return decrypted === 'true' || decrypted === true;
        }
      }
    } catch (e) {
      console.error('Failed to read custom_proxy_client_only from KV', e);
    }
  }
  if (env.PROXY_CLIENT_ONLY !== undefined && env.PROXY_CLIENT_ONLY !== null && env.PROXY_CLIENT_ONLY !== '') {
    return String(env.PROXY_CLIENT_ONLY).toLowerCase() === 'true';
  }
  return true; // 默认开启
}

// 保存“仅限代理客户端访问”状态
export async function saveProxyClientOnly(env, enabled) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const val = (enabled === true || enabled === 'true') ? 'true' : 'false';
    const encrypted = encrypt(val, secret);
    await kv.put('custom_proxy_client_only', encrypted);
  }
}

// ==========================================
// 🛡️ IP 黑名单屏蔽与访问日志存储体系
// ==========================================

// 读取屏蔽 IP 黑名单列表
export async function getBlockedIPs(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('blocked_ips');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read blocked_ips from KV', e);
    }
  }
  return [];
}

// 保存屏蔽 IP 黑名单列表
export async function saveBlockedIPs(env, ips) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const jsonStr = JSON.stringify(ips);
    const encrypted = encrypt(jsonStr, secret);
    await kv.put('blocked_ips', encrypted);
  }
}

// 读取允许访问 IP 白名单列表
export async function getWhitelistIPs(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('whitelist_ips');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read whitelist_ips from KV', e);
    }
  }
  return [];
}

// 保存允许访问 IP 白名单列表
export async function saveWhitelistIPs(env, ips) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const jsonStr = JSON.stringify(ips);
    const encrypted = encrypt(jsonStr, secret);
    await kv.put('whitelist_ips', encrypted);
  }
}

// 读取访问日志记录 (最近 100 条)
export async function getAccessLogs(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('access_logs');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read access_logs from KV', e);
    }
  }
  return [];
}

// 记录一条访问日志 (限制最多保留最新 100 条，防止体积膨胀)
export async function recordAccessLog(env, logItem) {
  const kv = getKV(env);
  if (!kv) return;
  try {
    const current = await getAccessLogs(env);
    const updated = [logItem, ...current].slice(0, 100);
    const secret = await getSecretKey(env);
    const encrypted = encrypt(JSON.stringify(updated), secret);
    await kv.put('access_logs', encrypted);
  } catch (e) {
    console.error('Failed to record access log in KV', e);
  }
}

// 保存访问日志列表 (直接物理覆盖)
export async function saveAccessLogs(env, logs) {
  const kv = getKV(env);
  if (!kv) return;
  try {
    const secret = await getSecretKey(env);
    const encrypted = encrypt(JSON.stringify(logs.slice(0, 100)), secret);
    await kv.put('access_logs', encrypted);
  } catch (e) {
    console.error('Failed to save access logs to KV', e);
  }
}

// 清空所有访问日志
export async function clearAccessLogs(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      await kv.delete('access_logs');
    } catch {}
  }
}

// ==========================================
// 🔒 登录防爆破与 IP 指数退避锁定体系 (1分, 2分, 4分, 8分, 16分...)
// ==========================================

// 获取指定 IP 的登录失败状态 { count: number, lockUntil: number, lockSeconds: number }
export async function getLoginFailedAttempts(env, ip) {
  const kv = getKV(env);
  if (!kv || !ip) return { count: 0, lockUntil: 0, lockSeconds: 0 };
  try {
    const key = 'login_fail_' + ip.trim();
    const stored = await kv.get(key);
    if (stored) {
      const secret = await getSecretKey(env);
      const decrypted = decrypt(stored.trim(), secret) || stored.trim();
      let data = null;
      try {
        data = JSON.parse(decrypted);
      } catch {
        const count = parseInt(decrypted, 10);
        if (!isNaN(count)) data = { count, lockUntil: 0 };
      }

      if (data && typeof data.count === 'number') {
        const now = Date.now();
        const lockUntil = Number(data.lockUntil || 0);
        const lockSeconds = lockUntil > now ? Math.ceil((lockUntil - now) / 1000) : 0;
        return {
          count: data.count,
          lockUntil: lockUntil,
          lockSeconds: lockSeconds
        };
      }
    }
  } catch (e) {
    console.error('Failed to read login_fail count from KV', e);
  }
  return { count: 0, lockUntil: 0, lockSeconds: 0 };
}

// 递增并记录指定 IP 连续登录失败次数，并在连续失败 >= 3 次时根据指数退避算法计算锁定时间 (1, 2, 4, 8, 16分钟)
export async function recordLoginFailure(env, ip) {
  const kv = getKV(env);
  if (!kv || !ip) return { count: 1, lockUntil: 0, lockSeconds: 0 };
  try {
    const info = await getLoginFailedAttempts(env, ip);
    const updatedCount = info.count + 1;
    
    // 前 2 次错误不触发冷却锁定；达到第 3 次及以上时才开启指数退避锁定 (60s, 120s, 240s...)
    let lockDurationSec = 0;
    let lockUntil = 0;
    if (updatedCount >= 3) {
      lockDurationSec = 60 * Math.pow(2, updatedCount - 3);
      const now = Date.now();
      lockUntil = now + (lockDurationSec * 1000);
    }

    const recordData = {
      count: updatedCount,
      lockUntil: lockUntil
    };

    const key = 'login_fail_' + ip.trim();
    const secret = await getSecretKey(env);
    const encrypted = encrypt(JSON.stringify(recordData), secret);
    
    const ttl = Math.max(86400, lockDurationSec + 3600);
    await kv.put(key, encrypted, { expirationTtl: ttl });

    return {
      count: updatedCount,
      lockUntil: lockUntil,
      lockSeconds: lockDurationSec
    };
  } catch (e) {
    console.error('Failed to update login_fail in KV', e);
  }
  return { count: 1, lockUntil: 0, lockSeconds: 0 };
}

// 登录成功时重置该 IP 失败计数与锁定状态
export async function resetLoginFailedAttempts(env, ip) {
  const kv = getKV(env);
  if (!kv || !ip) return;
  try {
    const key = 'login_fail_' + ip.trim();
    await kv.delete(key);
  } catch {}
}

// ==========================================
// ⏱️ 会话有效期 (10分钟) 令牌生成与严格校验
// ==========================================
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 分钟 (600 秒)

// 生成携带 10 分钟过期时间戳的高安全密文会话令牌
export async function createSessionToken(env, adminHash) {
  const secret = await getSecretKey(env);
  const expireAt = Date.now() + SESSION_DURATION_MS;
  return encrypt(`${adminHash}:${expireAt}`, secret);
}

// 校验会话令牌并判断是否仍在 10 分钟有效期内
export async function verifySessionToken(env, token, adminHash, adminPassword) {
  if (!getKV(env) || !adminPassword) return false; // 未绑定 KV 或未设置管理员密码时禁止通行
  if (!token || !token.trim()) return false;
  try {
    const secret = await getSecretKey(env);
    const decrypted = decrypt(token.trim(), secret);
    if (!decrypted || !decrypted.includes(':')) {
      // 兼容直接存放哈希值的旧令牌
      return decrypted === adminHash;
    }
    const [hash, expireAtStr] = decrypted.split(':');
    const expireAt = parseInt(expireAtStr, 10);
    if (Date.now() > expireAt) return false; // 超过 10 分钟未活动已超时
    return hash === adminHash;
  } catch {
    return false;
  }
}

// ==========================================
// 🛡️ CIDR 网段与 IP 智能匹配引擎 (IPv4 & IPv6)
// ==========================================
function ipv4ToLong(ip) {
  const parts = ip.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
}

function matchCIDR(ip, cidr) {
  if (!cidr.includes('/')) return ip.toLowerCase() === cidr.toLowerCase();
  const [range, bitsStr] = cidr.split('/');
  const prefixLen = parseInt(bitsStr, 10);
  if (isNaN(prefixLen)) return false;

  const ipLong = ipv4ToLong(ip);
  const rangeLong = ipv4ToLong(range);
  if (ipLong !== null && rangeLong !== null) {
    if (prefixLen <= 0) return true;
    if (prefixLen > 32) return false;
    const mask = prefixLen === 32 ? 0xFFFFFFFF : (~((1 << (32 - prefixLen)) - 1)) >>> 0;
    return (ipLong & mask) === (rangeLong & mask);
  }

  // IPv6 前缀匹配
  if (ip.includes(':') && range.includes(':')) {
    const normIp = ip.toLowerCase();
    const normRange = range.toLowerCase();
    if (prefixLen <= 64 && normIp.startsWith(normRange.replace(/::?$/, ''))) {
      return true;
    }
  }

  return false;
}

export function isLoopbackIP(ip) {
  if (!ip) return false;
  const clean = ip.trim().toLowerCase();
  return clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' || clean.startsWith('127.');
}

export function isIPInList(ip, list) {
  if (!ip || !Array.isArray(list) || list.length === 0) return false;
  const cleanIp = ip.trim();
  for (const item of list) {
    const pattern = String(item).trim();
    if (!pattern) continue;
    try {
      if (matchCIDR(cleanIp, pattern)) return true;
    } catch {
      if (cleanIp.toLowerCase() === pattern.toLowerCase()) return true;
    }
  }
  return false;
}

// ==========================================
// 🛡️ 订阅 Token 爆破防御：连续错误计数与记录
// ==========================================
export async function recordSubTokenFailure(env, ip) {
  const kv = getKV(env);
  if (!kv || !ip) return 1;
  try {
    const key = 'sub_fail_' + ip.trim();
    const stored = await kv.get(key);
    let count = 0;
    if (stored) {
      const secret = await getSecretKey(env);
      const dec = decrypt(stored.trim(), secret);
      count = parseInt(dec, 10) || 0;
    }
    count += 1;
    const secret = await getSecretKey(env);
    const enc = encrypt(String(count), secret);
    await kv.put(key, enc, { expirationTtl: 3600 });
    return count;
  } catch {
    return 1;
  }
}

export async function resetSubTokenFailure(env, ip) {
  const kv = getKV(env);
  if (!kv || !ip) return;
  try {
    await kv.delete('sub_fail_' + ip.trim());
  } catch {}
}

// ==========================================
// ✈️ Telegram 机器人通知集成体系
// ==========================================

// 读取 Telegram 机器人通知配置 (优先 KV，兜底取环境变量)
export async function getTgConfig(env) {
  let token = (env.TG_BOT_TOKEN || '').trim();
  let chatId = (env.TG_CHAT_ID || '').trim();
  let apiHost = (env.TG_API_HOST || '').trim().replace(/\/+$/, '') || 'https://api.telegram.org';
  let enabled = env.TG_NOTIFY_ENABLED !== undefined && env.TG_NOTIFY_ENABLED !== null && env.TG_NOTIFY_ENABLED !== ''
    ? String(env.TG_NOTIFY_ENABLED).toLowerCase() === 'true'
    : false;

  const kv = getKV(env);
  if (kv) {
    try {
      const stored = await kv.get('custom_tg_config');
      if (stored && stored.trim()) {
        const secret = await getSecretKey(env);
        const decrypted = decrypt(stored.trim(), secret);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          if (parsed && typeof parsed === 'object') {
            if (parsed.token !== undefined) token = String(parsed.token).trim();
            if (parsed.chatId !== undefined) chatId = String(parsed.chatId).trim();
            if (parsed.apiHost !== undefined && String(parsed.apiHost).trim()) {
              apiHost = String(parsed.apiHost).trim().replace(/\/+$/, '');
            }
            if (parsed.enabled !== undefined) enabled = parsed.enabled === true || parsed.enabled === 'true';
          }
        }
      }
    } catch (e) {
      console.error('Failed to read custom_tg_config from KV', e);
    }
  }

  return { token, chatId, apiHost, enabled };
}

// 清洗与标准化 Telegram Bot Token (去除误带的 bot 前缀与首尾空格)
export function cleanTgToken(rawToken) {
  if (!rawToken) return '';
  let token = String(rawToken).trim();
  if (token.toLowerCase().startsWith('bot')) {
    token = token.slice(3).trim();
  }
  return token;
}

// 清洗与标准化 Telegram Chat ID (兼容超级群链接、群组ID、频道@用户名)
export function cleanTgChatId(rawChatId) {
  if (!rawChatId) return '';
  let id = String(rawChatId).trim();
  const cMatch = id.match(/t\.me\/c\/(\d+)/i);
  if (cMatch) {
    return `-100${cMatch[1]}`;
  }
  const userMatch = id.match(/t\.me\/([a-zA-Z0-9_]+)/i);
  if (userMatch && !['c', 'joinchat', 'addstickers'].includes(userMatch[1].toLowerCase())) {
    return `@${userMatch[1]}`;
  }
  return id;
}

// 保存 Telegram 机器人通知配置 (密文落盘)
export async function saveTgConfig(env, config) {
  const kv = getKV(env);
  if (kv) {
    const secret = await getSecretKey(env);
    const data = {
      token: cleanTgToken(config.token),
      chatId: cleanTgChatId(config.chatId),
      apiHost: (config.apiHost || '').trim().replace(/\/+$/, '') || 'https://api.telegram.org',
      enabled: config.enabled === true || config.enabled === 'true'
    };
    const encrypted = encrypt(JSON.stringify(data), secret);
    await kv.put('custom_tg_config', encrypted);
  }
}

// 发送 Telegram 消息
export async function sendTelegramMessage(env, text, tgConfig = null) {
  try {
    const cfg = tgConfig || await getTgConfig(env);
    if (!cfg.enabled && !tgConfig?.force) {
      return { success: false, error: 'Telegram 通知推送未开启' };
    }
    const token = cleanTgToken(cfg.token);
    const chatId = cleanTgChatId(cfg.chatId);
    if (!token || !chatId) {
      return { success: false, error: 'Bot Token 或 Chat ID 为空' };
    }

    const baseHost = (cfg.apiHost || 'https://api.telegram.org').replace(/\/+$/, '');
    const url = `${baseHost}/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const resData = await response.json().catch(() => null);

    if (!response.ok || (resData && !resData.ok)) {
      const errDetail = resData?.description || (await response.text().catch(() => '')) || `HTTP ${response.status}`;
      return { success: false, error: `TG API 响应错误 [HTTP ${response.status}]: ${errDetail}` };
    }

    return {
      success: true,
      chat: resData?.result?.chat || null,
      messageId: resData?.result?.message_id || null
    };
  } catch (err) {
    return { success: false, error: `网络请求失败: ${err.message}` };
  }
}


