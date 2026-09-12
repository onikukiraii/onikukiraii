import { mkdir, writeFile } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FONTS = [
  { name: 'pressstart', family: 'Press Start 2P', text: 'ONIKUKIRAII' },
  { name: 'ubuntu', family: 'Ubuntu:wght@500', text: 'onikukiraii@github: ~LEGAL TECH ENGINEER — TOKYO' },
  {
    name: 'ubuntumono',
    family: 'Ubuntu Mono:wght@400;700',
    text: 'onikukiraii@github:~$ cat about.txt ls stack/ TypeScript/ Python/ Ruby/ Rails/ Vue3/ FastAPI/ OpenSearch/ MySQL/ Docker/',
  },
  { name: 'notojp', family: 'Noto Sans JP:wght@400', text: 'きんとれとねるのがすき。' },
];

await mkdir(new URL('./fonts/', import.meta.url), { recursive: true });

for (const font of FONTS) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}&text=${encodeURIComponent(font.text)}`,
    { headers: { 'User-Agent': UA } },
  ).then((r) => r.text());

  const faces = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?url\((https:\/\/[^)]+)\) format\('woff2'\)/g)];
  if (!faces.length) throw new Error(`no woff2 for ${font.family}\n${css}`);

  for (const [, weight, url] of faces) {
    const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
    const out = new URL(`./fonts/${font.name}-${weight}.woff2`, import.meta.url);
    await writeFile(out, buf);
    console.log(`${font.name}-${weight}.woff2  ${buf.length} bytes`);
  }
}
