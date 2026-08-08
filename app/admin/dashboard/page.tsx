"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type Profile = {
  id: string;
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

type Booking = {
  id: string;
  booking_type: "hajj" | "umrah" | "flight";
  package_name: string | null;
  travelers: number;
  departure_city: string | null;
  travel_date: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number | string;
  paid_amount: number | string;
  currency: string;
  created_at: string;
};

const bookingStatuses: BookingStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "confirmed",
  "cancelled",
];

const paymentStatuses: PaymentStatus[] = [
  "pending",
  "partially_paid",
  "paid",
  "refunded",
];

function label(value: string) {
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

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/");
      return;
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("id, full_name, email, mobile, role, account_status")
      .eq("id", user.id)
      .single();

    if (
      adminError ||
      !adminProfile ||
      adminProfile.role !== "admin" ||
      adminProfile.account_status !== "active"
    ) {
      await supabase.auth.signOut();
      window.location.replace("/");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, mobile, role, account_status");

    if (profileError) {
      throw profileError;
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, booking_type, package_name, travelers, departure_city, travel_date, status, payment_status, total_amount, paid_amount, currency, created_at"
      )
      .order("created_at", { ascending: false });

    if (bookingError) {
      throw bookingError;
    }

    setAdmin(adminProfile);
    setProfiles((profileData || []) as Profile[]);
    setBookings((bookingData || []) as Booking[]);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await loadData();
      } catch (error) {
        if (mounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Admin dashboard load nahi ho saka."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const customers = profiles.filter(
      (profile) => profile.role === "customer"
    ).length;

    const pendingBookings = bookings.filter(
      (booking) =>
        booking.status === "submitted" ||
        booking.status === "under_review"
    ).length;

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed"
    ).length;

    const pendingPayments = bookings.filter(
      (booking) =>
        booking.payment_status === "pending" ||
        booking.payment_status === "partially_paid"
    ).length;

    return {
      customers,
      pendingBookings,
      confirmedBookings,
      pendingPayments,
    };
  }, [profiles, bookings]);

  async function updateBooking(
    bookingId: string,
    updates: Partial<Pick<Booking, "status" | "payment_status" | "total_amount" | "paid_amount" | "currency">>
  ) {
    setUpdatingId(bookingId);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId);

      if (error) {
        throw error;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...updates }
            : booking
        )
      );

      setMessage("Booking successfully update ho gayi.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Update failed: ${error.message}`
          : "Booking update nahi ho saki."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function editBookingField(
    bookingId: string,
    field: "total_amount" | "paid_amount" | "currency",
    value: string
  ) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              [field]: field === "currency" ? value.toUpperCase() : value,
            }
          : booking
      )
    );
  }

  async function saveQuotation(booking: Booking) {
    const totalAmount = Number(booking.total_amount || 0);
    const paidAmount = Number(booking.paid_amount || 0);
    const currency = String(booking.currency || "PKR").trim().toUpperCase();

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      setMessage("Total amount valid number hona chahiye.");
      return;
    }

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      setMessage("Paid amount valid number hona chahiye.");
      return;
    }

    if (paidAmount > totalAmount && totalAmount > 0) {
      setMessage("Paid amount total amount se zyada nahi ho sakta.");
      return;
    }

    if (!currency) {
      setMessage("Currency enter karein, jaise PKR ya USD.");
      return;
    }

    await updateBooking(booking.id, {
      total_amount: totalAmount,
      paid_amount: paidAmount,
      currency,
    });
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfcfaa] border-t-[#153e38]" />
          <p className="mt-5 text-sm font-bold text-[#153e38]/55">
            Admin control centre loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17302d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(197,163,94,0.12),transparent_28%),radial-gradient(circle_at_100%_0%,rgba(32,101,92,0.11),transparent_26%)]" />

      <header className="relative border-b border-[#17302d]/10 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-[#17302d]/10 bg-white shadow-md">
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
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#98733b]">
                Admin Control Centre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black">
                {admin?.full_name || "Administrator"}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#17302d]/40">
                Super Admin
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#17302d]/10 bg-white px-4 py-3 text-xs font-black shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.4rem] bg-[#123a35] p-7 text-white shadow-[0_28px_85px_rgba(19,57,52,0.22)] sm:p-10">
          <Image
            src="/images/makkah.jpeg"
            alt="Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#123a35] via-[#123a35]/94 to-[#123a35]/55" />

          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ead69d]">
              Company Operations
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Manage every customer journey from one command centre.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Review customer requests, approve bookings, monitor payments and
              control Makki Madni portal operations.
            </p>
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl border border-[#c9a96b]/30 bg-[#fffaf0] px-5 py-4 text-sm font-bold text-[#765728]">
            {message}
          </div>
        )}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [stats.customers, "Customers", "Registered customer accounts"],
            [
              stats.pendingBookings,
              "Pending Bookings",
              "Needs review or approval",
            ],
            [
              stats.confirmedBookings,
              "Confirmed",
              "Successfully confirmed journeys",
            ],
            [
              stats.pendingPayments,
              "Pending Payments",
              "Payment action still required",
            ],
          ].map(([value, title, note]) => (
            <article
              key={String(title)}
              className="rounded-[1.8rem] border border-[#17302d]/10 bg-white p-6 shadow-[0_15px_45px_rgba(26,50,45,0.06)]"
            >
              <p className="text-3xl font-black text-[#153e38]">{value}</p>
              <p className="mt-2 text-sm font-black">{title}</p>
              <p className="mt-3 text-xs text-[#17302d]/40">{note}</p>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98733b]">
                Booking Operations
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">
                Customer booking requests
              </h2>
            </div>

            <p className="text-xs text-[#17302d]/40">
              {bookings.length} total booking request
              {bookings.length === 1 ? "" : "s"}
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-dashed border-[#17302d]/15 bg-[#fbfaf7] py-12 text-center">
              <p className="font-black">No booking requests yet</p>
              <p className="mt-2 text-xs text-[#17302d]/40">
                Customer bookings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.7rem] border border-[#17302d]/10 bg-[#fbfaf7] p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">
                          {booking.package_name ||
                            `${label(booking.booking_type)} Booking`}
                        </h3>

                        <span className="rounded-full bg-[#f0e8d7] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#87662e]">
                          {label(booking.booking_type)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#17302d]/45">
                        Ref: {booking.id.slice(0, 8).toUpperCase()} •{" "}
                        {booking.travelers} traveler
                        {booking.travelers === 1 ? "" : "s"} •{" "}
                        {booking.departure_city || "Departure pending"}
                      </p>

                      <p className="mt-1 text-xs text-[#17302d]/35">
                        Travel {formatDate(booking.travel_date)} • Submitted{" "}
                        {formatCreatedAt(booking.created_at)}
                      </p>
                    </div>

                    <div className="w-full max-w-2xl space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                          Booking Status
                          <select
                            value={booking.status}
                            disabled={updatingId === booking.id}
                            onChange={(event) =>
                              updateBooking(booking.id, {
                                status: event.target.value as BookingStatus,
                              })
                            }
                            className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                          >
                            {bookingStatuses.map((status) => (
                              <option key={status} value={status}>
                                {label(status)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                          Payment Status
                          <select
                            value={booking.payment_status}
                            disabled={updatingId === booking.id}
                            onChange={(event) =>
                              updateBooking(booking.id, {
                                payment_status: event.target.value as PaymentStatus,
                              })
                            }
                            className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                          >
                            {paymentStatuses.map((status) => (
                              <option key={status} value={status}>
                                {label(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="rounded-2xl border border-[#c9a96b]/25 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#98733b]">
                          Customer Quotation
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_110px]">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Total Amount
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={booking.total_amount ?? ""}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                editBookingField(booking.id, "total_amount", event.target.value)
                              }
                              placeholder="0"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-sm font-black text-[#17302d] outline-none"
                            />
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Paid Amount
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={booking.paid_amount ?? ""}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                editBookingField(booking.id, "paid_amount", event.target.value)
                              }
                              placeholder="0"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-sm font-black text-[#17302d] outline-none"
                            />
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Currency
                            <input
                              type="text"
                              maxLength={6}
                              value={booking.currency || "PKR"}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                editBookingField(booking.id, "currency", event.target.value)
                              }
                              placeholder="PKR"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-sm font-black uppercase text-[#17302d] outline-none"
                            />
                          </label>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-[#17302d]/45">
                            Customer dashboard par yahi quotation amount show hoga.
                          </p>

                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => saveQuotation(booking)}
                            className="rounded-xl bg-[#153e38] px-5 py-3 text-xs font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === booking.id ? "Saving..." : "Save Quotation"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98733b]">
              Customer Directory
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">
              Registered portal users
            </h2>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="rounded-2xl border border-[#17302d]/8 bg-[#fbfaf7] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">
                      {profile.full_name || "Unnamed User"}
                    </p>
                    <p className="mt-1 text-xs text-[#17302d]/45">
                      {profile.email || "No email"}
                    </p>
                    <p className="mt-1 text-xs text-[#17302d]/35">
                      {profile.mobile || "No mobile"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full bg-[#f0e8d7] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#87662e]">
                      {profile.role || "unknown"}
                    </span>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      {profile.account_status || "unknown"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}