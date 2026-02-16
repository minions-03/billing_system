import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public routes - no auth needed
    const publicPaths = ['/', '/login', '/api/auth'];
    if (publicPaths.some(path => pathname === path)) {
        return NextResponse.next();
    }

    // Allow API routes (they handle their own auth if needed)
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Check for auth token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
