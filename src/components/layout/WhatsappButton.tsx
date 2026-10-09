import { MessageCircle } from "lucide-react";
import { storeConfig } from "@/config/store";

export function WhatsappButton() {
  return (
    <a
      href={`https://wa.me/${storeConfig.whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with LEVA on WhatsApp"
      className="fixed bottom-24 right-6 z-30 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 md:bottom-6 md:right-6"
    >
      <MessageCircle />
    </a>
  );
}
