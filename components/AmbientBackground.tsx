import { useMemo } from "react";
import { type AmbientPalette, paletteToBackgroundCss } from "@/lib/ambient";

export function AmbientBackground(props: {
  photoSrc?: string | null;
  palette: AmbientPalette;
  /** Makes the photo fill the screen (picture-frame style). */
  photoPriority?: boolean;
}) {
  const bg = useMemo(() => paletteToBackgroundCss(props.palette), [props.palette]);
  const dim = props.palette.photoDim;

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Gradient base */}
      <div
        className="absolute inset-0 transition-[filter,background] duration-[25000ms] ease-linear"
        style={{ background: bg }}
      />

      {/* Photo layer (blurred + gently dimmed for readability) */}
      {props.photoSrc ? (
        <div
          className={[
            "absolute inset-0",
            "transition-[opacity,transform,filter] duration-[1600ms] ease-out",
            props.photoPriority ? "opacity-100" : "opacity-70",
          ].join(" ")}
          style={{
            backgroundImage: `url(${props.photoSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1.06)",
            filter: props.photoPriority ? "blur(0px)" : "blur(22px)",
          }}
        />
      ) : null}

      {/* Dim overlay to keep text readable */}
      <div
        className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
        style={{
          background: `rgba(0,0,0,${props.photoPriority ? 0.25 : dim})`,
        }}
      />

      {/* Warm highlight haze (subtle, avoids greyscale feel) */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(800px 500px at 80% 20%, rgba(255, 214, 165, 0.28) 0%, rgba(255,255,255,0) 60%)",
        }}
      />
    </div>
  );
}

