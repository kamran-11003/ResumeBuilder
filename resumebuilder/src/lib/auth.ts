import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface User {
    id: string;
    linkedinProfile?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    linkedinProfile?: any;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle LinkedIn profile data extraction
      if (account?.provider === "linkedin" && profile) {
        // Extract LinkedIn profile data
        const linkedinProfile = {
          name: profile.name,
          email: profile.email,
          image: (profile as any).picture,
          // LinkedIn specific fields
          headline: (profile as any).headline,
          industry: (profile as any).industry,
          location: (profile as any).location,
          summary: (profile as any).summary,
        };
        
        // Store LinkedIn data in user session for later use
        user.linkedinProfile = linkedinProfile;
      }
      
      return true;
    },
    async session({ session, user, token }) {
      if (session.user && user) {
        session.user.id = user.id;
      } else if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      
      // Store LinkedIn profile data in token if available
      if (account?.provider === "linkedin" && user) {
        token.linkedinProfile = (user as any).linkedinProfile;
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 