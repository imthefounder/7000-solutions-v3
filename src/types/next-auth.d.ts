import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      city: string | null;
      organization: string | null;
      karma_balance: number;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
    city?: string | null;
    organization?: string | null;
    karma_balance?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    city?: string | null;
    organization?: string | null;
    karma_balance?: number;
  }
}
