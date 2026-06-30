const socket = typeof io === 'function' ? io() : { on: () => {}, emit: () => {} };
const $ = (id) => document.getElementById(id);
let token = localStorage.getItem('token') || '';
let csrfToken = '';
async function refreshCsrf() { const res = await fetch('/api/csrf-token'); csrfToken = (await res.json()).csrfToken; }
$('theme').onclick = () => document.body.classList.toggle('dark');
async function api(url, opts = {}) { if (!csrfToken) await refreshCsrf(); const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'CSRF-Token': csrfToken, Authorization: token ? `Bearer ${token}` : '', ...(opts.headers || {}) } }); if (!res.ok) throw new Error((await res.json()).error || res.statusText); return res.json(); }
refreshCsrf();
$('connect').onclick = async () => { $('pairing').textContent = 'Generating secure WhatsApp Multi-Device login...'; const data = await api('/api/sessions', { method: 'POST', body: JSON.stringify({ phone: $('phone').value }) }); renderPairing(data); };
$('login').onclick = async () => { try { const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: $('username').value, password: $('password').value }) }); token = data.token; localStorage.setItem('token', token); $('loginStatus').textContent = `Logged in as ${data.user.role}`; await loadAdmin(); } catch (e) { $('loginStatus').textContent = e.message; } };
$('sendBroadcast').onclick = async () => { await api('/api/admin/broadcast', { method: 'POST', body: JSON.stringify({ message: $('broadcast').value }) }); alert('Broadcast queued'); };
function renderPairing(data) { $('pairing').textContent = `Phone: ${data.phone}\nStatus: ${data.status}\nPairing code: ${data.pairingCode || 'Open WhatsApp QR scanner if QR is shown.'}`; if (data.qrCodeDataUrl) { $('qr').src = data.qrCodeDataUrl; $('qr').style.display = 'block'; } }
async function loadAdmin() { const [stats, sessions, logs] = await Promise.all([api('/api/admin/stats'), api('/api/admin/sessions'), api('/api/admin/logs')]); $('stats').innerHTML = Object.entries(stats).map(([k,v]) => `<b>${k}</b>: ${v}`).join('<br>'); $('sessions').innerHTML = sessions.map(s => `<tr><td>${s.phone}</td><td class="status-${s.status}">${s.status}</td><td>${s.stats?.commands || 0}</td><td><button onclick="disconnect('${s.phone}')">Disconnect</button> <button onclick="restart('${s.phone}')">Restart</button></td></tr>`).join(''); $('logs').textContent = logs.map(l => `[${new Date(l.createdAt).toLocaleString()}] ${l.level}: ${l.message}`).join('\n'); }
async function disconnect(phone){ await api(`/api/admin/sessions/${phone}`, { method:'DELETE' }); loadAdmin(); }
async function restart(phone){ await api(`/api/admin/restart/${phone}`, { method:'POST' }); loadAdmin(); }
socket.on('session:update', (data) => { if ($('phone').value.replace(/\D/g,'') === data.phone) renderPairing(data); if (token) loadAdmin().catch(()=>{}); });
if (token) loadAdmin().catch(() => localStorage.removeItem('token'));
