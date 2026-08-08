"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  role: string | null;
  account_status: string | null;
};

type BookingStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "confirmed"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "partially_paid"
  | "paid"
  | "refunded";

type VisaStatus =
  | "not_started"
  | "documents_pending"
  | "submitted"
  | "under_process"
  | "approved"
  | "issued"
  | "rejected";

type Booking = {
  id: string;
  booking_type: "hajj" | "umrah" | "flight";
  package_name: string | null;
  travelers: number;
  departure_city: string | null;
  travel_date: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number | string;
  paid_amount: number | string;
  currency: string;
  visa_status: VisaStatus;
  visa_reference: string | null;
  visa_note: string | null;
  visa_updated_at: string | null;
  created_at: string;
};

type DocumentStatus = "pending" | "approved" | "rejected";

type DocumentRecord = {
  id: string;
  user_id: string;
  document_type: "passport" | "cnic" | "photos" | "vaccination";
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  status: DocumentStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentTransaction = {
  id: string;
  booking_id: string;
  user_id: string;
  transaction_type: "payment" | "refund";
  amount: number | string;
  currency: string;
  payment_method:
    | "bank_transfer"
    | "cash"
    | "card"
    | "online"
    | "other";
  receipt_reference: string;
  external_reference: string | null;
  note: string | null;
  status: "posted" | "void";
  paid_at: string;
  created_at: string;
};

type PaymentDraft = {
  transactionType: "payment" | "refund";
  amount: string;
  paymentMethod:
    | "bank_transfer"
    | "cash"
    | "card"
    | "online"
    | "other";
  externalReference: string;
  note: string;
};

const bookingStatuses: BookingStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "confirmed",
  "cancelled",
];

const paymentStatuses: PaymentStatus[] = [
  "pending",
  "partially_paid",
  "paid",
  "refunded",
];

const visaStatuses: VisaStatus[] = [
  "not_started",
  "documents_pending",
  "submitted",
  "under_process",
  "approved",
  "issued",
  "rejected",
];

const paymentMethods: PaymentTransaction["payment_method"][] = [
  "bank_transfer",
  "cash",
  "card",
  "online",
  "other",
];

const emptyPaymentDraft: PaymentDraft = {
  transactionType: "payment",
  amount: "",
  paymentMethod: "bank_transfer",
  externalReference: "",
  note: "",
};

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Not selected";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFileSize(size: number | null) {
  if (!size) return "Unknown size";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function documentStatusClasses(status: DocumentStatus) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewingDocumentId, setReviewingDocumentId] = useState<string | null>(null);
  const [selectedDocumentCustomerId, setSelectedDocumentCustomerId] =
    useState<string | null>(null);
  const [visaDrafts, setVisaDrafts] = useState<
    Record<string, { reference: string; note: string }>
  >({});
  const [paymentTransactions, setPaymentTransactions] =
    useState<PaymentTransaction[]>([]);
  const [paymentDrafts, setPaymentDrafts] = useState<
    Record<string, PaymentDraft>
  >({});
  const [postingPaymentBookingId, setPostingPaymentBookingId] =
    useState<string | null>(null);

  async function loadData() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/");
      return;
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("id, full_name, email, mobile, role, account_status")
      .eq("id", user.id)
      .single();

    if (
      adminError ||
      !adminProfile ||
      adminProfile.role !== "admin" ||
      adminProfile.account_status !== "active"
    ) {
      await supabase.auth.signOut();
      window.location.replace("/");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, mobile, role, account_status");

    if (profileError) {
      throw profileError;
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, booking_type, package_name, travelers, departure_city, travel_date, status, payment_status, total_amount, paid_amount, currency, visa_status, visa_reference, visa_note, visa_updated_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (bookingError) {
      throw bookingError;
    }

    const { data: documentData, error: documentError } = await supabase
      .from("customer_documents")
      .select(
        "id, user_id, document_type, file_name, storage_path, mime_type, file_size, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (documentError) {
      throw documentError;
    }

    const loadedDocuments = (documentData || []) as DocumentRecord[];

    const { data: paymentData, error: paymentError } = await supabase
      .from("payment_transactions")
      .select(
        "id, booking_id, user_id, transaction_type, amount, currency, payment_method, receipt_reference, external_reference, note, status, paid_at, created_at"
      )
      .order("paid_at", { ascending: false });

    if (paymentError) {
      throw paymentError;
    }

    setAdmin(adminProfile);
    setProfiles((profileData || []) as Profile[]);
    const loadedBookings = (bookingData || []) as Booking[];
    setBookings(loadedBookings);
    setVisaDrafts(
      loadedBookings.reduce<
        Record<string, { reference: string; note: string }>
      >((result, booking) => {
        result[booking.id] = {
          reference: booking.visa_reference || "",
          note: booking.visa_note || "",
        };
        return result;
      }, {})
    );
    setDocuments(loadedDocuments);
    setPaymentTransactions(
      (paymentData || []) as PaymentTransaction[]
    );
    setDocumentNotes(
      loadedDocuments.reduce<Record<string, string>>((result, document) => {
        result[document.id] = document.admin_note || "";
        return result;
      }, {})
    );
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await loadData();
      } catch (error) {
        if (mounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Admin dashboard load nahi ho saka."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const customers = profiles.filter(
      (profile) => profile.role === "customer"
    ).length;

    const pendingBookings = bookings.filter(
      (booking) =>
        booking.status === "submitted" ||
        booking.status === "under_review"
    ).length;

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed"
    ).length;

    const pendingPayments = bookings.filter(
      (booking) =>
        booking.payment_status === "pending" ||
        booking.payment_status === "partially_paid"
    ).length;

    const pendingDocuments = documents.filter(
      (document) => document.status === "pending"
    ).length;

    return {
      customers,
      pendingBookings,
      confirmedBookings,
      pendingPayments,
      pendingDocuments,
    };
  }, [profiles, bookings, documents]);

  const documentCustomers = useMemo(() => {
    const userIds = new Set(documents.map((document) => document.user_id));

    return profiles.filter(
      (profile) => profile.role === "customer" && userIds.has(profile.id)
    );
  }, [profiles, documents]);

  const selectedCustomerDocuments = useMemo(() => {
    if (!selectedDocumentCustomerId) return [];

    return documents.filter(
      (document) => document.user_id === selectedDocumentCustomerId
    );
  }, [documents, selectedDocumentCustomerId]);

  const selectedDocumentCustomer = useMemo(() => {
    if (!selectedDocumentCustomerId) return null;

    return profiles.find(
      (profile) => profile.id === selectedDocumentCustomerId
    ) || null;
  }, [profiles, selectedDocumentCustomerId]);

  async function updateBooking(
    bookingId: string,
    updates: Partial<
      Pick<
        Booking,
        | "status"
        | "payment_status"
        | "total_amount"
        | "paid_amount"
        | "currency"
        | "visa_status"
        | "visa_reference"
        | "visa_note"
        | "visa_updated_at"
      >
    >
  ) {
    setUpdatingId(bookingId);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId);

      if (error) {
        throw error;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...updates }
            : booking
        )
      );

      setMessage("Booking successfully update ho gayi.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Update failed: ${error.message}`
          : "Booking update nahi ho saki."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getPaymentDraft(bookingId: string): PaymentDraft {
    return paymentDrafts[bookingId] || emptyPaymentDraft;
  }

  function updatePaymentDraft(
    bookingId: string,
    updates: Partial<PaymentDraft>
  ) {
    setPaymentDrafts((current) => ({
      ...current,
      [bookingId]: {
        ...(current[bookingId] || emptyPaymentDraft),
        ...updates,
      },
    }));
  }

  async function addPaymentTransaction(booking: Booking) {
    const draft = getPaymentDraft(booking.id);
    const amount = Number(draft.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Payment amount 0 se zyada hona chahiye.");
      return;
    }

    setPostingPaymentBookingId(booking.id);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("payment_transactions")
        .insert({
          booking_id: booking.id,
          transaction_type: draft.transactionType,
          amount,
          payment_method: draft.paymentMethod,
          external_reference:
            draft.externalReference.trim() || null,
          note: draft.note.trim() || null,
          status: "posted",
          paid_at: new Date().toISOString(),
        })
        .select(
          "id, booking_id, user_id, transaction_type, amount, currency, payment_method, receipt_reference, external_reference, note, status, paid_at, created_at"
        )
        .single();

      if (error) {
        throw error;
      }

      setPaymentTransactions((current) => [
        data as PaymentTransaction,
        ...current,
      ]);

      setPaymentDrafts((current) => ({
        ...current,
        [booking.id]: { ...emptyPaymentDraft },
      }));

      const { data: refreshedBooking, error: bookingError } =
        await supabase
          .from("bookings")
          .select(
            "paid_amount, payment_status, total_amount, currency"
          )
          .eq("id", booking.id)
          .single();

      if (bookingError) {
        throw bookingError;
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                paid_amount: refreshedBooking.paid_amount,
                payment_status:
                  refreshedBooking.payment_status as PaymentStatus,
                total_amount: refreshedBooking.total_amount,
                currency: refreshedBooking.currency,
              }
            : item
        )
      );

      setMessage(
        `${draft.transactionType === "refund" ? "Refund" : "Payment"} posted successfully. Receipt: ${
          (data as PaymentTransaction).receipt_reference
        }`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Payment failed: ${error.message}`
          : "Payment transaction save nahi ho saki."
      );
    } finally {
      setPostingPaymentBookingId(null);
    }
  }

  async function saveVisaDetails(booking: Booking) {
    const draft = visaDrafts[booking.id] || {
      reference: booking.visa_reference || "",
      note: booking.visa_note || "",
    };

    await updateBooking(booking.id, {
      visa_reference: draft.reference.trim() || null,
      visa_note: draft.note.trim() || null,
      visa_updated_at: new Date().toISOString(),
    });
  }

  function editBookingField(
    bookingId: string,
    field: "total_amount" | "paid_amount" | "currency",
    value: string
  ) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              [field]: field === "currency" ? value.toUpperCase() : value,
            }
          : booking
      )
    );
  }

  async function saveQuotation(booking: Booking) {
    const totalAmount = Number(booking.total_amount || 0);
    const paidAmount = Number(booking.paid_amount || 0);
    const currency = String(booking.currency || "PKR").trim().toUpperCase();

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      setMessage("Total amount valid number hona chahiye.");
      return;
    }

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      setMessage("Paid amount valid number hona chahiye.");
      return;
    }

    if (paidAmount > totalAmount && totalAmount > 0) {
      setMessage("Paid amount total amount se zyada nahi ho sakta.");
      return;
    }

    if (!currency) {
      setMessage("Currency enter karein, jaise PKR ya USD.");
      return;
    }

    await updateBooking(booking.id, {
      total_amount: totalAmount,
      paid_amount: paidAmount,
      currency,
    });
  }

  function getCustomer(userId: string) {
    return profiles.find((profile) => profile.id === userId);
  }

  async function viewDocument(document: DocumentRecord) {
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(document.storage_path, 120);

      if (error) {
        throw error;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Document open failed: ${error.message}`
          : "Document open nahi ho saka."
      );
    }
  }

  async function reviewDocument(
    document: DocumentRecord,
    status: DocumentStatus
  ) {
    if (!admin?.id) return;

    setReviewingDocumentId(document.id);
    setMessage("");

    try {
      const supabase = createClient();
      const note = (documentNotes[document.id] || "").trim();

      const updates = {
        status,
        admin_note: note || null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("customer_documents")
        .update(updates)
        .eq("id", document.id);

      if (error) {
        throw error;
      }

      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? {
                ...item,
                ...updates,
              }
            : item
        )
      );

      setMessage(
        status === "approved"
          ? "Document approve ho gaya."
          : status === "rejected"
            ? "Document reject ho gaya. Customer ko note show hoga."
            : "Document status update ho gaya."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Document review failed: ${error.message}`
          : "Document review update nahi ho saka."
      );
    } finally {
      setReviewingDocumentId(null);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfcfaa] border-t-[#153e38]" />
          <p className="mt-5 text-sm font-bold text-[#153e38]/55">
            Admin control centre loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17302d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(197,163,94,0.12),transparent_28%),radial-gradient(circle_at_100%_0%,rgba(32,101,92,0.11),transparent_26%)]" />

      <header className="relative border-b border-[#17302d]/10 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-[#17302d]/10 bg-white shadow-md">
              <Image
                src="/images/logo.jpeg"
                alt="BR Makki Madni Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="font-black">BR Makki Madni</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#98733b]">
                Admin Control Centre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black">
                {admin?.full_name || "Administrator"}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#17302d]/40">
                Super Admin
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#17302d]/10 bg-white px-4 py-3 text-xs font-black shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.4rem] bg-[#123a35] p-7 text-white shadow-[0_28px_85px_rgba(19,57,52,0.22)] sm:p-10">
          <Image
            src="/images/makkah.jpeg"
            alt="Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#123a35] via-[#123a35]/94 to-[#123a35]/55" />

          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ead69d]">
              Company Operations
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Manage every customer journey from one command centre.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Review customer requests, approve bookings, monitor payments and
              control Makki Madni portal operations.
            </p>
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl border border-[#c9a96b]/30 bg-[#fffaf0] px-5 py-4 text-sm font-bold text-[#765728]">
            {message}
          </div>
        )}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            [stats.customers, "Customers", "Registered customer accounts"],
            [
              stats.pendingBookings,
              "Pending Bookings",
              "Needs review or approval",
            ],
            [
              stats.confirmedBookings,
              "Confirmed",
              "Successfully confirmed journeys",
            ],
            [
              stats.pendingPayments,
              "Pending Payments",
              "Payment action still required",
            ],
            [
              stats.pendingDocuments,
              "Pending Documents",
              "Needs verification",
            ],
          ].map(([value, title, note]) => (
            <article
              key={String(title)}
              className="rounded-[1.8rem] border border-[#17302d]/10 bg-white p-6 shadow-[0_15px_45px_rgba(26,50,45,0.06)]"
            >
              <p className="text-3xl font-black text-[#153e38]">{value}</p>
              <p className="mt-2 text-sm font-black">{title}</p>
              <p className="mt-3 text-xs text-[#17302d]/40">{note}</p>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98733b]">
                Booking Operations
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">
                Customer booking requests
              </h2>
            </div>

            <p className="text-xs text-[#17302d]/40">
              {bookings.length} total booking request
              {bookings.length === 1 ? "" : "s"}
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-dashed border-[#17302d]/15 bg-[#fbfaf7] py-12 text-center">
              <p className="font-black">No booking requests yet</p>
              <p className="mt-2 text-xs text-[#17302d]/40">
                Customer bookings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.7rem] border border-[#17302d]/10 bg-[#fbfaf7] p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">
                          {booking.package_name ||
                            `${label(booking.booking_type)} Booking`}
                        </h3>

                        <span className="rounded-full bg-[#f0e8d7] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#87662e]">
                          {label(booking.booking_type)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#17302d]/45">
                        Ref: {booking.id.slice(0, 8).toUpperCase()} •{" "}
                        {booking.travelers} traveler
                        {booking.travelers === 1 ? "" : "s"} •{" "}
                        {booking.departure_city || "Departure pending"}
                      </p>

                      <p className="mt-1 text-xs text-[#17302d]/35">
                        Travel {formatDate(booking.travel_date)} • Submitted{" "}
                        {formatCreatedAt(booking.created_at)}
                      </p>
                    </div>

                    <div className="w-full max-w-2xl space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                          Booking Status
                          <select
                            value={booking.status}
                            disabled={updatingId === booking.id}
                            onChange={(event) =>
                              updateBooking(booking.id, {
                                status: event.target.value as BookingStatus,
                              })
                            }
                            className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                          >
                            {bookingStatuses.map((status) => (
                              <option key={status} value={status}>
                                {label(status)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                          Payment Status
                          <select
                            value={booking.payment_status}
                            disabled={updatingId === booking.id}
                            onChange={(event) =>
                              updateBooking(booking.id, {
                                payment_status: event.target.value as PaymentStatus,
                              })
                            }
                            className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                          >
                            {paymentStatuses.map((status) => (
                              <option key={status} value={status}>
                                {label(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="rounded-2xl border border-[#c9a96b]/25 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#98733b]">
                          Customer Quotation
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_110px]">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Total Amount
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={booking.total_amount ?? ""}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                editBookingField(booking.id, "total_amount", event.target.value)
                              }
                              placeholder="0"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-sm font-black text-[#17302d] outline-none"
                            />
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Paid Amount
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={booking.paid_amount ?? ""}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                editBookingField(booking.id, "paid_amount", event.target.value)
                              }
                              placeholder="0"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-sm font-black text-[#17302d] outline-none"
                            />
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Currency
                            <input
                              type="text"
                              maxLength={6}
                              value={booking.currency || "PKR"}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                editBookingField(booking.id, "currency", event.target.value)
                              }
                              placeholder="PKR"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-sm font-black uppercase text-[#17302d] outline-none"
                            />
                          </label>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-[#17302d]/45">
                            Customer dashboard par yahi quotation amount show hoga.
                          </p>

                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => saveQuotation(booking)}
                            className="rounded-xl bg-[#153e38] px-5 py-3 text-xs font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === booking.id ? "Saving..." : "Save Quotation"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#7ba99f]/25 bg-white p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#477b72]">
                              Visa Management
                            </p>
                            <p className="mt-1 text-xs text-[#17302d]/45">
                              Customer ko isi booking ka live visa status show hoga.
                            </p>
                          </div>

                          {booking.visa_updated_at && (
                            <p className="text-[10px] text-[#17302d]/35">
                              Updated {formatCreatedAt(booking.visa_updated_at)}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Visa Status
                            <select
                              value={booking.visa_status || "not_started"}
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                updateBooking(booking.id, {
                                  visa_status: event.target.value as VisaStatus,
                                  visa_updated_at: new Date().toISOString(),
                                })
                              }
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                            >
                              {visaStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {label(status)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Visa Reference
                            <input
                              type="text"
                              value={
                                visaDrafts[booking.id]?.reference ??
                                booking.visa_reference ??
                                ""
                              }
                              disabled={updatingId === booking.id}
                              onChange={(event) =>
                                setVisaDrafts((current) => ({
                                  ...current,
                                  [booking.id]: {
                                    reference: event.target.value,
                                    note:
                                      current[booking.id]?.note ??
                                      booking.visa_note ??
                                      "",
                                  },
                                }))
                              }
                              placeholder="e.g. KSA-VISA-12345"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-xs font-bold text-[#17302d] outline-none"
                            />
                          </label>
                        </div>

                        <label className="mt-3 block text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                          Visa Note
                          <textarea
                            rows={3}
                            value={
                              visaDrafts[booking.id]?.note ??
                              booking.visa_note ??
                              ""
                            }
                            disabled={updatingId === booking.id}
                            onChange={(event) =>
                              setVisaDrafts((current) => ({
                                ...current,
                                [booking.id]: {
                                  reference:
                                    current[booking.id]?.reference ??
                                    booking.visa_reference ??
                                    "",
                                  note: event.target.value,
                                },
                              }))
                            }
                            placeholder="Optional update for customer..."
                            className="mt-2 block w-full resize-none rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-xs font-medium normal-case tracking-normal text-[#17302d] outline-none"
                          />
                        </label>

                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => saveVisaDetails(booking)}
                            className="rounded-xl bg-[#477b72] px-5 py-3 text-xs font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === booking.id
                              ? "Saving..."
                              : "Save Visa Details"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#b9954d]/25 bg-[#fffdf7] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a692f]">
                              Payments & Receipts
                            </p>
                            <p className="mt-1 text-xs text-[#17302d]/45">
                              Payment post karte hi booking balance automatically update hoga.
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#17302d]/35">
                              Balance
                            </p>
                            <p className="mt-1 text-sm font-black text-[#153e38]">
                              {booking.currency || "PKR"}{" "}
                              {Math.max(
                                0,
                                Number(booking.total_amount || 0) -
                                  Number(booking.paid_amount || 0)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Type
                            <select
                              value={getPaymentDraft(booking.id).transactionType}
                              disabled={postingPaymentBookingId === booking.id}
                              onChange={(event) =>
                                updatePaymentDraft(booking.id, {
                                  transactionType: event.target.value as
                                    | "payment"
                                    | "refund",
                                })
                              }
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                            >
                              <option value="payment">Payment</option>
                              <option value="refund">Refund</option>
                            </select>
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Amount
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={getPaymentDraft(booking.id).amount}
                              disabled={postingPaymentBookingId === booking.id}
                              onChange={(event) =>
                                updatePaymentDraft(booking.id, {
                                  amount: event.target.value,
                                })
                              }
                              placeholder="0"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                            />
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Method
                            <select
                              value={getPaymentDraft(booking.id).paymentMethod}
                              disabled={postingPaymentBookingId === booking.id}
                              onChange={(event) =>
                                updatePaymentDraft(booking.id, {
                                  paymentMethod:
                                    event.target.value as PaymentTransaction["payment_method"],
                                })
                              }
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-black text-[#17302d] outline-none"
                            >
                              {paymentMethods.map((method) => (
                                <option key={method} value={method}>
                                  {label(method)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                            Bank / Txn Ref
                            <input
                              type="text"
                              value={
                                getPaymentDraft(booking.id).externalReference
                              }
                              disabled={postingPaymentBookingId === booking.id}
                              onChange={(event) =>
                                updatePaymentDraft(booking.id, {
                                  externalReference: event.target.value,
                                })
                              }
                              placeholder="Optional"
                              className="mt-2 block w-full rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-bold text-[#17302d] outline-none"
                            />
                          </label>
                        </div>

                        <label className="mt-3 block text-[10px] font-black uppercase tracking-wider text-[#17302d]/45">
                          Payment Note
                          <textarea
                            rows={2}
                            value={getPaymentDraft(booking.id).note}
                            disabled={postingPaymentBookingId === booking.id}
                            onChange={(event) =>
                              updatePaymentDraft(booking.id, {
                                note: event.target.value,
                              })
                            }
                            placeholder="Optional internal/customer payment note..."
                            className="mt-2 block w-full resize-none rounded-xl border border-[#17302d]/10 bg-white px-3 py-3 text-xs font-medium normal-case tracking-normal text-[#17302d] outline-none"
                          />
                        </label>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-[#17302d]/45">
                            Currency: <strong>{booking.currency || "PKR"}</strong>
                          </p>

                          <button
                            type="button"
                            disabled={postingPaymentBookingId === booking.id}
                            onClick={() => addPaymentTransaction(booking)}
                            className="rounded-xl bg-[#8a692f] px-5 py-3 text-xs font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {postingPaymentBookingId === booking.id
                              ? "Posting..."
                              : "Post Payment / Refund"}
                          </button>
                        </div>

                        {paymentTransactions.filter(
                          (transaction) =>
                            transaction.booking_id === booking.id
                        ).length > 0 && (
                          <div className="mt-5 border-t border-[#17302d]/10 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a692f]">
                              Recent Receipts
                            </p>

                            <div className="mt-3 space-y-2">
                              {paymentTransactions
                                .filter(
                                  (transaction) =>
                                    transaction.booking_id === booking.id
                                )
                                .slice(0, 5)
                                .map((transaction) => (
                                  <div
                                    key={transaction.id}
                                    className="flex flex-col gap-2 rounded-xl border border-[#17302d]/8 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div>
                                      <p className="text-xs font-black">
                                        {transaction.receipt_reference}
                                      </p>
                                      <p className="mt-1 text-[10px] text-[#17302d]/40">
                                        {label(transaction.transaction_type)} •{" "}
                                        {label(transaction.payment_method)} •{" "}
                                        {formatCreatedAt(transaction.paid_at)}
                                      </p>
                                    </div>

                                    <p
                                      className={`text-sm font-black ${
                                        transaction.transaction_type === "refund"
                                          ? "text-red-600"
                                          : "text-emerald-700"
                                      }`}
                                    >
                                      {transaction.transaction_type === "refund"
                                        ? "-"
                                        : "+"}
                                      {transaction.currency}{" "}
                                      {Number(
                                        transaction.amount || 0
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98733b]">
                Document Verification
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">
                Customer document folders
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#17302d]/45">
                Har customer ka separate folder hai. Customer ka box open karne
                par sirf usi ke documents show honge.
              </p>
            </div>

            <p className="text-xs text-[#17302d]/40">
              {documents.filter((document) => document.status === "pending").length} pending review
            </p>
          </div>

          {documentCustomers.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-dashed border-[#17302d]/15 bg-[#fbfaf7] py-12 text-center">
              <p className="font-black">No customer documents yet</p>
              <p className="mt-2 text-xs text-[#17302d]/40">
                Jis customer ne document upload kiya hoga, uska box yahan aa jayega.
              </p>
            </div>
          ) : (
            <>
              {!selectedDocumentCustomerId && (
                <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {documentCustomers.map((customer) => {
                    const customerDocuments = documents.filter(
                      (document) => document.user_id === customer.id
                    );

                    const pending = customerDocuments.filter(
                      (document) => document.status === "pending"
                    ).length;

                    const approved = customerDocuments.filter(
                      (document) => document.status === "approved"
                    ).length;

                    const rejected = customerDocuments.filter(
                      (document) => document.status === "rejected"
                    ).length;

                    return (
                      <article
                        key={customer.id}
                        className="rounded-[1.7rem] border border-[#17302d]/10 bg-[#fbfaf7] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-black">
                              {customer.full_name || "Customer"}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#17302d]/45">
                              {customer.email || "Email unavailable"}
                            </p>
                            <p className="mt-1 text-xs text-[#17302d]/35">
                              {customer.mobile || "No mobile"}
                            </p>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#153e38] text-sm font-black text-[#ead69d]">
                            {customerDocuments.length}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
                            <p className="text-lg font-black text-amber-700">
                              {pending}
                            </p>
                            <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-amber-700/65">
                              Pending
                            </p>
                          </div>

                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                            <p className="text-lg font-black text-emerald-700">
                              {approved}
                            </p>
                            <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-emerald-700/65">
                              Approved
                            </p>
                          </div>

                          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
                            <p className="text-lg font-black text-red-700">
                              {rejected}
                            </p>
                            <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-red-700/65">
                              Rejected
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDocumentCustomerId(customer.id)
                          }
                          className="mt-5 w-full rounded-xl bg-[#153e38] px-4 py-3.5 text-xs font-black text-white shadow-sm"
                        >
                          Open Documents
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}

              {selectedDocumentCustomerId && (
                <div className="mt-7">
                  <div className="flex flex-col gap-4 rounded-[1.7rem] border border-[#c9a96b]/25 bg-[#fffaf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#98733b]">
                        Open Customer Folder
                      </p>
                      <h3 className="mt-2 text-xl font-black">
                        {selectedDocumentCustomer?.full_name || "Customer"}
                      </h3>
                      <p className="mt-1 text-xs text-[#17302d]/45">
                        {selectedDocumentCustomer?.email || "Email unavailable"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDocumentCustomerId(null)}
                      className="rounded-xl border border-[#17302d]/10 bg-white px-4 py-3 text-xs font-black shadow-sm"
                    >
                      ← Back to Customers
                    </button>
                  </div>

                  {selectedCustomerDocuments.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-[#17302d]/15 bg-[#fbfaf7] py-10 text-center">
                      <p className="text-sm font-black">
                        Is customer ke documents available nahi hain.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {selectedCustomerDocuments.map((document) => {
                        const isReviewing =
                          reviewingDocumentId === document.id;

                        return (
                          <article
                            key={document.id}
                            className="rounded-[1.7rem] border border-[#17302d]/10 bg-[#fbfaf7] p-5 sm:p-6"
                          >
                            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-black">
                                    {label(document.document_type)}
                                  </h3>

                                  <span
                                    className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${documentStatusClasses(
                                      document.status
                                    )}`}
                                  >
                                    {label(document.status)}
                                  </span>
                                </div>

                                <div className="mt-4 rounded-2xl border border-[#17302d]/8 bg-white p-4">
                                  <p className="truncate text-sm font-black">
                                    {document.file_name}
                                  </p>
                                  <p className="mt-2 text-[10px] text-[#17302d]/40">
                                    {formatFileSize(document.file_size)} • Uploaded{" "}
                                    {formatCreatedAt(document.created_at)}
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() => viewDocument(document)}
                                    className="mt-4 rounded-xl bg-[#153e38] px-4 py-3 text-xs font-black text-white shadow-sm"
                                  >
                                    Open Document
                                  </button>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#c9a96b]/25 bg-white p-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#98733b]">
                                  Admin Note
                                  <textarea
                                    rows={4}
                                    value={documentNotes[document.id] || ""}
                                    disabled={isReviewing}
                                    onChange={(event) =>
                                      setDocumentNotes((current) => ({
                                        ...current,
                                        [document.id]: event.target.value,
                                      }))
                                    }
                                    placeholder="Optional note. Rejection ki wajah yahan likhein..."
                                    className="mt-2 block w-full resize-none rounded-xl border border-[#17302d]/10 bg-[#fbfaf7] px-3 py-3 text-xs font-medium normal-case tracking-normal text-[#17302d] outline-none"
                                  />
                                </label>

                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                  <button
                                    type="button"
                                    disabled={isReviewing}
                                    onClick={() =>
                                      reviewDocument(document, "approved")
                                    }
                                    className="rounded-xl bg-emerald-700 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isReviewing ? "Saving..." : "Approve"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isReviewing}
                                    onClick={() =>
                                      reviewDocument(document, "rejected")
                                    }
                                    className="rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isReviewing ? "Saving..." : "Reject"}
                                  </button>
                                </div>

                                {document.reviewed_at && (
                                  <p className="mt-3 text-[10px] text-[#17302d]/35">
                                    Last reviewed{" "}
                                    {formatCreatedAt(document.reviewed_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#17302d]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98733b]">
              Customer Directory
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">
              Registered portal users
            </h2>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="rounded-2xl border border-[#17302d]/8 bg-[#fbfaf7] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">
                      {profile.full_name || "Unnamed User"}
                    </p>
                    <p className="mt-1 text-xs text-[#17302d]/45">
                      {profile.email || "No email"}
                    </p>
                    <p className="mt-1 text-xs text-[#17302d]/35">
                      {profile.mobile || "No mobile"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full bg-[#f0e8d7] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#87662e]">
                      {profile.role || "unknown"}
                    </span>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      {profile.account_status || "unknown"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}