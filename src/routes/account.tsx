"use client";
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@/lib/router-compat";
import { z } from "zod";
import { toast } from "sonner";
import { WishlistContents } from "@/app/wishlist/view";
import { readOrders } from "@/lib/orders";
import { formatPKR } from "@/config/store";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, PackageCheck, Loader2 } from "lucide-react";

const tabs = ["orders", "addresses", "wishlist", "profile"] as const;
type Tab = (typeof tabs)[number];

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    tabs.includes(s['tab'] as Tab) ? { tab: s['tab'] as Tab } : {},
  head: () => ({
    meta: [
      { title: "My Account — LEVA" },
      { name: "description", content: "Your LEVA orders, addresses, wishlist and profile." },
      { property: "og:title", content: "My Account — LEVA" },
      { property: "og:description", content: "Manage your LEVA orders and details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

const statusTone: Record<string, string> = {
  Delivered: "bg-emerald-600 text-white",
  Shipped: "bg-blue-600 text-white",
  "Order Confirmed": "bg-[#673742] text-white",
  Processing: "bg-[#673742] text-white",
  Pending: "bg-amber-600 text-white",
  "Order placed": "bg-amber-600 text-white",
  "Payment pending": "bg-secondary text-foreground",
};

type Address = { id: number; label: string; line: string; city: string };

interface AccountOrder {
  no: string;
  date: string;
  total: number;
  status: string;
}

function Account() {
  const { user, ready, init } = useAuth();
  const { tab = "orders" } = Route.useSearch();
  const navigate = useNavigate();

  const [customerOrders, setCustomerOrders] = useState<AccountOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const initialAddress: Address[] = [
    { id: 1, label: "Home", line: "House 12, Street 4, DHA Phase 5", city: "Lahore" }
  ];
  const [addresses, setAddresses] = useState<Address[]>(initialAddress);
  const [editing, setEditing] = useState<Address | null>(null);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    let mounted = true;
    async function loadUserOrders() {
      setLoadingOrders(true);
      try {
        // Read local orders placed in this browser
        const local = readOrders();
        const localFormatted: AccountOrder[] = local.map((o) => ({
          no: o.orderNumber,
          date: new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
          total: o.total,
          status: o.status === "Payment pending verification" ? "Payment pending" : "Order placed",
        }));

        if (local.length > 0 && local[0].address) {
          setAddresses([
            { id: 1, label: "Delivery Address", line: local[0].address.street, city: local[0].address.city }
          ]);
        }

        // Fetch remote authenticated orders from backend
        const res = await fetch("/api/store/orders", {
          headers: { Accept: "application/json", "X-Leva-Storefront": "1" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const remoteList = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : []);
          const remoteFormatted: AccountOrder[] = remoteList.map((o: any) => ({
            no: o.orderId || o.orderNumber || o.id,
            date: o.date
              ? new Date(o.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
              : (o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "Recent"),
            total: Number(o.total || 0),
            status: o.status === "Processing" ? "Order Confirmed" : (o.status || "Pending"),
          }));

          // Merge without duplicates
          const seen = new Set<string>();
          const merged: AccountOrder[] = [];
          for (const ord of [...remoteFormatted, ...localFormatted]) {
            if (ord.no && !seen.has(ord.no)) {
              seen.add(ord.no);
              merged.push(ord);
            }
          }
          if (mounted) setCustomerOrders(merged);
        } else {
          if (mounted) setCustomerOrders(localFormatted);
        }
      } catch {
        const local = readOrders();
        if (mounted) {
          setCustomerOrders(local.map((o) => ({
            no: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
            total: o.total,
            status: o.status,
          })));
        }
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    }

    if (ready && user) {
      void loadUserOrders();
    } else {
      setLoadingOrders(false);
    }

    return () => {
      mounted = false;
    };
  }, [ready, user]);

  if (!ready) return <main className="min-h-[60vh] pt-40" />;
  if (!user)
    return (
      <main className="mx-auto max-w-md px-5 pb-20 pt-32 text-center md:pt-44">
        <h1 className="text-3xl font-light">Your account</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Login to see orders and addresses. Your saved essentials are available without an account.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild className="h-12"><Link to="/login">Login</Link></Button>
          <Button asChild variant="outline" className="h-12"><Link to="/register">Register</Link></Button>
        </div>
        <Link to="/wishlist" className="mt-5 inline-flex min-h-11 items-center text-sm underline">View your wishlist</Link>
      </main>
    );

  const saveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = z
      .object({ label: z.string().trim().min(1), line: z.string().trim().min(5), city: z.string().trim().min(2) })
      .safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      toast.error("Please fill label, address and city");
      return;
    }
    setAddresses((list) =>
      editing && editing.id ? list.map((a) => (a.id === editing.id ? { ...a, ...r.data } : a)) : [...list, { id: Date.now(), ...r.data }],
    );
    setEditing(null);
    toast.success("Address saved");
  };

  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-28 md:pt-40">
      <p className="eyebrow">My account</p>
      <h1 className="mt-1 text-3xl font-light">Hi, {user.name}</h1>
      <Tabs value={tab} onValueChange={(v) => navigate({ to: "/account", search: { tab: v as Tab }, replace: true })} className="mt-6">
        <TabsList className="h-auto w-full justify-start overflow-x-auto bg-secondary p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="min-h-10 capitalize data-[state=active]:bg-white">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          {loadingOrders ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              <span>Loading your orders…</span>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="rounded-2xl border border-primary/10 bg-secondary/20 p-8 text-center sm:p-12">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="size-7" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">No orders placed yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                When you place an order with LEVA, you will be able to view its live status, timeline and history right here.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild className="h-11 px-6">
                  <Link to="/shop">Shop Products</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 px-6">
                  <Link to="/track-order">Track an Order</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-primary/10 rounded-2xl border border-primary/10 bg-white">
              {customerOrders.map((o) => (
                <li key={o.no} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                  <div>
                    <p className="font-semibold text-foreground tracking-tight">{o.no}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{o.date} · {formatPKR(o.total)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[o.status] || "bg-primary text-primary-foreground"}`}>
                      {o.status}
                    </span>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium">
                      <Link to="/track-order" search={{ order: o.no }}>Track</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-5 space-y-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-2xl border border-primary/10 bg-white p-4">
                <p className="font-medium">{a.label}</p>
                <p className="text-sm text-muted-foreground">{a.line}, {a.city}</p>
                <Button variant="link" className="mt-1 h-auto p-0" onClick={() => setEditing(a)}>Edit</Button>
              </li>
            ))}
          </ul>
          {editing ? (
            <form key={editing.id} onSubmit={saveAddress} className="grid gap-3 rounded-2xl border border-primary/10 bg-white p-4 sm:grid-cols-3">
              {(["label", "line", "city"] as const).map((k) => (
                <div key={k} className={k === "line" ? "sm:col-span-3" : ""}>
                  <Label htmlFor={k}>{k === "line" ? "Address" : k === "label" ? "Label" : "City"}</Label>
                  <Input id={k} name={k} defaultValue={editing[k]} className="mt-1 h-11 bg-white" />
                </div>
              ))}
              <div className="flex gap-2 sm:col-span-3">
                <Button type="submit" className="h-11">Save address</Button>
                <Button type="button" variant="outline" className="h-11" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" className="h-11" onClick={() => setEditing({ id: 0, label: "", line: "", city: "" })}>Add address</Button>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-5">
          <WishlistContents compact/>
        </TabsContent>

        <TabsContent value="profile" className="mt-5">
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }} className="grid max-w-md gap-3 rounded-2xl border border-primary/10 bg-white p-4">
            <div><Label htmlFor="pname">Full name</Label><Input id="pname" defaultValue={user.name} className="mt-1 h-11 bg-white" /></div>
            <div><Label htmlFor="pemail">Email</Label><Input id="pemail" type="email" defaultValue={user.email} className="mt-1 h-11 bg-white" /></div>
            <div><Label htmlFor="pphone">Mobile</Label><Input id="pphone" defaultValue={user.phone ?? ""} placeholder="03XX-XXXXXXX" className="mt-1 h-11 bg-white" /></div>
            <Button type="submit" className="h-11 w-fit">Save changes</Button>
          </form>
        </TabsContent>
      </Tabs>
    </main>
  );
}