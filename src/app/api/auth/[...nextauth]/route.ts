import NextAuth, {  DefaultSession } from 'next-auth';
import { authOptions } from 'app/api/auth/[...nextauth]/authOptions/authOptions';


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }

declare module 'next-auth' {
    interface Session extends DefaultSession {
        accessToken: string;
        idToken: string;
    }
}