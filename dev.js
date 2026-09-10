import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const tomlPath = path.join(rootDir, 'wrangler.toml');
const wranglerDir = path.join(rootDir, '.wrangler');

if (!fs.existsSync(wranglerDir)) {
  fs.mkdirSync(wranglerDir, { recursive: true });
}

// 保证本地开发环境具有 ADMIN 密码环境变量（若根目录存在 .dev.vars 则同步，若无则自动注入默认密码）
const rootDevVars = path.join(rootDir, '.dev.vars');
const innerDevVars = path.join(wranglerDir, '.dev.vars');

if (fs.existsSync(rootDevVars)) {
  fs.copyFileSync(rootDevVars, innerDevVars);
} else {
  fs.writeFileSync(innerDevVars, 'ADMIN="admin123"\n', 'utf8');
}

const tomlContent = fs.existsSync(tomlPath) ? fs.readFileSync(tomlPath, 'utf8') : '';

// 检查是否 id 为空字符串，若为空则在 .wrangler 内部生成临时本地配置，避免 wrangler schema 校验报错
const hasEmptyKvId = /\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*["']\s*["']/.test(tomlContent);

let args = ['wrangler', 'dev'];
if (hasEmptyKvId) {
  const devTomlPath = path.join(wranglerDir, 'wrangler.dev.toml');
  let devContent = tomlContent
    .replace(/main\s*=\s*["']src\/index\.js["']/, 'main = "../src/index.js"')
    .replace(/(id\s*=\s*["'])\s*(["'])/, '$1local-dev-kv$2');
  
  fs.writeFileSync(devTomlPath, devContent, 'utf8');
  args = ['wrangler', 'dev', '-c', devTomlPath];
}

// 透传其他命令行参数（如 --port 8787 等）
args.push(...process.argv.slice(2));

const child = spawn('npx', args, {
  cwd: rootDir,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
