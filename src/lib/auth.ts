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
  // Note: PrismaAdapter is not needed for Credentials-only authentication
  // The adapter is primarily for OAuth providers that need to store accounts
  session: { strategy: "jwt" },
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
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Protect admin routes
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth.user?.role === "ADMIN";
      }

      // Protect dashboard routes
      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      // Protect API routes (except auth)
      if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
        return isLoggedIn;
      }

      return true;
    },
  },
});
