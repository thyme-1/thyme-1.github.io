import { type ReactNode, useEffect } from "react";

export function FullscreenFocus(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  rightActions?: ReactNode;
  /** Hide the top bar for picture-frame mode. */
  chrome?: boolean;
}) {
  const { open, onClose } = props;
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const chrome = props.chrome ?? true;

  return (
    <div className="fixed inset-0 z-50 animate-[focusIn_260ms_ease-out]">
      <div className="relative h-full w-full">
        {chrome ? (
          <div className="pointer-events-auto absolute left-0 right-0 top-0 z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={props.onClose}
              className={[
                "rounded-2xl border border-white/20 bg-white/10 px-5 py-3",
                "text-xl font-extrabold text-white backdrop-blur",
                "transition active:scale-[0.99]",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70",
              ].join(" ")}
            >
              Back
            </button>
            <div className="min-w-0 text-center">
              <div className="truncate text-3xl font-black tracking-tight text-white">
                {props.title}
              </div>
            </div>
            <div className="flex items-center gap-3">{props.rightActions ?? <div className="w-[92px]" />}</div>
          </div>
        ) : null}

        <div
          className={[
            "pointer-events-auto h-full w-full overflow-auto",
            chrome ? "pt-20 sm:pt-24" : "",
          ].join(" ")}
        >
          <div className="h-full w-full px-4 pb-8 sm:px-8">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

