"use client";

import Image from "next/image";

type PackagePrice = {
  room: "Quad" | "Triple" | "Double";
  pkr: string;
  usd: string;
  extra?: string;
};

interface HajjPackage {
  id: number;
  title: string;
  duration: string;
  badge: string;
  image: string;
  downloadName: string;
  priceLabel: string;
  prices?: PackagePrice[];
  detailsTitle: string;
  details: string[];
  itinerary?: string[];
}

const WHATSAPP_NUMBER = "923006975181";

const HAJJ_PACKAGES: HajjPackage[] = [
  {
    id: 1,
    title: "21 Days Premium Hajj Package",
    duration: "21 Days",
    badge: "Premium Plan Without Ticket",

    // Exact uploaded flyer image
    image: "/images/21 days.jpg",

    downloadName: "Makki-Madni-21-Days-Hajj-Package-2027.jpg",
    priceLabel: "Starting from PKR 2,675,000",

    prices: [
      {
        room: "Quad",
        pkr: "2,675,000",
        usd: "9,620",
      },
      {
        room: "Triple",
        pkr: "2,775,000",
        usd: "9,980",
        extra: "Azizia Triple Bed Charges: USD 350 per person",
      },
      {
        room: "Double",
        pkr: "2,975,000",
        usd: "10,700",
        extra: "Azizia Double Bed Charges: USD 950 per person",
      },
    ],

    detailsTitle: "21 Days Package Details",

    details: [
      "Maktab A Category — Zone 01",
      "Premium plan without air ticket",
      "Qurbani is not included in the package",
      "Azizia accommodation is shared by default",
      "Separate room in Azizia is available with additional charges",
      "3 nights Madinah",
      "4 nights Azizia",
      "Hajj days in Mina, Arafat and Muzdalifah",
      "Makkah Movenpick 5 Star accommodation",
      "Madinah Hilton 5 Star accommodation",
      "Experienced guides",
      "24/7 support assistance",
    ],

    itinerary: [
      "9–10 May: Arrival at Jeddah and transfer to Azizia — Full Board",
      "10–13 May: Stay in Azizia — Full Board",
      "14–18 May: Hajj Days in Mina, Arafat and Muzdalifah — Full Board",
      "19–20 May: Stay in Azizia — Full Board",
      "20–26 May: Makkah Movenpick 5 Star — Half Board",
      "26–30 May: Madinah Hilton 5 Star — Half Board",
      "30 May: Madinah/Jeddah to Lahore",
    ],
  },

  {
    id: 2,
    title: "17 Days Premium Hajj Package",
    duration: "17 Days",
    badge: "Premium Plan Without Ticket",
    image: "/images/17 days.jfif",
    downloadName: "Makki-Madni-17-Days-Hajj-Package-2027.jfif",
    priceLabel: "Starting from PKR 2,525,000",

    prices: [
      {
        room: "Quad",
        pkr: "2,525,000",
        usd: "9,080",
      },
      {
        room: "Triple",
        pkr: "2,590,000",
        usd: "9,300",
        extra: "Azizia Triple Bed Charges: USD 350 per person",
      },
      {
        room: "Double",
        pkr: "2,690,000",
        usd: "9,800",
        extra: "Azizia Double Bed Charges: USD 950 per person",
      },
    ],

    detailsTitle: "17 Days Package Details",

    details: [
      "Maktab A Category — Zone 01",
      "Premium plan without air ticket",
      "Qurbani is not included in the package",
      "Azizia accommodation is shared by default",
      "Separate room in Azizia is available with additional charges",
      "3 nights Madinah",
      "4 nights Azizia",
      "Hajj days in Mina, Arafat and Muzdalifah",
      "Makkah Movenpick 5 Star accommodation",
      "Madinah Hilton accommodation",
      "Experienced staff",
      "24/7 support service",
    ],

    itinerary: [
      "9–10 May: Arrival at Jeddah and transfer to Azizia — Full Board",
      "10–13 May: Stay in Azizia — Full Board",
      "14–18 May: Hajj Days in Mina, Arafat and Muzdalifah — Full Board",
      "19–20 May: Stay in Azizia — Full Board",
      "20–23 May: Makkah Movenpick 5 Star — Half Board",
      "23–26 May: Madinah Hilton — Half Board",
      "26 May: Madinah/Jeddah to Lahore",
    ],
  },

  {
    id: 3,
    title: "14 Days Premium Hajj Package",
    duration: "14 Days",
    badge: "Premium Plan Without Ticket",
    image: "/images/hajj 14 days.jpeg",
    downloadName: "Makki-Madni-14-Days-Hajj-Package-2027.jpeg",
    priceLabel: "Starting from PKR 2,275,000",

    prices: [
      {
        room: "Quad",
        pkr: "2,275,000",
        usd: "8,180",
      },
      {
        room: "Triple",
        pkr: "2,350,000",
        usd: "8,450",
        extra: "Azizia Triple Bed Charges: USD 350 per person",
      },
      {
        room: "Double",
        pkr: "2,390,000",
        usd: "8,630",
        extra: "Azizia Double Bed Charges: USD 950 per person",
      },
    ],

    detailsTitle: "14 Days Package Details",

    details: [
      "Maktab A Category — Zone 01",
      "Premium plan without air ticket",
      "Qurbani is not included in the package",
      "Azizia accommodation is shared by default",
      "Separate room in Azizia is available with additional charges",
      "3 nights Madinah",
      "4 nights Azizia",
      "Hajj days in Mina, Arafat and Muzdalifah",
      "Madinah Emaar Royal accommodation",
      "Experienced guides",
      "24/7 support assistance",
    ],

    itinerary: [
      "9–10 May: Arrival at Jeddah and transfer to Azizia — Full Board",
      "10–13 May: Stay in Azizia — Full Board",
      "14–18 May: Hajj Days in Mina, Arafat and Muzdalifah — Full Board",
      "19–20 May: Stay in Azizia — Full Board",
      "20–23 May: Madinah Emaar Royal — Half Board",
      "23 May: Madinah/Jeddah to Lahore",
    ],
  },

  {
    id: 4,
    title: "Maktab Category-A Facilities",
    duration: "Facilities",
    badge: "Facilities & Contact Details",
    image: "/images/package details.jfif",
    downloadName: "Makki-Madni-Maktab-Category-A-Facilities.jfif",
    priceLabel: "Complete Facilities & Policy Information",

    detailsTitle: "Facilities & Contact Details",

    details: [
      "VIP Zone 1 location closest to the Rami area",
      "Air-conditioned carpeted tent cabins with walls and doors in Mina",
      "15–16 persons per tent",
      "Tent size approximately 4m × 4m",
      "Private washrooms in Mina and Arafat",
      "Small mattress or sofa beds with pillow, sheets and light blankets",
      "Mina full-board buffet including breakfast, lunch and dinner",
      "Hot drinks, cold drinks, juices, fruits and mineral water available",
      "Arafat air-conditioned marquee",
      "Breakfast and lunch in Arafat",
      "Muzdalifah sleeping kit and meal box provided by Moallam",
      "Airport meet and assist service",
      "Baggage handling by United Agents Office, Government of KSA",
      "VIP private air-conditioned buses with washroom",
      "Seat-by-seat transportation",
      "Ziarat in Makkah and Madinah with guide",
      "Complimentary transport from Azizia to Haram except 7 and 13 Zilhajj",
      "Required documents and payment policy are mentioned in the flyer",
      "Direct WhatsApp booking: 0300-6975181",
    ],
  },
];

function buildWhatsAppMessage(pkg: HajjPackage) {
  const prices = pkg.prices
    ? pkg.prices
        .map(
          (item) => `${item.room} Package
PKR ${item.pkr}
USD ${item.usd}${item.extra ? `\n${item.extra}` : ""}`
        )
        .join("\n\n")
    : pkg.priceLabel;

  const packageDetails = pkg.details
    .map((detail) => `• ${detail}`)
    .join("\n");

  const itinerary = pkg.itinerary
    ? `

Tentative Travel Itinerary:
${pkg.itinerary.map((item) => `• ${item}`).join("\n")}`
    : "";

  return `Assalam-o-Alaikum,

I am interested in the following Hajj 2027 package:

${pkg.title}
${pkg.badge}

Package Pricing:
${prices}

${pkg.detailsTitle}:
${packageDetails}${itinerary}

Please send me complete booking details, availability, required documents and payment procedure.

Thank you.`;
}

export default function Packages() {
  return (
    <section
      id="packages"
      className="relative overflow-hidden bg-[#f7f3e9] px-4 py-20 text-[#082017] sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Background Design */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_15%,rgba(212,175,55,.18),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(11,93,59,.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#d4af37]/40 bg-white/80 px-5 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-[#9a741f] shadow-sm backdrop-blur">
            Hajj 2027
          </span>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-[#082017] sm:text-5xl lg:text-6xl">
            Premium Hajj Packages
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/60 sm:text-lg">
            Select your preferred package, check complete prices and itinerary,
            download the original flyer or book directly through WhatsApp.
          </p>
        </div>

        {/* Package Cards */}
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-2">
          {HAJJ_PACKAGES.map((pkg) => {
            const whatsappMessage = buildWhatsAppMessage(pkg);

            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              whatsappMessage
            )}`;

            return (
              <article
                key={pkg.id}
                className="group overflow-hidden rounded-[2rem] border border-[#d4af37]/25 bg-white shadow-[0_18px_60px_rgba(8,32,23,0.12)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_26px_80px_rgba(8,32,23,0.18)]"
              >
                {/* Flyer Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e1d2]">
                  <Image
                    src={pkg.image}
                    alt={`${pkg.title} flyer`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain transition duration-700 group-hover:scale-[1.015]"
                    priority={pkg.id === 1}
                  />

                  {/* Badges */}
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
                    <span className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-black text-[#082017] shadow-lg">
                      {pkg.duration}
                    </span>

                    <span className="max-w-[70%] rounded-full bg-[#082017]/90 px-4 py-2 text-right text-xs font-bold text-white shadow-lg backdrop-blur sm:text-sm">
                      {pkg.badge}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-black text-[#0b5d3b] sm:text-3xl">
                    {pkg.title}
                  </h3>

                  <p className="mt-3 text-xl font-extrabold text-[#a67d20]">
                    {pkg.priceLabel}
                  </p>

                  {/* Prices */}
                  {pkg.prices && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {pkg.prices.map((item) => (
                        <div
                          key={item.room}
                          className="rounded-2xl border border-[#d4af37]/25 bg-[#fbf8f0] p-4 text-center"
                        >
                          <p className="text-sm font-black uppercase tracking-wide text-[#0b5d3b]">
                            {item.room}
                          </p>

                          <p className="mt-2 text-lg font-black text-[#082017]">
                            PKR {item.pkr}
                          </p>

                          <p className="mt-1 text-sm font-bold text-black/55">
                            USD {item.usd}
                          </p>

                          {item.extra && (
                            <p className="mt-3 text-xs leading-5 text-black/50">
                              {item.extra}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Package Details */}
                  <div className="mt-7 rounded-3xl border border-[#0b5d3b]/10 bg-[#f7faf8] p-5 sm:p-6">
                    <h4 className="text-lg font-black text-[#0b5d3b]">
                      {pkg.detailsTitle}
                    </h4>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {pkg.details.map((detail) => (
                        <div key={detail} className="flex items-start gap-3">
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0b5d3b] text-[11px] font-black text-white">
                            ✓
                          </span>

                          <p className="text-sm leading-6 text-black/65">
                            {detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Itinerary */}
                  {pkg.itinerary && (
                    <details className="mt-5 rounded-3xl border border-[#d4af37]/25 bg-[#fffaf0] p-5 open:shadow-sm">
                      <summary className="cursor-pointer list-none font-black text-[#8a671b]">
                        View Tentative Travel Itinerary
                      </summary>

                      <div className="mt-4 space-y-3">
                        {pkg.itinerary.map((item) => (
                          <p
                            key={item}
                            className="border-l-2 border-[#d4af37] pl-3 text-sm leading-6 text-black/65"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Buttons */}
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Book ${pkg.title} on WhatsApp`}
                      className="inline-flex items-center justify-center rounded-full bg-[#0b5d3b] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-[#083f2a] hover:shadow-xl"
                    >
                      Book Now
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask about ${pkg.title} on WhatsApp`}
                      className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-95 hover:shadow-xl"
                    >
                      WhatsApp
                    </a>

                    <a
                      href={pkg.image}
                      download={pkg.downloadName}
                      className="inline-flex items-center justify-center rounded-full border-2 border-[#d4af37] bg-white px-5 py-3.5 text-sm font-black text-[#8a671b] transition hover:bg-[#fff7df]"
                    >
                      Download Flyer
                    </a>
                  </div>

                  <p className="mt-5 text-center text-xs leading-5 text-black/45">
                    Prices, dates and itinerary are subject to final
                    confirmation. Any increase in Mashair or Saudi government
                    charges will be payable by the Haji.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}