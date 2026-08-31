"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  isAuthConfigured,
  isLoggedIn,
  passwordMatches,
} from "@/lib/auth";
import { CONTENT_KEYS, saveSection, type ContentKey } from "@/lib/content";

export type ActionState = { error?: string; ok?: string };

// Deliberately uniform failure message — never reveals whether the password
// exists or the account is configured.
const BAD_LOGIN = "Incorrect password.";

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAuthConfigured()) {
    return {
      error:
        "Admin login is not configured yet. Set ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: BAD_LOGIN };

  // small delay to blunt brute-force attempts
  await new Promise((r) => setTimeout(r, 400));

  if (!passwordMatches(password)) return { error: BAD_LOGIN };

  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function saveContent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isLoggedIn())) return { error: "Your session expired. Sign in again." };

  const key = String(formData.get("section") ?? "") as ContentKey;
  if (!(CONTENT_KEYS as readonly string[]).includes(key)) {
    return { error: "Unknown section." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Could not read the submitted values." };
  }

  try {
    await saveSection(key, parsed);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed." };
  }

  // refresh every page that renders this content
  for (const p of ["/", "/shop", "/faq", "/about-us", "/contact", "/gallery"]) {
    revalidatePath(p);
  }

  return { ok: "Saved. The live site is updated." };
}
