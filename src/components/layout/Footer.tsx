import { useStoreData } from "@/store/catalog";
import { FormEvent, useState } from "react";
import { Facebook, Instagram, Send } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { settings: storeConfig } = useStoreData();
  const [subscribed, setSubscribed] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email === "string" && email.trim()) setSubscribed(true);
  };
  return (
    <footer className="overflow-hidden bg-primary px-5 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-16 text-primary-foreground md:px-8 md:pb-6">
      <div className="grid gap-12 border-b border-primary-foreground/20 pb-14 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="max-w-md text-3xl font-light">
            Made for her skin.
            <br />
            Made for her pace.
          </p>
          <p className="mt-6 max-w-sm text-base text-primary-foreground/75">
            Join the LEVA list for thoughtful skincare notes and considered releases.
          </p>
          {subscribed ? (
            <p role="status" className="mt-6 text-base">
              Thank you for joining.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 flex max-w-md">
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                maxLength={255}
                placeholder="Email address"
                className="min-h-12 min-w-0 flex-1 border border-primary-foreground/40 bg-transparent px-4 text-base placeholder:text-primary-foreground/60 focus:outline-2"
              />
              <Button
                type="submit"
                variant="secondary"
                size="icon"
                className="min-h-12 min-w-12 bg-white text-primary hover:bg-white/90"
                aria-label="Subscribe"
              >
                <Send className="size-4" />
              </Button>
            </form>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <nav
            aria-label="Footer navigation"
            className="grid content-start gap-4 text-xs font-medium uppercase tracking-wider"
          >
            <Link to="/shop">Shop</Link>
            <Link to="/account">Account</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <nav
            aria-label="Policies"
            className="grid min-w-0 content-start gap-4 text-xs font-medium uppercase tracking-wider"
          >
            <Link to="/shipping-policy">Shipping Policy</Link>
            <Link to="/returns">Returns & Exchange</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/track-order">Track Order</Link>
          </nav>
          <div className="col-span-2 md:col-span-1">
            <div className="mb-5 grid gap-2 text-sm">
              <a href={`tel:+${storeConfig.whatsappNumber}`}>+92 314 708 0907</a>
              <a
                href={`https://wa.me/${storeConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp ↗
              </a>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/leva.pk.official/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center border border-primary-foreground/30 hover:border-white hover:bg-white/10 transition-colors"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://www.facebook.com/leva.pk.official"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid size-11 place-items-center border border-primary-foreground/30 hover:border-white hover:bg-white/10 transition-colors"
              >
                <Facebook className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-14 flex justify-center px-4">
        <img
          src="/images/LEVA-logo-white.png"
          alt="LEVA"
          className="h-auto w-full max-w-[min(65vw,260px)] sm:max-w-[280px] md:max-w-[320px] object-contain opacity-90 transition-opacity hover:opacity-100"
          loading="lazy"
        />
      </div>
      <div className="mt-8 flex justify-between text-xs uppercase text-primary-foreground/70">
        <span>© 2026 LEVA</span>
        <span>Pakistan</span>
      </div>
    </footer>
  );
}
