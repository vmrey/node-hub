/**
 * 轻量可逆加密工具库 (JavaScript / Workers 版)
 * 特性：
 * 1. 零外部依赖，极度轻量；
 * 2. 基于 64 位打乱码表 + 动态异或 (XOR) 双重混淆；
 * 3. 完美兼容中文、Emoji、URL 参数串及各类特殊符号；
 * 4. 支持任意文本口令，确定性衍生专属暗号字典。
 */

const BASE_ALPHABET = 'X0qP-4iIdcUrmtGnLWw531shzKavoT8bufRMZlDHSFye2Q76CgxjBpA_Vk9YNOJE';

const deriveKeys = (keyPhrase = '') => {
  const text = String(keyPhrase).trim();
  if (!text) {
    return {
      cipherMap: BASE_ALPHABET,
      xorKey: 88
    };
  }

  const chars = BASE_ALPHABET.split('');

  // FNV-1a 哈希生成 32 位种子
  let seed = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    seed ^= text.charCodeAt(i);
    seed = Math.imul(seed, 0x01000193) >>> 0;
  }

  const xorKey = seed & 0xff;

  // Mulberry32 确定性随机数发生器
  const prng = () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Fisher-Yates 确定性洗牌算法
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return {
    cipherMap: chars.join(''),
    xorKey
  };
};

const utf8ToBytes = (str) => {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const low = str.charCodeAt(++i);
      code = (code - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
};

const bytesToUtf8 = (bytes) => {
  const chars = [];
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    let code, extra;
    if (b < 0x80) {
      code = b; extra = 0;
    } else if ((b & 0xe0) === 0xc0) {
      code = b & 0x1f; extra = 1;
    } else if ((b & 0xf0) === 0xe0) {
      code = b & 0x0f; extra = 2;
    } else if ((b & 0xf8) === 0xf0) {
      code = b & 0x07; extra = 3;
    } else {
      chars.push(''); i++; continue;
    }
    if (i + extra >= bytes.length) {
      chars.push(''); break;
    }
    for (let j = 0; j < extra; j++) {
      code = (code << 6) | (bytes[++i] & 0x3f);
    }
    i++;
    if (code > 0xffff) {
      code -= 0x10000;
      chars.push(String.fromCharCode(0xd800 | (code >> 10), 0xdc00 | (code & 0x3ff)));
    } else {
      chars.push(String.fromCharCode(code));
    }
  }
  return chars.join('');
};

const bytesToBase64 = (bytes, cipherMap) => {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += cipherMap[b0 >> 2];
    out += cipherMap[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? cipherMap[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? cipherMap[b2 & 0x3f] : '=';
  }
  return out;
};

const base64ToBytes = (base64, cipherMap) => {
  if (!base64) return null;
  let clean = String(base64).trim();
  while (clean.endsWith('=')) clean = clean.slice(0, -1);
  if (!clean) return null;
  const bytes = [];
  let buffer = 0, bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const value = cipherMap.indexOf(clean[i]);
    if (value < 0) return null;
    buffer = ((buffer << 6) | value) & 0xffffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
};

export const encrypt = (str, keyPhrase = '') => {
  if (!str) return '';
  const { cipherMap, xorKey } = deriveKeys(keyPhrase);
  const bytes = utf8ToBytes(str);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = (bytes[i] ^ ((xorKey + i) & 0xff)) & 0xff;
  }
  return bytesToBase64(bytes, cipherMap);
};

export const decrypt = (cipher, keyPhrase = '') => {
  if (!cipher) return '';
  const { cipherMap, xorKey } = deriveKeys(keyPhrase);
  const bytes = base64ToBytes(cipher, cipherMap);
  if (!bytes) return '';
  const decoded = [];
  for (let i = 0; i < bytes.length; i++) {
    decoded.push((bytes[i] ^ ((xorKey + i) & 0xff)) & 0xff);
  }
  return bytesToUtf8(decoded);
};
