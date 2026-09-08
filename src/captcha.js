/**
 * 纯原生、零外部依赖的高安全性轻量图形验证码 (SVG 矢量图)
 * 特性：
 * 1. 纯数学与几何算法，生成波浪干扰曲线、随机噪点、字符旋转与不同色相字符；
 * 2. 输出轻量可直接内联的 SVG Data URI，PC / 移动端极速加载；
 * 3. 排除易混淆字符 (0, O, o, 1, l, I)。
 */

// 排除易混淆字符的字母数字表
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

// 随机生成 N 位验证码文本
function generateCaptchaText(length = 4) {
  let result = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS[bytes[i] % CAPTCHA_CHARS.length];
  }
  return result;
}

// 生成轻量 SVG 验证码图形
function generateCaptchaSvg(text) {
  const width = 120;
  const height = 42;
  const chars = text.split('');
  
  // 随机生成 3 条干扰波浪线
  let linesSvg = '';
  const lineColors = ['#94a3b8', '#cbd5e1', '#64748b', '#0284c7', '#8b5cf6'];
  for (let i = 0; i < 3; i++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const x2 = width - Math.floor(Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const cx = width / 2 + (Math.random() * 40 - 20);
    const cy = Math.floor(Math.random() * height);
    const stroke = lineColors[i % lineColors.length];
    linesSvg += `<path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" stroke="${stroke}" stroke-width="1.5" fill="none" opacity="0.65"/>`;
  }

  // 随机生成 20 个干扰噪点
  let dotsSvg = '';
  for (let i = 0; i < 20; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.5 + 0.5).toFixed(1);
    dotsSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" opacity="0.5"/>`;
  }

  // 字符绘制（带随机倾斜角度、偏移与颜色）
  const charColors = ['#0f172a', '#0369a1', '#4338ca', '#6d28d9', '#b91c1c', '#047857'];
  let textSvg = '';
  const charSpacing = width / (chars.length + 1);

  chars.forEach((char, idx) => {
    const x = Math.floor((idx + 0.8) * charSpacing);
    const y = 28 + Math.floor(Math.random() * 6 - 3);
    const rot = Math.floor(Math.random() * 36 - 18);
    const color = charColors[(idx + Math.floor(Math.random() * charColors.length)) % charColors.length];
    const fontSize = 22 + Math.floor(Math.random() * 4);
    
    textSvg += `<text x="${x}" y="${y}" font-family="monospace, Arial" font-size="${fontSize}" font-weight="bold" fill="${color}" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="border-radius: 6px; background: #f8fafc; border: 1px solid #cbd5e1; cursor: pointer; user-select: none;">
    ${linesSvg}
    ${dotsSvg}
    ${textSvg}
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// 辅助方法：生成验证码及加密校验令牌 (有效期 5 分钟)
export async function createCaptchaPayload(env, getSecretKey, encrypt) {
  const captchaText = generateCaptchaText(4);
  const svgDataUri = generateCaptchaSvg(captchaText);
  const secret = await getSecretKey(env);
  const expireAt = Date.now() + 5 * 60 * 1000;
  const captchaToken = encrypt(`${captchaText.toUpperCase()}:${expireAt}`, secret);
  return { svgDataUri, captchaToken };
}

// 辅助方法：校验用户输入的验证码有效性与过期状态
export async function verifyCaptcha(inputText, inputToken, env, getSecretKey, decrypt) {
  if (!inputText || !inputToken) return false;
  try {
    const secret = await getSecretKey(env);
    const decrypted = decrypt(inputToken.trim(), secret);
    if (!decrypted || !decrypted.includes(':')) return false;
    const [expectedText, expireAtStr] = decrypted.split(':');
    const expireAt = parseInt(expireAtStr, 10);
    if (Date.now() > expireAt) return false; // 验证码超时
    return inputText.trim().toUpperCase() === expectedText.trim().toUpperCase();
  } catch {
    return false;
  }
}

