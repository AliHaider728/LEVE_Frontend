"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { WhatsappButton } from "@/components/layout/WhatsappButton";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll>
        <FloatingNav />
        <div className="pb-16 md:pb-0">{children}</div>
        <Footer />
        <WhatsappButton />
        <Toaster position="top-center" />
      </SmoothScroll>
    </QueryClientProvider>
  );
}
