import React from 'react'

interface Props {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function Logo({ size = 40, className = '', style }: Props) {
  const id = 'lg'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <radialGradient id={`${id}rg`} cx="38%" cy="28%" r="72%" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#e879f9" />
          <stop offset="25%"  stopColor="#a855f7" />
          <stop offset="55%"  stopColor="#6366f1" />
          <stop offset="78%"  stopColor="#0891b2" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id={`${id}glow`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${id}sg`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(124,58,237,0.7)" />
        </filter>
        <clipPath id={`${id}clip`}>
          <polygon points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5" />
        </clipPath>
      </defs>

      {/* Drop shadow layer */}
      <polygon
        points="20,4 37,13 37,28 20,37 3,28 3,13"
        fill="rgba(100,30,220,0.4)"
        style={{ filter: 'blur(4px)', transform: 'translateY(2px)' }}
      />

      {/* Main gem body */}
      <polygon
        points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
        fill={`url(#${id}rg)`}
        filter={`url(#${id}sg)`}
      />

      {/* Facet group - clipped to gem shape */}
      <g clipPath={`url(#${id}clip)`}>
        {/* Top-center triangle: upper bright facet */}
        <polygon points="20,2 37,11.5 20,18 3,11.5" fill="rgba(255,255,255,0.16)" />
        {/* Left facet */}
        <polygon points="3,11.5 20,18 3,28.5" fill="rgba(0,0,0,0.13)" />
        {/* Right facet */}
        <polygon points="37,11.5 37,28.5 20,18" fill="rgba(255,255,255,0.06)" />
        {/* Bottom facet */}
        <polygon points="20,18 3,28.5 20,38 37,28.5" fill="rgba(0,0,0,0.18)" />

        {/* Inner cut lines */}
        <line x1="3"  y1="11.5" x2="37" y2="11.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
        <line x1="3"  y1="28.5" x2="37" y2="28.5" stroke="rgba(0,0,0,0.28)"       strokeWidth="0.6" />
        <line x1="20" y1="2"    x2="20" y2="18"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
        <line x1="20" y1="18"   x2="3"  y2="11.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
        <line x1="20" y1="18"   x2="37" y2="11.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />

        {/* Gloss highlight */}
        <ellipse cx="13.5" cy="8.5" rx="5.5" ry="2.8"
          fill="rgba(255,255,255,0.28)"
          style={{ transform: 'rotate(-18deg)', transformOrigin: '13.5px 8.5px' }}
        />
      </g>

      {/* Outer gem outline */}
      <polygon
        points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.6"
      />

      {/* "L" letterform path */}
      <path
        d="M14 11 L14 29 L28 29 L28 25.5 L17.5 25.5 L17.5 11 Z"
        fill="white"
        fillOpacity="0.92"
        filter={`url(#${id}glow)`}
      />
    </svg>
  )
}
