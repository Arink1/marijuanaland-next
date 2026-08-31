import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import SignupPopup from "@/components/SignupPopup";
import { getContent } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site } = await getContent();
  return (
    <>
      <AgeGate />
      <Header site={site} />
      <main>{children}</main>
      <Footer site={site} />
      <SignupPopup />
    </>
  );
}
