"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type VisaStatus =
  | "not_started"
  | "documents_pending"
  | "submitted"
  | "under_process"
  | "approved"
  | "issued"
  | "rejected";

type Booking = {
  id: string;
  booking_type: "hajj" | "umrah" | "flight";
  package_name: string | null;
  travel_date: string | null;
  status: string;
  visa_status: VisaStatus;
  visa_reference: string | null;
  visa_note: string | null;
  visa_updated_at: string | null;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  role: string | null;
  account_status: string | null;
};

const visaSteps: { key: VisaStatus; label: string }[] = [
  { key: "not_started", label: "Not Started" },
  { key: "documents_pending", label: "Documents Pending" },
  { key: "submitted", label: "Submitted" },
  { key: "under_process", label: "Under Process" },
  { key: "approved", label: "Approved" },
  { key: "issued", label: "Issued" },
];

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Not updated yet";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function travelDate(value: string | null) {
  if (!value) return "Travel date pending";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function statusTheme(status: VisaStatus) {
  if (status === "issued" || status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "under_process" || status === "submitted") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function CustomerVisaPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadVisaData() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
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

        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(
            "id, booking_type, package_name, travel_date, status, visa_status, visa_reference, visa_note, visa_updated_at, created_at"
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
              : "Visa status load nahi ho saka."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadVisaData();

    return () => {
      mounted = false;
    };
  }, []);

  const issuedCount = useMemo(
    () => bookings.filter((booking) => booking.visa_status === "issued").length,
    [bookings]
  );

  const processingCount = useMemo(
    () =>
      bookings.filter((booking) =>
        ["submitted", "under_process", "approved"].includes(
          booking.visa_status
        )
      ).length,
    [bookings]
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfcfaa] border-t-[#153e38]" />
          <p className="mt-5 text-sm font-bold text-[#153e38]/55">
            Visa status loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f0] text-[#16332f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(198,162,91,0.13),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(31,104,95,0.10),transparent_28%)]" />

      <header className="relative border-b border-[#16332f]/10 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.location.assign("/customer/dashboard")}
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
                Visa Tracking Centre
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => window.location.assign("/customer/dashboard")}
            className="rounded-xl border border-[#16332f]/10 bg-white px-4 py-3 text-xs font-black shadow-sm"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.4rem] bg-[#123a35] p-7 text-white shadow-[0_25px_80px_rgba(19,57,52,0.22)] sm:p-9">
          <Image
            src="/images/makkah.jpeg"
            alt="Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#123a35] via-[#123a35]/94 to-[#123a35]/55" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ead69d]">
                Live Visa Tracking
              </p>

              <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                Track every visa update from submission to issuance.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Assalam-o-Alaikum, {profile?.full_name || "Customer"}.
                Your visa status is updated by Makki Madni administration
                against each booking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#ead69d]">
                  Processing
                </p>
                <p className="mt-2 text-3xl font-black">{processingCount}</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#ead69d]">
                  Issued
                </p>
                <p className="mt-2 text-3xl font-black">{issuedCount}</p>
              </div>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mt-7 space-y-5">
          {bookings.length === 0 ? (
            <div className="rounded-[2rem] border border-[#16332f]/10 bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-lg font-black">No bookings found</p>
              <p className="mt-2 text-sm text-[#16332f]/45">
                Visa tracking will appear after you create a booking.
              </p>
              <button
                type="button"
                onClick={() => window.location.assign("/customer/booking/new")}
                className="mt-6 rounded-xl bg-[#153e38] px-5 py-3 text-xs font-black text-white"
              >
                Start New Booking
              </button>
            </div>
          ) : (
            bookings.map((booking) => {
              const currentIndex = visaSteps.findIndex(
                (step) => step.key === booking.visa_status
              );

              return (
                <article
                  key={booking.id}
                  className="rounded-[2rem] border border-[#16332f]/10 bg-white p-5 shadow-[0_18px_55px_rgba(25,52,47,0.06)] sm:p-7"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black">
                          {booking.package_name ||
                            `${label(booking.booking_type)} Booking`}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${statusTheme(
                            booking.visa_status
                          )}`}
                        >
                          {label(booking.visa_status)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#16332f]/45">
                        Ref: {booking.id.slice(0, 8).toUpperCase()} •{" "}
                        {travelDate(booking.travel_date)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f6f0e4] px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#8a692f]">
                        Last Visa Update
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#624a26]">
                        {formatDate(booking.visa_updated_at)}
                      </p>
                    </div>
                  </div>

                  {booking.visa_status === "rejected" ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                      <p className="text-sm font-black text-red-700">
                        Visa application requires attention
                      </p>
                      <p className="mt-2 text-xs leading-6 text-red-700/75">
                        Please review the note below or contact Makki Madni
                        support for the next required action.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-7 overflow-x-auto pb-2">
                      <div className="flex min-w-[720px] items-start">
                        {visaSteps.map((step, index) => {
                          const complete =
                            currentIndex >= index &&
                            booking.visa_status !== "not_started";

                          const active =
                            booking.visa_status === step.key;

                          return (
                            <div
                              key={step.key}
                              className="relative flex flex-1 flex-col items-center text-center"
                            >
                              {index < visaSteps.length - 1 && (
                                <div
                                  className={`absolute left-1/2 top-4 h-0.5 w-full ${
                                    currentIndex > index
                                      ? "bg-[#b9954d]"
                                      : "bg-[#16332f]/10"
                                  }`}
                                />
                              )}

                              <div
                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-black ${
                                  complete || active
                                    ? "border-[#b9954d] bg-[#153e38] text-[#ead69d]"
                                    : "border-[#16332f]/15 bg-white text-[#16332f]/35"
                                }`}
                              >
                                {complete ? "✓" : index + 1}
                              </div>

                              <p
                                className={`mt-3 px-2 text-[9px] font-black uppercase tracking-wider ${
                                  active
                                    ? "text-[#153e38]"
                                    : "text-[#16332f]/40"
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#98733b]">
                        Visa Reference
                      </p>
                      <p className="mt-2 text-sm font-black">
                        {booking.visa_reference || "Awaiting reference"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#98733b]">
                        Booking Status
                      </p>
                      <p className="mt-2 text-sm font-black">
                        {label(booking.status)}
                      </p>
                    </div>
                  </div>

                  {booking.visa_note && (
                    <div className="mt-4 rounded-2xl border border-[#c9a96b]/25 bg-[#fffaf0] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#98733b]">
                        Makki Madni Update
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#624a26]">
                        {booking.visa_note}
                      </p>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}