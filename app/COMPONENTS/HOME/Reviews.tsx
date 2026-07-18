"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ReviewSource = "Google" | "Website";

type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  packageName: string;
  location: string;
  verified: boolean;
  source: ReviewSource;
};

/*
  IMPORTANT:

  Neeche apni asli Google Business Review link paste karein.

  Google Business Profile kholo:
  Ask for reviews → Copy review link

  Phir copied link ko neeche quotes ke andar paste karein.
*/
const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=YOUR_GOOGLE_PLACE_ID";

/*
  Sirf verified aur real customer reviews yahan add karein.

  Isi format mein 30 ya us se zyada reviews add kiye ja sakte hain:

  {
    id: 1,
    name: "Customer Name",
    rating: 5,
    comment: "Customer ka original review...",
    date: "18 July 2026",
    packageName: "21 Days Premium Hajj",
    location: "Faisalabad",
    verified: true,
    source: "Google",
  },
*/

const INITIAL_REVIEWS: Review[] = [];

function StarRating({
  rating,
  size = "text-lg",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${size}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-[#fbbc04]" : "text-black/15"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [visibleReviews, setVisibleReviews] = useState(6);
  const [selectedRating, setSelectedRating] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    packageName: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const savedReviews = localStorage.getItem(
      "makki-madni-website-reviews"
    );

    if (!savedReviews) return;

    try {
      const parsedReviews: Review[] = JSON.parse(savedReviews);

      setReviews([...parsedReviews, ...INITIAL_REVIEWS]);
    } catch {
      console.error("Saved reviews could not be loaded.");
    }
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce(
      (total, review) => total + review.rating,
      0
    );

    return Number((totalRating / reviews.length).toFixed(1));
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
    const normalizedSearch = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const ratingMatches =
        selectedRating === "All" ||
        review.rating === Number(selectedRating);

      const searchMatches =
        normalizedSearch === "" ||
        review.name.toLowerCase().includes(normalizedSearch) ||
        review.comment.toLowerCase().includes(normalizedSearch) ||
        review.packageName.toLowerCase().includes(normalizedSearch) ||
        review.location.toLowerCase().includes(normalizedSearch);

      return ratingMatches && searchMatches;
    });
  }, [reviews, selectedRating, search]);

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (formData.comment.trim().length < 20) {
      setMessage("Please write a review of at least 20 characters.");
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      name: formData.name.trim(),
      rating: formData.rating,
      comment: formData.comment.trim(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      packageName:
        formData.packageName.trim() || "Hajj & Umrah Services",
      location: formData.location.trim() || "Pakistan",
      verified: false,
      source: "Website",
    };

    let previouslySavedReviews: Review[] = [];

    const storedReviews = localStorage.getItem(
      "makki-madni-website-reviews"
    );

    if (storedReviews) {
      try {
        previouslySavedReviews = JSON.parse(storedReviews);
      } catch {
        previouslySavedReviews = [];
      }
    }

    const updatedSavedReviews = [
      newReview,
      ...previouslySavedReviews,
    ];

    localStorage.setItem(
      "makki-madni-website-reviews",
      JSON.stringify(updatedSavedReviews)
    );

    setReviews((currentReviews) => [
      newReview,
      ...currentReviews,
    ]);

    setFormData({
      name: "",
      location: "",
      packageName: "",
      rating: 5,
      comment: "",
    });

    setVisibleReviews(6);

    setMessage(
      "Thank you. Your review has been added successfully."
    );

    setTimeout(() => {
      setMessage("");
      setShowForm(false);
    }, 1800);
  }

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#f8f5ef] px-4 py-20 text-[#082017] sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_12%_18%,rgba(212,175,55,.20),transparent_28%),radial-gradient(circle_at_88%_28%,rgba(11,93,59,.13),transparent_30%)]" />

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
            Read genuine experiences shared by pilgrims and families
            who travelled with BR. Makki Madni Hajj & Umrah Services.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-[#d4af37]/20 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5">
                <span className="text-3xl font-black text-[#4285f4]">
                  G
                </span>
              </div>

              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-black/45">
                Customer Rating
              </p>

              <p className="mt-2 text-6xl font-black text-[#082017]">
                {reviews.length > 0 ? averageRating : "—"}
              </p>

              <StarRating
                rating={Math.round(averageRating)}
                size="text-2xl"
              />

              <p className="mt-3 text-sm text-black/50">
                Based on {reviews.length} customer reviews
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {ratingSummary.map((item) => (
                <div
                  key={item.rating}
                  className="grid grid-cols-[38px_1fr_42px] items-center gap-3"
                >
                  <span className="text-sm font-bold">
                    {item.rating} ★
                  </span>

                  <div className="h-2 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-[#fbbc04] transition-all"
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
                className="rounded-full border-2 border-[#d4af37] bg-white px-5 py-3.5 text-center text-sm font-black text-[#8a671b] transition hover:bg-[#fff7df]"
              >
                Write a Google Review
              </a>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="rounded-[2rem] border border-[#d4af37]/20 bg-white p-6 shadow-xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b28a2e]">
              Find Reviews
            </p>

            <h3 className="mt-2 text-3xl font-black">
              Customer Experiences
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
                  setVisibleReviews(6);
                }}
                placeholder="Search customer reviews..."
                className="rounded-full border border-black/10 bg-[#f8f5ef] px-5 py-3.5 text-sm outline-none transition focus:border-[#0b5d3b]"
              />

              <select
                value={selectedRating}
                onChange={(event) => {
                  setSelectedRating(event.target.value);
                  setVisibleReviews(6);
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
                Showing Reviews
              </p>

              <p className="mt-2 text-sm leading-6 text-black/55">
                Showing{" "}
                {Math.min(
                  visibleReviews,
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
              .slice(0, visibleReviews)
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
                        <h3 className="font-black text-[#082017]">
                          {review.name}
                        </h3>

                        <p className="mt-1 text-xs text-black/45">
                          {review.location}
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
                    <StarRating rating={review.rating} />

                    <span className="text-xs text-black/40">
                      {review.date}
                    </span>
                  </div>

                  <p className="mt-5 flex-1 text-sm leading-7 text-black/65">
                    “{review.comment}”
                  </p>

                  <div className="mt-5 border-t border-black/5 pt-4">
                    <p className="text-xs font-bold text-[#0b5d3b]">
                      {review.packageName}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-black/40">
                        {review.source === "Google"
                          ? "Google Review"
                          : "Website Review"}
                      </span>

                      {review.verified && (
                        <span className="rounded-full bg-[#e8f5ed] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#0b5d3b]">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-[#d4af37]/20 bg-white p-10 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f5ef] text-3xl">
              ★
            </div>

            <h3 className="mt-5 text-2xl font-black">
              Customer Reviews
            </h3>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-black/55">
              No reviews are available for this filter yet. Be the
              first customer to share your experience.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-full bg-[#0b5d3b] px-7 py-3.5 text-sm font-black text-white shadow-lg"
            >
              Submit First Review
            </button>
          </div>
        )}

        {visibleReviews < filteredReviews.length && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() =>
                setVisibleReviews(
                  (currentValue) => currentValue + 6
                )
              }
              className="rounded-full bg-[#082017] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#0b5d3b]"
            >
              Load More Reviews
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 rounded-[2rem] bg-[#082017] p-7 text-center text-white shadow-2xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37]">
            Travelled With Us?
          </p>

          <h3 className="mt-3 text-3xl font-black">
            Share Your Hajj Experience
          </h3>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">
            Your feedback helps other families select reliable Hajj
            services and helps us improve our arrangements.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full bg-[#d4af37] px-7 py-3.5 text-sm font-black text-[#082017] transition hover:brightness-105"
            >
              Submit Website Review
            </button>

            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-black text-white transition hover:bg-white hover:text-[#082017]"
            >
              Review Us on Google
            </a>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b28a2e]">
                  Customer Feedback
                </p>

                <h3 className="mt-2 text-3xl font-black text-[#082017]">
                  Share Your Experience
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setMessage("");
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/5 text-xl font-black text-black/60 transition hover:bg-black/10"
                aria-label="Close review form"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleReviewSubmit}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">
                    Your Name *
                  </span>

                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">
                    City
                  </span>

                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        location: event.target.value,
                      })
                    }
                    placeholder="Faisalabad"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
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
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
                >
                  <option value="">Select your package</option>
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
                  <option value="Other Hajj Services">
                    Other Hajj Services
                  </option>
                </select>
              </label>

              <div>
                <p className="text-sm font-bold">
                  Your Rating *
                </p>

                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          rating: star,
                        })
                      }
                      className={`text-4xl transition hover:scale-110 ${
                        star <= formData.rating
                          ? "text-[#fbbc04]"
                          : "text-black/15"
                      }`}
                      aria-label={`${star} star rating`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-bold">
                  Your Review *
                </span>

                <textarea
                  required
                  rows={5}
                  value={formData.comment}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      comment: event.target.value,
                    })
                  }
                  placeholder="Tell us about your Hajj or Umrah experience..."
                  className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-[#f8f5ef] px-4 py-3 outline-none focus:border-[#0b5d3b]"
                />
              </label>

              {message && (
                <p className="rounded-2xl bg-[#e8f5ed] px-4 py-3 text-sm font-bold text-[#0b5d3b]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-[#0b5d3b] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#083f2a]"
              >
                Submit Review
              </button>

              <p className="text-center text-xs leading-5 text-black/40">
                Website reviews are saved in the visitor&apos;s
                browser. For a permanent public review, please use
                the Google Review button.
              </p>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}