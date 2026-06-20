import { Suspense, lazy } from "react";

// Lazy load the map to avoid SSR issues with Leaflet
const MapComponentLazy = lazy(() => import("./MapComponentClient"));

export function MapCanvas() {
  return (
    <Suspense fallback={
      <div className="relative w-full h-full border border-border bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </div>
    }>
      <MapComponentLazy />
    </Suspense>
  );
}
