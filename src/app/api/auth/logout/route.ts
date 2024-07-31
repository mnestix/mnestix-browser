import { getServerSession } from 'next-auth';
import { authOptions } from 'authConfig';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);
    const redirectUri = process.env.KEYCLOAK_LOGOUT_REDIRECT ? process.env.KEYCLOAK_LOGOUT_REDIRECT : '';
    try {
        if (session) {
            const idToken = session.idToken;

            const url = `${process.env.KEYCLOAK_END_SESSION_URL}?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;
            
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                console.error('Failed to log out from Keycloak:', response.statusText);
                return new NextResponse('Failed to log out', { status: 500 });
            }
            
            return NextResponse.redirect(redirectUri);
        }
        
        return new NextResponse('Unauthorized', { status: 401 });
    } catch (err) {
        console.error('Error logging out:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}