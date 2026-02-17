import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'es'];
const defaultLocale = 'es';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/:locale/admin(.*)',
  '/:locale/dashboard(.*)',
  '/admin(.*)',
  '/dashboard(.*)'
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // First apply i18n middleware
  const intlResponse = intlMiddleware(req);
  
  // Check if route is protected and user is not authenticated
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Return the i18n response or continue
  return intlResponse || NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
