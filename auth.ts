import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { verifyPassword } = await import("./lib/password");

  return {
    session: {
      strategy: "jwt" as const,
    },
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const email =
            typeof credentials?.email === "string"
              ? credentials.email.trim().toLowerCase()
              : "";

          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";

          if (!email || !password) {
            return null;
          }

          const { prisma } = await import("./lib/prisma");

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            return null;
          }

          const valid = await verifyPassword(password, user.passwordHash);

          if (!valid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        },
      }),
    ],
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.email = typeof token.email === "string" ? token.email : "";
          session.user.name = typeof token.name === "string" ? token.name : "";
          (session.user as { id?: string }).id =
            typeof token.id === "string"
              ? token.id
              : typeof token.sub === "string"
              ? token.sub
              : "";
        }

        return session;
      },
    },
  };
});