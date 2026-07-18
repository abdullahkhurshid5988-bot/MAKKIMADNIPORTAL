export default function Hero() {
const whatsappMessage = encodeURIComponent(
"Assalamualaikum, I want information about your Hajj and Umrah packages."
);

return (
<section
id="home"
className="relative flex min-h-screen items-center overflow-hidden bg-cover bg-center px-5 pb-20 pt-40 text-white lg:px-8"
style={{
backgroundImage: "url('/images/makkah.jpeg')",
}}
>
<div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
<div className="absolute inset-0 bg-gradient-to-t from-[#042f24] via-transparent to-black/30" />

<div className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
<div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[#d4af37]/15 blur-3xl" />

<div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
<div>
<div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-black/35 px-4 py-2 text-sm text-[#f3d98b] backdrop-blur">
<span className="h-2 w-2 rounded-full bg-[#d4af37]" />
Hajj 2027 Early Registration Open
</div>

<h2 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-7xl">
Begin Your Sacred Journey
<span className="mt-2 block bg-gradient-to-r from-[#fff5d2] via-[#d4af37] to-[#f4dda1] bg-clip-text text-transparent">
With Peace of Mind
</span>
</h2>

<p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
BR Makki Madni Hajj & Umrah Services Pvt Ltd provides trusted Hajj,
Umrah, visa, air ticketing, hotel, transport and religious guidance
services with more than 20 years of experience.
</p>

<div className="mt-9 flex flex-col gap-4 sm:flex-row">
<a
href="#packages"
className="rounded-full bg-gradient-to-r from-[#c59a3b] to-[#f2d58a] px-8 py-4 text-center font-bold text-[#042f24] shadow-xl transition hover:-translate-y-1"
>
View Hajj Packages
</a>

<a
href={`https://wa.me/923006975181?text=${whatsappMessage}`}
target="_blank"
rel="noopener noreferrer"
className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-center font-semibold backdrop-blur transition hover:border-[#d4af37] hover:text-[#f2d58a]"
>
Chat on WhatsApp
</a>
</div>

<div className="mt-12 grid max-w-2xl grid-cols-2 gap-5 border-t border-white/15 pt-8 sm:grid-cols-4">
{[
["20+", "Years Experience"],
["5000+", "Pilgrims Served"],
["24/7", "Customer Support"],
["4", "Main Services"],
].map(([number, label]) => (
<div key={label}>
<p className="text-3xl font-bold text-[#e5c77d]">{number}</p>
<p className="mt-1 text-xs text-white/60">{label}</p>
</div>
))}
</div>
</div>

<div className="mx-auto w-full max-w-md">
<div className="rounded-[2rem] border border-[#d4af37]/30 bg-[#052019]/80 p-7 shadow-2xl shadow-black/60 backdrop-blur-xl">
<p className="text-sm uppercase tracking-[0.25em] text-[#e5c77d]">
Premium Hajj Services
</p>

<h3 className="mt-3 text-3xl font-bold">
Hajj 2027 Packages
</h3>

<p className="mt-4 leading-7 text-white/65">
Choose a package according to your preferred duration,
accommodation and budget.
</p>

<div className="mt-7 grid grid-cols-3 gap-3">
{["10 Days", "14 Days", "17 Days"].map((day) => (
<div
key={day}
className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center"
>
<p className="font-bold text-[#f0d382]">{day}</p>
<p className="mt-1 text-[10px] text-white/50">
Package
</p>
</div>
))}
</div>

<div className="mt-7 space-y-3">
{[
"Comfortable accommodation",
"Transport and ziyarat",
"Experienced religious guides",
"Visa and ticketing assistance",
].map((item) => (
<div
key={item}
className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
>
<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-[#042f24]">
✓
</span>

<p className="text-sm text-white/80">{item}</p>
</div>
))}
</div>

<a
href="#booking"
className="mt-7 block rounded-full bg-white px-6 py-4 text-center font-bold text-[#042f24] transition hover:bg-[#f2d58a]"
>
Start Your Booking
</a>
</div>
</div>
</div>
</section>
);
}