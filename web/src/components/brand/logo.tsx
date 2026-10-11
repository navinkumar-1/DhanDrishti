export function LogoMark({ size = 28, radius = 8 }: { size?: number; radius?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx={radius} fill="#1A6DFF" />
      <path
        d="M5.5 16.5c2.2-3.6 5-5.6 10.5-5.6s8.3 2 10.5 5.6c-2.2 3.6-5 5.6-10.5 5.6S7.7 20.1 5.5 16.5z"
        fill="none"
        stroke="white"
        strokeWidth="1.7"
      />
      <circle cx="16" cy="16.5" r="3.1" fill="white" />
      <path d="M15.2 15.2h1.7M14.7 16.3h2.5M15.1 17.4h1.6M16 17.4v1.5" stroke="#1A6DFF" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
