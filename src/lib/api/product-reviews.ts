import { apiRequest, ApiError } from "./client";

export type PublicProductReview = {
  id: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

type ReviewRow = Record<string, unknown>;
const isRow = (value: unknown): value is ReviewRow => !!value && typeof value === "object" && !Array.isArray(value);
const asText = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const inflight = new Map<string, Promise<PublicProductReview[]>>();

export function getApprovedProductReviews(productId: string): Promise<PublicProductReview[]> {
  const existing = inflight.get(productId);
  if (existing) return existing;
  const request = apiRequest<unknown>("/api/reviews/product/" + encodeURIComponent(productId))
    .then(payload => {
      if (!Array.isArray(payload)) throw new ApiError("Reviews were unavailable.", 0, "invalid-response");
      return payload.filter(isRow).filter(row => row.status === "approved").map(row => ({
        id: asText(row.id),
        reviewerName: asText(row.reviewerName) || "LEVA customer",
        rating: Math.max(1, Math.min(5, Number(row.rating) || 1)),
        title: asText(row.title),
        content: asText(row.content),
        createdAt: asText(row.createdAt),
        verifiedPurchase: row.verifiedPurchase === true || row.verifiedPurchase === 1,
      })).filter(row => row.id && row.content);
    })
    .finally(() => { inflight.delete(productId); });
  inflight.set(productId, request);
  return request;
}

export type ReviewSubmission = {
  productId: string;
  productName: string;
  reviewerName: string;
  rating: number;
  title?: string;
  content: string;
};

export async function submitProductReview(input: ReviewSubmission): Promise<void> {
  const response = await apiRequest<{ review?: { status?: string } }>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (response.review?.status !== "pending") {
    throw new ApiError("We couldn't confirm your review is awaiting approval. Please contact LEVA.", 0, "invalid-response");
  }
}
