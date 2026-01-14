import { type ReactNode, useEffect } from "react";

export function FocusOverlay(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  theme: "light" | "dark";
}) {
  useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  const cardClasses =
    props.theme === "dark"
      ? "border-white/15 bg-slate-950/70 text-slate-50"
      : "border-white/35 bg-white/90 text-slate-900";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close focus mode"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={props.onClose}
      />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col p-4 sm:p-8">
        <div
          className={[
            "pointer-events-auto w-full flex-1 overflow-auto rounded-3xl border p-6 sm:p-10",
            "shadow-[0_30px_80px_rgba(0,0,0,0.35)]",
            "animate-[focusIn_180ms_ease-out]",
            cardClasses,
          ].join(" ")}
        >
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight">{props.title}</h2>
              <p className={props.theme === "dark" ? "mt-2 text-xl text-slate-200/80" : "mt-2 text-xl text-slate-700"}>
                Focus mode • tap outside to close
              </p>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className={[
                "rounded-2xl border px-5 py-3 text-xl font-extrabold",
                "transition active:scale-[0.99]",
                props.theme === "dark"
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-slate-200 bg-slate-900 text-white",
              ].join(" ")}
            >
              Close
            </button>
          </div>
          <div className="text-2xl leading-relaxed">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

