export default function Reviews() {
const reviews = [
{
name: "Muhammad Ali",
city: "Lahore",
review:
"Excellent Hajj arrangements. Hotels, transport and guides were outstanding.",
},
{
name: "Hafiz Ahmad",
city: "Karachi",
review:
"Very professional company. Everything was perfectly managed.",
},
{
name: "Abdul Rehman",
city: "Islamabad",
review:
"Highly recommended. Our family performed Umrah without any problems.",
},
];

return (
<section id="reviews" className="py-24 bg-[#f8f5ef]">
<div className="max-w-7xl mx-auto px-6">
<div className="text-center mb-14">
<p className="uppercase tracking-[5px] text-[#D4AF37] font-bold">
Reviews
</p>

<h2 className="text-5xl font-bold text-[#0B5D3B] mt-4">
What Our Pilgrims Say
</h2>
</div>

<div className="grid md:grid-cols-3 gap-8">
{reviews.map((item, index) => (
<div
key={index}
className="bg-white rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition"
>
<div className="text-yellow-500 text-2xl mb-4">
⭐⭐⭐⭐⭐
</div>

<p className="text-gray-600">
{item.review}
</p>

<div className="mt-6">
<h3 className="font-bold text-[#0B5D3B]">
{item.name}
</h3>

<p className="text-gray-500">
{item.city}
</p>
</div>
</div>
))}
</div>
</div>
</section>
);
}