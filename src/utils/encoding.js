/* src/utils/encoding.js */
// 项目全局通用编解码辅助函数工具库

/**
 * 将 UTF-8 字符串编码为 URL 安全的标准 Base64 字符串
 */
export function safeBase64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 将 Base64（或 URL 安全型 Base64）字符串安全解码还原为 UTF-8 字符串
 */
export function safeBase64Decode(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    // 清除空白字符并替换 URL 安全字符
    let clean = str.trim().replace(/\s+/g, '');
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    // 补齐 4 字节倍数 Base64 填充符
    while (clean.length % 4) clean += '=';
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/**
 * 安全的 encodeURIComponent 封装函数（永不抛出异常）
 */
export function safeEncodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    return encodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * 安全的 decodeURIComponent 封装函数（永不抛出异常）
 */
export function safeDecodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
