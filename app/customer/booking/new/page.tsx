"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../../../LIB/SUPABASE/client";

type BookingType = "hajj" | "umrah" | "flight";

type Message = {
  type: "success" | "error" | "info";
  text: string;
};

const packagesByType: Record<BookingType, string[]> = {
  hajj: [
    "Hajj 2027 – 14 Days",
    "Hajj 2027 – 17 Days",
    "Hajj 2027 – 21 Days",
    "Custom Hajj Package",
  ],
  umrah: [
    "Economy Umrah Package",
    "Premium Umrah Package",
    "5-Star Umrah Package",
    "Custom Umrah Package",
  ],
  flight: [
    "One-Way Flight",
    "Return Flight",
    "Multi-City Flight",
    "Group Air Ticketing",
  ],
};

export default function NewBookingPage() {
  const [bookingType, setBookingType] = useState<BookingType>("hajj");
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkCustomer() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, account_status")
          .eq("id", user.id)
          .single();

        if (
          error ||
          !profile ||
          profile.role !== "customer" ||
          profile.account_status !== "active"
        ) {
          await supabase.auth.signOut();
          window.location.replace("/");
          return;
        }
      } catch {
        window.location.replace("/");
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    }

    checkCustomer();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const bookingForm = event.currentTarget;
    const form = new FormData(bookingForm);

    const packageName = String(form.get("packageName") || "").trim();
    const departureCity = String(form.get("departureCity") || "").trim();
    const travelDate = String(form.get("travelDate") || "").trim();
    const travelers = Number(form.get("travelers") || 1);
    const notes = String(form.get("notes") || "").trim();

    if (!packageName || !departureCity || !travelDate) {
      setMessage({
        type: "error",
        text: "Please complete all required booking fields.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!Number.isInteger(travelers) || travelers < 1 || travelers > 100) {
      setMessage({
        type: "error",
        text: "Travelers ki quantity 1 se 100 ke darmiyan honi chahiye.",
      });
      setIsSubmitting(false);
      return;
    }

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
        .from("bookings")
        .insert({
          booking_type: bookingType,
          package_name: packageName,
          travelers,
          departure_city: departureCity,
          travel_date: travelDate,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (error) {
        setMessage({
          type: "error",
          text: `Booking submit nahi hui: ${error.message}`,
        });
        return;
      }

      bookingForm.reset();
      setBookingType("hajj");

      setMessage({
        type: "success",
        text: `Booking request successfully submit ho gayi. Reference: ${data.id
          .slice(0, 8)
          .toUpperCase()}`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Connection error. Supabase settings aur internet check karein.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfcfaa] border-t-[#153e38]" />
          <p className="mt-5 text-sm font-bold text-[#153e38]/55">
            Secure booking form loading...
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
                Secure Booking Portal
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

      <div className="relative mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:px-7 lg:grid-cols-[0.78fr_1.22fr] lg:px-10 lg:py-10">
        <section className="relative min-h-[430px] overflow-hidden rounded-[2.3rem] bg-[#123a35] p-7 text-white shadow-[0_25px_80px_rgba(19,57,52,0.22)] sm:p-9 lg:min-h-[720px]">
          <Image
            src="/images/makkah.jpeg"
            alt="Makkah booking"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#123a35]/55 via-[#123a35]/80 to-[#123a35]" />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#ead69d] backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#ead69d]" />
                New Journey Request
              </div>

              <h1 className="mt-7 max-w-xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                Plan every detail of your journey in one place.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
                Submit your Hajj, Umrah or flight request. Our team will review
                the details, confirm availability and update your portal.
              </p>
            </div>

            <div className="mt-12 space-y-3">
              {[
                "Secure customer-only booking request",
                "Company review and package confirmation",
                "Payment and visa status tracking",
                "Documents managed through your portal",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 backdrop-blur-xl"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d9b86d] text-xs font-black text-[#123a35]">
                    ✓
                  </span>
                  <p className="text-xs leading-5 text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2.3rem] border border-[#16332f]/10 bg-white p-5 shadow-[0_25px_80px_rgba(25,52,47,0.09)] sm:p-8 lg:p-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#98733b]">
              Start New Booking
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold">
              Tell us about your journey
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#16332f]/50">
              Submit the basic details now. Final pricing and availability will
              be confirmed by the Makki Madni team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-[#16332f]/45">
                Select Service
              </p>

              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    ["hajj", "Hajj", "◆"],
                    ["umrah", "Umrah", "◈"],
                    ["flight", "Flights", "✈"],
                  ] as const
                ).map(([value, label, icon]) => {
                  const active = bookingType === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setBookingType(value);
                        setMessage(null);
                      }}
                      className={`rounded-2xl border p-4 text-center transition ${
                        active
                          ? "border-[#153e38] bg-[#153e38] text-white shadow-lg"
                          : "border-[#16332f]/10 bg-[#fbfaf7] hover:border-[#b59454]"
                      }`}
                    >
                      <span
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                          active
                            ? "bg-white/10 text-[#ead69d]"
                            : "bg-[#f1eadb] text-[#98733b]"
                        }`}
                      >
                        {icon}
                      </span>
                      <span className="mt-2 block text-xs font-black">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#16332f]/45">
                Package or Service
              </span>
              <select
                key={bookingType}
                name="packageName"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition focus:border-[#2a766d] focus:bg-white"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {packagesByType[bookingType].map((packageName) => (
                  <option key={packageName} value={packageName}>
                    {packageName}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#16332f]/45">
                  Departure City
                </span>
                <input
                  type="text"
                  name="departureCity"
                  required
                  placeholder="Example: Lahore"
                  className="w-full rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition placeholder:text-[#16332f]/25 focus:border-[#2a766d] focus:bg-white"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#16332f]/45">
                  Preferred Travel Date
                </span>
                <input
                  type="date"
                  name="travelDate"
                  required
                  className="w-full rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition focus:border-[#2a766d] focus:bg-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#16332f]/45">
                Number of Travelers
              </span>
              <input
                type="number"
                name="travelers"
                required
                min={1}
                max={100}
                defaultValue={1}
                className="w-full rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition focus:border-[#2a766d] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#16332f]/45">
                Special Requirements
              </span>
              <textarea
                name="notes"
                rows={5}
                placeholder="Room preference, family details, wheelchair assistance or any other requirement..."
                className="w-full resize-none rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] px-5 py-4 text-sm leading-6 outline-none transition placeholder:text-[#16332f]/25 focus:border-[#2a766d] focus:bg-white"
              />
            </label>

            {message && (
              <div
                className={`rounded-2xl border px-5 py-4 text-sm leading-6 ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : message.type === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-between rounded-2xl bg-[#153e38] px-6 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#20534c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {isSubmitting
                  ? "Submitting booking request..."
                  : "Submit Booking Request"}
              </span>
              <span>{isSubmitting ? "..." : "→"}</span>
            </button>

            <p className="text-center text-[11px] leading-5 text-[#16332f]/35">
              Submitting a request does not confirm availability or final
              pricing. Our team will review and contact you.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}