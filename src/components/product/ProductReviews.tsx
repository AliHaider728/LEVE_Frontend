"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApprovedProductReviews, submitProductReview, type PublicProductReview } from "@/lib/api/product-reviews";
import { catalogApi } from "@/lib/api/catalog";

function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex gap-0.5 text-accent" aria-label={rating + " out of 5 stars"}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`size-4 ${index < rating ? "fill-current" : "opacity-35"}`} />)}
  </span>;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "" : new Intl.DateTimeFormat("en-PK", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function ProductReviews({ productId, productSlug, productName, catalogReady }: { productId?: string; productSlug: string; productName: string; catalogReady: boolean }) {
  const [reviewProductId, setReviewProductId] = useState(productId || "");
  const [reviews, setReviews] = useState<PublicProductReview[]>([]);
  const [loading, setLoading] = useState(Boolean(productId) || !catalogReady);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [rating, setRating] = useState(0);
  const submitting = useRef(false);

  useEffect(() => { setReviewProductId(productId || ""); }, [productId]);

  const resolveProductId = async () => {
    if (reviewProductId) return reviewProductId;
    const current = (await catalogApi.listProducts()).find(product => product.slug === productSlug);
    if (!current?.id) throw new Error("The store is unavailable right now. Please try again shortly.");
    setReviewProductId(current.id);
    return current.id;
  };

  useEffect(() => {
    if (!reviewProductId) { setLoading(!catalogReady); setReviews([]); return; }
    let active = true;
    setLoading(true);
    setError("");
    getApprovedProductReviews(reviewProductId).then(items => {
      if (active) setReviews(items);
    }).catch(() => {
      if (active) setError("Reviews could not load right now. Please try again.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [reviewProductId, catalogReady, refresh]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const reviewerName = String(values.get("name") ?? "").trim();
    const title = String(values.get("title") ?? "").trim();
    const content = String(values.get("content") ?? "").trim();
    if (reviewerName.length < 2) { setFormError("Please enter your name (at least 2 characters)."); return; }
    if (rating < 1 || rating > 5) { setFormError("Please choose a star rating."); return; }
    if (title.length > 100) { setFormError("Please keep the title under 100 characters."); return; }
    if (content.length < 10) { setFormError("Please write at least 10 characters about your experience."); return; }
    if (content.length > 1000) { setFormError("Please keep your review under 1,000 characters."); return; }
    submitting.current = true;
    setSending(true);
    setFormError("");
    try {
      const liveProductId = await resolveProductId();
      await submitProductReview({ productId: liveProductId, productName, reviewerName, rating, title, content });
      form.reset();
      setRating(0);
      setSubmitted(true);
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Your review could not be submitted. Please try again.");
    } finally {
      submitting.current = false;
      setSending(false);
    }
  };

  return <section id="customer-reviews" className="scroll-mt-32 border-t border-primary/10 bg-[#FFF4F6]/45 px-5 py-14 md:px-[8vw] md:py-20" aria-labelledby="reviews-heading">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">From the LEVA community</p>
          <h2 id="reviews-heading" className="mt-2 text-3xl font-light md:text-5xl">Customer reviews</h2>
          {!loading && !error && <div className="mt-4 flex items-center gap-3 text-sm">
            {reviews.length > 0 ? (
              <>
                <strong className="text-2xl font-medium">{average.toFixed(1)}</strong>
                <Stars rating={Math.round(average)} />
                <span className="text-muted-foreground">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
              </>
            ) : (
              <span className="text-muted-foreground">No reviews yet</span>
            )}
          </div>}
        </div>
        <Button type="button" variant="outline" magnetic={false} onClick={() => { setSubmitted(false); setFormError(""); setOpen(true); }}>Write a review</Button>
      </div>
      {loading ? <div role="status" className="mt-8 grid gap-4 md:grid-cols-2"><span className="h-36 animate-pulse rounded-md bg-secondary" /><span className="h-36 animate-pulse rounded-md bg-secondary" /><span className="sr-only">Loading reviews…</span></div>
        : error ? <div role="alert" className="mt-8 rounded-md border border-primary/15 bg-white p-6"><p>{error}</p><Button variant="outline" magnetic={false} className="mt-4" onClick={async () => { try { setError(""); await resolveProductId(); setRefresh(value => value + 1); } catch { setError("Reviews could not load right now. Please try again."); } }}>Try again</Button></div>
        : !reviewProductId ? <div className="mt-8 rounded-md border border-primary/15 bg-white p-6 text-sm"><p>We could not load live reviews right now.</p><Button variant="outline" magnetic={false} className="mt-4" onClick={async () => { try { await resolveProductId(); } catch { setError("Reviews could not load right now. Please try again."); } }}>Try again</Button></div>
        : reviews.length === 0 ? <div className="mt-8 rounded-md border border-primary/15 bg-white p-8 text-center"><p className="text-lg font-light">No approved reviews yet.</p><p className="mt-2 text-sm text-muted-foreground">Be the first to share your experience with {productName}.</p></div>
        : <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.map(review => <article key={review.id} className="rounded-md border border-primary/15 bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2"><Stars rating={review.rating} /><time className="text-xs text-muted-foreground" dateTime={review.createdAt}>{dateLabel(review.createdAt)}</time></div>
            {review.title && <h3 className="mt-4 text-lg font-medium">{review.title}</h3>}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/85">{review.content}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-4 text-xs text-muted-foreground"><span>{review.reviewerName}</span>{review.verifiedPurchase && <span className="inline-flex items-center gap-1 text-primary"><BadgeCheck className="size-4" />Verified purchase</span>}</div>
          </article>)}
        </div>}
      {reviewProductId && <button type="button" onClick={() => setRefresh(value => value + 1)} className="mt-6 min-h-11 text-sm text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" disabled={loading}>Refresh reviews</button>}
    </div>
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) { setFormError(""); setSubmitted(false); setRating(0); } }}>
      <DialogContent data-lenis-prevent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white sm:max-w-lg">
        <DialogHeader><DialogTitle className="text-2xl font-light">Review {productName}</DialogTitle><DialogDescription>Tell us about your experience. Reviews appear after approval.</DialogDescription></DialogHeader>
        {submitted ? <div role="status" className="py-5"><BadgeCheck className="size-8 text-primary" /><p className="mt-3 font-medium">Thank you! Your review has been submitted and is awaiting approval.</p><Button type="button" className="mt-6" onClick={() => setOpen(false)}>Done</Button></div>
          : <form noValidate onSubmit={submit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm">Your name<Input name="name" autoComplete="name" maxLength={80} className="min-h-11" /></label>
            <fieldset><legend className="text-sm">Your rating <span className="text-destructive">*</span></legend><div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map(value => <button type="button" key={value} onClick={() => { setRating(value); setFormError(""); }} aria-label={value + " stars"} aria-pressed={rating === value} className="grid size-11 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"><Star className={`size-6 text-accent ${value <= rating ? "fill-current" : ""}`} /></button>)}</div></fieldset>
            <label className="grid gap-1.5 text-sm"><span>Review title <span className="text-muted-foreground">(optional)</span></span><Input name="title" maxLength={100} className="min-h-11" /></label>
            <label className="grid gap-1.5 text-sm">Your review<Textarea name="content" rows={4} maxLength={1000} /></label>
            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" magnetic={false} disabled={sending} className="min-h-12">{sending ? "Submitting…" : "Submit review"}</Button>
          </form>}
      </DialogContent>
    </Dialog>
  </section>;
}
