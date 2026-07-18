import Navbar from "./COMPONENTS/LAYOUT/Navbar";
import Hero from "./COMPONENTS/HOME/Hero";
import About from "./COMPONENTS/HOME/About";
import Services from "./COMPONENTS/HOME/Services";
import Packages from "./COMPONENTS/HOME/Packages";
import Gallery from "./COMPONENTS/HOME/Gallery";
import Reviews from "./COMPONENTS/HOME/Reviews";
export default function Home() {
return (
<main className="min-h-screen bg-[#042f24]">
<Navbar />
<Hero />
<About />
<Services />
<Packages />
<Gallery />
<Reviews />
</main>
);
}