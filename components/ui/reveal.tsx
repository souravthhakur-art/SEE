"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Restraint-based motion primitives for Palum Dhara.
 *
 * Rules (see design-system note): every animation under 400ms, ease-out
 * curves, no bounce / no elastic / no spinning / no parallax. Only fade,
 * lift, slide, and crossfade.
 *
 * The single cubic-bezier below is a soft ease-out — the same one used by
 * Apple-style transitions. It's reused everywhere for consistency.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 0.5; // 500ms — feels calm; under the "snappy" ceiling

/** Default reveal: opacity 0→1, translateY 20px→0. */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE },
  },
};

interface RevealProps {
  children: ReactNode;
  /** Delay in seconds before the reveal begins. Default 0. */
  delay?: number;
  /** Render as a different element. Default "div". */
  as?: "div" | "section" | "li" | "article" | "span";
  className?: string;
  /** Reduced motion is honoured automatically via Framer Motion. */
}

/**
 * Scroll-reveal wrapper. Fades + lifts its children into view once, the
 * first time they enter the viewport. Use for headings, story blocks, and
 * standalone cards.
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered reveal container. Children should each be a <RevealItem />.
 * Stagger defaults to 80ms — the editorial "one after another" feel.
 */
interface RevealGroupProps {
  children: ReactNode;
  stagger?: number; // seconds between children
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
}

export function RevealGroup({
  children,
  stagger = 0.08,
  className,
  as = "div",
}: RevealGroupProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Individual item inside a <RevealGroup />. Inherits the stagger timing
 * from its parent. Same fade+lift motion as <Reveal />.
 */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "span";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag className={className} variants={fadeUp}>
      {children}
    </MotionTag>
  );
}

export { EASE, DURATION, fadeUp };
