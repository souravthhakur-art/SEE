import React from "react";

interface LogoProps {
  floating?: boolean;
  variant?: "nav" | "footer";
  className?: string;
}

export default function Logo({ floating = false, variant = "nav", className = "" }: LogoProps) {
  // Determine colors based on state and variant
  let textColor = "text-forest";
  let accentColor = "text-gold";
  let dividerColor = "stroke-gold/40";

  if (variant === "footer") {
    textColor = "text-ivory";
    accentColor = "text-gold-light";
    dividerColor = "stroke-gold-light/30";
  } else if (floating) {
    textColor = "text-ivory";
    accentColor = "text-gold-light";
    dividerColor = "stroke-gold-light/30";
  }

  const hasHeightClass = className.includes("h-");
  const heightClass = hasHeightClass ? "" : "h-11 md:h-14";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 96"
      className={`w-auto transition-all duration-500 ease-in-out ${textColor} ${heightClass} ${className}`}
      id="palum-dhara-logo"
    >
      {/* "Palum Dhara" Text as a single centered group */}
      <text
        x="90"
        y="45"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif"
        fontWeight="500"
        className="fill-current text-[25px] md:text-[26px] font-medium tracking-[0.02em] select-none"
      >
        Palum Dhara
      </text>

      {/* Elegant swoosh/swash under "Palum" extending from the base of the "D" */}
      <path
        d="M 32,49.5 C 52,53.5 78,53.5 96,46 C 78,50 52,50 32,49.5 Z"
        className="fill-current"
      />

      {/* Horizontal dividers and the central floral/quatrefoil gold emblem */}
      <g className={accentColor}>
        {/* Left divider line */}
        <line
          x1="32"
          y1="70"
          x2="80"
          y2="70"
          className={dividerColor}
          strokeWidth="0.75"
          strokeLinecap="round"
        />

        {/* Golden central emblem (artisan quatrefoil) */}
        <g transform="translate(90, 70)">
          {/* Center tiny core */}
          <circle cx="0" cy="0" r="1.2" className="fill-current" />
          {/* North petal */}
          <path
            d="M 0,-1.2 C -0.8,-2.5 0,-5 0,-5 C 0,-5 0.8,-2.5 0,-1.2 Z"
            className="fill-current"
          />
          {/* South petal */}
          <path
            d="M 0,1.2 C -0.8,2.5 0,5 0,5 C 0,5 0.8,2.5 0,1.2 Z"
            className="fill-current"
          />
          {/* East petal */}
          <path
            d="M 1.2,0 C 2.5,-0.8 5,0 5,0 C 5,0 2.5,0.8 1.2,0 Z"
            className="fill-current"
          />
          {/* West petal */}
          <path
            d="M -1.2,0 C -2.5,-0.8 -5,0 -5,0 C -5,0 -2.5,0.8 -1.2,0 Z"
            className="fill-current"
          />
          {/* Accent diamond dots flanking the emblem */}
          <circle cx="2.5" cy="-2.5" r="0.4" className="fill-current opacity-70" />
          <circle cx="-2.5" cy="-2.5" r="0.4" className="fill-current opacity-70" />
          <circle cx="2.5" cy="2.5" r="0.4" className="fill-current opacity-70" />
          <circle cx="-2.5" cy="2.5" r="0.4" className="fill-current opacity-70" />
        </g>

        {/* Right divider line */}
        <line
          x1="100"
          y1="70"
          x2="148"
          y2="70"
          className={dividerColor}
          strokeWidth="0.75"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
