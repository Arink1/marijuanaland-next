import { draftMode } from "next/headers";
import PreviewBarClient from "./PreviewBarClient";

/** Shown only while the owner is previewing unpublished changes. */
export default async function PreviewBar() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return <PreviewBarClient />;
}
