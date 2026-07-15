# Sprint 2.4 Handoff: Customer Accounts & Authentication

**Status:** Completed
**Version:** 1.0
**Owner:** Palum Dhara Engineering
**Depends on:** `00-decision-log.md`, `04-architecture.md`, `06-progress.md`, `11-database-spec.md`

---

## Executive Summary

Sprint 2.4 successfully completes the **Customer Accounts and Authentication** foundation of Palum Dhara. By integrating **Better Auth** with our production database (PostgreSQL via Prisma), we have established a secure, beautiful, and brand-aligned customer gateway. We have replaced the traditional, sterile login/register patterns with a seamless entry experience styled with our signature Pahari visual system.

Logged-in customers can now access a complete **Account Dashboard** (`/account`) where they can manage their profiles, register multiple shipping/billing addresses, configure newsletter stories preferences, and control security parameters.

---

## Technical Architecture

### 1. Customer Authentication (Better Auth)
The authentication layer is powered by **Better Auth**, configured to work with Prisma and our PostgreSQL database. 
- **Endpoint**: All auth requests are handled by Next.js API Routes at `/app/api/auth/[...auth]/route.ts`.
- **Client Client**: `authClient` is instantiated in `lib/auth-client.ts` for safe, type-safe client-side interactions (`signUp.email`, `signIn.email`, `signOut`, `useSession`).
- **Session Management**: Session state is persisted securely on the database with corresponding cookie verification on the client, fully compatible with Next.js App Router server components.

### 2. Unified User Model
Our identity database model has been unified under the `User` table, mapping directly to customer accounts as well as administrative roles:
- **`role`**: Identifies user permission tier (`user` by default, `admin` for administrators).
- **`banned`, `banReason`, `banExpires`**: Integrated controls for suspension and moderation.
- **`marketingConsent`**: Captured on registration and synced directly with newsletter-stories preferences.

### 3. Route Protection & Verification
Route protection is handled server-side to prevent flickering or layout shifts:
- `/app/account/page.tsx` checks session via `getCurrentSession()` in `lib/session.ts` (retrieved via Better Auth API from headers securely). Unauthenticated users are redirected to `/sign-in` with a `redirectTo` search parameter.
- Logged-in users who are `admin` are redirected to `/admin` automatically when hitting the guest gateway.

---

## Database Schema Updates

The following tables and relations are implemented in `prisma/schema.prisma` and applied via migrations:

### `User` Table Modifications
```prisma
model User {
  id               String    @id @default(cuid())
  fullName         String
  email            String    @unique
  phone            String?   @unique
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  emailVerified    Boolean   @default(false)
  image            String?
  role             String    @default("user")
  banned           Boolean   @default(false)
  banReason        String?
  banExpires       DateTime?
  marketingConsent Boolean   @default(false)
  addresses        Address[]
  accounts         Account[]
  sessions         Session[]
}
```

### `Address` Model (New)
A flexible table enabling multiple saved addresses per customer:
```prisma
model Address {
  id                String   @id @default(cuid())
  userId            String
  label             String?  // e.g. "Home", "Work"
  addressLine1      String
  addressLine2      String?
  city              String
  state             String
  postalCode        String
  country           String   @default("India")
  phone             String?
  isDefault         Boolean  @default(false)
  isDefaultShipping Boolean  @default(false)
  isDefaultBilling  Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Front-End & UX Polish

### 1. Brand-Aligned Gateway
The `/sign-in` page has been redesigned as an invitation into our community:
- **Warm copy**: Refined page headings to read *"The Palum Dhara Community"* and added the welcoming copy: *"Become part of the Palum Dhara community and enjoy a more personal experience."*
- **Aesthetic Pairings**: Editorial Cormorant Garamond headings paired with Inter body text, set within an elegant, low-opacity border container.

### 2. Single Account Entry in Navigation
We replaced traditional "Login / Register" text with a single elegant account entryway:
- **Desktop Navigation**: Renders a minimalist `👤` (Lucide User) icon which functions as the sole entry point. When authenticated, it acts as a trigger for a dropdown menu containing:
  - My Account
  - Addresses
  - Preferences
  - Logout
- **Mobile Navigation**: Collapses cleanly to a single menu section with contextual links and a clear "Account" label accompanied by the User icon.

### 3. Complete Customer Dashboard
The `/account` dashboard operates as a tabbed multi-pane control center:
- **Profile Tab**: Edit full name, email, and phone contact details.
- **Addresses Tab**: Full interactive CRUD interface for adding, editing, and deleting shipping/billing addresses. Beautifully animated form with slide-ins and modal-like ease.
- **Newsletter Tab**: Configure preferences for seasonal harvest updates, maker stories, and promotions.
- **Security Tab**: Secure password changes and credential updates.
- **Settings Tab**: Configure regional and interface display options.

---

## Reusable Components & Primitives

Several key components were introduced:
1. **`AccountDashboard`** (`components/account/AccountDashboard.tsx`): Main dashboard controller with responsive tabs, sidebar navigation, and staggered animation panels.
2. **`AddressManager`** (`components/account/AddressManager.tsx`): Form controllers, address list layouts, and primary address flag toggles.
3. **`SignInForm`** (`components/auth/SignInForm.tsx`): Multi-tab client form handling Sign-In and registration under *Join Palum Dhara*, styled with beautiful tab spring underlines from `motion/react`.

---

## Future Sprint 2.5 Dependencies

The completion of Sprint 2.4 lays the essential user context for **Sprint 2.5: Transactional Commerce & Checkout**. The following features are scheduled for Sprint 2.5:
1. **Database-Backed Orders**: Introduction of the `Order` and `OrderItem` schemas in Prisma, linking directly to the authenticated `User` and saved `Address` models.
2. **Integrated Checkout**: Transitioning from WhatsApp-only messages to storing real orders in the database.
3. **Promotions & Coupons**: Coupon model implementations, validation logic, and order-stacking discount configurations.
4. **First-Order Discount**: Automated 10% welcome discounts for newly registered members (Sprint 2.4 users).
