import { useStoreData } from "@/store/catalog";
import { FormEvent, useState } from "react";
import { Facebook, Instagram, Music2, Send } from "lucide-react";
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
                className="min-h-12 min-w-12 border-primary-foreground text-primary-foreground"
                aria-label="Subscribe"
              >
                <Send />
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
            <Link to="/bundles">Bundles</Link>
            <Link to="/bundles/build">Build your own</Link>
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
              <a href={`tel:${storeConfig.phone.replace(/\s/g, "")}`}>{storeConfig.phone}</a>
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
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center border border-primary-foreground/30"
              >
                <Instagram />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid size-11 place-items-center border border-primary-foreground/30"
              >
                <Facebook />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="grid size-11 place-items-center border border-primary-foreground/30"
              >
                <Music2 />
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="border border-primary-foreground/30 px-2 py-1">COD</span>
              <span className="border border-primary-foreground/30 px-2 py-1">JazzCash</span>
              <span className="border border-primary-foreground/30 px-2 py-1">Easypaisa</span>
              <span className="border border-primary-foreground/30 px-2 py-1">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-[20vw] font-light leading-none">LEVA</p>
      <div className="mt-6 flex justify-between text-xs uppercase text-primary-foreground/70">
        <span>© 2026 LEVA</span>
        <div className="flex items-center gap-5"><Link to="/admin/login" className="text-[11px] normal-case opacity-65 hover:opacity-100">Admin</Link><span>Pakistan</span></div>
      </div>
    </footer>
  );
}
