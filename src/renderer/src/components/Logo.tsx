export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#08080f" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#0d0d1b" />

      {/* Glow layer */}
      <path
        d="M 22 8 A 10.5 10.5 0 1 0 22 24"
        stroke="url(#lg-glow)"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.18"
      />
      {/* Main C arc */}
      <path
        d="M 22 8 A 10.5 10.5 0 1 0 22 24"
        stroke="url(#lg-main)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Top node ring */}
      <circle cx="22" cy="8"  r="3"   fill="#0d0d1b" />
      <circle cx="22" cy="8"  r="3"   fill="none" stroke="#ff6b35" strokeWidth="1.5" />
      <circle cx="22" cy="8"  r="1"   fill="#ff9a6c" />

      {/* Bottom node ring */}
      <circle cx="22" cy="24" r="3"   fill="#0d0d1b" />
      <circle cx="22" cy="24" r="3"   fill="none" stroke="#ff6b35" strokeWidth="1.5" />
      <circle cx="22" cy="24" r="1"   fill="#ff9a6c" />

      {/* Top circuit trace */}
      <rect x="22" y="7"  width="6" height="2" rx="1" fill="#ff6b35" opacity="0.65" />
      <rect x="26" y="4"  width="2" height="5" rx="1" fill="#ff6b35" opacity="0.45" />

      {/* Bottom circuit trace */}
      <rect x="22" y="23" width="6" height="2" rx="1" fill="#ff6b35" opacity="0.65" />
      <rect x="26" y="23" width="2" height="5" rx="1" fill="#ff6b35" opacity="0.45" />

      {/* Terminal dots */}
      <circle cx="27" cy="4"  r="1.2" fill="#ff9a6c" opacity="0.7" />
      <circle cx="27" cy="28" r="1.2" fill="#ff9a6c" opacity="0.7" />

      <defs>
        <linearGradient id="lg-main" x1="22" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffb085" />
          <stop offset="50%"  stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#cc3a00" />
        </linearGradient>
        <linearGradient id="lg-glow" x1="22" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ff9a6c" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
      </defs>
    </svg>
  )
}
