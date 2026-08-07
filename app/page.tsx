"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { createClient } from "../LIB/SUPABASE/client";

type AuthMode = "login" | "signup";
type LoginRole = "customer" | "agent" | "staff" | "admin";
type MessageState = {
  type: "success" | "error" | "info";
  text: string;
} | null;

const loginRoles: {
  id: LoginRole;
  title: string;
  description: string;
  shortLabel: string;
}[] = [
  {
    id: "customer",
    title: "Customer",
    description: "Bookings, payments and travel documents",
    shortLabel: "CU",
  },
  {
    id: "agent",
    title: "Agent",
    description: "Customers, bookings and commissions",
    shortLabel: "AG",
  },
  {
    id: "staff",
    title: "Staff",
    description: "Visa, ticketing and operations",
    shortLabel: "ST",
  },
  {
    id: "admin",
    title: "Admin",
    description: "Complete portal management",
    shortLabel: "AD",
  },
];

const portalFeatures = [
  "Hajj and Umrah online booking",
  "Live flight search and ticketing",
  "Passport and document uploads",
  "Visa and payment status tracking",
];

const journeySteps = [
  ["01", "Create account"],
  ["02", "Book your service"],
  ["03", "Upload documents"],
  ["04", "Track every update"],
];

function getMessageClasses(type: "success" | "error" | "info") {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (type === "error") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-[#c9a96b]/35 bg-[#fbf6ea] text-[#7a5b29]";
}

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginRole, setLoginRole] = useState<LoginRole>("customer");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const loginForm = event.currentTarget;
    const form = new FormData(loginForm);
    const email = String(form.get("loginEmail") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("loginPassword") || "");

    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Email aur password enter karein.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "info", text: "Secure login check ho raha hai..." });

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setMessage({
          type: "error",
          text: error?.message || "Login failed. Details dobara check karein.",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, account_status, full_name")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setMessage({
          type: "error",
          text: "Profile record nahi mila. Admin se contact karein.",
        });
        return;
      }

      if (profile.account_status !== "active") {
        await supabase.auth.signOut();
        setMessage({
          type: "error",
          text: "Aapka account active nahi hai. Company approval required hai.",
        });
        return;
      }

      if (profile.role !== loginRole) {
        await supabase.auth.signOut();
        setMessage({
          type: "error",
          text: `Yeh account ${profile.role} portal ka hai. Sahi portal select karein.`,
        });
        return;
      }

      setMessage({
        type: "success",
        text: `Welcome ${profile.full_name || "back"}. Dashboard open ho raha hai...`,
      });

      if (profile.role === "customer") {
        window.location.assign("/customer/dashboard");
        return;
      }

      if (profile.role === "admin") {
        window.location.assign("/admin/dashboard");
        return;
      }

      setMessage({
        type: "info",
        text: `${profile.role} dashboard aglay module mein connect hoga.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Supabase connection error. .env.local values check karein.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const signupForm = event.currentTarget;
    const form = new FormData(signupForm);

    const fullName = String(form.get("fullName") || "").trim();
    const mobile = String(form.get("mobile") || "").trim();
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const identityNumber = String(form.get("identity") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (!fullName || !mobile || !email || !identityNumber) {
      setMessage({
        type: "error",
        text: "Tamam required fields complete karein.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Password aur Confirm Password same nahi hain.",
      });
      return;
    }

    if (password.length < 8) {
      setMessage({
        type: "error",
        text: "Password kam az kam 8 characters ka hona chahiye.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({
      type: "info",
      text: "Customer account create ho raha hai...",
    });

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            mobile,
            identity_number: identityNumber,
          },
        },
      });

      if (error) {
        setMessage({
          type: "error",
          text: `Registration failed: ${error.message}`,
        });
        return;
      }

      signupForm.reset();

      if (data.session) {
        setMessage({
          type: "success",
          text: "Customer account create ho gaya. Dashboard open ho raha hai...",
        });

        window.location.assign("/customer/dashboard");
        return;
      } else {
        setMessage({
          type: "success",
          text: "Account create ho gaya. Apni email inbox mein verification link open karein.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Supabase connection error. .env.local URL aur Publishable Key check karein.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f3ec] text-[#17302d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(193,158,94,0.13),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(47,116,124,0.10),transparent_26%),linear-gradient(to_bottom,#fbfaf7,#f4efe5)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1700px] lg:grid-cols-[1.12fr_0.88fr]">
        {/* Luxury white hero area */}
        <section className="flex min-h-screen flex-col justify-between px-5 py-6 sm:px-8 lg:px-12 lg:py-10 xl:px-16">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.35rem] border border-[#d7c49c]/55 bg-white shadow-[0_18px_50px_rgba(52,66,58,0.12)]">
                <Image
                  src="/images/logo.jpeg"
                  alt="BR Makki Madni Logo"
                  width={64}
                  height={64}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-xl font-black tracking-tight sm:text-2xl">
                  BR Makki Madni
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#9d7842] sm:text-xs">
                  Hajj & Umrah Digital Portal
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure System Online
            </div>
          </header>

          <div className="my-12 lg:my-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#d8c59d]/60 bg-white/75 px-5 py-2.5 shadow-sm backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-[#b58a47]" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#87652f] sm:text-xs">
                Premium Travel Management Experience
              </span>
            </div>

            <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[#17302d] sm:text-6xl xl:text-[86px]">
              Every sacred journey,
              <span className="mt-3 block bg-gradient-to-r from-[#9b7638] via-[#c19a55] to-[#7b5b28] bg-clip-text text-transparent">
                beautifully organised.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#17302d]/60 sm:text-lg">
              Book Hajj, Umrah and flights, upload documents, monitor visa
              progress and manage payments through one refined digital portal.
            </p>

            <div className="mt-9 grid max-w-3xl gap-3 sm:grid-cols-2">
              {portalFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-[#17302d]/8 bg-white/75 px-4 py-4 shadow-[0_12px_35px_rgba(46,61,52,0.06)] backdrop-blur-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d5149] text-xs font-black text-white">
                    ✓
                  </span>
                  <p className="text-sm font-semibold leading-6 text-[#17302d]/70">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {journeySteps.map(([number, label]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-[#d9c9aa]/45 bg-[#fffdf8]/85 p-4"
                >
                  <p className="font-serif text-2xl font-bold text-[#b18a48]">
                    {number}
                  </p>
                  <p className="mt-2 text-xs font-bold leading-5 text-[#17302d]/50">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white p-2 shadow-[0_35px_100px_rgba(26,49,44,0.16)]">
            <div className="relative h-[280px] overflow-hidden rounded-[1.8rem] sm:h-[340px] xl:h-[390px]">
              <Image
                src="/images/makkah.jpeg"
                alt="Holy Kaaba in Makkah"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#102b27]/90 via-[#102b27]/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-3 gap-4 border-t border-white/20 pt-5">
                  {[
                    ["10+", "Years Experience"],
                    ["5000+", "Pilgrims Served"],
                    ["24/7", "Travel Support"],
                  ].map(([number, label]) => (
                    <div key={label}>
                      <p className="font-serif text-2xl font-bold text-[#efd99e] sm:text-3xl">
                        {number}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65 sm:text-xs">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-6 flex flex-col gap-3 border-t border-[#17302d]/10 pt-5 text-xs text-[#17302d]/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 BR Makki Madni Hajj & Umrah Services</p>
            <div className="flex gap-5">
              <span>Privacy Protected</span>
              <span>Secure Access</span>
            </div>
          </footer>
        </section>

        {/* Authentication area */}
        <section className="flex min-h-screen items-center justify-center border-t border-[#17302d]/8 bg-white/60 px-5 py-10 backdrop-blur-2xl sm:px-8 lg:border-l lg:border-t-0 xl:px-14">
          <div className="w-full max-w-xl">
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#d8c9aa] bg-white shadow-lg">
                <Image
                  src="/images/logo.jpeg"
                  alt="Makki Madni Logo"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xl font-black">BR Makki Madni</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#97774d]">
                  Secure Digital Portal
                </p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-[#17302d]/10 bg-white p-6 shadow-[0_35px_110px_rgba(30,54,49,0.14)] sm:p-9 xl:p-10">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a17f50]">
                    Secure Portal Access
                  </p>
                  <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                    {authMode === "login" ? "Welcome back" : "Join the portal"}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-black/50">
                    {authMode === "login"
                      ? "Access your bookings, payments and travel records."
                      : "Create a customer account and begin your digital journey."}
                  </p>
                </div>

                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#173f39] text-sm font-black text-[#ead49d] sm:flex">
                  MM
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#f1ede5] p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setMessage(null);
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    authMode === "login"
                      ? "bg-white text-[#173f39] shadow-md"
                      : "text-black/40"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setMessage(null);
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    authMode === "signup"
                      ? "bg-white text-[#173f39] shadow-md"
                      : "text-black/40"
                  }`}
                >
                  Customer Sign Up
                </button>
              </div>

              {authMode === "login" ? (
                <>
                  <div className="mt-7">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-black/40">
                      Select your portal
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {loginRoles.map((role) => {
                        const active = loginRole === role.id;

                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              setLoginRole(role.id);
                              setMessage(null);
                            }}
                            className={`rounded-2xl border p-4 text-left transition duration-300 ${
                              active
                                ? "border-[#b89a63] bg-[#fbf6ea] shadow-sm"
                                : "border-black/10 bg-white hover:border-[#b89a63]/55"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black ${
                                  active
                                    ? "bg-[#173f39] text-[#ead49d]"
                                    : "bg-[#eef3f0] text-[#315f58]"
                                }`}
                              >
                                {role.shortLabel}
                              </span>
                              <div>
                                <p className="font-black text-[#17302d]">
                                  {role.title}
                                </p>
                                <p className="mt-1 text-[11px] leading-4 text-black/40">
                                  {role.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="mt-7 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Email Address
                      </span>
                      <input
                        type="email"
                        name="loginEmail"
                        required
                        autoComplete="email"
                        placeholder="yourname@email.com"
                        className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Password
                      </span>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          name="loginPassword"
                          required
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 pr-20 text-sm outline-none transition placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8d6c35]"
                        >
                          {showLoginPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </label>

                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-sm text-black/45">
                        <input type="checkbox" className="accent-[#173f39]" />
                        Remember me
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setMessage({
                            type: "info",
                            text: "Password reset feature agle step mein connect hoga.",
                          })
                        }
                        className="text-sm font-bold text-[#8d6c35]"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-between rounded-2xl bg-[#173f39] px-6 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#22554e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Please wait..."
                        : `Sign In to ${loginRoles.find((role) => role.id === loginRole)?.title} Portal`}
                      <span>→</span>
                    </button>
                  </form>

                  <div className="mt-6 rounded-2xl border border-[#b89560]/25 bg-[#fbf6ea] p-4 text-center">
                    <p className="text-sm text-black/50">
                      Interested in becoming an agent?
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setMessage({
                          type: "info",
                          text: "Agent application form agle module mein banega.",
                        })
                      }
                      className="mt-1 font-black text-[#8d6c35]"
                    >
                      Apply for Agent Account
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSignup} className="mt-7 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Full Name
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        required
                        autoComplete="name"
                        placeholder="Your complete name"
                        className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Mobile Number
                      </span>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        autoComplete="tel"
                        placeholder="03XX XXXXXXX"
                        className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                      Email Address
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="yourname@email.com"
                      className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                      CNIC or Passport Number
                    </span>
                    <input
                      type="text"
                      name="identity"
                      required
                      placeholder="Enter CNIC or passport number"
                      className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Password
                      </span>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          name="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="Minimum 8 characters"
                          className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 pr-20 text-sm outline-none placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8d6c35]"
                        >
                          {showSignupPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </label>

                    <label>
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Confirm Password
                      </span>
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none placeholder:text-black/25 focus:border-[#b18a48] focus:bg-white"
                      />
                    </label>
                  </div>

                  <label className="flex items-start gap-3 text-sm leading-6 text-black/45">
                    <input type="checkbox" required className="mt-1 accent-[#173f39]" />
                    <span>
                      I agree to the portal terms, privacy policy and document
                      verification process.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#173f39] px-6 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#22554e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating account..." : "Create Customer Account"}
                    <span>→</span>
                  </button>
                </form>
              )}

              {message && (
                <div
                  className={`mt-5 rounded-2xl border px-5 py-4 text-sm leading-6 ${getMessageClasses(message.type)}`}
                >
                  {message.text}
                </div>
              )}

              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-black/10 pt-6 text-center">
                {[
                  ["SSL", "Encrypted"],
                  ["24/7", "Support"],
                  ["Secure", "Documents"],
                ].map(([title, label]) => (
                  <div key={title}>
                    <p className="font-black text-[#9a753d]">{title}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-black/30">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-6 text-black/35">
              Customer accounts can be registered online. Agent, Staff and Admin
              access requires company approval.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}