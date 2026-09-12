import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. 仅专注于打包流程，适用于 Cloudflare Pages 部署等需要自行构建产物的场景
// 移除了重复的 KV 获取与修改逻辑，避免与 deploy.js 冲突以及引发文件竞态
console.log('[build] 正在打包 _worker.js ...');
execSync('npx esbuild src/index.js --bundle --minify --format=esm --target=es2022 --outfile=_worker.js', {
  cwd: __dirname,
  stdio: 'inherit'
});
console.log('[build] 打包完成！此 _worker.js 文件可用于 Cloudflare Pages 等环境的部署。');
