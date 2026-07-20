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
      {/* "Palum" Text */}
      <text
        x="5"
        y="48"
        fontFamily="'Cormorant Garamond', serif"
        fontWeight="500"
        className="fill-current text-[27px] font-medium tracking-[0.01em] select-none"
      >
        Palum
      </text>

      {/* "Dhara" Text */}
      <text
        x="98"
        y="48"
        fontFamily="'Cormorant Garamond', serif"
        fontWeight="500"
        className="fill-current text-[27px] font-medium tracking-[0.01em] select-none"
      >
        Dhara
      </text>

      {/* Elegant swoosh/swash under "Palum" extending from the base of the "D" */}
      <path
        d="M 12,55 C 40,58 70,57 98,49 C 70,51 40,51 12,55 Z"
        className="fill-current"
      />

      {/* Horizontal dividers and the central floral/quatrefoil gold emblem */}
      <g className={accentColor}>
        {/* Left divider line */}
        <line
          x1="12"
          y1="72"
          x2="78"
          y2="72"
          className={dividerColor}
          strokeWidth="0.75"
          strokeLinecap="round"
        />

        {/* Golden central emblem (artisan quatrefoil) */}
        <g transform="translate(90, 72)">
          {/* Center tiny core */}
          <circle cx="0" cy="0" r="1.2" className="fill-current" />
          {/* North petal */}
          <path
            d="M 0,-1.2 C -1,-2.8 0,-6 0,-6 C 0,-6 1,-2.8 0,-1.2 Z"
            className="fill-current"
          />
          {/* South petal */}
          <path
            d="M 0,1.2 C -1,2.8 0,6 0,6 C 0,6 1,2.8 0,1.2 Z"
            className="fill-current"
          />
          {/* East petal */}
          <path
            d="M 1.2,0 C 2.8,-1 6,0 6,0 C 6,0 2.8,1.2 1.2,0 Z"
            className="fill-current"
          />
          {/* West petal */}
          <path
            d="M -1.2,0 C -2.8,-1 -6,0 -6,0 C -6,0 -2.8,1.2 -1.2,0 Z"
            className="fill-current"
          />
          {/* Faint elegant diagonal accent dots */}
          <circle cx="2.8" cy="-2.8" r="0.4" className="fill-current opacity-70" />
          <circle cx="-2.8" cy="-2.8" r="0.4" className="fill-current opacity-70" />
          <circle cx="2.8" cy="2.8" r="0.4" className="fill-current opacity-70" />
          <circle cx="-2.8" cy="2.8" r="0.4" className="fill-current opacity-70" />
        </g>

        {/* Right divider line */}
        <line
          x1="102"
          y1="72"
          x2="168"
          y2="72"
          className={dividerColor}
          strokeWidth="0.75"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
