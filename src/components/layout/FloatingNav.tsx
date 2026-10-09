import { storeConfig } from "@/config/store";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@/lib/router-compat";
import { Contact, Home, Layers3, Search, ShoppingBag, Store } from "lucide-react";
import logo from "@/assets/LEVA.png.asset.json";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { UserMenu } from "@/components/layout/UserMenu";

const desktopLinks = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Bundles", to: "/bundles" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];
const tabs = [
  { label: "Home", to: "/" as const, icon: Home },
  { label: "Shop", to: "/shop" as const, icon: Store },
  { label: "Bundles", to: "/bundles" as const, icon: Layers3 },
  { label: "Cart", to: "/cart" as const, icon: ShoppingBag },
  { label: "Contact", to: "/contact" as const, icon: Contact },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const setCartOpen = useCart((state) => state.setOpen);
  const count = useCart(
    (state) =>
      Object.values(state.items).reduce((sum, n) => sum + n, 0) +
      Object.values(state.bundles).reduce((sum, n) => sum + n, 0) +
      Object.values(state.custom).reduce((sum, n) => sum + n, 0),
  );
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 hidden h-8 items-center justify-center bg-primary px-4 text-center text-xs font-medium text-primary-foreground md:flex">
        Free delivery over Rs. 3,000&nbsp; | &nbsp;Cash on Delivery nationwide&nbsp; |
        &nbsp;WhatsApp {storeConfig.phone}
      </div>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-primary/10 bg-white text-foreground transition-colors duration-300 md:top-8 ${scrolled || pathname !== "/" ? "shadow-sm" : ""}`}
      >
        <div className="flex h-16 w-full items-center justify-between px-4 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr] md:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="LEVA home"
            className="shrink-0 md:col-start-2 md:row-start-1 md:justify-self-center"
          >
            <img src={logo.url} alt="LEVA" className="h-12 w-auto object-contain md:h-[70px] lg:h-[90px]" />
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-3 md:col-start-1 md:row-start-1 md:flex lg:gap-6"
          >
            {desktopLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex min-h-11 items-center text-sm font-semibold tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
                activeProps={{ className: "border-b-2 border-current" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-1 md:col-start-3 md:row-start-1 md:flex md:justify-self-end">
            <Button asChild variant="ghost" size="icon" magnetic={false}>
              <Link to="/shop" aria-label="Search products">
                <Search />
              </Link>
            </Button>
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              magnetic={false}
              onClick={() => setCartOpen(true)}
              className="relative"
              aria-label={`Open cart with ${count} items`}
            >
              <ShoppingBag />
              {count > 0 && (
                <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-accent text-xs font-medium">
                  {count}
                </span>
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            magnetic={false}
            onClick={() => setCartOpen(true)}
            className="relative md:hidden"
            aria-label={`Open cart with ${count} items`}
          >
            <ShoppingBag />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-accent text-xs font-medium">
                {count}
              </span>
            )}
          </Button>
        </div>
      </header>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-primary/15 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-accent" : "text-foreground"}`}
            >
              <Icon className="size-5" />
              <span>{tab.label}</span>
              {tab.label === "Cart" && count > 0 && (
                <span className="absolute right-[22%] top-1 grid size-5 place-items-center rounded-full bg-accent text-xs text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <CartDrawer />
    </>
  );
}
