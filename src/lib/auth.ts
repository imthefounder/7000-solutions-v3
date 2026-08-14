import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

// Shared NextAuth configuration (credentials provider backed by Supabase Auth).
// Imported by the route handler and by server components that call
// getServerSession() (e.g. the dashboard).
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  providers: [
    CredentialsProvider({
      id: 'supabase',
      name: 'Supabase',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) return null;

        // Fetch the user's profile (role, city, organization) to attach to the session
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, city, organization')
          .eq('id', data.user.id)
          .maybeSingle();

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name ?? data.user.email,
          role: profile?.role ?? 'user',
          city: profile?.city ?? null,
          organization: profile?.organization ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.city = user.city;
        token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? '';
        session.user.role = (token.role as string) ?? 'user';
        session.user.city = (token.city as string | null) ?? null;
        session.user.organization = (token.organization as string | null) ?? null;
      }
      return session;
    },
  },
};
