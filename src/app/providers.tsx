"use client";
import { ScrollManager } from '@/components/layout/ScrollManager';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { WhatsappButton } from "@/components/layout/WhatsappButton";
import { useStoreData } from "@/store/catalog";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

function StorefrontShell({ children }: { children: ReactNode }) {
  const loadStore = useStoreData(state => state.load);
  useEffect(() => { void loadStore(); }, [loadStore]);
  return (
    <>
      <SmoothScroll>
        <FloatingNav />
        <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
        <Footer />
        <WhatsappButton />
        <Toaster position="top-center" />
      </SmoothScroll>
    </>
  );
}

export function Providers({children}:{children:ReactNode}) {
 const pathname=usePathname();
 const [queryClient]=useState(()=>new QueryClient());
 return <QueryClientProvider client={queryClient}><ScrollManager/>{pathname.startsWith("/admin")?<>{children}<Toaster position="top-center" /></>:<StorefrontShell>{children}</StorefrontShell>}</QueryClientProvider>;
}
