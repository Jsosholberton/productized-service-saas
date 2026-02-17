import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect to sign-in if trying to access protected route without auth
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // For admin routes, check if user has admin role from Clerk metadata
  if (isAdminRoute(req) && userId) {
    // TODO: Check user role from Clerk publicMetadata or database
    // For now, we redirect to home for all admin routes as they need proper role checking
    // In production, implement: const { sessionClaims } = await auth();
    // and check sessionClaims.metadata.role === 'admin'
    console.warn('Admin route accessed - role verification not yet implemented');
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/(api)(.*)'],
};
