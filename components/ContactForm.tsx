"use client";

import { useState } from "react";

export default function ContactForm({ email: shopEmail }: { email: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Falls back to the visitor's mail app when messages aren't set up yet.
  const mailto = () => {
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${shopEmail}?subject=${encodeURIComponent(
      "Website inquiry from " + name,
    )}&body=${body}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      if (res.status === 503) {
        mailto();
        setStatus("idle");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not send your message.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send your message.");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-olive/30 bg-cream px-6 py-10 text-center">
        <h3 className="text-xl font-bold uppercase tracking-brand text-olive">
          Thanks, {name.split(" ")[0]}!
        </h3>
        <p className="mt-3 text-sm text-stone-warm">
          We got your message and will get back to you at {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name*"
        autoComplete="name"
        className="w-full rounded border border-beige bg-white px-4 py-2.5 outline-none focus:border-gold"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address*"
        autoComplete="email"
        className="w-full rounded border border-beige bg-white px-4 py-2.5 outline-none focus:border-gold"
      />
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message*"
        rows={6}
        className="w-full rounded border border-beige bg-white px-4 py-2.5 outline-none focus:border-gold"
      />
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <p className="text-xs leading-snug text-stone-warm/80">
        Your contact information will only be used for responding to your
        inquiries and providing the assistance you need. We respect your
        privacy and will not use your information for marketing purposes.
      </p>
      {error && (
        <p role="alert" className="text-sm font-semibold text-orange-dark">
          {error}{" "}
          <button type="button" onClick={mailto} className="underline">
            Send by email instead
          </button>
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-orange px-10 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
