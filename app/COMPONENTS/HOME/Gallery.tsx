import Image from "next/image";

const gallery = [
{ src: "/images/after hajj.jpeg", title: "After Hajj" },
{ src: "/images/hajj training.jpeg", title: "Training Session" },
{ src: "/images/hajj training (2).jpeg", title: "Training Program" },
{ src: "/images/hajj training (3).jpeg", title: "Pilgrim Training" },

{ src: "/images/hajji.jpeg", title: "Pilgrims" },
{ src: "/images/hajji (2).jpeg", title: "Happy Pilgrims" },
{ src: "/images/hujjaj.jpeg", title: "Hujjaj" },

{ src: "/images/makkah (2).jfif", title: "Makkah" },
{ src: "/images/madina hilton.jpeg", title: "Madina Hilton" },
{ src: "/images/madina hilton (2).jfif", title: "Hilton View" },

{ src: "/images/azizia hotel.jpeg", title: "Azizia Hotel" },
{ src: "/images/azizia hotel (2).jfif", title: "Hotel Room" },
{ src: "/images/azizia hotel (3).jfif", title: "Accommodation" },
{ src: "/images/azizia hotel.jfif", title: "Luxury Stay" },

{ src: "/images/mina.jpeg", title: "Mina" },
{ src: "/images/mina camp.jpeg", title: "Mina Camp" },
{ src: "/images/mina maktab a.jpeg", title: "Mina Maktab" },
{ src: "/images/mina tant.jpeg", title: "Tent City" },

{ src: "/images/ziarat.jpeg", title: "Ziarat" },

{ src: "/images/makkah movin pick.jfif", title: "Movenpick" },
{ src: "/images/makkah movin pic.jpeg", title: "Hotel Room" },
{ src: "/images/makkah movinpick.jfif", title: "Movenpick Hotel" },

{ src: "/images/card.jpeg", title: "Company Card" },
{ src: "/images/logo.jpeg", title: "Company Logo" },
];

export default function Gallery() {
return (
<section id="gallery" className="py-24 bg-[#f8f5ef]">
<div className="max-w-7xl mx-auto px-6">

<div className="text-center mb-14">
<p className="uppercase tracking-[5px] text-[#D4AF37] font-bold">
Gallery
</p>

<h2 className="text-5xl font-bold text-[#0B5D3B] mt-4">
Hajj & Umrah Memories
</h2>

<p className="text-gray-600 mt-5">
Beautiful memories from our pilgrims and services.
</p>
</div>

<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
{gallery.map((item, index) => (
<div
key={index}
className="overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition duration-300"
>
<Image
src={item.src}
alt={item.title}
width={500}
height={400}
className="w-full h-72 object-cover hover:scale-110 transition duration-500"
/>

<div className="p-4 text-center">
<h3 className="font-semibold text-[#0B5D3B]">
{item.title}
</h3>
</div>
</div>
))}
</div>

</div>
</section>
);
}