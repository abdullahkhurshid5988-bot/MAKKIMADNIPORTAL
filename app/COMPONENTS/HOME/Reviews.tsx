"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  name: string;
  city: string;
  packageName: string;
  rating: number;
  message: string;
  date: string;
  source: "Google" | "Website";
  verified: boolean;
};

/*
  Apni Google Business Profile review link yahan paste karein.
  Google Business Profile > Ask for reviews > Copy link
*/
const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=YOUR_GOOGLE_PLACE_ID";

/*
  Yahan sirf apne asli customer reviews add karein.
  Isi format mein 30 ya us se zyada reviews add ho sakte hain.
*/
const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Customer Name",
    city: "Faisalabad",
    packageName: "21 Days Premium Hajj",
    rating: 5,
    message: "Apne asli customer ka review yahan paste karein.",
    date: "18 July 2026",
    source: "Google",
    verified: true,
  },
];

function Stars({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={`${star} star rating`}
            className={`text-3xl transition hover:scale-110 ${
              star <= rating ? "text-[#fbbc04]" : "text-black/15"
            }`}
          >
            ★
          </button>
        ) : (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? "text-[#fbbc04]" : "text-black/15"
            }`}
          >
            ★
          </span>
        )
      )}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [visibleCount, setVisibleCount] = useState(6);
  const [ratingFilter, setRatingFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    packageName: "",
    rating: 5,
    message: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("makki-madni-reviews");

    if (!saved) return;

    try {
      const websiteReviews: Review[] = JSON.parse(saved);
      setReviews([...websiteReviews, ...INITIAL_REVIEWS]);
    } catch {
      console.error("Reviews could not be loaded.");
    }
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const ratingSummary = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter(
        (review) => review.rating === rating
      ).length;

      const percentage =
        reviews.length > 0
          ? Math.round((count / reviews.length) * 100)
          : 0;

      return {
        rating,
        count,
        percentage,
      };
    });
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reviews.filter((review) => {
      const ratingMatches =
        ratingFilter === "All" ||
        review.rating === Number(ratingFilter);

      const searchMatches =
        keyword === "" ||
        review.name.toLowerCase().includes(keyword) ||
        review.city.toLowerCase().includes(keyword) ||
        review.packageName.toLowerCase().includes(keyword) ||
        review.message.toLowerCase().includes(keyword);

      return ratingMatches && searchMatches;
    });
  }, [reviews, ratingFilter, search]);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFormMessage("Please enter your name.");
      return;
    }

    if (formData.message.trim().length < 20) {
      setFormMessage(
        "Please write a review of at least 20 characters."
      );
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      name: formData.name.trim(),
      city: formData.city.trim() || "Pakistan",
      packageName:
        formData.packageName || "Hajj & Umrah Services",
      rating: formData.rating,
      message: formData.message.trim(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      source: "Website",
      verified: false,
    };

    let storedReviews: Review[] = [];

    const saved = localStorage.getItem("makki-madni-reviews");

    if (saved) {
      try {
        storedReviews = JSON.parse(saved);
      } catch {
        storedReviews = [];
      }
    }

    const updatedStoredReviews = [
      newReview,
      ...storedReviews,
    ];

    localStorage.setItem(
      "makki-madni-reviews",
      JSON.stringify(updatedStoredReviews)
    );

    setReviews((currentReviews) => [
      newReview,
      ...currentReviews,
    ]);

    setFormData({
      name: "",
      city: "",
      packageName: "",
      rating: 5,
      message: "",
    });

    setVisibleCount(6);
    setFormMessage(
      "Thank you. Your review has been submitted successfully."
    );

    setTimeout(() => {
      setShowForm(false);
      setFormMessage("");
    }, 1800);
  }

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#f8f5ef] px-4 py-20 text-[#082017] sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_10%_15%,rgba(212,175,55,.18),transparent_28%),radial-gradient(circle_at_90%_30%,rgba(11,93,59,.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#d4af37]/40 bg-white px-5 py-2 text-sm font-extrabold uppercase tracking-[0.2em] text-[#9a741f] shadow-sm">
            Customer Reviews
          </span>

          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Trusted by Hajj Pilgrims
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/60 sm:text-lg">
            Read customer experiences and share your feedback
            about BR. Makki Madni Hajj & Umrah Services.
          </p>
        </div>

        {/* Review Overview */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-[#d4af37]/20 bg-white p-6 shadow-xl sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5">
                <span className="text-3xl font-black text-[#4285f4]">
                  G
                </span>
              </div>

              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-black/45">
                Customer Rating
              </p>

              <p className="mt-2 text-6xl font-black">
                {reviews.length > 0 ? averageRating : "—"}
              </p>

              <div className="mt-2 flex justify-center">
                <Stars rating={Math.round(averageRating)} />
              </div>

              <p className="mt-3 text-sm text-black/50">
                Based on {reviews.length} customer reviews
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {ratingSummary.map((item) => (
                <div
                  key={item.rating}
                  className="grid grid-cols-[40px_1fr_40px] items-center gap-3"
                >
                  <span className="text-sm font-bold">
                    {item.rating} ★
                  </span>

                  <div className="h-2 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-[#fbbc04]"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                  <span className="text-right text-xs text-black/45">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-full bg-[#0b5d3b] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-[#083f2a]"
              >
                Share Your Experience
              </button>

              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-[#d4af37] px-5 py-3.5 text-center text-sm font-black text-[#8a671b] transition hover:bg-[#fff7df]"
              >
                Write a Google Review
              </a>
            </div>
          </div>

          {/* Search */}
          <div className="rounded-[2rem] border border-[#d4af37]/20 bg-white p-6 shadow-xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b28a2e]">
              Customer Experiences
            </p>

            <h3 className="mt-2 text-3xl font-black">
              Find Customer Reviews
            </h3>

            <p className="mt-3 leading-7 text-black/55">
              Search reviews by customer name, city, package or
              experience.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(6);
                }}
                placeholder="Search reviews..."
                className="rounded-full border border-black/10 bg-[#f8f5ef] px-5 py-3.5 text-sm outline-none focus:border-[#0b5d3b]"
              />

              <select
                value={ratingFilter}
                onChange={(event) => {
                  setRatingFilter(event.target.value);
                  setVisibleCount(6);
                }}
                className="rounded-full border border-black/10 bg-[#f8f5ef] px-5 py-3.5 text-sm font-bold outline-none focus:border-[#0b5d3b]"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="mt-7 rounded-3xl bg-[#f7faf8] p-5">
              <p className="font-black text-[#0b5d3b]">
                Review Results
              </p>

              <p className="mt-2 text-sm text-black/55">
                Showing{" "}
                {Math.min(
                  visibleCount,
                  filteredReviews.length
                )}{" "}
                of {filteredReviews.length} reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Review Cards */}
        {filteredReviews.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews
              .slice(0, visibleCount)
              .map((review) => (
                <article
                  key={review.id}
                  className="flex h-full flex-col rounded-[1.7rem] border border-[#d4af37]/20 bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b5d3b] text-lg font-black text-white">
                        {review.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-black">
                          {review.name}
                        </h3>

                        <p className="mt-1 text-xs text-black/45">
                          {review.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5">
                      <span
                        className={
                          review.source === "Google"
                            ? "font-black text-[#4285f4]"
                            : "font-black text-[#0b5d3b]"
                        }
                      >
                        {review.source === "Google" ? "G" : "W"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Stars rating={review.rating} />

                    <span className="text-xs text-black/40">
                      {review.date}
                    </span>
                  </div>

                  <p className="mt-5 flex-1 text-sm leading-7 text-black/65">
                    “{review.message}”
                  </p>

                  <div className="mt-5 border-t border-black/5 pt-4">
                    <p className="text-xs font-bold text-[#0b5d3b]">
                      {review.packageName}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-black/40">
                        {review.source === "Google"
                          ? "Google Review"
                          : "Website Review"}
                      </span>

                      {review.verified && (
                        <span className="rounded-full bg-[#e8f5ed] px-3 py-1 text-[10px] font-black uppercase text-[#0b5d3b]">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-lg">
            <h3 className="text-2xl font-black">
              No Reviews Found
            </h3>

            <p className="mt-3 text-black/55">
              Try another search or submit your experience.
            </p>
          </div>
        )}

        {visibleCount < filteredReviews.length && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) => current + 6)
              }
              className="rounded-full bg-[#082017] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#0b5d3b]"
            >
              Load More Reviews
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b28a2e]">
                  Customer Feedback
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  Share Your Experience
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormMessage("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-xl font-black"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={submitReview}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-bold">
                    Your Name *
                  </span>

                  <input
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        name: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
                    placeholder="Enter your name"
                  />
                </label>

                <label>
                  <span className="text-sm font-bold">
                    City
                  </span>

                  <input
                    value={formData.city}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        city: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
                    placeholder="Faisalabad"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold">
                  Package
                </span>

                <select
                  value={formData.packageName}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      packageName: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none"
                >
                  <option value="">Select package</option>
                  <option value="14 Days Premium Hajj">
                    14 Days Premium Hajj
                  </option>
                  <option value="17 Days Premium Hajj">
                    17 Days Premium Hajj
                  </option>
                  <option value="21 Days Premium Hajj">
                    21 Days Premium Hajj
                  </option>
                  <option value="Umrah Services">
                    Umrah Services
                  </option>
                </select>
              </label>

              <div>
                <p className="text-sm font-bold">
                  Your Rating *
                </p>

                <div className="mt-2">
                  <Stars
                    rating={formData.rating}
                    interactive
                    onChange={(rating) =>
                      setFormData({
                        ...formData,
                        rating,
                      })
                    }
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-bold">
                  Your Review *
                </span>

                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      message: event.target.value,
                    })
                  }
                  className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
                  placeholder="Tell us about your experience..."
                />
              </label>

              {formMessage && (
                <p className="rounded-2xl bg-[#e8f5ed] px-4 py-3 text-sm font-bold text-[#0b5d3b]">
                  {formMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-[#0b5d3b] px-6 py-4 text-sm font-black text-white shadow-lg hover:bg-[#083f2a]"
              >
                Submit Review
              </button>

              <p className="text-center text-xs leading-5 text-black/40">
                Website reviews are stored in the visitor&apos;s
                browser. Permanent public feedback should be
                submitted using the Google Review button.
              </p>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}