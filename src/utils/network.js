// src/utils/network.js
// 项目全局网络、IP与域名相关处理辅助工具库

/**
 * 判断指定字符串是否为合法的 IP 地址（同时支持 IPv4 与 IPv6）
 */
export function isIpAddress(host) {
  if (!host || typeof host !== 'string') return false;
  const clean = host.trim().replace(/^\[|\]$/g, '');
  // IPv4 地址校验
  if (/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})$/.test(clean)) return true;
  // IPv6 地址校验（至少包含两个冒号）
  if ((clean.match(/:/g) || []).length >= 2) return true;
  return false;
}

/**
 * 确保 IPv6 地址外层包裹方括号以符合 URI 标准规范
 */
export function formatHostAddress(host) {
  if (!host || typeof host !== 'string') return '';
  const clean = host.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) return clean;
  if ((clean.match(/:/g) || []).length >= 2) return `[${clean}]`;
  return clean;
}

/**
 * 辅助方法：解析 IPv6 CIDR，将全 0 子网网段基址转换为首个可用主机地址（如 2400:cb00:: 转换为 2400:cb00::1）
 */
export function resolveIpv6Cidr(rawIp) {
  let ip = (rawIp || '').trim();
  if (ip.includes('/')) {
    ip = ip.split('/')[0].trim();
  }
  if (ip.endsWith('::')) {
    return `${ip}1`;
  }
  if (ip.endsWith('::0')) {
    return ip.slice(0, -3) + '::1';
  }
  if (ip.endsWith(':0')) {
    return ip.slice(0, -2) + ':1';
  }
  return ip;
}

/**
 * 辅助方法：从可能包含端口、CIDR 子网掩码或中括号的主机字符串中解析出标准 Host 与 Port
 * 兼容：
 * - IPv4: 1.1.1.1 / 1.1.1.1:443
 * - IPv4 CIDR: 173.245.48.0/20（自动转首个可用地址 173.245.48.1）
 * - IPv6: [2606:4700::1]:443 / 2606:4700::1
 * - IPv6 CIDR: 2400:cb00::/32（自动转首个可用地址 [2400:cb00::1]）
 * - 域名: example.com / example.com:443
 */
export function parseHostAndPort(rawHost, defaultPort = '') {
  let clean = String(rawHost || '').trim().replace(/^["']|["']$/g, '').trim();
  if (!clean) return null;

  let port = defaultPort ? String(defaultPort).trim() : '';

  // 1. 中括号包裹的 IPv6（含可能带端口或 CIDR，如 [2400:cb00::/32]:443 或 [2606:4700::1]）
  if (clean.startsWith('[')) {
    const bracketMatch = clean.match(/^\[([^\]]+)\](?::(\d+))?$/);
    if (bracketMatch) {
      let inner = bracketMatch[1].trim();
      if (bracketMatch[2]) port = bracketMatch[2];
      if (inner.includes('/')) {
        inner = resolveIpv6Cidr(inner);
      }
      return { host: `[${inner}]`, port };
    }
  }

  // 2. IPv4 带 CIDR（如 173.245.48.0/20 或 173.245.48.0/20:443）
  const ipv4CidrMatch = clean.match(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})\/(\d{1,2})(?::(\d+))?$/);
  if (ipv4CidrMatch) {
    let ip = ipv4CidrMatch[1];
    if (ipv4CidrMatch[3]) port = ipv4CidrMatch[3];
    // 若网段基址以 .0 结尾，智能转换为该网段首个可用主机地址 .1（确保客户端套接字握手兼容）
    ip = ip.replace(/\.0$/, '.1');
    return { host: ip, port };
  }

  // 3. IPv6 带 CIDR（如 2400:cb00::/32 或 2606:4700::/32:443）
  if (clean.includes(':') && clean.includes('/')) {
    const ipv6CidrMatch = clean.match(/^([a-fA-F0-9:]+)\/(\d{1,3})(?::(\d+))?$/);
    if (ipv6CidrMatch) {
      let ip = ipv6CidrMatch[1];
      if (ipv6CidrMatch[3]) port = ipv6CidrMatch[3];
      ip = resolveIpv6Cidr(ip);
      return { host: `[${ip}]`, port };
    }
  }

  // 4. 标准 IPv4 格式（如 1.1.1.1:443 或 1.1.1.1）
  const ipv4Match = clean.match(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})(?::(\d+))?$/);
  if (ipv4Match) {
    if (ipv4Match[2]) port = ipv4Match[2];
    return { host: ipv4Match[1], port };
  }

  // 5. 纯 IPv6 格式（至少含两个冒号）
  if ((clean.match(/:/g) || []).length >= 2) {
    return { host: `[${clean}]`, port };
  }

  // 6. 域名格式（如 cf.090227.xyz:443 或 example.com）
  const domainMatch = clean.match(/^([a-zA-Z0-9.-]+)(?::(\d+))?$/);
  if (domainMatch) {
    if (domainMatch[2]) port = domainMatch[2];
    return { host: domainMatch[1], port };
  }

  return { host: clean.split(':')[0].trim(), port };
}

/**
 * 从可能包含端口号或方括号的文本行中精准提取纯净的主机名（IP 地址或域名，支持 CIDR 网段自动转可用 IP）
 */
export function extractCleanHost(targetHost) {
  const parsed = parseHostAndPort(targetHost);
  return parsed ? parsed.host : '';
}

/**
 * 判断指定 IP 地址是否为本地回环开发调试地址
 */
export function isLoopbackIP(ip) {
  if (!ip) return false;
  const clean = ip.trim().toLowerCase();
  return clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' || clean.startsWith('127.');
}

/**
 * 判断客户端 IP 是否匹配指定 IP 名单列表（支持 CIDR 子网掩码匹配模式）
 */
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

/**
 * 底层辅助函数：将 IPv4 字符串转换为 32 位长整数
 */
function ipv4ToLong(ip) {
  const parts = ip.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * 底层辅助函数：执行精确 CIDR 网段掩码比对
 */
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
    const mask = prefixLen === 32 ? 0xffffffff : (~((1 << (32 - prefixLen)) - 1)) >>> 0;
    return (ipLong & mask) === (rangeLong & mask);
  }
  // IPv6 简易前缀匹配校验
  if (ip.includes(':') && range.includes(':')) {
    const normIp = ip.toLowerCase();
    const normRange = range.toLowerCase();
    if (prefixLen <= 64 && normIp.startsWith(normRange.replace(/::?$/, ''))) return true;
  }
  return false;
}
