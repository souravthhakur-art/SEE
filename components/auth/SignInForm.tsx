"use client"

import { useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { motion, AnimatePresence } from "motion/react"
import * as Ornament from "@/components/ui/ornament"

interface SignInFormProps {
  defaultRedirect: string
}

const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
  USER_NOT_FOUND: "Invalid email or password.",
  INVALID_PASSWORD: "Invalid email or password.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  USER_BANNED: "This account has been suspended. Contact support.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a moment and try again.",
  USER_ALREADY_EXISTS: "This email is already registered. Sign in instead or reset your password.",
  EMAIL_ALREADY_EXISTS: "This email is already registered. Sign in instead or reset your password.",
  CREDENTIALS_SIGNIN_ERROR: "Invalid email or password.",
}

const DEFAULT_AUTH_ERROR = "Something went wrong. Please check your details and try again."

function getFriendlyAuthError(error: { code?: string; message?: string } | null): string {
  if (!error) return DEFAULT_AUTH_ERROR
  if (error.code && FRIENDLY_AUTH_ERRORS[error.code]) {
    return FRIENDLY_AUTH_ERRORS[error.code]
  }
  return error.message || DEFAULT_AUTH_ERROR
}

function getSafeRedirect(candidate: string | null, fallback: string): string {
  if (!candidate) return fallback
  if (!candidate.startsWith("/")) return fallback
  if (candidate.startsWith("//")) return fallback
  if (candidate.includes("\\")) return fallback
  if (candidate.includes("://")) return fallback
  return candidate
}

export function SignInForm({ defaultRedirect }: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin")
  
  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  
  // Validation / Error states
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRedirect = (userRole: string | null | undefined) => {
    const rawRedirect = searchParams.get("redirectTo")
    if (rawRedirect) {
      router.push(getSafeRedirect(rawRedirect, "/account"))
    } else if (userRole === "admin") {
      router.push("/admin")
    } else {
      router.push("/account")
    }
    router.refresh()
  }

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
      })

      setIsLoading(false)

      if (signInError) {
        setError(getFriendlyAuthError(signInError))
        return
      }

      handleRedirect(data?.user.role)
    } catch (err) {
      setIsLoading(false)
      setError(DEFAULT_AUTH_ERROR)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
        marketingConsent: marketingConsent,
      } as any)

      setIsLoading(false)

      if (signUpError) {
        setError(getFriendlyAuthError(signUpError))
        return
      }

      handleRedirect(data?.user.role)
    } catch (err) {
      setIsLoading(false)
      setError(DEFAULT_AUTH_ERROR)
    }
  }

  return (
    <div className="w-full">
      {/* Tab Selectors */}
      <div className="flex border-b border-wood-light/20 mb-8 relative">
        <button
          onClick={() => {
            setActiveTab("signin")
            setError(null)
          }}
          className={`flex-1 pb-3 text-center text-xs tracking-widest uppercase font-body transition-colors duration-300 relative ${
            activeTab === "signin" ? "text-forest font-semibold" : "text-charcoal/40 hover:text-charcoal/70"
          }`}
          type="button"
          id="tab-signin"
        >
          Sign In
          {activeTab === "signin" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-forest"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("register")
            setError(null)
          }}
          className={`flex-1 pb-3 text-center text-xs tracking-widest uppercase font-body transition-colors duration-300 relative ${
            activeTab === "register" ? "text-forest font-semibold" : "text-charcoal/40 hover:text-charcoal/70"
          }`}
          type="button"
          id="tab-register"
        >
          Join Palum Dhara
          {activeTab === "register" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-forest"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "signin" ? (
          <motion.form
            key="signin-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSignIn}
            className="flex flex-col gap-5"
            id="form-signin"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="label text-[10px] text-charcoal/60">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 border border-wood-light/30 focus:border-forest px-4 bg-transparent/5 rounded-sm text-charcoal outline-none transition-colors duration-200 font-body text-sm placeholder:text-charcoal/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="label text-[10px] text-charcoal/60">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-11 border border-wood-light/30 focus:border-forest px-4 bg-transparent/5 rounded-sm text-charcoal outline-none transition-colors duration-200 font-body text-sm placeholder:text-charcoal/20"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-terracotta bg-terracotta/5 border border-terracotta/10 px-3 py-2.5 rounded-sm leading-relaxed" id="signin-error">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary mt-2 h-11 w-full" id="btn-signin-submit">
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="register-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleRegister}
            className="flex flex-col gap-5"
            id="form-register"
          >
            <div className="text-center pb-2 border-b border-wood-light/10 mb-2">
              <p className="text-xs text-charcoal/70 leading-relaxed italic font-body">
                "Become part of the Palum Dhara community and enjoy a more personal experience."
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="label text-[10px] text-charcoal/60">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Devi Prasad"
                className="h-11 border border-wood-light/30 focus:border-forest px-4 bg-transparent/5 rounded-sm text-charcoal outline-none transition-colors duration-200 font-body text-sm placeholder:text-charcoal/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="label text-[10px] text-charcoal/60">
                Email Address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 border border-wood-light/30 focus:border-forest px-4 bg-transparent/5 rounded-sm text-charcoal outline-none transition-colors duration-200 font-body text-sm placeholder:text-charcoal/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="label text-[10px] text-charcoal/60">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="h-11 border border-wood-light/30 focus:border-forest px-4 bg-transparent/5 rounded-sm text-charcoal outline-none transition-colors duration-200 font-body text-sm placeholder:text-charcoal/20"
              />
            </div>

            <div className="flex items-start gap-3 mt-1">
              <input
                id="marketingConsent"
                name="marketingConsent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
                className="w-4 h-4 mt-0.5 border border-wood-light/40 accent-forest rounded-sm cursor-pointer"
              />
              <label htmlFor="marketingConsent" className="text-[11px] text-charcoal/70 leading-relaxed font-body cursor-pointer select-none">
                I'd like to receive seasonal harvest updates, stories of our regional makers, and member-only promotions from Palum Dhara.
              </label>
            </div>

            {error && (
              <p role="alert" className="text-xs text-terracotta bg-terracotta/5 border border-terracotta/10 px-3 py-2.5 rounded-sm leading-relaxed" id="register-error">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary mt-2 h-11 w-full" id="btn-register-submit">
              {isLoading ? "Creating Account…" : "Join Palum Dhara"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-wood-light/10 flex flex-col items-center">
        <Ornament.Divider className="w-40 h-4 opacity-20 text-wood" />
        <p className="text-[10px] text-charcoal/40 font-mono tracking-wider mt-4">
          SECURE CUSTOMER GATEWAY
        </p>
      </div>
    </div>
  )
}
