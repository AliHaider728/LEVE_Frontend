import { MessageCircle } from "lucide-react";
import { useRouterState } from "@/lib/router-compat";
import { useStoreData } from "@/store/catalog";
export function WhatsappButton() {
  const { settings } = useStoreData();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const productPage = pathname.startsWith("/shop/");
  return <a href={"https://wa.me/" + settings.whatsappNumber} target="_blank" rel="noreferrer" aria-label="Chat with LEVA on WhatsApp"
    className={"fixed right-4 z-30 size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 md:bottom-6 md:right-6 md:grid " + (pathname === "/checkout" ? "hidden" : "grid ") + (productPage ? " bottom-[calc(9rem+env(safe-area-inset-bottom))]" : " bottom-[calc(6rem+env(safe-area-inset-bottom))]") }>
    <MessageCircle />
  </a>;
}
