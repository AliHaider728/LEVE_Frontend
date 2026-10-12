import { storeConfig } from "@/config/store";

export function whatsappLink(message: string, number: string = storeConfig.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
