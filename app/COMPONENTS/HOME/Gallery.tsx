"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryItem = {
  id: number;
  src: string;
  title: string;
  category: string;
};

const gallery: GalleryItem[] = [
  {
    id: 1,
    src: "/images/17 days.jfif",
    title: "17 Days Hajj Package",
    category: "Packages",
  },
  {
    id: 2,
    src: "/images/21 days.jpg",
    title: "21 Days Hajj Package",
    category: "Packages",
  },
  {
    id: 3,
    src: "/images/21days.jfif",
    title: "21 Days Premium Package",
    category: "Packages",
  },
  {
    id: 4,
    src: "/images/hajj 14 days.jpeg",
    title: "14 Days Hajj Package",
    category: "Packages",
  },
  {
    id: 5,
    src: "/images/package details.jfif",
    title: "Package Details",
    category: "Packages",
  },
  {
    id: 6,
    src: "/images/package17.jpg.jpeg",
    title: "17 Days Package Details",
    category: "Packages",
  },
  {
    id: 7,
    src: "/images/premium-hajj.jpg.jpeg",
    title: "Premium Hajj Package",
    category: "Packages",
  },

  {
    id: 8,
    src: "/images/after hajj.jpeg",
    title: "After Hajj",
    category: "Hajj",
  },
  {
    id: 9,
    src: "/images/hajji.jpeg",
    title: "Hajj Pilgrims",
    category: "Hajj",
  },
  {
    id: 10,
    src: "/images/hajji (2).jpeg",
    title: "Hajj Pilgrims Group",
    category: "Hajj",
  },
  {
    id: 11,
    src: "/images/hujjaj.jpeg",
    title: "Hujjaj Group",
    category: "Hajj",
  },
  {
    id: 12,
    src: "/images/hero.jpg.jfif",
    title: "Hajj Journey",
    category: "Hajj",
  },
  {
    id: 13,
    src: "/images/hero-2.jpg",
    title: "Sacred Journey",
    category: "Hajj",
  },
  {
    id: 14,
    src: "/images/hero.jpg (3).jfif",
    title: "Hajj & Umrah Journey",
    category: "Hajj",
  },

  {
    id: 15,
    src: "/images/hajj training.jpeg",
    title: "Hajj Training",
    category: "Training",
  },
  {
    id: 16,
    src: "/images/hajj training (2).jpeg",
    title: "Hajj Training Session",
    category: "Training",
  },
  {
    id: 17,
    src: "/images/hajj training (3).jpeg",
    title: "Hajj Training Program",
    category: "Training",
  },
  {
    id: 18,
    src: "/images/training.jpeg",
    title: "Pilgrims Training",
    category: "Training",
  },

  {
    id: 19,
    src: "/images/azizia hotel.jpeg",
    title: "Azizia Hotel",
    category: "Azizia",
  },
  {
    id: 20,
    src: "/images/azizia hotel (2).jfif",
    title: "Azizia Hotel Interior",
    category: "Azizia",
  },
  {
    id: 21,
    src: "/images/azizia hotel (3).jfif",
    title: "Azizia Hotel Room",
    category: "Azizia",
  },
  {
    id: 22,
    src: "/images/azizia hotel.jfif",
    title: "Azizia Hotel Night View",
    category: "Azizia",
  },

  {
    id: 23,
    src: "/images/madina hilton.jfif",
    title: "Madinah Hilton",
    category: "Hotels",
  },
  {
    id: 24,
    src: "/images/madina hilton (2).jfif",
    title: "Madinah Hilton Exterior",
    category: "Hotels",
  },
  {
    id: 25,
    src: "/images/madina hilton hotel.jfif",
    title: "Madinah Hilton Hotel",
    category: "Hotels",
  },
  {
    id: 26,
    src: "/images/madina hilton hotel (2).jfif",
    title: "Madinah Hilton Accommodation",
    category: "Hotels",
  },
  {
    id: 27,
    src: "/images/madina hilton hotel (3).jfif",
    title: "Madinah Hilton Room",
    category: "Hotels",
  },

  {
    id: 28,
    src: "/images/makkah (2).jfif",
    title: "Makkah",
    category: "Makkah",
  },
  {
    id: 29,
    src: "/images/makkah movin pic.jfif",
    title: "Makkah Movenpick",
    category: "Hotels",
  },
  {
    id: 30,
    src: "/images/makkah movin pick.jfif",
    title: "Makkah Movenpick Hotel",
    category: "Hotels",
  },
  {
    id: 31,
    src: "/images/makkah movin movinpick.jfif",
    title: "Makkah Movenpick Room",
    category: "Hotels",
  },

  {
    id: 32,
    src: "/images/mina camp.jpeg",
    title: "Mina Camp",
    category: "Mashair",
  },
  {
    id: 33,
    src: "/images/mina maktab a.jpeg",
    title: "Mina Maktab Category A",
    category: "Mashair",
  },
  {
    id: 34,
    src: "/images/mina tant.jpeg",
    title: "Mina Tent",
    category: "Mashair",
  },
  {
    id: 35,
    src: "/images/mina.jpeg",
    title: "Mina Facilities",
    category: "Mashair",
  },

  {
    id: 36,
    src: "/images/ziarat.jpeg",
    title: "Ziyarat",
    category: "Ziyarat",
  },

  {
    id: 37,
    src: "/images/logo.jpg",
    title: "Makki Madni Logo",
    category: "Company",
  },
  {
    id: 38,
    src: "/images/card.jpeg",
    title: "Company Card",
    category: "Company",
  },
];

const categories = [
  "All",
  "Packages",
  "Hajj",
  "Training",
  "Azizia",
  "Hotels",
  "Makkah",
  "Mashair",
  "Ziyarat",
  "Company",
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGallery =
    selectedCategory === "All"
      ? gallery
      : gallery.filter((item) => item.category === selectedCategory);

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#f8f5ef] px-4 py-20 text-[#082017] sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_15%_20%,rgba(212,175,55,.18),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(11,93,59,.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-bold uppercase tracking-[0.25em] text-[#b28a2e]">
            Our Gallery
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl lg:text-6xl">
            Hajj Journey & Facilities
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-black/60">
            Explore our Hajj packages, training sessions, hotels, Azizia
            accommodation, Mashair facilities and Ziyarat.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                selectedCategory === category
                  ? "bg-[#0b5d3b] text-white shadow-lg"
                  : "border border-[#d4af37]/30 bg-white text-[#082017] hover:border-[#d4af37] hover:bg-[#fff8e7]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGallery.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[1.7rem] border border-[#d4af37]/20 bg-white shadow-[0_14px_40px_rgba(8,32,23,0.10)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(8,32,23,0.16)]"
            >
              <div className="relative h-[300px] overflow-hidden bg-[#eae5d9]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

                <span className="absolute left-4 top-4 rounded-full bg-[#d4af37] px-4 py-2 text-xs font-black text-[#082017] shadow-lg">
                  {item.category}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl font-black text-white">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                <a
                  href={item.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full bg-[#0b5d3b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#083f2a]"
                >
                  View Image
                </a>

                <a
                  href={item.src}
                  download
                  className="flex items-center justify-center rounded-full border-2 border-[#d4af37] px-4 py-3 text-sm font-bold text-[#8a671b] transition hover:bg-[#fff7df]"
                >
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}