import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.join(__dirname, 'wrangler.toml');

// 1. 自动注入有效 KV ID 到 wrangler.toml，避免空 ID 或 local-kv-id 导致 CI 部署报错
const DEFAULT_PROD_KV_ID = '04c612dbf2624db6a4fa153295943f82';
const targetKvId = process.env.KV_ID || process.env.CLOUDFLARE_KV_ID || DEFAULT_PROD_KV_ID;
if (fs.existsSync(tomlPath)) {
  let tomlContent = fs.readFileSync(tomlPath, 'utf8');
  if (/id\s*=\s*["'](?:\s*|local-kv-id)["']/.test(tomlContent)) {
    tomlContent = tomlContent.replace(/id\s*=\s*["'](?:\s*|local-kv-id)["']/, `id = "${targetKvId.trim()}"`);
    fs.writeFileSync(tomlPath, tomlContent, 'utf8');
    console.log(`[build] 已自动注入有效 KV ID: ${targetKvId.trim()}`);
  }
}

// 2. 执行打包输出 _worker.js
console.log('[build] 正在打包 _worker.js ...');
execSync('npx esbuild src/index.js --bundle --minify --format=esm --target=es2022 --outfile=_worker.js', {
  cwd: __dirname,
  stdio: 'inherit'
});
console.log('[build] 打包完成！');
