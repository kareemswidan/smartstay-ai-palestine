import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/lib/types";
import { getDatabase } from "./db";
import { hashPassword, randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "smartstay_session";

export async function createUser(input: { name: string; email: string; password: string; role: UserRole; phone?: string }) {
  const db = await getDatabase();
  const email = input.email.trim().toLowerCase();
  const existing = await db.prepare("SELECT id FROM ss_users WHERE email = ?").bind(email).first();
  if (existing) throw new Error("EMAIL_EXISTS");
  const salt = randomToken(16);
  const passwordHash = await hashPassword(input.password, salt);
  const result = await db.prepare("INSERT INTO ss_users (full_name, email, password_hash, password_salt, role, phone) VALUES (?, ?, ?, ?, ?, ?)").bind(input.name.trim(), email, passwordHash, salt, input.role, input.phone ?? null).run();
  return { id: Number(result.meta.last_row_id), name: input.name.trim(), email, role: input.role } satisfies SessionUser;
}

export async function verifyCredentials(email: string, password: string) {
  const db = await getDatabase();
  const row = await db.prepare("SELECT id, full_name, email, role, password_hash, password_salt FROM ss_users WHERE email = ?").bind(email.trim().toLowerCase()).first<{ id: number; full_name: string; email: string; role: UserRole; password_hash: string; password_salt: string }>();
  if (!row) return null;
  const candidate = await hashPassword(password, row.password_salt);
  if (candidate !== row.password_hash) return null;
  return { id: row.id, name: row.full_name, email: row.email, role: row.role } satisfies SessionUser;
}

export async function createSession(userId: number) {
  const db = await getDatabase();
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await db.prepare("INSERT INTO ss_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)").bind(userId, tokenHash, expiresAt).run();
  return { token, expiresAt };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDatabase();
  const tokenHash = await sha256(token);
  const user = await db.prepare(`SELECT u.id, u.full_name, u.email, u.role FROM ss_sessions s JOIN ss_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`).bind(tokenHash, new Date().toISOString()).first<{ id: number; full_name: string; email: string; role: UserRole }>();
  return user ? { id: user.id, name: user.full_name, email: user.email, role: user.role } satisfies SessionUser : null;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;
  const db = await getDatabase();
  await db.prepare("DELETE FROM ss_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

export async function requireRole(roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}
