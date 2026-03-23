"use server";

import { serverFetchAPI } from "@/app/libs/serverFetch";

export async function createUser(
  email: string,
  name: string,
  password: string,
  secretKey: string
) {
  const res = await serverFetchAPI<
    { message: string },
    { email: string; name: string; password: string; secretKey: string }
  >("/auth/signup", "POST", { email, name, password, secretKey });
  return res;
}
