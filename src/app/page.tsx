import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Home page - Session-aware redirect
 * - Logged in users go to dashboard
 * - Not logged in users go to login
 * This ensures clicking the logo doesn't force re-login
 */
export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
