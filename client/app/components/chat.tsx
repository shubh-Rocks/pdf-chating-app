// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { Send, Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// type Message = {
//   role: "user" | "assistant";
//   content: string;
// };

// const Chat = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   // Auto scroll to bottom on every new message
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!input.trim() || loading) return;

//     const userMessage: Message = { role: "user", content: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:8000/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: input }),
//       });
//       const data = await res.json();
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: data.answer ?? "No answer found." },
//       ]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           content: "Something went wrong. Please try again.",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen p-4">
//       {/* Message List */}
//       <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
//         {messages.length === 0 && (
//           <p className="text-gray-400 text-center mt-20">
//             Upload a PDF then start asking questions!
//           </p>
//         )}

//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm
//               ${
//                 msg.role === "user"
//                   ? "bg-cyan-900 text-white self-end"
//                   : "bg-gray-100 text-gray-800 self-start"
//               }`}
//           >
//           <ReactMarkdown>{msg.content}</ReactMarkdown>
//           </div>
//         ))}

//         {loading && (
//           <div className="bg-gray-100 text-gray-500 self-start px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
//             <Loader2 className="animate-spin w-3 h-3" /> Thinking...
//           </div>
//         )}

//         <div ref={bottomRef} />
//       </div>

//       {/* Input Box */}
//       <div className="flex gap-2 border-t pt-4">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           placeholder="Ask something about your PDF..."
//           className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-700"
//         />
//         <button
//           onClick={sendMessage}
//           disabled={loading || !input.trim()}
//           className="bg-cyan-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
//         >
//           <Send className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;
"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  isReady: boolean;
  fileName?: string;
};

const suggestedQuestions = [
  "Summarize this document",
  "What are the key points?",
  "Explain the main topic",
  "What conclusions are made?",
];

const Chat = ({ isReady, fileName }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading || !isReady) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "No answer found." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-semibold text-white text-sm">
            {fileName ? fileName : "PDF Chat"}
          </h1>
          <p className="text-xs text-white/30 mt-0.5">
            {isReady ? "Ask anything about your document" : "Upload a PDF to get started"}
          </p>
        </div>
        {isReady && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Active
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-8 pb-10">
            {!isReady ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h10l6 6v10H4V4z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none"/>
                    <path d="M14 4v6h6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none"/>
                    <path d="M8 13h8M8 17h5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-white/40 text-sm">Upload a PDF from the sidebar</p>
                <p className="text-white/20 text-xs mt-1">to start asking questions</p>
              </div>
            ) : (
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="#FBBF24" strokeWidth="1.2" fill="none"/>
                      <path d="M10 6v5l3 3" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-white/50 text-sm">Ready! Try asking something</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-xs text-white/50 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-3 transition-all duration-150"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-medium mt-0.5
              ${msg.role === "user"
                ? "bg-amber-400/20 text-amber-400"
                : "bg-white/10 text-white/60"
              }`}
            >
              {msg.role === "user" ? "Y" : "AI"}
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === "user"
                ? "bg-amber-400/10 border border-amber-400/20 text-white/90 rounded-tr-sm"
                : "bg-white/[0.04] border border-white/10 text-white/80 rounded-tl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none
                  prose-p:my-1.5 prose-p:leading-relaxed
                  prose-ul:my-1.5 prose-ul:pl-4
                  prose-ol:my-1.5 prose-ol:pl-4
                  prose-li:my-0.5
                  prose-strong:text-white/90 prose-strong:font-medium
                  prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                  prose-headings:text-white/80 prose-headings:font-medium
                ">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 shrink-0">AI</div>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 shrink-0 border-t border-white/[0.06]">
        <div className={`flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all duration-200
          ${isReady
            ? "bg-white/[0.04] border-white/10 focus-within:border-white/20"
            : "bg-white/[0.02] border-white/5 opacity-50 pointer-events-none"
          }`}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isReady ? "Ask about your PDF..." : "Upload a PDF first..."}
            disabled={!isReady || loading}
            rows={1}
            style={{ resize: "none", minHeight: "24px", maxHeight: "120px" }}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none leading-6 disabled:cursor-not-allowed overflow-y-auto"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim() || !isReady}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150
              ${input.trim() && !loading && isReady
                ? "bg-amber-400 hover:bg-amber-300 text-black"
                : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 7 2 2v4l7 1-7 1v4z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-white/20 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default Chat;