import { storeConfig } from "@/config/store";

export function whatsappLink(message: string) {
  return `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
