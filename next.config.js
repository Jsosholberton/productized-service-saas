const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar Turbopack en dev
  experimental: {
    turbopack: {
      // Config adicional si es necesaria
    },
  },

  // Imagen optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers de seguridad
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],

  // Redirects
  redirects: async () => [
    // Redirigir /admin sin autenticación a / (manejado por middleware)
  ],
};

module.exports = withNextIntl(nextConfig);
