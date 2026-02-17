import type { Metadata } from 'next';
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
  return children;
}
