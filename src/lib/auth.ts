import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "ADMIN" | "TEAM";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: "ADMIN" | "TEAM";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "ADMIN" | "TEAM";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Session configuration - OWASP compliant
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours absolute session lifetime
    updateAge: 30 * 60, // Refresh token every 30 minutes
  },
  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true, // Prevent XSS access
        sameSite: "lax", // CSRF protection
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
    // Note: Route protection is handled by middleware.ts
    // Do not use authorized callback here as it conflicts with middleware
  },
});

