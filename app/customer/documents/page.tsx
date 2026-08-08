"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type DocumentType = "passport" | "cnic" | "photos" | "vaccination";
type DocumentStatus = "pending" | "approved" | "rejected";

type Profile = {
  full_name: string | null;
  role: string | null;
  account_status: string | null;
};

type DocumentRecord = {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  status: DocumentStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  type: "success" | "error" | "info";
  text: string;
};

const documentTypes: {
  id: DocumentType;
  title: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    id: "passport",
    title: "Passport Copy",
    subtitle: "Upload a clear passport bio-data page.",
    icon: "▤",
  },
  {
    id: "cnic",
    title: "CNIC Copy",
    subtitle: "Upload front/back CNIC copy or a combined PDF.",
    icon: "◫",
  },
  {
    id: "photos",
    title: "Passport Photos",
    subtitle: "Upload recent white-background passport photos.",
    icon: "◎",
  },
  {
    id: "vaccination",
    title: "Vaccination Certificate",
    subtitle: "Upload your latest vaccination certificate.",
    icon: "✓",
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function safeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function formatFileSize(size?: number | null) {
  if (!size) return "Unknown size";

  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Recently uploaded";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClasses(status: DocumentStatus) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function statusLabel(status: DocumentStatus) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending Review";
}

export default function DocumentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] =
    useState<DocumentType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  async function loadDocuments(activeUserId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("customer_documents")
      .select(
        "id, user_id, document_type, file_name, storage_path, mime_type, file_size, status, admin_note, created_at, updated_at"
      )
      .eq("user_id", activeUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    setDocuments((data || []) as DocumentRecord[]);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/");
          return;
        }

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("full_name, role, account_status")
            .eq("id", user.id)
            .single();

        if (
          profileError ||
          !profileData ||
          profileData.role !== "customer" ||
          profileData.account_status !== "active"
        ) {
          await supabase.auth.signOut();
          window.location.replace("/");
          return;
        }

        if (!mounted) return;

        setProfile(profileData);
        setUserId(user.id);

        await loadDocuments(user.id);
      } catch (error) {
        if (mounted) {
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Documents load nahi ho sake.",
          });
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

  const documentsByType = useMemo(() => {
    return documentTypes.reduce(
      (result, document) => {
        result[document.id] = documents.filter(
          (item) => item.document_type === document.id
        );

        return result;
      },
      {} as Record<DocumentType, DocumentRecord[]>
    );
  }, [documents]);

  const uploadedCount = useMemo(() => {
    return documentTypes.filter(
      (document) => documentsByType[document.id].length > 0
    ).length;
  }, [documentsByType]);

  const approvedCount = useMemo(() => {
    return documentTypes.filter((document) =>
      documentsByType[document.id].some(
        (item) => item.status === "approved"
      )
    ).length;
  }, [documentsByType]);

  async function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>,
    documentType: DocumentType
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !userId) return;

    setMessage(null);

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Sirf PDF, JPG ya PNG file upload karein.",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({
        type: "error",
        text: "File 10 MB se chhoti honi chahiye.",
      });
      return;
    }

    setUploadingType(documentType);

    const supabase = createClient();
    let uploadedPath = "";

    try {
      const cleanName =
        safeFileName(file.name) || `document-${Date.now()}`;

      uploadedPath =
        `${userId}/${documentType}/${Date.now()}-${cleanName}`;

      const { error: storageError } = await supabase.storage
        .from("customer-documents")
        .upload(uploadedPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (storageError) {
        throw storageError;
      }

      const { error: recordError } = await supabase
        .from("customer_documents")
        .insert({
          user_id: userId,
          document_type: documentType,
          file_name: file.name,
          storage_path: uploadedPath,
          mime_type: file.type,
          file_size: file.size,
        });

      if (recordError) {
        await supabase.storage
          .from("customer-documents")
          .remove([uploadedPath]);

        throw recordError;
      }

      await loadDocuments(userId);

      setMessage({
        type: "success",
        text: "Document upload ho gaya aur Admin review ke liye submit kar diya gaya.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Upload failed: ${error.message}`
            : "Document upload nahi ho saka.",
      });
    } finally {
      setUploadingType(null);
    }
  }

  async function handleView(document: DocumentRecord) {
    setMessage(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(document.storage_path, 60);

      if (error) {
        throw error;
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Document open nahi ho saka.",
      });
    }
  }

  async function handleDelete(document: DocumentRecord) {
    if (document.status === "approved") {
      setMessage({
        type: "info",
        text: "Approved document delete nahi kiya ja sakta. Company support se contact karein.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete "${document.file_name}"?`
    );

    if (!confirmed) return;

    setDeletingId(document.id);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error: recordError } = await supabase
        .from("customer_documents")
        .delete()
        .eq("id", document.id);

      if (recordError) {
        throw recordError;
      }

      const { error: storageError } = await supabase.storage
        .from("customer-documents")
        .remove([document.storage_path]);

      if (storageError) {
        console.error(
          "Document database record deleted but storage cleanup failed:",
          storageError.message
        );
      }

      await loadDocuments(userId);

      setMessage({
        type: "success",
        text: "Document delete ho gaya.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Document delete nahi ho saka.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfcfaa] border-t-[#153e38]" />
          <p className="mt-5 text-sm font-bold text-[#153e38]/55">
            Secure document centre loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f0] text-[#16332f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(198,162,91,0.13),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(31,104,95,0.10),transparent_28%)]" />

      <header className="relative border-b border-[#16332f]/10 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              window.location.assign("/customer/dashboard")
            }
            className="flex items-center gap-3 text-left"
          >
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-[#16332f]/10 bg-white shadow-md">
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
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#98733b]">
                Secure Document Centre
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              window.location.assign("/customer/dashboard")
            }
            className="rounded-xl border border-[#16332f]/10 bg-white px-4 py-3 text-xs font-black shadow-sm"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.3rem] bg-[#123a35] p-7 text-white shadow-[0_25px_80px_rgba(19,57,52,0.22)] sm:p-9">
          <Image
            src="/images/makkah.jpeg"
            alt="Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#123a35] via-[#123a35]/94 to-[#123a35]/60" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ead69d]">
                Private & Protected
              </p>

              <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                Your travel documents, securely managed.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Assalam-o-Alaikum,{" "}
                {profile?.full_name || "Customer"}. Upload your
                required documents here. Every upload is sent to
                Makki Madni administration for verification.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ead69d]">
                    Uploaded
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {uploadedCount} / {documentTypes.length}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ead69d]">
                    Approved
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {approvedCount} / {documentTypes.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d9b86d] transition-all"
                  style={{
                    width: `${
                      (approvedCount / documentTypes.length) * 100
                    }%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-white/50">
                {approvedCount === documentTypes.length
                  ? "All required document categories are approved."
                  : `${
                      documentTypes.length - approvedCount
                    } categories still need approval.`}
              </p>
            </div>
          </div>
        </section>

        {message && (
          <div
            className={`mt-6 rounded-2xl border px-5 py-4 text-sm leading-6 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          {documentTypes.map((documentType) => {
            const typeDocuments =
              documentsByType[documentType.id] || [];

            return (
              <article
                key={documentType.id}
                className="rounded-[2rem] border border-[#16332f]/10 bg-white p-5 shadow-[0_18px_55px_rgba(25,52,47,0.06)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f2ead9] text-lg font-black text-[#8a692f]">
                      {documentType.icon}
                    </div>

                    <div>
                      <h2 className="text-lg font-black">
                        {documentType.title}
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-[#16332f]/45">
                        {documentType.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#f6f0e4] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#88672e]">
                    {typeDocuments.length} file
                    {typeDocuments.length === 1 ? "" : "s"}
                  </span>
                </div>

                <label
                  className={`mt-5 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#bca46d]/55 bg-[#fbf8f1] px-4 py-4 text-xs font-black text-[#76592c] transition hover:bg-[#f7efdd] ${
                    uploadingType === documentType.id
                      ? "pointer-events-none opacity-55"
                      : ""
                  }`}
                >
                  {uploadingType === documentType.id
                    ? "Uploading..."
                    : "+ Upload New Document"}

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="hidden"
                    disabled={uploadingType === documentType.id}
                    onChange={(event) =>
                      handleFileUpload(event, documentType.id)
                    }
                  />
                </label>

                <p className="mt-2 text-[10px] text-[#16332f]/35">
                  PDF, JPG or PNG • Maximum 10 MB
                </p>

                <div className="mt-5 space-y-3">
                  {typeDocuments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#16332f]/10 bg-[#fbfaf7] px-4 py-7 text-center">
                      <p className="text-xs font-bold text-[#16332f]/35">
                        No document uploaded yet.
                      </p>
                    </div>
                  ) : (
                    typeDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-2xl border border-[#16332f]/10 bg-[#fbfaf7] p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="max-w-[280px] truncate text-sm font-black">
                                {document.file_name}
                              </p>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${statusClasses(
                                  document.status
                                )}`}
                              >
                                {statusLabel(document.status)}
                              </span>
                            </div>

                            <p className="mt-2 text-[10px] text-[#16332f]/40">
                              {formatFileSize(document.file_size)} •{" "}
                              {formatDate(document.created_at)}
                            </p>

                            {document.admin_note && (
                              <div className="mt-3 rounded-xl border border-[#c9a96b]/20 bg-[#fffaf0] px-3 py-2.5">
                                <p className="text-[9px] font-black uppercase tracking-wider text-[#98733b]">
                                  Admin Note
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#684f28]">
                                  {document.admin_note}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(document)}
                              className="rounded-xl border border-[#16332f]/10 bg-white px-3 py-2 text-[10px] font-black shadow-sm"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              disabled={
                                document.status === "approved" ||
                                deletingId === document.id
                              }
                              onClick={() => handleDelete(document)}
                              className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {deletingId === document.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>

                        {document.status === "rejected" && (
                          <p className="mt-3 text-[10px] font-bold text-red-600">
                            Please upload a corrected document for review.
                          </p>
                        )}

                        {document.status === "approved" && (
                          <p className="mt-3 text-[10px] font-bold text-emerald-700">
                            Verified by Makki Madni administration.
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#d6bd85]/35 bg-[#f6ead0] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#846126]">
            Verification Process
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold">
            Upload → Review → Approval
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[#5d4826]/65">
            New files are marked Pending Review. Makki Madni staff can
            approve the document or reject it with a note. Rejected
            files can be replaced by uploading a corrected version.
            Approved files remain protected from customer deletion.
          </p>
        </section>
      </div>
    </main>
  );
}