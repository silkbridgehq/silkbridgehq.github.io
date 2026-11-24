// Silk Bridge HQ — shared site script

// ---- Quote form settings ----
// Paste the Web3Forms access key here once Jacob has one (it is a public form ID, not a password).
// While it is empty, the form opens the visitor's email app with everything filled in instead.
const FORM_KEY = "";
const TO_EMAIL = "jacob@silkbridgehq.com";

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) menuBtn.addEventListener('click', () => {
  const nav = document.querySelector('.nav nav');
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nav: transparent over hero, glass once scrolled
const navEl = document.querySelector('.nav');
const onScrollNav = () => navEl && navEl.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();

// Split headings into words that rise in
document.querySelectorAll('[data-split]').forEach(el => {
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = part; w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
  };
  walk(el); el.classList.add('split');
  el.querySelectorAll('.w > span').forEach((s, i) => s.style.transitionDelay = (i * 55) + 'ms');
});

// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .split').forEach((el, i) => {
  if (el.classList.contains('reveal')) el.style.transitionDelay = (i % 4) * 90 + 'ms';
  io.observe(el);
});

// Statement: words light up as you scroll past
const fill = document.querySelector('.fill');
if (fill) {
  const words = [];
  fill.querySelectorAll('[data-fill]').forEach(p => {
    const html = [...p.childNodes].map(n => n.nodeType === 3
      ? n.textContent.split(/(\s+)/).map(t => /^\s+$/.test(t) || !t ? t : `<span>${t}</span>`).join('')
      : `<span>${n.outerHTML}</span>`).join('');
    p.innerHTML = html; words.push(...p.querySelectorAll('span'));
  });
  const upd = () => {
    const r = fill.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

// Sticky process: highlight step in view + progress bar
const psteps = [...document.querySelectorAll('.pstep')];
if (psteps.length) {
  const bar = document.querySelector('.process .bar i');
  const upd = () => {
    let active = 0;
    psteps.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .55) active = i; });
    psteps.forEach((s, i) => s.classList.toggle('on', i === active));
    const first = psteps[0].getBoundingClientRect(), last = psteps[psteps.length - 1].getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .55 - first.top) / (last.bottom - first.top)));
    if (bar) bar.style.width = (p * 100) + '%';
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

// 3D tilt + spotlight on category cards
if (!REDUCED && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.cat, [data-tilt]').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      c.style.transform = `rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg) translateZ(0)`;
    });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });
  // Magnetic buttons
  document.querySelectorAll('.btn.lg').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
}

// Products page: highlight the category in view
const catLinks = [...document.querySelectorAll('.catnav a')];
if (catLinks.length) {
  const secs = catLinks.map(a => document.querySelector(a.getAttribute('href')));
  const upd = () => {
    let cur = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 220) cur = i; });
    catLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

// Optional background video: hide it if the file isn't there
document.querySelectorAll('video[data-optional]').forEach(v => {
  const src = v.querySelector('source');
  const hide = () => v.remove();
  if (src) src.addEventListener('error', hide); v.addEventListener('error', hide);
});

// ---- Globe (home hero) ----
const globe = document.getElementById('globe');
if (globe) initGlobe(globe);

function initGlobe(cv) {
  const ctx = cv.getContext('2d');
  // Rough continent outlines [lon, lat] — stylised, not a precise map.
  const LAND = [
    [[113,-22],[114,-34],[117,-35],[124,-33],[131,-31],[138,-35],[141,-38],[147,-39],[150,-37],[153,-30],[153,-25],[146,-19],[142,-11],[136,-12],[130,-12],[126,-14],[122,-17],[114,-21]],
    [[146,-41],[148,-41],[148,-43.5],[146,-43.5]],
    [[26,40],[36,36],[44,12],[52,15],[57,24],[62,25],[67,24],[72,20],[77,8],[80,13],[80,16],[87,21],[92,22],[94,16],[98,9],[100,3],[104,1],[104,10],[109,12],[108,21],[114,22],[120,27],[122,31],[121,38],[126,37],[129,35],[130,42],[140,47],[141,53],[135,55],[141,59],[155,59],[163,61],[180,65],[180,72],[140,73],[110,77],[80,73],[68,70],[60,69],[40,67],[30,70],[28,60],[30,55],[28,46],[30,41]],
    [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[5,53],[8,57],[10,59],[5,62],[14,68],[20,70],[28,71],[30,70],[30,55],[28,46],[26,40],[24,38],[20,40],[16,38],[12,44],[8,44],[3,43],[-5,36]],
    [[-17,21],[-17,15],[-12,8],[-8,4],[2,6],[9,4],[9,-1],[13,-6],[12,-17],[15,-27],[18,-34],[22,-34],[27,-33],[32,-28],[35,-22],[40,-15],[40,-10],[39,-4],[43,2],[51,11],[43,12],[37,20],[32,31],[20,32],[10,37],[-1,36],[-6,35],[-10,30],[-15,27]],
    [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
    [[-168,66],[-162,60],[-152,58],[-140,60],[-133,56],[-125,49],[-124,42],[-117,33],[-110,24],[-105,20],[-97,16],[-92,15],[-87,13],[-83,9],[-79,9],[-82,15],[-88,16],[-87,21],[-91,19],[-97,22],[-97,27],[-90,29],[-84,30],[-81,25],[-80,32],[-76,35],[-74,40],[-70,42],[-66,45],[-60,46],[-56,52],[-60,55],[-64,60],[-75,62],[-80,58],[-91,58],[-94,61],[-87,66],[-95,70],[-110,68],[-128,70],[-141,70],[-156,71]],
    [[-73,78],[-60,82],[-30,83],[-20,75],[-22,70],[-40,64],[-50,62],[-54,68]],
    [[-80,8],[-75,11],[-71,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-41],[-66,-47],[-69,-52],[-74,-52],[-74,-44],[-73,-37],[-71,-28],[-70,-18],[-76,-14],[-81,-6],[-80,0]],
    [[95,5],[98,4],[104,-2],[106,-6],[102,-5],[97,0]],
    [[109,1],[111,-3],[116,-4],[119,1],[117,7],[113,4]],
    [[105,-6],[114,-7],[114,-8.5],[106,-7.5]],
    [[131,-1],[141,-3],[150,-6],[147,-10],[142,-9],[138,-8],[134,-4]],
    [[166,-46],[172,-41],[174,-37],[178,-38],[175,-42],[170,-46]],
    [[130,31],[135,34],[140,35],[142,40],[141,45],[145,44],[140,41],[137,37],[132,34]],
    [[120,18],[122,14],[126,7],[122,7],[120,12]],
    [[-5,50],[1,51],[0,53],[-3,56],[-6,58],[-5,55],[-3,54],[-5,52]],
  ];
  const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const R = Math.PI / 180;
  const toV = (lon, lat) => [Math.cos(lat * R) * Math.sin(lon * R), Math.sin(lat * R), Math.cos(lat * R) * Math.cos(lon * R)];

  // Dots on a Fibonacci sphere, keep land
  const pts = [], N = 16000, ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    const lat = Math.asin(y) / R, lon = ((Math.atan2(Math.cos(th) * r, Math.sin(th) * r) / R) + 540) % 360 - 180;
    if (LAND.some(p => inPoly(lon, lat, p))) pts.push(toV(lon, lat));
  }
  const CITIES = { foshan: [113.1, 23.0], ningbo: [121.55, 29.87], melbourne: [144.96, -37.81], sydney: [151.21, -33.87], brisbane: [153.03, -27.47] };
  const ROUTES = [['foshan', 'melbourne'], ['ningbo', 'sydney'], ['foshan', 'brisbane']];
  const slerp = (a, b, t) => { const d = Math.acos(Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2])), s = Math.sin(d); const k1 = Math.sin((1-t)*d)/s, k2 = Math.sin(t*d)/s; return [a[0]*k1+b[0]*k2, a[1]*k1+b[1]*k2, a[2]*k1+b[2]*k2]; };
  const arcs = ROUTES.map(([f, t], idx) => {
    const a = toV(...CITIES[f]), b = toV(...CITIES[t]), seg = [];
    for (let i = 0; i <= 80; i++) { const p = slerp(a, b, i / 80), h = 1 + Math.sin(Math.PI * i / 80) * .22; seg.push([p[0]*h, p[1]*h, p[2]*h]); }
    return { seg, off: idx * .33 };
  });

  let W, H, S, dpr, rotLon = -130 * R, tilt = -7 * R, mx = 0, my = 0, t0 = performance.now(), visible = true;
  const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; S = Math.min(W, H) * .42; };
  resize(); addEventListener('resize', resize);
  addEventListener('mousemove', e => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
  let running = false;
  const start = () => { if (!running) { running = true; requestAnimationFrame(draw); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(cv);

  const project = (v, cl, sl, ct, st) => {
    // rotate around Y (longitude) then X (tilt)
    const x = v[0] * cl + v[2] * sl, z1 = -v[0] * sl + v[2] * cl;
    const y = v[1] * ct - z1 * st, z = v[1] * st + z1 * ct;
    return [W / 2 + x * S, H / 2 - y * S, z];
  };

  function draw(now) {
    if (!visible) { running = false; return; }
    const t = (now - t0) / 1000;
    const lon = rotLon + Math.sin(t * .08) * 18 * R + mx * 14 * R;
    const lat = tilt + my * 8 * R;
    const cl = Math.cos(lon), sl = Math.sin(lon), ct = Math.cos(lat), st = Math.sin(lat);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // atmosphere
    const g = ctx.createRadialGradient(W/2, H/2, S * .9, W/2, H/2, S * 1.25);
    g.addColorStop(0, 'rgba(90,130,210,.18)'); g.addColorStop(1, 'rgba(90,130,210,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W/2, H/2, S * 1.25, 0, Math.PI * 2); ctx.fill();
    const body = ctx.createRadialGradient(W/2 - S*.35, H/2 - S*.4, S*.1, W/2, H/2, S);
    body.addColorStop(0, 'rgba(40,62,105,.55)'); body.addColorStop(1, 'rgba(8,14,28,.9)');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(W/2, H/2, S, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(160,190,255,.12)'; ctx.lineWidth = 1; ctx.stroke();

    // land dots
    for (const v of pts) {
      const [x, y, z] = project(v, cl, sl, ct, st);
      if (z < -0.05) continue;
      const a = Math.max(0, z) ** .8;
      ctx.fillStyle = `rgba(${180 + 50 * a | 0},${195 + 30 * a | 0},${230},${.15 + a * .7})`;
      const s = .7 + a * 1.1;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }

    // routes
    arcs.forEach(({ seg, off }) => {
      const P = seg.map(v => project(v, cl, sl, ct, st));
      ctx.lineWidth = 1.4;
      for (let i = 1; i < P.length; i++) {
        if (P[i][2] < -0.1) continue;
        ctx.strokeStyle = `rgba(231,198,90,${.25 + .35 * Math.max(0, P[i][2])})`;
        ctx.beginPath(); ctx.moveTo(P[i-1][0], P[i-1][1]); ctx.lineTo(P[i][0], P[i][1]); ctx.stroke();
      }
      // travelling light
      const k = ((t * .18 + off) % 1), idx = Math.floor(k * (P.length - 1));
      for (let j = 0; j < 14; j++) {
        const q = P[Math.max(0, idx - j)]; if (!q || q[2] < -0.1) continue;
        ctx.fillStyle = `rgba(255,236,170,${(1 - j / 14) * .9})`;
        ctx.beginPath(); ctx.arc(q[0], q[1], 2.6 - j * .14, 0, Math.PI * 2); ctx.fill();
      }
    });

    // city pins with pulse
    Object.entries(CITIES).forEach(([name, ll], i) => {
      const [x, y, z] = project(toV(...ll), cl, sl, ct, st); if (z < 0) return;
      const ph = ((t * .6 + i * .3) % 1);
      ctx.strokeStyle = `rgba(231,198,90,${(1 - ph) * .7})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, y, 4 + ph * 16, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#F6E3A1'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
      if (name === 'melbourne' || name === 'foshan') {
        ctx.font = '500 11px Inter, sans-serif'; ctx.fillStyle = 'rgba(232,236,244,.75)';
        ctx.fillText(name === 'melbourne' ? 'MELBOURNE' : 'FOSHAN', x + 10, y + 4);
      }
    });

    if (!REDUCED) requestAnimationFrame(draw); else running = false;
  }
  cv.classList.add('ready'); start();
}

// ---- Quote form ----
const form = document.getElementById('quote-form');
if (form) {
  const steps = [...form.querySelectorAll('.qstep')];
  const prog = [...document.querySelectorAll('.progress > div')];
  let cur = 0;

  // Pre-select category from ?cat=furniture etc.
  const cat = new URLSearchParams(location.search).get('cat');
  if (cat) { const r = form.querySelector(`input[name=category][value="${CSS.escape(cat)}"]`); if (r) r.checked = true; }

  // Example text changes with category
  const examples = {
    furniture: "e.g. 40 office chairs (black mesh, with arms) and 10 meeting tables 1800×900 for a fit-out in March. Happy to send the furniture schedule.",
    packaging: "e.g. 5,000 printed mailer boxes 300×220×80mm, kraft outside with our logo in one colour. We currently buy about 2,000 a month.",
    pet: "e.g. Round washable dog beds in 3 sizes (S/M/L), grey and navy, plus rope toys. For our online store.",
    homewares: "e.g. 2,000 stoneware mugs (350ml) in 3 colours with our logo, plus matching bowls. For our online homewares store.",
    hospitality: "e.g. Crockery and glassware for a 120-seat restaurant: dinner plates, side plates, bowls, wine and water glasses. Opening in May.",
    fitness: "e.g. 20 pairs of hex dumbbells 2.5–30kg, 15 kettlebells and 30 pilates mats for a new gym fit-out.",
    construction: "e.g. 500 hi-vis long-sleeve shirts (day/night), 200 hard hats and 1,000 pairs of gloves for our sites, every quarter.",
    merch: "e.g. 300 embroidered polos and 200 caps with our logo for staff uniforms, plus 500 printed tote bags for an event.",
    other: "Tell us what the product is, roughly how many, and anything important (size, material, colour, branding)."
  };
  const desc = form.querySelector('#what');
  const setEx = () => { const c = form.querySelector('input[name=category]:checked'); desc.placeholder = examples[c ? c.value : 'other']; };
  form.querySelectorAll('input[name=category]').forEach(r => r.addEventListener('change', setEx)); setEx();

  const show = n => {
    steps.forEach((s, i) => s.classList.toggle('show', i === n));
    prog.forEach((p, i) => p.classList.toggle('on', i <= n));
    cur = n;
    if (n === steps.length - 1) buildSummary();
    const top = form.getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
  };

  const err = (step, msg) => { const e = step.querySelector('.err'); e.textContent = msg; e.classList.toggle('show', !!msg); return !msg; };
  const validate = n => {
    const s = steps[n];
    if (n === 0) {
      if (!form.querySelector('input[name=category]:checked')) return err(s, 'Pick a category (or "Something else").');
      if (desc.value.trim().length < 5) return err(s, 'Tell us a little about what you need.');
    }
    if (n === 2) {
      if (!form.elements.namedItem('name').value.trim()) return err(s, 'Please add your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.elements.namedItem('email').value.trim())) return err(s, 'Please add a valid email so we can send your quote.');
    }
    return err(s, '');
  };

  form.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => { if (validate(cur)) show(cur + 1); }));
  form.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => show(cur - 1)));

  const labels = {
    category: 'Category', what: 'What you need', link: 'Example / link', quantity: 'Quantity', qty_exact: 'Exact quantity',
    timing: 'Needed by', state: 'Deliver to', current_price: 'Paying now', name: 'Name', company: 'Company',
    email: 'Email', phone: 'Phone', contact_pref: 'Best way to reach'
  };
  const collect = () => {
    const fd = new FormData(form), out = {};
    for (const k of Object.keys(labels)) { const v = (fd.get(k) || '').toString().trim(); if (v) out[k] = v; }
    return out;
  };
  function buildSummary() {
    const d = collect(), box = document.getElementById('summary');
    box.innerHTML = '';
    for (const [k, v] of Object.entries(d)) {
      if (['name', 'company', 'email', 'phone', 'contact_pref'].includes(k)) continue;
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = labels[k]; dd.textContent = v; row.append(dt, dd); box.append(row);
    }
  }

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!validate(cur)) return;
    if (cur < steps.length - 1) { show(cur + 1); return; } // Enter key on steps 1–2 = Next
    if (form.elements.namedItem('botcheck').checked) return; // spam bot
    const d = collect();
    const ref = 'SB-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const subject = `Quote request ${ref}: ${d.category || ''} (${d.company || d.name})`;
    const text = `Quote request ${ref}\n\n` + Object.entries(d).map(([k, v]) => `${labels[k]}: ${v}`).join('\n');
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    let sent = false;
    if (FORM_KEY) {
      try {
        const r = await fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: FORM_KEY, subject, from_name: 'Silk Bridge HQ website', replyto: d.email, reference: ref, ...Object.fromEntries(Object.entries(d).map(([k, v]) => [labels[k], v])) })
        });
        sent = (await r.json()).success === true;
      } catch (e) { sent = false; }
    }
    if (!sent) {
      location.href = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    }
    document.getElementById('done-ref').textContent = ref;
    document.getElementById('done-mail').style.display = sent ? 'none' : 'block';
    steps.forEach(s => s.classList.remove('show'));
    document.querySelector('.progress').style.display = 'none';
    document.getElementById('done').style.display = 'block';
  });
}
