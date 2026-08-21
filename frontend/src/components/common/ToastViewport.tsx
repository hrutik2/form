import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { dismissToast, subscribeToToasts, ToastMessage } from "../../lib/toastStore";

export const ToastViewport = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => subscribeToToasts(setMessages), []);

  if (!messages.length) {
    return null;
  }

  return (
    <div className="fixed left-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-xl border bg-white p-4 shadow-lg ${
            message.kind === "success" ? "border-teal-200" : "border-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className={`text-sm font-semibold ${
                  message.kind === "success" ? "text-teal-800" : "text-red-700"
                }`}
              >
                {message.title}
              </p>
              {message.detail ? (
                <p className="mt-1 text-sm text-slate-600">{message.detail}</p>
              ) : null}
            </div>
            <button
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => dismissToast(message.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
