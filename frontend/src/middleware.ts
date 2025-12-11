import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
    const isAdminLoginPage = request.nextUrl.pathname.startsWith('/admin-login');
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin') && !isAdminLoginPage;
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
    const isPublicPage = !isAdminPage && !isDashboardPage && !isAuthPage && !isAdminLoginPage;

    // Prevent admins from accessing public website - redirect to admin dashboard
    if (isPublicPage && token && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // If trying to access admin pages without token, redirect to admin login
    if (isAdminPage && !token) {
        const loginUrl = new URL('/admin-login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If trying to access admin pages with token but not admin role
    if (isAdminPage && token && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If trying to access user dashboard without token, redirect to user login
    if (isDashboardPage && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If trying to access auth pages while logged in
    if ((isAuthPage || isAdminLoginPage) && token) {
        // Redirect based on role
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/login',
        '/register',
        '/admin-login',
        '/',
        '/shop/:path*',
        '/products/:path*',
        '/cart',
        '/checkout',
        '/about',
        '/contact',
        '/blog/:path*',
    ],
};
