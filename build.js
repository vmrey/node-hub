import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.join(__dirname, 'wrangler.toml');

// 1. 动态注入构建环境变量中的 KV_ID（若配置了 KV_ID 构建变量，自动写入 wrangler.toml）
const kvId = process.env.KV_ID ? process.env.KV_ID.trim() : '';

if (fs.existsSync(tomlPath)) {
  let tomlContent = fs.readFileSync(tomlPath, 'utf8');
  // 移除可能存在的空 id 的 kv_namespaces 块，彻底防止 wrangler deploy 报错
  tomlContent = tomlContent.replace(/\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*["']\s*["']\s*/g, '').trim() + '\n';

  if (kvId) {
    console.log(`[build] 检测到构建环境变量 KV_ID: ${kvId}，自动注入 wrangler.toml`);
    tomlContent += `\n[[kv_namespaces]]\nbinding = "KV"\nid = "${kvId}"\n`;
  }
  fs.writeFileSync(tomlPath, tomlContent, 'utf8');
}

// 2. 打包生成 _worker.js 产物
console.log('[build] 正在打包 _worker.js ...');
execSync('npx esbuild src/index.js --bundle --minify --format=esm --target=es2022 --outfile=_worker.js', {
  cwd: __dirname,
  stdio: 'inherit'
});
console.log('[build] 打包完成！此 _worker.js 文件可用于 Cloudflare Pages 等环境的部署。');
