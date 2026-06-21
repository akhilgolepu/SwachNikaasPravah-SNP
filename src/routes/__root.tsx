import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { RefinedHeader } from "@/components/RefinedHeader";
import { StormModeOverlay } from "@/components/StormModeOverlay";
import { Toaster } from "@/components/ui/sonner";
import { simStore, useSimStore } from "@/lib/simStore";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Route not found in ICCC system.</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">System error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 px-4 h-10 bg-primary text-primary-foreground text-sm font-medium uppercase tracking-wider"
        >Retry</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SwachNikaasPravah-SNP — ICCC Command Center" },
      { name: "description", content: "Real-time AI-powered drainage monitoring for Indian smart cities. Repurposing CCTV infrastructure to prevent urban flooding." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=", crossOrigin: "" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const stormMode = useSimStore((s) => s.stormMode);

  useEffect(() => {
    // Initialize store — fetches data from backend API and connects WebSocket
    simStore.initialize();
  }, []);

  const setStormMode = () => {
    simStore.toggleStorm();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
        <StormModeOverlay active={stormMode} />
        
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-6 font-sans text-white">
          <RefinedHeader stormMode={stormMode} setStormMode={setStormMode} />
          <Outlet />
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </QueryClientProvider>
  );
}
export type ReactNode = import("react").ReactNode;
