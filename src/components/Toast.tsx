import { Toaster } from "@/components/ui/sonner";

/**
 * Global toast container rendered once in __root.tsx.
 * Uses sonner's Toaster with ICCC dark theme styling.
 */
export function Toast() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "!bg-[#121212] !text-white !border !border-[#1F1F1F] !rounded-none !shadow-xl !font-sans",
          title: "!text-[13px] !font-medium !tracking-tight",
          description: "!text-[11px] !text-[#8F8F8F]",
          actionButton: "!bg-[#0066FF] !text-white !rounded-none",
          cancelButton: "!bg-[#1F1F1F] !text-[#8F8F8F] !rounded-none",
          closeButton: "!bg-[#1F1F1F] !border !border-[#2a2a2a] !text-[#8F8F8F] !rounded-none",
        },
      }}
    />
  );
}
