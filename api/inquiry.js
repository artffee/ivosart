// Direct studio inquiries. Configure RESEND_API_KEY + INQUIRY_FROM in Vercel.
// No visitor data or credentials are logged. The recipient is fixed server-side.
const { createHash } = require('node:crypto');
const inbox = 'usivaylo@gmail.com';
const buckets = new Map();
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const enabled = Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_FROM);
  if (req.method === 'GET') return res.status(200).json({ enabled });
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Method not allowed.' }); }
  const origin = req.headers.origin;
  const allowed = new Set(['https://ivosart.com', 'https://www.ivosart.com']);
  if (process.env.VERCEL_URL) allowed.add('https://' + process.env.VERCEL_URL);
  if (!origin || !allowed.has(origin)) return res.status(403).json({ error: 'Please use the form on ivosart.com.' });
  if (!(req.headers['content-type'] || '').includes('application/json')) return res.status(415).json({ error: 'Expected a JSON request.' });
  let data;
  try { data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({ error: 'Invalid request.' }); }
  if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length > 9000) return res.status(400).json({ error: 'Please shorten your inquiry.' });
  if (data.botcheck) return res.status(400).json({ error: 'Please try again.' });
  const fields = [['name',100],['email',254],['work',200],['message',6000]];
  for (const [field,limit] of fields) {
    if (data[field] === undefined && field === 'work') data[field] = '';
    if (typeof data[field] !== 'string' || data[field].length > limit) return res.status(400).json({ error: 'Please check your inquiry fields.' });
    data[field] = data[field].trim();
  }
  if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || /[\r\n]/.test(data.name + data.email + data.work)) return res.status(400).json({ error: 'Please enter your name, a valid email, and a message.' });
  if (typeof data.requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(data.requestId)) return res.status(400).json({ error: 'Please refresh the page and try again.' });
  if (!enabled) return res.status(503).json({ error: 'Direct inquiries are temporarily unavailable. Please email ' + inbox + '.' });
  // Best-effort per-instance throttling, in addition to provider/platform limits.
  const now = Date.now();
  for (const [key,value] of buckets) if (value.expires < now) buckets.delete(key);
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown').split(',')[0];
  const fingerprint = createHash('sha256').update(ip).digest('hex');
  const rate = buckets.get(fingerprint) || { count:0, expires:now + 600000 };
  if (rate.count >= 5) { res.setHeader('Retry-After','600'); return res.status(429).json({ error: 'Please wait a few minutes before trying again.' }); }
  if (buckets.size > 10000) buckets.clear();
  rate.count++; buckets.set(fingerprint,rate);
  const text = `Name: ${data.name}\nEmail: ${data.email}\nWork of interest: ${data.work || 'Open to suggestions'}\n\n${data.message}`;
  const digest = createHash('sha256').update(text).digest('hex');
  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method:'POST', signal:AbortSignal.timeout(10000),
      headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':`ivosart-${data.requestId}-${digest}`},
      body:JSON.stringify({from:process.env.INQUIRY_FROM,to:[inbox],reply_to:data.email,subject:'IvosArt inquiry — '+(data.work||'Artwork'),text})
    });
    const result = await upstream.json().catch(()=>({}));
    if (!upstream.ok || !result.id) return res.status(502).json({ error: 'The studio could not accept your inquiry just now. Please try again.' });
    return res.status(200).json({ ok:true });
  } catch { return res.status(502).json({ error: 'We could not confirm delivery. Please try again.' }); }
};
