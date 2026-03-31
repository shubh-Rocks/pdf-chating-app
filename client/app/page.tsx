// import FileUpload from "./components/FileUpload";
// import Chat from "./components/chat";

// export default function Home() {
//   return (
//     <div className="mt-10">
//       <div className="w-screen min-h-screen flex">
//         <section className="w-[30vw] flex items-center justify-center min-h-screen border-r-2">
//           <FileUpload />
//         </section>
//         <section className="w-[70vw] min-h-screen">
//           <Chat />
//         </section>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import Chat from "./components/chat";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  return (
    <div className="flex w-screen min-h-screen bg-[#0F0F0F] text-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 bg-[#141414]">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h10v2H2zM2 6h7v2H2zM2 10h5v2H2z" fill="#0F0F0F" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">
              DocChat
            </span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex-1 flex flex-col p-5 gap-4">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest">
            Your Document
          </p>
          <FileUpload
            onUploadSuccess={(name, url) => setUploadedFile({ name, url })}
          />

          {/* Uploaded file preview */}
          {uploadedFile && (
            <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 1h7l4 4v10H3V1z"
                      stroke="#FBBF24"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    <path
                      d="M10 1v4h4"
                      stroke="#FBBF24"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    <path
                      d="M5 8h6M5 11h4"
                      stroke="#FBBF24"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    Ready to chat
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {!uploadedFile && (
            <div className="mt-auto space-y-2">
              <p className="text-xs text-white/30 uppercase tracking-widest font-medium">
                How it works
              </p>
              {[
                "Upload any PDF document",
                "Ask questions naturally",
                "Get instant AI answers",
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-xs flex items-center justify-center text-white/40 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs text-white/40">{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT CHAT PANEL */}
      <main className="flex-1 flex flex-col">
        <Chat isReady={!!uploadedFile} fileName={uploadedFile?.name} />
      </main>
    </div>
  );
}
