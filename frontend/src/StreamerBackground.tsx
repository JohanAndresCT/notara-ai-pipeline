// Decorative "streamer" background: flowing ribbons, confetti and instrument icons that
// drift with the waves. Purely decorative (aria-hidden); motion stops with reduced motion.

const WIDTH = 2880; // two 1440-wide tiles so the ribbons can loop seamlessly

function ribbon(center: number, amp: number, thickness: number, period: number, phase: number) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let x = 0; x <= WIDTH; x += 24) {
    const angle = (2 * Math.PI * x) / period + phase;
    const y = center + amp * Math.sin(angle);
    // Thickness follows |cos| so the band seems to twist like a paper streamer.
    const half = (thickness * (0.18 + 0.82 * Math.abs(Math.cos(angle / 2)))) / 2;
    top.push(`${x},${(y - half).toFixed(1)}`);
    bottom.unshift(`${x},${(y + half).toFixed(1)}`);
  }
  return `M${top.join(" L")} L${bottom.join(" L")} Z`;
}

const RIBBONS = [
  { d: ribbon(150, 60, 70, 720, 0), fill: "url(#rb-orange)", cls: "rb-1" },
  { d: ribbon(330, 80, 110, 1440, 1.4), fill: "url(#rb-lilac)", cls: "rb-2" },
  { d: ribbon(470, 50, 60, 720, 2.6), fill: "url(#rb-pink)", cls: "rb-3" },
  { d: ribbon(260, 40, 26, 480, 0.8), fill: "rgba(255,255,255,.35)", cls: "rb-4" },
];

const instruments = {
  guitar: (
    <>
      <path d="m11.5 12.5 7-7" />
      <path d="m17 3 4 4-2 2-4-4Z" />
      <path d="M10.6 9.4c-1.7-.5-3.6 0-4.8 1.2-1 1-1 2.3-1.6 2.9-.8.8-2.6.6-3 2.2-.5 1.8 1.1 4.3 3.4 5.4 1.6.8 3.2.4 4-.4.8-.8.4-2 1.4-3s2.2-.5 3.3-1.6c1.3-1.2 1.6-3.2 1.1-4.8" />
      <circle cx="8.5" cy="15.5" r="1.4" />
    </>
  ),
  piano: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7.5 13v7M12 13v7M16.5 13v7" />
      <rect x="6" y="4" width="3" height="9" rx=".6" fill="currentColor" />
      <rect x="10.5" y="4" width="3" height="9" rx=".6" fill="currentColor" />
      <rect x="15" y="4" width="3" height="9" rx=".6" fill="currentColor" />
    </>
  ),
  drum: (
    <>
      <ellipse cx="12" cy="9" rx="8" ry="3" />
      <path d="M4 9v7c0 1.7 3.6 3 8 3s8-1.3 8-3V9" />
      <path d="M4.5 12.5 9 18.5M19.5 12.5 15 18.5" />
      <path d="m3 2 7 6M21 2l-7 6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
    </>
  ),
  headphones: (
    <>
      <path d="M3 15v-3a9 9 0 0 1 18 0v3" />
      <rect x="2" y="14" width="5" height="7" rx="2" />
      <rect x="17" y="14" width="5" height="7" rx="2" />
    </>
  ),
  trumpet: (
    <>
      <path d="M2 10v4M2 12h11l8-5v10l-8-5" />
      <path d="M6 12v4M9.5 12v4" />
    </>
  ),
  violin: (
    <>
      <path d="M12 2v7M10 3h4" />
      <path d="M9.5 9C7.6 9 6.5 10.4 6.5 12c0 1.2 1 1.7 1 2.8S6.5 16.4 6.5 18c0 2 2 4 5.5 4s5.5-2 5.5-4c0-1.6-1-2.1-1-3.2s1-1.6 1-2.8c0-1.6-1.1-3-3-3" />
      <path d="M10.5 14h3M10.5 17h3" />
    </>
  ),
  flute: (
    <>
      <path d="M2.5 18.5 18.5 2.5l3 3-16 16Z" />
      <circle cx="9" cy="15" r=".9" fill="currentColor" />
      <circle cx="11.5" cy="12.5" r=".9" fill="currentColor" />
      <circle cx="14" cy="10" r=".9" fill="currentColor" />
    </>
  ),
  sax: (
    <>
      <path d="M15 2.5h3.5M17 2.5v3c0 1.4-1 2.2-2 2.9" />
      <path d="M15 8.4 11 12v5.5a3.5 3.5 0 0 1-7 0V16" />
      <path d="M4 16h3" />
      <circle cx="11" cy="14.5" r=".8" fill="currentColor" />
      <circle cx="11" cy="17.5" r=".8" fill="currentColor" />
    </>
  ),
  note: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" fill="currentColor" />
      <circle cx="18" cy="16" r="3" fill="currentColor" />
    </>
  ),
};

export type Instrument = keyof typeof instruments;

const FLOATERS: { name: Instrument; x: number; y: number; size: number; delay: number; dur: number }[] = [
  { name: "guitar", x: 6, y: 18, size: 46, delay: 0, dur: 9 },
  { name: "piano", x: 22, y: 70, size: 40, delay: -3, dur: 11 },
  { name: "note", x: 38, y: 12, size: 30, delay: -6, dur: 8 },
  { name: "drum", x: 52, y: 78, size: 42, delay: -2, dur: 10 },
  { name: "mic", x: 64, y: 20, size: 34, delay: -5, dur: 9.5 },
  { name: "violin", x: 78, y: 64, size: 44, delay: -1, dur: 12 },
  { name: "headphones", x: 90, y: 16, size: 38, delay: -7, dur: 10.5 },
  { name: "trumpet", x: 94, y: 82, size: 40, delay: -4, dur: 9 },
];

const CONFETTI = [
  { shape: "dot", x: 12, y: 46, c: "#ffd166" },
  { shape: "ring", x: 30, y: 30, c: "#ffffff" },
  { shape: "tri", x: 44, y: 58, c: "#a78bfa" },
  { shape: "sq", x: 58, y: 40, c: "#7ee0c3" },
  { shape: "dot", x: 72, y: 86, c: "#ff7aa8" },
  { shape: "tri", x: 84, y: 38, c: "#ffffff" },
  { shape: "sq", x: 18, y: 88, c: "#ffd166" },
  { shape: "ring", x: 68, y: 8, c: "#a78bfa" },
  { shape: "dot", x: 97, y: 50, c: "#ffffff" },
  { shape: "tri", x: 3, y: 70, c: "#ff7aa8" },
];

export function InstrumentIcon({ name, size = 24 }: { name: Instrument; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {instruments[name]}
    </svg>
  );
}

export default function StreamerBackground({ variant = "section" }: { variant?: "section" | "auth" | "dash" }) {
  return (
    <div className={`streamer streamer-${variant}`} aria-hidden="true">
      <svg className="streamer-ribbons" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rb-orange" x1="0" x2="1">
            <stop offset="0" stopColor="#c4b5fd" />
            <stop offset=".5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="rb-lilac" x1="0" x2="1">
            <stop offset="0" stopColor="#b98cff" stopOpacity=".75" />
            <stop offset="1" stopColor="#e3b6ff" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="rb-pink" x1="0" x2="1">
            <stop offset="0" stopColor="#ff7aa8" stopOpacity=".8" />
            <stop offset="1" stopColor="#c4b5fd" stopOpacity=".7" />
          </linearGradient>
        </defs>
        {RIBBONS.map((r) => (
          <g key={r.cls} className={`ribbon ${r.cls}`}>
            <path d={r.d} fill={r.fill} />
          </g>
        ))}
      </svg>
      {CONFETTI.map((c, i) => (
        <span key={i} className={`confetti confetti-${c.shape}`} style={{ left: `${c.x}%`, top: `${c.y}%`, color: c.c, animationDelay: `${-i * 1.3}s` }} />
      ))}
      {FLOATERS.map((f) => (
        <span key={f.name} className="floater" style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}>
          <InstrumentIcon name={f.name} size={f.size} />
        </span>
      ))}
    </div>
  );
}
