/* StayFit UI Kit — Icons
   Inline Lucide-style line icons (stroke 2.25, round caps) lifted from the
   codebase, plus the brand mark. Exported to window for sibling scripts. */

function Icon({ d, size = 22, sw = 2.25, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children || (Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />)}
    </svg>
  );
}

const IcUser   = (p) => <Icon {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const IcEdit   = (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Icon>;
const IcPlus   = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const IcSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
const IcStats  = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
const IcCamera = (p) => <Icon {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Icon>;
const IcBarcode= (p) => <Icon {...p}><path d="M3 5v14M7.5 5v14M12 5v14M16.5 5v14M21 5v14"/></Icon>;
const IcX      = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
const IcChevL  = (p) => <Icon {...p}><polyline points="15 18 9 12 15 6"/></Icon>;
const IcChevR  = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>;
const IcChevD  = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
const IcSun    = (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></Icon>;
const IcMoon   = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
const IcCheck  = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;

function BrandMark({ size = 44, theme = "light" }) {
  const from = theme === "dark" ? "#1eaa52" : "#E89B7B";
  const to   = theme === "dark" ? "#007d48" : "#D97757";
  const id = "bm" + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" style={{ borderRadius: size * 0.24 }}>
      <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={from}/><stop offset="100%" stopColor={to}/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="112" fill={`url(#${id})`}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontFamily="Plus Jakarta Sans, sans-serif" fontSize="320" fontWeight="800"
        letterSpacing="-12" fill="#fff">S</text>
    </svg>
  );
}

Object.assign(window, {
  Icon, IcUser, IcEdit, IcPlus, IcSearch, IcStats, IcCamera, IcBarcode,
  IcX, IcChevL, IcChevR, IcChevD, IcSun, IcMoon, IcCheck, BrandMark,
});
