"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../LIB/SUPABASE/client";

type DocumentType =
  | "passport"
  | "cnic"
  | "photos"
  | "vaccination";

type Profile = {
  full_name: string | null;
  role: string | null;
  account_status: string | null;
};

type StoredFile = {
  id: string | null;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  metadata: {
    size?: number;
    mimetype?: string;
  } | null;
  documentType: DocumentType;
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

function formatFileSize(size?: number) {
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

export default function DocumentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] =
    useState<DocumentType | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  async function loadDocuments(activeUserId: string) {
    const supabase = createClient();
    const loadedFiles: StoredFile[] = [];

    for (const document of documentTypes) {
      const { data, error } = await supabase.storage
        .from("customer-documents")
        .list(`${activeUserId}/${document.id}`, {
          limit: 100,
          sortBy: {
            column: "created_at",
            order: "desc",
          },
        });

      if (error) {
        throw error;
      }

      for (const file of data || []) {
        if (!file.name || file.name === ".emptyFolderPlaceholder") {
          continue;
        }

        loadedFiles.push({
          id: file.id ?? null,
          name: file.name,
          created_at: file.created_at ?? null,
          updated_at: file.updated_at ?? null,
          metadata:
            (file.metadata as StoredFile["metadata"]) ?? null,
          documentType: document.id,
        });
      }
    }

    setFiles(loadedFiles);
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

  const filesByType = useMemo(() => {
    return documentTypes.reduce(
      (result, document) => {
        result[document.id] = files.filter(
          (file) => file.documentType === document.id
        );

        return result;
      },
      {} as Record<DocumentType, StoredFile[]>
    );
  }, [files]);

  const readyCount = useMemo(() => {
    return documentTypes.filter(
      (document) => filesByType[document.id].length > 0
    ).length;
  }, [filesByType]);

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

    try {
      const supabase = createClient();

      const cleanName =
        safeFileName(file.name) || `document-${Date.now()}`;

      const path = `${userId}/${documentType}/${Date.now()}-${cleanName}`;

      const { error } = await supabase.storage
        .from("customer-documents")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      await loadDocuments(userId);

      setMessage({
        type: "success",
        text: "Document securely upload ho gaya.",
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

  async function handleView(file: StoredFile) {
    if (!userId) return;

    setMessage(null);

    try {
      const supabase = createClient();

      const path = `${userId}/${file.documentType}/${file.name}`;

      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(path, 60);

      if (error) {
        throw error;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
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

  async function handleDelete(file: StoredFile) {
    if (!userId) return;

    const confirmed = window.confirm(
      `Delete "${file.name}"?`
    );

    if (!confirmed) return;

    setMessage(null);

    try {
      const supabase = createClient();

      const path = `${userId}/${file.documentType}/${file.name}`;

      const { error } = await supabase.storage
        .from("customer-documents")
        .remove([path]);

      if (error) {
        throw error;
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
                {profile?.full_name || "Customer"}. Upload the
                documents required for your Hajj, Umrah or travel
                process. Your files are stored in your private
                customer folder.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ead69d]">
                    Document Readiness
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {readyCount} / {documentTypes.length}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl">
                  ▤
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d9b86d] transition-all"
                  style={{
                    width: `${
                      (readyCount / documentTypes.length) * 100
                    }%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-white/50">
                {readyCount === documentTypes.length
                  ? "All required document categories are ready."
                  : `${
                      documentTypes.length - readyCount
                    } document categories still need files.`}
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
          {documentTypes.map((document) => {
            const documentFiles = filesByType[document.id];
            const hasFile = documentFiles.length > 0;
            const uploading = uploadingType === document.id;

            return (
              <article
                key={document.id}
                className="rounded-[2rem] border border-[#16332f]/10 bg-white p-5 shadow-[0_18px_55px_rgba(26,50,45,0.06)] sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#153e38] text-lg text-[#ead69d]">
                      {document.icon}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black">
                          {document.title}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                            hasFile
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {hasFile ? "Uploaded" : "Required"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-[#16332f]/45">
                        {document.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <label
                  className={`mt-6 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-5 text-sm font-black transition ${
                    uploading
                      ? "cursor-wait border-[#153e38]/20 bg-[#f6f3eb] text-[#16332f]/40"
                      : "border-[#b89a5d]/50 bg-[#fbfaf7] text-[#8c6a31] hover:border-[#153e38]/40 hover:bg-white"
                  }`}
                >
                  <span>{uploading ? "..." : "+"}</span>
                  <span>
                    {uploading
                      ? "Uploading securely..."
                      : hasFile
                        ? "Upload Another File"
                        : "Choose File to Upload"}
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    disabled={uploading}
                    onChange={(event) =>
                      handleFileUpload(event, document.id)
                    }
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-center text-[10px] text-[#16332f]/35">
                  PDF, JPG or PNG • Maximum 10 MB
                </p>

                {documentFiles.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {documentFiles.map((file) => (
                      <div
                        key={`${document.id}-${file.name}`}
                        className="rounded-2xl border border-[#16332f]/8 bg-[#fbfaf7] p-4"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">
                              {file.name}
                            </p>
                            <p className="mt-1 text-[10px] leading-5 text-[#16332f]/40">
                              {formatFileSize(
                                file.metadata?.size
                              )}{" "}
                              • {formatDate(file.created_at)}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(file)}
                              className="rounded-xl border border-[#16332f]/10 bg-white px-3 py-2 text-[10px] font-black text-[#153e38] shadow-sm"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(file)}
                              className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <section className="mt-7 rounded-[2rem] border border-[#d5bb7d]/40 bg-[#f6ead0] p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#846126]">
                Important
              </p>
              <h3 className="mt-2 text-xl font-black">
                Upload clear and valid documents only.
              </h3>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-[#16332f]/55">
                Blurred, expired or incomplete documents may delay
                booking or visa processing. Final verification is
                completed by the Makki Madni operations team.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.location.assign("/customer/dashboard")
              }
              className="shrink-0 rounded-xl bg-[#153e38] px-5 py-3.5 text-xs font-black text-white"
            >
              Return to Dashboard
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}