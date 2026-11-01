"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SunburstMark from "@/components/fx/SunburstMark";

export default function SignupPopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ml-signup-seen") === "1") return;
    } catch {}
    const t = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const close = () => {
    try {
      sessionStorage.setItem("ml-signup-seen", "1");
    } catch {}
    setVisible(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(
          res.status === 503
            ? "Signups aren't open just yet. Ask in store to join the list!"
            : data.error || "Could not save your signup.",
        );
      }
      setStatus("sent");
      try {
        sessionStorage.setItem("ml-signup-seen", "1");
      } catch {}
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save your signup.");
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4">
      <div className="relative grid w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl sm:grid-cols-2">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-2 z-10 text-2xl leading-none text-stone-warm"
        >
          &times;
        </button>
        <div className="relative hidden min-h-72 sm:block">
          <Image
            src="/images/ml-pop-up-banner.jpg"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          {status === "sent" ? (
            <>
              <SunburstMark mode="intro" size={44} className="mb-3 text-gold" />
              <h3 className="text-xl font-bold uppercase text-gold">
                You&apos;re on the list!
              </h3>
              <p className="mt-3 text-sm text-stone-warm">
                Watch your phone for exclusive Marijuana Land deals.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold uppercase text-gold">
                Sign up for exclusive deals
              </h3>
              <p className="mt-2 text-sm text-stone-warm">
                Share your name and number for exclusive deals sent directly to
                your phone!
              </p>
              <form className="mt-4 space-y-3" onSubmit={submit}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name*"
                  autoComplete="name"
                  className="w-full rounded border border-beige px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number*"
                  autoComplete="tel"
                  className="w-full rounded border border-beige px-3 py-2 text-sm outline-none focus:border-gold"
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
                {error && (
                  <p role="alert" className="text-xs font-semibold text-orange-dark">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded bg-orange py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark disabled:opacity-60"
                >
                  {status === "sending" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <SunburstMark mode="spinner" size={18} />
                      Signing up…
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
              <p className="mt-3 text-[11px] leading-snug text-stone-warm/80">
                Your contact information will only be used by Marijuana Land for
                exclusive promotions and will not be shared with any 3rd party.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
