// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // If visiting a protected route and no token, send to homepage (/)
  if (pathname.startsWith('/todos')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If visiting home or login (public routes) but already authenticated, redirect to /todos
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/todos', request.url));
  }

  // Otherwise permit navigation
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/todos/:path*'],
};
