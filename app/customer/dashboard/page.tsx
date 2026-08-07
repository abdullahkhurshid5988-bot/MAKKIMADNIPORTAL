"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type Profile = {
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  role: string | null;
  account_status: string | null;
};

const navigation = [
  { label: "Overview", icon: "◫", active: true },
  { label: "My Bookings", icon: "✦" },
  { label: "Live Flights", icon: "✈" },
  { label: "Hajj & Umrah", icon: "◆" },
  { label: "Visa Status", icon: "◎" },
  { label: "Documents", icon: "▤" },
  { label: "Payments", icon: "◉" },
  { label: "Support", icon: "?" },
];

const quickActions = [
  {
    title: "Book Hajj Package",
    description: "Explore premium Hajj 2027 plans.",
    icon: "◆",
  },
  {
    title: "Book Umrah",
    description: "Create a family or group journey.",
    icon: "◈",
  },
  {
    title: "Search Flights",
    description: "Compare live international fares.",
    icon: "✈",
  },
  {
    title: "Upload Documents",
    description: "Add passport, CNIC and photos.",
    icon: "▤",
  },
];

const documents = [
  { name: "Passport Copy", status: "Not uploaded" },
  { name: "CNIC Copy", status: "Not uploaded" },
  { name: "Passport Photos", status: "Not uploaded" },
  { name: "Vaccination Certificate", status: "Not uploaded" },
];

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, mobile, role, account_status")
          .eq("id", user.id)
          .single();

        if (error || !data || data.role !== "customer") {
          await supabase.auth.signOut();
          window.location.replace("/");
          return;
        }

        if (mounted) {
          setProfile(data);
        }
      } catch {
        window.location.replace("/");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim();

    if (!name) return "MM";

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [profile]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d9c59b] border-t-[#173f39]" />
          <p className="mt-5 text-sm font-bold text-[#17302d]/55">
            Your secure dashboard is loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17302d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(197,163,94,0.12),transparent_28%),radial-gradient(circle_at_100%_15%,rgba(42,111,104,0.10),transparent_25%)]" />

      <div className="relative flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[286px] flex-col border-r border-[#17302d]/10 bg-[#0f302c] text-white lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#d8c59c]/40 bg-white shadow-lg">
              <Image
                src="/images/logo.jpeg"
                alt="BR Makki Madni Logo"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-lg font-black">BR Makki Madni</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#d9bf82]">
                Customer Portal
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
              Main Menu
            </p>

            {navigation.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
  if (item.label === "Overview") {
    window.location.assign("/customer/dashboard");
  }

  if (item.label === "My Bookings") {
    window.location.assign("/customer/booking");
  }
}}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${
                  item.active
                    ? "bg-[#d8b66c] text-[#0f302c] shadow-lg"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${
                    item.active ? "bg-[#0f302c] text-[#eddba9]" : "bg-white/5"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="m-4 rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d9bf82]">
              Need Assistance?
            </p>
            <p className="mt-3 text-xs leading-6 text-white/50">
              Our Hajj, Umrah and ticketing team is available for your journey.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-xs font-black text-[#0f302c]"
            >
              Contact Support
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[286px] bg-[#0f302c] text-white shadow-2xl transition-transform lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-white">
                <Image
                  src="/images/logo.jpeg"
                  alt="Makki Madni Logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="font-black">Makki Madni</p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#d9bf82]">
                  Customer Portal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              ×
            </button>
          </div>

          <nav className="space-y-1.5 p-4">
            {navigation.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
  if (item.label === "Overview") {
    window.location.assign("/customer/dashboard");
    return;
  }

  if (item.label === "My Bookings") {
    window.location.assign("/customer/booking");
    return;
  }

  setMobileMenuOpen(false);
}}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                  item.active
                    ? "bg-[#d8b66c] text-[#0f302c]"
                    : "text-white/65"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1 lg:ml-[286px]">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-[#17302d]/10 bg-[#f7f5ef]/90 px-4 py-4 backdrop-blur-2xl sm:px-6 xl:px-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#17302d]/10 bg-white shadow-sm lg:hidden"
                >
                  ☰
                </button>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9c793f]">
                    Customer Dashboard
                  </p>
                  <h1 className="mt-1 text-xl font-black sm:text-2xl">
                    Assalam-o-Alaikum, {profile?.full_name || "Customer"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#17302d]/10 bg-white shadow-sm"
                >
                  ♢
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c69a4b]" />
                </button>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-black">
                    {profile?.full_name || "Customer"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#17302d]/45">
                    Verified customer
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173f39] text-sm font-black text-[#ecd99e]">
                  {initials}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-xl border border-[#17302d]/10 bg-white px-4 py-3 text-xs font-black text-[#17302d]/65 shadow-sm sm:block"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-7 px-4 py-6 sm:px-6 xl:px-10 xl:py-9">
            {/* Luxury hero */}
            <section className="relative overflow-hidden rounded-[2.4rem] bg-[#123a35] p-6 text-white shadow-[0_30px_90px_rgba(22,55,49,0.22)] sm:p-8 xl:p-10">
              <Image
                src="/images/makkah.jpeg"
                alt="Makkah"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 75vw"
                className="object-cover opacity-35"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#123a35] via-[#123a35]/90 to-[#123a35]/35" />
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#d8b66c]/20 blur-[90px]" />

              <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ecd99e]/25 bg-black/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#ecd99e] backdrop-blur-xl">
                    <span className="h-2 w-2 rounded-full bg-[#ecd99e]" />
                    Your Journey Command Centre
                  </div>

                  <h2 className="mt-5 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                    Begin your sacred journey with confidence.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                    Book packages, compare flights, upload documents and track
                    every important update from one secure portal.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
<button
  type="button"
  onClick={() =>
    window.location.assign("/customer/booking/new")
  }
  className="rounded-2xl bg-[#d8b66c] px-6 py-4 text-sm font-black text-[#123a35] shadow-xl transition hover:-translate-y-1"
>
  Start New Booking
</button>
                    <button
                      type="button"
                      className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-black text-white backdrop-blur-xl"
                    >
                      Search Live Flights
                    </button>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-2xl sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ecd99e]">
                        Journey Status
                      </p>
                      <p className="mt-2 text-2xl font-black">
                        No active booking
                      </p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                      ✦
                    </div>
                  </div>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[8%] rounded-full bg-[#d8b66c]" />
                  </div>

                  <div className="mt-3 flex justify-between text-[11px] text-white/45">
                    <span>Account ready</span>
                    <span>Choose a service</span>
                  </div>

                  <button
                    type="button"
                    className="mt-6 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3.5 text-sm font-black text-[#123a35]"
                  >
                    Explore Hajj & Umrah
                    <span>→</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["0", "Active Bookings", "No journey booked yet", "✦"],
                ["PKR 0", "Pending Payment", "Your account is clear", "◉"],
                ["0 / 4", "Documents Ready", "Upload required files", "▤"],
                ["Not Started", "Visa Status", "Available after booking", "◎"],
              ].map(([value, label, note, icon]) => (
                <article
                  key={label}
                  className="rounded-[1.8rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_15px_45px_rgba(26,50,45,0.06)] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-black text-[#173f39]">
                        {value}
                      </p>
                      <p className="mt-2 text-sm font-black">{label}</p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4eee0] text-lg text-[#9a7638]">
                      {icon}
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[#17302d]/40">
                    {note}
                  </p>
                </article>
              ))}
            </section>

            <div className="grid gap-7 xl:grid-cols-[1.3fr_0.7fr]">
              {/* Left column */}
              <div className="space-y-7">
                <section className="rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9b773c]">
                        Quick Actions
                      </p>
                      <h3 className="mt-2 font-serif text-3xl font-semibold">
                        What would you like to do?
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="text-left text-xs font-black text-[#8d6c35]"
                    >
                      View all services →
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.title}
                        type="button"
                        className="group flex items-start gap-4 rounded-[1.5rem] border border-[#17302d]/10 bg-[#fbfaf7] p-5 text-left transition hover:-translate-y-1 hover:border-[#c3a361]/60 hover:bg-white hover:shadow-lg"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#173f39] text-lg text-[#ecd99e]">
                          {action.icon}
                        </span>
                        <span>
                          <span className="block font-black">
                            {action.title}
                          </span>
                          <span className="mt-2 block text-xs leading-5 text-[#17302d]/45">
                            {action.description}
                          </span>
                          <span className="mt-4 block text-xs font-black text-[#9a7638] transition group-hover:translate-x-1">
                            Continue →
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9b773c]">
                        Latest Activity
                      </p>
                      <h3 className="mt-2 text-xl font-black">
                        Account timeline
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      Account Active
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      [
                        "Customer account created",
                        "Your Makki Madni portal account is ready.",
                        "Today",
                      ],
                      [
                        "Profile secured",
                        "Your information is protected through Supabase authentication.",
                        "Today",
                      ],
                      [
                        "Next recommended step",
                        "Upload documents or start your first booking.",
                        "Pending",
                      ],
                    ].map(([title, description, time], index) => (
                      <div key={title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              index < 2 ? "bg-emerald-500" : "bg-[#d8b66c]"
                            }`}
                          />
                          {index < 2 && (
                            <span className="mt-2 h-full w-px bg-[#17302d]/10" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between gap-3">
                            <p className="text-sm font-black">{title}</p>
                            <p className="text-[10px] text-[#17302d]/35">
                              {time}
                            </p>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[#17302d]/45">
                            {description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right column */}
              <div className="space-y-7">
                <section className="rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9b773c]">
                        Documents
                      </p>
                      <h3 className="mt-2 text-xl font-black">
                        Required files
                      </h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3edde] text-[#9a7638]">
                      ▤
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {documents.map((document) => (
                      <div
                        key={document.name}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#17302d]/8 bg-[#fbfaf7] px-4 py-3.5"
                      >
                        <div>
                          <p className="text-sm font-bold">{document.name}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {document.status}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-[#8d6c35] shadow-sm"
                        >
                          Upload
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-5 w-full rounded-xl bg-[#173f39] px-4 py-3.5 text-sm font-black text-white"
                  >
                    Open Document Centre
                  </button>
                </section>

                <section className="rounded-[2rem] border border-[#d5bb7d]/40 bg-[#f6ead0] p-6 shadow-[0_18px_55px_rgba(136,102,45,0.08)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#846126]">
                    Travel Concierge
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">
                    Need help planning your journey?
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[#17302d]/55">
                    Speak with our Hajj, Umrah, visa or air-ticketing team for
                    professional guidance.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <a
                      href="tel:+923006975181"
                      className="rounded-xl bg-[#173f39] px-4 py-3 text-center text-xs font-black text-white"
                    >
                      Call Team
                    </a>
                    <a
                      href="https://wa.me/923006975181"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-[#173f39] px-4 py-3 text-center text-xs font-black text-[#173f39]"
                    >
                      WhatsApp
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}