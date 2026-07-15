import type { SVGProps } from "react";

/**
 * Guler / Pahari-miniature inspired decorative ornaments.
 *
 * Pure line art. Designed to sit at very low opacity (3–8%) so they read as
 * a faint hand-drawn layer, never competing with product photography.
 *
 * All strokes use `currentColor` so each ornament can be tinted by its
 * container's text color.
 */

/** Editorial section divider — a central rosette with curling vines & leaves. */
export function Divider({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* horizontal rule */}
      <path d="M4,12 L120,12" opacity="0.45" />
      <path d="M200,12 L316,12" opacity="0.45" />
      {/* left vine */}
      <g transform="translate(132,12)" opacity="0.7">
        <path d="M0,0 C8,-7 14,-7 20,0 C14,3 8,3 0,0 Z" />
        <path d="M3,0 C7,-3 12,-3 16,0" opacity="0.5" />
        <circle cx="-4" cy="-2" r="0.9" />
        <circle cx="-4" cy="2" r="0.9" />
      </g>
      {/* right vine (mirrored) */}
      <g transform="translate(188,12) scale(-1,1)" opacity="0.7">
        <path d="M0,0 C8,-7 14,-7 20,0 C14,3 8,3 0,0 Z" />
        <path d="M3,0 C7,-3 12,-3 16,0" opacity="0.5" />
        <circle cx="-4" cy="-2" r="0.9" />
        <circle cx="-4" cy="2" r="0.9" />
      </g>
      {/* central rosette */}
      <g transform="translate(160,12)">
        <circle r="3.4" opacity="0.8" />
        <path d="M0,-8 C2.4,-5.6 2.4,-3.2 0,-2 C-2.4,-3.2 -2.4,-5.6 0,-8 Z" opacity="0.75" />
        <path d="M0,8 C2.4,5.6 2.4,3.2 0,2 C-2.4,3.2 -2.4,5.6 0,8 Z" opacity="0.75" />
        <path d="M-8,0 C-5.6,-2.4 -3.2,-2.4 -2,0 C-3.2,2.4 -5.6,2.4 -8,0 Z" opacity="0.75" />
        <path d="M8,0 C5.6,-2.4 3.2,-2.4 2,0 C3.2,2.4 5.6,2.4 8,0 Z" opacity="0.75" />
        <circle r="0.9" />
      </g>
    </svg>
  );
}

/** Flowing botanical creeper — for the newsletter background. */
export function Creeper({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* main stem */}
      <path d="M-10,170 C80,150 120,110 180,120 C240,130 280,80 340,90 C400,100 440,60 500,70 C560,78 600,50 620,55" opacity="0.6" />
      <path d="M-10,40 C70,60 110,30 170,48 C230,66 270,30 330,46 C390,60 430,28 490,42 C550,52 600,30 620,34" opacity="0.45" />
      {/* leaves along the main stem */}
      <g opacity="0.7">
        <path d="M60,158 C70,148 82,148 90,156 C82,162 70,162 60,158 Z" />
        <path d="M150,128 C162,118 174,118 182,128 C174,134 162,134 150,128 Z" />
        <path d="M250,104 C262,94 274,94 282,104 C274,110 262,110 250,104 Z" />
        <path d="M360,90 C372,80 384,80 392,90 C384,96 372,96 360,90 Z" />
        <path d="M460,68 C472,58 484,58 492,68 C484,74 472,74 460,68 Z" />
        <path d="M540,58 C552,48 564,48 572,58 C564,64 552,64 540,58 Z" />
      </g>
      {/* small flower buds */}
      <g opacity="0.65">
        <circle cx="118" cy="118" r="2.4" />
        <path d="M118,115 L118,111 M115,116 L112,113 M121,116 L124,113" />
      </g>
      <g opacity="0.65">
        <circle cx="300" cy="86" r="2.4" />
        <path d="M300,83 L300,79 M297,84 L294,81 M303,84 L306,81" />
      </g>
      <g opacity="0.65">
        <circle cx="478" cy="64" r="2.4" />
        <path d="M478,61 L478,57 M475,62 L472,59 M481,62 L484,59" />
      </g>
    </svg>
  );
}

/** Tiny corner motif — a single leaf-bud, for product card corners. */
export function CornerMotif({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* small corner leaf-bud curling inward */}
      <path d="M4,4 C12,6 16,10 18,18 C20,26 24,30 32,32" opacity="0.6" />
      <path d="M8,8 C13,9 16,12 17,17" opacity="0.45" />
      <path d="M14,14 C12,13 10,14 10,16 C10,18 12,19 14,18 C15,17 15,15 14,14 Z" opacity="0.7" />
      <circle cx="22" cy="22" r="1" opacity="0.6" />
    </svg>
  );
}

/** Small leaf bullet — sits beside editorial section labels. */
export function LeafBullet({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M8,14 L8,4" opacity="0.55" />
      <path d="M8,11 C5,10 3,8 3,5 C6,5 8,7 8,11 Z" opacity="0.75" />
      <path d="M8,9 C11,8 13,6 13,3 C10,3 8,5 8,9 Z" opacity="0.75" />
    </svg>
  );
}
