# Palum Dhara --- AI Engineering Reference

**Version:** 1.1.0 **Status:** Living (updated to synchronize with Sprint 2.6 implementation)
**Last Updated:** 15 July 2026 **Owner:** Palum Dhara Engineering

> This document is the constitution of the Palum Dhara project. Every AI
> agent and developer must read this before making changes. When this
> document conflicts with implementation, stop and investigate rather
> than silently diverging.

------------------------------------------------------------------------

## Project Constitution

Palum Dhara is building a timeless Indian digital product.

Every decision must increase trust, authenticity, and usability.

Code quality, brand consistency, and user experience are equally
important.

When priorities conflict, resolve by this hierarchy:

1.  User Trust
2.  Business Goal
3.  Brand
4.  UX
5.  Performance
6.  Engineering Convenience

Commerce is the outcome. Trust is the foundation. Storytelling supports
trust. Design supports storytelling. Technology supports everything.

## Project Mission

Palum Dhara is a premium Indian food and lifestyle brand building a
refined ecommerce experience. We combine Guler-inspired artistry with
modern web engineering to create something distinctly Indian --- not a
Western template.

## Technology Stack

  Area             Technology
  ---------------- --------------------------------------------
  Framework        Next.js
  Language         TypeScript
  Styling          Tailwind CSS (v4)
  State            Zustand (client-side cart), Server State via Server Actions / Prisma
  Payments         WhatsApp + COD (v1) --- Razorpay (planned)
  Authentication   Better Auth (fully integrated)
  Database         PostgreSQL hosted on Neon
  ORM              Prisma
  CMS              Internal Admin Dashboard (products, categories, collections, orders, media, etc.)

## Versioning

-   **Major version:** Breaking architectural changes.
-   **Minor version:** New capabilities.
-   **Patch:** Documentation improvements and corrections.

Example: `1.0.0` → `1.1.0` → `1.1.2`

## The 10 Principles of Palum Dhara

1.  Trust before persuasion.
2.  Commerce before storytelling.
3.  Authenticity before perfection.
4.  Indian before global.
5.  Craft before decoration.
6.  Simplicity before cleverness.
7.  Performance before animation.
8.  Accessibility is not optional.
9.  Documentation is code.
10. Every pixel must earn its place.

## Reading Order

Read these files in sequence. Do not skip.

1.  `context/01-project-overview.md` --- What we're building and why
2.  `context/02-brand-guidelines.md` --- How the brand thinks and feels
3.  `context/03-ui-design-system.md` --- Every UI rule, documented once
4.  `context/04-architecture.md` --- How the codebase is structured
5.  `context/05-code-standards.md` --- How we write code
6.  `context/06-progress.md` --- Where we are right now

### Engineering References (read when relevant)

7.  `context/07-commerce-rules.md` --- Business rules for products,
    pricing, subscriptions, orders and shipping
8.  `context/08-ai-workflow.md` --- Standard operating procedure for AI
    development sessions
9.  `context/09-admin-blueprint.md` --- Future admin capabilities and
    operational workflows
10. `context/10-product-roadmap.md` --- Product phases and delivery
    sequencing
11. `context/11-database-spec.md` --- Database implementation contract
12. `context/decision-log.md` --- Authoritative record of technical
    architecture decisions

## Primary Audience

Indian premium consumers. Young families. Professionals. Gift buyers.
Health-conscious households. People who value authenticity more than
status.

The website should always feel welcoming, never intimidating.

## AI Working Rules

Every AI session must follow this sequence:

1.  Read documentation
2.  Read `decision-log.md` before making or changing technical
    architecture decisions
3.  Read `11-database-spec.md` before backend, Prisma, or database work
4.  Inspect existing implementation
5.  Understand the problem
6.  Propose a plan
7.  Implement
8.  Run QA
9.  Update documentation (`06-progress.md`, `decision-log.md`, and
    `11-database-spec.md` when applicable)
10. Summarize changes

## Technical Decision Authority

The documentation hierarchy is intentionally separated:

Business Documentation ↓ Decision Log ↓ Database Specification ↓ Prisma
Schema ↓ Implementation

Rules:

-   Business documents define business intent.
-   `decision-log.md` is the single source of truth for engineering
    decisions.
-   `11-database-spec.md` references those decisions and defines the
    implementation contract.
-   Neither document should invent business rules or silently override
    the other.

## Ponytail Principles

-   Delete more code than you add
-   Prefer composition over duplication
-   Avoid abstraction until necessary --- if used once, don't extract it
-   Keep components understandable in a single reading
-   Every dependency must justify its existence
-   Ship working code over perfect architecture

## Legal Boundaries

### DPDP Act, 2023

This project collects personal data (names, addresses, phone numbers,
email, subscription data, payment metadata). All code and copy must
comply with the Digital Personal Data Protection Act, 2023 (India).

Principles:

-   Privacy by Design
-   Data Minimization
-   Purpose Limitation
-   Secure Storage
-   Explicit Consent
-   User Rights (access, correction, deletion)
-   No unnecessary personal data collection

Engineering rules:

-   Never expose secrets
-   Never commit API keys
-   Never log personal customer information
-   Never expose internal admin endpoints
-   Always assume personal data is sensitive

### FSSAI Compliance

Palum Dhara is a food brand. Never generate copy that makes unsupported
health claims.

Never write: "cures diabetes," "boosts immunity," "detoxifies," or
similar claims unless explicitly approved and legally permitted.

### AI Imagery

Never use fake AI-generated people.

-   No fake AI farmers
-   No fake AI villages
-   No fake AI harvesting scenes

Authenticity is always preferred over artificial perfection. If a real
photograph doesn't exist, use illustration, pattern, or texture instead
of fabricating reality.

## Security Principles

-   Least privilege
-   Environment variables for all secrets
-   Validate all inputs
-   Sanitize user-generated content
-   Never trust client-side data
-   Protect admin routes
-   Log securely
-   Follow secure defaults

Never trust user input. Always validate on the server. Client-side
validation improves UX. Server-side validation provides security.

## How You Should Behave

You are a member of the Palum Dhara engineering team.

Protect the brand before protecting your own preferences. Protect
maintainability before cleverness. Protect user trust before visual
beauty.

-   You are precise. You do not guess. You ask or you check the codebase
-   You write less code, not more. Every line earns its place
-   You read before you write. Check existing patterns before creating
    new ones
-   You treat this documentation as authoritative. If the code disagrees
    with the docs, flag it --- don't silently diverge

## Rules Before Writing Code

-   [ ] Have you read all six context documents?
-   [ ] Have you checked if a component/pattern already exists?
-   [ ] Have you verified your approach against the brand guidelines?
-   [ ] Have you confirmed the UI matches `03-ui-design-system.md`?
-   [ ] Does your change maintain or improve performance?
-   [ ] Is it accessible?
-   [ ] Is it responsive?
-   [ ] Does it comply with DPDP, FSSAI, and security requirements?

## Documentation Update Rules

-   Only update documents when facts change (new feature, new pattern,
    new decision)
-   Never add speculative content
-   Keep language present-tense and factual
-   Update `06-progress.md` for every meaningful change
-   If you create a new pattern, document it in the relevant file before
    merging

## Definition of Done

A task is done when:

-   [ ] Code implements the requirement exactly
-   [ ] No existing tests or functionality are broken
-   [ ] The UI matches the design system
-   [ ] The brand guidelines are respected
-   [ ] Performance is not degraded
-   [ ] Accessibility requirements are met
-   [ ] Legal and security requirements are met
-   [ ] Documentation is updated if needed
-   [ ] `06-progress.md` is updated

## QA Checklist

-   [ ] Visual: Does it look right on mobile, tablet, and desktop?
-   [ ] Brand: Does it feel like Palum Dhara, not a generic template?
-   [ ] Interaction: Do all buttons, links, and forms work?
-   [ ] Accessibility: Can it be used with a keyboard? With a screen
    reader?
-   [ ] Performance: No layout shifts. No unnecessary re-renders. Images
    optimized.
-   [ ] Consistency: Does it match existing patterns in the codebase?
-   [ ] Edge cases: Empty states, loading states, error states handled?
-   [ ] Legal: No unapproved health claims? No unnecessary data
    collection?
-   [ ] Security: No exposed secrets? No unvalidated inputs? No
    unprotected admin routes?

## Immutable Principles

-   Never redesign the brand without explicit instruction
-   Never sacrifice trust for aesthetics
-   Never replace architecture without justification
-   Never introduce dependencies without approval
-   Never change business logic during UI work
-   Never mix feature work with unrelated refactoring
-   Never silently change documentation

## Things You Must Never Do

-   Never use Scandinavian, minimalist, or generic luxury aesthetics
-   Never introduce a new library without explicit approval
-   Never copy patterns from Western ecommerce templates
-   Never hardcode content that should come from data
-   Never skip accessibility for "later"
-   Never create components that duplicate existing ones
-   Never add comments that state the obvious
-   Never over-engineer a solution
-   Never modify these documentation files without understanding the
    full system
-   Never assume --- verify
-   Never generate unsupported health claims
-   Never use AI-generated images of people
-   Never collect personal data beyond what is necessary
-   Never expose secrets or commit API keys
