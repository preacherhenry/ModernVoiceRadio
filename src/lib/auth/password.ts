import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}
