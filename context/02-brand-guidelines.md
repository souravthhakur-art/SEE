# Brand Guidelines

**Purpose** — Prevent AI and developers from drifting into generic, Western, or template aesthetics. This document defines what Palum Dhara looks, feels, and sounds like.

**Scope** — Visual identity, tone, photography, motion, and audience-specific principles. UI implementation rules live in `03-ui-design-system.md`.

**Contents** — Philosophy, personality, tone, typography, color, editorial, Guler inspiration, photography, motion, audience principles, anti-patterns.

**Update Rules** — Update only when brand decisions change. Do not add UI implementation details here.

---

## Brand Philosophy

Palum Dhara is Indian first. Not "Indian-inspired." Not "global with Indian touches." The aesthetic starts here — from Guler miniature painting, from the palette of the hills, from the rhythm of Indian daily life — and translates into modern digital craft.

We reject the assumption that premium means Western. We reject the idea that Indian design must be loud or ornate to be authentic. Our space is the quiet middle: refined, warm, culturally rooted, unmistakably Indian.

## Brand Personality

| Trait | Means |
|---|---|
| Refined | Every detail is considered. Nothing sloppy. |
| Warm | Inviting, not cold. Human, not corporate. |
| Rooted | Draws from real Indian art and life, not stereotypes. |
| Confident | Doesn't shout. Doesn't apologize. |
| Accessible | Premium doesn't mean exclusive. It means excellent. |

## Tone of Voice

- Direct and clear. No jargon. No fluff.
- Warm but not casual. We're not your friend. We're your trusted brand.
- Culturally fluent. We use Indian English naturally — not forced, not apologetic.
- Short sentences. Active voice. Respect the reader's time.

Do: *"Crafted for everyday elegance."*
Don't: *"Elevate your lifestyle with our curated artisanal collection."*

## Typography

- Primary typeface: Clean, modern sans-serif with good Indian language support
- Display typeface: Used sparingly for headlines and brand moments
- Hierarchy is strict: one size per level, no exceptions
- Body text is always readable — never sacrifice legibility for style

Specific font names and sizes are documented in `03-ui-design-system.md`.

## Colour Palette

The palette is warm, earthy, and rooted in the Indian landscape — not Scandinavian neutrals, not neon, not "luxury black and gold."

| Role | Character |
|---|---|
| Primary | Warm, deep — earth or spice tones |
| Secondary | Supporting warm tones — lighter, complementary |
| Background | Warm off-white or cream, never pure white |
| Text | Dark warm grey or deep brown, never pure black |
| Accent | A single sharp colour for CTAs and highlights |

Exact hex values are documented in `03-ui-design-system.md`.

## Editorial Direction

- Product names are descriptive and clear
- Category names are simple and familiar
- Marketing copy follows the tone of voice above
- No superlatives unless factually true ("best" requires proof)
- Indian spelling conventions (colour, not color) unless targeting international audience
- No unsupported health claims — see `CLAUDE.md` Legal Boundaries

## Guler Inspiration

Guler is a school of Pahari miniature painting from the Himalayan foothills. Key principles we draw from:

- **Delicate line work** — Precision without rigidity. Every stroke is intentional.
- **Natural palette** — Earth tones, soft greens, muted reds, warm yellows from mineral pigments
- **Composed layouts** — Clear hierarchy, balanced but not symmetric, breathing space
- **Narrative depth** — Every element tells a story. Nothing is decorative for its own sake.
- **Intimacy** — The scale is human. The feeling is personal, not monumental.

We do not reproduce Guler paintings. We translate their principles into digital design.

## Photography Principles

- Natural light, warm tones
- Products shown in context — in Indian homes, with Indian textures
- No sterile white backgrounds for hero imagery
- Close-ups show craft and material quality
- People, if shown, are real and relatable — not models in Western settings
- Color accuracy is non-negotiable
- Never use AI-generated images of people — see `CLAUDE.md` Legal Boundaries

## Motion Principles

- Smooth, unhurried, confident
- Transitions feel natural — like turning a page, not like a tech demo
- No bouncy, playful, or attention-seeking animations
- Motion serves function: guiding attention, showing state changes, maintaining context
- Respect `prefers-reduced-motion`

## Audience Principles

Our audience: Indian premium consumers. Young families. Professionals. Gift buyers. Health-conscious households. People who value authenticity more than status.

The website should always feel welcoming, never intimidating.

Technical implications for this audience:

- **Performance over polish** — A fast site on a slow connection beats a beautiful site that doesn't load
- **Familiar patterns** — Use ecommerce conventions users already know. Don't innovate on basic flows.
- **Clear value** — Price, product details, and trust signals must be immediately visible
- **Low-bandwidth friendly** — Optimize images aggressively. Lazy-load everything below the fold.
- **Regional readiness** — Architecture should support multiple languages, even if v1 is English-only
- **Mobile-first, mobile-only for many** — Design and test for 2G/3G connections on budget phones

## Things We Never Do

- Scandinavian minimalism (cold, grey, sterile)
- Generic luxury (black, gold, serif fonts, "exclusive" language)
- Template ecommerce (stock photos, generic layouts, Bootstrap energy)
- Stereotypical Indian design (oversaturated colors, ornate borders, chaotic layouts)
- Western beauty standards in photography
- Dark mode as default
- Pure black (#000000) for text or backgrounds
- Gradient text
- Auto-playing video
- Pop-ups on page load
