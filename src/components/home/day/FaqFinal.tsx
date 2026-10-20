import { useRef, useState, type FormEvent } from "react";
import { Link } from "@/lib/router-compat";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes. Cash on Delivery is available all over Pakistan.",
  },
  {
    q: "How long does delivery take?",
    a: "3 to 5 working days. Delivery is free on orders over Rs. 3,000.",
  },
  {
    q: "Can I return a product?",
    a: "Yes, within 7 days if the product is unused. Message us on WhatsApp to start.",
  },
  {
    q: "What ingredients do you use?",
    a: "Gentle, skin-loving ingredients. Full lists are on each product page.",
  },
  {
    q: "Which skin types is LEVA for?",
    a: "All three products suit most skin types. Take the skin quiz on the Shop page to choose.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number and mobile number.",
  },
];

export function FaqFinal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const clip = useTransform(
    scrollYProgress,
    [0, 1],
    reduced
      ? ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 0% 0% round 0px)"]
      : [
          "inset(0% 30% 0% 30% round 999px 999px 0px 0px)",
          "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
        ],
  );
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    if (!z.string().email().safeParse(email).success) {
      setErr("Please enter a valid email.");
      return;
    }
    setErr("");
    setDone(true);
  };
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.8fr_1fr] md:px-[8vw] md:py-28">
        <div>
          <p className="eyebrow text-primary-foreground/80">Questions</p>
          <h2 className="mt-2 text-3xl font-light md:text-[2.75rem]">Good to know.</h2>
        </div>
        <Accordion type="single" collapsible className="border-t border-primary-foreground/20">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-primary-foreground/20">
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-[15px] text-primary-foreground/85">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div ref={ref} className="pb-16 md:pb-0">
        <motion.div
          style={{ clipPath: clip }}
          className="relative grid min-h-[80svh] place-items-center overflow-hidden"
        >
          <img
            src="https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/leva-pink-studio-hero.webp"
            alt="LEVA skincare ritual"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[center_bottom]"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 38% 42% at 50% 50%, rgba(40,15,25,0.45), rgba(40,15,25,0) 100%)",
            }}
          />
          <div className="relative z-10 max-w-xl px-5 text-center [text-shadow:0_2px_14px_rgba(40,15,25,0.5)]">
            <h2 className="text-3xl font-light md:text-5xl">Your calm ritual starts today.</h2>
            <p className="mt-3 text-[15px] text-primary-foreground/90">
              Get 10% off your first order. Join our list.
            </p>
            {done ? (
              <p role="status" className="mt-6 text-base">
                Thank you! Use code LEVA10 at checkout.
              </p>
            ) : (
              <form
                onSubmit={submit}
                noValidate
                className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
              >
                <label htmlFor="cta-email" className="sr-only">
                  Email
                </label>
                <input
                  id="cta-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your email"
                  className="min-h-12 min-w-0 flex-1 border border-primary-foreground/40 bg-primary/40 px-4 text-base text-primary-foreground placeholder:text-primary-foreground/70"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="h-12 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Join
                </Button>
              </form>
            )}
            {err && (
              <p role="alert" className="mt-2 text-sm">
                {err}
              </p>
            )}
            <Button
              asChild
              className="mt-8 h-12 bg-accent px-8 text-accent-foreground hover:bg-primary-foreground"
            >
              <Link to="/shop">Shop now</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
