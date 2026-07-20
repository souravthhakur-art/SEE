"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, ChevronDown, User } from "lucide-react";
import CartDrawer from "@/components/layout/cart-drawer";
import { useSession, authClient } from "@/lib/auth-client";
import Logo from "@/components/layout/logo";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { href: "/shop", label: "Shop", primary: true },
  { href: "/subscriptions", label: "Subscriptions", primary: true },
  { href: "/journal", label: "Journal" },
  { href: "/our-story", label: "About" },
  { href: "/contact", label: "Contact" },
];

const announcementMessages = [
  "Free Shipping on Orders Above ₹999",
  "Ships Across India",
  "Fresh Seasonal Harvest",
  "Source Transparency",
  "Complimentary Gift Wrapping Above ₹2,500",
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isHome = pathname === "/";
  // Only the home page has a full-bleed dark hero, so only there can the
  // bar start transparent before the person scrolls.
  const [scrolled, setScrolled] = useState(!isHome);
  const floating = isHome && !scrolled && !isOpen;

  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    setScrolled(window.scrollY > 80);
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % announcementMessages.length);
    }, 5000); // Elegant 5s rotation
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          floating
            ? "bg-transparent border-b border-transparent"
            : "bg-ivory/90 backdrop-blur-md border-b border-forest/10 shadow-[0_4px_24px_-18px_rgba(23,55,40,0.25)]"
        }`}
      >
        {/* Soft dark top scrim for readable floating state */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent -z-10 pointer-events-none transition-opacity duration-500 ${
            floating ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slim Forest Green Announcement Bar */}
        <div className="bg-forest text-ivory text-[9px] md:text-[10px] tracking-[0.18em] uppercase font-body font-semibold text-center relative overflow-hidden h-7 md:h-8 flex items-center justify-center border-b border-forest-light/10">
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMsgIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute text-center px-4"
              >
                {announcementMessages[currentMsgIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="section-padding">
          <div className={`flex items-center justify-between transition-all duration-500 ease-in-out ${scrolled ? "h-11 md:h-13.5" : "h-14 md:h-17"}`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" aria-label="Palum Dhara Home">
              <Logo floating={floating} className={scrolled ? "h-8 md:h-9.5" : "h-10 md:h-11.5"} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-11">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-[11px] tracking-[0.22em] font-semibold font-body uppercase transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    pathname === link.href
                      ? floating
                        ? "text-ivory font-bold after:scale-x-100 after:bg-gold-light"
                        : "text-forest font-bold after:scale-x-100 after:bg-gold"
                      : floating
                        ? "text-ivory/80 hover:text-ivory after:bg-gold-light"
                        : "text-stone-900 hover:text-forest after:bg-gold"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2.5 md:gap-4">
              {session ? (
                <div 
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`relative p-2 transition-colors duration-300 cursor-pointer flex items-center gap-0.5 ${
                      floating ? "text-ivory/85 hover:text-ivory" : "text-stone-900 hover:text-forest"
                    }`}
                    id="nav-account-dropdown-trigger"
                    aria-label="Account Menu"
                  >
                    <User className="w-5 h-5" strokeWidth={1.5} />
                    <ChevronDown className="w-3 h-3 opacity-70 transition-transform duration-200" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-ivory border border-forest/15 py-2 shadow-lg rounded-sm z-[100] animate-fade-in" id="nav-account-dropdown">
                      <Link
                        href="/account"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-[10px] tracking-wider uppercase text-charcoal/85 hover:text-forest hover:bg-forest/5 transition-colors font-body"
                        id="nav-link-my-account"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account?tab=addresses"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-[10px] tracking-wider uppercase text-charcoal/85 hover:text-forest hover:bg-forest/5 transition-colors font-body"
                        id="nav-link-addresses"
                      >
                        Addresses
                      </Link>
                      <Link
                        href="/account?tab=newsletter"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-[10px] tracking-wider uppercase text-charcoal/85 hover:text-forest hover:bg-forest/5 transition-colors font-body"
                        id="nav-link-preferences"
                      >
                        Preferences
                      </Link>
                      <div className="border-t border-forest/10 my-1.5" />
                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await authClient.signOut();
                          router.push("/sign-in");
                          router.refresh();
                        }}
                        className="w-full text-left block px-4 py-2 text-[10px] tracking-wider uppercase text-terracotta hover:bg-terracotta/5 transition-colors font-body cursor-pointer"
                        id="nav-btn-logout"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className={`relative p-3 md:p-2 transition-colors duration-300 ${
                    floating ? "text-ivory/85 hover:text-ivory" : "text-stone-900 hover:text-forest"
                  }`}
                  id="nav-link-sign-in"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              )}

              <CartDrawer floating={floating} />

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden p-3 transition-colors duration-300 ${
                  floating ? "text-ivory/85 hover:text-ivory" : "text-stone-900 hover:text-forest"
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-ivory border-t border-forest/5">
            <nav className="section-padding py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-4 border-b border-forest/10 last:border-0 ${
                    link.primary ? "text-forest" : "text-charcoal/70 hover:text-forest"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {session ? (
                <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-forest/10" id="mobile-nav-account-section">
                  <div className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 font-mono mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-forest" />
                    <span>Logged in: {session.user.name || session.user.email}</span>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-4 border-b border-forest/10 text-forest font-semibold"
                    id="mobile-nav-link-my-account"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account?tab=addresses"
                    onClick={() => setIsOpen(false)}
                    className="text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-4 border-b border-forest/10 text-charcoal/70 hover:text-forest"
                    id="mobile-nav-link-addresses"
                  >
                    Addresses
                  </Link>
                  <Link
                    href="/account?tab=newsletter"
                    onClick={() => setIsOpen(false)}
                    className="text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-4 border-b border-forest/10 text-charcoal/70 hover:text-forest"
                    id="mobile-nav-link-preferences"
                  >
                    Preferences
                  </Link>
                  <button
                    onClick={async () => {
                      setIsOpen(false);
                      await authClient.signOut();
                      router.push("/sign-in");
                      router.refresh();
                    }}
                    className="text-left text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-4 text-terracotta hover:text-terracotta/80 cursor-pointer"
                    id="mobile-nav-btn-logout"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-4 border-t border-forest/10 mt-2 text-forest font-semibold flex items-center gap-2"
                  id="mobile-nav-link-sign-in"
                >
                  <User className="w-4 h-4 text-forest" />
                  <span>Account</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer so page content clears the fixed header. The home page's
          full-bleed hero fills this space itself, so it opts out. */}
      {!isHome && <div className="h-[72px] md:h-[86px]" aria-hidden="true" />}
    </>
  );
}
