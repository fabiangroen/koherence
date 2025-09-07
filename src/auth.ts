import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { v5 as uuidv5 } from "uuid";

const namespace = "6f2283ac-063e-4bfa-a476-4a9af8153c6b";
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
          role: "",
          image: profile.picture,
          ...profile,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        // User is available during sign-in
        if (profile?.sub) token.id = uuidv5(profile?.sub, namespace);
        else token.id = user.id;
        const { getUserById } = await import("./db/insertions");
        const dbUser = await getUserById(token.id as string);
        token.role = dbUser[0].role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
    async signIn({ profile }) {
      if (!profile?.email || !profile?.email_verified) return false;
      const id = profile?.sub ? uuidv5(profile?.sub, namespace) : undefined;
      const { getUserById, insertUser } = await import("./db/insertions");
      const user = await getUserById(id!);
      if (user.length === 0) {
        await insertUser(
          id!,
          profile.email,
          profile.name ?? "",
          profile.picture,
          "",
        );
        return false;
      }
      return user[0].role == "user" || user[0].role == "admin";
    },
  },
});
