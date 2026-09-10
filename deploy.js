#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tomlPath = path.join(__dirname, 'wrangler.toml');

console.log('🔍 正在检查 Cloudflare 账户与 KV 命名空间...');

let kvId = '';

// 1. 自动查询当前账号下是否已有名为 KV 的命名空间
const tempToml = path.join(__dirname, '.temp-deploy-query.toml');
try {
  fs.writeFileSync(tempToml, 'name = "node-hub"\ncompatibility_date = "2026-09-06"\n', 'utf8');
  const listRaw = execSync(`npx wrangler kv namespace list -c "${tempToml}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  const list = JSON.parse(listRaw);
  if (Array.isArray(list)) {
    const match = list.find(item => item.title && (item.title === 'KV' || item.title.endsWith('-KV') || item.title.includes('KV')));
    if (match && match.id) {
      kvId = match.id.trim();
      console.log(`✅ 自动匹配到已有 KV 命名空间 ID: ${kvId}`);
    }
  }
} catch {
  // 忽略查询异常，继续尝试创建
} finally {
  try { if (fs.existsSync(tempToml)) fs.unlinkSync(tempToml); } catch {}
}

// 2. 若未找到，全自动创建并提取 ID
if (!kvId) {
  try {
    fs.writeFileSync(tempToml, 'name = "node-hub"\ncompatibility_date = "2026-09-06"\n', 'utf8');
    console.log('⚡ 正在自动创建专属 KV 命名空间 (KV)...');
    const createOut = execSync(`npx wrangler kv namespace create KV -c "${tempToml}"`, { encoding: 'utf8' });
    const match = createOut.match(/id\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      kvId = match[1].trim();
      console.log(`🎉 成功创建 KV 命名空间，自动获取 ID: ${kvId}`);
    }
  } catch (err) {
    console.warn('⚠️ 自动创建 KV 提示:', err.message);
  } finally {
    try { if (fs.existsSync(tempToml)) fs.unlinkSync(tempToml); } catch {}
  }
}

// 3. 自动注入真实 KV ID 到 wrangler.toml
if (kvId && fs.existsSync(tomlPath)) {
  let tomlContent = fs.readFileSync(tomlPath, 'utf8');
  const kvSectionRegex = /\[\[kv_namespaces\]\]\s*\n\s*binding\s*=\s*["']KV["']\s*\n\s*id\s*=\s*["'][^"']*["']/;
  const newKvSection = `[[kv_namespaces]]\nbinding = "KV"\nid = "${kvId}"`;

  if (kvSectionRegex.test(tomlContent)) {
    tomlContent = tomlContent.replace(kvSectionRegex, newKvSection);
    fs.writeFileSync(tomlPath, tomlContent, 'utf8');
    console.log('💾 已自动将真实 KV ID 写入 wrangler.toml，无需任何手动修改！');
  }
}

// 4. 执行一键发布部署
console.log('🚀 正在一键推送到 Cloudflare Workers 生产环境...');
try {
  execSync('npx wrangler deploy', { stdio: 'inherit' });
} catch (err) {
  console.error('❌ 部署中断，请确认已运行 npx wrangler login 完成授权。');
  process.exit(1);
}
