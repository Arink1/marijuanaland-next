import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin");
  return <LoginForm />;
}
