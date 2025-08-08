import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { v5 as uuidv5 } from "uuid";

const namespace = "6f2283ac-063e-4bfa-a476-4a9af8153c6b";
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
    jwt({ token, user, profile }) {
      if (user) {
        // User is available during sign-in
        if (profile?.sub) token.id = uuidv5(profile?.sub, namespace);
        else token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
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
