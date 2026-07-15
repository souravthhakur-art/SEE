# UI Design System

**Purpose** — Every reusable UI rule in one place. When in doubt, check here first.

**Scope** — Visual and interactive rules for all UI components. Brand rationale lives in `02-brand-guidelines.md`. Implementation conventions live in `05-code-standards.md`.

**Contents** — Navigation, hero, buttons, cards, forms, footer, newsletter, spacing, radius, shadows, typography, animations, responsive behaviour, accessibility.

**Update Rules** — Update when a new component is added or an existing pattern changes. Document the implementation as it exists, not as you wish it were.

---

## Navigation

- Fixed to top on scroll
- Logo left, navigation links center/right
- Hamburger menu on mobile — slides in from left or drops down
- Active state is clear but subtle (underline or colour change, not background highlight)
- Transparent over hero, solid on scroll
- No mega-menus. No dropdowns on desktop unless specifically required.

## Hero

- Full-width, full-viewport on desktop
- Image or video background with warm overlay for text legibility
- Headline + subtext + single CTA button
- Text left-aligned or centered, never right-aligned
- Minimum padding: 80px vertical on desktop, 48px on mobile
- Content area max-width: ~600px to keep lines readable

## Buttons

| Variant | Use |
|---|---|
| Primary | Main CTA — purchase, subscribe, submit |
| Secondary | Supporting actions — view more, learn more |
| Ghost/Text | Tertiary actions — links within text, dismiss |

Rules:

- Padding: 12px 24px (desktop), 10px 20px (mobile)
- Border-radius: 4px — slightly rounded, not pill-shaped
- Font weight: 600
- No icons inside buttons unless the icon is universally understood (arrow, search)
- Hover: subtle background darkening or colour shift, no scale transforms
- Focus: visible focus ring using brand accent colour, 2px offset
- Disabled: reduced opacity, no pointer events
- Loading state: spinner replaces text, button size doesn't change

## Cards

### Base Card

- Background: white or warm off-white
- Border: 1px solid, light warm grey
- Border-radius: 4px
- Padding: 24px
- Shadow: none at rest, subtle shadow on hover
- Hover transition: 200ms ease

### Product Card

- Image top, content bottom
- Image aspect ratio: 4:5 or 1:1 (consistent within a grid)
- Product name: one or two lines max, ellipsis on overflow
- Price: bold, below name
- No badge system in v1 unless explicitly required
- Click area: entire card is clickable
- Hover: subtle shadow lift, no image zoom

### Subscription Card

- Clear tier name
- Price with billing period
- Feature list with checkmarks
- Highlighted tier: accent border or background tint
- CTA button at bottom
- All tiers same height — use flexbox

## Forms

- Labels above inputs, never inside (no floating labels)
- Input height: 44px minimum for touch targets
- Border: 1px solid, light warm grey at rest
- Border: accent colour on focus
- Error state: red border + error message below
- Success state: green border or checkmark
- Placeholder text: light grey, never same colour as input text
- Required fields: asterisk on label, no "optional" label on non-required fields

## Footer

- Dark warm background (not pure black)
- 3–4 column layout on desktop, stacked on mobile
- Columns: brand/tagline, quick links, help/support, newsletter signup
- Social links: simple icons, no hover animations beyond colour change
- Copyright at very bottom
- Max-width matches content area

## Newsletter

- Can appear in footer and/or as a standalone section
- Single input (email) + submit button, inline on desktop, stacked on mobile
- Heading: short, clear value proposition
- No pre-checked consent boxes
- Success state: inline confirmation message, no page redirect

## Spacing Scale

| Token | Value | Use |
|---|---|---|
| xs | 4px | Inline gaps, icon padding |
| sm | 8px | Tight component spacing |
| md | 16px | Standard component padding |
| lg | 24px | Card padding, section inner spacing |
| xl | 32px | Section gaps |
| 2xl | 48px | Section padding (mobile) |
| 3xl | 64px | Section padding (desktop) |
| 4xl | 80px | Major section breaks |

## Border Radius

| Token | Value | Use |
|---|---|---|
| none | 0px | Avatars, full-bleed elements |
| sm | 2px | Subtle rounding |
| md | 4px | Buttons, cards, inputs |
| lg | 8px | Larger containers, modals |
| full | 9999px | Pills, badges (use sparingly) |

## Shadows

| Token | Value | Use |
|---|---|---|
| none | none | Default state for most elements |
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| md | 0 4px 12px rgba(0,0,0,0.08) | Hover states, dropdowns |
| lg | 0 8px 24px rgba(0,0,0,0.12) | Modals, overlays |

Shadows use warm-black rgba, not pure black.

## Typography Scale

| Level | Size (desktop) | Size (mobile) | Weight | Line-height |
|---|---|---|---|---|
| Display/H1 | 48px | 32px | 700 | 1.1 |
| H2 | 36px | 28px | 600 | 1.2 |
| H3 | 24px | 20px | 600 | 1.3 |
| H4 | 20px | 18px | 600 | 1.4 |
| Body | 16px | 16px | 400 | 1.6 |
| Body small | 14px | 14px | 400 | 1.5 |
| Caption | 12px | 12px | 400 | 1.4 |

## Animations

| Property | Duration | Easing | Use |
|---|---|---|---|
| Opacity | 200ms | ease | Fade in/out |
| Transform | 200ms | ease | Hover lifts, menu slides |
| Color | 150ms | ease | Button/link state changes |
| Layout | 300ms | ease-in-out | Page transitions, accordions |

- All animations respect `prefers-reduced-motion: reduce`
- No animations on page load that delay content visibility
- No parallax scrolling
- No scroll-jacking

## Responsive Behaviour

| Breakpoint | Width | Target |
|---|---|---|
| Mobile | < 640px | Primary target |
| Tablet | 640–1024px | Secondary |
| Desktop | > 1024px | Tertiary |

- Mobile-first CSS (min-width media queries)
- Single column on mobile, multi-column on tablet/desktop
- Navigation collapses to hamburger below 1024px
- Images scale down, never up
- Touch targets: minimum 44x44px on mobile
- No horizontal scroll. Ever.

## Accessibility

- All images have descriptive alt text
- Color is never the only indicator of state
- Focus rings are always visible (never `outline: none` without replacement)
- Interactive elements have `:focus-visible` styles
- Headings follow logical order (H1 → H2 → H3, no skipping)
- ARIA labels on icon-only buttons
- Form inputs have associated `label` elements
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- Skip-to-content link on every page
- All pages have a single `h1`
