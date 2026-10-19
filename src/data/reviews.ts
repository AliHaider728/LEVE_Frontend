/** Placeholder reviews for preview. Replace with real customer reviews. */
export type Review = { name: string; city: string; rating: number; quote: string; product: string; verified?: boolean };

export const reviews: Review[] = [];

export function getReviewSummary(list: Review[] = reviews) {
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  const bars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }));
  return { count, average, bars };
}
