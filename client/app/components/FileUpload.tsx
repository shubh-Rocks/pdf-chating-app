"use client";
import React, { useState, useRef } from "react";

type Props = {
  onUploadSuccess?: (fileName: string, pdfUrl: string) => void;
};

const FileUpload = ({ onUploadSuccess }: Props) => {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file || file.type !== "application/pdf") return;
    const formData = new FormData();
    formData.append("pdf", file);
    setStatus("uploading");
    try {
      const res = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setUploadedFile(data.fileName);
        onUploadSuccess?.(data.fileName, data.pdfUrl);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleClick = () => {
    if (status === "uploading" || status === "done") return;
    const el = document.createElement("input");
    el.type = "file";
    el.accept = "application/pdf";
    el.addEventListener("change", () => {
      if (el.files?.[0]) processFile(el.files[0]);
    });
    el.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  if (status === "done") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8l4 4 6-6"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-xs text-emerald-400 font-medium">
          Uploaded successfully
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setUploadedFile(null);
          }}
          className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
        >
          Upload different PDF
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200
        ${
          dragOver
            ? "border-amber-400/60 bg-amber-400/5"
            : status === "error"
              ? "border-red-500/30 bg-red-500/5"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        }
        ${status === "uploading" ? "cursor-not-allowed pointer-events-none" : ""}
      `}
    >
      {status === "uploading" ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
          <p className="text-xs text-white/40">Processing PDF...</p>
          <div className="w-full bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
            <div className="h-full bg-amber-400/60 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 3v5M7 10v1"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-xs text-red-400">Upload failed</p>
          <p className="text-xs text-white/30">Click to try again</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 12V4M9 4L6 7M9 4l3 3"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 14h12"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">Drop PDF here</p>
            <p className="text-xs text-white/30 mt-0.5">or click to browse</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
