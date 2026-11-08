const encoder = new TextEncoder();
const ADMIN_PASSWORD_HASH = 'a49aeccaf24bf4a5a5cca70fd379bfe3a34ba7e1457cb5e612538efad5b2738a';

async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function isAdmin(request, env) {
  const token = request.headers.get('Cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || Number(expires) < Date.now()) return false;
  return signature === await sign(expires, ADMIN_PASSWORD_HASH);
}

const adminPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin · Portfolio enquiries</title><style>body{margin:0;background:#f5f6f1;color:#17251f;font:16px Arial,sans-serif}main{max-width:1000px;margin:60px auto;padding:0 24px}h1{font-size:42px}form{display:flex;gap:12px;margin:24px 0}input,button{padding:13px 15px;border:1px solid #ccd5cc;border-radius:8px;font:inherit}button{background:#17251f;color:#fff;cursor:pointer}.error{color:#a33}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;background:#fff}th,td{text-align:left;padding:14px;border-bottom:1px solid #e1e6e1;vertical-align:top}th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#597063}#app{display:none}</style></head><body><main><section id="login"><h1>Portfolio enquiries</h1><p>Admin access</p><form id="login-form"><input id="password" type="password" placeholder="Password" required><button>Sign in</button></form><p class="error" id="error"></p></section><section id="app"><h1>Portfolio enquiries</h1><p id="count"></p><div class="table-wrap"><table><thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Type</th><th>Requirement</th></tr></thead><tbody id="rows"></tbody></table></div></section></main><script>const login=document.querySelector('#login'),app=document.querySelector('#app'),error=document.querySelector('#error'),rows=document.querySelector('#rows'),count=document.querySelector('#count');async function load(){const r=await fetch('/api/admin/inquiries');if(!r.ok){login.style.display='block';return}const data=await r.json();login.style.display='none';app.style.display='block';count.textContent=data.length+' entr'+(data.length===1?'y':'ies');rows.innerHTML=data.map(x=>'<tr><td>'+ (x.created_at||'') +'</td><td>'+ (x.name||'') +'</td><td>'+ (x.phone||'') +'</td><td>'+ (x.inquiry_type||'') +'</td><td>'+ (x.message||'') +'</td></tr>').join('')}document.querySelector('#login-form').addEventListener('submit',async e=>{e.preventDefault();const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('#password').value})});if(r.ok)load();else error.textContent='Incorrect password.'});load();</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/admin') return new Response(adminPage, { headers: { 'content-type': 'text/html;charset=UTF-8' } });
    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
      const { password } = await request.json().catch(() => ({}));
      if (await hash(String(password || '')) !== ADMIN_PASSWORD_HASH) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const expires = String(Date.now() + 8 * 60 * 60 * 1000);
      const signature = await sign(expires, ADMIN_PASSWORD_HASH);
      return Response.json({ ok: true }, { headers: { 'Set-Cookie': `admin_session=${expires}.${signature}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800; Path=/` } });
    }
    if (url.pathname === '/api/admin/inquiries' && request.method === 'GET') {
      if (!await isAdmin(request, env)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const { results } = await env.DB.prepare('SELECT id, name, phone, inquiry_type, message, created_at FROM inquiries ORDER BY created_at DESC').all();
      return Response.json(results);
    }
    if (url.pathname === '/api/inquiries' && request.method === 'POST') {
      try {
        const body = await request.json();
        const name = String(body.name || '').trim();
        const phone = String(body.phone || '').trim();
        const message = String(body.message || '').trim();
        const inquiryType = String(body.inquiryType || 'General enquiry').trim();
        if (!name || !phone || !message) return Response.json({ error: 'Name, phone number, and requirement are required.' }, { status: 400 });
        await env.DB.prepare('INSERT INTO inquiries (name, phone, inquiry_type, message, created_at) VALUES (?, ?, ?, ?, datetime("now"))').bind(name, phone, inquiryType, message).run();
        return Response.json({ ok: true });
      } catch { return Response.json({ error: 'Unable to save enquiry.' }, { status: 500 }); }
    }
    return env.ASSETS.fetch(request);
  }
};
