import type { ReactNode } from "react";
import logo from "@/assets/LEVA.png.asset.json";
import { products } from "@/data/products";

export function AuthShell({ title, line, children }: { title: string; line: string; children: ReactNode }) {
  return (
    <main className="px-4 pb-16 pt-24 md:px-[5vw] md:pt-36">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-primary/10 bg-white md:grid-cols-2">
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-background via-secondary to-accent/25 p-8 md:flex">
          <img src={logo.url} alt="LEVA" className="h-14 lg:h-16 w-auto self-start object-contain" />
          <img
            src={products[1]?.image}
            alt="LEVA Tinted Sunscreen"
            className="mx-auto my-6 aspect-[4/5] w-3/4 rounded-2xl object-cover"
          />
          <p className="text-sm font-light text-foreground">A softer kind of strength.</p>
        </aside>
        <section className="p-6 sm:p-10">
          <h1 className="text-3xl font-light text-foreground">{title}</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">{line}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 rounded-full bg-secondary px-4 py-2 text-center text-xs font-medium text-foreground">
            No account needed to order — guest checkout is always available.
          </p>
        </section>
      </div>
    </main>
  );
}

export function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null;
}

export const pkMobile = /^03\d{2}-?\d{7}$/;
