import React, { useState, useEffect, Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Real GIS Map and Inspection Drawer
const LazyLeafletMap = lazy(() => import("@/components/LeafletMap").then((m) => ({ default: m.LeafletMap })));
import { InspectionDrawer } from "@/components/InspectionDrawer";

// New Refined Components
import { RefinedKPIGrid } from "@/components/RefinedKPIGrid";
import { RefinedAlertFeed } from "@/components/RefinedAlertFeed";
import { RefinedMapContainer } from "@/components/RefinedMapContainer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICCC Map Dashboard — SwachNikaasPravah-SNP" },
      { name: "description", content: "Real-time GIS canvas plotting active drain risk across Hyderabad and Mumbai." },
    ],
  }),
  component: DashboardPage,
});

function ClientMap() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return <div className="flex-1 w-full h-full bg-slate-900 rounded-lg animate-pulse" />;
  return (
    <Suspense fallback={<div className="flex-1 w-full h-full bg-slate-900 rounded-lg animate-pulse" />}>
      <LazyLeafletMap />
    </Suspense>
  );
}

function DashboardPage() {
  return (
    <main className="space-y-8 relative z-10">
      <RefinedKPIGrid />

      <div className="grid grid-cols-12 gap-8 h-[600px] relative z-10">
        <RefinedAlertFeed />
        
        <RefinedMapContainer>
          <ClientMap />
          <InspectionDrawer />
        </RefinedMapContainer>
      </div>
    </main>
  );
}
