"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SignupPopup() {
  const [visible, setVisible] = useState(false);
  const [sent, setSent] = useState(false);

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
          {sent ? (
            <>
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
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <input
                  required
                  placeholder="Full Name*"
                  className="w-full rounded border border-beige px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number*"
                  className="w-full rounded border border-beige px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="w-full rounded bg-orange py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
                >
                  Sign Up
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
