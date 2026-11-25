/* =========================================
   Remote Madeira — lógica do site
   1. Configuração e textos (EN / PT / DE)
   2. Atividades e "mochila" (total + WhatsApp)
   3. Motor 3D (WebGL)
   4. Som ambiente (WebAudio)
   ========================================= */

/* ---------- 1. Configuração ---------- */
const WA = 'https://wa.me/351961280511?text=';  // número de WhatsApp
const COMBO = .10;                               // desconto combo (10%) — AJUSTAR com o Marcos

// Textos em 3 idiomas
const T = {
  en: {sun:'Time of day',snd:'Sound',sub:'Fly over the island, then live it. Climb, rappel and leap with a local. Groups of 12 at most.',start:'Begin the flight',z1:'Climb',z1d:'Technical routes on volcanic rock with Atlantic views. Max 4 people.',z2:'Canyon',z2d:'Rappel down waterfalls and slide natural rock chutes. Levels 2 to 4.',z3:'Coast',z3d:'Boat, cliffs, a slackline over the ocean and a 10 m jump.',add:'Add to backpack',added:'In your backpack',ct:'Base camp',cp:'Teams, workations, private days: tell us your plan and we’ll build the day.',cs:'People',cd:'Date',cb:'Send your plan',acts:'in backpack',ppl:'people',send:'Send on WhatsApp',sv:'saved',m:'Hi! I’d like to book {a} for {n} people (about €{t}).',m0:'Hi! I’d like to know more about your adventures.',m2:'Hi! We’re {n} people planning something around {d}.'},
  pt: {sun:'Hora do dia',snd:'Som',sub:'Sobrevoa a ilha e depois vive-a. Escala, faz rappel e salta com um local. Grupos de 12 no máximo.',start:'Começar o voo',z1:'Escalar',z1d:'Vias técnicas em rocha vulcânica com vista para o Atlântico. Máx. 4 pessoas.',z2:'Canyon',z2d:'Rappel em cascatas e escorregas naturais na rocha. Níveis 2 a 4.',z3:'Costa',z3d:'Barco, falésias, slackline sobre o oceano e um salto de 10 m.',add:'Pôr na mochila',added:'Na mochila',ct:'Campo base',cp:'Equipas, workations, dias privados: conta-nos o plano e montamos o dia.',cs:'Pessoas',cd:'Data',cb:'Enviar o plano',acts:'na mochila',ppl:'pessoas',send:'Enviar por WhatsApp',sv:'poupados',m:'Olá! Gostava de reservar {a} para {n} pessoas (cerca de €{t}).',m0:'Olá! Gostava de saber mais sobre as vossas aventuras.',m2:'Olá! Somos {n} pessoas e queremos planear algo por volta de {d}.'},
  de: {sun:'Tageszeit',snd:'Ton',sub:'Flieg über die Insel und erlebe sie dann. Klettern, abseilen, springen mit einem Local. Höchstens 12 Personen.',start:'Flug starten',z1:'Klettern',z1d:'Technische Routen im Vulkangestein mit Atlantikblick. Max. 4 Personen.',z2:'Canyon',z2d:'Wasserfälle abseilen und über Felsrutschen gleiten. Level 2 bis 4.',z3:'Küste',z3d:'Boot, Klippen, eine Slackline über dem Meer und ein 10-m-Sprung.',add:'In den Rucksack',added:'Im Rucksack',ct:'Basecamp',cp:'Teams, Workations, private Tage: erzähl uns deinen Plan, wir bauen den Tag.',cs:'Personen',cd:'Datum',cb:'Plan senden',acts:'im Rucksack',ppl:'Personen',send:'Per WhatsApp senden',sv:'gespart',m:'Hallo! Ich möchte {a} für {n} Personen buchen (ca. €{t}).',m0:'Hallo! Ich möchte mehr über eure Abenteuer erfahren.',m2:'Hallo! Wir sind {n} Personen und planen etwas um den {d}.'}
};

// Atividades: [id, preço €, chave do texto, [nome EN, PT, DE], classe da secção]
const Z = [
  ['cl', 80, 'z1', ['Climbing', 'Escalada', 'Klettern'], ''],
  ['ca', 70, 'z2', ['Canyoning', 'Canyoning', 'Canyoning'], 'r'],
  ['co', 70, 'z3', ['Coasteering', 'Coasteering', 'Coasteering'], '']
];

// Atalhos
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const I  = ['en', 'pt', 'de'];
const fm = (s, o) => s.replace(/\{(\w)\}/g, (_, k) => o[k]);   // preenche {a}, {n}, {t}...

let L = 'en';   // idioma atual
let sel = {};   // atividades escolhidas

/* ---------- 2. Atividades e mochila ---------- */

// Cria uma secção por atividade
$('#zs').innerHTML = Z.map(([k, p, t, , c]) =>
  `<section class="st ${c}" id="${k}"><div class="glass"><h2 data-i="${t}"></h2><p data-i="${t}d"></p><div class="row"><b class="pr">€${p}</b><button class="add" data-k="${k}" aria-pressed="false" data-i="add"></button></div></div></section>`
).join('');

// Aplica os textos do idioma atual
function ap() {
  $$('[data-i]').forEach(e => e.innerHTML = T[L][e.dataset.i]);
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === L));
  upd();
  tm();
}

// Atualiza a mochila: nº de atividades, total, desconto e link de WhatsApp
function upd() {
  const ks  = Object.keys(sel).filter(k => sel[k]);
  const n   = +$('#dn').textContent;
  const raw = ks.reduce((a, k) => a + Z.find(z => z[0] === k)[1], 0) * n;
  const d   = ks.length > 1 ? raw * COMBO : 0;
  const t   = Math.round(raw - d);
  const i   = I.indexOf(L);

  $('#dc').textContent  = ks.length;
  $('#tot').textContent = '€' + t;
  $('#sv').textContent  = d ? '−€' + Math.round(d) + ' ' + T[L].sv : '';

  $('#wa').href = WA + encodeURIComponent(
    ks.length
      ? fm(T[L].m, { a: ks.map(k => Z.find(z => z[0] === k)[3][i]).join(', '), n, t })
      : T[L].m0
  );
}

// Link de WhatsApp do "campo base" (grupos)
function tm() {
  $('#tw').href = WA + encodeURIComponent(fm(T[L].m2, { n: $('#ts').value, d: $('#td').value || '…' }));
}

// Eventos: idioma, adicionar atividade, +/- pessoas, formulário
$$('.lang button').forEach(b => b.onclick = () => {
  L = b.dataset.l;
  document.documentElement.lang = L;
  ap();
});

$$('.add').forEach(b => b.onclick = () => {
  const k = b.dataset.k;
  sel[k] = !sel[k];
  b.setAttribute('aria-pressed', !!sel[k]);
  b.dataset.i = sel[k] ? 'added' : 'add';
  ap();
});

$('#dm').onclick = () => { $('#dn').textContent = Math.max(1, $('#dn').textContent - 1); upd(); };
$('#dp').onclick = () => { $('#dn').textContent = Math.min(12, +$('#dn').textContent + 1); upd(); };

$('#ts').oninput = $('#td').oninput = tm;
$('#td').min = new Date().toISOString().slice(0, 10);   // não deixa escolher datas passadas

// Cartões aparecem com animação quando entram no ecrã
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .2 });
$$('.glass').forEach(e => io.observe(e));

ap();

/* ---------- 3. Motor 3D: ilha procedural em shader (WebGL), sem bibliotecas ---------- */
const cv = $('#gl');
const gl = cv.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
let sp = 0, tp = 0, us = null, mx = .5, my = .5, A = null;

if (gl) {
  const sh = (t, s) => {
    const x = gl.createShader(t);
    gl.shaderSource(x, s);
    gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x));
    return x;
  };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));   // FS vem do shader.js
  gl.linkProgram(pr);
  gl.useProgram(pr);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const la = gl.getAttribLocation(pr, 'a');
  gl.enableVertexAttribArray(la);
  gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['R', 'T', 'S', 'RO', 'TA'].forEach(n => U[n] = gl.getUniformLocation(pr, n));

  // Caminho da câmara: voo ao longo das 5 paragens (posição + alvo)
  const K = [[-.5,6.2,7,0,.6,0],[.6,3.2,2.2,-.3,1.5,-.8],[-1.8,1.5,1.3,-2.6,.6,-.3],[2.2,.35,3.2,1.2,.7,.2],[4.5,.5,4.6,0,1.2,-1]];
  const cam = p => {
    const x = p * 4, i = Math.min(3, x | 0), f = x - i, s = f * f * (3 - 2 * f);
    return K[i].map((v, j) => v + (K[i + 1][j] - v) * s);
  };

  let q = .7, fa = 0, n = 0, last = performance.now(), Tm = 0;

  // Resolução adaptada ao ecrã (e à potência do aparelho)
  const rs = () => {
    const d = Math.min(devicePixelRatio || 1, 2) * q;
    cv.width = innerWidth * d | 0;
    cv.height = innerHeight * d | 0;
    gl.viewport(0, 0, cv.width, cv.height);
  };
  rs();
  addEventListener('resize', rs);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; });
  $('#sun').oninput = e => us = +e.target.value;

  // Ciclo de desenho (corre ~60 vezes por segundo)
  (function fr(now) {
    const dt = now - last;
    last = now;
    if (!RM) Tm += dt / 1000;

    // Se o aparelho for lento, baixa a qualidade; se for rápido, sobe
    if (++n === 40) {
      const av = fa / 40;
      if (av > 26 && q > .35) { q -= .1; rs(); }
      else if (av < 13 && q < 1) { q += .05; rs(); }
      n = 0; fa = 0;
    }
    fa += dt;

    // O scroll controla o voo da câmara
    const h = document.documentElement;
    tp = scrollY / Math.max(1, h.scrollHeight - innerHeight);
    sp += (tp - sp) * .07;

    const c = cam(sp), S = us !== null ? us : .18 + .55 * sp;
    gl.uniform2f(U.R, cv.width, cv.height);
    gl.uniform1f(U.T, Tm);
    gl.uniform1f(U.S, S);
    gl.uniform3f(U.RO, c[0] + Math.sin(Tm * .15) * .15, c[1] + Math.sin(Tm * .2) * .05, c[2]);
    gl.uniform3f(U.TA, c[3] + (mx - .5) * 2, c[4] - (my - .5) * 1.1, c[5]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    $('#dock').classList.toggle('show', scrollY > innerHeight * .7);
    if (A) {
      A.g[0].gain.value = .22 * (1 - sp) + .03;
      A.g[1].gain.value = .08 + .5 * sp * (.6 + .4 * Math.sin(Tm * .6));
    }
    requestAnimationFrame(fr);
  })(last);
}

/* ---------- 4. Som: vento no alto, ondas junto ao mar (WebAudio gerado, sem ficheiros) ---------- */
$('#snd').onclick = e => {
  if (A) { A.close(); A = null; e.target.setAttribute('aria-pressed', false); return; }
  A = new AudioContext();
  const b = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), d = b.getChannelData(0);
  let l = 0;
  for (let i = 0; i < d.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; }
  const mk = (ty, fr) => {
    const s = A.createBufferSource(); s.buffer = b; s.loop = true;
    const f = A.createBiquadFilter(); f.type = ty; f.frequency.value = fr;
    const g = A.createGain(); g.gain.value = 0;
    s.connect(f).connect(g).connect(A.destination);
    s.start();
    return g;
  };
  A.g = [mk('bandpass', 700), mk('lowpass', 320)];
  e.target.setAttribute('aria-pressed', true);
};

// Se o WebGL não funcionar, o fundo muda de cor com o scroll
addEventListener('scroll', () => {
  if (!gl) document.body.style.background = `hsl(${200 - scrollY / 20},60%,${40 - scrollY / 60}%)`;
}, { passive: true });
