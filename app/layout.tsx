import type { Metadata } from "next";
import { Josefin_Sans, Cabin, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import SignupPopup from "@/components/SignupPopup";
import { site } from "@/lib/site";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});
const cabin = Cabin({ subsets: ["latin"], variable: "--font-cabin" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.tagline}. Premium flower, cartridges, edibles, pre-rolls and concentrates in Germfask, Michigan.`,
  icons: { icon: "/images/MarijuanaLand.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${josefin.variable} ${cabin.variable} ${inter.variable} antialiased`}
      >
        <AgeGate />
        <Header />
        <main>{children}</main>
        <Footer />
        <SignupPopup />
      </body>
    </html>
  );
}
