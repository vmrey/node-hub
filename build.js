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
    const list = JSON.parse(listRaw);
    if (Array.isArray(list)) {
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
  } else {
    // 仅在 CI 自动化构建部署环境中，若未能获取到 ID 且声明了空 id，自动临时转为注释，避免 wrangler deploy 报错中断
    const isPagesCI = Boolean(process.env.CF_PAGES === '1' || process.env.CF_PAGES_COMMIT_SHA || process.env.CF_PAGES_URL);
    const isCI = Boolean(process.env.CI || isPagesCI || process.env.GITHUB_ACTIONS || process.env.CF_BUILD || process.env.BUILD_ENVIRONMENT);
    if (isCI && /^\s*\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*["']\s*["']/m.test(tomlContent)) {
      tomlContent = tomlContent.replace(
        /\[\[kv_namespaces\]\]\s*\n\s*binding\s*=\s*["']KV["']\s*\n\s*id\s*=\s*["']\s*["']/,
        '# [[kv_namespaces]]\n# binding = "KV"\n# id = ""'
      );
      fs.writeFileSync(tomlPath, tomlContent, 'utf8');

      // 若当前为 Pages 部署：天生不掉绑定，用不到 KV_ID，完全不进行提示；仅在 Workers 构建环境下才精准提示！
      if (!isPagesCI) {
        console.log('--------------------------------------------------------------------------------');
        console.log('[build] ℹ️  [Workers CI 构建提示] 检测到当前为 Cloudflare Workers 自动发包流水线：');
        console.log('[build]    若发包后发现控制台已绑定的 KV 被清除，请在该 Worker 设置 -> 变量与机密 中添加：');
        console.log('[build]    变量名：KV_ID，值为您的 32 位 KV 命名空间真实 ID，即可永久锁定绑定！');
        console.log('--------------------------------------------------------------------------------');
      }
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
