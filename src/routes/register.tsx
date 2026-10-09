"use client";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@/lib/router-compat";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, FieldError, pkMobile } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(pkMobile, "Use format 03XX-XXXXXXX"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters"),
  terms: z.literal("on", { message: "Please accept the terms" }),
});

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — LEVA" },
      { name: "description", content: "Create a LEVA account to track orders and save your wishlist." },
      { property: "og:title", content: "Create Account — LEVA" },
      { property: "og:description", content: "Join LEVA for faster checkout and order tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Register,
});

function Register() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const st = strength(pw);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(r.data);
      toast.success("Account created");
      void navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  const field = (id: string, label: string, type = "text", auto?: string, ph?: string) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} autoComplete={auto} placeholder={ph} className="mt-1 h-11 bg-white" />
      <FieldError msg={errors[id]} />
    </div>
  );
  return (
    <AuthShell title="Create account" line="Faster checkout and order tracking.">
      <form noValidate onSubmit={submit} className="space-y-4">
        {field("name", "Full name", "text", "name")}
        {field("phone", "Mobile", "tel", "tel", "03XX-XXXXXXX")}
        {field("email", "Email", "email", "email")}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input id="password" name="password" value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} autoComplete="new-password" className="h-11 bg-white pr-12" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {pw && (
            <div className="mt-2">
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1 rounded-full ${i < st ? "bg-primary" : "bg-secondary"}`} />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{labels[st]} — use 8+ characters, a number and a symbol.</p>
            </div>
          )}
          <FieldError msg={errors["password"]} />
        </div>
        <label className="flex min-h-11 items-start gap-3 text-sm text-foreground">
          <input type="checkbox" name="terms" className="mt-1 size-4 accent-primary" />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="underline underline-offset-4">Terms</Link> and{" "}
            <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>
        <FieldError msg={errors["terms"]} />
        <Button type="submit" className="h-12 w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Create account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
