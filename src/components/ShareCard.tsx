export type ShareCardData = {
  day: number;
  month: string;
  total: number;
  toRegister: number;
  walkIn: number;
  brands: { brand: string; benefit: string }[];
  city?: string;
};

const W = 1080;
const H = 1350;
const INK = "#0b0b0b";
const PAPER = "#f3f0e8";
const PAPER2 = "#e7e1d3";
const ACID = "#5b7cff";
const HOT = "#ff5a36";
const SKY = "#7cd6ff";

const fam = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/** Dibuja la tarjeta en un canvas del navegador y la devuelve como PNG. */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const display = fam("--font-big-shoulders");
  const sans = fam("--font-bricolage");
  const mono = fam("--font-space-mono");
  await Promise.all([`900 100px ${display}`, `600 30px ${sans}`, `700 30px ${mono}`].map((f) => document.fonts.load(f)));
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("canvas");
  c.textBaseline = "alphabetic";

  const box = (x: number, y: number, w: number, h: number, r: number, fill: string, lw = 8, shadow = 0) => {
    if (shadow) {
      c.beginPath();
      c.roundRect(x + shadow, y + shadow, w, h, r);
      c.fillStyle = INK;
      c.fill();
    }
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.fillStyle = fill;
    c.fill();
    c.lineWidth = lw;
    c.strokeStyle = INK;
    c.stroke();
  };
  // Reduce el cuerpo hasta que el texto quepa en maxW.
  const text = (s: string, x: number, y: number, size: number, family: string, weight: number, maxW: number, align: CanvasTextAlign = "center", color = INK) => {
    let px = size;
    c.font = `${weight} ${px}px ${family}`;
    while (c.measureText(s).width > maxW && px > 14) {
      px -= 2;
      c.font = `${weight} ${px}px ${family}`;
    }
    c.textAlign = align;
    c.fillStyle = color;
    c.fillText(s, x, y);
  };

  c.fillStyle = PAPER;
  c.fillRect(0, 0, W, H);
  box(50, 50, 980, 1160, 40, PAPER, 10, 16);

  // Logo
  c.font = `900 120px ${display}`;
  const wCumple = c.measureText("CUMPLE").width;
  const wGratis = c.measureText("GRATIS").width;
  const gap = 18;
  const padX = 22;
  const total = wCumple + gap + wGratis + padX * 2;
  const x0 = (W - total) / 2;
  text("CUMPLE", x0, 205, 120, display, 900, 600, "left");
  c.save();
  c.translate(x0 + wCumple + gap + (wGratis + padX * 2) / 2, 172);
  c.rotate((-3 * Math.PI) / 180);
  box(-(wGratis + padX * 2) / 2, -62, wGratis + padX * 2, 100, 18, ACID, 7);
  text("GRATIS", 0, 22, 120, display, 900, 600, "center");
  c.restore();

  text(`MI CUMPLE: ${data.day} DE ${data.month.toUpperCase()}`, W / 2, 300, 40, mono, 700, 860);

  // Cifra grande
  c.save();
  const big = String(data.total);
  let bigPx = 330;
  c.font = `900 ${bigPx}px ${display}`;
  while (c.measureText(big).width > 820 && bigPx > 100) {
    bigPx -= 10;
    c.font = `900 ${bigPx}px ${display}`;
  }
  c.textAlign = "center";
  c.lineJoin = "round";
  c.lineWidth = 14;
  c.strokeStyle = INK;
  c.fillStyle = INK;
  c.strokeText(big, W / 2 + 10, 598);
  c.fillText(big, W / 2 + 10, 598);
  c.fillStyle = ACID;
  c.strokeText(big, W / 2, 588);
  c.fillText(big, W / 2, 588);
  c.restore();
  text(data.total === 1 ? "REGALO ME ESPERA" : "REGALOS ME ESPERAN", W / 2, 695, 96, display, 900, 860);

  // Cifras secundarias
  box(90, 725, 435, 80, 40, HOT, 7, 7);
  text(`${data.toRegister} POR REGISTRAR`, 90 + 435 / 2, 781, 48, display, 900, 380);
  box(555, 725, 435, 80, 40, SKY, 7, 7);
  text(`${data.walkIn} SOLO CON INE`, 555 + 435 / 2, 781, 48, display, 900, 380);

  // Marcas
  data.brands.slice(0, 3).forEach((b, i) => {
    const y = 835 + i * 106;
    box(90, y, 900, 96, 22, i % 2 ? PAPER2 : PAPER, 6, 6);
    text(b.brand.toUpperCase(), 118, y + 49, 48, display, 900, 820, "left");
    text(b.benefit, 118, y + 79, 25, sans, 600, 820, "left");
  });

  if (data.city) text(data.city.toUpperCase(), W / 2, 1186, 28, mono, 700, 860);

  // Pie
  box(50, 1236, 980, 80, 40, INK, 8);
  text("Arma el tuyo gratis en cumplegratis.fun", W / 2, 1288, 40, sans, 700, 900, "center", PAPER);

  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
}
