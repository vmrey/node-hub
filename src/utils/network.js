// src/utils/network.js
// Network‑related helper utilities used across the project

/**
 * Determine whether a string is an IP address (IPv4 or IPv6).
 */
export function isIpAddress(host) {
  if (!host || typeof host !== 'string') return false;
  const clean = host.trim().replace(/^\[|\]$/g, '');
  // IPv4
  if (/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})$/.test(clean)) return true;
  // IPv6 (contains at least two colons)
  if ((clean.match(/:/g) || []).length >= 2) return true;
  return false;
}

/**
 * Ensure IPv6 addresses are wrapped in square brackets for URI usage.
 */
export function formatHostAddress(host) {
  if (!host || typeof host !== 'string') return '';
  const clean = host.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) return clean;
  if ((clean.match(/:/g) || []).length >= 2) return `[${clean}]`;
  return clean;
}

/**
 * Extract a clean host (IP or domain) from a line that may contain ports or brackets.
 */
export function extractCleanHost(targetHost) {
  let clean = targetHost.trim();
  if (!clean) return '';
  // IPv6 with brackets
  if (clean.startsWith('[')) {
    const match = clean.match(/^\[([^\]]+)\](?::\d+)?/);
    if (match) return `[${match[1]}]`;
  }
  // Pure IPv6 without brackets
  if ((clean.match(/:/g) || []).length >= 2) return `[${clean}]`;
  // IPv4 with optional port
  const ipv4Match = clean.match(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})(?::\d+)?/);
  if (ipv4Match) return ipv4Match[1];
  // Domain with optional port
  const domainMatch = clean.match(/^([a-zA-Z0-9.-]+)(?::\d+)?/);
  if (domainMatch) return domainMatch[1];
  return clean.split(':')[0].trim();
}

/**
 * Check if an IP is a loopback address.
 */
export function isLoopbackIP(ip) {
  if (!ip) return false;
  const clean = ip.trim().toLowerCase();
  return clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' || clean.startsWith('127.');
}

/**
 * Determine whether an IP is present in a list (supports CIDR patterns).
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
 * Low‑level CIDR matching used by isIPInList.
 */
function ipv4ToLong(ip) {
  const parts = ip.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
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
    const mask = prefixLen === 32 ? 0xffffffff : (~((1 << (32 - prefixLen)) - 1)) >>> 0;
    return (ipLong & mask) === (rangeLong & mask);
  }
  // IPv6 simple prefix check (best‑effort)
  if (ip.includes(':') && range.includes(':')) {
    const normIp = ip.toLowerCase();
    const normRange = range.toLowerCase();
    if (prefixLen <= 64 && normIp.startsWith(normRange.replace(/::?$/, ''))) return true;
  }
  return false;
}
