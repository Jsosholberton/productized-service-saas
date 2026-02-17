import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export default withClerkMiddleware(async (req: NextRequest) => {
  const { userId } = getAuth(req);

  // Si intenta acceder a /admin, validar que sea admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      console.error('Error en middleware:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Si intenta acceder a /dashboard, debe estar autenticado
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/(api)(.*)'],
};
