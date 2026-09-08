import { safeBase64Encode, safeBase64Decode } from './storage.js';

// 基础安全解码与编码工具（杜绝 URI malformed 等异常抛出）
function safeDecodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function safeEncodeURIComponent(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    return encodeURIComponent(str);
  } catch {
    return str;
  }
}

// 解析单条 VLESS 字符串（内部基础解析方法，支持小火箭私有Base64、标准Xray明文、多协议等）
function parseSingleVless(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return null;
  try {
    let raw = rawInput.trim();
    if (!raw) return null;

    // 1. 如果不是以 vless:// 开头，但整体是 Base64，尝试先整体解码
    if (!raw.startsWith('vless://')) {
      const decoded = safeBase64Decode(raw);
      if (decoded && decoded.includes('vless://')) {
        return parseVlessTemplate(decoded);
      }
      return null;
    }

    let rest = raw.slice('vless://'.length).trim();

    // 2. 检查 rest 是否整串都是 Base64 编码（包含 query 等全部被编码的情况）
    if (!rest.includes('@') && !rest.includes('?') && !rest.includes('#')) {
      const decodedRest = safeBase64Decode(rest);
      if (decodedRest && decodedRest.includes('@') && (decodedRest.includes(':') || decodedRest.includes('?'))) {
        rest = decodedRest.trim();
      }
    }

    // 3. 提取 # 之后的节点名称/备注
    let remark = '';
    const hashIdx = rest.indexOf('#');
    if (hashIdx !== -1) {
      remark = safeDecodeURIComponent(rest.slice(hashIdx + 1));
      rest = rest.slice(0, hashIdx);
    }

    // 4. 提取 ? 之后的参数
    let queryStr = '';
    const queryIdx = rest.indexOf('?');
    if (queryIdx !== -1) {
      queryStr = rest.slice(queryIdx + 1);
      rest = rest.slice(0, queryIdx);
    }

    // 5. 处理 userinfo@host:port（支持标准明文以及 Base64 编码格式）
    let userInfoHostPort = rest;
    let isBase64Encoded = false;

    if (!userInfoHostPort.includes('@')) {
      const decoded = safeBase64Decode(userInfoHostPort);
      if (decoded && decoded.includes('@')) {
        userInfoHostPort = decoded;
        isBase64Encoded = true;
      }
    }

    const atIdx = userInfoHostPort.lastIndexOf('@');
    if (atIdx === -1) return null;

    const userInfo = userInfoHostPort.slice(0, atIdx);
    const hostPort = userInfoHostPort.slice(atIdx + 1);

    let host = '';
    let port = '443';

    // 兼容 IPv6 [xxxx:xxxx::...]:port 以及普通 host:port
    if (hostPort.startsWith('[')) {
      const endBracket = hostPort.indexOf(']');
      if (endBracket !== -1) {
        host = hostPort.slice(0, endBracket + 1);
        const afterBracket = hostPort.slice(endBracket + 1);
        if (afterBracket.startsWith(':')) {
          port = afterBracket.slice(1);
        }
      } else {
        host = hostPort;
      }
    } else {
      const colonIdx = hostPort.lastIndexOf(':');
      if (colonIdx !== -1) {
        host = hostPort.slice(0, colonIdx);
        port = hostPort.slice(colonIdx + 1);
      } else {
        host = hostPort;
      }
    }

    host = host.trim();
    if (!host || host.includes('?') || host.includes('/') || host.includes('#') || host.includes(' ')) {
      return null;
    }

    let uuid = userInfo.trim();
    if (userInfo.includes(':')) {
      const parts = userInfo.split(':');
      const isUuid = (s) => /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(s);
      if (isUuid(parts[0])) {
        uuid = parts[0];
      } else if (isUuid(parts[1])) {
        uuid = parts[1];
      } else if (parts[0].length >= 32) {
        uuid = parts[0];
      } else {
        uuid = parts[1] || parts[0];
      }
    }

    if (!uuid || uuid.length < 6 || uuid.includes('?') || uuid.includes('/') || uuid.includes('#')) {
      return null;
    }

    const searchParams = new URLSearchParams(queryStr);
    if (!remark) {
      remark = searchParams.get('remarks') || searchParams.get('remark') || searchParams.get('name') || '';
    }

    return {
      isBase64Encoded,
      userInfo,
      uuid,
      host,
      port,
      queryStr,
      searchParams,
      remark
    };
  } catch (err) {
    console.error('Error in parseSingleVless:', err);
    return null;
  }
}

/**
 * 客户端与协议参数映射规则配置表 (JSON 字典结构)
 * 集中管理所有客户端（Shadowrocket、Quantumult X、Clash 等）私有字段与值的标准化转换
 */
const VLESS_PARAM_MAPPINGS = {
  // 1. 字段别名查找候选表 (按优先级从左到右查找)
  fieldAliases: {
    security: ['security', 'tls'],
    sni: ['sni', 'peer', 'obfsParam', 'host'],
    host: ['host', 'obfsParam', 'peer', 'sni'],
    fp: ['fp', 'fingerprint'],
    type: ['type', 'net', 'obfs', 'network'],
    path: ['path'],
    pbk: ['pbk', 'publicKey'],
    sid: ['sid', 'shortId'],
    spx: ['spx', 'spiderX'],
    serviceName: ['serviceName', 'service_name'],
    mode: ['mode'],
    flow: ['flow'],
    alpn: ['alpn'],
    allowInsecure: ['allowInsecure', 'insecure'],
    headerType: ['headerType', 'header_type'],
    seed: ['seed', 'kcpSeed'],
    quicSecurity: ['quicSecurity', 'quic_security'],
    key: ['key', 'quicKey']
  },

  // 2. 字段值标准化映射转换表
  valueTransformers: {
    // 传输类型 / obfs 映射 (覆盖目前市面上所有 Xray / V2Ray 协议)
    type: {
      'xhttp': 'xhttp',
      'splithttp': 'xhttp',
      'websocket': 'ws',
      'ws': 'ws',
      'httpupgrade': 'httpupgrade',
      'grpc': 'grpc',
      'gun': 'grpc',
      'multi': 'grpc',
      'http': 'tcp',
      'tcp': 'tcp',
      'raw': 'tcp',
      'h2': 'h2',
      'kcp': 'kcp',
      'mkcp': 'kcp',
      'quic': 'quic'
    },
    // 安全类型映射 (如 tls=1 / true ➡️ security=tls)
    security: {
      '1': 'tls',
      'true': 'tls',
      'tls': 'tls',
      'reality': 'reality',
      'none': 'none',
      '0': 'none',
      'false': 'none'
    }
  },

  // 3. 常见 HTTPS / TLS 默认端口列表 (端口命中时若未显式指定 security 则自动标为 tls)
  tlsDefaultPorts: ['443', '8443', '2053', '2083', '2087', '2096']
};

// 严格判断字符串是否为 IP 地址（支持 IPv4 以及带/不带方括号的 IPv6）
function isIpAddress(h) {
  if (!h || typeof h !== 'string') return false;
  const clean = h.trim().replace(/^\[|\]$/g, '');
  // IPv4 格式 (如 1.1.1.1, 104.16.1.1)
  if (/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})$/.test(clean)) return true;
  // IPv6 格式 (包含至少 2 个冒号，如 2606:4700:4700::1111)
  if ((clean.match(/:/g) || []).length >= 2) return true;
  return false;
}

// 规范化 Host 地址（自动补齐 IPv6 方括号，提升 URI 标准化程度）
function formatHostAddress(h) {
  if (!h || typeof h !== 'string') return '';
  const clean = h.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) {
    return clean;
  }
  if ((clean.match(/:/g) || []).length >= 2) {
    return `[${clean}]`;
  }
  return clean;
}

// 辅助方法：从 searchParams 中按候选字段列表提取首个有效值
function getParamByAliases(searchParams, aliases = []) {
  if (!searchParams || !Array.isArray(aliases)) return '';
  for (const key of aliases) {
    if (searchParams.has(key)) {
      const val = searchParams.get(key);
      if (val !== null && val !== undefined && val !== '') {
        return val;
      }
    }
  }
  return '';
}

// 标准化构建 VLESS 链接（统一输出为 Xray / v2rayN / v2rayNG / Shadowrocket / Clash 等全客户端通用格式）
function buildStandardVless(parsed, overrideOptions = {}) {
  if (!parsed || !parsed.uuid) return '';
  try {
    const rawHost = overrideOptions.host || parsed.host || '';
    const targetHost = formatHostAddress(rawHost);
    const targetPort = overrideOptions.port || parsed.port || '443';
    const targetRemark = overrideOptions.remark !== undefined ? overrideOptions.remark : (parsed.remark || '');

    const rawSp = parsed.searchParams || new URLSearchParams(parsed.queryStr || '');
    const sp = new URLSearchParams();

    const { fieldAliases, valueTransformers, tlsDefaultPorts } = VLESS_PARAM_MAPPINGS;

    // 1. 传输安全 (security: reality / tls / none)
    const pbkVal = getParamByAliases(rawSp, fieldAliases.pbk);
    const rawSecurity = getParamByAliases(rawSp, fieldAliases.security);
    let mappedSecurity = valueTransformers.security[rawSecurity.toLowerCase()] || rawSecurity;

    // 🌟 核心智能判定：只要包含 Reality 专属公钥 (pbk / publicKey)，无论小火箭写的是 tls=1 还是 security=tls，一律自动精准确认为 reality
    if (pbkVal) {
      mappedSecurity = 'reality';
    } else if (!mappedSecurity) {
      mappedSecurity = tlsDefaultPorts.includes(targetPort) ? 'tls' : 'none';
    }
    sp.set('security', mappedSecurity);

    // 2. 加密方式 (encryption: none)
    sp.set('encryption', rawSp.get('encryption') || 'none');

    // 4. 传输协议类型 (type: tcp / ws / xhttp / grpc / httpupgrade / kcp / quic 等)
    const rawType = getParamByAliases(rawSp, fieldAliases.type);
    let mappedType = valueTransformers.type[rawType.toLowerCase()];
    if (!mappedType) {
      if (rawSp.has('path') && rawType !== 'tcp') {
        mappedType = 'ws';
      } else if (mappedSecurity === 'reality') {
        mappedType = 'tcp';
      } else if (rawType) {
        mappedType = rawType;
      } else {
        mappedType = 'tcp';
      }
    }
    sp.set('type', mappedType);

    // 5. 传输层高级参数（headerType, flow, alpn, allowInsecure, seed, quic 等）
    const headerType = getParamByAliases(rawSp, fieldAliases.headerType);
    if (headerType) sp.set('headerType', headerType);
    // ⚠️ XTLS 流控 (如 xtls-rprx-vision) 在 Xray 规范中仅且只能在 raw TCP 传输层生效，在 ws/xhttp 下注入会导致 Xray-core 启动报错
    const flow = getParamByAliases(rawSp, fieldAliases.flow);
    if (flow && mappedType === 'tcp') sp.set('flow', flow);
    const alpn = getParamByAliases(rawSp, fieldAliases.alpn);
    if (alpn) sp.set('alpn', alpn);
    const allowInsecure = getParamByAliases(rawSp, fieldAliases.allowInsecure);
    if (allowInsecure) sp.set('allowInsecure', allowInsecure);
    const seed = getParamByAliases(rawSp, fieldAliases.seed);
    if (seed) sp.set('seed', seed);
    const quicSecurity = getParamByAliases(rawSp, fieldAliases.quicSecurity);
    if (quicSecurity) sp.set('quicSecurity', quicSecurity);
    const quicKey = getParamByAliases(rawSp, fieldAliases.key);
    if (quicKey) sp.set('key', quicKey);

    // 6. 智能区分 Host 与 SNI 参数：
    // - SNI: TLS / Reality 均需要目标伪装域名；
    // - Host 伪装头: 只有 ws / xhttp / httpupgrade / h2 以及 tcp(带 headerType=http) 才需要 host 伪装头！
    // ⚠️ 极其重要：在 TCP + Reality 下若附带 host 参数，Windows v2rayN 会误判并强制启用 HTTP 伪装头，导致 Xray 核心握手报错不可用！
    const isHostIp = isIpAddress(parsed.host);
    const defaultDomain = !isHostIp ? parsed.host : '';

    const rawSniCand = getParamByAliases(rawSp, fieldAliases.sni);
    const rawHostCand = getParamByAliases(rawSp, fieldAliases.host);

    let sniCandidate = rawSniCand || defaultDomain;
    let hostCandidate = rawHostCand || defaultDomain;

    if (isIpAddress(sniCandidate) && !isIpAddress(hostCandidate)) {
      sniCandidate = hostCandidate;
    }

    if (sniCandidate && mappedSecurity !== 'none') {
      sp.set('sni', sniCandidate);
    }

    // 判断当前协议是否支持并需要 Host 头部参数
    const needsHostHeader = (
      ['ws', 'xhttp', 'splithttp', 'httpupgrade', 'h2'].includes(mappedType) ||
      (mappedType === 'tcp' && headerType === 'http')
    );

    if (needsHostHeader && hostCandidate) {
      sp.set('host', hostCandidate);
    }

    // 7. 指纹 (fp: chrome / firefox / safari 等)
    const fpVal = getParamByAliases(rawSp, fieldAliases.fp);
    if (fpVal) {
      sp.set('fp', fpVal);
    }

    // 8. 路径 (path: 仅在 ws / xhttp / httpupgrade / h2 或 tcp-http 伪装中生效)
    let pathVal = getParamByAliases(rawSp, fieldAliases.path);
    if (pathVal && (needsHostHeader || mappedType === 'ws' || mappedType === 'xhttp')) {
      pathVal = safeDecodeURIComponent(pathVal);
      if (!pathVal.startsWith('/')) pathVal = '/' + pathVal;
      sp.set('path', pathVal);
    }

    // 9. Reality 专有参数 (pbk, sid, spx)
    if (mappedSecurity === 'reality') {
      const pbk = getParamByAliases(rawSp, fieldAliases.pbk);
      if (pbk) sp.set('pbk', pbk);
      const sid = getParamByAliases(rawSp, fieldAliases.sid);
      if (sid) sp.set('sid', sid);
      const spx = getParamByAliases(rawSp, fieldAliases.spx);
      if (spx) sp.set('spx', spx);
    }

    // 10. gRPC 专有参数 (serviceName, mode)
    if (mappedType === 'grpc') {
      const serviceName = getParamByAliases(rawSp, fieldAliases.serviceName);
      if (serviceName) sp.set('serviceName', serviceName);
      const grpcMode = getParamByAliases(rawSp, fieldAliases.mode);
      if (grpcMode) sp.set('mode', grpcMode);
    }

    const cleanQueryStr = sp.toString().replace(/%2F/g, '/');
    const query = cleanQueryStr ? `?${cleanQueryStr}` : '';
    const hash = targetRemark ? `#${safeEncodeURIComponent(targetRemark)}` : '';

    return `vless://${parsed.uuid}@${targetHost}:${targetPort}${query}${hash}`;
  } catch (err) {
    console.error('Error in buildStandardVless:', err);
    return '';
  }
}

// 解析 Quantumult X (圈X) 格式节点 (vless=host:port, password=uuid, ...)
function parseQuantumultX(line) {
  if (!line || typeof line !== 'string') return null;
  const trimmed = line.trim();
  if (!trimmed.toLowerCase().startsWith('vless=')) return null;
  try {
    const rawContent = trimmed.slice('vless='.length).trim();
    const parts = rawContent.split(',').map(s => s.trim());
    if (parts.length === 0) return null;
    const hostPort = parts[0];
    const kv = {};
    for (let i = 1; i < parts.length; i++) {
      const item = parts[i];
      const eqIdx = item.indexOf('=');
      if (eqIdx !== -1) {
        kv[item.slice(0, eqIdx).trim().toLowerCase()] = item.slice(eqIdx + 1).trim();
      }
    }
    const uuid = kv.password || kv.uuid || '';
    if (!uuid) return null;

    let host = hostPort;
    let port = '443';
    if (hostPort.includes(':')) {
      const lastColon = hostPort.lastIndexOf(':');
      host = hostPort.slice(0, lastColon);
      port = hostPort.slice(lastColon + 1);
    }

    const sp = new URLSearchParams();
    const isTls = kv.tls === 'true' || kv.tls === '1';
    sp.set('security', isTls ? 'tls' : 'none');
    sp.set('type', kv.obfs || 'ws');
    if (kv['obfs-host']) sp.set('host', kv['obfs-host']);
    if (kv['obfs-uri']) sp.set('path', kv['obfs-uri']);
    if (kv.pbk) {
      sp.set('security', 'reality');
      sp.set('pbk', kv.pbk);
    }
    if (kv.sid) sp.set('sid', kv.sid);

    return buildStandardVless({
      uuid,
      host,
      port,
      remark: kv.tag || '',
      searchParams: sp
    });
  } catch {
    return null;
  }
}

// 标准化单条节点（自动识别并转换 VLESS，保留其他合法协议节点，全量异常捕获零崩溃）
function standardizeNode(nodeStr) {
  if (!nodeStr || typeof nodeStr !== 'string') return '';
  try {
    let line = nodeStr.trim();
    if (!line) return '';

    // 忽略常见注释行（如 # 注释、// 注释、; 注释、! 注释）
    if (line.startsWith('#') || line.startsWith('//') || line.startsWith(';') || line.startsWith('!')) {
      return '';
    }

    // 1. 如果是 Quantumult X 格式 (vless=...)
    if (line.toLowerCase().startsWith('vless=')) {
      const qxConverted = parseQuantumultX(line);
      if (qxConverted) return qxConverted;
    }

    // 2. 如果是 VLESS 节点（无论是小火箭 Base64 格式还是明文，忽略大小写）
    if (line.toLowerCase().startsWith('vless://')) {
      const parsed = parseSingleVless(line);
      if (parsed && parsed.uuid && parsed.port) {
        const std = buildStandardVless(parsed);
        if (std) return std;
      }
      return line;
    }

    // 3. 如果整行是 Base64 编码，尝试解开
    if (!line.includes('://')) {
      const decoded = safeBase64Decode(line);
      if (decoded && (decoded.includes('://') || decoded.toLowerCase().includes('vless='))) {
        const subLines = decoded.replace(/\r\n|\r/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
        const converted = subLines.map(standardizeNode).filter(Boolean);
        return converted.join('\n');
      }
    }

    // 4. 其他合法协议（vmess://, ss://, trojan://, hysteria2://, hy2://, tuic://, wireguard:// 等）直接安全保留
    if (line.includes('://')) {
      return line;
    }

    // 非协议 URL 且非 Base64 节点的无效纯文本直接丢弃
    return '';
  } catch (err) {
    console.error('Error in standardizeNode:', err);
    return String(nodeStr || '').trim();
  }
}

// 批量标准化多行节点文本（公开公共方法：支持混合多行、Base64订阅块、小火箭格式等，永不报错）
export function standardizeNodesText(rawText) {
  if (!rawText) return [];
  try {
    let text = '';
    if (Array.isArray(rawText)) {
      text = rawText.join('\n');
    } else {
      text = String(rawText || '');
    }

    // 如果整体是 Base64 订阅文本（不含 :// 且长度较大）
    if (!text.includes('://')) {
      const decoded = safeBase64Decode(text.trim());
      if (decoded && decoded.includes('://')) {
        text = decoded;
      }
    }

    const rawLines = text.replace(/\r\n|\r/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
    const result = [];

    for (const line of rawLines) {
      const converted = standardizeNode(line);
      if (converted) {
        const innerLines = converted.split('\n').map(l => l.trim()).filter(Boolean);
        result.push(...innerLines);
      }
    }

    return [...new Set(result)];
  } catch (err) {
    console.error('Error in standardizeNodesText:', err);
    if (Array.isArray(rawText)) return rawText.map(String).filter(Boolean);
    return String(rawText || '').split('\n').map(l => l.trim()).filter(Boolean);
  }
}

// 解析 VLESS 模板节点（支持多行节点、整段Base64订阅、单节点等各类输入，自动选取第一个有效合法节点）
function parseVlessTemplate(baseVless) {
  if (!baseVless || typeof baseVless !== 'string') return null;
  let text = baseVless.trim();
  if (!text) return null;

  // 1. 若整体不是直接以 vless:// 开头，先尝试整体解 Base64
  if (!text.startsWith('vless://')) {
    const decoded = safeBase64Decode(text);
    if (decoded && decoded.includes('vless://')) {
      text = decoded.trim();
    }
  }

  // 2. 按行拆分（兼容可能传入的包含多个节点的订阅列表）
  const lines = text.replace(/\r\n|\r/g, '\n').split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const parsed = parseSingleVless(line);
    if (parsed && parsed.uuid && parsed.port) {
      return parsed; // 提取并返回第一个合法的 VLESS 节点
    }
  }

  return null;
}

// 辅助方法：从优选源行中解析 Host (兼容 IPv4, IPv6, 域名与指定端口)
function extractCleanHost(targetHost) {
  let clean = targetHost.trim();
  if (!clean) return '';

  // 1. 如果包含 IPv6 方括号 [2606:4700::1]:443 或 [2606:4700::1]
  if (clean.startsWith('[')) {
    const match = clean.match(/^\[([^\]]+)\](?::\d+)?/);
    if (match) {
      return `[${match[1]}]`;
    }
  }

  // 2. 纯 IPv6 未带中括号（包含多个冒号，如 2606:4700:4700::1111）
  if ((clean.match(/:/g) || []).length >= 2) {
    return `[${clean}]`;
  }

  // 3. IPv4 格式 (1.1.1.1:443 或 1.1.1.1)
  const ipv4Match = clean.match(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})(?::\d+)?/);
  if (ipv4Match) {
    return ipv4Match[1];
  }

  // 4. 域名格式 (example.com:443 或 example.com)
  const domainMatch = clean.match(/^([a-zA-Z0-9.-]+)(?::\d+)?/);
  if (domainMatch) {
    return domainMatch[1];
  }

  return clean.split(':')[0].trim();
}

// 核心方法：抓取优选源并根据基础节点生成优选节点
export async function fetchIPsAndGenerateNodes(baseVless, selectedSources, format = 'base64') {
  if (!baseVless) {
    return new Response('404 Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const parsed = parseVlessTemplate(baseVless);

  if (!parsed) {
    return new Response('404 Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // 并发拉取优选接口数据（关联每个 source 的名称，过滤已禁用的源）
  const validSources = (selectedSources || []).filter(s => s && s.url && s.enabled !== false);
  const fetchPromises = validSources.map(async (source) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
        }
      });
      clearTimeout(timeoutId);
      if (!res.ok) return { source, text: '' };
      const text = await res.text();
      return { source, text };
    } catch {
      return { source, text: '' };
    }
  });

  const results = await Promise.all(fetchPromises);
  const nodes = [];

  results.forEach(({ source, text }) => {
    if (!text) return;
    const lines = text.replace(/,|\r\n|\r/g, '\n').split('\n');

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      // 提取 IP / 域名部分 以及 可能存在的 # 后的备注
      let targetHost = '';
      let remoteRemark = '';

      if (line.includes('#')) {
        const parts = line.split('#');
        targetHost = parts[0].trim();
        remoteRemark = parts.slice(1).join('#').trim();
      } else {
        targetHost = line.trim();
      }

      const cleanHost = extractCleanHost(targetHost);
      if (!cleanHost) return;

      let prefix = '';
      if (remoteRemark) {
        prefix = remoteRemark.replace(/^CF\s*/i, '').trim();
      } else if (source && source.name && !source.name.startsWith('源-') && !source.name.startsWith('http')) {
        prefix = source.name.replace(/\s*\(.*?\)/g, '').trim();
      }

      const displayHost = cleanHost.replace(/^\[|\]$/g, '');
      let finalRemark = prefix ? `${prefix}-${displayHost}` : displayHost;

      const vlessLink = buildStandardVless(parsed, {
        host: cleanHost,
        remark: finalRemark
      });

      if (vlessLink) {
        nodes.push(vlessLink);
      }
    });
  });

  const uniqueNodes = [...new Set(nodes)];
  if (uniqueNodes.length === 0) {
    uniqueNodes.push(buildStandardVless(parsed));
  }

  const subContent = uniqueNodes.join('\n');
  const responseBody = format === 'base64' ? safeBase64Encode(subContent) : subContent;

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

// 核心订阅生成逻辑 (支持优选节点与多组普通节点订阅)
export async function handleSubscription(request, env, sources, defaultBaseVless = '', plainGroups = []) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || '';
  const format = url.searchParams.get('format') || 'base64';

  // ==========================================================
  // 情况 A: 请求普通节点订阅 (?type=custom, 支持按 ?group=xxx 过滤)
  // ==========================================================
  if (type === 'custom') {
    const groupParam = (url.searchParams.get('group') || '').toLowerCase();
    let selectedGroups = plainGroups;

    if (groupParam) {
      selectedGroups = plainGroups.filter(g => g.id.toLowerCase() === groupParam);
    }

    const allLines = [];
    selectedGroups.forEach(g => {
      const lines = standardizeNodesText(g.nodes);
      allLines.push(...lines);
    });

    if (allLines.length === 0) {
      return new Response('404 Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const uniqueLines = [...new Set(allLines)];
    const content = uniqueLines.join('\n');
    const responseBody = format === 'base64' ? safeBase64Encode(content) : content;

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
  // 情况 B: 请求优选 IP 节点订阅 (若未配置基础 VLESS 模板，自动智能回退到普通节点列表)
  // ==========================================================
  const baseVless = url.searchParams.get('base') || defaultBaseVless || env.BASE_VLESS;

  // 智能容错：如果未配置全局基础 VLESS，但普通订阅中有节点数据，则自动下发普通节点
  if (!baseVless) {
    const allLines = [];
    plainGroups.forEach(g => {
      const lines = standardizeNodesText(g.nodes);
      allLines.push(...lines);
    });

    if (allLines.length > 0) {
      const uniqueLines = [...new Set(allLines)];
      const content = uniqueLines.join('\n');
      const responseBody = format === 'base64' ? safeBase64Encode(content) : content;
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

    return new Response('404 Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // 根据 ?isp= 筛选优选源列表
  const ispParam = (url.searchParams.get('isp') || '').toLowerCase();
  let selectedSources = [];

  if (ispParam) {
    selectedSources = sources.filter(s => s.id.toLowerCase() === ispParam);
    if (selectedSources.length === 0) {
      selectedSources = sources;
    }
  } else {
    selectedSources = sources;
  }

  return await fetchIPsAndGenerateNodes(baseVless, selectedSources, format);
}
