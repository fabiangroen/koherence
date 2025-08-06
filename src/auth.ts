import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const admin = process.env.ADMIN?.split(",").map((email) => email.trim()) || [];
const whitelist =
  process.env.WHITELIST?.split(",").map((email) => email.trim()) || [];

declare module "next-auth" {
  interface User {
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      profile(profile) {
        return {
          role: admin.includes(profile.email) ? "admin" : "user",
          image: profile.picture,
          ...profile,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
    signIn({ profile }) {
      return (
        whitelist.includes(profile?.email ?? "") ||
        admin.includes(profile?.email ?? "")
      );
    },
  },
});
