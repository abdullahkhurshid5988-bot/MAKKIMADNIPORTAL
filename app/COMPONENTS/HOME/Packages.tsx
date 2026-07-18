import Image from "next/image";

const hajjPackages = [
{
id: 1,
title: "Premium Hajj Package",
duration: "10 Days",
image: "/images/package10 days.jpeg",
price: "Starting from PKR 2,850,000",
details: [
"Quad: PKR 2,850,000",
"Triple: PKR 2,925,000",
"Double: PKR 3,050,000",
"Madinah: Maysan Al Harithia",
"Azizia accommodation",
"Transport and religious guidance",
],
},
{
id: 2,
title: "Comfort Hajj Package",
duration: "14 Days",
image: "/images/hajj 14 days.jpeg",
price: "Price on Request",
details: [
"Comfortable accommodation",
"Makkah and Madinah stay",
"Air-conditioned transport",
"Hajj training",
"Experienced guides",
"24/7 assistance",
],
},
{
id: 3,
title: "Hajj Important Notes",
duration: "Hajj 2027",
image: "/images/card.jpeg",
price: "Contact for Details",
details: [
"Azizia standard hotel",
"Madinah hotel arrangement",
"Mashair transport",
"Airport transfers",
"Hotel policy information",
"Package terms and conditions",
],
},
];

export default function Packages() {
return (
<section
id="packages"
className="bg-[#f8f5ef] px-5 py-20 text-[#082017] lg:px-8 lg:py-28"
>
<div className="mx-auto max-w-7xl">
<div className="mx-auto max-w-3xl text-center">
<p className="font-bold uppercase tracking-[0.25em] text-[#b28a2e]">
Hajj 2027
</p>

<h2 className="mt-4 text-4xl font-bold sm:text-5xl">
Premium Hajj Packages
</h2>

<p className="mt-5 leading-8 text-black/60">
Choose a package according to your preferred duration,
accommodation and requirements.
</p>
</div>

<div className="mt-14 grid gap-8 lg:grid-cols-3">
{hajjPackages.map((pkg) => (
<article
key={pkg.id}
className="overflow-hidden rounded-[1.8rem] border border-[#d4af37]/20 bg-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
>
<div className="relative h-[430px] overflow-hidden bg-[#eae5d9]">
<Image
src={pkg.image}
alt={pkg.title}
fill
sizes="(max-width: 1024px) 100vw, 33vw"
className="object-contain transition duration-500 hover:scale-105"
/>

<span className="absolute left-5 top-5 rounded-full bg-[#d4af37] px-4 py-2 text-sm font-bold text-[#082017] shadow-lg">
{pkg.duration}
</span>
</div>

<div className="p-6">
<h3 className="text-2xl font-bold text-[#0b5d3b]">
{pkg.title}
</h3>

<p className="mt-3 text-xl font-bold text-[#b28a2e]">
{pkg.price}
</p>

<div className="mt-5 space-y-3">
{pkg.details.map((detail) => (
<div key={detail} className="flex items-start gap-3">
<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0b5d3b] text-[10px] text-white">
✓
</span>

<p className="text-sm leading-6 text-black/65">
{detail}
</p>
</div>
))}
</div>

<div className="mt-7 grid grid-cols-2 gap-3">
<a
href="#booking"
className="rounded-full bg-[#0b5d3b] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#083f2a]"
>
Book Now
</a>

<a
href={`https://wa.me/923006975181?text=${encodeURIComponent(
`Assalamualaikum, I want details about ${pkg.title}.`
)}`}
target="_blank"
rel="noopener noreferrer"
className="rounded-full bg-[#25D366] px-4 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
>
WhatsApp
</a>
</div>

<p className="mt-4 text-center text-xs text-black/45">
Prices and itinerary are subject to confirmation.
</p>
</div>
</article>
))}
</div>
</div>
</section>
);
}