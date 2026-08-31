import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ml_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Hash format stored in ADMIN_PASSWORD_HASH: "<saltHex>:<hashHex>" */
export function hashPassword(password: string, salt = randomBytes(16)) {
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
    return safeEqual(hash.toString("hex"), hashHex);
  } catch {
    return false;
  }
}

export function isAuthConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET,
  );
}

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

function makeToken() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  return `${expires}.${sign(expires)}`;
}

function tokenValid(token: string | undefined) {
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  if (!safeEqual(sign(expires), sig)) return false;
  return Number(expires) > Date.now();
}

export async function createSession() {
  const store = await cookies();
  store.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isLoggedIn() {
  if (!isAuthConfigured()) return false;
  const store = await cookies();
  return tokenValid(store.get(COOKIE)?.value);
}

/** Checks the submitted password against ADMIN_PASSWORD_HASH. */
export function passwordMatches(password: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  return verifyPassword(password, stored);
}
