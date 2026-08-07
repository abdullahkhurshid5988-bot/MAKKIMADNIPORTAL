"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type Booking = {
  id: string;
  booking_type: "hajj" | "umrah" | "flight";
  package_name: string | null;
  travelers: number;
  departure_city: string | null;
  travel_date: string | null;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "confirmed"
    | "cancelled";
  payment_status:
    | "pending"
    | "partially_paid"
    | "paid"
    | "refunded";
  total_amount: number | string;
  paid_amount: number | string;
  currency: string;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  role: string | null;
  account_status: string | null;
};

const statusStyles: Record<Booking["status"], string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  submitted: "border-blue-200 bg-blue-50 text-blue-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  confirmed: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

const paymentStyles: Record<Booking["payment_status"], string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  partially_paid: "border-blue-200 bg-blue-50 text-blue-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  refunded: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Not selected";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(
  amount: number | string,
  currency: string
) {
  const numericAmount = Number(amount || 0);

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currency || "PKR",
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export default function MyBookingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBookings() {
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
            .select("full_name, role, account_status")
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
              "id, booking_type, package_name, travelers, departure_city, travel_date, status, payment_status, total_amount, paid_amount, currency, created_at"
            )
            .order("created_at", { ascending: false });

        if (bookingError) {
          throw bookingError;
        }

        if (mounted) {
          setProfile(profileData);
          setBookings((bookingData || []) as Booking[]);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Bookings load nahi ho sakin."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(
      (booking) =>
        !["cancelled", "confirmed"].includes(booking.status)
    ).length;
    const confirmed = bookings.filter(
      (booking) => booking.status === "confirmed"
    ).length;
    const pendingPayment = bookings.filter(
      (booking) =>
        booking.payment_status === "pending" ||
        booking.payment_status === "partially_paid"
    ).length;

    return { total, active, confirmed, pendingPayment };
  }, [bookings]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfcfaa] border-t-[#153e38]" />
          <p className="mt-5 text-sm font-bold text-[#153e38]/55">
            Your bookings are loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f0] text-[#16332f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(198,162,91,0.13),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(31,104,95,0.10),transparent_28%)]" />

      <header className="relative border-b border-[#16332f]/10 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              window.location.assign("/customer/dashboard")
            }
            className="flex items-center gap-3 text-left"
          >
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-[#16332f]/10 bg-white shadow-md">
              <Image
                src="/images/logo.jpeg"
                alt="BR Makki Madni Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="font-black">BR Makki Madni</p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#98733b]">
                Customer Booking Centre
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                window.location.assign("/customer/dashboard")
              }
              className="rounded-xl border border-[#16332f]/10 bg-white px-4 py-3 text-xs font-black shadow-sm"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                window.location.assign("/customer/booking/new")
              }
              className="rounded-xl bg-[#153e38] px-4 py-3 text-xs font-black text-white shadow-lg"
            >
              + New Booking
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.3rem] bg-[#123a35] p-7 text-white shadow-[0_25px_80px_rgba(19,57,52,0.22)] sm:p-9">
          <Image
            src="/images/makkah.jpeg"
            alt="Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#123a35] via-[#123a35]/92 to-[#123a35]/55" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ead69d]">
                My Travel Requests
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                Welcome, {profile?.full_name || "Customer"}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Track your Hajj, Umrah and flight requests, payment progress
                and booking approval from one secure place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.location.assign("/customer/booking/new")
              }
              className="rounded-2xl bg-[#d9b86d] px-6 py-4 text-sm font-black text-[#123a35] shadow-xl transition hover:-translate-y-1"
            >
              Start New Booking →
            </button>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [stats.total, "Total Requests", "All submitted bookings"],
            [stats.active, "In Progress", "Currently under process"],
            [stats.confirmed, "Confirmed", "Completed confirmations"],
            [
              stats.pendingPayment,
              "Payment Pending",
              "Payment action required",
            ],
          ].map(([value, label, note]) => (
            <article
              key={String(label)}
              className="rounded-[1.7rem] border border-[#16332f]/10 bg-white p-5 shadow-[0_15px_45px_rgba(26,50,45,0.06)]"
            >
              <p className="text-3xl font-black text-[#153e38]">
                {value}
              </p>
              <p className="mt-2 text-sm font-black">{label}</p>
              <p className="mt-3 text-xs text-[#16332f]/40">
                {note}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#16332f]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98733b]">
                Booking History
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">
                Your submitted requests
              </h2>
            </div>

            <p className="text-xs text-[#16332f]/40">
              Latest booking appears first
            </p>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!errorMessage && bookings.length === 0 && (
            <div className="mt-7 rounded-[1.8rem] border border-dashed border-[#16332f]/15 bg-[#fbfaf7] px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e8d7] text-2xl text-[#98733b]">
                ✦
              </div>
              <h3 className="mt-5 text-xl font-black">
                No booking submitted yet
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#16332f]/45">
                Start your first Hajj, Umrah or flight request. Your booking
                status will appear here after submission.
              </p>
              <button
                type="button"
                onClick={() =>
                  window.location.assign("/customer/booking/new")
                }
                className="mt-6 rounded-2xl bg-[#153e38] px-6 py-4 text-sm font-black text-white"
              >
                Create First Booking
              </button>
            </div>
          )}

          {!errorMessage && bookings.length > 0 && (
            <div className="mt-7 space-y-4">
              {bookings.map((booking) => {
                const totalAmount = Number(
                  booking.total_amount || 0
                );
                const paidAmount = Number(
                  booking.paid_amount || 0
                );

                return (
                  <article
                    key={booking.id}
                    className="rounded-[1.7rem] border border-[#16332f]/10 bg-[#fbfaf7] p-5 transition hover:border-[#c3a361]/55 hover:bg-white hover:shadow-lg sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#153e38] text-xl text-[#ead69d]">
                          {booking.booking_type === "flight"
                            ? "✈"
                            : booking.booking_type === "umrah"
                              ? "◈"
                              : "◆"}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black">
                              {booking.package_name ||
                                `${formatLabel(
                                  booking.booking_type
                                )} Booking`}
                            </h3>
                            <span className="rounded-full bg-[#f0e8d7] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#87662e]">
                              {formatLabel(
                                booking.booking_type
                              )}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-[#16332f]/40">
                            Reference:{" "}
                            <span className="font-black text-[#16332f]/65">
                              {booking.id
                                .slice(0, 8)
                                .toUpperCase()}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-[#16332f]/40">
                            Submitted {formatCreatedAt(booking.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                            statusStyles[booking.status]
                          }`}
                        >
                          {formatLabel(booking.status)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                            paymentStyles[
                              booking.payment_status
                            ]
                          }`}
                        >
                          Payment{" "}
                          {formatLabel(
                            booking.payment_status
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        [
                          "Departure",
                          booking.departure_city || "Not provided",
                        ],
                        [
                          "Travel Date",
                          formatDate(booking.travel_date),
                        ],
                        [
                          "Travelers",
                          String(booking.travelers),
                        ],
                        [
                          "Total Amount",
                          totalAmount > 0
                            ? formatMoney(
                                totalAmount,
                                booking.currency
                              )
                            : "Awaiting quotation",
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-[#16332f]/8 bg-white px-4 py-3.5"
                        >
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#16332f]/35">
                            {label}
                          </p>
                          <p className="mt-2 text-sm font-black">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {totalAmount > 0 && (
                      <div className="mt-5 rounded-2xl border border-[#16332f]/8 bg-white p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-black">
                            Payment Progress
                          </p>
                          <p className="text-xs font-black text-[#98733b]">
                            {formatMoney(
                              paidAmount,
                              booking.currency
                            )}{" "}
                            of{" "}
                            {formatMoney(
                              totalAmount,
                              booking.currency
                            )}
                          </p>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#16332f]/8">
                          <div
                            className="h-full rounded-full bg-[#c6a25b]"
                            style={{
                              width: `${Math.min(
                                100,
                                totalAmount > 0
                                  ? (paidAmount /
                                      totalAmount) *
                                      100
                                  : 0
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}