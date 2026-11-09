(() => {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const topo = document.getElementById('topo');
  const onScroll = () => topo.classList.toggle('solido', scrollY > innerHeight * 0.7);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu mobile
  const burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
  burger.addEventListener('click', () => {
    const ab = menu.classList.toggle('aberto');
    burger.setAttribute('aria-expanded', ab);
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('aberto'); burger.setAttribute('aria-expanded', false); }));

  // HERO: letras em sequência + profundidade (a palavra se move atrás da gestante)
  const palavra = document.querySelector('.h-palavra');
  palavra.querySelectorAll('span').forEach((s, i) => s.style.setProperty('--i', i));
  if (!reduz) {
    let mx = 0, my = 0, sy = 0, raf = 0;
    const aplica = () => {
      raf = 0;
      palavra.style.setProperty('--px', (mx * -14).toFixed(1) + 'px');
      palavra.style.setProperty('--py', (my * -8 + sy * 0.22).toFixed(1) + 'px');
    };
    const pede = () => { if (!raf) raf = requestAnimationFrame(aplica); };
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; pede(); });
    addEventListener('scroll', () => { sy = Math.min(scrollY, innerHeight); pede(); }, { passive: true });
  }

  // SIMULADOR: semana a semana
  const dados = [
    { s: 8,  img: 'f08', fruta: 'uma framboesa', alt: 'Uma framboesa sobre fundo verde-escuro', med: '1,6 cm · 1 g', agora: 'O coração já bate e os braços começam a se formar.', agenda: ['Primeira consulta e exames de sangue', 'Ultrassom transvaginal de datação'] },
    { s: 12, img: 'f12', fruta: 'um limão', alt: 'Metade de um limão sobre papel claro', med: '5,4 cm · 14 g', agora: 'Os órgãos estão formados e agora é tempo de crescer.', agenda: ['Ultrassom morfológico do 1º trimestre', 'Translucência nucal'] },
    { s: 20, img: 'f20', fruta: 'uma manga', alt: 'Uma manga madura sobre fundo branco', med: '25 cm · 300 g', agora: 'Já ouve a sua voz e os batimentos do seu coração.', agenda: ['Ultrassom morfológico do 2º trimestre', 'Consulta mensal'] },
    { s: 26, img: 'f26', fruta: 'uma couve-flor', alt: 'Uma couve-flor inteira sobre uma tábua de madeira', med: '35 cm · 760 g', agora: 'Abre os olhos e reage à luz que atravessa a barriga.', agenda: ['Teste de tolerância à glicose', 'Vacina dTpa a partir da 20ª semana'] },
    { s: 32, img: 'f32', fruta: 'meio melão', alt: 'Meia fatia de melão verde sobre fundo rosa', med: '42 cm · 1,7 kg', agora: 'Treina a respiração e ganha gordura para o primeiro inverno.', agenda: ['Plano de parto escrito a quatro mãos', 'Consultas a cada 15 dias'] },
    { s: 40, img: 'f40', fruta: 'uma melancia', alt: 'Casca de uma melancia em luz baixa', med: '50 cm · 3,4 kg', agora: 'Pronto para chegar. Agora é com o seu corpo e o tempo dele.', agenda: ['Consultas semanais e cardiotocografia', 'Plantão obstétrico 24h'] }
  ];
  const tam = { 8: 'f08-700', 12: 'f12-700', 20: 'f20-700', 26: 'f26-700', 32: 'f32-667', 40: 'f40-667' };
  const r = document.getElementById('simRange');
  const el = id => document.getElementById(id);
  const img = el('simImg');
  let atual = null;
  const tri = s => s <= 13 ? '1º trimestre' : s <= 27 ? '2º trimestre' : '3º trimestre';
  const mostra = () => {
    const s = +r.value;
    el('simSem').textContent = s;
    el('simTri').textContent = tri(s);
    r.style.setProperty('--p', ((s - 8) / 32 * 100) + '%');
    let d = dados[0];
    dados.forEach(x => { if (s >= x.s) d = x; });
    if (d === atual) return;
    atual = d;
    el('simFruta').textContent = 'do tamanho de ' + d.fruta;
    el('simMedida').textContent = d.med;
    el('simAgora').textContent = d.agora;
    el('simAgenda').innerHTML = d.agenda.map(a => '<li>' + a + '</li>').join('');
    const src = 'assets/sim-' + tam[d.s] + '.webp';
    if (img.getAttribute('src') !== src) {
      img.classList.add('troca');
      const pre = new Image(); pre.src = src;
      const troca = () => { img.src = src; img.alt = d.alt; requestAnimationFrame(() => img.classList.remove('troca')); };
      (pre.decode ? pre.decode().then(troca, troca) : (pre.onload = troca));
    }
  };
  r.addEventListener('input', mostra); mostra();

  // TOQUE: marcas de calor que devolvem a cor e se dissipam
  const fig = document.getElementById('tqFoto');
  const cv = fig.querySelector('canvas'), base = fig.querySelector('img');
  if (matchMedia('(hover:hover)').matches && !reduz) {
    const ctx = cv.getContext('2d');
    const mask = document.createElement('canvas'), mctx = mask.getContext('2d');
    const cor = new Image();
    let pts = [], vivo = false, W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    const ajusta = () => {
      const b = fig.getBoundingClientRect(); W = b.width; H = b.height;
      const src = base.currentSrc || base.src; if (cor.src !== src) cor.src = src;
      cv.width = mask.width = W * dpr; cv.height = mask.height = H * dpr;
    };
    const desenha = () => {
      if (!pts.length) { ctx.clearRect(0, 0, cv.width, cv.height); vivo = false; return; }
      mctx.clearRect(0, 0, mask.width, mask.height);
      const agora = performance.now();
      pts = pts.filter(p => agora - p.t < 2200);
      pts.forEach(p => {
        const k = 1 - (agora - p.t) / 2200, rr = (90 + 50 * (1 - k)) * dpr;
        const g = mctx.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, rr);
        g.addColorStop(0, `rgba(0,0,0,${.55 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g; mctx.fillRect(p.x * dpr - rr, p.y * dpr - rr, rr * 2, rr * 2);
      });
      ctx.clearRect(0, 0, cv.width, cv.height);
      // desenha a foto colorida com o mesmo enquadramento (object-fit: cover)
      const iw = cor.naturalWidth, ih = cor.naturalHeight, sc = Math.max(cv.width / iw, cv.height / ih);
      const dw = iw * sc, dh = ih * sc;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(cor, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(desenha);
    };
    fig.addEventListener('pointerenter', ajusta);
    addEventListener('resize', ajusta);
    fig.addEventListener('pointermove', e => {
      if (!W) ajusta();
      if (!cor.complete || !cor.naturalWidth) return;
      const b = fig.getBoundingClientRect();
      pts.push({ x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() });
      if (pts.length > 160) pts.shift();
      if (!W) ajusta();
      if (!vivo) { vivo = true; requestAnimationFrame(desenha); }
    });
  }
})();

/* TRANSIÇÕES v2 · Colo Obstetrícia · um abraço que se abre
   Entradas de textos, imagens e cartões + traço de passagem entre seções, com assinatura própria do nicho.
   Só roda com JS e sem prefers-reduced-motion; o conteúdo nunca fica escondido sem JS. */
(() => {
  const C = {"step": 0.11, "settle": 3, "divider": "<svg viewBox=\"0 0 1200 28\"><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.00s\" d=\"M0 22 C200 22 330 6 600 6 S1000 22 1200 22\"/><circle class=\"dot\" cx=\"600\" cy=\"6\" r=\"4\" style=\"--ld:.8s\"/></svg>", "words": false, wordDelay: (i) => i * .08, cardDelay: (n) => Math.min(n, 5) * .12};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  html.classList.add('fx');
  const mob = matchMedia('(max-width: 760px)').matches;
  const SKIP = '.hero, body > header, nav, footer, .nav, .wa, .whats, .wpp, [class*="whatsapp"], canvas, video, iframe, [data-nofx], [class*="marquee"], [class*="ticker"], [aria-hidden="true"]' + (C.skip ? ', ' + C.skip : '');
  const pinned = el => { for (let p = el; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p).position; if (s === 'sticky' || s === 'fixed') return true; } return false; };
  const F0 = new Map();
  if (C.imgFilter) document.querySelectorAll('section img').forEach(i => F0.set(i, getComputedStyle(i).filter));
  const sections = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && !s.matches(SKIP) && !s.closest(SKIP));

  // o sistema antigo de revelação (fade genérico) sai de cena fora da hero
  sections.forEach(s => s.querySelectorAll('.rv, .reveal').forEach(el => { el.classList.remove('rv', 'reveal'); el.style.transitionDelay = ''; }));
  sections.forEach(s => s.classList.remove('rv', 'reveal'));

  const items = []; // {el, kind}
  const taken = new Set();
  const isTaken = el => { for (const t of taken) if (t !== el && t.contains(el)) return true; return false; };

  sections.forEach(sec => {
    // 1. cartões: grupos de 3+ irmãos parecidos com imagem ou título
    const groups = [];
    sec.querySelectorAll('*').forEach(p => {
      const ch = [...p.children].filter(c => !['SCRIPT', 'TEMPLATE', 'BR'].includes(c.tagName));
      if (ch.length < 3 || p.closest(SKIP)) return;
      const sig = c => c.tagName + '.' + (c.classList[0] || '');
      const cnt = {}; ch.forEach(c => cnt[sig(c)] = (cnt[sig(c)] || 0) + 1);
      const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      if (best[1] < 3 || best[1] < ch.length * .7) return;
      const cards = ch.filter(c => sig(c) === best[0]);
      if (!cards.every(c => c.querySelector('img, h3, h4, strong, summary, dt') && c.getBoundingClientRect().height > 50)) return;
      if (cards.some(c => pinned(c))) return;
      if (groups.some(g => g.some(c => c.contains(p)))) return;
      groups.push(cards);
    });
    groups.forEach(g => g.forEach((c, i) => { if (!isTaken(c)) { c.classList.add('fx-c'); c.style.setProperty('--n', i); taken.add(c); items.push({ el: c, kind: 'c', i }); } }));

    // 2. imagens soltas (fora de cartões, fundos fixos e áreas presas)
    sec.querySelectorAll('img').forEach(img => {
      if (img.closest(SKIP) || isTaken(img) || pinned(img)) return;
      let w = img.parentElement; if (w.tagName === 'PICTURE') w = w.parentElement;
      const ws = getComputedStyle(img);
      if (ws.position === 'absolute' && w === sec) return;
      const r = w.getBoundingClientRect(), rs = sec.getBoundingClientRect();
      if (r.width * r.height > rs.width * rs.height * .85) return; // foto de fundo da seção
      let target = w;
      if (w === sec || w.querySelector('h1, h2, h3, p, a, button') ) target = img;
      if (isTaken(target) || taken.has(target)) return;
      target.classList.add('fx-i'); if (target === img) target.classList.add('fx-self');
      if (getComputedStyle(target).clipPath !== 'none') target.classList.add('fx-noclip');
      taken.add(target); items.push({ el: target, kind: 'i' });
    });

    // 3. textos: títulos, parágrafos, listas de dados, botões e formulários, em cascata
    sec.querySelectorAll('h2, h3, h4, p, li, blockquote, dl, form, ' + (C.extraText || '.eyebrow') + ', a[class*="btn"], a[class*="cta"], button[class*="btn"]').forEach(el => {
      if (el.closest(SKIP) || isTaken(el) || taken.has(el) || pinned(el)) return;
      if (el.closest('form') && el.tagName !== 'FORM') return;
      if (!el.textContent.trim() && el.tagName !== 'FORM') return;
      if (el.tagName === 'H2' && C.words) splitWords(el);
      else el.classList.add('fx-t');
      taken.add(el); items.push({ el, kind: el.classList.contains('fx-ws') ? 'w' : 't' });
    });
  });

  function splitWords(h) {
    h.classList.add('fx-ws');
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const s = document.createElement('span'); s.className = 'fx-w'; s.textContent = t; frag.append(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG)$/i.test(n.tagName)) {
          const cs = getComputedStyle(n);
          if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text' || cs.display === 'block') { n.classList.add('fx-w'); return; }
          walk(n);
        }
      });
    };
    walk(h);
    [...h.querySelectorAll('.fx-w')].forEach((w, i, all) => w.style.setProperty('--wd', C.wordDelay(i, all.length) + 's'));
  }

  // filtro de cor de cada foto preservado: a entrada soma o efeito ao filtro original
  if (C.imgFilter) document.querySelectorAll('.fx-i img, img.fx-i, .fx-c img').forEach(img => {
    const f = F0.get(img); img.style.setProperty('--f0', (f && f !== 'none' ? f + ' ' : '') + C.imgFilter);
  });

  // 4. traço de passagem entre seções
  let nDiv = 0;
  sections.forEach((sec, k) => {
    if (nDiv >= (C.maxDiv || 7) || k === 0 && C.skipFirstDiv) return;
    if (sec.matches(C.noDiv || '.fixo, .window, .janela, .sky')) return;
    if (!sec.querySelector('h2')) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    const box = document.createElement('div');
    box.className = 'fx-div'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = C.divider;
    sec.prepend(box); nDiv++;
    items.push({ el: box, kind: 'd' });
  });

  // entrada: os elementos que chegam juntos entram em cascata, na ordem do texto
  const step = C.step * (mob ? .7 : 1);
  const show = (el, d) => {
    el.style.transitionDelay = d + 's';
    el.style.setProperty('--dl', d + 's');
    el.classList.add('fx-on');
    setTimeout(() => { el.classList.add('fx-done'); el.style.transitionDelay = ''; }, (d + C.settle) * 1000);
  };
  // elementos recortados (clip-path) são observados pelo pai, porque o recorte zera a área visível
  const proxyOf = el => ((el.classList.contains('fx-i') && !el.classList.contains('fx-noclip')) || (C.textClip && el.classList.contains('fx-t'))) ? el.parentElement : el;
  const watch = new Map();
  items.forEach(({ el }) => { const p = proxyOf(el); if (!watch.has(p)) watch.set(p, []); watch.get(p).push(el); });
  const io = new IntersectionObserver(es => {
    const ins = es.filter(e => e.isIntersecting).flatMap(e => { io.unobserve(e.target); return watch.get(e.target) || []; })
      .sort((a, b) => a.compareDocumentPosition(b) & 2 ? 1 : -1);
    ins.forEach((el, i) => {
      const n = el.classList.contains('fx-c') ? C.cardDelay(+el.style.getPropertyValue('--n') || 0) : Math.min(i, 7) * step;
      show(el, n);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  watch.forEach((_, p) => io.observe(p));
  // quem chega por âncora já encontra o que ficou acima pronto
  requestAnimationFrame(() => watch.forEach((els, p) => { if (p.getBoundingClientRect().bottom < 0) { io.unobserve(p); els.forEach(el => show(el, 0)); } }));
})();
