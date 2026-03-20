import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    // Check if Basic Auth is enabled via environment variables
    const basicAuthUser = process.env.BASIC_AUTH_USER;
    const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

    // If credentials are not set, skip authentication (e.g. local dev or unsecured)
    if (!basicAuthUser || !basicAuthPassword) {
        return NextResponse.next();
    }

    // Check for Authorization header
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        if (user === basicAuthUser && pwd === basicAuthPassword) {
            return NextResponse.next();
        }
    }

    // Return 401 if no auth or invalid auth
    return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
}
