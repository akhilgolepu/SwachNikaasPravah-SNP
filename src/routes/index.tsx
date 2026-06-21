import React from "react";
import { createFileRoute } from "@tanstack/react-router";

// Old Components
import { MapCanvas } from "@/components/MapCanvas";
import { InspectionDrawer } from "@/components/InspectionDrawer";

// New Refined Components
import { RefinedKPIGrid } from "@/components/RefinedKPIGrid";
import { RefinedAlertFeed } from "@/components/RefinedAlertFeed";
import { RefinedMapContainer } from "@/components/RefinedMapContainer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICCC Map Dashboard — DrainageAI v2.0" },
      { name: "description", content: "Real-time GIS canvas plotting active drain risk across Hyderabad and Mumbai." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="space-y-8 relative z-10">
      <RefinedKPIGrid />

      <div className="grid grid-cols-12 gap-8 h-[600px] relative z-10">
        <RefinedAlertFeed />
        
        <RefinedMapContainer>
          {/* Keeping the old interactive map inside the new wrapper */}
          <MapCanvas />
          <InspectionDrawer />
        </RefinedMapContainer>
      </div>
    </main>
  );
}
