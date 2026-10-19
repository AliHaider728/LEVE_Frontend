import { useRef, useState, type FormEvent } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from "motion/react";
import { BadgeCheck, Star } from "lucide-react";
import { getReviewSummary, type Review } from "@/data/reviews";
import { catalogApi } from "@/lib/api/catalog";
import { useStoreData } from "@/store/catalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Stars({ n, className = "size-4" }: { n: number; className?: string }) {
  return (
    <div className="flex gap-0.5 text-accent" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, s) => (
        <Star key={s} className={`${className} ${s < n ? "fill-current" : "opacity-40"}`} />
      ))}
    </div>
  );
}

function Row({ items, dir }: { items: Review[]; dir: 1 | -1 }) {
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const paused = useRef(false);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [-1500, 0, 1500], [5, 1, 5], { clamp: false });
  const x = useTransform(base, (v) => `${(((v % 50) + 50) % 50) - 50}%`);
  useAnimationFrame((_, delta) => {
    if (reduced || paused.current) return;
    base.set(base.get() + dir * 0.002 * delta * Math.abs(factor.get()));
  });
  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <motion.div
        style={reduced ? {} : { x }}
        className={`flex w-max gap-4 ${reduced ? "flex-wrap px-5" : ""}`}
      >
        {(reduced ? items : [...items, ...items]).map((r, i) => (
          <figure
            key={i}
            className="w-72 shrink-0 rounded-2xl border border-white/15 bg-white/5 p-5 md:w-80"
            aria-hidden={i >= items.length}
          >
            <Stars n={r.rating} />
            <blockquote className="mt-3 text-[15px] leading-7 text-white">“{r.quote}”</blockquote>
            <p className="mt-2 text-xs text-white/80">Bought: {r.product}</p>
            <figcaption className="mt-3 flex items-center justify-between text-xs text-white/85">
              <span>
                {r.name} · {r.city}
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="size-4" /> {r.verified ? "Verified buyer" : "Customer review"}
              </span>
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  );
}

function WriteReview() {
  const { products } = useStoreData();
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    if (sending) return;
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      String(f.get("name") ?? "").trim().length < 2 ||
      String(f.get("text") ?? "").trim().length < 10
    ) {
      setErr("Please add your name and at least 10 characters.");
      return;
    }
    setErr("");
    const product = products.find(p => p.slug === f.get("product"));
    if (!product?.id) { setErr("We couldn't reach the store to submit your review. Please try again later."); return; }
    setSending(true);
    try {
      await catalogApi.submitReview({ productId: product.id, productName: product.name, reviewerName: String(f.get("name")).trim(), rating, content: String(f.get("text")).trim() });
      setDone(true);
    } catch (error) { setErr(error instanceof Error ? error.message : "Your review couldn't be submitted. Please try again."); }
    finally { setSending(false); }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setDone(false);
          setErr("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 border-white bg-transparent text-white hover:bg-white hover:text-primary"
        >
          Write a review
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">Write a review</DialogTitle>
        </DialogHeader>
        {done ? (
          <p role="status" className="text-[15px]">
            Thank you! Your review will appear after we check it.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4">
            <label className="grid gap-1 text-sm">
              Name
              <input name="name" className="min-h-11 border border-primary/30 px-3 text-base" />
            </label>
            <label className="grid gap-1 text-sm">Product<select name="product" className="min-h-11 border border-primary/30 bg-white px-3 text-base">{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
            <fieldset>
              <legend className="text-sm">Rating</legend>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} stars`}
                    aria-pressed={rating === n}
                    onClick={() => setRating(n)}
                    className="grid size-11 place-items-center"
                  >
                    <Star className={`size-6 text-accent ${n <= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-1 text-sm">
              Your review
              <textarea name="text" rows={4} className="border border-primary/30 p-3 text-base" />
            </label>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
            <Button type="submit" className="h-12" disabled={sending}>
              {sending ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ReviewsDrift() {
  const { reviews } = useStoreData();
  const s = getReviewSummary(reviews);
  const mid = Math.ceil(reviews.length / 2);
  const firstHalf = reviews.slice(0, mid);
  const secondHalf = reviews.slice(mid);

  return (
    <section aria-label="Reviews" className="grid gap-4 bg-primary py-16 md:py-24">
      <div className="mb-6 grid gap-8 px-5 md:grid-cols-[1fr_auto] md:items-end md:px-[8vw]">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div>
            <p className="eyebrow text-white/80">Reviews</p>
            <h2 className="mt-2 text-3xl font-light text-white md:text-[2.75rem]">
              Loved across Pakistan.
            </h2>
            {s.count > 0 ? (
              <div className="mt-3 flex items-center gap-3 text-white">
                <span className="text-4xl font-light">{s.average.toFixed(1)}</span>
                <div>
                  <Stars n={Math.round(s.average)} />
                  <p className="text-xs text-white/80">{s.count} {s.count === 1 ? "review" : "reviews"}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/80">No reviews yet</p>
            )}
          </div>
          {s.count > 0 && (
            <ul className="grid max-w-xs gap-1.5 text-xs text-white sm:ml-8">
              {s.bars.map((b) => (
                <li key={b.star} className="grid grid-cols-[2rem_1fr_1.5rem] items-center gap-2">
                  <span>{b.star}★</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-white/20">
                    <motion.span
                      className="block h-full origin-left bg-accent"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: s.count ? b.count / s.count : 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    />
                  </span>
                  <span>{b.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <WriteReview />
      </div>
      {reviews.length > 0 ? (
        <>
          <Row items={firstHalf} dir={-1} />
          {secondHalf.length > 0 && <Row items={secondHalf} dir={1} />}
        </>
      ) : (
        <div className="px-5 py-8 text-center text-white/70 md:px-[8vw]">
          <p className="text-base font-light">No customer reviews yet. Be the first to share your experience with LEVA skincare.</p>
        </div>
      )}
    </section>
  );
}
