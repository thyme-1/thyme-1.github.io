export type AmbientPalette = {
  g1: string;
  g2: string;
  g3: string;
  // Overlay darkness applied above the photo background (0..1).
  photoDim: number;
};

type Anchor = {
  // minutes since midnight
  t: number;
  g1: string;
  g2: string;
  g3: string;
  photoDim: number;
};

const anchors: Anchor[] = [
  // Night (deep, calm)
  { t: 0, g1: "#0b1020", g2: "#141a2a", g3: "#24153a", photoDim: 0.62 },
  // Morning (warm, gentle)
  { t: 6 * 60, g1: "#f8c38a", g2: "#f4e1b0", g3: "#b8d8ff", photoDim: 0.45 },
  // Daytime (soft, airy)
  { t: 11 * 60, g1: "#d6f0ff", g2: "#fff6dc", g3: "#dff7e6", photoDim: 0.38 },
  // Evening (cozy, warm)
  { t: 16 * 60 + 30, g1: "#ffd1a8", g2: "#ffe2c4", g3: "#c9c0ff", photoDim: 0.48 },
  // Late night (muted)
  { t: 21 * 60, g1: "#0b1020", g2: "#141a2a", g3: "#24153a", photoDim: 0.62 },
  // Wrap to next day
  { t: 24 * 60, g1: "#0b1020", g2: "#141a2a", g3: "#24153a", photoDim: 0.62 },
];

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const k = clamp01(t);
  const r = Math.round(A.r + (B.r - A.r) * k);
  const g = Math.round(A.g + (B.g - A.g) * k);
  const b2 = Math.round(A.b + (B.b - A.b) * k);
  return rgbToHex(r, g, b2);
}

function mixNumber(a: number, b: number, t: number) {
  const k = clamp01(t);
  return a + (b - a) * k;
}

export function getAmbientPalette(date: Date): AmbientPalette {
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  // Find surrounding anchors. `anchors` is sorted and includes 0 and 1440.
  let i = 0;
  while (i < anchors.length - 1 && !(minutes >= anchors[i].t && minutes <= anchors[i + 1].t)) {
    i += 1;
  }
  const a = anchors[i];
  const b = anchors[Math.min(i + 1, anchors.length - 1)];
  const span = Math.max(1, b.t - a.t);
  const t = clamp01((minutes - a.t) / span);

  return {
    g1: mixHex(a.g1, b.g1, t),
    g2: mixHex(a.g2, b.g2, t),
    g3: mixHex(a.g3, b.g3, t),
    photoDim: mixNumber(a.photoDim, b.photoDim, t),
  };
}

export function paletteToBackgroundCss(p: AmbientPalette) {
  // Two-layer gradient for depth, still calm and readable.
  return [
    `radial-gradient(1200px 800px at 15% 15%, ${p.g2} 0%, rgba(255,255,255,0) 60%)`,
    `linear-gradient(135deg, ${p.g1} 0%, ${p.g2} 45%, ${p.g3} 100%)`,
  ].join(",");
}

