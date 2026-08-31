"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AgeGate() {
  const [status, setStatus] = useState<"pending" | "allowed" | "denied">(
    "allowed",
  );

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ml-age-verified") !== "1") {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  }, []);

  if (status === "allowed") return null;

  const confirm = () => {
    try {
      sessionStorage.setItem("ml-age-verified", "1");
    } catch {}
    setStatus("allowed");
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden">
      <Image
        src="/images/marijuana-land-coming-soon-bg.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-4 flex max-w-xl flex-col items-center text-center">
        <Image
          src="/images/Marijuana-Land-Badge2.gif"
          alt="Marijuana Land"
          width={120}
          height={120}
          className="mb-6"
          unoptimized
        />
        {status === "pending" ? (
          <>
            <h1 className="text-2xl font-bold uppercase tracking-brand text-gold sm:text-3xl">
              Are you older than 21?
            </h1>
            <div className="mt-6 flex gap-4">
              <button
                onClick={confirm}
                className="rounded border border-orange bg-orange px-10 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
              >
                Yes
              </button>
              <button
                onClick={() => setStatus("denied")}
                className="rounded border border-cream px-10 py-2.5 font-(family-name:--font-josefin) font-bold text-cream transition hover:bg-white/10"
              >
                No
              </button>
            </div>
            <p className="mt-6 max-w-sm text-sm text-beige">
              By clicking &quot;Yes&quot; you certify that you are of legal age
              to view and purchase cannabis products.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold uppercase tracking-brand text-gold">
              Sorry, come back soon
            </h1>
            <p className="mt-4 text-beige">
              You must be 21 or older to enter this site.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
