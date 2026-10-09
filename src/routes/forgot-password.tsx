"use client";
import { useState } from "react";
import { createFileRoute, Link } from "@/lib/router-compat";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, FieldError } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — LEVA" },
      { name: "description", content: "Get a link to reset your LEVA account password." },
      { property: "og:title", content: "Reset Password — LEVA" },
      { property: "og:description", content: "Reset your LEVA account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = z.string().trim().email().safeParse(new FormData(e.currentTarget).get("email"));
    if (!r.success) return setError("Enter a valid email");
    setError(undefined);
    setLoading(true);
    await authApi.forgotPassword(r.data);
    setLoading(false);
    setSent(r.data);
    toast.success("Reset link sent");
  };
  return (
    <AuthShell title="Forgot password" line="We'll email you a link to reset it.">
      {sent ? (
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto size-10 text-primary" />
          <p className="text-[15px]">If an account exists for <strong className="font-medium">{sent}</strong>, a reset link is on its way.</p>
          <Button asChild variant="outline" className="h-12 w-full"><Link to="/login">Back to login</Link></Button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" className="mt-1 h-11 bg-white" />
            <FieldError msg={error} />
          </div>
          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Send reset link
          </Button>
          <p className="text-center text-sm"><Link to="/login" className="underline underline-offset-4">Back to login</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
