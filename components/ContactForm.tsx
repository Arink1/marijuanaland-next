"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Static site: submit opens the visitor's mail client pre-filled.
  // Swap for a form backend (Resend / Formspree / API route) when ready.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      "Website inquiry from " + name,
    )}&body=${body}`;
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name*"
        className="w-full rounded border border-beige bg-white px-4 py-2.5 outline-none focus:border-gold"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address*"
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
      <p className="text-xs leading-snug text-stone-warm/80">
        Your contact information will only be used for responding to your
        inquiries and providing the assistance you need. We respect your
        privacy and will not use your information for marketing purposes.
      </p>
      <button
        type="submit"
        className="rounded bg-orange px-10 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
      >
        Send Message
      </button>
    </form>
  );
}
