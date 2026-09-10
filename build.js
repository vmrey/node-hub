import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.join(__dirname, 'wrangler.toml');

// 1. 若在 Cloudflare CI 环境中配置了环境变量 KV_ID，自动注入到 wrangler.toml，避免空 ID 部署报错
const kvId = process.env.KV_ID || process.env.CLOUDFLARE_KV_ID;
if (kvId && fs.existsSync(tomlPath)) {
  let tomlContent = fs.readFileSync(tomlPath, 'utf8');
  if (/id\s*=\s*["']\s*["']/.test(tomlContent)) {
    tomlContent = tomlContent.replace(/id\s*=\s*["']\s*["']/, `id = "${kvId.trim()}"`);
    fs.writeFileSync(tomlPath, tomlContent, 'utf8');
    console.log(`[build] 已从环境变量自动注入 KV ID: ${kvId.trim()}`);
  }
}

// 2. 执行打包输出 _worker.js
console.log('[build] 正在打包 _worker.js ...');
execSync('npx esbuild src/index.js --bundle --minify --format=esm --target=es2022 --outfile=_worker.js', {
  cwd: __dirname,
  stdio: 'inherit'
});
console.log('[build] 打包完成！');
