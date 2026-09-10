import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.join(__dirname, 'wrangler.toml');

console.log('[build] 正在检查与自动获取 KV 命名空间 ID...');

let kvId = (process.env.KV_ID || process.env.CLOUDFLARE_KV_ID || '').trim();

// 诊断构建机中可用的凭据环境变量
const cfEnvs = Object.keys(process.env).filter(k => /CF|CLOUDFLARE|KV|TOKEN|ACCOUNT|BUILD|DEPLOY/i.test(k));
console.log('[build] 当前环境可用环境标识:', cfEnvs.join(', ') || '无专有标识');

// 1. 若未显式传入环境变量，尝试通过 wrangler 自动查询云端已有名为 KV 的命名空间
if (!kvId) {
  const tempToml = path.join(__dirname, '.temp-query-wrangler.toml');
  try {
    fs.writeFileSync(tempToml, 'name = "node-hub"\ncompatibility_date = "2026-09-06"\n', 'utf8');
    const listRaw = execSync(`npx wrangler kv namespace list -c "${tempToml}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });
    // 使用正则提取 JSON 数组，避免被 npm warn 等前置输出污染导致 parse 失败
    const jsonMatch = listRaw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const list = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    if (Array.isArray(list) && list.length > 0) {
      const match = list.find(item => item.title && (item.title === 'KV' || item.title.endsWith('-KV') || item.title.includes('KV')));
      if (match && match.id) {
        kvId = match.id.trim();
        console.log(`[build] ✅ 成功动态匹配到云端已有 KV ID: ${kvId}`);
      }
    }
  } catch (err) {
    const msg = (err.stderr || err.stdout || err.message || '').toString().trim();
    console.log(`[build] 自动探测云端 KV 返回: ${msg.split('\n')[0]}`);
  } finally {
    try { if (fs.existsSync(tempToml)) fs.unlinkSync(tempToml); } catch {}
  }
}

// 2. 将获取到的 KV ID 注入 wrangler.toml；若未获取且当前为空，则智能处理避免语法报错
if (fs.existsSync(tomlPath)) {
  let tomlContent = fs.readFileSync(tomlPath, 'utf8');
  const kvSectionRegex = /(?:#\s*)?\[\[kv_namespaces\]\][\s\S]*?(?:#\s*)?binding\s*=\s*["']KV["'][\s\S]*?(?:#\s*)?id\s*=\s*["'][^"']*["']/;
  if (kvId) {
    const newKvSection = `[[kv_namespaces]]\nbinding = "KV"\nid = "${kvId}"`;
    if (kvSectionRegex.test(tomlContent)) {
      tomlContent = tomlContent.replace(kvSectionRegex, newKvSection);
    } else {
      tomlContent += `\n${newKvSection}\n`;
    }
    fs.writeFileSync(tomlPath, tomlContent, 'utf8');
    console.log(`[build] 💾 已自动将真实 KV ID (${kvId}) 注入到 wrangler.toml`);
  }
}

// 2. 执行打包输出 _worker.js
console.log('[build] 正在打包 _worker.js ...');
execSync('npx esbuild src/index.js --bundle --minify --format=esm --target=es2022 --outfile=_worker.js', {
  cwd: __dirname,
  stdio: 'inherit'
});
console.log('[build] 打包完成！');
