import { type ReactNode } from "react";

export function SectionCard(props: {
  title: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight text-black">
          {props.title}
        </h2>
        {props.rightSlot ? (
          <div className="text-lg font-semibold text-black">{props.rightSlot}</div>
        ) : null}
      </div>
      <div className="text-xl leading-relaxed text-black">{props.children}</div>
    </section>
  );
}

