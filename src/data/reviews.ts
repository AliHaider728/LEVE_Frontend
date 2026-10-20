/** Placeholder reviews for preview. Replace with real customer reviews. */
export type Review = { name: string; city: string; rating: number; quote: string; product: string; verified?: boolean };

export const reviews: Review[] = [
  {
    name: "Ayesha Khan",
    city: "Lahore",
    rating: 5,
    quote: "My skin feels so soft and hydrated throughout the day. The cream is truly my favourite.",
    product: "LEVA Cream",
    verified: true,
  },
  {
    name: "Sana Malik",
    city: "Karachi",
    rating: 5,
    quote: "Got it with Cash on Delivery in 3 days. Lovely packing and wonderful formulation.",
    product: "The Complete Ritual",
    verified: true,
  },
  {
    name: "Hania Aslam",
    city: "Islamabad",
    rating: 5,
    quote: "Face wash use karna easy hai aur washing ke baad fresh feel hota hai. Daily routine mein easily include ho jata hai.",
    product: "LEVA Face Wash",
    verified: true,
  },
  {
    name: "Zainab Tariq",
    city: "Multan",
    rating: 5,
    quote: "The combination of the cream and tinted sunblock gives such a natural healthy glow. Incredible value.",
    product: "The Duo",
    verified: true,
  },
  {
    name: "Mahnoor Rehman",
    city: "Faisalabad",
    rating: 5,
    quote: "Finally a tinted sunscreen that doesn't leave a white cast or feel greasy in Pakistani weather. Absorbs beautifully.",
    product: "LEVA Tinted Sunblock",
    verified: true,
  },
  {
    name: "Iqra Nadeem",
    city: "Rawalpindi",
    rating: 5,
    quote: "My sensitive skin loves this gentle face wash. Leaves face clean yet deeply hydrated and calm.",
    product: "LEVA Face Wash",
    verified: true,
  },
  {
    name: "Amna Javed",
    city: "Sialkot",
    rating: 5,
    quote: "WhatsApp ordering was so easy. Cream has a rich but non-sticky texture that brightens the skin naturally.",
    product: "LEVA Cream",
    verified: true,
  },
  {
    name: "Fatima Shah",
    city: "Peshawar",
    rating: 5,
    quote: "SPF 50 protection with an elegant sheer tint. Completely replaced my daily heavy foundation!",
    product: "LEVA Tinted Sunblock",
    verified: true,
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
