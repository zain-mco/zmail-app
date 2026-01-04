import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

/**
 * Login Page - Server Component
 * 
 * OWASP Session Management:
 * - If user is already logged in, redirect to dashboard
 * - Prevents multiple account logins per browser
 * - Shows session expired message if applicable
 */
export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;

    // If already logged in, redirect to dashboard
    // This prevents logging into multiple accounts
    if (session?.user) {
        redirect("/dashboard");
    }

    // Check if session expired
    const sessionExpired = params.reason === "expired";

    return <LoginForm sessionExpired={sessionExpired} />;
}

