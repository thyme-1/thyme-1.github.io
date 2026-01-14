import { type ReactNode } from "react";

export function DashboardCard(props: {
  title: string;
  subtitle?: string;
  theme: "light" | "dark";
  children: ReactNode;
  onFocus?: () => void;
  focusHint?: string;
}) {
  const interactive = typeof props.onFocus === "function";
  const Comp: any = interactive ? "button" : "section";

  const wrapperClasses =
    props.theme === "dark"
      ? "border-white/15 bg-slate-950/55 text-slate-50"
      : "border-white/30 bg-white/80 text-slate-900";

  const titleClasses = props.theme === "dark" ? "text-slate-50" : "text-slate-900";
  const subtitleClasses =
    props.theme === "dark" ? "text-slate-200/80" : "text-slate-600";

  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={props.onFocus}
      className={[
        "group relative w-full text-left",
        "rounded-3xl border p-6",
        "shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur",
        "transition duration-200 ease-out",
        interactive
          ? "active:scale-[0.99] active:shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          : "",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70",
        wrapperClasses,
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className={["text-2xl font-extrabold tracking-tight", titleClasses].join(" ")}>
            {props.title}
          </h2>
          {props.subtitle ? (
            <p className={["mt-1 text-lg font-semibold", subtitleClasses].join(" ")}>
              {props.subtitle}
            </p>
          ) : null}
        </div>
        {props.focusHint ? (
          <div
            className={[
              "hidden rounded-full px-3 py-1 text-sm font-bold sm:block",
              props.theme === "dark"
                ? "bg-white/10 text-slate-200/80"
                : "bg-slate-900/5 text-slate-700",
            ].join(" ")}
          >
            {props.focusHint}
          </div>
        ) : null}
      </div>
      <div>{props.children}</div>
    </Comp>
  );
}

