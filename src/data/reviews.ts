/** Placeholder reviews for preview. Replace with real customer reviews. */
export type Review = { name: string; city: string; rating: number; quote: string; product: string; verified?: boolean };

export const reviews: Review[] = [
  {
    name: "Ayesha K.",
    city: "Lahore",
    rating: 5,
    quote: "My skin feels so soft now. The cream is my favourite.",
    product: "Skin Brightening Cream",
  },
  {
    name: "Sana M.",
    city: "Karachi",
    rating: 5,
    quote: "Got it with Cash on Delivery in 3 days. Lovely packing.",
    product: "The Complete Ritual",
  },
  {
    name: "Mahnoor R.",
    city: "Faisalabad",
    rating: 4,
    quote: "Gentle face wash, no dryness at all.",
    product: "Skin Brightening Face Wash",
  },
  {
    name: "Zainab T.",
    city: "Multan",
    rating: 5,
    quote: "The bundle is great value. Full routine sorted.",
    product: "The Duo",
  },
  {
    name: "Iqra N.",
    city: "Rawalpindi",
    rating: 5,
    quote: "My sensitive skin loves the cleanser.",
    product: "Skin Brightening Face Wash",
  },
  {
    name: "Amna J.",
    city: "Sialkot",
    rating: 5,
    quote: "WhatsApp ordering was so easy.",
    product: "Skin Brightening Cream",
  },
];

export function getReviewSummary(list: Review[] = reviews) {
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  const bars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }));
  return { count, average, bars };
}
