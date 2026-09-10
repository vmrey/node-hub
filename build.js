import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.join(__dirname, 'wrangler.toml');

console.log('[build] 正在检查与自动获取 KV 命名空间 ID...');

let kvId = (process.env.KV_ID || process.env.CLOUDFLARE_KV_ID || '').trim();

// 1. 若未显式传入环境变量，尝试通过 wrangler 自动查询云端已有名为 KV 的命名空间
if (!kvId) {
  const tempToml = path.join(__dirname, '.temp-query-wrangler.toml');
  try {
    fs.writeFileSync(tempToml, 'name = "node-hub"\ncompatibility_date = "2026-09-06"\n', 'utf8');
    const listRaw = execSync(`npx wrangler kv namespace list -c "${tempToml}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 10000
    });
    const list = JSON.parse(listRaw);
    if (Array.isArray(list)) {
      const match = list.find(item => item.title && (item.title === 'KV' || item.title.endsWith('-KV') || item.title.includes('KV')));
      if (match && match.id) {
        kvId = match.id.trim();
        console.log(`[build] ✅ 成功自动匹配到云端 KV 命名空间 ID: ${kvId}`);
      }
    }
  } catch {
    // 忽略查询失败（如无 Token 或受限环境）
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
  } else {
    // 若未能自动获取到 ID，且 toml 中声明了未注释且空的 id，则将其注释，避免 wrangler 报空值语法错误
    if (/^\s*\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*["']\s*["']/m.test(tomlContent)) {
      tomlContent = tomlContent.replace(
        /\[\[kv_namespaces\]\]\s*\n\s*binding\s*=\s*["']KV["']\s*\n\s*id\s*=\s*["']\s*["']/,
        '# [[kv_namespaces]]\n# binding = "KV"\n# id = ""'
      );
      fs.writeFileSync(tomlPath, tomlContent, 'utf8');
      console.log('[build] ℹ️ 未获取到指定 KV ID，已自动将空声明转为注释，保留 Cloudflare 控制台已有 KV 绑定');
    }
  }
}

// 2. 执行打包输出 _worker.js
console.log('[build] 正在打包 _worker.js ...');
execSync('npx esbuild src/index.js --bundle --minify --format=esm --target=es2022 --outfile=_worker.js', {
  cwd: __dirname,
  stdio: 'inherit'
});
console.log('[build] 打包完成！');
