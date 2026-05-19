// LMS Logo — exact replica of the uploaded brand logo
// Blue gradient graduation cap + "LMS" in bracket frame
const LMSLogo = ({ size = 40, showText = false, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px rgba(79,70,229,0.35))' }}>
      <defs>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A4FB3" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>
      </defs>
      {/* Book / Frame shape */}
      <rect x="12" y="28" width="76" height="58" rx="10" ry="10" fill="url(#frameGrad)" opacity="0.15" stroke="url(#frameGrad)" strokeWidth="3.5" />
      {/* Book notch bottom */}
      <path d="M35 86 Q50 96 65 86" stroke="url(#frameGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* LMS Text inside frame */}
      <text x="50" y="73" textAnchor="middle" fill="url(#textGrad)" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="26" letterSpacing="-1">LMS</text>
      {/* Graduation Cap board */}
      <polygon points="50,8 88,26 50,38 12,26" fill="url(#capGrad)" />
      {/* Cap top */}
      <rect x="43" y="4" width="14" height="8" rx="3" fill="#1565C0"/>
      {/* Cap tassel string */}
      <line x1="88" y1="26" x2="88" y2="44" stroke="#1565C0" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Cap tassel */}
      <circle cx="88" cy="47" r="4" fill="#1565C0"/>
    </svg>
    {showText && (
      <div className="flex flex-col leading-tight">
        <span className="font-heading font-extrabold text-primary text-sm leading-tight">LMS</span>
        <span className="font-body text-primary-deep text-[10px] tracking-wider uppercase leading-tight">Learning Management System</span>
      </div>
    )}
  </div>
);

export default LMSLogo;
