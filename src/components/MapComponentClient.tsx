"use client";

import { useEffect, useState } from "react";

export default function MapComponentClient() {
  const [MapContent, setMapContent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Only import on client side
    import("./MapContent").then((mod) => {
      setMapContent(() => mod.MapContent);
    });
  }, []);

  if (!MapContent) {
    return (
      <div className="relative w-full h-full border border-border bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </div>
    );
  }

  return <MapContent />;
}
