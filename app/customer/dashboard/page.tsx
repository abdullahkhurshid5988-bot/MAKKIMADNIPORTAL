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

type BookingStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "confirmed"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "partially_paid"
  | "paid"
  | "refunded";

type VisaStatus =
  | "not_started"
  | "documents_pending"
  | "submitted"
  | "under_process"
  | "approved"
  | "issued"
  | "rejected";

type CustomerDocument = {
  id: string;
  document_type: "passport" | "cnic" | "photos" | "vaccination";
  status: "pending" | "approved" | "rejected";
};

type Booking = {
  id: string;
  booking_type: "hajj" | "umrah" | "flight";
  package_name: string | null;
  travelers: number;
  travel_date: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number | string;
  paid_amount: number | string;
  currency: string;
  visa_status: VisaStatus;
  visa_reference: string | null;
  visa_note: string | null;
  visa_updated_at: string | null;
  created_at: string;
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
    route: "/customer/booking/new",
  },
  {
    title: "Book Umrah",
    description: "Create a family or group journey.",
    icon: "◈",
    route: "/customer/booking/new",
  },
  {
    title: "Search Flights",
    description: "Submit an international flight request.",
    icon: "✈",
    route: "/customer/booking/new",
  },
  {
    title: "View My Bookings",
    description: "Track requests, payments and status.",
    icon: "▤",
    route: "/customer/booking",
  },
];

const documents = [
  { name: "Passport Copy", status: "Not uploaded" },
  { name: "CNIC Copy", status: "Not uploaded" },
  { name: "Passport Photos", status: "Not uploaded" },
  { name: "Vaccination Certificate", status: "Not uploaded" },
];

const statusProgress: Record<BookingStatus, number> = {
  draft: 5,
  submitted: 20,
  under_review: 40,
  approved: 65,
  confirmed: 100,
  cancelled: 0,
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Date pending";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatMoney(
  amount: number | string,
  currency: string
) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) return "0";

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currency || "PKR",
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customerDocuments, setCustomerDocuments] = useState<CustomerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/");
          return;
        }

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "full_name, email, mobile, role, account_status"
            )
            .eq("id", user.id)
            .single();

        if (
          profileError ||
          !profileData ||
          profileData.role !== "customer" ||
          profileData.account_status !== "active"
        ) {
          await supabase.auth.signOut();
          window.location.replace("/");
          return;
        }

        const { data: bookingData, error: bookingError } =
          await supabase
            .from("bookings")
            .select(
              "id, booking_type, package_name, travelers, travel_date, status, payment_status, total_amount, paid_amount, currency, visa_status, visa_reference, visa_note, visa_updated_at, created_at"
            )
            .order("created_at", { ascending: false });

        if (bookingError) {
          throw bookingError;
        }

        const { data: documentData, error: documentError } =
          await supabase
            .from("customer_documents")
            .select("id, document_type, status")
            .order("created_at", { ascending: false });

        if (documentError) {
          throw documentError;
        }

        if (mounted) {
          setProfile(profileData);
          setBookings((bookingData || []) as Booking[]);
          setCustomerDocuments(
            (documentData || []) as CustomerDocument[]
          );
        }
      } catch (error) {
        if (mounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Dashboard data load nahi ho saka."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

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

  const dashboardStats = useMemo(() => {
    const activeBookings = bookings.filter(
      (booking) =>
        !["cancelled", "confirmed"].includes(booking.status)
    );

    const pendingPayments = bookings.filter(
      (booking) =>
        booking.payment_status === "pending" ||
        booking.payment_status === "partially_paid"
    );

    const totalPendingAmount = pendingPayments.reduce(
      (total, booking) => {
        const bookingTotal = Number(booking.total_amount || 0);
        const paid = Number(booking.paid_amount || 0);
        return total + Math.max(0, bookingTotal - paid);
      },
      0
    );

    return {
      activeBookings: activeBookings.length,
      pendingPayments: pendingPayments.length,
      totalPendingAmount,
    };
  }, [bookings]);

  const latestBooking = bookings[0] || null;

  const latestStatusText = latestBooking
    ? formatLabel(latestBooking.status)
    : "No active booking";

  const latestProgress = latestBooking
    ? statusProgress[latestBooking.status]
    : 8;

  const visaStatus = latestBooking
    ? formatLabel(latestBooking.visa_status || "not_started")
    : "Not Started";

  const documentStats = useMemo(() => {
    const requiredTypes = [
      "passport",
      "cnic",
      "photos",
      "vaccination",
    ] as const;

    const uploadedTypes = requiredTypes.filter((type) =>
      customerDocuments.some(
        (document) => document.document_type === type
      )
    ).length;

    const approvedTypes = requiredTypes.filter((type) =>
      customerDocuments.some(
        (document) =>
          document.document_type === type &&
          document.status === "approved"
      )
    ).length;

    return {
      uploadedTypes,
      approvedTypes,
      total: requiredTypes.length,
    };
  }, [customerDocuments]);

  function handleNavigation(label: string) {
    if (label === "Overview") {
      window.location.assign("/customer/dashboard");
      return;
    }

    if (label === "My Bookings") {
      window.location.assign("/customer/booking");
      return;
    }

    if (
      label === "Live Flights" ||
      label === "Hajj & Umrah"
    ) {
      window.location.assign("/customer/booking/new");
      return;
    }

    if (label === "Visa Status") {
      window.location.assign("/customer/visa");
      return;
    }

    if (label === "Documents") {
      window.location.assign("/customer/documents");
      return;
    }

    setMobileMenuOpen(false);
  }

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
                onClick={() => handleNavigation(item.label)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${
                  item.active
                    ? "bg-[#d8b66c] text-[#0f302c] shadow-lg"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${
                    item.active
                      ? "bg-[#0f302c] text-[#eddba9]"
                      : "bg-white/5"
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
              Our Hajj, Umrah and ticketing team is available for
              your journey.
            </p>
            <a
              href="tel:+923006975181"
              className="mt-4 block w-full rounded-xl bg-white px-4 py-3 text-center text-xs font-black text-[#0f302c]"
            >
              Contact Support
            </a>
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
                onClick={() => handleNavigation(item.label)}
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
                    Assalam-o-Alaikum,{" "}
                    {profile?.full_name || "Customer"}
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
            {loadError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                Dashboard data load nahi hua: {loadError}
              </div>
            )}

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
                    Book packages, compare flights, upload documents
                    and track every important update from one secure
                    portal.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        window.location.assign(
                          "/customer/booking/new"
                        )
                      }
                      className="rounded-2xl bg-[#d8b66c] px-6 py-4 text-sm font-black text-[#123a35] shadow-xl transition hover:-translate-y-1"
                    >
                      Start New Booking
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        window.location.assign(
                          "/customer/booking"
                        )
                      }
                      className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-black text-white backdrop-blur-xl"
                    >
                      View My Bookings
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
                        {latestStatusText}
                      </p>
                      {latestBooking && (
                        <p className="mt-2 text-xs text-white/50">
                          {latestBooking.package_name ||
                            formatLabel(
                              latestBooking.booking_type
                            )}
                        </p>
                      )}
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                      {latestBooking?.booking_type === "flight"
                        ? "✈"
                        : latestBooking?.booking_type === "umrah"
                          ? "◈"
                          : "✦"}
                    </div>
                  </div>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#d8b66c]"
                      style={{ width: `${latestProgress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-[11px] text-white/45">
                    <span>
                      {latestBooking
                        ? `Travel: ${formatDate(
                            latestBooking.travel_date
                          )}`
                        : "Account ready"}
                    </span>
                    <span>{latestProgress}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.assign(
                        latestBooking
                          ? "/customer/booking"
                          : "/customer/booking/new"
                      )
                    }
                    className="mt-6 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3.5 text-sm font-black text-[#123a35]"
                  >
                    {latestBooking
                      ? "View Booking Details"
                      : "Explore Hajj & Umrah"}
                    <span>→</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Real Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [
                  String(dashboardStats.activeBookings),
                  "Active Bookings",
                  bookings.length > 0
                    ? `${bookings.length} total request${
                        bookings.length === 1 ? "" : "s"
                      }`
                    : "No journey booked yet",
                  "✦",
                ],
                [
                  dashboardStats.totalPendingAmount > 0
                    ? formatMoney(
                        dashboardStats.totalPendingAmount,
                        latestBooking?.currency || "PKR"
                      )
                    : String(dashboardStats.pendingPayments),
                  "Pending Payment",
                  dashboardStats.pendingPayments > 0
                    ? `${dashboardStats.pendingPayments} booking payment pending`
                    : "Your account is clear",
                  "◉",
                ],
                [
                  `${documentStats.approvedTypes} / ${documentStats.total}`,
                  "Documents Approved",
                  documentStats.uploadedTypes > 0
                    ? `${documentStats.uploadedTypes} categor${
                        documentStats.uploadedTypes === 1 ? "y" : "ies"
                      } uploaded`
                    : "Upload your required documents",
                  "▤",
                ],
                [
                  visaStatus,
                  "Visa Status",
                  latestBooking
                    ? latestBooking.visa_updated_at
                      ? `Updated by Makki Madni administration`
                      : `Tracking ready for latest ${formatLabel(
                          latestBooking.booking_type
                        )} booking`
                    : "Available after booking",
                  "◎",
                ],
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
                      <p className="mt-2 text-sm font-black">
                        {label}
                      </p>
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
                      onClick={() =>
                        window.location.assign(
                          "/customer/booking"
                        )
                      }
                      className="text-left text-xs font-black text-[#8d6c35]"
                    >
                      View all bookings →
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() =>
                          window.location.assign(action.route)
                        }
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
                    {latestBooking ? (
                      <>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="h-3 w-3 rounded-full bg-[#d8b66c]" />
                            <span className="mt-2 h-full w-px bg-[#17302d]/10" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex justify-between gap-3">
                              <p className="text-sm font-black">
                                Latest booking:{" "}
                                {latestBooking.package_name ||
                                  formatLabel(
                                    latestBooking.booking_type
                                  )}
                              </p>
                              <p className="text-[10px] text-[#17302d]/35">
                                {formatLabel(latestBooking.status)}
                              </p>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-[#17302d]/45">
                              Reference{" "}
                              {latestBooking.id
                                .slice(0, 8)
                                .toUpperCase()}{" "}
                              • {latestBooking.travelers} traveler
                              {latestBooking.travelers === 1
                                ? ""
                                : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="h-3 w-3 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex justify-between gap-3">
                              <p className="text-sm font-black">
                                Payment status
                              </p>
                              <p className="text-[10px] text-[#17302d]/35">
                                {formatLabel(
                                  latestBooking.payment_status
                                )}
                              </p>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-[#17302d]/45">
                              Open My Bookings for complete request
                              details.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="h-3 w-3 rounded-full bg-emerald-500" />
                            <span className="mt-2 h-full w-px bg-[#17302d]/10" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-black">
                              Customer account created
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#17302d]/45">
                              Your Makki Madni portal account is ready.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="h-3 w-3 rounded-full bg-[#d8b66c]" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-black">
                              Next recommended step
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#17302d]/45">
                              Start your first Hajj, Umrah or flight
                              request.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
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
                          <p className="text-sm font-bold">
                            {document.name}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {document.status}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            window.location.assign("/customer/documents")
                          }
                          className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-[#8d6c35] shadow-sm"
                        >
                          Upload
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.assign("/customer/documents")
                    }
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
                    Speak with our Hajj, Umrah, visa or
                    air-ticketing team for professional guidance.
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