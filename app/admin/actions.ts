"use server";

import { revalidatePath, updateTag } from "next/cache";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  isAuthConfigured,
  isLoggedIn,
  passwordMatches,
} from "@/lib/auth";
import {
  CONTENT_TAG,
  SITE_PATHS,
  discardDraft,
  isContentKey,
  publishAllDrafts,
  publishSection,
  undoSection,
  type ContentKey,
} from "@/lib/content";
import { deleteMessage, deleteSubscriber, setMessageRead } from "@/lib/inbox";

export type ActionState = { error?: string; ok?: string };

// Deliberately uniform failure message — never reveals whether the password
// exists or the account is configured.
const BAD_LOGIN = "Incorrect password.";
const EXPIRED = "Your session expired. Sign in again.";

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

function refreshSite() {
  updateTag(CONTENT_TAG);
  for (const p of SITE_PATHS) revalidatePath(p);
}

function readSection(formData: FormData): ContentKey | null {
  const key = String(formData.get("section") ?? "");
  return isContentKey(key) ? key : null;
}

function readPayload(key: ContentKey, formData: FormData): unknown {
  const parsed: unknown = JSON.parse(String(formData.get("payload") ?? ""));
  const expectsArray = key !== "site" && key !== "notice";
  if (expectsArray ? !Array.isArray(parsed) : typeof parsed !== "object" || !parsed) {
    throw new Error("Could not read the submitted values.");
  }
  return parsed;
}

/** Puts the submitted section on the live site. */
export async function publishContent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isLoggedIn())) return { error: EXPIRED };
  const key = readSection(formData);
  if (!key) return { error: "Unknown section." };

  try {
    await publishSection(key, readPayload(key, formData));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Publish failed." };
  }
  refreshSite();
  return { ok: "Published. The live site is updated." };
}

/** Swaps the live version of a section with the one published before it. */
export async function undoPublish(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isLoggedIn())) return { error: EXPIRED };
  const key = readSection(formData);
  if (!key) return { error: "Unknown section." };

  try {
    await undoSection(key);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Undo failed." };
  }
  refreshSite();
  redirect(`/admin?tab=${key}&undone=1`);
}

/** Throws away unpublished changes for a section. */
export async function discardChanges(formData: FormData) {
  if (!(await isLoggedIn())) return;
  const key = readSection(formData);
  if (!key) return;
  await discardDraft(key);
  redirect(`/admin?tab=${key}`);
}

function safePath(raw: unknown): string {
  const p = String(raw ?? "/");
  return p.startsWith("/") && !p.startsWith("//") ? p : "/";
}

/** From the preview bar: turn every draft live, then leave preview mode. */
export async function publishPreview(formData: FormData) {
  if (!(await isLoggedIn())) redirect("/admin/login");
  await publishAllDrafts();
  refreshSite();
  (await draftMode()).disable();
  redirect(safePath(formData.get("path")));
}

/** From the preview bar: back to the normal live site, drafts kept. */
export async function exitPreview(formData: FormData) {
  (await draftMode()).disable();
  redirect(safePath(formData.get("path")));
}

// ---- Inbox --------------------------------------------------------------

export async function markMessage(formData: FormData) {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "1";
  if (id) await setMessageRead(id, read);
  revalidatePath("/admin");
}

export async function removeMessage(formData: FormData) {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (id) await deleteMessage(id);
  revalidatePath("/admin");
}

export async function removeSubscriber(formData: FormData) {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (id) await deleteSubscriber(id);
  revalidatePath("/admin");
}
