interface BrandProps {
  className?: string;
}

export default function Brand({ className = "" }: BrandProps) {
  return (
    <span className={`brand-lockup ${className}`}>
      <svg className="brand-symbol" viewBox="0 0 36 36" aria-hidden="true">
        <rect x="1" y="1" width="34" height="34" rx="10" fill="currentColor" />
        <path d="M8.5 10h10v3.2h-6.5v8.5c0 2.2-1.2 3.6-3.5 3.6H7v-3.1h1.2c.7 0 1-.4 1-1.2V10Z" fill="#fff" />
        <path d="m20 19.2 3 3 6-7" fill="none" stroke="#d6e5d9" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="brand-name"><span>Job</span><span>Fit</span></span>
    </span>
  );
}