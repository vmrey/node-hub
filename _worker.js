var Jt="X0qP-4iIdcUrmtGnLWw531shzKavoT8bufRMZlDHSFye2Q76CgxjBpA_Vk9YNOJE",Kt=(o="")=>{let e=String(o).trim();if(!e)return{cipherMap:Jt,xorKey:88};let t=Jt.split(""),n=2166136261;for(let i=0;i<e.length;i++)n^=e.charCodeAt(i),n=Math.imul(n,16777619)>>>0;let a=n&255,s=()=>{n=n+1831565813>>>0;let i=Math.imul(n^n>>>15,1|n);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296};for(let i=t.length-1;i>0;i--){let l=Math.floor(s()*(i+1)),d=t[i];t[i]=t[l],t[l]=d}return{cipherMap:t.join(""),xorKey:a}},Oe=o=>{let e=[];for(let t=0;t<o.length;t++){let n=o.charCodeAt(t);if(n>=55296&&n<=56319){let a=o.charCodeAt(++t);n=(n-55296)*1024+(a-56320)+65536}n<128?e.push(n):n<2048?e.push(192|n>>6,128|n&63):n<65536?e.push(224|n>>12,128|n>>6&63,128|n&63):e.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|n&63)}return e},De=o=>{let e=[],t=0;for(;t<o.length;){let n=o[t],a,s;if(n<128)a=n,s=0;else if((n&224)===192)a=n&31,s=1;else if((n&240)===224)a=n&15,s=2;else if((n&248)===240)a=n&7,s=3;else{e.push(""),t++;continue}if(t+s>=o.length){e.push("");break}for(let i=0;i<s;i++)a=a<<6|o[++t]&63;t++,a>65535?(a-=65536,e.push(String.fromCharCode(55296|a>>10,56320|a&1023))):e.push(String.fromCharCode(a))}return e.join("")},Me=(o,e)=>{let t="";for(let n=0;n<o.length;n+=3){let a=o[n],s=n+1<o.length?o[n+1]:0,i=n+2<o.length?o[n+2]:0;t+=e[a>>2],t+=e[(a&3)<<4|s>>4],t+=n+1<o.length?e[(s&15)<<2|i>>6]:"=",t+=n+2<o.length?e[i&63]:"="}return t},Ve=(o,e)=>{if(!o)return null;let t=String(o).trim();for(;t.endsWith("=");)t=t.slice(0,-1);if(!t)return null;let n=[],a=0,s=0;for(let i=0;i<t.length;i++){let l=e.indexOf(t[i]);if(l<0)return null;a=(a<<6|l)&4294967295,s+=6,s>=8&&(s-=8,n.push(a>>s&255))}return n},z=(o,e="")=>{if(!o)return"";let{cipherMap:t,xorKey:n}=Kt(e),a=Oe(o);for(let s=0;s<a.length;s++)a[s]=(a[s]^n+s&255)&255;return Me(a,t)},L=(o,e="")=>{if(!o)return"";let{cipherMap:t,xorKey:n}=Kt(e),a=Ve(o,t);if(!a)return"";let s=[];for(let i=0;i<a.length;i++)s.push((a[i]^n+i&255)&255);return De(s)};var Fe=[{id:"cmcc",name:"\u4E2D\u56FD\u79FB\u52A8 (CMCC)",url:"https://cf.090227.xyz/cmcc?ips=10",enabled:!0},{id:"cu",name:"\u4E2D\u56FD\u8054\u901A (CU)",url:"https://cf.090227.xyz/cu?ips=10",enabled:!0},{id:"ct",name:"\u4E2D\u56FD\u7535\u4FE1 (CT)",url:"https://cf.090227.xyz/ct?ips=10",enabled:!0}],Z=null;async function k(o){if(Z)return Z;if(o.CIPHER_KEY&&o.CIPHER_KEY.trim())return Z=o.CIPHER_KEY.trim(),Z;let e=C(o);if(e)try{let s=await e.get("sys_cipher_key");if(s&&s.trim()&&s.trim().length>=16)return Z=s.trim(),Z}catch(s){console.error("Failed to read sys_cipher_key from KV",s)}let t=new Uint8Array(1);crypto.getRandomValues(t);let n=64+t[0]%65,a=bt(n);if(e)try{await e.put("sys_cipher_key",a)}catch(s){console.error("Failed to save auto-generated sys_cipher_key to KV",s)}return Z=a,Z}async function Xt(o){let e=new TextEncoder().encode(o),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(a=>a.toString(16).padStart(2,"0")).join("")}function qt(o,e){let t=o.headers.get("Cookie");if(!t)return null;let n=t.split(";").map(a=>a.trim());for(let a of n)if(a.startsWith(e+"="))return decodeURIComponent(a.substring(e.length+1));return null}function dt(o){let e=new TextEncoder().encode(o),t="";for(let n=0;n<e.byteLength;n++)t+=String.fromCharCode(e[n]);return btoa(t)}function at(o){if(!o||typeof o!="string")return"";try{let t=o.trim().replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/");for(;t.length%4;)t+="=";let n=atob(t),a=new Uint8Array(n.length);for(let s=0;s<n.length;s++)a[s]=n.charCodeAt(s);return new TextDecoder().decode(a)}catch{return""}}function C(o){return o.KV||null}async function Qt(o){let e=C(o);if(e)try{let t=await e.get("custom_base_vless");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a&&a.trim())return a.trim();if(t.trim().startsWith("vless://"))return t.trim()}}catch(t){console.error("Failed to read custom_base_vless from KV",t)}return o.BASE_VLESS||""}async function Zt(o){let e=C(o);if(e)try{let t=await e.get("custom_sources");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n),s=null;if(a)try{s=JSON.parse(a)}catch{}if(!s&&(t.startsWith("[")||t.startsWith("{")))try{s=JSON.parse(t)}catch{}if(s&&Array.isArray(s)&&s.length>0)return s}}catch(t){console.error("Failed to read from KV",t)}return Fe}async function Ct(o,e){let t=C(o);if(t){let n=await k(o),a=JSON.stringify(e),s=z(a,n);await t.put("custom_sources",s)}}async function te(o){let e=C(o);if(e)try{let t=await e.get("custom_plain_groups");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a)try{let s=JSON.parse(a);if(Array.isArray(s))return s}catch{}}}catch(t){console.error("Failed to read custom_plain_groups from KV",t)}return[]}async function pt(o,e){let t=C(o);if(t){let n=await k(o),a=JSON.stringify(e),s=z(a,n);await t.put("custom_plain_groups",s)}}async function ee(o){let e=C(o);if(e)try{let t=await e.get("custom_cf_groups");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a)try{let s=JSON.parse(a);if(Array.isArray(s))return s}catch{}}}catch(t){console.error("Failed to read custom_cf_groups from KV",t)}return[]}async function ut(o,e){let t=C(o);if(t){let n=await k(o),a=JSON.stringify(e),s=z(a,n);await t.put("custom_cf_groups",s)}}function bt(o=16){let e="abcdefghijklmnopqrstuvwxyz0123456789",t=new Uint8Array(o);crypto.getRandomValues(t);let n="";for(let a=0;a<o;a++)n+=e[t[a]%e.length];return n}async function oe(o){let e=C(o);if(e)try{let n=await e.get("custom_sub_path");if(n&&n.trim()){let a=await k(o),s=L(n.trim(),a);if(s&&s.trim())return s.trim().replace(/^\/+|\/+$/g,"")}}catch(n){console.error("Failed to read custom_sub_path from KV",n)}if(o.SUB_PATH&&o.SUB_PATH.trim())return o.SUB_PATH.trim().replace(/^\/+|\/+$/g,"");let t=bt(12);if(e)try{await $t(o,t)}catch{}return t}async function $t(o,e){let t=C(o);if(t){let n=await k(o),a=(e||bt(12)).trim().replace(/^\/+|\/+$/g,""),s=z(a,n);await t.put("custom_sub_path",s)}}async function ne(o){let e=C(o);if(e)try{let n=await e.get("custom_token");if(n&&n.trim()){let a=await k(o),s=L(n.trim(),a);if(s&&s.trim())return s.trim()}}catch(n){console.error("Failed to read custom_token from KV",n)}if(o.TOKEN&&o.TOKEN.trim())return o.TOKEN.trim();let t=bt(24);if(e)try{await Nt(o,t)}catch{}return t}async function Nt(o,e){let t=C(o);if(t){let n=await k(o),a=(e||bt(24)).trim(),s=z(a,n);await t.put("custom_token",s)}}async function ae(o){let e=C(o);if(e)try{let t=await e.get("custom_allowed_countries");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a){let s=JSON.parse(a);if(Array.isArray(s))return s.map(i=>String(i).trim().toUpperCase()).filter(Boolean)}}}catch(t){console.error("Failed to read custom_allowed_countries from KV",t)}return o.ALLOWED_COUNTRIES&&o.ALLOWED_COUNTRIES.trim()?o.ALLOWED_COUNTRIES.split(",").map(t=>t.trim().toUpperCase()).filter(Boolean):[]}async function se(o,e){let t=C(o);if(t){let n=await k(o),a=Array.isArray(e)?e.map(i=>String(i).trim().toUpperCase()).filter(Boolean):typeof e=="string"?e.split(",").map(i=>i.trim().toUpperCase()).filter(Boolean):[],s=z(JSON.stringify(a),n);await t.put("custom_allowed_countries",s)}}async function re(o){let e=C(o);if(e)try{let t=await e.get("custom_proxy_client_only");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a!=null)return a==="true"||a===!0}}catch(t){console.error("Failed to read custom_proxy_client_only from KV",t)}return o.PROXY_CLIENT_ONLY!==void 0&&o.PROXY_CLIENT_ONLY!==null&&o.PROXY_CLIENT_ONLY!==""?String(o.PROXY_CLIENT_ONLY).toLowerCase()==="true":!0}async function ie(o,e){let t=C(o);if(t){let n=await k(o),s=z(e===!0||e==="true"?"true":"false",n);await t.put("custom_proxy_client_only",s)}}async function ft(o){let e=C(o);if(e)try{let t=await e.get("blocked_ips");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a){let s=JSON.parse(a);if(Array.isArray(s))return s}}}catch(t){console.error("Failed to read blocked_ips from KV",t)}return[]}async function tt(o,e){let t=C(o);if(t){let n=await k(o),a=JSON.stringify(e),s=z(a,n);await t.put("blocked_ips",s)}}async function Ut(o){let e=C(o);if(e)try{let t=await e.get("whitelist_ips");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a){let s=JSON.parse(a);if(Array.isArray(s))return s}}}catch(t){console.error("Failed to read whitelist_ips from KV",t)}return[]}async function Rt(o,e){let t=C(o);if(t){let n=await k(o),a=JSON.stringify(e),s=z(a,n);await t.put("whitelist_ips",s)}}async function It(o){let e=C(o);if(e)try{let t=await e.get("access_logs");if(t&&t.trim()){let n=await k(o),a=L(t.trim(),n);if(a){let s=JSON.parse(a);if(Array.isArray(s))return s}}}catch(t){console.error("Failed to read access_logs from KV",t)}return[]}async function $(o,e){let t=C(o);if(t)try{let n=await It(o),a=[e,...n].slice(0,100),s=await k(o),i=z(JSON.stringify(a),s);await t.put("access_logs",i)}catch(n){console.error("Failed to record access log in KV",n)}}async function ce(o,e){let t=C(o);if(t)try{let n=await k(o),a=z(JSON.stringify(e.slice(0,100)),n);await t.put("access_logs",a)}catch(n){console.error("Failed to save access logs to KV",n)}}async function le(o){let e=C(o);if(e)try{await e.delete("access_logs")}catch{}}async function St(o,e){let t=C(o);if(!t||!e)return{count:0,lockUntil:0,lockSeconds:0};try{let n="login_fail_"+e.trim(),a=await t.get(n);if(a){let s=await k(o),i=L(a.trim(),s)||a.trim(),l=null;try{l=JSON.parse(i)}catch{let d=parseInt(i,10);isNaN(d)||(l={count:d,lockUntil:0})}if(l&&typeof l.count=="number"){let d=Date.now(),c=Number(l.lockUntil||0),h=c>d?Math.ceil((c-d)/1e3):0;return{count:l.count,lockUntil:c,lockSeconds:h}}}}catch(n){console.error("Failed to read login_fail count from KV",n)}return{count:0,lockUntil:0,lockSeconds:0}}async function de(o,e){let t=C(o);if(!t||!e)return{count:1,lockUntil:0,lockSeconds:60};try{let a=(await St(o,e)).count+1,s=60*Math.pow(2,a-1),l=Date.now()+s*1e3,d={count:a,lockUntil:l},c="login_fail_"+e.trim(),h=await k(o),u=z(JSON.stringify(d),h),m=Math.max(86400,s+3600);return await t.put(c,u,{expirationTtl:m}),{count:a,lockUntil:l,lockSeconds:s}}catch(n){console.error("Failed to update login_fail in KV",n)}return{count:1,lockUntil:Date.now()+6e4,lockSeconds:60}}async function _t(o,e){let t=C(o);if(!(!t||!e))try{let n="login_fail_"+e.trim();await t.delete(n)}catch{}}var je=600*1e3;async function pe(o,e){let t=await k(o),n=Date.now()+je;return z(`${e}:${n}`,t)}async function ue(o,e,t,n){if(!C(o)||!n||!e||!e.trim())return!1;try{let a=await k(o),s=L(e.trim(),a);if(!s||!s.includes(":"))return s===t;let[i,l]=s.split(":"),d=parseInt(l,10);return Date.now()>d?!1:i===t}catch{return!1}}function Yt(o){let e=o.split(".").map(t=>parseInt(t,10));return e.length!==4||e.some(t=>isNaN(t)||t<0||t>255)?null:(e[0]<<24>>>0)+(e[1]<<16>>>0)+(e[2]<<8>>>0)+(e[3]>>>0)}function He(o,e){if(!e.includes("/"))return o.toLowerCase()===e.toLowerCase();let[t,n]=e.split("/"),a=parseInt(n,10);if(isNaN(a))return!1;let s=Yt(o),i=Yt(t);if(s!==null&&i!==null){if(a<=0)return!0;if(a>32)return!1;let l=a===32?4294967295:~((1<<32-a)-1)>>>0;return(s&l)===(i&l)}if(o.includes(":")&&t.includes(":")){let l=o.toLowerCase(),d=t.toLowerCase();if(a<=64&&l.startsWith(d.replace(/::?$/,"")))return!0}return!1}function st(o,e){if(!o||!Array.isArray(e)||e.length===0)return!1;let t=o.trim();for(let n of e){let a=String(n).trim();if(a)try{if(He(t,a))return!0}catch{if(t.toLowerCase()===a.toLowerCase())return!0}}return!1}async function fe(o,e){let t=C(o);if(!t||!e)return 1;try{let n="sub_fail_"+e.trim(),a=await t.get(n),s=0;if(a){let d=await k(o),c=L(a.trim(),d);s=parseInt(c,10)||0}s+=1;let i=await k(o),l=z(String(s),i);return await t.put(n,l,{expirationTtl:3600}),s}catch{return 1}}async function Pt(o,e){let t=C(o);if(!(!t||!e))try{await t.delete("sub_fail_"+e.trim())}catch{}}async function Ot(o){let e=(o.TG_BOT_TOKEN||"").trim(),t=(o.TG_CHAT_ID||"").trim(),n=(o.TG_API_HOST||"").trim().replace(/\/+$/,"")||"https://api.telegram.org",a=o.TG_NOTIFY_ENABLED!==void 0&&o.TG_NOTIFY_ENABLED!==null&&o.TG_NOTIFY_ENABLED!==""?String(o.TG_NOTIFY_ENABLED).toLowerCase()==="true":!1,s=C(o);if(s)try{let i=await s.get("custom_tg_config");if(i&&i.trim()){let l=await k(o),d=L(i.trim(),l);if(d){let c=JSON.parse(d);c&&typeof c=="object"&&(c.token!==void 0&&(e=String(c.token).trim()),c.chatId!==void 0&&(t=String(c.chatId).trim()),c.apiHost!==void 0&&String(c.apiHost).trim()&&(n=String(c.apiHost).trim().replace(/\/+$/,"")),c.enabled!==void 0&&(a=c.enabled===!0||c.enabled==="true"))}}}catch(i){console.error("Failed to read custom_tg_config from KV",i)}return{token:e,chatId:t,apiHost:n,enabled:a}}function ge(o){if(!o)return"";let e=String(o).trim();return e.toLowerCase().startsWith("bot")&&(e=e.slice(3).trim()),e}function me(o){if(!o)return"";let e=String(o).trim(),t=e.match(/t\.me\/c\/(\d+)/i);if(t)return`-100${t[1]}`;let n=e.match(/t\.me\/([a-zA-Z0-9_]+)/i);return n&&!["c","joinchat","addstickers"].includes(n[1].toLowerCase())?`@${n[1]}`:e}async function he(o,e){let t=C(o);if(t){let n=await k(o),a={token:ge(e.token),chatId:me(e.chatId),apiHost:(e.apiHost||"").trim().replace(/\/+$/,"")||"https://api.telegram.org",enabled:e.enabled===!0||e.enabled==="true"},s=z(JSON.stringify(a),n);await t.put("custom_tg_config",s)}}async function Dt(o,e,t=null){try{let n=t||await Ot(o);if(!n.enabled&&!t?.force)return{success:!1,error:"Telegram \u901A\u77E5\u63A8\u9001\u672A\u5F00\u542F"};let a=ge(n.token),s=me(n.chatId);if(!a||!s)return{success:!1,error:"Bot Token \u6216 Chat ID \u4E3A\u7A7A"};let l=`${(n.apiHost||"https://api.telegram.org").replace(/\/+$/,"")}/bot${a}/sendMessage`,d=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:s,text:e,parse_mode:"HTML",disable_web_page_preview:!0})}),c=await d.json().catch(()=>null);if(!d.ok||c&&!c.ok){let h=c?.description||await d.text().catch(()=>"")||`HTTP ${d.status}`;return{success:!1,error:`TG API \u54CD\u5E94\u9519\u8BEF [HTTP ${d.status}]: ${h}`}}return{success:!0,chat:c?.result?.chat||null,messageId:c?.result?.message_id||null}}catch(n){return{success:!1,error:`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25: ${n.message}`}}}var be="23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";function We(o=4){let e="",t=new Uint8Array(o);crypto.getRandomValues(t);for(let n=0;n<o;n++)e+=be[t[n]%be.length];return e}function Ge(o){let n=o.split(""),a="",s=["#94a3b8","#cbd5e1","#64748b","#0284c7","#8b5cf6"];for(let u=0;u<3;u++){let m=Math.floor(Math.random()*20),y=Math.floor(Math.random()*42),w=120-Math.floor(Math.random()*20),T=Math.floor(Math.random()*42),g=120/2+(Math.random()*40-20),I=Math.floor(Math.random()*42),R=s[u%s.length];a+=`<path d="M ${m} ${y} Q ${g} ${I} ${w} ${T}" stroke="${R}" stroke-width="1.5" fill="none" opacity="0.65"/>`}let i="";for(let u=0;u<20;u++){let m=Math.floor(Math.random()*120),y=Math.floor(Math.random()*42),w=(Math.random()*1.5+.5).toFixed(1);i+=`<circle cx="${m}" cy="${y}" r="${w}" fill="#94a3b8" opacity="0.5"/>`}let l=["#0f172a","#0369a1","#4338ca","#6d28d9","#b91c1c","#047857"],d="",c=120/(n.length+1);n.forEach((u,m)=>{let y=Math.floor((m+.8)*c),w=28+Math.floor(Math.random()*6-3),T=Math.floor(Math.random()*36-18),g=l[(m+Math.floor(Math.random()*l.length))%l.length],I=22+Math.floor(Math.random()*4);d+=`<text x="${y}" y="${w}" font-family="monospace, Arial" font-size="${I}" font-weight="bold" fill="${g}" transform="rotate(${T}, ${y}, ${w})">${u}</text>`});let h=`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="42" viewBox="0 0 120 42" style="border-radius: 6px; background: #f8fafc; border: 1px solid #cbd5e1; cursor: pointer; user-select: none;">
    ${a}
    ${i}
    ${d}
  </svg>`;return"data:image/svg+xml;utf8,"+encodeURIComponent(h)}async function ye(o,e,t){let n=We(4),a=Ge(n),s=await e(o),i=Date.now()+300*1e3,l=t(`${n.toUpperCase()}:${i}`,s);return{svgDataUri:a,captchaToken:l}}async function xe(o,e,t,n,a){if(!o||!e)return!1;try{let s=await n(t),i=a(e.trim(),s);if(!i||!i.includes(":"))return!1;let[l,d]=i.split(":"),c=parseInt(d,10);return Date.now()>c?!1:o.trim().toUpperCase()===l.trim().toUpperCase()}catch{return!1}}function we(o){if(!o||typeof o!="string")return"";try{return decodeURIComponent(o)}catch{return o}}function Je(o){if(!o||typeof o!="string")return"";try{return encodeURIComponent(o)}catch{return o}}function ve(o){if(!o||typeof o!="string")return null;try{let e=o.trim();if(!e)return null;if(!e.startsWith("vless://")){let g=at(e);return g&&g.includes("vless://")?Te(g):null}let t=e.slice(8).trim();if(!t.includes("@")&&!t.includes("?")&&!t.includes("#")){let g=at(t);g&&g.includes("@")&&(g.includes(":")||g.includes("?"))&&(t=g.trim())}let n="",a=t.indexOf("#");a!==-1&&(n=we(t.slice(a+1)),t=t.slice(0,a));let s="",i=t.indexOf("?");i!==-1&&(s=t.slice(i+1),t=t.slice(0,i));let l=t,d=!1;if(!l.includes("@")){let g=at(l);g&&g.includes("@")&&(l=g,d=!0)}let c=l.lastIndexOf("@");if(c===-1)return null;let h=l.slice(0,c),u=l.slice(c+1),m="",y="443";if(u.startsWith("[")){let g=u.indexOf("]");if(g!==-1){m=u.slice(0,g+1);let I=u.slice(g+1);I.startsWith(":")&&(y=I.slice(1))}else m=u}else{let g=u.lastIndexOf(":");g!==-1?(m=u.slice(0,g),y=u.slice(g+1)):m=u}if(m=m.trim(),!m||m.includes("?")||m.includes("/")||m.includes("#")||m.includes(" "))return null;let w=h.trim();if(h.includes(":")){let g=h.split(":"),I=R=>/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(R);I(g[0])?w=g[0]:I(g[1])?w=g[1]:g[0].length>=32?w=g[0]:w=g[1]||g[0]}if(!w||w.length<6||w.includes("?")||w.includes("/")||w.includes("#"))return null;let T=new URLSearchParams(s);return n||(n=T.get("remarks")||T.get("remark")||T.get("name")||""),{isBase64Encoded:d,userInfo:h,uuid:w,host:m,port:y,queryStr:s,searchParams:T,remark:n}}catch(e){return console.error("Error in parseSingleVless:",e),null}}var Ke={fieldAliases:{security:["security","tls"],sni:["sni","peer","obfsParam","host"],host:["host","obfsParam","peer","sni"],fp:["fp","fingerprint"],type:["type","net","obfs","network"],path:["path"],pbk:["pbk","publicKey"],sid:["sid","shortId"],spx:["spx","spiderX"],serviceName:["serviceName","service_name"],mode:["mode"],flow:["flow"],alpn:["alpn"],allowInsecure:["allowInsecure","insecure"],headerType:["headerType","header_type"],seed:["seed","kcpSeed"],quicSecurity:["quicSecurity","quic_security"],key:["key","quicKey"]},valueTransformers:{type:{xhttp:"xhttp",splithttp:"xhttp",websocket:"ws",ws:"ws",httpupgrade:"httpupgrade",grpc:"grpc",gun:"grpc",multi:"grpc",http:"tcp",tcp:"tcp",raw:"tcp",h2:"h2",kcp:"kcp",mkcp:"kcp",quic:"quic"},security:{1:"tls",true:"tls",tls:"tls",reality:"reality",none:"none",0:"none",false:"none"}},tlsDefaultPorts:["443","8443","2053","2083","2087","2096"]};function Mt(o){if(!o||typeof o!="string")return!1;let e=o.trim().replace(/^\[|\]$/g,"");return!!(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})$/.test(e)||(e.match(/:/g)||[]).length>=2)}function Ye(o){if(!o||typeof o!="string")return"";let e=o.trim();return e.startsWith("[")&&e.endsWith("]")?e:(e.match(/:/g)||[]).length>=2?`[${e}]`:e}function A(o,e=[]){if(!o||!Array.isArray(e))return"";for(let t of e)if(o.has(t)){let n=o.get(t);if(n!=null&&n!=="")return n}return""}function Et(o,e={}){if(!o||!o.uuid)return"";try{let t=e.host||o.host||"",n=Ye(t),a=e.port||o.port||"443",s=e.remark!==void 0?e.remark:o.remark||"",i=o.searchParams||new URLSearchParams(o.queryStr||""),l=new URLSearchParams,{fieldAliases:d,valueTransformers:c,tlsDefaultPorts:h}=Ke,u=A(i,d.pbk),m=A(i,d.security),y=c.security[m.toLowerCase()]||m;u?y="reality":y||(y=h.includes(a)?"tls":"none"),l.set("security",y),l.set("encryption",i.get("encryption")||"none");let w=A(i,d.type),T=c.type[w.toLowerCase()];T||(i.has("path")&&w!=="tcp"?T="ws":y==="reality"?T="tcp":w?T=w:T="tcp"),l.set("type",T);let g=A(i,d.headerType);g&&l.set("headerType",g);let I=A(i,d.flow);I&&T==="tcp"&&l.set("flow",I);let R=A(i,d.alpn);R&&l.set("alpn",R);let X=A(i,d.allowInsecure);X&&l.set("allowInsecure",X);let et=A(i,d.seed);et&&l.set("seed",et);let q=A(i,d.quicSecurity);q&&l.set("quicSecurity",q);let N=A(i,d.key);N&&l.set("key",N);let Tt=Mt(o.host)?"":o.host,mt=A(i,d.sni),G=A(i,d.host),Q=mt||Tt,D=G||Tt;Mt(Q)&&!Mt(D)&&(Q=D),Q&&y!=="none"&&l.set("sni",Q);let H=["ws","xhttp","splithttp","httpupgrade","h2"].includes(T)||T==="tcp"&&g==="http";H&&D&&l.set("host",D);let ot=A(i,d.fp);ot&&l.set("fp",ot);let V=A(i,d.path);if(V&&(H||T==="ws"||T==="xhttp")&&(V=we(V),V.startsWith("/")||(V="/"+V),l.set("path",V)),y==="reality"){let J=A(i,d.pbk);J&&l.set("pbk",J);let B=A(i,d.sid);B&&l.set("sid",B);let P=A(i,d.spx);P&&l.set("spx",P)}if(T==="grpc"){let J=A(i,d.serviceName);J&&l.set("serviceName",J);let B=A(i,d.mode);B&&l.set("mode",B)}let nt=l.toString().replace(/%2F/g,"/"),rt=nt?`?${nt}`:"",it=s?`#${Je(s)}`:"";return`vless://${o.uuid}@${n}:${a}${rt}${it}`}catch(t){return console.error("Error in buildStandardVless:",t),""}}function Xe(o){if(!o||typeof o!="string")return null;let e=o.trim();if(!e.toLowerCase().startsWith("vless="))return null;try{let n=e.slice(6).trim().split(",").map(u=>u.trim());if(n.length===0)return null;let a=n[0],s={};for(let u=1;u<n.length;u++){let m=n[u],y=m.indexOf("=");y!==-1&&(s[m.slice(0,y).trim().toLowerCase()]=m.slice(y+1).trim())}let i=s.password||s.uuid||"";if(!i)return null;let l=a,d="443";if(a.includes(":")){let u=a.lastIndexOf(":");l=a.slice(0,u),d=a.slice(u+1)}let c=new URLSearchParams,h=s.tls==="true"||s.tls==="1";return c.set("security",h?"tls":"none"),c.set("type",s.obfs||"ws"),s["obfs-host"]&&c.set("host",s["obfs-host"]),s["obfs-uri"]&&c.set("path",s["obfs-uri"]),s.pbk&&(c.set("security","reality"),c.set("pbk",s.pbk)),s.sid&&c.set("sid",s.sid),Et({uuid:i,host:l,port:d,remark:s.tag||"",searchParams:c})}catch{return null}}function ke(o){if(!o||typeof o!="string")return"";try{let e=o.trim();if(!e||e.startsWith("#")||e.startsWith("//")||e.startsWith(";")||e.startsWith("!"))return"";if(e.toLowerCase().startsWith("vless=")){let t=Xe(e);if(t)return t}if(e.toLowerCase().startsWith("vless://")){let t=ve(e);if(t&&t.uuid&&t.port){let n=Et(t);if(n)return n}return e}if(!e.includes("://")){let t=at(e);if(t&&(t.includes("://")||t.toLowerCase().includes("vless=")))return t.replace(/\r\n|\r/g,`
`).split(`
`).map(s=>s.trim()).filter(Boolean).map(ke).filter(Boolean).join(`
`)}return e.includes("://")?e:""}catch(e){return console.error("Error in standardizeNode:",e),String(o||"").trim()}}function yt(o){if(!o)return[];try{let e="";if(Array.isArray(o)?e=o.join(`
`):e=String(o||""),!e.includes("://")){let a=at(e.trim());a&&a.includes("://")&&(e=a)}let t=e.replace(/\r\n|\r/g,`
`).split(`
`).map(a=>a.trim()).filter(Boolean),n=[];for(let a of t){let s=ke(a);if(s){let i=s.split(`
`).map(l=>l.trim()).filter(Boolean);n.push(...i)}}return[...new Set(n)]}catch(e){return console.error("Error in standardizeNodesText:",e),Array.isArray(o)?o.map(String).filter(Boolean):String(o||"").split(`
`).map(t=>t.trim()).filter(Boolean)}}function Te(o){if(!o||typeof o!="string")return null;let e=o.trim();if(!e)return null;if(!e.startsWith("vless://")){let n=at(e);n&&n.includes("vless://")&&(e=n.trim())}let t=e.replace(/\r\n|\r/g,`
`).split(`
`);for(let n of t){if(n=n.trim(),!n)continue;let a=ve(n);if(a&&a.uuid&&a.port)return a}return null}function qe(o){let e=o.trim();if(!e)return"";if(e.startsWith("[")){let a=e.match(/^\[([^\]]+)\](?::\d+)?/);if(a)return`[${a[1]}]`}if((e.match(/:/g)||[]).length>=2)return`[${e}]`;let t=e.match(/^((?:[0-9]{1,3}\.){3}[0-9]{1,3})(?::\d+)?/);if(t)return t[1];let n=e.match(/^([a-zA-Z0-9.-]+)(?::\d+)?/);return n?n[1]:e.split(":")[0].trim()}async function Bt(o,e,t="base64"){if(!o)return new Response("404 Not Found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});let n=Te(o);if(!n)return new Response("404 Not Found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});let s=(e||[]).filter(u=>u&&u.url&&u.enabled!==!1).map(async u=>{try{let m=new AbortController,y=setTimeout(()=>m.abort(),2500),w=await fetch(u.url,{signal:m.signal,headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"}});if(clearTimeout(y),!w.ok)return{source:u,text:""};let T=await w.text();return{source:u,text:T}}catch{return{source:u,text:""}}}),i=await Promise.all(s),l=[];i.forEach(({source:u,text:m})=>{if(!m)return;m.replace(/,|\r\n|\r/g,`
`).split(`
`).forEach(w=>{if(w=w.trim(),!w)return;let T="",g="";if(w.includes("#")){let N=w.split("#");T=N[0].trim(),g=N.slice(1).join("#").trim()}else T=w.trim();let I=qe(T);if(!I)return;let R="";g?R=g.replace(/^CF\s*/i,"").trim():u&&u.name&&!u.name.startsWith("\u6E90-")&&!u.name.startsWith("http")&&(R=u.name.replace(/\s*\(.*?\)/g,"").trim());let X=I.replace(/^\[|\]$/g,""),et=R?`${R}-${X}`:X,q=Et(n,{host:I,remark:et});q&&l.push(q)})});let d=[...new Set(l)];d.length===0&&d.push(Et(n));let c=d.join(`
`),h=t==="base64"?dt(c):c;return new Response(h,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",Pragma:"no-cache","Access-Control-Allow-Origin":"*","Subscription-Userinfo":"upload=0; download=0; total=1073741824000; expire=0","Profile-Update-Interval":"24"}})}async function Ce(o,e,t,n="",a=[]){let s=new URL(o.url),i=s.searchParams.get("type")||"",l=s.searchParams.get("format")||"base64";if(i==="custom"){let u=(s.searchParams.get("group")||"").toLowerCase(),m=a;u&&(m=a.filter(I=>I.id.toLowerCase()===u));let y=[];if(m.forEach(I=>{let R=yt(I.nodes);y.push(...R)}),y.length===0)return new Response("404 Not Found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});let T=[...new Set(y)].join(`
`),g=l==="base64"?dt(T):T;return new Response(g,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",Pragma:"no-cache","Access-Control-Allow-Origin":"*","Subscription-Userinfo":"upload=0; download=0; total=1073741824000; expire=0","Profile-Update-Interval":"24"}})}let d=s.searchParams.get("base")||n||e.BASE_VLESS;if(!d){let u=[];if(a.forEach(m=>{let y=yt(m.nodes);u.push(...y)}),u.length>0){let y=[...new Set(u)].join(`
`),w=l==="base64"?dt(y):y;return new Response(w,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",Pragma:"no-cache","Access-Control-Allow-Origin":"*","Subscription-Userinfo":"upload=0; download=0; total=1073741824000; expire=0","Profile-Update-Interval":"24"}})}return new Response("404 Not Found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let c=(s.searchParams.get("isp")||"").toLowerCase(),h=[];return c?(h=t.filter(u=>u.id.toLowerCase()===c),h.length===0&&(h=t)):h=t,await Bt(d,h,l)}function Ie(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function At(o="",e="",t="",n=0){let a=n>0;return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="cloudflare-insights-beacon" content="false">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\u26A1</text></svg>">
  <title>\u767B\u9646\u9762\u677F</title>
  <script>
    // \u62E6\u622A\u5E76\u963B\u65AD Cloudflare \u8FB9\u7F18\u81EA\u52A8\u6CE8\u5165\u7684 beacon \u6027\u80FD\u63A2\u9488\u811A\u672C\uFF0C\u9632\u6B62\u62A5\u9519
    (function() {
      // 1. \u5F7B\u5E95\u62E6\u622A\u52A8\u6001\u63D2\u5165\u7684 Cloudflare beacon / insights \u811A\u672C
      const isBeacon = (node) => node && node.tagName === 'SCRIPT' && (
        (node.src && (node.src.includes('cloudflareinsights.com') || node.src.includes('beacon.min.js'))) ||
        node.hasAttribute('data-cf-beacon')
      );
      const originalAppendChild = Node.prototype.appendChild;
      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.appendChild = function(child) {
        if (isBeacon(child)) return child;
        return originalAppendChild.apply(this, arguments);
      };
      Node.prototype.insertBefore = function(newNode, referenceNode) {
        if (isBeacon(newNode)) return newNode;
        return originalInsertBefore.apply(this, arguments);
      };

      // 2. \u589E\u5F3A performance API \u5BB9\u9519\u4FDD\u62A4\uFF0C\u9632\u6B62\u7B2C\u4E09\u65B9\u811A\u672C\u6216 DevTools \u8BFB\u53D6 startTime \u65F6\u62A5\u7A7A\u6307\u9488
      if (typeof window !== 'undefined' && window.performance) {
        const dummyEntry = {
          name: location.href,
          entryType: 'navigation',
          startTime: 0,
          duration: 0,
          responseStart: 0,
          responseEnd: 0,
          domInteractive: 0,
          domContentLoadedEventStart: 0,
          domContentLoadedEventEnd: 0,
          domComplete: 0,
          loadEventStart: 0,
          loadEventEnd: 0
        };
        if (typeof window.performance.getEntriesByType === 'function') {
          const rawGetEntries = window.performance.getEntriesByType.bind(window.performance);
          window.performance.getEntriesByType = function(type) {
            try {
              const res = rawGetEntries(type);
              if (Array.isArray(res) && res.length > 0) return res;
              return [{ ...dummyEntry, entryType: type }];
            } catch {
              return [{ ...dummyEntry, entryType: type }];
            }
          };
        }
        if (typeof window.performance.getEntriesByName === 'function') {
          const rawGetByName = window.performance.getEntriesByName.bind(window.performance);
          window.performance.getEntriesByName = function(name, type) {
            try {
              const res = rawGetByName(name, type);
              if (Array.isArray(res) && res.length > 0) return res;
              return [{ ...dummyEntry, name: name, entryType: type || 'resource' }];
            } catch {
              return [{ ...dummyEntry, name: name, entryType: type || 'resource' }];
            }
          };
        }
      }
    })();
  <\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #1e293b;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 28px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 20px 48px rgba(0, 0, 0, 0.05);
    }
    .card-icon {
      font-size: 38px;
      text-align: center;
      margin-bottom: 8px;
      line-height: 1;
    }
    .card h2 {
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 6px;
      color: #0f172a;
    }
    .card p.subtitle {
      font-size: 13px;
      color: #64748b;
      text-align: center;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }
    .form-group input {
      width: 100%;
      padding: 11px 14px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #0f172a;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-group input:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      background: #ffffff;
    }
    .form-group input:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
      color: #94a3b8;
    }
    .password-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-wrap input {
      padding-right: 42px;
    }
    .toggle-password-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 6px;
      transition: color 0.2s, background-color 0.2s;
    }
    .toggle-password-btn:hover {
      color: #334155;
      background-color: #f1f5f9;
    }
    .captcha-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .captcha-row input {
      flex: 1;
      min-width: 0;
    }
    .captcha-img-box {
      width: 120px;
      height: 42px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      transition: opacity 0.2s;
    }
    .captcha-img-box:hover {
      opacity: 0.85;
    }
    .captcha-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .btn {
      width: 100%;
      padding: 12px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 6px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn:hover:not(:disabled) {
      background: #0369a1;
    }
    .btn:active:not(:disabled) {
      transform: scale(0.99);
    }
    .btn:disabled {
      background: #94a3b8;
      cursor: not-allowed;
      opacity: 0.75;
    }
    .error-msg {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
      font-weight: 500;
      line-height: 1.5;
    }
    .security-notice {
      margin-top: 18px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.5;
    }
    @media (max-width: 640px) {
      .form-group input {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-icon">\u26A1</div>
    <h2>\u767B\u9646\u9762\u677F</h2>
    <p class="subtitle">\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801\u53CA\u9A8C\u8BC1\u7801\u4EE5\u8FDB\u5165\u63A7\u5236\u9762\u677F</p>
    ${o?`<div class="error-msg" id="error-alert">${Ie(o)}</div>`:""}
    <form method="POST" id="login-form">
      <input type="hidden" name="captcha_token" id="captcha-token-input" value="${Ie(t)}" />
      
      <div class="form-group">
        <label for="password">\u7BA1\u7406\u5458\u5BC6\u7801</label>
        <div class="password-wrap">
          <input type="password" id="password" name="password" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" ${a?"disabled":""} required autofocus autocomplete="current-password" />
          <button type="button" class="toggle-password-btn" id="toggle-password-btn" onclick="togglePasswordVisibility()" title="\u663E\u793A/\u9690\u85CF\u5BC6\u7801" tabindex="-1">
            <svg id="eye-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="captcha">\u56FE\u5F62\u9A8C\u8BC1\u7801 (\u70B9\u51FB\u56FE\u7247\u5237\u65B0)</label>
        <div class="captcha-row">
          <input type="text" id="captcha" name="captcha" placeholder="4\u4F4D\u5B57\u7B26" maxlength="6" ${a?"disabled":""} required autocomplete="off" />
          <div class="captcha-img-box" id="captcha-box" onclick="refreshCaptcha()" title="\u70B9\u51FB\u6362\u4E00\u5F20">
            <img id="captcha-img" src="${e}" alt="\u9A8C\u8BC1\u7801" />
          </div>
        </div>
      </div>

      <button type="submit" class="btn" id="login-submit-btn" ${a?"disabled":""}>${a?`\u23F3 \u8BF7\u7A0D\u540E (${n}s)`:"\u767B \u5F55"}</button>
    </form>
  </div>

  <script>
    let remainingLockSeconds = ${n||0};
    if (remainingLockSeconds > 0) {
      const btn = document.getElementById('login-submit-btn');
      const pwdInput = document.getElementById('password');
      const captchaInput = document.getElementById('captcha');
      const timer = setInterval(() => {
        remainingLockSeconds--;
        if (remainingLockSeconds <= 0) {
          clearInterval(timer);
          btn.disabled = false;
          btn.textContent = '\u767B \u5F55';
          if (pwdInput) pwdInput.disabled = false;
          if (captchaInput) captchaInput.disabled = false;
          const errBox = document.getElementById('error-alert');
          if (errBox) {
            errBox.style.background = '#f0fdf4';
            errBox.style.borderColor = '#bbf7d0';
            errBox.style.color = '#15803d';
            errBox.textContent = '\u2705 \u51B7\u5374\u65F6\u95F4\u5DF2\u7ED3\u675F\uFF0C\u8BF7\u91CD\u65B0\u8F93\u5165\u5BC6\u7801\u767B\u5F55\u3002';
          }
        } else {
          const m = Math.floor(remainingLockSeconds / 60);
          const s = remainingLockSeconds % 60;
          const timeStr = m > 0 ? (m + '\u5206' + (s < 10 ? '0' : '') + s + '\u79D2') : (s + '\u79D2');
          btn.textContent = '\u23F3 \u51B7\u5374\u9501\u5B9A\u4E2D (' + timeStr + ')';
        }
      }, 1000);
    }

    function togglePasswordVisibility() {
      const pwdInput = document.getElementById('password');
      const eyeIcon = document.getElementById('eye-icon');
      if (!pwdInput) return;
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        if (eyeIcon) {
          eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        }
      } else {
        pwdInput.type = 'password';
        if (eyeIcon) {
          eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
      }
    }

    async function refreshCaptcha() {
      try {
        const img = document.getElementById('captcha-img');
        const tokenInput = document.getElementById('captcha-token-input');
        img.style.opacity = '0.5';
        const res = await fetch('/api/captcha');
        const data = await res.json();
        if (data && data.svg && data.token) {
          img.src = data.svg;
          tokenInput.value = data.token;
        }
      } catch (err) {
        console.error('\u5237\u65B0\u9A8C\u8BC1\u7801\u5931\u8D25', err);
      } finally {
        document.getElementById('captcha-img').style.opacity = '1';
      }
    }
  <\/script>
</body>
</html>`}function zt({hasKV:o=!1,hasAdmin:e=!1}={}){let t="\u7CFB\u7EDF\u521D\u59CB\u5316\u914D\u7F6E\u672A\u5B8C\u6210",n="\u51FA\u4E8E\u5B89\u5168\u9632\u62A4\u4E0E\u6570\u636E\u6301\u4E45\u5316\u8981\u6C42\uFF0C\u5F53\u524D\u670D\u52A1\u5DF2\u963B\u6B62\u76F4\u63A5\u8FDB\u5165\u63A7\u5236\u53F0",a="\u26A1",s="";!o&&!e?(t="\u672A\u7ED1\u5B9A KV \u4E14\u672A\u914D\u7F6E\u5BC6\u7801",a="\u26A0\uFE0F",s="\u7CFB\u7EDF\u68C0\u6D4B\u5230\u65E2\u672A\u7ED1\u5B9A <code>KV</code> \u5B58\u50A8\u6570\u636E\u5E93\uFF0C\u4E5F\u672A\u8BBE\u7F6E <code>ADMIN</code> \u7BA1\u7406\u5458\u5BC6\u7801\u3002\u7CFB\u7EDF\u65E0\u6CD5\u6301\u4E45\u5316\u8282\u70B9\u914D\u7F6E\uFF0C\u4E14\u672A\u6388\u6743\u76F4\u63A5\u8BBF\u95EE\u5B58\u5728\u5B89\u5168\u9690\u60A3\u3002"):o?(t="\u672A\u914D\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801",a="\u{1F510}",s="\u7CFB\u7EDF\u672A\u68C0\u6D4B\u5230 <code>ADMIN</code> \u73AF\u5883\u53D8\u91CF\u3002\u4E3A\u907F\u514D\u672A\u6388\u6743\u8BBF\u95EE\u53CA\u8282\u70B9\u914D\u7F6E\u6CC4\u9732\uFF0C\u5FC5\u987B\u5148\u5728 Cloudflare \u540E\u53F0\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801\u3002"):(t="\u672A\u7ED1\u5B9A KV \u547D\u540D\u7A7A\u95F4",a="\u{1F5C4}\uFE0F",s="\u7CFB\u7EDF\u68C0\u6D4B\u5230\u5C1A\u672A\u7ED1\u5B9A <code>KV</code> \u547D\u540D\u7A7A\u95F4\u3002\u6240\u6709\u8282\u70B9\u6570\u636E\u3001\u4F18\u9009\u6E90\u53CA\u52A0\u5BC6\u5BC6\u94A5\u5747\u4F9D\u8D56 Cloudflare KV \u8FDB\u884C\u6301\u4E45\u5316\u52A0\u5BC6\u5B58\u50A8\uFF0C\u672A\u7ED1\u5B9A KV \u7CFB\u7EDF\u65E0\u6CD5\u6B63\u5E38\u8FD0\u884C\u3002");let i=[];return!o&&!e?(i.push("\u5728 Cloudflare \u63A7\u5236\u53F0\u5DE6\u4FA7\u5BFC\u822A\u680F\u70B9\u51FB <strong>\u201C\u5B58\u50A8\u4E0E\u6570\u636E\u5E93\u201D</strong> -> <strong>\u201CKV\u201D</strong> -> \u70B9\u51FB <strong>\u201C\u521B\u5EFA\u547D\u540D\u7A7A\u95F4\u201D</strong>\uFF08\u540D\u79F0\u586B\u5199 <code>KV</code>\uFF09\u3002"),i.push("\u8FDB\u5165 <strong>Workers \u548C Pages</strong> -> \u9009\u62E9\u5F53\u524D Worker -> \u70B9\u51FB <strong>\u8BBE\u7F6E (Settings)</strong> -> <strong>\u53D8\u91CF\u4E0E\u673A\u5BC6 (Variables and Secrets)</strong>\u3002"),i.push("\u5728 <strong>KV \u547D\u540D\u7A7A\u95F4\u7ED1\u5B9A</strong> \u533A\u57DF\u70B9\u51FB <strong>\u6DFB\u52A0\u7ED1\u5B9A</strong>\uFF1A\u53D8\u91CF\u540D\u79F0\u5FC5\u987B\u4E25\u683C\u586B\u5199\u4E3A <code>KV</code>\uFF0C\u9009\u62E9\u521A\u521B\u5EFA\u7684 KV \u547D\u540D\u7A7A\u95F4\u3002"),i.push("\u5728\u4E0B\u65B9 <strong>\u73AF\u5883\u53D8\u91CF</strong> \u533A\u57DF\u70B9\u51FB <strong>\u6DFB\u52A0</strong>\uFF1A\u53D8\u91CF\u540D\u79F0\u586B\u5199 <code>ADMIN</code>\uFF0C\u53D8\u91CF\u503C\u586B\u5199\u60A8\u7684\u7BA1\u7406\u5BC6\u7801\u3002"),i.push("\u70B9\u51FB <strong>\u4FDD\u5B58\u5E76\u90E8\u7F72</strong>\uFF0C\u5B8C\u6210\u540E\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u5237\u65B0\u9875\u9762\u3002")):o?(i.push("\u767B\u5F55 <strong>Cloudflare \u63A7\u5236\u53F0</strong> \u5E76\u8FDB\u5165 <strong>Workers \u548C Pages</strong>\uFF0C\u70B9\u51FB\u8FDB\u5165\u5F53\u524D Worker\u3002"),i.push("\u5207\u6362\u81F3 <strong>\u8BBE\u7F6E (Settings)</strong> \u9009\u9879\u5361 -> \u9009\u62E9 <strong>\u53D8\u91CF\u4E0E\u673A\u5BC6 (Variables and Secrets)</strong>\u3002"),i.push("\u5728 <strong>\u73AF\u5883\u53D8\u91CF</strong> \u533A\u57DF\u70B9\u51FB <strong>\u6DFB\u52A0</strong>\uFF1A\u53D8\u91CF\u540D\u79F0\u586B\u5199 <code>ADMIN</code>\uFF0C\u53D8\u91CF\u503C\u586B\u5199\u60A8\u7684\u7BA1\u7406\u5BC6\u7801\u3002"),i.push("\u70B9\u51FB <strong>\u4FDD\u5B58\u5E76\u90E8\u7F72</strong>\uFF0C\u5B8C\u6210\u540E\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u5237\u65B0\u9875\u9762\u3002")):(i.push("\u5728 Cloudflare \u63A7\u5236\u53F0\u5DE6\u4FA7\u5BFC\u822A\u680F\u70B9\u51FB <strong>\u201C\u5B58\u50A8\u4E0E\u6570\u636E\u5E93\u201D</strong> -> <strong>\u201CKV\u201D</strong> -> \u70B9\u51FB <strong>\u201C\u521B\u5EFA\u547D\u540D\u7A7A\u95F4\u201D</strong>\uFF08\u540D\u79F0\u586B\u5199 <code>KV</code>\uFF09\u3002"),i.push("\u8FDB\u5165 <strong>Workers \u548C Pages</strong> -> \u9009\u62E9\u5F53\u524D Worker -> \u70B9\u51FB <strong>\u8BBE\u7F6E (Settings)</strong> -> <strong>\u53D8\u91CF\u4E0E\u673A\u5BC6 (Variables and Secrets)</strong>\u3002"),i.push("\u5728 <strong>KV \u547D\u540D\u7A7A\u95F4\u7ED1\u5B9A</strong> \u533A\u57DF\u70B9\u51FB <strong>\u6DFB\u52A0\u7ED1\u5B9A</strong>\uFF1A\u53D8\u91CF\u540D\u79F0\u5FC5\u987B\u4E25\u683C\u586B\u5199\u4E3A <code>KV</code>\uFF0C\u9009\u62E9\u521A\u521B\u5EFA\u7684 KV \u547D\u540D\u7A7A\u95F4\u3002"),i.push("\u70B9\u51FB <strong>\u4FDD\u5B58\u5E76\u90E8\u7F72</strong>\uFF0C\u5B8C\u6210\u540E\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u5237\u65B0\u9875\u9762\u3002")),`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="cloudflare-insights-beacon" content="false">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\u26A1</text></svg>">
  <title>${t} - \u8282\u70B9\u7BA1\u7406\u7CFB\u7EDF</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      color: #1e293b;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 32px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 20px 48px rgba(0, 0, 0, 0.05);
    }
    .card-icon {
      font-size: 42px;
      text-align: center;
      margin-bottom: 12px;
      line-height: 1;
    }
    .card h2 {
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
      color: #0f172a;
    }
    .card p.subtitle {
      font-size: 14px;
      color: #64748b;
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .status-box {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .status-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 10px;
      border-radius: 10px;
      text-align: center;
    }
    .status-item.status-ok {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }
    .status-item.status-err {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }
    .status-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 700;
    }
    .status-ok .status-badge {
      background: #dcfce7;
      color: #15803d;
    }
    .status-err .status-badge {
      background: #fee2e2;
      color: #dc2626;
    }
    .status-name {
      color: #334155;
      font-size: 12px;
      font-weight: 600;
    }
    .warning-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .warning-icon {
      font-size: 20px;
      line-height: 1.3;
      flex-shrink: 0;
    }
    .warning-text {
      font-size: 13px;
      color: #92400e;
      line-height: 1.6;
    }
    .steps-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .steps-title {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .steps-list {
      list-style: none;
      counter-reset: step-counter;
    }
    .steps-list li {
      counter-increment: step-counter;
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 10px;
      position: relative;
      padding-left: 26px;
    }
    .steps-list li:last-child {
      margin-bottom: 0;
    }
    .steps-list li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 1px;
      width: 18px;
      height: 18px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    code {
      background: #e2e8f0;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      font-weight: 600;
    }
    .btn {
      width: 100%;
      padding: 12px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn:hover {
      background: #0369a1;
    }
    .btn:active {
      transform: scale(0.99);
    }
    .footer-note {
      margin-top: 18px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-icon">${a}</div>
    <h2>${t}</h2>
    <p class="subtitle">${n}</p>

    <div class="status-box">
      <div class="status-item ${o?"status-ok":"status-err"}">
        <span class="status-badge">${o?"\u2713 \u5DF2\u7ED1\u5B9A":"\u2715 \u672A\u7ED1\u5B9A"}</span>
        <span class="status-name">KV \u547D\u540D\u7A7A\u95F4 (KV)</span>
      </div>
      <div class="status-item ${e?"status-ok":"status-err"}">
        <span class="status-badge">${e?"\u2713 \u5DF2\u914D\u7F6E":"\u2715 \u672A\u914D\u7F6E"}</span>
        <span class="status-name">\u7BA1\u7406\u5458\u5BC6\u7801 (ADMIN)</span>
      </div>
    </div>

    <div class="warning-box">
      <div class="warning-icon">\u26A0\uFE0F</div>
      <div class="warning-text">${s}</div>
    </div>

    <div class="steps-container">
      <div class="steps-title">\u{1F4CB} \u914D\u7F6E\u6B65\u9AA4\u6307\u5F15\uFF1A</div>
      <ol class="steps-list">
        ${i.map(l=>`<li>${l}</li>`).join("")}
      </ol>
    </div>

    <button type="button" class="btn" onclick="window.location.reload()">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      \u5DF2\u5B8C\u6210\u914D\u7F6E\uFF0C\u5237\u65B0\u9875\u9762
    </button>

    <div class="footer-note">
      \u914D\u7F6E\u5B8C\u6210\u5E76\u4FDD\u5B58\u540E\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u5237\u65B0\u5373\u53EF\u8FDB\u5165\u767B\u5F55\u9875\u9762
    </div>
  </div>
</body>
</html>`}var Se=`
:root {
  --bg-body: #f1f5f9;
  --bg-main: #f8fafc;
  --bg-sidebar: #ffffff;
  --bg-topbar: #ffffff;
  --bg-card: #ffffff;
  --bg-input: #f8fafc;
  --bg-drawer: #ffffff;
  --bg-dialog: #ffffff;
  --border-color: #e2e8f0;
  --border-input: #cbd5e1;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --text-title: #0f172a;
  --text-label: #334155;
  --code-color: #0284c7;
  --hover-bg: #f1f5f9;
  --shadow-card: rgba(0, 0, 0, 0.06);
  --shadow-modal: rgba(0, 0, 0, 0.15);
  --toast-bg: #ffffff;
  --toast-text: #0f172a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-body);
  color: var(--text-main);
  height: 100vh;
  overflow: hidden;
  display: flex;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* \u5DE6\u4FA7\u4FA7\u8FB9\u680F\u5BFC\u822A */
.sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 100;
}
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.sidebar-backdrop.active {
  display: block;
  opacity: 1;
  visibility: visible;
}
.sidebar-close-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}
.mobile-menu-btn {
  display: none;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
.mobile-menu-btn span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text-title);
  border-radius: 2px;
}
.sidebar-header {
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}
.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #0284c7;
}
.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-item:hover {
  background: var(--hover-bg);
  color: var(--text-title);
}
.nav-item.active {
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}
.nav-icon {
  font-size: 17px;
}
.nav-section-title {
  padding: 8px 12px 2px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}
.nav-section-divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 4px;
}
.nav-badge-pill {
  font-size: 10px;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}
.nav-badge-tag {
  font-size: 10px;
  background: var(--card-bg, #f1f5f9);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  line-height: 1;
}
.badge-global-tip {
  font-size: 11px;
  background: rgba(2, 132, 199, 0.1);
  border: 1px solid rgba(2, 132, 199, 0.25);
  color: #0284c7;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: var(--hover-bg);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: var(--border-color);
  color: var(--text-title);
}

/* \u53F3\u4FA7\u4E3B\u5DE5\u4F5C\u533A */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-main);
  transition: background-color 0.25s ease;
}
.topbar {
  height: 64px;
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-topbar);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.topbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-title);
}
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}
.badge-session {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  border: 1px solid rgba(2, 132, 199, 0.25);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  cursor: default;
  transition: all 0.2s;
}
.badge-session:hover {
  background: rgba(2, 132, 199, 0.18);
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #10b989;
  border-radius: 50%;
  box-shadow: 0 0 6px #10b989;
}



.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.tab-content {
  display: none;
  width: 100%;
  max-width: 100%;
}
.tab-content.active {
  display: block;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* \u5361\u7247\u89C4\u8303 */
.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px var(--shadow-card);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.ip-management-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.ip-management-grid .section-card {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}
.ip-management-grid .section-card .form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ip-management-grid .section-card .form-textarea {
  flex: 1;
}
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}
.config-grid .section-card {
  margin-bottom: 0;
}
@media (max-width: 860px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
}
.section-header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.section-footer-actions {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}
.section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.5;
}
code {
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  background: var(--hover-bg);
  color: var(--code-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-color);
}

/* \u8868\u5355\u4E0E\u8F93\u5165\u6846 */
.form-label {
  font-size: 13px;
  color: var(--text-label);
  margin-bottom: 8px;
  display: block;
  font-weight: 500;
}
.form-textarea {
  width: 100%;
  min-height: 120px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--code-color);
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  outline: none;
  resize: vertical;
  line-height: 1.6;
  margin-bottom: 12px;
  transition: background-color 0.25s ease, border-color 0.2s;
}
.form-textarea:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
}
.copy-box {
  display: flex;
  gap: 10px;
}
.copy-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--code-color);
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  outline: none;
  transition: background-color 0.25s ease, border-color 0.2s;
}
.copy-input:focus { border-color: #0284c7; }

/* \u6309\u94AE\u89C4\u8303 */
.btn-action {
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  height: 38px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-action:hover { background: #0369a1; }
.btn-success { background: #059669; }
.btn-success:hover { background: #047857; }
.btn-danger {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}
.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}
.btn-secondary { background: var(--hover-bg); color: var(--text-main); border: 1px solid var(--border-color); }
.btn-secondary:hover { background: var(--border-color); }
.btn-purple { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.btn-purple:hover { background: #ede9fe; color: #6d28d9; border-color: #c4b5fd; }

/* \u6570\u636E\u8868\u683C\u89C4\u8303 */
.table-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}
.table-container::-webkit-scrollbar {
  height: 6px;
}
.table-container::-webkit-scrollbar-track {
  background: var(--bg-input);
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb {
  background: var(--border-input);
  border-radius: 4px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}
.data-table th {
  background: var(--bg-input);
  color: var(--text-muted);
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  vertical-align: middle;
}
.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  white-space: nowrap;
  min-width: max-content;
}
.node-count-badge {
  background: var(--hover-bg);
  color: var(--code-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid var(--border-color);
  display: inline-block;
  white-space: nowrap;
}
.badge-limit {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}
.badge-unlimited {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}
.badge-success {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}
.badge-danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}
.badge-warning {
  background: #fffbeb;
  color: #d97706;
  border-color: #fde68a;
}

/* \u6279\u91CF\u64CD\u4F5C\u5DE5\u5177\u680F */
.batch-toolbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 14px;
  animation: fadeIn 0.2s ease;
}
.batch-toolbar.active {
  display: flex;
}
.batch-toolbar-info {
  font-size: 13px;
  font-weight: 600;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.batch-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox-cell {
  width: 42px;
  text-align: center;
  padding: 12px 8px !important;
}
.table-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #0284c7;
  vertical-align: middle;
}

/* \u65E5\u5FD7\u591A\u6761\u4EF6\u7B5B\u9009\u5DE5\u5177\u680F */
.logs-filter-toolbar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.logs-filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.filter-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 220px;
  flex: 1;
  max-width: 320px;
}
.filter-icon {
  position: absolute;
  left: 10px;
  font-size: 13px;
  color: var(--text-muted);
  pointer-events: none;
}
.filter-input {
  width: 100%;
  height: 34px;
  padding: 0 28px 0 30px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-title);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.filter-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
  background: var(--bg-card);
}
.filter-clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}
.filter-clear-btn:hover {
  color: var(--text-title);
}
.filter-select {
  height: 34px;
  padding: 0 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-title);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.filter-select:focus {
  border-color: #0284c7;
}
.filter-reset-btn {
  height: 34px;
  font-size: 12px;
  padding: 0 12px;
}
.logs-filter-summary {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
@media (max-width: 768px) {
  .logs-filter-group {
    width: 100%;
  }
  .filter-input-wrap {
    max-width: 100%;
    min-width: 100%;
  }
  .filter-select {
    flex: 1;
    min-width: 130px;
  }
  .logs-filter-summary {
    width: 100%;
    text-align: right;
  }
}

/* \u7EDF\u4E00\u5206\u9875\u63A7\u5236\u5668\u6837\u5F0F */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-input);
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-muted);
  gap: 12px;
  flex-wrap: wrap;
}
.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pagination-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 34px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.pagination-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #0284c7;
  color: #0284c7;
}
.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}
.pagination-btn.active {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35);
}
.pagination-select {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  height: 32px;
  outline: none;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s;
}
.pagination-select:focus {
  border-color: #0284c7;
}

/* \u62BD\u5C49\u5F0F\u4FA7\u62C9\u5F39\u7A97\u6837\u5F0F (\u4ECE\u53F3\u8FB9\u63A8\u62C9\u6ED1\u51FA) */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  display: flex;
  justify-content: flex-end;
}
.drawer-overlay.active {
  opacity: 1;
  visibility: visible;
}
.drawer-content {
  background: var(--bg-drawer);
  border-left: 1px solid var(--border-color);
  width: 50%;
  min-width: 480px;
  max-width: 90vw;
  height: 100vh;
  box-shadow: -10px 0 30px var(--shadow-modal);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .drawer-content {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }
}
.drawer-overlay.active .drawer-content {
  transform: translateX(0);
}
.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-title);
}
.drawer-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}
.drawer-close:hover { color: var(--text-title); }
.drawer-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--bg-sidebar);
}
.form-field {
  margin-bottom: 20px;
}
.form-field label {
  display: block;
  font-size: 13px;
  color: var(--text-label);
  margin-bottom: 8px;
  font-weight: 500;
}
.form-field input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background-color 0.25s ease;
}
.form-field input:focus { border-color: #0284c7; }

/* \u5168\u5C40\u81EA\u5B9A\u4E49 Toast \u6D88\u606F\u63D0\u793A */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  min-width: 280px;
  max-width: 420px;
  background: var(--toast-bg);
  border: 1px solid var(--border-color);
  color: var(--toast-text);
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.3s ease;
}
.toast-item.toast-success {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}
.toast-item.toast-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}
.toast-item.toast-info {
  background: #f0f9ff;
  color: #075985;
  border-color: #bae6fd;
}
@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes fadeOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
}

/* \u5168\u5C40\u81EA\u5B9A\u4E49\u786E\u8BA4/\u5220\u9664/\u8B66\u544A\u5BF9\u8BDD\u6846 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
.dialog-overlay.active {
  opacity: 1;
  visibility: visible;
}
.dialog-box {
  background: var(--bg-dialog);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  width: 100%;
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 20px 40px var(--shadow-modal);
  transform: scale(0.92);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
}
.dialog-overlay.active .dialog-box {
  transform: scale(1);
}
.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.dialog-icon {
  font-size: 24px;
  line-height: 1;
}
.dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-title);
}
.dialog-message {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 22px;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.dialog-box-large {
  max-width: 680px;
}
.test-result-box {
  width: 100%;
  min-height: 220px;
  max-height: 380px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--code-color);
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
}

/* ========================================================= */
/* \u{1F4F1} \u54CD\u5E94\u5F0F\u65AD\u70B9\u9002\u914D\uFF1A\u5E73\u677F & \u624B\u673A\u7AEF\u4F18\u5316 (Pad & Mobile)      */
/* ========================================================= */
@media (max-width: 1080px) {
  .ip-management-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 900px) {
  body {
    position: relative;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 260px;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
    transform: translateX(-100%);
  }
  .sidebar.active {
    transform: translateX(0);
  }
  .sidebar-close-btn {
    display: block;
  }
  .mobile-menu-btn {
    display: inline-flex;
  }
  .topbar {
    padding: 0 14px;
  }
  .topbar-title {
    font-size: 15px;
  }
  .content-area {
    padding: 14px;
  }
  .section-card {
    padding: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  input[type="text"],
  input[type="password"],
  input[type="number"],
  textarea,
  select {
    font-size: 16px !important;
  }
}

@media (max-width: 640px) {
  .topbar {
    height: 56px;
  }
  .badge-status span:last-child {
    display: none;
  }
  .badge-status {
    padding: 4px 6px;
  }
  .copy-box {
    flex-direction: column;
    gap: 8px;
  }
  .copy-box .btn-action {
    width: 100%;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .section-header .btn-action {
    width: 100%;
  }
  .section-header-actions,
  .section-footer-actions {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
  .section-header-actions .btn-action,
  .section-footer-actions .btn-action {
    width: 100%;
  }

  /* \u{1F4F1} \u79FB\u52A8\u7AEF\u8868\u683C\u6DF1\u5EA6\u8F6C\u6362\u4E3A\u539F\u751F App \u5361\u7247\u6D41\u89C6\u56FE (Card View) */
  .table-container {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
  }
  .data-table {
    display: block !important;
    width: 100% !important;
  }
  .data-table thead {
    display: none !important; /* \u624B\u673A\u7AEF\u9690\u85CF\u8868\u683C\u8868\u5934 */
  }
  .data-table tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }
  
  /* \u7A7A\u6570\u636E\u5361\u7247\u72B6\u6001 */
  .data-table tbody tr:has(td[colspan]) {
    display: block !important;
    background: var(--bg-card);
    border: 1px dashed var(--border-color);
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
  }
  .data-table tbody tr td[colspan] {
    display: block !important;
    padding: 0 !important;
    border: none !important;
    text-align: center !important;
  }

  /* \u{1F4E6} \u666E\u901A\u8BA2\u9605 & \u26A1 CF\u4F18\u9009\u8BA2\u9605 \u624B\u673A\u7AEF\u5361\u7247\u89C4\u8303 */
  .data-table tbody tr.plain-table-row,
  .data-table tbody tr.cf-table-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 14px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
    position: relative !important;
  }
  .data-table tbody tr.plain-table-row td,
  .data-table tbody tr.cf-table-row td {
    display: flex !important;
    width: 100% !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
  }
  /* \u5361\u7247\u7B2C1\u884C\uFF1A\u590D\u9009\u6846 (\u7B2C1\u5217) \u4E0E \u8BA2\u9605\u540D\u79F0 (\u7B2C4\u5217) \u6C34\u5E73\u5BF9\u9F50 */
  .data-table tbody tr.plain-table-row td:nth-child(1),
  .data-table tbody tr.cf-table-row td:nth-child(1) {
    order: 1 !important;
    width: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    margin-right: 8px !important;
  }
  .data-table tbody tr.plain-table-row td:nth-child(4),
  .data-table tbody tr.cf-table-row td:nth-child(4) {
    order: 1 !important;
    flex: 1 !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    color: var(--text-title) !important;
    display: flex !important;
    align-items: center !important;
  }
  /* \u5361\u7247\u7B2C2\u884C\uFF1A\u8BBF\u95EE\u9650\u5236\u5FBD\u7AE0 (\u7B2C3\u5217) */
  .data-table tbody tr.plain-table-row td:nth-child(3),
  .data-table tbody tr.cf-table-row td:nth-child(3) {
    order: 2 !important;
  }
  /* \u5361\u7247\u7B2C3\u884C\uFF1A\u76F4\u8FDE\u8BA2\u9605\u94FE\u63A5\u8F93\u5165\u6846\u4E0E\u590D\u5236 (\u7B2C2\u5217) */
  .data-table tbody tr.plain-table-row td:nth-child(2),
  .data-table tbody tr.cf-table-row td:nth-child(2) {
    order: 3 !important;
    width: 100% !important;
  }
  .data-table .copy-box {
    display: flex !important;
    flex-direction: row !important;
    gap: 6px !important;
    width: 100% !important;
  }
  .data-table .copy-box .copy-input {
    flex: 1 !important;
    font-size: 12px !important;
    padding: 6px 10px !important;
    height: 34px !important;
    background: var(--bg-input) !important;
  }
  .data-table .copy-box .btn-action {
    width: auto !important;
    height: 34px !important;
    font-size: 12px !important;
    padding: 0 12px !important;
    flex-shrink: 0 !important;
  }
  /* \u5361\u7247\u7B2C4\u884C\uFF1A\u64CD\u4F5C\u680F (\u7B2C5\u5217) */
  .data-table tbody tr.plain-table-row td:nth-child(5),
  .data-table tbody tr.cf-table-row td:nth-child(5) {
    order: 4 !important;
    width: 100% !important;
    border-top: 1px solid var(--border-color) !important;
    padding-top: 10px !important;
    margin-top: 2px !important;
  }
  .data-table tbody tr.plain-table-row .table-actions,
  .data-table tbody tr.cf-table-row .table-actions {
    width: 100% !important;
    display: flex !important;
    gap: 8px !important;
    justify-content: flex-end !important;
  }
  .data-table tbody tr.plain-table-row .table-actions .btn-action,
  .data-table tbody tr.cf-table-row .table-actions .btn-action {
    flex: 1 !important;
    height: 34px !important;
    font-size: 12px !important;
    padding: 0 10px !important;
    justify-content: center !important;
  }

  /* \u{1F4CA} \u8BBF\u95EE\u65E5\u5FD7 \u624B\u673A\u7AEF\u5361\u7247\u89C4\u8303 */
  .data-table tbody tr.logs-table-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 14px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  }
  .data-table tbody tr.logs-table-row td {
    display: flex !important;
    width: 100% !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
  }
  /* \u7B2C\u4E00\u884C\uFF1A\u52FE\u9009\u6846(\u7B2C1\u5217)\u3001\u65F6\u95F4(\u7B2C2\u5217)\u4E0E\u72B6\u6001(\u7B2C4\u5217) */
  .data-table tbody tr.logs-table-row td:nth-child(1) {
    order: 1 !important;
    width: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    margin-right: 6px !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(2) {
    order: 1 !important;
    flex: 1 !important;
    font-size: 12px !important;
    color: var(--text-muted) !important;
    align-items: center !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(4) {
    order: 1 !important;
    width: auto !important;
    display: flex !important;
    align-items: center !important;
  }
  /* \u7B2C\u4E8C\u884C\uFF1AIP \u4E0E \u5730\u7406\u4F4D\u7F6E (\u7B2C3\u5217) */
  .data-table tbody tr.logs-table-row td:nth-child(3) {
    order: 2 !important;
  }
  /* \u7B2C\u4E09\u884C\uFF1A\u8BF7\u6C42\u8DEF\u5F84\u4E0E\u7C7B\u578B (\u7B2C5\u5217) */
  .data-table tbody tr.logs-table-row td:nth-child(5) {
    order: 3 !important;
    background: var(--bg-input) !important;
    padding: 8px 10px !important;
    border-radius: 6px !important;
  }
  /* \u7B2C\u56DB\u884C\uFF1AUser-Agent (\u7B2C6\u5217) */
  .data-table tbody tr.logs-table-row td:nth-child(6) {
    order: 4 !important;
    font-size: 11px !important;
    color: var(--text-muted) !important;
    word-break: break-all !important;
    white-space: normal !important;
  }
  /* \u7B2C\u4E94\u884C\uFF1A\u5FEB\u6377\u64CD\u4F5C\u6309\u94AE\u7EC4 (\u7B2C7\u5217) */
  .data-table tbody tr.logs-table-row td:nth-child(7) {
    order: 5 !important;
    width: 100% !important;
    border-top: 1px solid var(--border-color) !important;
    padding-top: 10px !important;
    margin-top: 2px !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(7) > div {
    width: 100% !important;
    display: flex !important;
    gap: 8px !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(7) .btn-action {
    flex: 1 !important;
    height: 34px !important;
    font-size: 12px !important;
    justify-content: center !important;
  }

  /* \u{1F4F1} \u79FB\u52A8\u7AEF\u5206\u9875\u5668\u7D27\u51D1\u81EA\u9002\u5E94\u6392\u7248 */
  .table-pagination {
    padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    margin-top: 12px;
  }
  .pagination-info {
    width: 100%;
    justify-content: space-between;
    font-size: 12px;
  }
  .pagination-select {
    font-size: 12px;
    padding: 4px 8px;
    height: 32px;
  }
  .pagination-controls {
    width: 100%;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .pagination-btn {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
    padding: 0 8px;
  }

  .drawer-header {
    padding: 16px 18px;
  }
  .drawer-body {
    padding: 16px 18px;
  }
  .drawer-footer {
    padding: 14px 18px;
    flex-wrap: wrap;
  }
  .drawer-footer .btn-action {
    flex: 1;
    min-width: 100px;
  }
  .toast-container {
    left: 16px;
    right: 16px;
    top: 16px;
  }
  .toast-item {
    min-width: unset;
    max-width: 100%;
  }
  .dialog-box {
    padding: 18px;
  }
}
`;var Pe=`
// \u9875\u9762\u5185\u5168\u5C40\u7EC4\u6570\u636E
const allGroupsData = JSON.parse(document.getElementById('data-plain-groups').textContent);
const allCfGroupsData = JSON.parse(document.getElementById('data-cf-groups').textContent);
const allSourcesData = JSON.parse(document.getElementById('data-sources').textContent);
const blockedIPsData = JSON.parse(document.getElementById('data-blocked-ips')?.textContent || '[]');
const whitelistIPsData = JSON.parse(document.getElementById('data-whitelist-ips')?.textContent || '[]');

// \u5168\u5C40\u62E6\u622A\u4E1A\u52A1 API \u8BF7\u6C42\uFF0C\u53EA\u8981\u6709 API \u8BF7\u6C42\u5E76\u6210\u529F\u54CD\u5E94\uFF0C\u81EA\u52A8\u91CD\u7F6E 10 \u5206\u949F\u5012\u8BA1\u65F6
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args);
  if (response.ok && typeof args[0] === 'string' && args[0].startsWith('/api/')) {
    if (typeof resetSessionCountdown === 'function') {
      resetSessionCountdown();
    }
  }
  return response;
};

// ==========================================
// \u5168\u5C40\u7EDF\u4E00 UI \u5C01\u88C5\uFF1AToast \u63D0\u793A\u7CFB\u7EDF
// ==========================================
function showToast(message, type = 'info', duration = 2500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-item toast-' + type;

  const icons = {
    success: '\u2705',
    error: '\u274C',
    info: '\u{1F4A1}'
  };

  toast.innerHTML = '<span>' + (icons[type] || '\u{1F4A1}') + '</span><span>' + message + '</span>';
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================
// \u5168\u5C40\u7EDF\u4E00 UI \u5C01\u88C5\uFF1A\u786E\u8BA4/\u5220\u9664/\u8B66\u544A Dialog \u7CFB\u7EDF
// ==========================================
function showConfirmDialog({
  title = '\u786E\u8BA4\u64CD\u4F5C',
  message = '\u60A8\u786E\u5B9A\u8981\u7EE7\u7EED\u5417\uFF1F',
  icon = '\u26A0\uFE0F',
  confirmText = '\u786E\u8BA4',
  confirmType = 'danger'
}) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('app-dialog');
    const titleEl = document.getElementById('dialog-title');
    const msgEl = document.getElementById('dialog-message');
    const iconEl = document.getElementById('dialog-icon');
    const confirmBtn = document.getElementById('dialog-btn-confirm');
    const cancelBtn = document.getElementById('dialog-btn-cancel');

    titleEl.innerText = title;
    msgEl.innerText = message;
    iconEl.innerText = icon;
    confirmBtn.innerText = confirmText;
    confirmBtn.className = 'btn-action btn-' + confirmType;

    dialog.classList.add('active');

    function onConfirm() {
      cleanup();
      resolve(true);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    function cleanup() {
      dialog.classList.remove('active');
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
    }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
  });
}

function addCountryToInput(inputId, code) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const parts = input.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!parts.includes(code.toUpperCase())) {
    parts.push(code.toUpperCase());
  }
  input.value = parts.join(', ');
}

async function testTelegramNotify() {
  const token = document.getElementById('cfg-tg-token').value.trim();
  const chatId = document.getElementById('cfg-tg-chat-id').value.trim();
  const apiHost = document.getElementById('cfg-tg-api-host').value.trim();

  if (!token || !chatId) {
    showToast('\u8BF7\u5148\u8F93\u5165 Bot Token \u548C Chat ID \u518D\u8FDB\u884C\u6D4B\u8BD5\uFF01', 'error');
    return;
  }

  showToast('\u6B63\u5728\u5411 Telegram \u53D1\u9001\u6D4B\u8BD5\u901A\u77E5...', 'info');

  try {
    const res = await fetch('/api/test-tg-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId, apiHost })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      const chat = result.chat;
      const chatType = chat ? (chat.type || 'unknown') : 'unknown';
      const chatTitle = chat ? (chat.title || chat.username || (chat.first_name ? chat.first_name : '') || ('ID: ' + chatId)) : ('ID: ' + chatId);

      if (chatType === 'private') {
        showToast('\u26A0\uFE0F \u6D4B\u8BD5\u5DF2\u6210\u529F\u53D1\u9001\uFF0C\u4F46\u76EE\u6807\u662F\u3010\u4E2A\u4EBA\u79C1\u804A: ' + chatTitle + '\u3011\u800C\u975E\u7FA4\u7EC4\uFF01\u82E5\u8981\u63A8\u9001\u5230\u7FA4\u7EC4\uFF0C\u8BF7\u5C06 Bot \u62C9\u5165\u7FA4\uFF0C\u7FA4\u7EC4 ID \u5FC5\u987B\u4EE5 -100 \u5F00\u5934\uFF08\u4F8B\u5982 -1001234567890\uFF09\u3002', 'info', 7000);
      } else {
        showToast('\u{1F389} \u6D4B\u8BD5\u901A\u77E5\u5DF2\u6210\u529F\u9001\u8FBE\u7FA4\u7EC4\u3010' + chatTitle + '\u3011(' + chatType + ')\uFF01', 'success', 5000);
      }
    } else {
      showToast('\u53D1\u9001\u5931\u8D25: ' + (result.error || '\u672A\u77E5\u9519\u8BEF'), 'error', 6000);
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error', 5000);
  }
}

async function saveTgConfig() {
  const enabled = document.getElementById('cfg-tg-enabled').checked;
  const token = document.getElementById('cfg-tg-token').value.trim();
  const chatId = document.getElementById('cfg-tg-chat-id').value.trim();
  const apiHost = document.getElementById('cfg-tg-api-host').value.trim();

  if (enabled && (!token || !chatId)) {
    showToast('\u542F\u7528\u901A\u77E5\u65F6\uFF0CBot Token \u4E0E Chat ID \u5747\u4E0D\u53EF\u4E3A\u7A7A\uFF01', 'error');
    return;
  }

  const res = await fetch('/api/tg-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled, token, chatId, apiHost })
  });

  if (res.ok) {
    showToast('Telegram \u8BA2\u9605\u901A\u77E5\u914D\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    const err = await res.text();
    showToast('\u4FDD\u5B58\u5931\u8D25: ' + err, 'error');
  }
}

function randomGroupId() {
  document.getElementById('form-group-id').value = generateRandomString(32);
}

function updateNodeStats() {
  const textarea = document.getElementById('form-group-nodes');
  const val = textarea ? textarea.value : '';
  const charCount = val.length;
  const lines = val ? val.split('\\n').filter(l => l.trim().length > 0).length : 0;
  const statsEl = document.getElementById('node-stats-info');
  if (statsEl) {
    statsEl.innerText = charCount + ' \u4E2A\u5B57\u7B26 | ' + lines + ' \u884C';
  }
}

function openAddGroupModal() {
  document.getElementById('modal-group-title').innerText = '\u6DFB\u52A0\u65B0\u666E\u901A\u8BA2\u9605';
  randomGroupId();
  document.getElementById('form-group-name').value = '';
  document.getElementById('form-group-max-views').value = '';
  const countryEl = document.getElementById('form-group-allowed-countries');
  if (countryEl) countryEl.value = '';
  document.getElementById('form-group-nodes').value = '';
  updateNodeStats();
  document.getElementById('group-modal').classList.add('active');
}

function openEditGroupModal(id) {
  document.getElementById('modal-group-title').innerText = '\u7F16\u8F91\u666E\u901A\u8BA2\u9605';
  document.getElementById('form-group-id').value = id;
  const target = allGroupsData.find(g => g.id === id);
  document.getElementById('form-group-name').value = target ? (target.name || '') : '';
  document.getElementById('form-group-max-views').value = (target && target.maxViews > 0) ? target.maxViews : '';
  const countryEl = document.getElementById('form-group-allowed-countries');
  if (countryEl) countryEl.value = (target && Array.isArray(target.allowedCountries)) ? target.allowedCountries.join(', ') : '';
  document.getElementById('form-group-nodes').value = target ? (target.nodes || '') : '';
  updateNodeStats();
  document.getElementById('group-modal').classList.add('active');
}

function closeGroupModal() {
  document.getElementById('group-modal').classList.remove('active');
}

function generateRandomString(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomValues = new Uint8Array(length);
      crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
      }
      return result;
    }
  } catch {}
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function randomSubPath() {
  document.getElementById('cfg-sub-path').value = generateRandomString(12);
}

function randomToken() {
  document.getElementById('cfg-token').value = generateRandomString(24);
}

function randomizeSecurityConfig() {
  randomSubPath();
  randomToken();
}

async function saveSecurityConfig() {
  const subPath = document.getElementById('cfg-sub-path').value.trim().replace(/^\\/+|\\/+$/g, '');
  const token = document.getElementById('cfg-token').value.trim();
  const rawCountries = document.getElementById('cfg-allowed-countries') ? document.getElementById('cfg-allowed-countries').value.trim() : '';
  const allowedCountries = rawCountries ? rawCountries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean) : [];
  const proxyClientOnly = document.getElementById('cfg-proxy-client-only') ? document.getElementById('cfg-proxy-client-only').checked : true;

  if (!subPath) {
    showToast('\u8BA2\u9605\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A\uFF01', 'error');
    return;
  }

  const res = await fetch('/api/security-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subPath, token, allowedCountries, proxyClientOnly })
  });

  if (res.ok) {
    showToast('\u8BA2\u9605\u5B89\u5168\u914D\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01\u6240\u6709\u8BA2\u9605\u8BBF\u95EE\u7B56\u7565\u5DF2\u66F4\u65B0\u751F\u6548\u3002', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    const err = await res.text();
    showToast('\u4FDD\u5B58\u5931\u8D25: ' + err, 'error');
  }
}

// ==========================================
// \u9009\u9879\u5361\u8DEF\u7531\u4E0E\u72B6\u6001\u4FDD\u6301\u7CFB\u7EDF
// ==========================================
function toggleMobileSidebar(show) {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (show === undefined) {
    show = !sidebar.classList.contains('active');
  }
  if (show) {
    sidebar.classList.add('active');
    backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('active');
    backdrop.classList.remove('active');
  }
}

function switchTab(tabId, pushHash = true) {
  toggleMobileSidebar(false);
  const validTabs = ['custom-sub', 'cf-sub', 'access-logs', 'security-config', 'tg-config'];
  if (!validTabs.includes(tabId)) {
    tabId = 'custom-sub';
  }

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  const navEl = document.getElementById('nav-item-' + tabId);
  if (navEl) navEl.classList.add('active');

  const targetTab = document.getElementById('tab-' + tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  const titles = {
    'custom-sub': '\u{1F4E6} \u666E\u901A\u8BA2\u9605\u7BA1\u7406',
    'cf-sub': '\u26A1 CF \u4F18\u9009\u8BA2\u9605\u7BA1\u7406',
    'access-logs': '\u{1F4CA} \u8BBF\u95EE\u65E5\u5FD7\u4E0E IP \u62E6\u622A\u7BA1\u7406',
    'security-config': '\u{1F511} \u8BA2\u9605\u5B89\u5168\u914D\u7F6E (\u5168\u5C40)',
    'tg-config': '\u2708\uFE0F TG \u8BA2\u9605\u901A\u77E5 (\u5168\u5C40)'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.innerText = titles[tabId] || '\u63A7\u5236\u53F0';
  }

  localStorage.setItem('active_dashboard_tab', tabId);

  if (pushHash && window.location.hash !== '#' + tabId) {
    history.replaceState(null, '', '#' + tabId);
  }
}

function initActiveTab() {
  const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
  const savedTab = localStorage.getItem('active_dashboard_tab') || 'custom-sub';
  const targetTab = (hash === 'custom-sub' || hash === 'cf-sub' || hash === 'access-logs' || hash === 'security-config' || hash === 'tg-config') ? hash : savedTab;
  switchTab(targetTab, true);
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
  if (hash === 'custom-sub' || hash === 'cf-sub' || hash === 'access-logs' || hash === 'security-config' || hash === 'tg-config') {
    switchTab(hash, false);
  }
});

initActiveTab();

async function pasteClipboard(id) {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      document.getElementById(id).value = text.trim();
      updateNodeStats();
      showToast('\u5DF2\u6210\u529F\u7C98\u8D34\u526A\u8D34\u677F\u5185\u5BB9\uFF01', 'success');
    } else {
      showToast('\u526A\u8D34\u677F\u4E3A\u7A7A\uFF01', 'info');
    }
  } catch (err) {
    showToast('\u65E0\u6CD5\u8BFB\u53D6\u526A\u8D34\u677F\uFF0C\u8BF7\u76F4\u63A5\u5728\u8F93\u5165\u6846\u4E2D\u4F7F\u7528\u5FEB\u6377\u952E\u7C98\u8D34\uFF01', 'error');
  }
}

async function clearInput(id) {
  const confirmed = await showConfirmDialog({
    title: '\u6E05\u7A7A\u786E\u8BA4',
    message: '\u786E\u5B9A\u8981\u6E05\u7A7A\u8F93\u5165\u6846\u5185\u7684\u5168\u90E8\u5185\u5BB9\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u786E\u8BA4\u6E05\u7A7A',
    confirmType: 'danger'
  });
  if (confirmed) {
    document.getElementById(id).value = '';
    updateNodeStats();
    showToast('\u5DF2\u6E05\u7A7A\u5185\u5BB9', 'info');
  }
}

async function submitGroupForm(e) {
  e.preventDefault();
  let id = document.getElementById('form-group-id').value.trim().toLowerCase();
  if (!id) {
    id = generateRandomString(32);
    document.getElementById('form-group-id').value = id;
  }
  const name = document.getElementById('form-group-name').value.trim();
  if (!name) {
    showToast('\u8BF7\u8F93\u5165\u8BA2\u9605\u540D\u79F0\uFF01', 'error');
    return;
  }
  if (name.length > 30) {
    showToast('\u8BA2\u9605\u540D\u79F0/\u5907\u6CE8\u4E0D\u80FD\u8D85\u8FC730\u4E2A\u5B57\uFF01', 'error');
    return;
  }

  const maxViewsRaw = document.getElementById('form-group-max-views').value.trim();
  let maxViews = 0;
  if (maxViewsRaw) {
    const val = parseInt(maxViewsRaw, 10);
    if (isNaN(val) || val < 0 || val > 999) {
      showToast('\u6700\u5927\u8BBF\u95EE\u6B21\u6570\u5FC5\u987B\u5728 0 ~ 999 \u4E4B\u95F4\uFF01', 'error');
      return;
    }
    maxViews = val;
  }

  const rawNodes = document.getElementById('form-group-nodes').value.trim();
  if (!rawNodes) {
    showToast('\u8BF7\u81F3\u5C11\u8F93\u5165\u6216\u7C98\u8D34\u4E00\u4E2A\u8282\u70B9\u94FE\u63A5\uFF01', 'error');
    return;
  }
  const nodes = rawNodes.replace(/\\r\\n|\\r/g, '\\n').split('\\n').map(n => n.trim()).filter(n => n.length > 0);
  if (nodes.length === 0) {
    showToast('\u672A\u80FD\u8BC6\u522B\u5230\u6709\u6548\u7684\u8282\u70B9\u5185\u5BB9\uFF0C\u8BF7\u786E\u8BA4\u8282\u70B9\u683C\u5F0F\uFF01', 'error');
    return;
  }

  const rawCountries = document.getElementById('form-group-allowed-countries') ? document.getElementById('form-group-allowed-countries').value.trim() : '';
  const allowedCountries = rawCountries ? rawCountries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean) : [];

  try {
    const res = await fetch('/api/custom-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, maxViews, nodes, allowedCountries })
    });

    if (res.ok) {
      showToast('\u666E\u901A\u8BA2\u9605\u3010' + name + '\u3011\u4FDD\u5B58\u6210\u529F\uFF01', 'success');
      setTimeout(() => location.reload(), 600);
    } else if (res.status === 401) {
      showToast('\u767B\u5F55\u4F1A\u8BDD\u5DF2\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\uFF01', 'error');
      setTimeout(() => location.href = '/login', 1200);
    } else {
      let errMsg = '\u4FDD\u5B58\u5931\u8D25';
      try {
        const data = await res.json();
        errMsg = data.error || data.message || JSON.stringify(data);
      } catch {
        errMsg = await res.text();
      }
      showToast('\u4FDD\u5B58\u5931\u8D25: ' + errMsg, 'error');
    }
  } catch (err) {
    showToast('\u7F51\u7EDC\u8BF7\u6C42\u5F02\u5E38: ' + (err.message || '\u8BF7\u68C0\u67E5\u7F51\u7EDC'), 'error');
  }
}

async function deleteGroup(id) {
  const target = allGroupsData.find(g => g.id === id);
  const name = target ? target.name : id;

  const confirmed = await showConfirmDialog({
    title: '\u5220\u9664\u666E\u901A\u8BA2\u9605',
    message: '\u786E\u5B9A\u8981\u5220\u9664\u666E\u901A\u8BA2\u9605\u3010' + name + '\u3011(ID: ' + id + ') \u5417\uFF1F\u5220\u9664\u540E\u76F8\u5173\u5BA2\u6237\u7AEF\u5C06\u65E0\u6CD5\u7EE7\u7EED\u62C9\u53D6\u8282\u70B9\uFF01',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u786E\u8BA4\u5220\u9664',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  const res = await fetch('/api/custom-groups/' + encodeURIComponent(id), { method: 'DELETE' });
  if (res.ok) {
    showToast('\u666E\u901A\u8BA2\u9605\u5DF2\u6210\u529F\u5220\u9664\uFF01', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    showToast('\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', 'error');
  }
}

// ==========================================
// CF \u4F18\u9009\u8BA2\u9605\u7EC4\u6A21\u6001\u7A97\u53E3\u53CA\u63D0\u4EA4\u7BA1\u7406
// ==========================================
function openAddCfGroupModal() {
  document.getElementById('modal-cf-group-title').innerText = '\u6DFB\u52A0\u65B0 CF \u4F18\u9009\u8BA2\u9605';
  document.getElementById('form-cf-group-id').value = generateRandomString(32);
  document.getElementById('form-cf-group-name').value = '';
  document.getElementById('form-cf-group-max-views').value = '';
  const countryEl = document.getElementById('form-cf-group-allowed-countries');
  if (countryEl) countryEl.value = '';
  document.getElementById('form-cf-group-base').value = '';
  const sourcesTextEl = document.getElementById('global-sources-text');
  if (sourcesTextEl) {
    sourcesTextEl.value = allSourcesData.map(s => (s.name && !s.name.startsWith('\u6E90-') ? (s.name + ',' + s.url) : s.url)).join('\\n');
  }
  document.getElementById('cf-group-modal').classList.add('active');
}

function openEditCfGroupModal(id) {
  document.getElementById('modal-cf-group-title').innerText = '\u7F16\u8F91 CF \u4F18\u9009\u8BA2\u9605';
  document.getElementById('form-cf-group-id').value = id;
  const target = allCfGroupsData.find(g => g.id === id);
  document.getElementById('form-cf-group-name').value = target ? (target.name || '') : '';
  document.getElementById('form-cf-group-max-views').value = (target && target.maxViews > 0) ? target.maxViews : '';
  const countryEl = document.getElementById('form-cf-group-allowed-countries');
  if (countryEl) countryEl.value = (target && Array.isArray(target.allowedCountries)) ? target.allowedCountries.join(', ') : '';
  document.getElementById('form-cf-group-base').value = target ? (target.baseVless || '') : '';
  
  const sourcesTextEl = document.getElementById('global-sources-text');
  if (sourcesTextEl) {
    sourcesTextEl.value = allSourcesData.map(s => (s.name && !s.name.startsWith('\u6E90-') ? (s.name + ',' + s.url) : s.url)).join('\\n');
  }
  document.getElementById('cf-group-modal').classList.add('active');
}

function closeCfGroupModal() {
  document.getElementById('cf-group-modal').classList.remove('active');
}

async function submitCfGroupForm(e) {
  e.preventDefault();
  const id = document.getElementById('form-cf-group-id').value.trim().toLowerCase();
  const name = document.getElementById('form-cf-group-name').value.trim();
  const maxViewsRaw = document.getElementById('form-cf-group-max-views').value.trim();
  let maxViews = 0;
  if (maxViewsRaw) {
    const val = parseInt(maxViewsRaw, 10);
    if (isNaN(val) || val < 0 || val > 999) {
      showToast('\u6700\u5927\u8BBF\u95EE\u6B21\u6570\u5FC5\u987B\u5728 0 ~ 999 \u4E4B\u95F4\uFF01', 'error');
      return;
    }
    maxViews = val;
  }
  const baseVless = document.getElementById('form-cf-group-base').value.trim();

  if (name.length > 30) {
    showToast('\u8BA2\u9605\u540D\u79F0/\u5907\u6CE8\u4E0D\u80FD\u8D85\u8FC730\u4E2A\u5B57\uFF01', 'error');
    return;
  }

  // 1. \u5982\u679C\u5728\u5F39\u7A97\u5185\u7F16\u8F91\u4E86\u4F18\u9009\u6E90\u6587\u672C\u57DF\uFF0C\u4E00\u5E76\u540C\u6B65\u4FDD\u5B58\u4F18\u9009\u6E90
  const sourcesTextEl = document.getElementById('global-sources-text');
  if (sourcesTextEl) {
    const rawText = sourcesTextEl.value.trim();
    const lines = rawText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsedSources = [];
    let counter = 1;

    for (const line of lines) {
      let srcName = '';
      let srcUrl = '';
      let srcId = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        srcName = parts[0].trim();
        srcUrl = parts.slice(1).join(',').trim();
      } else {
        srcUrl = line.trim();
      }

      if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
        const existing = allSourcesData.find(s => s.url === srcUrl);
        if (existing) {
          srcId = existing.id;
          if (!srcName) srcName = existing.name;
        } else {
          srcId = 'src_' + counter + '_' + generateRandomString(6);
          if (!srcName) srcName = '\u4F18\u9009\u6E90 ' + counter;
        }
        parsedSources.push({
          id: srcId.toLowerCase(),
          name: srcName || ('\u4F18\u9009\u6E90 ' + counter),
          url: srcUrl,
          enabled: true
        });
        counter++;
      }
    }

    if (parsedSources.length > 0) {
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: parsedSources })
      });
    }
  }

  // 2. \u4FDD\u5B58 CF \u4F18\u9009\u8BA2\u9605
  const rawCountries = document.getElementById('form-cf-group-allowed-countries') ? document.getElementById('form-cf-group-allowed-countries').value.trim() : '';
  const allowedCountries = rawCountries ? rawCountries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean) : [];

  const res = await fetch('/api/cf-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, maxViews, baseVless, sources: [], allowedCountries })
  });

  if (res.ok) {
    showToast('CF \u4F18\u9009\u8BA2\u9605\u3010' + name + '\u3011\u4FDD\u5B58\u6210\u529F\uFF01', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    const err = await res.text();
    showToast('\u4FDD\u5B58\u5931\u8D25: ' + err, 'error');
  }
}

async function deleteCfGroup(id) {
  const target = allCfGroupsData.find(g => g.id === id);
  const name = target ? target.name : id;

  const confirmed = await showConfirmDialog({
    title: '\u5220\u9664 CF \u4F18\u9009\u8BA2\u9605',
    message: '\u786E\u5B9A\u8981\u5220\u9664 CF \u4F18\u9009\u8BA2\u9605\u3010' + name + '\u3011(ID: ' + id + ') \u5417\uFF1F\u5220\u9664\u540E\u76F8\u5173\u5BA2\u6237\u7AEF\u5C06\u65E0\u6CD5\u83B7\u53D6\u4F18\u9009\u8282\u70B9\uFF01',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u786E\u8BA4\u5220\u9664',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  const res = await fetch('/api/cf-groups/' + encodeURIComponent(id), { method: 'DELETE' });
  if (res.ok) {
    showToast('CF \u4F18\u9009\u8BA2\u9605\u5DF2\u6210\u529F\u5220\u9664\uFF01', 'success');
    setTimeout(() => location.reload(), 600);
  } else {
    showToast('\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', 'error');
  }
}

function copyStringToClipboard(text, successMsg = '\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF01') {
  if (!text) {
    showToast('\u5185\u5BB9\u4E3A\u7A7A\uFF0C\u65E0\u9700\u590D\u5236', 'info');
    return;
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg = '\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF01') {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      showToast(successMsg, 'success');
    } else {
      showToast('\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u957F\u6309\u6587\u672C\u624B\u52A8\u590D\u5236', 'error');
    }
  } catch {
    showToast('\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u957F\u6309\u6587\u672C\u624B\u52A8\u590D\u5236', 'error');
  }
}

function copyText(id) {
  const input = document.getElementById(id);
  if (!input) return;
  const text = input.value !== undefined ? input.value : input.innerText;
  copyStringToClipboard(text);
}

// ==========================================
// \u4F18\u9009\u8282\u70B9\u751F\u6210\u6D4B\u8BD5\u4E0E\u7ED3\u679C\u5C55\u793A\u7CFB\u7EDF
// ==========================================
function showTestResultDialog(title, summary, content) {
  const dialog = document.getElementById('test-result-dialog');
  document.getElementById('test-result-title').innerText = title || '\u4F18\u9009\u8282\u70B9\u751F\u6210\u6D4B\u8BD5\u7ED3\u679C';
  document.getElementById('test-result-summary').innerText = summary || '';
  document.getElementById('test-result-content').innerText = content || '\uFF08\u672A\u751F\u6210\u4EFB\u4F55\u8282\u70B9\uFF09';
  dialog.classList.add('active');
}

function closeTestResultDialog() {
  document.getElementById('test-result-dialog').classList.remove('active');
}

function copyTestResultContent() {
  const content = document.getElementById('test-result-content')?.innerText;
  copyStringToClipboard(content, '\u5DF2\u6210\u529F\u590D\u5236\u5168\u90E8\u751F\u6210\u8282\u70B9\u5230\u526A\u8D34\u677F\uFF01');
}

// 1. \u5728\u5F39\u7A97\u62BD\u5C49\u5185\u6D4B\u8BD5\u5F53\u524D\u7F16\u8F91\u7684\u6A21\u677F\u8282\u70B9\u4E0E\u4F18\u9009\u6E90
async function testModalCfNodes() {
  const baseVless = document.getElementById('form-cf-group-base').value.trim();
  const rawText = document.getElementById('global-sources-text').value.trim();
  const lines = rawText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsedSources = [];
  let counter = 1;

  for (const line of lines) {
    let srcName = '';
    let srcUrl = '';
    if (line.includes(',')) {
      const parts = line.split(',');
      srcName = parts[0].trim();
      srcUrl = parts.slice(1).join(',').trim();
    } else {
      srcUrl = line.trim();
    }
    if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
      parsedSources.push({
        id: 'test_src_' + counter,
        name: srcName || ('\u4F18\u9009\u6E90 ' + counter),
        url: srcUrl,
        enabled: true
      });
      counter++;
    }
  }

  const btn = document.getElementById('btn-test-modal-nodes');
  const originalText = btn.innerText;
  btn.innerText = '\u23F3 \u6D4B\u8BD5\u4E2D...';
  btn.disabled = true;

  try {
    showToast('\u6B63\u5728\u5E76\u53D1\u6293\u53D6\u4F18\u9009\u6E90\u5E76\u751F\u6210\u8282\u70B9...', 'info', 1800);
    const res = await fetch('/api/test-cf-nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseVless, sources: parsedSources })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const nodeCount = data.content ? data.content.split('\\n').filter(l => l.trim().length > 0).length : 0;
      showTestResultDialog(
        '\u{1F9EA} \u4F18\u9009\u8282\u70B9\u6D4B\u8BD5\u7ED3\u679C (\u5B9E\u65F6\u751F\u6210)',
        '\u5171\u6210\u529F\u5B9E\u65F6\u751F\u6210 ' + nodeCount + ' \u4E2A\u4F18\u9009\u8282\u70B9\uFF0C\u8282\u70B9\u5217\u8868\u5982\u4E0B\uFF1A',
        data.content
      );
    } else {
      showToast('\u6D4B\u8BD5\u5931\u8D25: ' + (data.content || '\u8282\u70B9\u683C\u5F0F\u9519\u8BEF\u6216\u4F18\u9009\u6E90\u62C9\u53D6\u5931\u8D25'), 'error', 4000);
    }
  } catch (err) {
    showToast('\u6D4B\u8BD5\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// 2. \u6D4B\u8BD5\u5DF2\u6709 CF \u72EC\u7ACB\u8BA2\u9605\u7EC4
async function testCfGroup(id) {
  const target = allCfGroupsData.find(g => g.id === id);
  const name = target ? target.name : id;
  const baseVless = target ? (target.baseVless || '') : '';

  showToast('\u6B63\u5728\u6D4B\u8BD5\u3010' + name + '\u3011\u4F18\u9009\u8282\u70B9\u751F\u6210...', 'info', 1800);
  try {
    const res = await fetch('/api/test-cf-nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseVless })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const nodeCount = data.content ? data.content.split('\\n').filter(l => l.trim().length > 0).length : 0;
      showTestResultDialog(
        '\u{1F9EA}\u3010' + name + '\u3011\u751F\u6210\u6D4B\u8BD5\u7ED3\u679C',
        '\u5171\u6210\u529F\u5B9E\u65F6\u751F\u6210 ' + nodeCount + ' \u4E2A\u4F18\u9009\u8282\u70B9\uFF0C\u8282\u70B9\u5217\u8868\u5982\u4E0B\uFF1A',
        data.content
      );
    } else {
      showToast('\u6D4B\u8BD5\u5931\u8D25: ' + (data.content || '\u8282\u70B9\u683C\u5F0F\u9519\u8BEF'), 'error', 4000);
    }
  } catch (err) {
    showToast('\u6D4B\u8BD5\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}


// ==========================================
// \u{1F6E1}\uFE0F IP \u9ED1\u767D\u540D\u5355\u4E0E\u8BBF\u95EE\u65E5\u5FD7\u7BA1\u7406
// ==========================================

// \u6279\u91CF\u4FDD\u5B58 IP \u767D\u540D\u5355
async function saveWhitelistIPsBatch() {
  const textarea = document.getElementById('textarea-whitelist-ips');
  if (!textarea) return;
  const lines = textarea.value.replace(/\\r\\n|\\r/g, '\\n').split('\\n').map(l => l.trim()).filter(Boolean);
  const uniqueIPs = Array.from(new Set(lines));

  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: uniqueIPs })
    });
    if (res.ok) {
      showToast('IP \u767D\u540D\u5355\u5DF2\u4FDD\u5B58\u6210\u529F\uFF0C\u5F53\u524D\u5171\u653E\u884C ' + uniqueIPs.length + ' \u4E2A IP', 'success');
      setTimeout(() => location.reload(), 800);
    } else {
      showToast('\u4FDD\u5B58 IP \u767D\u540D\u5355\u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// \u5FEB\u901F\u6DFB\u52A0\u5355\u4E2A IP \u5230\u767D\u540D\u5355
async function addWhitelistIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '\u786E\u8BA4\u52A0\u5165\u767D\u540D\u5355',
    message: '\u786E\u5B9A\u8981\u5C06 IP [' + ip + '] \u52A0\u5165\u767D\u540D\u5355\u5417\uFF1F\u767D\u540D\u5355 IP \u5C06\u6C38\u4E45\u8C41\u514D\u62E6\u622A\u4E0E\u767B\u5F55\u5931\u8D25\u5C01\u7981\u3002',
    icon: '\u2B50',
    confirmText: '\u786E\u8BA4\u52A0\u5165',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  const currentIPs = Array.from(new Set([...whitelistIPsData, ip.trim()]));
  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u5C06 IP: ' + ip + ' \u52A0\u5165\u767D\u540D\u5355', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u52A0\u5165\u767D\u540D\u5355\u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// \u5FEB\u901F\u4ECE\u767D\u540D\u5355\u79FB\u9664\u5355\u4E2A IP
async function removeWhitelistIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '\u786E\u8BA4\u79FB\u9664\u767D\u540D\u5355',
    message: '\u786E\u5B9A\u8981\u4ECE\u767D\u540D\u5355\u4E2D\u79FB\u9664 IP [' + ip + '] \u5417\uFF1F',
    icon: '\u26A0\uFE0F',
    confirmText: '\u786E\u8BA4\u79FB\u9664',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  const currentIPs = whitelistIPsData.filter(item => item !== ip.trim());
  try {
    const res = await fetch('/api/whitelist-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u4ECE\u767D\u540D\u5355\u79FB\u9664 IP: ' + ip, 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u79FB\u9664\u767D\u540D\u5355\u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// \u6279\u91CF\u4FDD\u5B58 IP \u9ED1\u540D\u5355
async function saveBlockedIPsBatch() {
  const textarea = document.getElementById('textarea-blocked-ips');
  if (!textarea) return;
  const lines = textarea.value.replace(/\\r\\n|\\r/g, '\\n').split('\\n').map(l => l.trim()).filter(Boolean);
  const uniqueIPs = Array.from(new Set(lines));

  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: uniqueIPs })
    });
    if (res.ok) {
      showToast('IP \u9ED1\u540D\u5355\u5DF2\u4FDD\u5B58\u6210\u529F\uFF0C\u5F53\u524D\u5DF2\u5C4F\u853D ' + uniqueIPs.length + ' \u4E2A IP', 'success');
      setTimeout(() => location.reload(), 800);
    } else {
      showToast('\u4FDD\u5B58 IP \u9ED1\u540D\u5355\u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// \u5FEB\u901F\u5C4F\u853D\u5355\u4E2A IP
async function blockIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '\u786E\u8BA4\u5C4F\u853D IP',
    message: '\u786E\u5B9A\u8981\u5C06 IP [' + ip + '] \u52A0\u5165\u9ED1\u540D\u5355\u5E76\u963B\u6B62\u5176\u8BBF\u95EE\u4EFB\u4F55\u8BA2\u9605\u548C\u540E\u53F0\u5417\uFF1F',
    icon: '\u{1F6AB}',
    confirmText: '\u786E\u8BA4\u5C4F\u853D',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  const currentIPs = Array.from(new Set([...blockedIPsData, ip.trim()]));
  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u5C4F\u853D IP: ' + ip, 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u5C4F\u853D IP \u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// \u5FEB\u901F\u89E3\u5C01\u5355\u4E2A IP
async function unblockIP(ip) {
  if (!ip) return;
  const confirmed = await showConfirmDialog({
    title: '\u786E\u8BA4\u89E3\u5C01 IP',
    message: '\u786E\u5B9A\u8981\u89E3\u9664\u5BF9 IP [' + ip + '] \u7684\u8BBF\u95EE\u62E6\u622A\u5417\uFF1F',
    icon: '\u{1F7E2}',
    confirmText: '\u786E\u8BA4\u89E3\u5C01',
    confirmType: 'primary'
  });
  if (!confirmed) return;

  const currentIPs = blockedIPsData.filter(item => item !== ip.trim());
  try {
    const res = await fetch('/api/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips: currentIPs })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u89E3\u5C01 IP: ' + ip, 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u89E3\u5C01 IP \u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// ==========================================
// \u{1F5D1}\uFE0F \u8868\u683C\u901A\u7528\u6279\u91CF\u9009\u62E9\u4E0E\u6279\u91CF\u5220\u9664\u7BA1\u7406
// ==========================================
function updateBatchSelection(type) {
  const allCheckboxes = Array.from(document.querySelectorAll('.' + type + '-row-checkbox'));
  const checkedBoxes = allCheckboxes.filter(cb => cb.checked);
  const selectedCount = checkedBoxes.length;
  
  const countEl = document.getElementById(type + '-selected-count');
  if (countEl) countEl.innerText = selectedCount;

  const toolbar = document.getElementById(type + '-batch-toolbar');
  if (toolbar) {
    if (selectedCount > 0) {
      toolbar.classList.add('active');
    } else {
      toolbar.classList.remove('active');
    }
  }

  // \u4EC5\u9488\u5BF9\u5F53\u524D\u9875\u53EF\u89C1\u884C\u5224\u65AD\u8868\u5934\u9009\u4E2D\u72B6\u6001
  const visibleCheckboxes = allCheckboxes.filter(cb => {
    const row = cb.closest('.' + type + '-table-row') || cb.closest('tr');
    return row && row.style.display !== 'none';
  });
  const visibleSelectedCount = visibleCheckboxes.filter(cb => cb.checked).length;

  const checkAll = document.getElementById(type + '-check-all');
  if (checkAll) {
    checkAll.checked = (visibleCheckboxes.length > 0 && visibleSelectedCount === visibleCheckboxes.length);
    checkAll.indeterminate = (visibleSelectedCount > 0 && visibleSelectedCount < visibleCheckboxes.length);
  }
}

function toggleAllCheckboxes(type, checked) {
  const allCheckboxes = Array.from(document.querySelectorAll('.' + type + '-row-checkbox'));
  // \u4EC5\u52FE\u9009/\u53D6\u6D88\u52FE\u9009\u5F53\u524D\u9875\u53EF\u89C1\u884C
  const visibleCheckboxes = allCheckboxes.filter(cb => {
    const row = cb.closest('.' + type + '-table-row') || cb.closest('tr');
    return row && row.style.display !== 'none';
  });
  visibleCheckboxes.forEach(cb => {
    cb.checked = checked;
  });
  updateBatchSelection(type);
}

function clearBatchSelection(type) {
  const checkAll = document.getElementById(type + '-check-all');
  if (checkAll) {
    checkAll.checked = false;
    checkAll.indeterminate = false;
  }
  const checkboxes = document.querySelectorAll('.' + type + '-row-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = false;
  });
  updateBatchSelection(type);
}

// 1. \u666E\u901A\u8BA2\u9605\u6279\u91CF\u5220\u9664
async function batchDeletePlainGroups() {
  const checkedBoxes = Array.from(document.querySelectorAll('.plain-row-checkbox:checked'));
  const idsToDelete = checkedBoxes.map(cb => cb.value);
  if (idsToDelete.length === 0) {
    showToast('\u8BF7\u5148\u52FE\u9009\u9700\u8981\u5220\u9664\u7684\u666E\u901A\u8BA2\u9605\uFF01', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '\u6279\u91CF\u5220\u9664\u666E\u901A\u8BA2\u9605',
    message: '\u786E\u5B9A\u8981\u6279\u91CF\u5220\u9664\u9009\u4E2D\u7684 ' + idsToDelete.length + ' \u4E2A\u666E\u901A\u8BA2\u9605\u5417\uFF1F\u5220\u9664\u540E\u76F8\u5173\u5BA2\u6237\u7AEF\u5C06\u65E0\u6CD5\u7EE7\u7EED\u62C9\u53D6\u8282\u70B9\uFF01',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u786E\u8BA4\u6279\u91CF\u5220\u9664 (' + idsToDelete.length + ')',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await fetch('/api/custom-groups/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idsToDelete })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u6279\u91CF\u5220\u9664 ' + idsToDelete.length + ' \u4E2A\u666E\u901A\u8BA2\u9605\uFF01', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u6279\u91CF\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// 2. CF \u4F18\u9009\u8BA2\u9605\u6279\u91CF\u5220\u9664
async function batchDeleteCfGroups() {
  const checkedBoxes = Array.from(document.querySelectorAll('.cf-row-checkbox:checked'));
  const idsToDelete = checkedBoxes.map(cb => cb.value);
  if (idsToDelete.length === 0) {
    showToast('\u8BF7\u5148\u52FE\u9009\u9700\u8981\u5220\u9664\u7684 CF \u4F18\u9009\u8BA2\u9605\uFF01', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '\u6279\u91CF\u5220\u9664 CF \u4F18\u9009\u8BA2\u9605',
    message: '\u786E\u5B9A\u8981\u6279\u91CF\u5220\u9664\u9009\u4E2D\u7684 ' + idsToDelete.length + ' \u4E2A CF \u4F18\u9009\u8BA2\u9605\u5417\uFF1F\u5220\u9664\u540E\u76F8\u5173\u5BA2\u6237\u7AEF\u5C06\u65E0\u6CD5\u83B7\u53D6\u4F18\u9009\u8282\u70B9\uFF01',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u786E\u8BA4\u6279\u91CF\u5220\u9664 (' + idsToDelete.length + ')',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await fetch('/api/cf-groups/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idsToDelete })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u6279\u91CF\u5220\u9664 ' + idsToDelete.length + ' \u4E2A CF \u4F18\u9009\u8BA2\u9605\uFF01', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u6279\u91CF\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// 3. \u8BBF\u95EE\u65E5\u5FD7\u6279\u91CF\u5220\u9664
async function batchDeleteLogs() {
  const checkedBoxes = Array.from(document.querySelectorAll('.logs-row-checkbox:checked'));
  const indicesToDelete = checkedBoxes.map(cb => parseInt(cb.value, 10)).filter(n => !isNaN(n));
  if (indicesToDelete.length === 0) {
    showToast('\u8BF7\u5148\u52FE\u9009\u9700\u8981\u5220\u9664\u7684\u8BBF\u95EE\u65E5\u5FD7\u8BB0\u5F55\uFF01', 'info');
    return;
  }

  const confirmed = await showConfirmDialog({
    title: '\u6279\u91CF\u5220\u9664\u8BBF\u95EE\u65E5\u5FD7',
    message: '\u786E\u5B9A\u8981\u6279\u91CF\u5220\u9664\u9009\u4E2D\u7684 ' + indicesToDelete.length + ' \u6761\u8BBF\u95EE\u65E5\u5FD7\u8BB0\u5F55\u5417\uFF1F\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D\u3002',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u786E\u8BA4\u6279\u91CF\u5220\u9664 (' + indicesToDelete.length + ')',
    confirmType: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await fetch('/api/logs/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indices: indicesToDelete })
    });
    if (res.ok) {
      showToast('\u5DF2\u6210\u529F\u6279\u91CF\u5220\u9664 ' + indicesToDelete.length + ' \u6761\u8BBF\u95EE\u65E5\u5FD7\uFF01', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u6279\u91CF\u5220\u9664\u65E5\u5FD7\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// \u6E05\u7A7A\u6240\u6709\u8BBF\u95EE\u65E5\u5FD7
async function clearAllLogs() {
  const confirmed = await showConfirmDialog({
    title: '\u6E05\u7A7A\u8BBF\u95EE\u65E5\u5FD7',
    message: '\u786E\u5B9A\u8981\u6E05\u7A7A\u5168\u90E8\u5BA2\u6237\u7AEF\u8BBF\u95EE\u5386\u53F2\u8BB0\u5F55\u5417\uFF1F\u6E05\u7A7A\u540E\u4E0D\u53EF\u6062\u590D\u3002',
    icon: '\u{1F5D1}\uFE0F',
    confirmText: '\u6E05\u7A7A\u65E5\u5FD7',
    confirmType: 'danger'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/clear-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      showToast('\u5DF2\u6E05\u7A7A\u6240\u6709\u8BBF\u95EE\u65E5\u5FD7', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('\u6E05\u7A7A\u65E5\u5FD7\u5931\u8D25', 'error');
    }
  } catch (err) {
    showToast('\u8BF7\u6C42\u5F02\u5E38: ' + err.message, 'error');
  }
}

// ==========================================
// \u{1F4C4} \u901A\u7528\u524D\u7AEF\u96F6\u4F9D\u8D56\u81EA\u9002\u5E94\u8868\u683C\u7FFB\u9875\u7CFB\u7EDF (\u652F\u6301\u52A8\u6001\u6761\u4EF6\u7B5B\u9009)
// ==========================================
class TablePaginator {
  constructor(tableId, rowClass, paginationId, defaultPageSize = 10, type = '') {
    this.tableBody = document.getElementById(tableId);
    this.rowClass = rowClass;
    this.paginationContainer = document.getElementById(paginationId);
    this.pageSize = defaultPageSize;
    this.currentPage = 1;
    this.filterFn = null;
    this.type = type || (rowClass ? rowClass.replace(/-table-row$/, '') : '');
    this.init();
  }

  getAllRows() {
    return Array.from(document.querySelectorAll('.' + this.rowClass));
  }

  getRows() {
    const all = this.getAllRows();
    if (typeof this.filterFn === 'function') {
      return all.filter(this.filterFn);
    }
    return all;
  }

  setFilter(fn) {
    this.filterFn = typeof fn === 'function' ? fn : null;
    this.currentPage = 1;
    this.render();
  }

  init() {
    if (!this.tableBody || !this.paginationContainer) return;
    this.render();
  }

  setPage(page) {
    const rows = this.getRows();
    const totalPages = Math.ceil(rows.length / this.pageSize) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;
    this.render();
  }

  setPageSize(size) {
    this.pageSize = parseInt(size, 10) || 10;
    this.currentPage = 1;
    this.render();
  }

  render() {
    const allRows = this.getAllRows();
    const matchedRows = this.getRows();
    const total = matchedRows.length;
    const emptyFilterRow = document.getElementById(this.rowClass.replace('-row', '-empty-filter-row'));

    if (total <= 0) {
      allRows.forEach(r => r.style.display = 'none');
      this.paginationContainer.style.display = 'none';
      if (emptyFilterRow) {
        if (allRows.length > 0) {
          emptyFilterRow.style.display = '';
        }
      }
      if (this.type && typeof updateBatchSelection === 'function') {
        updateBatchSelection(this.type);
      }
      return;
    }

    if (emptyFilterRow) {
      emptyFilterRow.style.display = 'none';
    }

    // \u9690\u85CF\u4E0D\u6EE1\u8DB3\u7B5B\u9009\u6761\u4EF6\u7684\u884C
    allRows.forEach(row => {
      if (!matchedRows.includes(row)) {
        row.style.display = 'none';
      }
    });

    this.paginationContainer.style.display = 'flex';

    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    // \u5206\u9875\u663E\u793A\u5F53\u524D\u5339\u914D\u884C
    matchedRows.forEach((row, index) => {
      if (index >= start && index < end) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // \u7FFB\u9875\u6216\u7B5B\u9009\u540E\u66F4\u65B0\u5168\u9009\u72B6\u6001
    if (this.type && typeof updateBatchSelection === 'function') {
      updateBatchSelection(this.type);
    }

    const displayStart = start + 1;
    const displayEnd = Math.min(total, end);

    // \u6E32\u67D3\u5206\u9875\u6309\u94AE
    let pageButtonsHtml = '';
    const maxButtons = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      pageButtonsHtml += '<button class="pagination-btn ' + (p === this.currentPage ? 'active' : '') + '" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + p + ')">' + p + '</button>';
    }

    const selectOptions = [5, 10, 20, 50, 100].map(s => {
      return '<option value="' + s + '" ' + (this.pageSize === s ? 'selected' : '') + '>' + s + ' \u6761/\u9875</option>';
    }).join('');

    this.paginationContainer.innerHTML = 
      '<div class="pagination-info">' +
        '<span>\u663E\u793A <strong>' + displayStart + '-' + displayEnd + '</strong> / \u5171 <strong>' + total + '</strong> \u6761</span>' +
        '<select class="pagination-select" onchange="window.changeTablePageSize(\\'' + this.rowClass + '\\', this.value)">' +
          selectOptions +
        '</select>' +
      '</div>' +
      '<div class="pagination-controls">' +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', 1)" ' + (this.currentPage <= 1 ? 'disabled' : '') + ' title="\u9996\u9875">\u23EE\uFE0F</button>' +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + (this.currentPage - 1) + ')" ' + (this.currentPage <= 1 ? 'disabled' : '') + ' title="\u4E0A\u4E00\u9875">\u25C0</button>' +
        pageButtonsHtml +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + (this.currentPage + 1) + ')" ' + (this.currentPage >= totalPages ? 'disabled' : '') + ' title="\u4E0B\u4E00\u9875">\u25B6</button>' +
        '<button class="pagination-btn" onclick="window.changeTablePage(\\'' + this.rowClass + '\\', ' + totalPages + ')" ' + (this.currentPage >= totalPages ? 'disabled' : '') + ' title="\u672B\u9875">\u23ED\uFE0F</button>' +
      '</div>';
  }
}

window._paginators = {};
window.changeTablePage = function(rowClass, page) {
  if (window._paginators[rowClass]) {
    window._paginators[rowClass].setPage(page);
  }
};
window.changeTablePageSize = function(rowClass, size) {
  if (window._paginators[rowClass]) {
    window._paginators[rowClass].setPageSize(size);
  }
};

// ==========================================
// \u{1F50D} \u65E5\u5FD7\u8868\u683C\u591A\u6761\u4EF6\u8FC7\u6EE4\u903B\u8F91
// ==========================================
function applyLogsFilter() {
  const keywordInput = document.getElementById('logs-filter-keyword');
  const clearBtn = document.getElementById('logs-keyword-clear');
  const statusSelect = document.getElementById('logs-filter-status');
  const typeSelect = document.getElementById('logs-filter-type');
  const ipTypeSelect = document.getElementById('logs-filter-ip-type');
  const statsEl = document.getElementById('logs-filter-stats');

  const keyword = (keywordInput ? keywordInput.value.trim().toLowerCase() : '');
  if (clearBtn) {
    clearBtn.style.display = keyword ? 'block' : 'none';
  }

  const status = statusSelect ? statusSelect.value : '';
  const typeVal = typeSelect ? typeSelect.value : '';
  const ipTypeVal = ipTypeSelect ? ipTypeSelect.value : '';

  const paginator = window._paginators ? window._paginators['logs-table-row'] : null;

  const filterFn = function(row) {
    const ip = (row.dataset.ip || '').toLowerCase();
    const location = (row.dataset.location || '').toLowerCase();
    const rowStatus = String(row.dataset.status || '');
    const path = (row.dataset.path || '').toLowerCase();
    const rowType = (row.dataset.type || '').toLowerCase();
    const ua = (row.dataset.ua || '').toLowerCase();
    const isWhite = row.dataset.whitelisted === '1';
    const isBlock = row.dataset.blocked === '1';

    // 1. \u72B6\u6001\u7801\u8FC7\u6EE4
    if (status && rowStatus !== status) {
      return false;
    }

    // 2. IP \u7C7B\u522B\u8FC7\u6EE4
    if (ipTypeVal === 'whitelist' && !isWhite) return false;
    if (ipTypeVal === 'blocked' && !isBlock) return false;
    if (ipTypeVal === 'normal' && (isWhite || isBlock)) return false;

    // 3. \u8BF7\u6C42\u7C7B\u578B\u8FC7\u6EE4
    if (typeVal) {
      if (typeVal === 'sub') {
        if (!rowType.includes('\u8BA2\u9605') && !path.includes('/sub')) return false;
      } else if (typeVal === 'ban') {
        if (!rowType.includes('\u62E6\u622A') && !rowType.includes('\u5C01\u7981') && rowStatus !== '403') return false;
      } else if (typeVal === 'login_fail') {
        if (!rowType.includes('\u5BC6\u7801') && !rowType.includes('\u9A8C\u8BC1\u7801') && !rowType.includes('\u767B\u5F55')) return false;
      } else if (typeVal === 'probe') {
        if (!rowType.includes('\u63A2\u6D4B') && !rowType.includes('\u871C\u7F50') && !rowType.includes('waf')) return false;
      } else if (typeVal === 'not_found') {
        if (!rowType.includes('\u4E0D\u5B58\u5728') && rowStatus !== '404') return false;
      }
    }

    // 4. \u5173\u952E\u8BCD\u6A21\u7CCA\u68C0\u7D22 (\u5339\u914D IP\u3001\u5730\u7406\u4F4D\u7F6E\u3001\u8DEF\u5F84\u3001\u7C7B\u578B\u8BF4\u660E\u3001User-Agent\u3001\u72B6\u6001)
    if (keyword) {
      const matchIp = ip.includes(keyword);
      const matchLoc = location.includes(keyword);
      const matchPath = path.includes(keyword);
      const matchType = rowType.includes(keyword);
      const matchUa = ua.includes(keyword);
      const matchStatus = rowStatus.includes(keyword);
      if (!matchIp && !matchLoc && !matchPath && !matchType && !matchUa && !matchStatus) {
        return false;
      }
    }

    return true;
  };

  if (paginator) {
    paginator.setFilter(filterFn);
    const allCount = paginator.getAllRows().length;
    const matchedCount = paginator.getRows().length;
    if (statsEl) {
      if (keyword || status || typeVal || ipTypeVal) {
        statsEl.innerHTML = '\u5DF2\u7B5B\u9009\u51FA <strong>' + matchedCount + '</strong> / \u5171 <strong>' + allCount + '</strong> \u6761\u8BB0\u5F55';
      } else {
        statsEl.innerHTML = '\u663E\u793A <strong>' + matchedCount + '</strong> / \u5171 <strong>' + allCount + '</strong> \u6761\u8BB0\u5F55';
      }
    }
  }
}

function clearLogsKeyword() {
  const kw = document.getElementById('logs-filter-keyword');
  if (kw) kw.value = '';
  applyLogsFilter();
}

function resetLogsFilter() {
  const kw = document.getElementById('logs-filter-keyword');
  const st = document.getElementById('logs-filter-status');
  const tp = document.getElementById('logs-filter-type');
  const ipt = document.getElementById('logs-filter-ip-type');
  if (kw) kw.value = '';
  if (st) st.value = '';
  if (tp) tp.value = '';
  if (ipt) ipt.value = '';
  applyLogsFilter();
}

// ==========================================
// \u23F1\uFE0F \u4F1A\u8BDD\u6709\u6548\u671F (10\u5206\u949F) \u4E0E\u6D3B\u8DC3\u81EA\u52A8\u7EED\u671F\u673A\u5236
// ==========================================
let sessionRemainingSeconds = 10 * 60; // 10 \u5206\u949F = 600 \u79D2
let sessionCountdownInterval = null;

function updateSessionCountdownDisplay() {
  const textEl = document.getElementById('session-countdown-text');
  const badgeEl = document.getElementById('session-countdown-badge');
  if (!textEl) return;

  if (sessionRemainingSeconds <= 0) {
    textEl.innerText = '\u5DF2\u8D85\u65F6';
    if (badgeEl) {
      badgeEl.style.color = '#dc2626';
      badgeEl.style.background = 'rgba(220, 38, 38, 0.1)';
      badgeEl.style.borderColor = 'rgba(220, 38, 38, 0.25)';
    }
    clearInterval(sessionCountdownInterval);
    showToast('\u767B\u5F55\u4F1A\u8BDD\u5DF2\u8D85\u65F6 (10\u5206\u949F\u65E0\u64CD\u4F5C)\uFF0C\u6B63\u5728\u8FD4\u56DE\u767B\u5F55\u9875...', 'error', 3000);
    setTimeout(() => {
      location.href = '/login';
    }, 1500);
    return;
  }

  const mins = Math.floor(sessionRemainingSeconds / 60);
  const secs = sessionRemainingSeconds % 60;
  textEl.innerText = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

  if (sessionRemainingSeconds <= 120) {
    // \u5269\u4F59\u6700\u540E 2 \u5206\u949F\u6807\u9EC4\u63D0\u9192
    if (badgeEl) {
      badgeEl.style.color = '#d97706';
      badgeEl.style.background = 'rgba(217, 119, 6, 0.1)';
      badgeEl.style.borderColor = 'rgba(217, 119, 6, 0.25)';
    }
  } else {
    if (badgeEl) {
      badgeEl.style.color = '#0284c7';
      badgeEl.style.background = 'rgba(2, 132, 199, 0.1)';
      badgeEl.style.borderColor = 'rgba(2, 132, 199, 0.25)';
    }
  }
}

// \u4E1A\u52A1\u64CD\u4F5C\u54CD\u5E94\u540E\u81EA\u52A8\u91CD\u7F6E 10 \u5206\u949F\u5012\u8BA1\u65F6
function resetSessionCountdown() {
  sessionRemainingSeconds = 10 * 60;
  updateSessionCountdownDisplay();
}

function initSessionActivityTracker() {
  updateSessionCountdownDisplay();
  
  if (sessionCountdownInterval) clearInterval(sessionCountdownInterval);
  sessionCountdownInterval = setInterval(() => {
    sessionRemainingSeconds--;
    updateSessionCountdownDisplay();
  }, 1000);
}

function initAllTablePaginators() {
  window._paginators['plain-table-row'] = new TablePaginator('plain-table-body', 'plain-table-row', 'plain-table-pagination', 10, 'plain');
  window._paginators['cf-table-row'] = new TablePaginator('cf-table-body', 'cf-table-row', 'cf-table-pagination', 10, 'cf');
  window._paginators['logs-table-row'] = new TablePaginator('logs-table-body', 'logs-table-row', 'logs-table-pagination', 15, 'logs');
}

// \u9875\u9762\u52A0\u8F7D\u5B8C\u6210\u540E\u7ACB\u5373\u521D\u59CB\u5316\u6240\u6709\u8868\u683C\u5206\u9875\u5668\u4E0E\u4F1A\u8BDD\u4FDD\u6D3B\u673A\u5236
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAllTablePaginators();
    initSessionActivityTracker();
  });
} else {
  initAllTablePaginators();
  initSessionActivityTracker();
}
`;function xt(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ee(o,e,t){return`
    <!-- \u89C6\u56FE 1: \u666E\u901A\u8BA2\u9605\u7BA1\u7406 -->
    <section class="tab-content active" id="tab-custom-sub">
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">\u{1F4E6} \u666E\u901A\u8BA2\u9605\u5217\u8868</h2>
          <button class="btn-action btn-success" onclick="openAddGroupModal()">+ \u6DFB\u52A0\u65B0\u8BA2\u9605</button>
        </div>
        <p class="section-desc">\u6BCF\u4E2A\u8BA2\u9605\u5747\u5206\u914D\u72EC\u7ACB\u7684\u4E13\u5C5E\u8BA2\u9605\u76F4\u8FDE\u77ED\u94FE\u63A5\uFF08\u652F\u6301\u5355\u6B21\u6216\u9650\u5236\u6B21\u6570\u8BBF\u95EE\uFF09\uFF0C\u8FBE\u5230\u6B21\u6570\u4E0A\u9650\u540E\u81EA\u52A8\u7269\u7406\u9500\u6BC1\u3002</p>

        <!-- \u6279\u91CF\u64CD\u4F5C\u5DE5\u5177\u680F -->
        <div class="batch-toolbar" id="plain-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>\u2611\uFE0F \u5DF2\u9009\u4E2D <strong id="plain-selected-count">0</strong> \u4E2A\u8BA2\u9605</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('plain')">\u53D6\u6D88\u9009\u62E9</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeletePlainGroups()">\u{1F5D1}\uFE0F \u6279\u91CF\u5220\u9664\u9009\u4E2D</button>
          </div>
        </div>

        <!-- \u666E\u901A\u8BA2\u9605\u5217\u8868\u8868\u683C -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="plain-check-all" onchange="toggleAllCheckboxes('plain', this.checked)" title="\u5168\u9009 / \u53CD\u9009\u5F53\u524D\u9875" />
                </th>
                <th style="min-width: 260px;">\u72EC\u7ACB\u76F4\u8FDE\u8BA2\u9605\u94FE\u63A5</th>
                <th style="width: 170px; white-space: nowrap;">\u8BBF\u95EE\u9650\u5236 (\u5DF2\u8BBF\u95EE / \u4E0A\u9650)</th>
                <th style="min-width: 140px; white-space: nowrap;">\u8BA2\u9605\u5907\u6CE8 / \u540D\u79F0</th>
                <th style="width: 180px; text-align: right; white-space: nowrap;">\u64CD\u4F5C</th>
              </tr>
            </thead>
            <tbody id="plain-table-body">
              ${t.length===0?`
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    \u6682\u65E0\u666E\u901A\u8BA2\u9605\uFF0C\u70B9\u51FB\u53F3\u4E0A\u89D2 \u201C+ \u6DFB\u52A0\u65B0\u8BA2\u9605\u201D \u5F00\u59CB\u521B\u5EFA
                  </td>
                </tr>
              `:t.map((n,a)=>{let s=`${o}/${n.id}${e?`?token=${encodeURIComponent(e)}`:""}`,i=n.maxViews!==void 0&&n.maxViews!==null&&n.maxViews>0?n.maxViews:0,l=n.views||0,d=xt(n.name||"\u672A\u547D\u540D\u8BA2\u9605"),c=xt(n.id),h=n.nodes?n.nodes.split(`
`).map(u=>u.trim()).filter(Boolean).length:0;return`
                  <tr class="plain-table-row" data-index="${a}" data-id="${c}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox plain-row-checkbox" value="${c}" onchange="updateBatchSelection('plain')" />
                    </td>
                    <td>
                      <div class="copy-box" style="gap: 6px;">
                        <input type="text" class="copy-input" id="plain-link-${a}" value="${xt(s)}" readonly style="padding: 6px 10px; font-size: 12px; width: 100%; min-width: 160px;" />
                        <button class="btn-action" style="height: 32px; padding: 0 10px; font-size: 12px; flex-shrink: 0;" onclick="copyText('plain-link-${a}')">\u{1F4CB} \u590D\u5236</button>
                      </div>
                    </td>
                    <td style="white-space: nowrap;">
                      ${i>0?`
                        <span class="node-count-badge badge-limit">
                          \u{1F525} ${l} / ${i} \u6B21
                        </span>
                      `:`
                        <span class="node-count-badge badge-unlimited">
                          \u267E\uFE0F \u65E0\u9650\u5236 (${l} \u6B21)
                        </span>
                      `}
                    </td>
                    <td style="font-weight: 600; color: var(--text-title); font-size: 14px;" title="${d}">
                      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span>${d}</span>
                        ${h>0?`
                          <span class="node-count-badge" style="background: #eef2ff; color: #4338ca; font-size: 11px;">
                            \u{1F4E6} ${h} \u4E2A\u8282\u70B9
                          </span>
                        `:`
                          <span class="node-count-badge" style="background: #fee2e2; color: #b91c1c; font-size: 11px;">
                            \u26A0\uFE0F 0 \u4E2A\u8282\u70B9
                          </span>
                        `}
                        ${n.allowedCountries&&n.allowedCountries.length>0?`
                          <span class="node-count-badge" style="background: #e0f2fe; color: #0369a1; font-size: 11px;" title="\u4EC5\u5F00\u653E\u6307\u5B9A\u56FD\u5BB6: ${xt(n.allowedCountries.join(", "))}">
                            \u{1F30D} ${xt(n.allowedCountries.join(", "))}
                          </span>
                        `:""}
                      </div>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div class="table-actions">
                        <button class="btn-action btn-secondary" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${c}" onclick="openEditGroupModal(this.dataset.id)">\u270F\uFE0F \u7F16\u8F91</button>
                        <button class="btn-action btn-danger" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${c}" onclick="deleteGroup(this.dataset.id)">\u{1F5D1}\uFE0F \u5220\u9664</button>
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
          <div class="table-pagination" id="plain-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>

    <!-- \u6DFB\u52A0/\u7F16\u8F91\u666E\u901A\u8BA2\u9605\u62BD\u5C49 (\u4ECE\u53F3\u4FA7\u6ED1\u51FA) -->
    <div class="drawer-overlay" id="group-modal">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 id="modal-group-title">\u6DFB\u52A0\u65B0\u666E\u901A\u8BA2\u9605</h3>
          <button class="drawer-close" onclick="closeGroupModal()">&times;</button>
        </div>
        <form onsubmit="submitGroupForm(event)" style="display: flex; flex-direction: column; flex: 1; height: calc(100% - 65px);">
          <input type="hidden" id="form-group-id" />
          <div class="drawer-body">
            <div class="form-field">
              <label>\u8BA2\u9605\u540D\u79F0 / \u5907\u6CE8 (\u6700\u591A30\u5B57):</label>
              <input type="text" id="form-group-name" placeholder="\u4F8B\u5982: \u9999\u6E2F\u81EA\u5EFA\u4E13\u7EBF / \u65E5\u672C\u5907\u7528\u8282\u70B9" maxlength="30" required />
            </div>
            <div class="form-field">
              <label>\u6700\u5927\u8BBF\u95EE\u6B21\u6570\u9650\u5236 (1~999 \u6B21\uFF0C\u8FBE\u5230\u6B21\u6570\u540E\u81EA\u52A8\u7269\u7406\u9500\u6BC1\u8BE5\u8BA2\u9605\uFF0C0 \u6216\u7559\u7A7A\u8868\u793A\u4E0D\u9650\u5236):</label>
              <input type="number" id="form-group-max-views" min="0" max="999" placeholder="0 (\u4E0D\u9650\u5236) \u6216\u8F93\u5165 1 ~ 999" />
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">\u5F00\u653E\u56FD\u5BB6/\u5730\u533A IP (\u53EF\u9009\uFF0C\u7559\u7A7A\u5219\u7EE7\u627F\u5168\u5C40\u914D\u7F6E):</label>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'CN')">+CN</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'HK')">+HK</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'MO')">+MO</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'TW')">+TW</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'JP')">+JP</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'SG')">+SG</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-group-allowed-countries', 'US')">+US</button>
                  <button type="button" class="btn-action btn-danger" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="clearInput('form-group-allowed-countries')">\u6E05\u7A7A</button>
                </div>
              </div>
              <input type="text" id="form-group-allowed-countries" placeholder="\u4F8B\u5982: CN, HK, JP (\u7559\u7A7A\u7EE7\u627F\u5168\u5C40\u5B89\u5168\u914D\u7F6E)" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                <span>\u{1F4A1} \u5141\u8BB8\u8BBF\u95EE\u6B64\u8BA2\u9605\u7684 IP \u5730\u533A\u4EE3\u7801\uFF0C\u591A\u4E2A\u4EE5\u9017\u53F7\u5206\u9694\uFF1B\u7559\u7A7A\u5219\u4F7F\u7528\u5168\u5C40\u8BA2\u9605\u5B89\u5168\u914D\u7F6E</span>
              </div>
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">\u8282\u70B9\u5217\u8868\uFF08\u4E00\u884C\u4E00\u4E2A\uFF0C\u652F\u6301\u591A\u534F\u8BAE\u6279\u91CF\u7C98\u8D34\uFF09:</label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('form-group-nodes')">\u{1F4CB} \u7C98\u8D34</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('form-group-nodes')">\u6E05\u7A7A</button>
                </div>
              </div>
              <textarea class="form-textarea" style="min-height: 240px; margin-bottom: 6px;" id="form-group-nodes" placeholder="\u5728\u6B64\u7C98\u8D34\u8BE5\u8BA2\u9605\u7684\u8282\u70B9\u94FE\u63A5...&#10;vless://...&#10;vmess://...&#10;ss://...&#10;trojan://..." oninput="updateNodeStats()" required></textarea>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                <span>\u{1F4A1} \u652F\u6301\u591A\u884C\u6279\u91CF\u7C98\u8D34</span>
                <span id="node-stats-info" style="color: var(--code-color); font-family: monospace; font-weight: 600;">0 \u4E2A\u5B57\u7B26 | 0 \u884C</span>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button type="button" class="btn-action btn-secondary" onclick="closeGroupModal()">\u53D6\u6D88</button>
            <button type="submit" class="btn-action btn-success">\u{1F4BE} \u4FDD\u5B58\u8BA2\u9605</button>
          </div>
        </form>
      </div>
    </div>
  `}function wt(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Be(o,e,t,n){return`
    <!-- \u89C6\u56FE 2: CF \u4F18\u9009\u8BA2\u9605\u7BA1\u7406 -->
    <section class="tab-content" id="tab-cf-sub">
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">\u26A1 CF \u4F18\u9009\u8BA2\u9605\u5217\u8868</h2>
          <button class="btn-action btn-success" onclick="openAddCfGroupModal()">+ \u6DFB\u52A0\u4F18\u9009\u8BA2\u9605</button>
        </div>
        <p class="section-desc">\u652F\u6301\u521B\u5EFA\u591A\u4E2A\u4E0D\u540C\u7528\u9014\u7684 CF \u4F18\u9009\u8BA2\u9605\uFF0C\u6BCF\u4E2A\u8BA2\u9605\u53EF\u72EC\u7ACB\u6307\u5B9A\u57FA\u7840 VLESS \u6A21\u677F\u8282\u70B9\u3001\u5173\u8054\u4F18\u9009\u63A5\u53E3\u6E90\u53CA\u8BBF\u95EE\u6B21\u6570\u9650\u5236\u3002</p>

        <!-- \u6279\u91CF\u64CD\u4F5C\u5DE5\u5177\u680F -->
        <div class="batch-toolbar" id="cf-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>\u2611\uFE0F \u5DF2\u9009\u4E2D <strong id="cf-selected-count">0</strong> \u4E2A\u4F18\u9009\u8BA2\u9605</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('cf')">\u53D6\u6D88\u9009\u62E9</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeleteCfGroups()">\u{1F5D1}\uFE0F \u6279\u91CF\u5220\u9664\u9009\u4E2D</button>
          </div>
        </div>

        <!-- CF \u4F18\u9009\u8BA2\u9605\u8868\u683C -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="cf-check-all" onchange="toggleAllCheckboxes('cf', this.checked)" title="\u5168\u9009 / \u53CD\u9009\u5F53\u524D\u9875" />
                </th>
                <th style="min-width: 260px;">\u72EC\u7ACB\u76F4\u8FDE\u8BA2\u9605\u94FE\u63A5</th>
                <th style="width: 170px; white-space: nowrap;">\u8BBF\u95EE\u9650\u5236 (\u5DF2\u8BBF\u95EE / \u4E0A\u9650)</th>
                <th style="min-width: 140px; white-space: nowrap;">\u8BA2\u9605\u5907\u6CE8 / \u540D\u79F0</th>
                <th style="width: 240px; text-align: right; white-space: nowrap;">\u64CD\u4F5C</th>
              </tr>
            </thead>
            <tbody id="cf-table-body">
              ${t.length===0?`
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    \u6682\u65E0\u72EC\u7ACB CF \u4F18\u9009\u8BA2\u9605\uFF0C\u70B9\u51FB\u53F3\u4E0A\u89D2 \u201C+ \u6DFB\u52A0\u4F18\u9009\u8BA2\u9605\u201D \u521B\u5EFA\u4E2A\u6027\u5316\u4F18\u9009\u8BA2\u9605\u7EC4
                  </td>
                </tr>
              `:t.map((a,s)=>{let i=`${o}/${a.id}${e?`?token=${encodeURIComponent(e)}`:""}`,l=a.maxViews!==void 0&&a.maxViews!==null&&a.maxViews>0?a.maxViews:0,d=a.views||0,c=wt(a.name||"\u672A\u547D\u540D\u4F18\u9009\u8BA2\u9605"),h=wt(a.id);return`
                  <tr class="cf-table-row" data-index="${s}" data-id="${h}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox cf-row-checkbox" value="${h}" onchange="updateBatchSelection('cf')" />
                    </td>
                    <td>
                      <div class="copy-box" style="gap: 6px;">
                        <input type="text" class="copy-input" id="cf-link-${s}" value="${wt(i)}" readonly style="padding: 6px 10px; font-size: 12px; width: 100%; min-width: 160px;" />
                        <button class="btn-action" style="height: 32px; padding: 0 10px; font-size: 12px; flex-shrink: 0;" onclick="copyText('cf-link-${s}')">\u{1F4CB} \u590D\u5236</button>
                      </div>
                    </td>
                    <td style="white-space: nowrap;">
                      ${l>0?`
                        <span class="node-count-badge badge-limit">
                          \u{1F525} ${d} / ${l} \u6B21
                        </span>
                      `:`
                        <span class="node-count-badge badge-unlimited">
                          \u267E\uFE0F \u65E0\u9650\u5236 (${d} \u6B21)
                        </span>
                      `}
                    </td>
                    <td style="font-weight: 600; color: var(--text-title); font-size: 14px;" title="${c}">
                      ${c}
                      ${a.allowedCountries&&a.allowedCountries.length>0?`
                        <span class="node-count-badge" style="background: #e0f2fe; color: #0369a1; font-size: 11px; margin-left: 6px;" title="\u4EC5\u5F00\u653E\u6307\u5B9A\u56FD\u5BB6: ${wt(a.allowedCountries.join(", "))}">
                          \u{1F30D} ${wt(a.allowedCountries.join(", "))}
                        </span>
                      `:""}
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div class="table-actions">
                        <button class="btn-action btn-purple" style="height: 32px; padding: 0 10px; font-size: 12px;" data-id="${h}" onclick="testCfGroup(this.dataset.id)">\u{1F9EA} \u6D4B\u8BD5</button>
                        <button class="btn-action btn-secondary" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${h}" onclick="openEditCfGroupModal(this.dataset.id)">\u270F\uFE0F \u7F16\u8F91</button>
                        <button class="btn-action btn-danger" style="height: 32px; padding: 0 12px; font-size: 12px;" data-id="${h}" onclick="deleteCfGroup(this.dataset.id)">\u{1F5D1}\uFE0F \u5220\u9664</button>
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
          <div class="table-pagination" id="cf-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>

    <!-- \u6DFB\u52A0/\u7F16\u8F91 CF \u4F18\u9009\u8BA2\u9605\u62BD\u5C49 (\u4ECE\u53F3\u4FA7\u6ED1\u51FA) -->
    <div class="drawer-overlay" id="cf-group-modal">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 id="modal-cf-group-title">\u6DFB\u52A0\u65B0 CF \u4F18\u9009\u8BA2\u9605</h3>
          <button class="drawer-close" onclick="closeCfGroupModal()">&times;</button>
        </div>
        <form onsubmit="submitCfGroupForm(event)" style="display: flex; flex-direction: column; flex: 1; height: calc(100% - 65px);">
          <input type="hidden" id="form-cf-group-id" />
          <div class="drawer-body">
            <div class="form-field">
              <label>\u8BA2\u9605\u540D\u79F0 / \u5907\u6CE8 (\u6700\u591A30\u5B57):</label>
              <input type="text" id="form-cf-group-name" placeholder="\u4F8B\u5982: \u6781\u901F 4K \u4F18\u9009\u4E13\u7EBF / \u79FB\u52A8\u4E13\u4EAB\u4F18\u9009" maxlength="30" required />
            </div>
            <div class="form-field">
              <label>\u6700\u5927\u8BBF\u95EE\u6B21\u6570\u9650\u5236 (1~999 \u6B21\uFF0C\u8FBE\u5230\u6B21\u6570\u540E\u81EA\u52A8\u7269\u7406\u9500\u6BC1\u8BE5\u8BA2\u9605\uFF0C0 \u6216\u7559\u7A7A\u8868\u793A\u4E0D\u9650\u5236):</label>
              <input type="number" id="form-cf-group-max-views" min="0" max="999" placeholder="0 (\u4E0D\u9650\u5236) \u6216\u8F93\u5165 1 ~ 999" />
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">\u5F00\u653E\u56FD\u5BB6/\u5730\u533A IP (\u53EF\u9009\uFF0C\u7559\u7A7A\u5219\u7EE7\u627F\u5168\u5C40\u914D\u7F6E):</label>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'CN')">+CN</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'HK')">+HK</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'MO')">+MO</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'TW')">+TW</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'JP')">+JP</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'SG')">+SG</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="addCountryToInput('form-cf-group-allowed-countries', 'US')">+US</button>
                  <button type="button" class="btn-action btn-danger" style="height: 22px; font-size: 10px; padding: 0 6px;" onclick="clearInput('form-cf-group-allowed-countries')">\u6E05\u7A7A</button>
                </div>
              </div>
              <input type="text" id="form-cf-group-allowed-countries" placeholder="\u4F8B\u5982: CN, HK, JP (\u7559\u7A7A\u7EE7\u627F\u5168\u5C40\u5B89\u5168\u914D\u7F6E)" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                <span>\u{1F4A1} \u5141\u8BB8\u8BBF\u95EE\u6B64\u8BA2\u9605\u7684 IP \u5730\u533A\u4EE3\u7801\uFF0C\u591A\u4E2A\u4EE5\u9017\u53F7\u5206\u9694\uFF1B\u7559\u7A7A\u5219\u4F7F\u7528\u5168\u5C40\u8BA2\u9605\u5B89\u5168\u914D\u7F6E</span>
              </div>
            </div>
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">\u57FA\u7840 VLESS \u6A21\u677F\u8282\u70B9 (\u652F\u6301\u6807\u51C6\u683C\u5F0F\u4E0E Base64/\u5C0F\u706B\u7BAD\u7B49\u5BA2\u6237\u7AEF\u683C\u5F0F):</label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('form-cf-group-base')">\u{1F4CB} \u7C98\u8D34</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('form-cf-group-base')">\u6E05\u7A7A</button>
                </div>
              </div>
              <textarea class="form-textarea" style="min-height: 110px; margin-bottom: 6px;" id="form-cf-group-base" placeholder="\u5728\u6B64\u7C98\u8D34\u8BE5\u4F18\u9009\u8BA2\u9605\u4E13\u7528\u7684\u57FA\u7840 vless:// \u8282\u70B9\u94FE\u63A5...\uFF08\u652F\u6301\u6807\u51C6\u683C\u5F0F\u53CA Base64 \u683C\u5F0F\uFF0C\u7559\u7A7A\u5219\u4F7F\u7528\u5168\u5C40\u57FA\u7840\u8282\u70B9\uFF09"></textarea>
              <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                <span>\u{1F4A1} \u4F18\u9009 IP \u5C06\u81EA\u52A8\u63D0\u53D6\u5E76\u66FF\u6362\u6A21\u677F\u8282\u70B9\u7684\u670D\u52A1\u5668\u5730\u5740\u4E0E\u7AEF\u53E3\uFF0C\u4FDD\u7559\u5168\u90E8\u4F20\u8F93\u4E0E\u4F2A\u88C5\u53C2\u6570</span>
              </div>
            </div>

            <!-- \u4F18\u9009 IP \u63A5\u53E3\u6E90\u914D\u7F6E (\u591A\u884C\u6587\u672C\u57DF\u6279\u91CF\u914D\u7F6E) -->
            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">\u4F18\u9009 IP \u63A5\u53E3\u6E90\u914D\u7F6E (\u591A\u884C\u6279\u91CF\u8F93\u5165\uFF0C\u683C\u5F0F\uFF1A\u540D\u79F0,URL \u6216 \u5355\u7EAF URL):</label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('global-sources-text')">\u{1F4CB} \u7C98\u8D34</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('global-sources-text')">\u6E05\u7A7A</button>
                </div>
              </div>
              <textarea id="global-sources-text" class="form-textarea" style="min-height: 140px; font-family: monospace; font-size: 12px; line-height: 1.6;" placeholder="https://cf.090227.xyz/cmcc?ips=10&#10;\u4E2D\u56FD\u8054\u901A,https://cf.090227.xyz/cu?ips=10&#10;https://cf.090227.xyz/ct?ips=10">${n.map(a=>a.name&&!a.name.startsWith("\u6E90-")?`${a.name},${a.url}`:a.url).join(`
`)}</textarea>
              <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px;">
                <span>\u{1F4A1} \u4E00\u884C\u4E00\u4E2A\u4F18\u9009 API \u63A5\u53E3\uFF0C\u4FDD\u5B58\u4F18\u9009\u8BA2\u9605\u65F6\u5C06\u4E00\u5E76\u66F4\u65B0\u4F18\u9009\u6E90\u914D\u7F6E</span>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button type="button" class="btn-action btn-purple" id="btn-test-modal-nodes" onclick="testModalCfNodes()">\u{1F9EA} \u6D4B\u8BD5\u751F\u6210\u8282\u70B9</button>
            <button type="button" class="btn-action btn-secondary" onclick="closeCfGroupModal()">\u53D6\u6D88</button>
            <button type="submit" class="btn-action btn-success">\u{1F4BE} \u4FDD\u5B58\u4F18\u9009\u8BA2\u9605</button>
          </div>
        </form>
      </div>
    </div>
  `}function Y(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ae(o=[],e=[],t=[]){return`
    <!-- \u89C6\u56FE 3: \u8BBF\u95EE\u65E5\u5FD7\u4E0E IP \u62E6\u622A\u7BA1\u7406 -->
    <section class="tab-content" id="tab-access-logs">
      <!-- \u5DE6\u53F3\u53CC\u680F\uFF1AIP \u767D\u540D\u5355\u4E0E\u9ED1\u540D\u5355\u7BA1\u7406 -->
      <div class="ip-management-grid">
        <!-- \u5DE6\u4FA7: IP \u767D\u540D\u5355\u653E\u884C\u914D\u7F6E\u5361\u7247 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-group">
              <h2 class="section-title">\u2728 IP \u8BBF\u95EE\u767D\u540D\u5355</h2>
              <span class="node-count-badge badge-success">\u6C38\u4E45\u8C41\u514D\u62E6\u622A</span>
            </div>
            <button class="btn-action btn-success" onclick="saveWhitelistIPsBatch()">\u{1F4BE} \u4FDD\u5B58\u767D\u540D\u5355</button>
          </div>
          <p class="section-desc">\u52A0\u5165\u767D\u540D\u5355\u7684 IP \u62E5\u6709\u6700\u9AD8\u653E\u884C\u6743\u9650\uFF1A\u8C41\u514D\u9ED1\u540D\u5355\u62E6\u622A\u3001\u8C41\u514D\u767B\u5F55\u5931\u8D25\u8FDE\u7EED\u5C01\u7981\uFF0C\u4E14\u53EF\u4E00\u952E\u76F4\u63A5\u52A0\u5165\uFF08\u652F\u6301\u4E00\u884C\u4E00\u4E2A IP\uFF09\u3002</p>
          
          <div class="form-field" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="margin-bottom: 0;">\u5DF2\u653E\u884C\u7684 IP \u5217\u8868\uFF08\u4E00\u884C\u4E00\u4E2A IP\uFF09:</label>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('textarea-whitelist-ips')">\u{1F4CB} \u7C98\u8D34</button>
                <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('textarea-whitelist-ips')">\u6E05\u7A7A</button>
              </div>
            </div>
            <textarea id="textarea-whitelist-ips" class="form-textarea" style="min-height: 100px; font-family: monospace; font-size: 12px; line-height: 1.6;" placeholder="1.1.1.1&#10;8.8.8.8">${Y(t.join(`
`))}</textarea>
            <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px; margin-top: 4px;">
              <span>\u{1F4A1} \u5F53\u524D\u5171\u653E\u884C <strong>${t.length}</strong> \u4E2A\u767D\u540D\u5355 IP</span>
            </div>
          </div>
        </div>

        <!-- \u53F3\u4FA7: IP \u9ED1\u540D\u5355\u5C4F\u853D\u914D\u7F6E\u5361\u7247 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-group">
              <h2 class="section-title">\u{1F6E1}\uFE0F IP \u8BBF\u95EE\u9ED1\u540D\u5355 / \u5C4F\u853D</h2>
              <span class="node-count-badge badge-danger">403 \u5F3A\u5236\u963B\u65AD</span>
            </div>
            <button class="btn-action btn-purple" onclick="saveBlockedIPsBatch()">\u{1F4BE} \u4FDD\u5B58\u9ED1\u540D\u5355</button>
          </div>
          <p class="section-desc">\u88AB\u5217\u5165\u9ED1\u540D\u5355\u7684 IP \u8BBF\u95EE\u4EFB\u4F55\u8BA2\u9605\u6216\u540E\u53F0\u9875\u9762\u65F6\uFF0C\u5C06\u76F4\u63A5\u88AB\u7CFB\u7EDF\u62E6\u622A\u5E76\u8FD4\u56DE <code>403 Forbidden</code>\uFF08\u652F\u6301\u4E00\u884C\u4E00\u4E2A IP\uFF09\u3002</p>
          
          <div class="form-field" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="margin-bottom: 0;">\u5DF2\u5C4F\u853D\u7684 IP \u5217\u8868\uFF08\u4E00\u884C\u4E00\u4E2A IP\uFF09:</label>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="pasteClipboard('textarea-blocked-ips')">\u{1F4CB} \u7C98\u8D34</button>
                <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('textarea-blocked-ips')">\u6E05\u7A7A</button>
              </div>
            </div>
            <textarea id="textarea-blocked-ips" class="form-textarea" style="min-height: 100px; font-family: monospace; font-size: 12px; line-height: 1.6;" placeholder="1.2.3.4&#10;5.6.7.8">${Y(e.join(`
`))}</textarea>
            <div style="font-size: 12px; color: var(--text-muted); padding: 0 2px; margin-top: 4px;">
              <span>\u{1F4A1} \u5F53\u524D\u5171\u5C4F\u853D <strong>${e.length}</strong> \u4E2A IP</span>
            </div>
          </div>
        </div>
      </div>

      <!-- \u4E0B\u90E8\uFF1A\u5B9E\u65F6\u8BBF\u95EE\u65E5\u5FD7\u8BB0\u5F55\u8868\u683C\u5361\u7247 -->
      <div class="section-card">
        <div class="section-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 class="section-title">\u{1F4CA} \u5BA2\u6237\u7AEF\u8BA2\u9605\u8BBF\u95EE\u5B9E\u65F6\u65E5\u5FD7</h2>
            <span class="node-count-badge">\u6700\u8FD1 ${o.length} \u6761\u8BB0\u5F55</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-action btn-secondary" onclick="location.reload()">\u{1F504} \u5237\u65B0\u65E5\u5FD7</button>
            <button class="btn-action btn-danger" onclick="clearAllLogs()">\u{1F5D1}\uFE0F \u6E05\u7A7A\u6240\u6709\u65E5\u5FD7</button>
          </div>
        </div>
        <p class="section-desc">\u81EA\u52A8\u8BB0\u5F55\u5BA2\u6237\u7AEF\u62C9\u53D6\u8BA2\u9605\u3001\u8BBF\u95EE\u77ED\u94FE\u63A5\u53CA\u7BA1\u7406\u64CD\u4F5C\u7684\u5B9E\u65F6\u65E5\u5FD7\uFF08\u5305\u542B\u5BA2\u6237\u7AEF\u771F\u5B9E IP\u3001\u5730\u7406\u4F4D\u7F6E\u3001\u8BBF\u95EE\u65F6\u95F4\u3001\u8BF7\u6C42\u8DEF\u5F84\u3001\u72B6\u6001\u7801\u4E0E\u5BA2\u6237\u7AEF User-Agent\uFF09\u3002</p>

        <!-- \u65E5\u5FD7\u591A\u6761\u4EF6\u7B5B\u9009\u5DE5\u5177\u680F -->
        <div class="logs-filter-toolbar">
          <div class="logs-filter-group">
            <div class="filter-input-wrap">
              <span class="filter-icon">\u{1F50D}</span>
              <input type="text" id="logs-filter-keyword" class="filter-input" placeholder="\u641C\u7D22 IP / \u8DEF\u5F84 / \u7C7B\u578B / UA..." oninput="applyLogsFilter()" />
              <button type="button" class="filter-clear-btn" id="logs-keyword-clear" onclick="clearLogsKeyword()" style="display:none;" title="\u6E05\u7A7A\u641C\u7D22">\u2715</button>
            </div>

            <select id="logs-filter-status" class="filter-select" onchange="applyLogsFilter()">
              <option value="">\u5168\u90E8\u72B6\u6001 (HTTP)</option>
              <option value="200">200 \u6B63\u5E38 (OK)</option>
              <option value="403">403 \u62E6\u622A (Forbidden)</option>
              <option value="401">401 \u9274\u6743 (Unauthorized)</option>
              <option value="404">404 \u4E0D\u5B58\u5728 (Not Found)</option>
              <option value="429">429 \u9650\u6D41 (Too Many)</option>
            </select>

            <select id="logs-filter-type" class="filter-select" onchange="applyLogsFilter()">
              <option value="">\u5168\u90E8\u8BF7\u6C42\u7C7B\u578B</option>
              <option value="sub">\u26A1 \u8BA2\u9605\u8BF7\u6C42</option>
              <option value="ban">\u{1F6AB} IP\u62E6\u622A / \u5C01\u7981</option>
              <option value="login_fail">\u26A0\uFE0F \u5BC6\u7801/\u9A8C\u8BC1\u7801\u9519\u8BEF</option>
              <option value="probe">\u{1F6E1}\uFE0F \u6F0F\u6D1E\u63A2\u6D4B / \u871C\u7F50</option>
              <option value="not_found">\u26A0\uFE0F \u63A2\u6D4B\u4E0D\u5B58\u5728\u8DEF\u5F84</option>
            </select>

            <select id="logs-filter-ip-type" class="filter-select" onchange="applyLogsFilter()">
              <option value="">\u5168\u90E8 IP \u7C7B\u522B</option>
              <option value="whitelist">\u2B50 \u4EC5\u767D\u540D\u5355 IP</option>
              <option value="blocked">\u{1F6AB} \u4EC5\u5DF2\u5C4F\u853D IP</option>
              <option value="normal">\u{1F310} \u4EC5\u666E\u901A\u8BBF\u5BA2 IP</option>
            </select>

            <button type="button" class="btn-action btn-secondary filter-reset-btn" onclick="resetLogsFilter()" title="\u91CD\u7F6E\u6240\u6709\u7B5B\u9009\u6761\u4EF6">
              \u21BA \u91CD\u7F6E
            </button>
          </div>

          <div class="logs-filter-summary">
            <span id="logs-filter-stats">\u663E\u793A <strong>${o.length}</strong> / \u5171 <strong>${o.length}</strong> \u6761\u8BB0\u5F55</span>
          </div>
        </div>

        <!-- \u6279\u91CF\u64CD\u4F5C\u5DE5\u5177\u680F -->
        <div class="batch-toolbar" id="logs-batch-toolbar">
          <div class="batch-toolbar-info">
            <span>\u2611\uFE0F \u5DF2\u9009\u4E2D <strong id="logs-selected-count">0</strong> \u6761\u65E5\u5FD7</span>
          </div>
          <div class="batch-toolbar-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 32px; font-size: 12px; padding: 0 10px;" onclick="clearBatchSelection('logs')">\u53D6\u6D88\u9009\u62E9</button>
            <button type="button" class="btn-action btn-danger" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="batchDeleteLogs()">\u{1F5D1}\uFE0F \u6279\u91CF\u5220\u9664\u9009\u4E2D</button>
          </div>
        </div>

        <!-- \u65E5\u5FD7\u8868\u683C -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" class="table-checkbox" id="logs-check-all" onchange="toggleAllCheckboxes('logs', this.checked)" title="\u5168\u9009 / \u53CD\u9009\u5F53\u524D\u9875" />
                </th>
                <th style="width: 160px;">\u8BBF\u95EE\u65F6\u95F4</th>
                <th style="width: 200px;">\u5BA2\u6237\u7AEF IP / \u5730\u7406\u4F4D\u7F6E</th>
                <th style="width: 100px;">\u72B6\u6001</th>
                <th style="min-width: 180px;">\u8BF7\u6C42\u8DEF\u5F84 / \u7C7B\u578B</th>
                <th style="min-width: 220px;">\u5BA2\u6237\u7AEF User-Agent</th>
                <th style="width: 180px; text-align: right;">\u5FEB\u901F\u64CD\u4F5C</th>
              </tr>
            </thead>
            <tbody id="logs-table-body">
              ${o.length===0?`
                <tr>
                  <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    \u6682\u65E0\u8BBF\u95EE\u65E5\u5FD7\u8BB0\u5F55\uFF0C\u5BA2\u6237\u7AEF\u53D1\u8D77\u8BA2\u9605\u62C9\u53D6\u6216\u8BBF\u95EE\u540E\u5C06\u5728\u6B64\u5B9E\u65F6\u663E\u793A
                  </td>
                </tr>
              `:o.map((n,a)=>{let s=t.includes(n.ip),i=e.includes(n.ip),l=n.status===200?'<span class="node-count-badge badge-success">200 OK</span>':n.status===403?'<span class="node-count-badge badge-danger">403 \u62E6\u622A</span>':n.status===401?'<span class="node-count-badge badge-warning">401 \u9274\u6743</span>':`<span class="node-count-badge">${Y(String(n.status||200))}</span>`,d=Y(n.ip||"\u672A\u77E5 IP"),c=Y(n.location||"\u5168\u7403 / \u672C\u5730"),h=Y(n.time||"-"),u=Y(n.path||"/"),m=Y(n.type||"\u8BA2\u9605\u8BF7\u6C42"),y=Y(n.ua||"-");return`
                  <tr class="logs-table-row" data-index="${a}"
                      data-ip="${d}"
                      data-location="${c}"
                      data-status="${n.status||200}"
                      data-path="${u}"
                      data-type="${m}"
                      data-ua="${y}"
                      data-whitelisted="${s?"1":"0"}"
                      data-blocked="${i?"1":"0"}">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="table-checkbox logs-row-checkbox" value="${a}" onchange="updateBatchSelection('logs')" />
                    </td>
                    <td style="white-space: nowrap; font-size: 12px; color: var(--text-muted);">${h}</td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                          <span style="font-family: monospace; font-weight: 600; color: var(--text-title);">${d}</span>
                          ${s?'<span style="font-size: 10px; color: #059669; background: #ecfdf5; padding: 1px 5px; border-radius: 4px; border: 1px solid #a7f3d0; white-space: nowrap; flex-shrink: 0;">\u767D\u540D\u5355</span>':""}
                        </div>
                        <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap;">${c}</span>
                      </div>
                    </td>
                    <td>${l}</td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-family: monospace; font-size: 12px; color: var(--code-color); font-weight: 600;">${u}</span>
                        <span style="font-size: 11px; color: var(--text-muted);">${m}</span>
                      </div>
                    </td>
                    <td style="font-size: 12px; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${y}">${y}</td>
                    <td style="text-align: right; white-space: nowrap;">
                      <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
                        ${s?`
                          <button class="btn-action btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${d}" onclick="removeWhitelistIP(this.dataset.ip)">\u79FB\u9664\u767D\u540D\u5355</button>
                        `:`
                          <button class="btn-action btn-success" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${d}" onclick="addWhitelistIP(this.dataset.ip)">\u2B50 \u767D\u540D\u5355</button>
                        `}
                        ${i?`
                          <button class="btn-action btn-secondary" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${d}" onclick="unblockIP(this.dataset.ip)">\u{1F7E2} \u89E3\u5C01</button>
                        `:`
                          <button class="btn-action btn-danger" style="height: 28px; font-size: 11px; padding: 0 8px;" data-ip="${d}" onclick="blockIP(this.dataset.ip)">\u{1F6AB} \u5C4F\u853D</button>
                        `}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
              <tr id="logs-table-empty-filter-row" style="display: none;">
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">
                  \u{1F50D} \u6CA1\u6709\u627E\u5230\u7B26\u5408\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u7684\u65E5\u5FD7\u8BB0\u5F55\uFF0C\u60A8\u53EF\u4EE5\u5C1D\u8BD5\u8C03\u6574\u6216<a href="javascript:void(0)" onclick="resetLogsFilter()" style="color: #0284c7; text-decoration: underline; margin-left: 4px;">\u91CD\u7F6E\u7B5B\u9009\u6761\u4EF6</a>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-pagination" id="logs-table-pagination" style="display: none;"></div>
        </div>
      </div>
    </section>
  `}function gt(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ze(o,e,t=[],n=!0){let a=gt(o||"sub"),s=gt(e||""),i=Array.isArray(t)?t.join(", "):"";return`
    <!-- \u89C6\u56FE: \u8BA2\u9605\u5B89\u5168\u914D\u7F6E (\u5168\u5C40) -->
    <section class="tab-content" id="tab-security-config">
      <div class="section-card">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">\u{1F511} \u8BA2\u9605\u5B89\u5168\u4E0E\u5168\u5C40\u8DEF\u7531\u7B56\u7565</h2>
            <span class="badge-global-tip">\u5168\u7AD9\u751F\u6548</span>
          </div>
          <div class="section-header-actions">
            <button type="button" class="btn-action btn-purple" style="height: 34px; font-size: 12px; padding: 0 14px;" onclick="randomizeSecurityConfig()">\u{1F3B2} \u968F\u673A\u751F\u6210\u5168\u90E8</button>
            <button type="button" class="btn-action btn-success" style="height: 34px; font-size: 12px; padding: 0 16px;" onclick="saveSecurityConfig()">\u{1F4BE} \u4FDD\u5B58\u5B89\u5168\u914D\u7F6E</button>
          </div>
        </div>
        <p class="section-desc">\u672C\u6A21\u5757\u4E3A\u5168\u5C40\u5B89\u5168\u57FA\u7EBF\u914D\u7F6E\uFF0C\u7528\u4E8E\u4FDD\u62A4\u5168\u7AD9\u6240\u6709\u8282\u70B9\u4E0E\u8BA2\u9605\u94FE\u63A5\u3002\u7CFB\u7EDF\u91C7\u7528\u9AD8\u71B5\u968F\u673A\u5B57\u7B26\u4F5C\u4E3A\u5168\u5C40\u4E13\u5C5E\u805A\u5408\u8DEF\u7531\u4E0E\u5B89\u5168\u51ED\u636E\uFF0C\u5E76\u63D0\u4F9B IP \u5F52\u5C5E\u5730\u767D\u540D\u5355\u53CA\u4EE3\u7406\u5BA2\u6237\u7AEF\u8FC7\u6EE4\u673A\u5236\uFF0C\u5F7B\u5E95\u675C\u7EDD\u626B\u63CF\u4E0E\u76D7\u5237\u3002</p>

        <!-- \u5168\u5C40\u751F\u6548\u63D0\u793A\u6761 -->
        <div class="global-notice-card" style="margin-bottom: 20px; padding: 12px 16px; border-radius: 8px; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.22); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px; flex-shrink: 0;">\u{1F310}</span>
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-title);">
            <strong>\u5168\u5C40\u4F5C\u7528\u57DF\u8BF4\u660E\uFF1A</strong>\u6B64\u5904\u8BBE\u7F6E\u7684<strong>\u8BA2\u9605\u805A\u5408\u8DEF\u5F84\u3001\u5B89\u5168 Token\u3001\u56FD\u5BB6/\u5730\u533A IP \u767D\u540D\u5355</strong>\u53CA<strong>\u4EE3\u7406\u5BA2\u6237\u7AEF\u62E6\u622A\u8FC7\u6EE4</strong>\u5747\u4E3A\u5168\u7AD9\u5168\u5C40\u751F\u6548\uFF0C\u666E\u901A\u8BA2\u9605\u3001CF \u4F18\u9009\u8BA2\u9605\u4E0E\u805A\u5408\u8BA2\u9605\u5747\u7EDF\u4E00\u9075\u5FAA\u6B64\u5B89\u5168\u98CE\u63A7\u89C4\u5219\u3002
          </div>
        </div>

        <!-- \u54CD\u5E94\u5F0F\u6805\u683C (PC\u53CC\u680F\uFF0C\u5E73\u677F/\u624B\u673A\u81EA\u52A8\u5355\u680F\u94FA\u6EE1) -->
        <div class="settings-grid">
          <!-- \u5DE6\u680F: \u6838\u5FC3\u8DEF\u7531\u8DEF\u5F84\u4E0E\u5B89\u5168\u4EE4\u724C -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-title); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>\u{1F512}</span>
              <span>\u8BA2\u9605\u8DEF\u5F84\u4E0E\u9274\u6743\u51ED\u8BC1</span>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label>\u5168\u5C40\u805A\u5408\u8BA2\u9605\u8DEF\u5F84 (SUB_PATH):</label>
              <div class="copy-box">
                <input type="text" class="copy-input" id="cfg-sub-path" value="${a}" placeholder="12\u4F4D\u9AD8\u5F3A\u5EA6\u968F\u673A\u5B57\u7B26\u4E32" />
                <button type="button" class="btn-action btn-secondary" style="height: 38px;" onclick="randomSubPath()">\u{1F3B2} \u968F\u673A</button>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">\u7528\u4E8E\u5168\u5C40\u805A\u5408\u8BA2\u9605\u76F4\u8FDE\u8DEF\u7531\uFF0C\u4F8B\u5982: /${a}?token=...</p>
            </div>

            <div class="form-field">
              <label>\u5168\u5C40\u8BA2\u9605\u9274\u6743\u4EE4\u724C (TOKEN):</label>
              <div class="copy-box">
                <input type="text" class="copy-input" id="cfg-token" value="${s}" placeholder="24\u4F4D\u9AD8\u5F3A\u5EA6\u968F\u673A\u5B89\u5168\u4EE4\u724C" />
                <button type="button" class="btn-action btn-secondary" style="height: 38px;" onclick="randomToken()">\u{1F3B2} \u968F\u673A</button>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">\u5168\u7AD9\u8BA2\u9605 URL \u7EDF\u4E00\u9274\u6743\u51ED\u8BC1\uFF08\u672A\u643A\u5E26\u6B63\u786E Token \u7684\u8BBF\u95EE\u8BF7\u6C42\u5C06\u88AB\u76F4\u63A5\u963B\u65AD\u62E6\u622A\uFF09\u3002</p>
            </div>
          </div>

          <!-- \u53F3\u680F: \u8BBF\u95EE\u98CE\u63A7\u4E0E\u5BA2\u6237\u7AEF\u8FC7\u6EE4 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-title); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>\u{1F6E1}\uFE0F</span>
              <span>\u8BBF\u95EE\u98CE\u63A7\u4E0E\u5BA2\u6237\u7AEF\u8FC7\u6EE4</span>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                <label style="margin-bottom: 0;">\u{1F30D} \u5141\u8BB8\u8BBF\u95EE\u8BA2\u9605\u7684\u56FD\u5BB6/\u5730\u533A IP:</label>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'CN')">+CN</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'HK')">+HK</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'MO')">+MO</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'TW')">+TW</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'JP')">+JP</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'SG')">+SG</button>
                  <button type="button" class="btn-action btn-secondary" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="addCountryToInput('cfg-allowed-countries', 'US')">+US</button>
                  <button type="button" class="btn-action btn-danger" style="height: 26px; font-size: 11px; padding: 0 8px;" onclick="clearInput('cfg-allowed-countries')">\u6E05\u7A7A</button>
                </div>
              </div>
              <input type="text" id="cfg-allowed-countries" value="${gt(i)}" placeholder="\u4F8B\u5982: CN, HK, TW, JP, SG (\u7559\u7A7A\u5219\u5BF9\u6240\u6709\u56FD\u5BB6/\u5730\u533A\u5F00\u653E)" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 5px; line-height: 1.5;">
                \u57FA\u4E8E Cloudflare \u771F\u5B9E IP \u5730\u7406\u4F4D\u7F6E\u8BC6\u522B\u3002\u586B\u5199 ISO \u4E24\u5B57\u6BCD\u5927\u5199\u4EE3\u7801\uFF08\u591A\u4E2A\u4EE5\u9017\u53F7\u5206\u9694\uFF09\u3002\u7559\u7A7A\u8868\u793A\u5BF9\u6240\u6709\u56FD\u5BB6/\u5730\u533A IP \u5F00\u653E\u3002\u82E5\u67D0\u5206\u7EC4\u914D\u7F6E\u4E86\u4E13\u5C5E\u56FD\u5BB6\u767D\u540D\u5355\uFF0C\u5C06\u4F18\u5148\u91C7\u7528\u5206\u7EC4\u914D\u7F6E\u3002
              </p>
            </div>

            <div class="form-field" style="margin-top: 14px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-label);">
                <input type="checkbox" id="cfg-proxy-client-only" ${n?"checked":""} style="width: 16px; height: 16px; cursor: pointer;" />
                <span>\u{1F6E1}\uFE0F \u4EC5\u5141\u8BB8\u4EE3\u7406\u5BA2\u6237\u7AEF\u8BBF\u95EE\u8BA2\u9605 (\u62E6\u622A\u6D4F\u89C8\u5668/\u722C\u866B)</span>
              </label>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; margin-left: 24px; line-height: 1.5;">
                \u5F00\u542F\u540E\uFF0C\u4EC5\u5141\u8BB8\u4E3B\u6D41\u4EE3\u7406\u5BA2\u6237\u7AEF\uFF08\u5982 Clash\u3001Shadowrocket\u3001Quantumult X\u3001Sing-box\u3001Surge\u3001V2Ray \u7B49\uFF09\u62C9\u53D6\u8BA2\u9605\uFF0C\u76F4\u63A5\u963B\u65AD\u6D4F\u89C8\u5668\u76F4\u8FDE\u3001\u722C\u866B\u626B\u63CF\u6216\u975E\u6CD5\u63A2\u6D4B\u3002
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `}function Le(o={}){let e=o&&(o.enabled===!0||o.enabled==="true"),t=gt(o?.token||""),n=gt(o?.chatId||""),a=gt(o?.apiHost||"https://api.telegram.org");return`
    <!-- \u89C6\u56FE: TG \u8BA2\u9605\u901A\u77E5 (\u5168\u5C40) -->
    <section class="tab-content" id="tab-tg-config">
      <div class="section-card">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">\u2708\uFE0F Telegram \u673A\u5668\u4EBA\u8BA2\u9605\u901A\u77E5</h2>
            <span class="badge-global-tip">\u5168\u7AD9\u751F\u6548</span>
          </div>
          <div class="section-header-actions">
            <button type="button" class="btn-action btn-secondary" style="height: 34px; font-size: 12px; padding: 0 14px;" onclick="testTelegramNotify()">\u{1F9EA} \u6D4B\u8BD5\u63A8\u9001</button>
            <button type="button" class="btn-action btn-success" style="height: 34px; font-size: 12px; padding: 0 16px;" onclick="saveTgConfig()">\u{1F4BE} \u4FDD\u5B58\u901A\u77E5\u914D\u7F6E</button>
          </div>
        </div>
        <p class="section-desc">\u5168\u7AD9\u8BA2\u9605\u8BBF\u95EE\u5B9E\u65F6\u76D1\u63A7\u4E0E\u544A\u8B66\u3002\u5F53\u5BA2\u6237\u7AEF\u62C9\u53D6\u666E\u901A\u8BA2\u9605\u3001CF \u4F18\u9009\u8BA2\u9605\u6216\u5168\u5C40\u805A\u5408\u8BA2\u9605\u65F6\uFF0C\u7CFB\u7EDF\u5C06\u901A\u8FC7 Telegram Bot \u5F02\u6B65\u63A8\u9001\u8BBF\u95EE\u65E5\u5FD7\u8BE6\u60C5\uFF0C\u96F6\u5EF6\u8FDF\u4E0D\u5F71\u54CD\u5BA2\u6237\u7AEF\u4E0B\u53D1\u901F\u5EA6\u3002</p>

        <!-- \u5168\u5C40\u751F\u6548\u63D0\u793A\u6761 -->
        <div class="global-notice-card" style="margin-bottom: 20px; padding: 12px 16px; border-radius: 8px; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.22); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px; flex-shrink: 0;">\u{1F310}</span>
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-title);">
            <strong>\u5168\u5C40\u4F5C\u7528\u57DF\u8BF4\u660E\uFF1A</strong>\u6B64\u5904\u7684<strong>Telegram \u673A\u5668\u4EBA\u901A\u77E5</strong>\u4E3A\u5168\u7AD9\u5168\u5C40\u751F\u6548\u3002\u5F00\u542F\u540E\uFF0C\u5168\u7AD9\u6240\u6709\u8BA2\u9605\uFF08\u65E0\u8BBA\u666E\u901A\u8BA2\u9605\u8FD8\u662F CF \u4F18\u9009\u8BA2\u9605\uFF09\u7684\u8BBF\u95EE\u5747\u4F1A\u7EDF\u4E00\u901A\u8FC7\u8BE5 Telegram Bot \u53D1\u9001\u5B9E\u65F6\u901A\u77E5\u3002
          </div>
        </div>

        <!-- \u54CD\u5E94\u5F0F\u6805\u683C (PC\u53CC\u680F\uFF0C\u5E73\u677F/\u624B\u673A\u81EA\u52A8\u5355\u680F\u94FA\u6EE1) -->
        <div class="settings-grid">
          <!-- \u5DE6\u680F: Bot \u51ED\u8BC1\u4E0E\u63A8\u9001\u72B6\u6001 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="font-size: 14px; font-weight: 600; color: var(--text-title); display: flex; align-items: center; gap: 6px;">
                <span>\u{1F916}</span>
                <span>Bot \u51ED\u8BC1\u4E0E\u63A8\u9001\u72B6\u6001</span>
              </div>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-title);">
                <input type="checkbox" id="cfg-tg-enabled" ${e?"checked":""} style="width: 16px; height: 16px; cursor: pointer;" />
                <span>\u542F\u7528\u901A\u77E5\u63A8\u9001</span>
              </label>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label>Bot Token:</label>
              <input type="password" id="cfg-tg-token" value="${t}" placeholder="\u4F8B\u5982: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" autocomplete="off" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">\u7531 Telegram @BotFather \u521B\u5EFA\u673A\u5668\u4EBA\u540E\u83B7\u5F97\u7684 API Token \u51ED\u8BC1\u3002</p>
            </div>

            <div class="form-field">
              <label>Chat ID (\u76EE\u6807\u4F1A\u8BDD ID):</label>
              <input type="text" id="cfg-tg-chat-id" value="${n}" placeholder="\u7FA4\u7EC4\u52A1\u5FC5\u4EE5 -100 \u5F00\u5934\uFF0C\u4F8B\u5982: -1002147483648" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.6;">
                <div>\u{1F4A1} <strong>\u7FA4\u7EC4\u63A8\u9001\u6CE8\u610F\uFF1A</strong></div>
                <div>1. \u673A\u5668\u4EBA\u5FC5\u987B\u5148<strong>\u52A0\u5165\u8BE5 Telegram \u7FA4\u7EC4</strong>\u5E76\u8D4B\u4E88\u53D1\u8A00\u6743\u9650\uFF1B</div>
                <div>2. \u7FA4\u7EC4 Chat ID <strong>\u5FC5\u987B\u4EE5 <code>-100</code> \u5F00\u5934</strong>\uFF08\u4F8B\u5982 <code>-1002147483648</code>\uFF09\u3002\u82E5\u586B\u5199\u7EAF\u6B63\u6570\uFF08\u5982 <code>123456789</code>\uFF09\uFF0C\u6D88\u606F\u53EA\u4F1A\u53D1\u9001\u5230\u4E2A\u4EBA\u79C1\u804A\u800C\u4E0D\u4F1A\u53D1\u5230\u7FA4\u91CC\uFF01</div>
                <div>3. \u5FEB\u901F\u67E5\u7FA4 ID\uFF1A\u5C06 <code>@RawDataBot</code> \u6216 <code>@getmyid_bot</code> \u62C9\u5165\u7FA4\u5373\u53EF\u770B\u5230\u7FA4\u7EC4 <code>-100...</code> ID\u3002</div>
              </div>
            </div>
          </div>

          <!-- \u53F3\u680F: API \u7AEF\u70B9\u4E0E\u8FDE\u901A\u6027\u6D4B\u8BD5 -->
          <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-title); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>\u{1F310}</span>
              <span>API \u7AEF\u70B9\u4E0E\u8FDE\u901A\u6027\u6D4B\u8BD5</span>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label>Telegram API \u5730\u5740 (\u53CD\u4EE3 / \u81EA\u5EFA\u7AEF\u70B9):</label>
              <input type="text" id="cfg-tg-api-host" value="${a}" placeholder="\u9ED8\u8BA4: https://api.telegram.org" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">\u5982\u56E0\u7F51\u7EDC\u73AF\u5883\u65E0\u6CD5\u76F4\u8FDE\u5B98\u65B9 API\uFF0C\u53EF\u586B\u5199 Cloudflare Worker \u53CD\u5411\u4EE3\u7406\u7AEF\u70B9\u6216\u81EA\u5B9A\u4E49\u4E2D\u8F6C\u5730\u5740\u3002</p>
            </div>

            <div class="form-field" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border-color);">
              <label>\u8FDE\u901A\u6027\u4E0E\u63A8\u9001\u6D4B\u8BD5\u8BF4\u660E:</label>
              <p style="font-size: 11px; color: var(--text-muted); line-height: 1.6; margin: 0;">
                \u{1F4A1} \u586B\u5199\u5B8C Bot Token \u4E0E Chat ID \u540E\uFF0C\u53EF\u76F4\u63A5\u70B9\u51FB\u53F3\u4E0A\u89D2<strong>\u3010\u{1F9EA} \u6D4B\u8BD5\u63A8\u9001\u3011</strong>\u6309\u94AE\u5B9E\u65F6\u9A8C\u8BC1\u8FDE\u901A\u6027\uFF0C\u65E0\u9700\u9884\u5148\u4FDD\u5B58\u914D\u7F6E\u3002
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `}function $e(o,e,t,n,a,s=[],i=[],l=[],d=[],c=[],h=!0,u={}){let m=e||"sub";return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="cloudflare-insights-beacon" content="false">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\u26A1</text></svg>">
  <title>\u63A7\u5236\u53F0 - CF Workers \u8282\u70B9\u4E0E\u8BA2\u9605\u7BA1\u7406</title>
  <script>
    // \u62E6\u622A\u5E76\u963B\u65AD Cloudflare \u8FB9\u7F18\u81EA\u52A8\u6CE8\u5165\u7684 beacon \u6027\u80FD\u63A2\u9488\u811A\u672C\uFF0C\u9632\u6B62\u62A5\u9519
    (function() {
      // 1. \u5F7B\u5E95\u62E6\u622A\u52A8\u6001\u63D2\u5165\u7684 Cloudflare beacon / insights \u811A\u672C
      const isBeacon = (node) => node && node.tagName === 'SCRIPT' && (
        (node.src && (node.src.includes('cloudflareinsights.com') || node.src.includes('beacon.min.js'))) ||
        node.hasAttribute('data-cf-beacon')
      );
      const originalAppendChild = Node.prototype.appendChild;
      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.appendChild = function(child) {
        if (isBeacon(child)) return child;
        return originalAppendChild.apply(this, arguments);
      };
      Node.prototype.insertBefore = function(newNode, referenceNode) {
        if (isBeacon(newNode)) return newNode;
        return originalInsertBefore.apply(this, arguments);
      };

      // 2. \u589E\u5F3A performance API \u5BB9\u9519\u4FDD\u62A4\uFF0C\u9632\u6B62\u7B2C\u4E09\u65B9\u811A\u672C\u6216 DevTools \u8BFB\u53D6 startTime \u65F6\u62A5\u7A7A\u6307\u9488
      if (typeof window !== 'undefined' && window.performance) {
        const dummyEntry = {
          name: location.href,
          entryType: 'navigation',
          startTime: 0,
          duration: 0,
          responseStart: 0,
          responseEnd: 0,
          domInteractive: 0,
          domContentLoadedEventStart: 0,
          domContentLoadedEventEnd: 0,
          domComplete: 0,
          loadEventStart: 0,
          loadEventEnd: 0
        };
        if (typeof window.performance.getEntriesByType === 'function') {
          const rawGetEntries = window.performance.getEntriesByType.bind(window.performance);
          window.performance.getEntriesByType = function(type) {
            try {
              const res = rawGetEntries(type);
              if (Array.isArray(res) && res.length > 0) return res;
              return [{ ...dummyEntry, entryType: type }];
            } catch {
              return [{ ...dummyEntry, entryType: type }];
            }
          };
        }
        if (typeof window.performance.getEntriesByName === 'function') {
          const rawGetByName = window.performance.getEntriesByName.bind(window.performance);
          window.performance.getEntriesByName = function(name, type) {
            try {
              const res = rawGetByName(name, type);
              if (Array.isArray(res) && res.length > 0) return res;
              return [{ ...dummyEntry, name: name, entryType: type || 'resource' }];
            } catch {
              return [{ ...dummyEntry, name: name, entryType: type || 'resource' }];
            }
          };
        }
      }
    })();
  <\/script>
  <style>
    ${Se}
  </style>
</head>
<body>
  <!-- \u79FB\u52A8\u7AEF\u4FA7\u8FB9\u680F\u906E\u7F69\u80CC\u666F -->
  <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>

  <!-- \u5DE6\u4FA7\u5BFC\u822A\u83DC\u5355 (PC\u4FA7\u8FB9\u680F / \u79FB\u52A8\u7AEF\u6ED1\u51FA\u62BD\u5C49) -->
  <aside class="sidebar" id="app-sidebar">
    <div class="sidebar-header">
      <h2>\u26A1 \u8BA2\u9605\u63A7\u5236\u53F0</h2>
      <button class="sidebar-close-btn" onclick="toggleMobileSidebar(false)" aria-label="\u5173\u95ED\u83DC\u5355">&times;</button>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-title">\u4E1A\u52A1\u529F\u80FD</div>
      <a class="nav-item active" id="nav-item-custom-sub" onclick="switchTab('custom-sub')">
        <span class="nav-icon">\u{1F4E6}</span>
        <span>\u666E\u901A\u8BA2\u9605</span>
      </a>
      <a class="nav-item" id="nav-item-cf-sub" onclick="switchTab('cf-sub')">
        <span class="nav-icon">\u26A1</span>
        <span>CF \u4F18\u9009\u8BA2\u9605</span>
      </a>
      <a class="nav-item" id="nav-item-access-logs" onclick="switchTab('access-logs')">
        <span class="nav-icon">\u{1F4CA}</span>
        <span>\u8BBF\u95EE\u65E5\u5FD7</span>
      </a>

      <div class="nav-section-divider"></div>

      <div class="nav-section-title">
        <span>\u{1F310} \u5168\u5C40\u914D\u7F6E</span>
        <span class="nav-badge-pill" title="\u6B64\u5904\u7684\u914D\u7F6E\u5BF9\u5168\u7AD9\u6240\u6709\u8BA2\u9605\u7EDF\u4E00\u751F\u6548">\u5168\u7AD9\u751F\u6548</span>
      </div>
      <a class="nav-item" id="nav-item-security-config" onclick="switchTab('security-config')" title="\u914D\u7F6E\u5168\u5C40\u8BA2\u9605\u8DEF\u7531\u3001\u5B89\u5168Token\u3001\u56FD\u5BB6IP\u767D\u540D\u5355\u4E0E\u4EE3\u7406\u5BA2\u6237\u7AEF\u9650\u5236">
        <span class="nav-icon">\u{1F511}</span>
        <span style="flex: 1;">\u8BA2\u9605\u5B89\u5168\u914D\u7F6E</span>
        <span class="nav-badge-tag">\u5168\u5C40</span>
      </a>
      <a class="nav-item" id="nav-item-tg-config" onclick="switchTab('tg-config')" title="\u914D\u7F6E\u5168\u5C40 Telegram Bot \u8BA2\u9605\u8BBF\u95EE\u5B9E\u65F6\u63A8\u9001\u901A\u77E5">
        <span class="nav-icon">\u2708\uFE0F</span>
        <span style="flex: 1;">TG \u8BA2\u9605\u901A\u77E5</span>
        <span class="nav-badge-tag">\u5168\u5C40</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <a href="/logout" class="logout-btn">
        <span>\u{1F6AA}</span>
        <span>\u9000\u51FA\u767B\u5F55</span>
      </a>
    </div>
  </aside>

  <!-- \u53F3\u4FA7\u4E3B\u5DE5\u4F5C\u533A -->
  <main class="main-wrapper">
    <div class="topbar">
      <div style="display: flex; align-items: center; gap: 10px;">
        <button class="mobile-menu-btn" onclick="toggleMobileSidebar(true)" aria-label="\u6253\u5F00\u83DC\u5355">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="topbar-title" id="page-title">\u{1F4E6} \u666E\u901A\u8BA2\u9605\u7BA1\u7406</div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="badge-session" id="session-countdown-badge" title="10\u5206\u949F\u65E0\u64CD\u4F5C\u5C06\u81EA\u52A8\u767B\u51FA\uFF0C\u4EFB\u610F\u64CD\u4F5C\u81EA\u52A8\u7EED\u671F10\u5206\u949F">
          <span>\u23F1\uFE0F</span>
          <span id="session-countdown-text">10:00</span>
        </div>
        <div class="badge-status">
          <span class="status-dot"></span>
          <span>KV \u8FD0\u884C\u4E2D</span>
        </div>
      </div>
    </div>

    <div class="content-area">
      ${Ee(o,t,a)}
      ${Be(o,t,s,n)}
      ${Ae(i,l,d)}
      ${ze(m,t,c,h)}
      ${Le(u)}
    </div>
  </main>

  <!-- \u5168\u5C40\u81EA\u5B9A\u4E49\u901A\u77E5 Toast \u5BB9\u5668 -->
  <div class="toast-container" id="toast-container"></div>

  <!-- \u5168\u5C40\u81EA\u5B9A\u4E49\u786E\u8BA4/\u5220\u9664/\u8B66\u544A\u5BF9\u8BDD\u6846 -->
  <div class="dialog-overlay" id="app-dialog">
    <div class="dialog-box">
      <div class="dialog-header">
        <span class="dialog-icon" id="dialog-icon">\u26A0\uFE0F</span>
        <h4 class="dialog-title" id="dialog-title">\u786E\u8BA4\u64CD\u4F5C</h4>
      </div>
      <p class="dialog-message" id="dialog-message">\u60A8\u786E\u5B9A\u8981\u6267\u884C\u6B64\u64CD\u4F5C\u5417\uFF1F</p>
      <div class="dialog-actions">
        <button type="button" class="btn-action btn-secondary" id="dialog-btn-cancel">\u53D6\u6D88</button>
        <button type="button" class="btn-action btn-danger" id="dialog-btn-confirm">\u786E\u8BA4\u5220\u9664</button>
      </div>
    </div>
  </div>

  <!-- CF \u4F18\u9009\u8282\u70B9\u751F\u6210\u6D4B\u8BD5\u7ED3\u679C\u5F39\u7A97 -->
  <div class="dialog-overlay" id="test-result-dialog">
    <div class="dialog-box dialog-box-large">
      <div class="dialog-header">
        <span class="dialog-icon">\u{1F9EA}</span>
        <h4 class="dialog-title" id="test-result-title">\u4F18\u9009\u8282\u70B9\u751F\u6210\u6D4B\u8BD5\u7ED3\u679C</h4>
      </div>
      <p class="dialog-message" id="test-result-summary" style="margin-bottom: 12px;">\u5DF2\u6210\u529F\u6839\u636E\u6A21\u677F\u548C\u4F18\u9009\u6E90\u751F\u6210\u4EE5\u4E0B\u8282\u70B9\uFF1A</p>
      <div class="test-result-box" id="test-result-content"></div>
      <div class="dialog-actions" style="margin-top: 16px;">
        <button type="button" class="btn-action btn-secondary" onclick="closeTestResultDialog()">\u5173\u95ED</button>
        <button type="button" class="btn-action btn-primary" onclick="copyTestResultContent()">\u{1F4CB} \u590D\u5236\u5168\u90E8\u751F\u6210\u8282\u70B9</button>
      </div>
    </div>
  </div>

  <!-- \u9875\u9762 JSON \u6570\u636E\u8F7D\u8377 -->
  <script type="application/json" id="data-plain-groups">${JSON.stringify(a).replace(/</g,"\\u003c")}<\/script>
  <script type="application/json" id="data-cf-groups">${JSON.stringify(s).replace(/</g,"\\u003c")}<\/script>
  <script type="application/json" id="data-sources">${JSON.stringify(n).replace(/</g,"\\u003c")}<\/script>
  <script type="application/json" id="data-blocked-ips">${JSON.stringify(l).replace(/</g,"\\u003c")}<\/script>
  <script type="application/json" id="data-whitelist-ips">${JSON.stringify(d).replace(/</g,"\\u003c")}<\/script>

  <script>
    ${Pe}
  <\/script>
</body>
</html>`}var vt=new Map;function Qe(o){let e=Date.now(),t=vt.get(o);if(!t||e>t.resetAt){if(t={count:1,resetAt:e+6e4},vt.set(o,t),vt.size>2e3)for(let[n,a]of vt.entries())e>a.resetAt&&vt.delete(n);return{allowed:!0,count:1}}return t.count+=1,t.count>100?{allowed:!1,banned:!0,count:t.count}:t.count>30?{allowed:!1,banned:!1,count:t.count}:{allowed:!0,count:t.count}}function Ze(o){let e="";try{e=decodeURIComponent(o.pathname+o.search).toLowerCase()}catch{e=(o.pathname+o.search).toLowerCase()}let t=[{name:"\u654F\u611F\u6269\u5C55\u540D\u626B\u63CF",regex:/\.(php\d?|asp|aspx|jsp|jspx|cgi|sh|bash|sql|bak|swp|zip|tar|gz|rar|7z)(\?|$)/i},{name:"\u5178\u578B\u63A2\u6D4B\u8DEF\u5F84",regex:/(^|\/)(wp-admin|wp-login|wp-content|wordpress|phpmyadmin|pma|adminer|actuator|swagger|api-docs|solr|struts)(\/|$)/i},{name:"\u654F\u611F\u914D\u7F6E\u6587\u4EF6\u626B\u63CF",regex:/(^|\/)(\.env|\.git|\.svn|\.docker|\.aws|\.ssh|\.htaccess|\.config)(\/|$)/i},{name:"\u6CE8\u5165\u7279\u5F81",regex:/(union\s+select|select\s+.*from|exec\s*\(|eval\s*\(|base64_decode|system\s*\(|cmd\.exe|\/bin\/(ba)?sh)/i},{name:"XSS \u8DE8\u7AD9\u7279\u5F81",regex:/(<script|javascript:|alert\(|document\.cookie)/i},{name:"\u8DEF\u5F84\u7A7F\u8D8A\u7279\u5F81",regex:/(\.\.\/|\.\.\\)/}];for(let n of t)if(n.regex.test(e))return n.name;return null}var kt=new Map;function to(o){let e=Date.now(),t=kt.get(o);if(!t||e-t.lastLoggedAt>3e5){let n=t?t.blockedCount:1;if(kt.set(o,{lastLoggedAt:e,blockedCount:1}),kt.size>2e3)for(let[a,s]of kt.entries())e-s.lastLoggedAt>6e5&&kt.delete(a);return{shouldLog:!0,count:n}}return t.blockedCount+=1,{shouldLog:!1,count:t.blockedCount}}var eo=["clash","mihomo","meta","stash","shadowrocket","quantumult","surge","loon","sing-box","singbox","v2ray","v2rayn","v2rayng","v2rayu","v2rayx","xray","nekoray","nekobox","matsuri","hiddify","egern","passwall","openwrt","surfboard","flclash","karing","potatso","pharos","subconverter","leaf","trojan"];function Vt({request:o,userAgent:e,isAuthed:t,isWhitelisted:n,groupAllowedCountries:a,globalAllowedCountries:s,proxyClientOnly:i}){if(t||n)return{allowed:!0};if(i){let d=(e||"").toLowerCase();if(!(d?eo.some(h=>d.includes(h)):!1))return{allowed:!1,status:403,reason:"\u975E\u4EE3\u7406\u5BA2\u6237\u7AEF\u62E6\u622A",message:"403 Forbidden"}}let l=Array.isArray(a)&&a.length>0?a:s;if(Array.isArray(l)&&l.length>0){let d=o.cf?(o.cf.country||"").toUpperCase():"";if(!d||!l.includes(d))return{allowed:!1,status:403,reason:`\u56FD\u5BB6\u5730\u533A\u53D7\u9650 [${d||"\u672A\u77E5\u5730\u533A"}]`,message:"403 Forbidden"}}return{allowed:!0}}function W(o){return o?String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}function Ft(o,e,t,n){if(!e||!e.enabled||!e.token||!e.chatId)return;let{subType:a,subName:s,ip:i,location:l,ua:d,time:c,viewsInfo:h}=t,u=`\u{1F4E2} <b>\u8BA2\u9605\u62C9\u53D6\u901A\u77E5</b>

\u{1F4CC} <b>\u8BA2\u9605\u7C7B\u578B:</b> ${W(a)}
`+(s?`\u{1F3F7}\uFE0F <b>\u8BA2\u9605\u540D\u79F0:</b> ${W(s)}
`:"")+`\u{1F310} <b>\u5BA2\u6237\u7AEF IP:</b> <code>${W(i)}</code>
\u{1F4CD} <b>\u5730\u7406\u4F4D\u7F6E:</b> ${W(l||"\u672A\u77E5")}
`+(h?`\u{1F4CA} <b>\u8BBF\u95EE\u7EDF\u8BA1:</b> ${W(h)}
`:"")+`\u23F0 <b>\u62C9\u53D6\u65F6\u95F4:</b> ${W(c)}
\u{1F4F1} <b>User-Agent:</b> <code>${W(d||"\u672A\u77E5")}</code>`,m=Dt(o,u,e);n&&n.waitUntil?n.waitUntil(m):m.catch(y=>console.error("[TG Notify Error]:",y))}var Bo={async fetch(o,e,t){try{let Ht=function(r){try{let p=new URL(r);if(p.protocol!=="http:"&&p.protocol!=="https:")return!1;let f=p.hostname.toLowerCase();return!(f==="localhost"||f==="0.0.0.0"||f==="::1"||f==="[::1]"||f.startsWith("127.")||f.startsWith("10.")||f.startsWith("192.168.")||f.startsWith("169.254.")||/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(f)||f.startsWith("fc")||f.startsWith("fd")||f.startsWith("fe80:"))}catch{return!1}},n=new URL(o.url),a=(e.ADMIN||"").trim(),s=a?await Xt(a):"",i=!!(e.KV&&typeof e.KV.get=="function"),l=!!a;if(n.pathname==="/favicon.ico"||n.pathname.startsWith("/favicon")||n.pathname.startsWith("/apple-touch-icon")||n.pathname==="/site.webmanifest"||n.pathname==="/browserconfig.xml")return new Response(null,{status:204});if(n.pathname==="/robots.txt")return new Response(`User-agent: *
Disallow: /
`,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8"}});let d=o.headers.get("x-forwarded-for")||"",c=o.headers.get("CF-Connecting-IP")||(d?d.split(",")[0].trim():"")||"127.0.0.1",h=o.cf?`${o.cf.country||"Global"} ${o.cf.city||""}`.trim():"Local",u=o.headers.get("User-Agent")||"",m=new Date().toLocaleString("zh-CN",{timeZone:"Asia/Shanghai",hour12:!1}),w=n.protocol==="https:"?"; Secure":"",T=qt(o,"auth_session"),g=await ue(e,T,s,a),I=()=>ye(e,k,z),R=(r,p)=>xe(r,p,e,k,L),X=()=>pe(e,s);async function et(r){if(!g||!a)return r;try{let p=await X(),f=new Headers(r.headers);return f.set("Set-Cookie",`auth_session=${p}; Path=/; HttpOnly${w}; SameSite=Lax; Max-Age=600`),new Response(r.body,{status:r.status,statusText:r.statusText,headers:f})}catch{return r}}let[q,N]=await Promise.all([Ut(e),ft(e)]),_=st(c,q),Tt=st(c,N);if(!_&&Tt){let r=to(c);if(r.shouldLog){let p=r.count>1?`\u{1F6AB} IP\u62E6\u622A\u62D2\u7EDD (\u8FD15\u5206\u949F\u7D2F\u8BA1\u62E6\u622A ${r.count} \u6B21)`:"\u{1F6AB} IP\u62E6\u622A\u62D2\u7EDD",f=$(e,{time:m,ip:c,location:h,status:403,path:n.pathname,type:p,ua:u});t&&t.waitUntil?t.waitUntil(f):await f}return new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}if(!_){let r=Ze(n);if(r){st(c,N)||(N.push(c),await tt(e,N));let f=$(e,{time:m,ip:c,location:h,status:403,path:n.pathname,type:`\u{1F6AB} \u89E6\u53D1 WAF \u5A01\u80C1\u6307\u7EB9\u963B\u65AD [${r}] (${n.pathname})\uFF0CIP \u5DF2\u88AB\u6C38\u4E45\u5C01\u7981`,ua:u});return t&&t.waitUntil?t.waitUntil(f):await f,new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let p=Qe(c);if(!p.allowed)if(p.banned){st(c,N)||(N.push(c),await tt(e,N));let f=$(e,{time:m,ip:c,location:h,status:403,path:n.pathname,type:`\u{1F6AB} \u89E6\u53D1 CC \u5237\u9891\u6076\u610F\u653B\u51FB (${p.count} \u6B21/\u5206)\uFF0CIP \u5DF2\u88AB\u6C38\u4E45\u5C01\u7981`,ua:u});return t&&t.waitUntil?t.waitUntil(f):await f,new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}else{let f=$(e,{time:m,ip:c,location:h,status:429,path:n.pathname,type:`\u26A0\uFE0F \u89E6\u53D1\u9AD8\u9891\u9650\u6D41\u4FDD\u62A4 (${p.count} \u6B21/\u5206)`,ua:u});return t&&t.waitUntil?t.waitUntil(f):await f,new Response("429 Too Many Requests",{status:429,headers:{"Content-Type":"text/plain; charset=utf-8","Retry-After":"60"}})}}async function mt(r){let p=await fe(e,c);if(p>=3&&!_){st(c,N)||(N.push(c),await tt(e,N));let x=$(e,{time:m,ip:c,location:h,status:403,path:n.pathname,type:`\u{1F6AB} \u8BA2\u9605\u4EE4\u724C\u66B4\u529B\u7834\u89E3\u5C1D\u8BD5\u8FDE\u7EED\u8FBE 3 \u6B21 (${r})\uFF0CIP \u5DF2\u88AB\u6C38\u4E45\u5C01\u7981`,ua:u});return t&&t.waitUntil?t.waitUntil(x):await x,new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let f=Math.max(0,3-p),b=$(e,{time:m,ip:c,location:h,status:401,path:n.pathname,type:`\u{1F512} ${r}\u9274\u6743\u672A\u901A\u8FC7 (\u7B2C ${p} \u6B21\u5931\u8D25${_?"\uFF0C\u767D\u540D\u5355\u8C41\u514D":`\uFF0C\u5269\u4F59 ${f} \u6B21\u5C06\u88AB\u6C38\u4E45\u5C01\u7981`})`,ua:u});return t&&t.waitUntil?t.waitUntil(b):await b,new Response("401 Unauthorized",{status:401,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let[G,Q,D,H,ot,V,nt,rt,it]=await Promise.all([Zt(e),Qt(e),te(e),ee(e),oe(e),ne(e),ae(e),re(e),Ot(e)]),J=n.pathname.replace(/^\/+|\/+$/g,""),B=D.find(r=>r.id.toLowerCase()===J.toLowerCase());if(B){let r=Vt({request:o,userAgent:u,isAuthed:g,isWhitelisted:_,groupAllowedCountries:B.allowedCountries,globalAllowedCountries:nt,proxyClientOnly:rt});if(!r.allowed){let U=$(e,{time:m,ip:c,location:h,status:r.status,path:n.pathname,type:`\u{1F6AB} \u666E\u901A\u8BA2\u9605\u62E6\u622A [${r.reason}]`,ua:u});return t&&t.waitUntil?t.waitUntil(U):await U,new Response(r.message,{status:r.status,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let p=n.searchParams.get("token")||n.searchParams.get("pwd")||"",f=V||a;if(f&&!g&&p!==f)return mt("\u666E\u901A\u8BA2\u9605");let b=Pt(e,c);t&&t.waitUntil?t.waitUntil(b):await b;let x=B.maxViews!==void 0&&B.maxViews!==null&&B.maxViews>0?B.maxViews:0,E=(B.views||0)+1;if(x>0&&E>=x){let U=D.filter(ht=>ht.id.toLowerCase()!==B.id.toLowerCase()),ct=pt(e,U);t&&t.waitUntil?t.waitUntil(ct):await ct}else{B.views=E;let U=pt(e,D);t&&t.waitUntil?t.waitUntil(U):await U}let M=$(e,{time:m,ip:c,location:h,status:200,path:n.pathname,type:`\u666E\u901A\u8BA2\u9605 [${B.name||B.id}]`,ua:u});t&&t.waitUntil?t.waitUntil(M):await M,Ft(e,it,{subType:"\u72EC\u7ACB\u666E\u901A\u8BA2\u9605",subName:B.name||B.id,ip:c,location:h,ua:u,time:m,viewsInfo:x>0?`${E} / ${x} \u6B21 (\u9605\u540E\u5373\u711A)`:`${E} \u6B21`},t);let F=n.searchParams.get("format")||"base64",O=yt(B.nodes);if(O.length===0)return new Response("404 Not Found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});let j=O.join(`
`),S=F==="raw"?j:dt(j);return new Response(S,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",Pragma:"no-cache","Access-Control-Allow-Origin":"*","Subscription-Userinfo":"upload=0; download=0; total=1073741824000; expire=0","Profile-Update-Interval":"24"}})}let P=H.find(r=>r.id.toLowerCase()===J.toLowerCase());if(P){let r=Vt({request:o,userAgent:u,isAuthed:g,isWhitelisted:_,groupAllowedCountries:P.allowedCountries,globalAllowedCountries:nt,proxyClientOnly:rt});if(!r.allowed){let S=$(e,{time:m,ip:c,location:h,status:r.status,path:n.pathname,type:`\u{1F6AB} CF\u4F18\u9009\u8BA2\u9605\u62E6\u622A [${r.reason}]`,ua:u});return t&&t.waitUntil?t.waitUntil(S):await S,new Response(r.message,{status:r.status,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let p=n.searchParams.get("token")||n.searchParams.get("pwd")||"",f=V||a;if(f&&!g&&p!==f)return mt("CF\u4F18\u9009\u8BA2\u9605");let b=Pt(e,c);t&&t.waitUntil?t.waitUntil(b):await b;let x=P.maxViews!==void 0&&P.maxViews!==null&&P.maxViews>0?P.maxViews:0,E=(P.views||0)+1;if(x>0&&E>=x){let S=H.filter(ct=>ct.id.toLowerCase()!==P.id.toLowerCase()),U=ut(e,S);t&&t.waitUntil?t.waitUntil(U):await U}else{P.views=E;let S=ut(e,H);t&&t.waitUntil?t.waitUntil(S):await S}let M=$(e,{time:m,ip:c,location:h,status:200,path:n.pathname,type:`CF\u4F18\u9009\u8BA2\u9605 [${P.name||P.id}]`,ua:u});t&&t.waitUntil?t.waitUntil(M):await M,Ft(e,it,{subType:"\u72EC\u7ACB CF \u4F18\u9009\u8BA2\u9605",subName:P.name||P.id,ip:c,location:h,ua:u,time:m,viewsInfo:x>0?`${E} / ${x} \u6B21 (\u9605\u540E\u5373\u711A)`:`${E} \u6B21`},t);let F=n.searchParams.get("format")||"base64",O=P.baseVless&&P.baseVless.trim()?P.baseVless.trim():Q,j=G;if(Array.isArray(P.sources)&&P.sources.length>0){let S=P.sources.map(U=>U.toLowerCase());j=G.filter(U=>S.includes(U.id.toLowerCase())),j.length===0&&(j=G)}return await Bt(O,j,F)}if(J===ot){let r=Vt({request:o,userAgent:u,isAuthed:g,isWhitelisted:_,groupAllowedCountries:null,globalAllowedCountries:nt,proxyClientOnly:rt});if(!r.allowed){let E=$(e,{time:m,ip:c,location:h,status:r.status,path:n.pathname,type:`\u{1F6AB} \u5168\u5C40\u805A\u5408\u8BA2\u9605\u62E6\u622A [${r.reason}]`,ua:u});return t&&t.waitUntil?t.waitUntil(E):await E,new Response(r.message,{status:r.status,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let p=n.searchParams.get("token")||n.searchParams.get("pwd")||"",f=V||a;if(f&&!g&&p!==f)return mt("\u5168\u5C40\u805A\u5408\u8BA2\u9605");let b=Pt(e,c);t&&t.waitUntil?t.waitUntil(b):await b;let x=$(e,{time:m,ip:c,location:h,status:200,path:n.pathname,type:"\u5168\u5C40\u805A\u5408\u8BA2\u9605\u62C9\u53D6",ua:u});return t&&t.waitUntil?t.waitUntil(x):await x,Ft(e,it,{subType:"\u5168\u5C40\u805A\u5408\u8BA2\u9605",subName:"\u5168\u90E8\u8282\u70B9\u805A\u5408",ip:c,location:h,ua:u,time:m,viewsInfo:null},t),Ce(o,e,G,Q,D)}if(n.pathname.startsWith("/api/")&&n.pathname!=="/api/captcha"){if(!g){if(!_){let p=await ft(e);p.includes(c)||(p.push(c),await tt(e,p))}let r=$(e,{time:m,ip:c,location:h,status:403,path:n.pathname,type:"\u{1F6AB} \u672A\u7ECF\u767B\u5F55\u8D8A\u6743\u63A2\u6D4BAPI\uFF0CIP \u5DF2\u88AB\u6C38\u4E45\u5C01\u7981",ua:u});return t&&t.waitUntil?t.waitUntil(r):await r,new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}if(!i||!l)return new Response(JSON.stringify({success:!1,error:"\u7CFB\u7EDF\u5C1A\u672A\u5B8C\u6210\u521D\u59CB\u5316\u914D\u7F6E"}),{status:500,headers:{"Content-Type":"application/json; charset=utf-8"}})}async function v(r,p=200){let f=typeof r=="string"?r:JSON.stringify(r);return et(new Response(f,{status:p,headers:{"Content-Type":"application/json; charset=utf-8"}}))}if(n.pathname==="/api/session-ping"&&o.method==="POST")return g?v({success:!0}):new Response("Unauthorized",{status:401});if(n.pathname==="/api/security-config"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json();return await $t(e,r.subPath||"sub"),await Nt(e,r.token||""),r.allowedCountries!==void 0&&await se(e,r.allowedCountries),r.proxyClientOnly!==void 0&&await ie(e,r.proxyClientOnly),v({success:!0})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname==="/api/tg-config"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json();return await he(e,{enabled:!!r.enabled,token:(r.token||"").trim(),chatId:(r.chatId||"").trim(),apiHost:(r.apiHost||"").trim()||"https://api.telegram.org"}),v({success:!0})}catch(r){return v({error:r.message||"Invalid JSON payload"},400)}}if(n.pathname==="/api/test-tg-notify"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p={enabled:!0,force:!0,token:(r.token||"").trim(),chatId:(r.chatId||"").trim(),apiHost:(r.apiHost||"").trim()||"https://api.telegram.org"};if(!p.token||!p.chatId)return v({error:"Bot Token \u548C Chat ID \u4E0D\u80FD\u4E3A\u7A7A"},400);let f=`\u{1F389} <b>Telegram \u8BA2\u9605\u901A\u77E5\u8FDE\u901A\u6027\u6D4B\u8BD5\u6210\u529F\uFF01</b>

\u{1F4E1} <b>\u63A8\u9001\u670D\u52A1:</b> CF Workers \u8BA2\u9605\u901A\u77E5\u5F15\u64CE
\u{1F310} <b>\u53D1\u8D77 IP:</b> <code>${W(c)}</code>
\u{1F4CD} <b>\u53D1\u8D77\u4F4D\u7F6E:</b> ${W(h)}
\u23F0 <b>\u6D4B\u8BD5\u65F6\u95F4:</b> ${W(m)}
\u{1F4AC} <b>Chat ID:</b> <code>${W(p.chatId)}</code>

\u2705 \u673A\u5668\u4EBA\u914D\u7F6E\u6B63\u786E\uFF0C\u5F53\u6709\u5BA2\u6237\u7AEF\u62C9\u53D6\u8282\u70B9\u8BA2\u9605\u65F6\uFF0C\u5C06\u4F1A\u5728\u6B64\u5904\u5B9E\u65F6\u6536\u5230\u63A8\u9001\uFF01`,b=await Dt(e,f,p);return v(b,b.success?200:400)}catch(r){return v({error:r.message},500)}}let jt=["api","login","logout","favicon.ico","robots.txt","sub","assets","static","dashboard"];if(n.pathname==="/api/custom-groups"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=(r.id||"").toLowerCase().trim()||crypto.randomUUID().replace(/-/g,""),f=(r.name||"").trim();if(!f)return v({error:"\u8BA2\u9605\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A"},400);if(jt.includes(p)||p===ot.toLowerCase())return v({error:"\u6B64\u8BA2\u9605 ID \u4E3A\u7CFB\u7EDF\u4FDD\u7559\u5173\u952E\u5B57\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u540D\u79F0"},400);let b=D.find(S=>S.id.toLowerCase()===p),x=D.filter(S=>S.id.toLowerCase()!==p),E=typeof r.maxViews=="number"?r.maxViews:parseInt(r.maxViews,10),M=!isNaN(E)&&E>0?Math.min(999,Math.max(0,E)):0,F=0;b&&b.maxViews===M?F=b.views||0:F=0;let O=yt(r.nodes||"").join(`
`),j=Array.isArray(r.allowedCountries)?r.allowedCountries.map(S=>String(S).trim().toUpperCase()).filter(Boolean):typeof r.allowedCountries=="string"?r.allowedCountries.split(",").map(S=>S.trim().toUpperCase()).filter(Boolean):[];return x.push({id:p,name:f,maxViews:M,views:F,nodes:O,allowedCountries:j}),await pt(e,x),v({success:!0})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname==="/api/custom-groups/batch-delete"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=(Array.isArray(r.ids)?r.ids:[]).map(b=>String(b).toLowerCase().trim()),f=D.filter(b=>!p.includes(b.id.toLowerCase()));return await pt(e,f),v({success:!0,count:p.length})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname.startsWith("/api/custom-groups/")&&o.method==="DELETE"){if(!g)return new Response("Unauthorized",{status:401});let r=decodeURIComponent(n.pathname.replace("/api/custom-groups/","")).toLowerCase(),p=D.filter(f=>f.id!==r);return await pt(e,p),v({success:!0})}if(n.pathname==="/api/cf-groups"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json();if(!r.id||!r.name)return v({error:"\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5"},400);let p=r.id.toLowerCase().trim();if(jt.includes(p)||p===ot.toLowerCase())return v({error:"\u6B64\u8BA2\u9605 ID \u4E3A\u7CFB\u7EDF\u4FDD\u7559\u5173\u952E\u5B57\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u540D\u79F0"},400);let f=H.find(O=>O.id===p),b=H.filter(O=>O.id!==p),x=typeof r.maxViews=="number"?r.maxViews:parseInt(r.maxViews,10),E=!isNaN(x)&&x>0?Math.min(999,Math.max(0,x)):0,M=0;f&&f.maxViews===E?M=f.views||0:M=0;let F=Array.isArray(r.allowedCountries)?r.allowedCountries.map(O=>String(O).trim().toUpperCase()).filter(Boolean):typeof r.allowedCountries=="string"?r.allowedCountries.split(",").map(O=>O.trim().toUpperCase()).filter(Boolean):[];return b.push({id:p,name:r.name,maxViews:E,views:M,baseVless:r.baseVless||"",sources:Array.isArray(r.sources)?r.sources:[],allowedCountries:F}),await ut(e,b),v({success:!0})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname==="/api/cf-groups/batch-delete"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=(Array.isArray(r.ids)?r.ids:[]).map(b=>String(b).toLowerCase().trim()),f=H.filter(b=>!p.includes(b.id.toLowerCase()));return await ut(e,f),v({success:!0,count:p.length})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname.startsWith("/api/cf-groups/")&&o.method==="DELETE"){if(!g)return new Response("Unauthorized",{status:401});let r=decodeURIComponent(n.pathname.replace("/api/cf-groups/","")).toLowerCase(),p=H.filter(f=>f.id!==r);return await ut(e,p),v({success:!0})}if(n.pathname==="/api/sources"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json();if(r.sources&&Array.isArray(r.sources)){let f=r.sources.filter(b=>b&&b.url&&Ht(b.url.trim())).map((b,x)=>({id:(b.id||"src_"+(x+1)).toLowerCase().trim(),name:b.name||"\u4F18\u9009\u6E90 "+(x+1),url:b.url.trim(),enabled:b.enabled!==!1}));return await Ct(e,f),v({success:!0,count:f.length})}if(!r.id||!r.name||!r.url)return v({error:"\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5"},400);if(!Ht(r.url.trim()))return v({error:"\u4F18\u9009\u6E90\u5730\u5740\u5FC5\u987B\u4E3A\u5408\u6CD5\u7684\u516C\u5171 HTTP/HTTPS \u5730\u5740\uFF0C\u7981\u6B62\u79C1\u6709\u7F51\u7EDC\u5730\u5740"},400);let p=G.filter(f=>f.id!==r.id.toLowerCase().trim());return p.push({id:r.id.toLowerCase().trim(),name:r.name,url:r.url.trim(),enabled:!0}),await Ct(e,p),v({success:!0})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname.startsWith("/api/sources/")&&o.method==="DELETE"){if(!g)return new Response("Unauthorized",{status:401});let r=decodeURIComponent(n.pathname.replace("/api/sources/","")).toLowerCase(),p=G.filter(f=>f.id!==r);return await Ct(e,p),v({success:!0})}if(n.pathname==="/api/test-cf-nodes"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=r.baseVless||Q||e.BASE_VLESS||"",f=G;Array.isArray(r.sources)&&r.sources.length>0&&(f=r.sources);let b=await Bt(p,f,"raw"),x=await b.text();return v({success:b.ok,status:b.status,content:x},b.status)}catch(r){return v({success:!1,content:"\u751F\u6210\u6D4B\u8BD5\u8282\u70B9\u5931\u8D25: "+(r.message||String(r))},500)}}if(n.pathname==="/api/blocked-ips"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=Array.isArray(r.ips)?r.ips.map(x=>String(x).trim()).filter(Boolean):[],b=(await ft(e)).filter(x=>!p.includes(x));for(let x of b)await _t(e,x);return await tt(e,p),v({success:!0,count:p.length})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname==="/api/whitelist-ips"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=Array.isArray(r.ips)?r.ips.map(f=>String(f).trim()).filter(Boolean):[];return await Rt(e,p),v({success:!0,count:p.length})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname==="/api/logs/batch-delete"&&o.method==="POST"){if(!g)return new Response("Unauthorized",{status:401});try{let r=await o.json(),p=(Array.isArray(r.indices)?r.indices:[]).map(Number),b=(await It(e)).filter((x,E)=>x&&!p.includes(E));return await ce(e,b),v({success:!0,count:p.length})}catch{return v({error:"Invalid JSON payload"},400)}}if(n.pathname==="/api/clear-logs"&&o.method==="POST")return g?(await le(e),v({success:!0})):new Response("Unauthorized",{status:401});if(n.pathname==="/api/captcha"){let{svgDataUri:r,captchaToken:p}=await I();return new Response(JSON.stringify({svg:r,token:p}),{headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}})}if(n.pathname==="/login"&&o.method==="POST"){if(!i||!l)return new Response(zt({hasKV:i,hasAdmin:l}),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}});try{let r=await St(e,c);if(!_&&r.lockSeconds>0){let{svgDataUri:K,captchaToken:lt}=await I();return new Response(At("\u64CD\u4F5C\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002",K,lt,r.lockSeconds),{status:429,headers:{"Content-Type":"text/html; charset=utf-8"}})}let p=await o.formData(),f=p.get("password")||"",b=p.get("captcha")||"",x=p.get("captcha_token")||"",M=n.protocol==="https:"?"; Secure":"",F=await R(b,x);if(F&&(a&&f===a)){await _t(e,c);let K=await Ut(e);st(c,K)||(K.push(c),await Rt(e,K));let lt=await X();return new Response(null,{status:302,headers:{Location:"/","Set-Cookie":`auth_session=${lt}; Path=/; HttpOnly${M}; SameSite=Lax; Max-Age=600`}})}let j=await de(e,c),S=j.count,U=j.lockSeconds,ct=Math.ceil(U/60),ht="",Lt="";if(F?(ht="\u7BA1\u7406\u5458\u5BC6\u7801\u9519\u8BEF",Lt="\u26A0\uFE0F \u7BA1\u7406\u5458\u5BC6\u7801\u9519\u8BEF"):(ht="\u9A8C\u8BC1\u7801\u9519\u8BEF\u6216\u5DF2\u5931\u6548",Lt="\u26A0\uFE0F \u9A8C\u8BC1\u7801\u9519\u8BEF"),S>=3&&!_){let K=await ft(e);K.includes(c)||(K.push(c),await tt(e,K));let lt=$(e,{time:m,ip:c,location:h,status:403,path:"/login",type:`\u{1F6AB} \u8FDE\u7EED\u767B\u5F55\u5931\u8D25\u8FBE3\u6B21 (${ht})\uFF0CIP \u5DF2\u88AB\u6C38\u4E45\u5C01\u7981`,ua:u});return t&&t.waitUntil?t.waitUntil(lt):await lt,new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let Ne=Math.max(0,3-S),Gt=$(e,{time:m,ip:c,location:h,status:401,path:"/login",type:`${Lt} (\u7B2C ${S} \u6B21\u5931\u8D25\uFF0C\u51B7\u5374\u9501\u5B9A ${ct} \u5206\u949F${_?"\uFF0C\u767D\u540D\u5355\u8C41\u514D\u5C01\u7981":`\uFF0C\u5269\u4F59 ${Ne} \u6B21\u5C06\u88AB\u6C38\u4E45\u5C01\u7981`})`,ua:u});t&&t.waitUntil?t.waitUntil(Gt):await Gt;let{svgDataUri:Ue,captchaToken:Re}=await I(),_e="\u9A8C\u8BC1\u7801\u6216\u5BC6\u7801\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002";return new Response(At(_e,Ue,Re,_?0:U),{status:401,headers:{"Content-Type":"text/html; charset=utf-8"}})}catch{return new Response("Bad Request",{status:400})}}if(n.pathname==="/logout"){let p=n.protocol==="https:"?"; Secure":"";return new Response(null,{status:302,headers:{Location:"/login","Set-Cookie":`auth_session=; Path=/; HttpOnly${p}; SameSite=Lax; Max-Age=0`}})}if(n.pathname==="/login"){if(!i||!l)return new Response(zt({hasKV:i,hasAdmin:l}),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}});if(g)return new Response(null,{status:302,headers:{Location:"/"}});let{svgDataUri:r,captchaToken:p}=await I(),f=await St(e,c),b=_?0:f.lockSeconds,x=b>0?`\u26A0\uFE0F \u5F53\u524D IP \u5904\u4E8E\u51B7\u5374\u9501\u5B9A\u72B6\u6001\uFF08\u5269\u4F59 ${b} \u79D2\uFF09\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002`:"";return new Response(At(x,r,p,b),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}})}if(n.pathname==="/"){if(!i||!l)return new Response(zt({hasKV:i,hasAdmin:l}),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}});if(!g)return new Response(null,{status:302,headers:{Location:"/login"}});let r=await It(e),p=$e(n.origin,ot,V,G,D,H,r,N,q,nt,rt,it);return et(new Response(p,{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}}))}if(!_){let r=await ft(e);r.includes(c)||(r.push(c),await tt(e,r));let p=$(e,{time:m,ip:c,location:h,status:403,path:n.pathname,type:`\u{1F6AB} \u6076\u610F\u63A2\u6D4B\u4E0D\u5B58\u5728\u8DEF\u5F84 [${n.pathname}]\uFF0CIP \u5DF2\u88AB\u81EA\u52A8\u5C01\u7981`,ua:u});return t&&t.waitUntil?t.waitUntil(p):await p,new Response("403 Forbidden",{status:403,headers:{"Content-Type":"text/plain; charset=utf-8"}})}let Wt=$(e,{time:m,ip:c,location:h,status:404,path:n.pathname,type:`\u26A0\uFE0F \u8BBF\u95EE\u4E0D\u5B58\u5728\u9875\u9762 [${n.pathname}] (\u767D\u540D\u5355\u8C41\u514D)`,ua:u});return t&&t.waitUntil?t.waitUntil(Wt):await Wt,new Response("404 Not Found",{status:404})}catch(n){return console.error("Unhandled Worker Exception:",n),new Response(`500 Internal Server Error: ${n.message||String(n)}`,{status:500,headers:{"Content-Type":"text/plain; charset=utf-8"}})}}};export{Bo as default};
