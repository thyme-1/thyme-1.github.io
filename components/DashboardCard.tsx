import { type ReactNode } from "react";

export function DashboardCard(props: {
  title: string;
  subtitle?: string;
  accent?: "amber" | "rose" | "sky" | "emerald" | "violet";
  children: ReactNode;
  onFocus?: () => void;
  focusHint?: string;
}) {
  const interactive = typeof props.onFocus === "function";

  const accent = props.accent ?? "amber";
  const accentRing =
    accent === "amber"
      ? "focus-visible:ring-amber-300/70"
      : accent === "rose"
        ? "focus-visible:ring-rose-300/70"
        : accent === "sky"
          ? "focus-visible:ring-sky-300/70"
          : accent === "emerald"
            ? "focus-visible:ring-emerald-300/70"
            : "focus-visible:ring-violet-300/70";

  const accentGlow =
    accent === "amber"
      ? "from-amber-200/35 to-amber-50/0"
      : accent === "rose"
        ? "from-rose-200/35 to-rose-50/0"
        : accent === "sky"
          ? "from-sky-200/35 to-sky-50/0"
          : accent === "emerald"
            ? "from-emerald-200/35 to-emerald-50/0"
            : "from-violet-200/35 to-violet-50/0";

  const className = [
    "group relative w-full text-left",
    "rounded-[28px] border border-white/20 bg-white/12 p-6 backdrop-blur",
    "shadow-[0_18px_50px_rgba(0,0,0,0.20)]",
    "transition duration-300 ease-out",
    interactive
      ? "active:scale-[0.99] active:shadow-[0_14px_45px_rgba(0,0,0,0.24)]"
      : "",
    "focus:outline-none focus-visible:ring-4",
    accentRing,
  ].join(" ");

  const inner = (
    <>
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-[28px] opacity-70",
          "bg-gradient-to-br",
          accentGlow,
        ].join(" ")}
      />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {props.title}
          </h2>
          {props.subtitle ? (
            <p className="mt-1 text-lg font-semibold text-white/80">
              {props.subtitle}
            </p>
          ) : null}
        </div>
        {props.focusHint ? (
          <div className="hidden rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white/80 sm:block">
            {props.focusHint}
          </div>
        ) : null}
      </div>
      <div className="relative">{props.children}</div>
    </>
  );

  if (interactive) {
    return (
      <button type="button" onClick={props.onFocus} className={className}>
        {inner}
      </button>
    );
  }

  return <section className={className}>{inner}</section>;
}

