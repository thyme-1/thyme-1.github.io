import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/SectionCard";
import { type DashboardPhoto } from "@/lib/dashboardTypes";

export function PhotoSlideshow(props: { photos: DashboardPhoto[] }) {
  const photos = props.photos ?? [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % photos.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, [photos.length]);

  const active = useMemo(() => {
    if (photos.length === 0) return null;
    return photos[idx % photos.length];
  }, [idx, photos]);

  return (
    <SectionCard title="Community Photos">
      {active ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-black bg-black">
          <div className="aspect-[16/6] w-full">
            {/* Using <img> keeps this 100% static-hosting friendly. */}
            <img
              key={active.src}
              src={active.src}
              alt={active.alt}
              className="h-full w-full object-cover transition-opacity duration-700"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-2 text-xl font-bold text-white">
            {active.alt}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-black bg-white p-4 text-xl font-semibold">
          No photos yet. Add some in <span className="font-black">/admin</span>.
        </div>
      )}
    </SectionCard>
  );
}

