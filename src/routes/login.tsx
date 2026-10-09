"use client";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@/lib/router-compat";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, FieldError } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — LEVA" },
      { name: "description", content: "Sign in to your LEVA account to see orders and wishlist." },
      { property: "og:title", content: "Login — LEVA" },
      { property: "og:description", content: "Sign in to your LEVA skincare account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      await login(r.data);
      toast.success("Welcome back");
      void navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell title="Welcome back" line="Sign in to see your orders and wishlist.">
      <form noValidate onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="mt-1 h-11 bg-white" />
          <FieldError msg={errors["email"]} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <Input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" className="h-11 bg-white pr-12" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError msg={errors["password"]} />
        </div>
        <Button type="submit" className="h-12 w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Login
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to LEVA?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
