import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDir = path.join(process.cwd(), "public", "assets", "hero");

const banners = [
  {
    file: "hero-materials.png",
    title: "素材归档",
    subtitle: "AI material intake",
    accent: "#cbb0f7",
    motif: "archive"
  },
  {
    file: "hero-tags.png",
    title: "标签识别",
    subtitle: "print tag intelligence",
    accent: "#b4b4b2",
    motif: "tags"
  },
  {
    file: "hero-production.png",
    title: "成品打板",
    subtitle: "product delivery flow",
    accent: "#faf9f6",
    motif: "product"
  }
];

function patternTiles(motif) {
  const shapes = {
    archive: [
      ["70", "118", "210", "148", "12"],
      ["318", "96", "184", "122", "18"],
      ["560", "134", "250", "168", "14"],
      ["142", "342", "224", "148", "16"],
      ["458", "330", "196", "132", "12"],
      ["738", "322", "180", "126", "16"]
    ],
    tags: [
      ["86", "132", "246", "64", "32"],
      ["404", "110", "220", "64", "32"],
      ["700", "150", "188", "64", "32"],
      ["162", "320", "210", "64", "32"],
      ["454", "304", "246", "64", "32"],
      ["742", "338", "170", "64", "32"]
    ],
    product: [
      ["112", "116", "148", "270", "70"],
      ["342", "94", "170", "322", "76"],
      ["602", "124", "152", "292", "72"],
      ["822", "170", "108", "218", "48"]
    ]
  }[motif];

  return shapes
    .map(([x, y, width, height, radius], index) => {
      const opacity = 0.12 + index * 0.025;
      const strokeOpacity = 0.28 + index * 0.04;
      return `
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"
          fill="rgba(250,249,246,${opacity})" stroke="rgba(203,176,247,${strokeOpacity})" stroke-width="1"/>
        <path d="M ${Number(x) + 24} ${Number(y) + Number(height) - 34} C ${Number(x) + 70} ${Number(y) + 22}, ${Number(x) + Number(width) - 74} ${Number(y) + Number(height) - 80}, ${Number(x) + Number(width) - 24} ${Number(y) + 28}"
          fill="none" stroke="rgba(250,249,246,0.12)" stroke-width="2"/>
      `;
    })
    .join("");
}

function makeSvg({ title, subtitle, accent, motif }) {
  return `
  <svg width="1920" height="760" viewBox="0 0 1920 760" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="760" fill="#000000"/>
    <defs>
      <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
        <path d="M 72 0 L 0 0 0 72" fill="none" stroke="rgba(250,249,246,0.06)" stroke-width="1"/>
      </pattern>
      <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.92"/>
        <stop offset="48%" stop-color="#000000" stop-opacity="0.62"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
      </linearGradient>
      <filter id="soft">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
    </defs>
    <rect width="1920" height="760" fill="url(#grid)"/>
    <g transform="translate(790 86)">
      <rect x="0" y="0" width="1010" height="560" rx="30" fill="#0a0a0a" stroke="#333333"/>
      <rect x="28" y="28" width="954" height="504" rx="22" fill="#121212" stroke="#1e1e1d"/>
      <g opacity="0.95">${patternTiles(motif)}</g>
      <circle cx="826" cy="82" r="118" fill="${accent}" opacity="0.12" filter="url(#soft)"/>
      <path d="M82 500 L930 96" stroke="${accent}" stroke-width="2" opacity="0.34"/>
      <path d="M118 116 H884" stroke="rgba(250,249,246,0.16)" stroke-width="1"/>
      <path d="M118 466 H884" stroke="rgba(250,249,246,0.10)" stroke-width="1"/>
      <text x="66" y="82" fill="#faf9f6" font-family="Arial, sans-serif" font-size="22" font-weight="600">${title}</text>
      <text x="66" y="114" fill="#868684" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">${subtitle}</text>
    </g>
    <rect width="1920" height="760" fill="url(#fade)"/>
  </svg>`;
}

await fs.mkdir(outputDir, { recursive: true });

await Promise.all(
  banners.map(async (banner) => {
    const svg = Buffer.from(makeSvg(banner));
    await sharp(svg).png({ compressionLevel: 9 }).toFile(path.join(outputDir, banner.file));
  })
);

console.log(`Generated ${banners.length} hero banners in ${outputDir}`);
