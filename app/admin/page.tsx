import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getContent, isStoreConfigured } from "@/lib/content";
import AdminDashboard from "@/components/admin/AdminDashboard";

// Always reflect the latest saved content for the owner.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const content = await getContent();
  return (
    <AdminDashboard content={content} storeReady={isStoreConfigured()} />
  );
}
