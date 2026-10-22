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

// Placeholder data until the API is connected.
const orders = [
  { no: "LEVA-10004", date: "2 Oct 2026", total: 5398, status: "Delivered" },
  { no: "LEVA-10009", date: "5 Oct 2026", total: 2499, status: "Shipped" },
  { no: "LEVA-10012", date: "7 Oct 2026", total: 7240, status: "Payment pending" },
];
const statusTone: Record<string, string> = {
  Delivered: "bg-primary text-primary-foreground",
  Shipped: "bg-accent text-accent-foreground",
  "Payment pending": "bg-secondary text-foreground",
};
type Address = { id: number; label: string; line: string; city: string };

function Account() {
  const { user, ready, init } = useAuth();
  const { tab = "orders" } = Route.useSearch();
  const navigate = useNavigate();
  const localOrders = readOrders();
  const displayOrders = localOrders.length > 0
    ? localOrders.map((o) => ({
        no: o.orderNumber,
        date: new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
        total: o.total,
        status: o.status,
      }))
    : orders;
  const initialAddress = localOrders.length > 0 && localOrders[0].address
    ? [{ id: 1, label: "Home", line: localOrders[0].address.street, city: localOrders[0].address.city }]
    : [{ id: 1, label: "Home", line: "House 12, Street 4, DHA Phase 5", city: "Lahore" }];
  const [addresses, setAddresses] = useState<Address[]>(initialAddress);
  const [editing, setEditing] = useState<Address | null>(null);
  useEffect(() => {
    void init();
  }, [init]);

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
          <ul className="divide-y divide-primary/10 rounded-2xl border border-primary/10 bg-white">
            {displayOrders.map((o) => (
              <li key={o.no} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{o.no}</p>
                  <p className="text-sm text-muted-foreground">{o.date} · {formatPKR(o.total)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[o.status] || "bg-primary text-primary-foreground"}`}>{o.status}</span>
              </li>
            ))}
          </ul>
          {localOrders.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">Sample orders shown until your account is connected.</p>
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
