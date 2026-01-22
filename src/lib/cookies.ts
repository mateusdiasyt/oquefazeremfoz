import { cookies } from "next/headers";
export function isAdmin() {
  return cookies().get("role")?.value === "admin";
}

