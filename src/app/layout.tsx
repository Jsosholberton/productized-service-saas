import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agencia Productizada - Motor de Cotización IA',
  description: 'Servicios de software personalizados con cotización instantánea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className="bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
