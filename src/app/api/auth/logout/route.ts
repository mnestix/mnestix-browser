import { getServerSession } from 'next-auth';
import { authOptions } from 'app/api/auth/[...nextauth]/authOptions/authOptions';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (session) {
        const idToken = session.idToken

        const url = `${process.env.KEYCLOAK_END_SESSION_URL}?id_token_hint=${idToken}&post_logout_redirect_uri=${process.env.KEYCLOAK_LOGOUT_REDIRECT}`;

        try {
            return await fetch(url, { method: 'GET' });
        } catch (err) {
            console.error(err);
            return new Response();
        }
    }
    return new Response();
}