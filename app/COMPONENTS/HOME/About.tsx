export default function About() {
return (
<section
id="about"
className="bg-[#f8f5ef] py-24 px-6"
>
<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

<div>
<img
src="/images/hajj training.jpeg"
alt="Hajj Training"
className="rounded-3xl shadow-2xl w-full"
/>
</div>

<div>

<p className="text-[#D4AF37] font-bold uppercase tracking-widest">
About Us
</p>

<h2 className="text-5xl font-bold mt-4 text-[#0B5D3B]">
25+ Years of Trusted Experience
</h2>

<p className="mt-6 text-gray-600 leading-8">
BR. Makki Madni Hajj & Umrah Services Pvt Ltd has proudly served
thousands of pilgrims with trusted Hajj and Umrah services.
We provide visa processing, hotel booking, transport,
air ticketing and complete pilgrimage guidance.
</p>

<div className="grid grid-cols-2 gap-6 mt-10">

<div className="bg-white rounded-2xl shadow-lg p-6">
<h3 className="text-4xl font-bold text-[#0B5D3B]">
20+
</h3>
<p>Years Experience</p>
</div>

<div className="bg-white rounded-2xl shadow-lg p-6">
<h3 className="text-4xl font-bold text-[#0B5D3B]">
5000+
</h3>
<p>Happy Pilgrims</p>
</div>

<div className="bg-white rounded-2xl shadow-lg p-6">
<h3 className="text-4xl font-bold text-[#0B5D3B]">
24/7
</h3>
<p>Support</p>
</div>

<div className="bg-white rounded-2xl shadow-lg p-6">
<h3 className="text-4xl font-bold text-[#0B5D3B]">
100%
</h3>
<p>Customer Satisfaction</p>
</div>

</div>

</div>

</div>
</section>
);
}