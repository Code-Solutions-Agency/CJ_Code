"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner, Field, PrimaryButton, TextInput } from "./brand";

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setPending(true);
        const form = new FormData(event.currentTarget);
        try {
          await postJson("/api/auth/login", {
            email: form.get("email"),
            password: form.get("password"),
          });
          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not sign in");
        } finally {
          setPending(false);
        }
      }}
    >
      {error ? <Banner>{error}</Banner> : null}
      <Field label="Email">
        <TextInput name="email" type="email" autoComplete="email" required defaultValue="demo@booklane.dev" />
      </Field>
      <Field label="Password">
        <TextInput
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue="DemoPass123!"
        />
      </Field>
      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </PrimaryButton>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-accent underline-offset-2 hover:underline">
          Create a workspace
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setPending(true);
        const form = new FormData(event.currentTarget);
        try {
          await postJson("/api/auth/register", {
            name: form.get("name"),
            businessName: form.get("businessName"),
            email: form.get("email"),
            password: form.get("password"),
          });
          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not create account");
        } finally {
          setPending(false);
        }
      }}
    >
      {error ? <Banner>{error}</Banner> : null}
      <Field label="Your name">
        <TextInput name="name" required autoComplete="name" />
      </Field>
      <Field label="Business name">
        <TextInput name="businessName" required />
      </Field>
      <Field label="Email">
        <TextInput name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <TextInput name="password" type="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? "Creating workspace…" : "Create workspace"}
      </PrimaryButton>
      <p className="text-center text-sm text-muted">
        Already have one?{" "}
        <Link href="/login" className="text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
