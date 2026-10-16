import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, Banknote, RotateCcw, Truck } from "lucide-react";
import { CountUp } from "@/components/shop/CountUp";

const points = [
  { icon: Banknote, title: "Cash on Delivery", stat: null, text: "Pay when your parcel arrives." },
  {
    icon: Truck,
    title: "Free delivery",
    stat: { v: 3000, pre: "Rs. ", post: "+" },
    text: "On orders over Rs. 3,000. Delivered in 3 to 5 days.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    stat: { v: 7, pre: "", post: " days" },
    text: "Not happy? Return it within 7 days.",
  },
  {
    icon: BadgeCheck,
    title: "100% authentic",
    stat: { v: 100, pre: "", post: "%" },
    text: "Sold only by LEVA. Never fakes.",
  },
];

export function WhyLeva() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-background px-5 py-16 md:px-[8vw] md:py-24">
      <p className="eyebrow">Why LEVA</p>
      <h2 className="mt-2 text-3xl font-light text-foreground md:text-[2.75rem]">Easy to trust.</h2>
      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {points.map(({ icon: Icon, title, stat, text }, i) => (
          <motion.div
            key={title}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Icon className="size-7 text-accent" />
            <p className="mt-4 text-3xl font-light text-foreground">
              {stat ? (
                <>
                  {stat.pre}
                  <CountUp value={stat.v} format={(v) => Math.round(v).toLocaleString("en-PK")} />
                  {stat.post}
                </>
              ) : (
                "COD"
              )}
            </p>
            <h3 className="mt-2 text-base font-medium">{title}</h3>
            <motion.span
              aria-hidden
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }}
              className="mt-3 block h-px origin-left bg-accent"
            />
            <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
