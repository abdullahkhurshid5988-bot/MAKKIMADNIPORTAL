export default function Navbar() {
return (
<header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg border-b border-yellow-500/20">
<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

<div className="flex items-center gap-4">
<img
src="/logo.jpg"
alt="Logo"
className="h-16 w-16 object-contain"
/>

<div>
<h1 className="text-2xl font-bold text-green-900">
BR. Makki Madni
</h1>

<p className="text-sm text-yellow-700">
Hajj & Umrah Services Pvt Ltd
</p>
</div>
</div>

<nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold">

<a href="#home" className="hover:text-yellow-600">Home</a>

<a href="#about" className="hover:text-yellow-600">About</a>

<a href="#packages" className="hover:text-yellow-600">Packages</a>

<a href="#services" className="hover:text-yellow-600">Services</a>

<a href="#gallery" className="hover:text-yellow-600">Gallery</a>

<a href="#contact" className="hover:text-yellow-600">Contact</a>

<a
href="#booking"
className="bg-green-700 text-white px-5 py-3 rounded-full hover:bg-green-800 transition"
>
Book Now
</a>

</nav>

</div>
</header>
);
}