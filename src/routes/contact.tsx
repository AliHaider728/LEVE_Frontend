"use client";
import { createFileRoute } from "@/lib/router-compat";
import { useState, type FormEvent } from "react";
import { Facebook, Instagram } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/config/store";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email.").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^((\+92)|0)3\d{2}-?\d{7}$/, "Enter a valid Pakistan mobile number."),
  message: z.string().trim().min(1, "Please enter a message.").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact LEVA Pakistan" },
      {
        name: "description",
        content: "Contact LEVA Pakistan about skincare, delivery, or your order.",
      },
      { property: "og:title", content: "Contact LEVA Pakistan" },
      { property: "og:description", content: "Send LEVA a note about skincare or your order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }
    setErrors({});
    setSent(true);
  };

  const error = (name: string) =>
    errors[name] ? (
      <span role="alert" className="mt-2 block text-sm text-destructive">
        {errors[name]}
      </span>
    ) : null;

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "tel" },
  ] as const;

  return (
    <main>
      <section className="grid min-h-svh pt-20 md:grid-cols-2 md:pt-28">
        <div className="relative min-h-[45vh] overflow-hidden bg-secondary">
          <img
            src="https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/face-wash-ritual.webp"
            alt="LEVA skincare ritual"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent" />
        </div>
        <div className="flex flex-col justify-center px-6 py-16 md:px-[7vw]">
          <p className="eyebrow mb-6">LEVA / Contact</p>
          <h1 className="text-6xl font-light md:text-8xl">A note to us.</h1>
          <p className="mt-5 max-w-sm text-base leading-8">
            A question, a thought, or simply a hello. We would love to hear from you.
          </p>
          {sent ? (
            <div role="status" className="mt-10 border-t border-primary/20 pt-7">
              <p className="text-2xl font-light">Thank you. Your note is with us.</p>
              <Button variant="link" className="mt-6" onClick={() => setSent(false)}>
                Send another →
              </Button>
            </div>
          ) : (
            <form className="mt-10 space-y-5" onSubmit={submit} noValidate>
              {fields.map(({ name, label, type }) => (
                <label key={name} className="block text-xs font-medium uppercase tracking-wider">
                  {label}
                  <input
                    name={name}
                    type={type}
                    maxLength={255}
                    aria-invalid={Boolean(errors[name])}
                    className="mt-2 min-h-12 w-full border-b border-primary/30 bg-transparent py-3 text-base normal-case outline-none focus:border-primary"
                  />
                  {error(name)}
                </label>
              ))}
              <label className="block text-xs font-medium uppercase tracking-wider">
                Message
                <textarea
                  name="message"
                  maxLength={1000}
                  rows={3}
                  aria-invalid={Boolean(errors["message"])}
                  className="mt-2 w-full resize-none border-b border-primary/30 bg-transparent py-3 text-base normal-case outline-none focus:border-primary"
                />
                {error("message")}
              </label>
              <Button type="submit">Send note →</Button>
            </form>
          )}
        </div>
      </section>

      <section className="grid gap-12 bg-primary px-6 py-20 text-primary-foreground md:grid-cols-2 md:px-[8vw]">
        <h2 className="text-5xl font-light">Elsewhere.</h2>
        <div className="grid gap-5 text-base">
          <a
            href={`mailto:${storeConfig.email}`}
            className="border-b border-primary-foreground/20 pb-4"
          >
            Email — {storeConfig.email}
          </a>
          <a
            href={`tel:${storeConfig.phone.replace(/\s/g, "")}`}
            className="border-b border-primary-foreground/20 pb-4"
          >
            Phone — {storeConfig.phone}
          </a>
          <a
            href={`https://wa.me/${storeConfig.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="border-b border-primary-foreground/20 pb-4"
          >
            WhatsApp ↗
          </a>
          <div className="flex gap-2 pt-2">
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
            <a
              href="https://www.tiktok.com/@leva.pk.official"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="grid size-11 place-items-center border border-primary-foreground/30 hover:border-white hover:bg-white/10 transition-colors"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-4.52z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
