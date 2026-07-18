import Image from "next/image";

const services = [
{
title: "Hajj Packages",
image: "/images/mina.jpeg",
description:
"Premium, comfort and economy Hajj packages with accommodation, transport, guidance and complete support.",
},
{
title: "Umrah Packages",
image: "/images/madina.jpeg",
description:
"Flexible Umrah packages for individuals, families and groups with hotels, visa and ziyarat arrangements.",
},
{
title: "Air Ticketing",
image: "/images/makkah.jpeg",
description:
"Professional international and domestic flight-booking assistance at competitive rates.",
},
{
title: "Visa Assistance",
image: "/images/ziarat.jpeg",
description:
"Reliable assistance for Umrah, visit, family and tourist visa requirements.",
},
{
title: "Hotel Booking",
image: "/images/azizia hotel.jpeg",
description:
"Comfortable hotel options in Makkah, Madinah and Azizia according to your package and budget.",
},
{
title: "Hajj Training",
image: "/images/hajj training.jpeg",
description:
"Practical Hajj training sessions with religious guidance and preparation before departure.",
},
];

export default function Services() {
return (
<section
id="services"
className="bg-[#042f24] px-6 py-24 text-white"
>
<div className="mx-auto max-w-7xl">
<div className="mx-auto max-w-3xl text-center">
<p className="font-bold uppercase tracking-[0.25em] text-[#d4af37]">
Our Premium Services
</p>

<h2 className="mt-4 text-4xl font-bold sm:text-5xl">
Complete Support for Your
<span className="block text-[#e5c77d]">Sacred Journey</span>
</h2>

<p className="mt-6 leading-8 text-white/65">
Hajj, Umrah, visas, air tickets, hotels and training services under
one trusted company.
</p>
</div>

<div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
{services.map((service) => (
<article
key={service.title}
className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-xl transition duration-300 hover:-translate-y-2 hover:border-[#d4af37]/50"
>
<div className="relative h-56 overflow-hidden">
<Image
src={service.image}
alt={service.title}
fill
sizes="(max-width: 768px) 100vw, 33vw"
className="object-cover transition duration-500 group-hover:scale-110"
/>

<div className="absolute inset-0 bg-gradient-to-t from-[#042f24] via-transparent to-transparent" />
</div>

<div className="p-6">
<h3 className="text-2xl font-bold text-[#f1d487]">
{service.title}
</h3>

<p className="mt-3 leading-7 text-white/65">
{service.description}
</p>

<a
href="#booking"
className="mt-5 inline-flex font-semibold text-[#e5c77d] transition group-hover:translate-x-1"
>
Get Details →
</a>
</div>
</article>
))}
</div>
</div>
</section>
);
}