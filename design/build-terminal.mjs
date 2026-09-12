import { mkdir, readFile, writeFile } from 'node:fs/promises';

const W = 880;
const H = 478;
const GROUND = 352;
const PAD = 28;
const TITLEBAR = 40;

const THEMES = {
  dark: {
    file: 'terminal-dark.svg',
    win: '#300A24',
    border: '#1f1f1f',
    barTop: '#3b3b3b',
    barBottom: '#303030',
    barText: '#dcdcdc',
    btn: '#3f3f3f',
    btnGlyph: '#d0d0d0',
    fg: '#eeeeec',
    green: '#8ae234',
    blue: '#729fcf',
    yellow: '#fce94f',
    dim: '#a89b9f',
    orange: '#E95420',
    rule: '#4a2540',
    glow: 'filter: drop-shadow(0 0 14px rgba(233, 84, 32, 0.55));',
  },
  light: {
    file: 'terminal-light.svg',
    win: '#ffffff',
    border: '#d1d9e0',
    barTop: '#f6f5f4',
    barBottom: '#ebe9e7',
    barText: '#3d3d3d',
    btn: '#dcdad8',
    btnGlyph: '#4b4b4b',
    fg: '#171421',
    green: '#26a269',
    blue: '#1c71d8',
    yellow: '#a2734c',
    dim: '#77767b',
    orange: '#C7401A',
    rule: '#e0dedc',
    glow: '',
  },
};

const STACK = [
  ['TypeScript/', 'Python/', 'Ruby/', 'Rails/', 'Vue3/'],
  ['FastAPI/', 'OpenSearch/', 'MySQL/', 'Docker/'],
];
const PRIMARY = new Set(['TypeScript/', 'Python/', 'Ruby/', 'Rails/', 'Vue3/']);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const prompt = (t, cmd, y) =>
  `<text class="mono" x="${PAD}" y="${y}" font-size="16">` +
  `<tspan fill="${t.green}" font-weight="700">onikukiraii@github</tspan>` +
  `<tspan fill="${t.fg}">:</tspan>` +
  `<tspan fill="${t.blue}" font-weight="700">~</tspan>` +
  `<tspan fill="${t.fg}">$ ${esc(cmd)}</tspan></text>`;

// PokeAPI generation-v sprites. Frame 0 only: an <img>-loaded SVG never plays a GIF,
// so the motion comes from the walk and bob keyframes instead.
const WALKERS = [
  { file: '610.png', w: 39, h: 45, x: 0 },
  { file: '611.png', w: 63, h: 62, x: 122.5 },
  { file: '612.png', w: 71, h: 85, x: 269 },
  { file: '633.png', w: 49, h: 50, x: 423.5 },
  { file: '634.png', w: 67, h: 63, x: 556 },
  { file: '635.png', w: 90, h: 108, x: 706.5 },
];
const FLOOR = 468;

async function walker({ file, w, h, x }, i) {
  const b64 = (await readFile(new URL(`./sprites/${file}`, import.meta.url))).toString('base64');
  return (
    `<g class="bob b${i}">` +
    `<image class="px" x="${x}" y="${FLOOR - h}" width="${w}" height="${h}" href="data:image/png;base64,${b64}"/>` +
    `</g>`
  );
}

async function fontFace(name, weight, file) {
  const b64 = (await readFile(new URL(`./fonts/${file}`, import.meta.url))).toString('base64');
  return `@font-face{font-family:'${name}';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}

async function build(t) {
  const faces = [
    await fontFace('PS2P', 400, 'pressstart-400.woff2'),
    await fontFace('UbuntuX', 500, 'ubuntu-500.woff2'),
    await fontFace('MonoX', 400, 'ubuntumono-400.woff2'),
    await fontFace('MonoX', 700, 'ubuntumono-700.woff2'),
    await fontFace('JPX', 400, 'notojp-400.woff2'),
  ].join('');

  const stackLines = STACK.map((row, i) => {
    const y = 258 + i * 26;
    const spans = row
      .map((name, col) => {
        const fill = PRIMARY.has(name) ? t.orange : t.blue;
        const weight = PRIMARY.has(name) ? 700 : 400;
        return `<tspan x="${PAD + col * 116}" fill="${fill}" font-weight="${weight}">${name}</tspan>`;
      })
      .join('');
    return `<text class="mono" y="${y}" font-size="16">${spans}</text>`;
  }).join('');

  const walkers = (await Promise.all(WALKERS.map(walker))).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="onikukiraii — きんとれとねるのがすき">
<defs>
  <clipPath id="win"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="9"/></clipPath>
  <clipPath id="ground"><rect x="0" y="${GROUND}" width="${W}" height="${H - GROUND}"/></clipPath>
  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${t.barTop}"/><stop offset="1" stop-color="${t.barBottom}"/>
  </linearGradient>
</defs>
<style>
${faces}
.px{image-rendering:pixelated}
.mono{font-family:'MonoX','JPX',ui-monospace,monospace}
.jp{font-family:'JPX','MonoX',sans-serif}
.ui{font-family:'UbuntuX',system-ui,sans-serif}
.title{font-family:'PS2P',monospace;${t.glow}}
.walk{animation:walk 14s linear infinite}
.bob{animation:bob .5s linear infinite}
.b1{animation-delay:.25s}
.b2{animation-delay:.12s}
.b3{animation-delay:.31s}
.b4{animation-delay:.06s}
.b5{animation-delay:.19s}
.caret{animation:blink 1.06s linear infinite}
@keyframes walk{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}
@keyframes bob{0%,49.9%{transform:translateY(0)}50%,100%{transform:translateY(-3px)}}
@keyframes blink{0%,54.9%{opacity:1}55%,100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.walk,.bob,.caret{animation:none}}
</style>

<g clip-path="url(#win)">
  <rect width="${W}" height="${H}" fill="${t.win}"/>
  <rect width="${W}" height="${TITLEBAR}" fill="url(#bar)"/>
  <text class="ui" x="${PAD - 14}" y="25" font-size="12.5" font-weight="500" fill="${t.barText}">onikukiraii@github: ~</text>
  <g>
    <circle cx="${W - 74}" cy="20" r="11" fill="${t.btn}"/>
    <rect x="${W - 79}" y="19.5" width="10" height="1.4" fill="${t.btnGlyph}"/>
    <circle cx="${W - 46}" cy="20" r="11" fill="${t.btn}"/>
    <rect x="${W - 51}" y="15" width="10" height="10" fill="none" stroke="${t.btnGlyph}" stroke-width="1.4"/>
    <circle cx="${W - 18}" cy="20" r="11" fill="#E95420"/>
    <path d="M${W - 23} 15l10 10M${W - 13} 15l-10 10" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
  </g>

  <text class="title" x="${PAD}" y="98" font-size="26" fill="${t.orange}">ONIKUKIRAII</text>
  <text class="ui" x="${PAD}" y="124" font-size="12" letter-spacing="2.4" fill="${t.dim}">LEGAL TECH ENGINEER — TOKYO</text>

  ${prompt(t, 'cat about.txt', 166)}
  <text class="jp" x="${PAD}" y="192" font-size="16" fill="${t.fg}">きんとれとねるのがすき</text>

  ${prompt(t, 'ls stack/', 232)}
  ${stackLines}

  <text class="mono" x="${PAD}" y="322" font-size="16"><tspan fill="${t.green}" font-weight="700">onikukiraii@github</tspan><tspan fill="${t.fg}">:</tspan><tspan fill="${t.blue}" font-weight="700">~</tspan><tspan fill="${t.fg}">$</tspan></text>
  <rect class="caret" x="${PAD + 176}" y="308" width="9" height="18" fill="${t.fg}"/>

  <rect x="0" y="${GROUND}" width="${W}" height="1" fill="${t.rule}"/>
  <g clip-path="url(#ground)"><g class="walk">${walkers}<g transform="translate(${W} 0)">${walkers}</g></g></g>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="9" fill="none" stroke="${t.border}"/>
</svg>
`;
}

const out = new URL('../assets/', import.meta.url);
await mkdir(out, { recursive: true });
for (const theme of Object.values(THEMES)) {
  const svg = await build(theme);
  await writeFile(new URL(theme.file, out), svg);
  console.log(`${theme.file}  ${(svg.length / 1024).toFixed(0)} KB`);
}
