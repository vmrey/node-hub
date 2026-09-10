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
 * 从可能包含端口号或方括号的文本行中精准提取纯净的主机名（IP 地址或域名）
 */
export function extractCleanHost(targetHost) {
  let clean = targetHost.trim();
  if (!clean) return '';
  // 带方括号的 IPv6
  if (clean.startsWith('[')) {
    const match = clean.match(/^\[([^\]]+)\](?::\d+)?/);
    if (match) return `[${match[1]}]`;
  }
  // 不带方括号的纯 IPv6
  if ((clean.match(/:/g) || []).length >= 2) return `[${clean}]`;
  // 带可选端口的 IPv4
  const ipv4Match = clean.match(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})(?::\d+)?/);
  if (ipv4Match) return ipv4Match[1];
  // 带可选端口的域名
  const domainMatch = clean.match(/^([a-zA-Z0-9.-]+)(?::\d+)?/);
  if (domainMatch) return domainMatch[1];
  return clean.split(':')[0].trim();
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
