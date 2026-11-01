import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import PreviewBar from "@/components/PreviewBar";
import SignupPopup from "@/components/SignupPopup";
import { getContent } from "@/lib/content";
import { todayInShop } from "@/lib/schedule";

// The coming-soon / maintenance gate is in template.tsx next to this file.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site, notice } = await getContent();

  // The hours notice shows only while switched on, non-empty and not expired.
  const noticeActive =
    notice.enabled &&
    notice.message.trim() !== "" &&
    (!notice.until || notice.until >= todayInShop());

  return (
    <>
      <AgeGate />
      <Header site={site} notice={noticeActive ? notice.message : null} />
      <main>{children}</main>
      <Footer site={site} />
      <SignupPopup />
      <PreviewBar />
    </>
  );
}
