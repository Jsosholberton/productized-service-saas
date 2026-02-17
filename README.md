# 🚀 Agencia de Servicios Producto (SaaS)

**Motor de Cotización IA + Pagos Wompi + Next.js 15 + PostgreSQL**

Una plataforma SaaS productizada para automatizar el proceso de venta, cotización y entrega de servicios de software personalizados con scope lock garantizado.

## 📋 Características Principales

- ✅ **Motor de Cotización con IA** - Analiza descripción en lenguaje natural y genera features atómicas con precios
- ✅ **Scope Lock Legal** - Usuario confirma cada feature antes de pagar (1 revisión incluida)
- ✅ **Integración Wompi** - Pasarela de pagos para Colombia con cálculo de impuestos (IVA/Retefuente)
- ✅ **Upselling Automático** - Ofrece plan de mantenimiento mensual antes del pago
- ✅ **Webhook Seguro** - Validación de firma SHA256, cambio automático de status
- ✅ **PRD Generado por IA** - Al confirmar pago, genera especificación técnica detallada
- ✅ **Admin Dashboard** - Panel para subir entrega (.zip + video walkthrough)
- ✅ **Autenticación Clerk** - Manejo de roles (Cliente/Admin)
- ✅ **Email con Resend** - Templates para confirmación y entrega

## 🛠 Tech Stack

| Capa | Tecnología | Versión |
|------|-----------|----------|
| **Frontend** | Next.js App Router | 15 |
| **Styling** | Tailwind CSS v4 + CSS Variables | 4.0.0 |
| **UI Components** | Shadcn/UI + Radix UI + Lucide Icons | Latest |
| **Backend** | Node.js + Server Actions | Next.js 15 |
| **Database** | PostgreSQL + Prisma ORM | 5.8.0 |
| **AI** | Vercel AI SDK + OpenAI GPT-4o | Latest |
| **Auth** | Clerk | 6.3.1 |
| **Payments** | Wompi (Colombia) | API v1 |
| **Email** | Resend + React Email | Latest |
| **Infrastructure** | Vercel / Self-hosted | - |

## 📁 Estructura del Proyecto

```
.
├── prisma/
│   └── schema.prisma          # Esquema de BD (User, Project, Feature, Transaction, Subscription)
├── src/
│   ├── actions/
│   │   ├── quotation.ts       # Motor IA de cotización
│   │   ├── payment.ts         # Creación de sesión de pago
│   │   └── delivery.ts        # Generación de PRD y entrega
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/wompi/route.ts  # Webhook handler
│   │   ├── layout.tsx         # Root layout con Clerk
│   │   ├── globals.css        # Tailwind v4 + CSS variables
│   │   ├── page.tsx           # Landing page (hero + cómo funciona)
│   │   ├── quotation/
│   │   │   └── page.tsx       # Página de cotización
│   │   ├── checkout/
│   │   │   └── page.tsx       # Resumen y upselling antes de Wompi
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Cliente: lista de proyectos
│   │   │   └── projects/[id]/page.tsx  # Detalle del proyecto
│   │   └── admin/
│   │       ├── page.tsx       # Admin: cola de desarrollo
│   │       └── projects/[id]/page.tsx  # Subir entrega (zip + video)
│   ├── components/
│   │   ├── QuotationForm.tsx  # Formulario de cotización (client)
│   │   ├── ScopeLockForm.tsx  # Confirmación de features (client)
│   │   └── PaymentSummary.tsx # Resumen antes de pagar
│   └── lib/
│       ├── db.ts              # Prisma singleton
│       └── wompi.ts           # Utilidades Wompi (firma, validación)
├── .env.example               # Variables de entorno
├── package.json               # Dependencias
├── tsconfig.json              # Configuración TypeScript
└── next.config.js             # Configuración Next.js
```

## 🚀 Instalación y Setup

### 1. Clonar y Instalar

```bash
git clone https://github.com/Jsosholberton/productized-service-saas.git
cd productized-service-saas
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y llena todos los valores:

```bash
cp .env.example .env.local
```

**Variables requeridas:**

```env
# DATABASE (Neon o Supabase)
DATABASE_URL="postgresql://user:password@host:5432/db"

# CLERK (Autenticación)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# OPENAI (Motor IA)
OPENAI_API_KEY=...

# WOMPI (Pagos)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=...
WOMPI_PRIVATE_KEY=...
WOMPI_INTEGRITY_KEY=...

# RESEND (Email)
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Crear Base de Datos

```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# Abrir Prisma Studio
npx prisma studio
```

### 4. Obtener Keys de Servicios Externos

#### 🔐 Clerk
1. Ve a [dashboard.clerk.com](https://dashboard.clerk.com)
2. Crea una aplicación
3. Copia `Publishable Key` y `Secret Key`

#### 🤖 OpenAI
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una API Key
3. Asegúrate que `gpt-4o` esté disponible en tu cuenta

#### 💳 Wompi
1. Ve a [wompi.co](https://wompi.co) y crea cuenta
2. Accede a Panel > Configuración > Desarrolladores
3. Copia `Public Key`, `Private Key` e `Integrity Key`
4. Configura webhook URL: `https://tudominio.com/api/webhooks/wompi`

#### 📧 Resend
1. Ve a [resend.com](https://resend.com)
2. Crea API Key
3. Verifica tu dominio

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📊 Flujo de Negocio

### 1️⃣ Landing Page
- Hero section: "Software personalizado en minutos"
- Sección "Cómo funciona" (3 pasos)
- CTA: "Obtener cotización"

### 2️⃣ Formulario de Cotización
- Usuario describe proyecto en lenguaje natural
- IA analiza y genera features atómicas
- Calcula precio base: `(horas estimadas) × $50/h`
- Muestra: título, features, precio estimado

### 3️⃣ Scope Lock (Protección contra cambios)
- Usuario confirma cada feature con checkbox
- Ve descripciones, complejidad, horas estimadas
- **Requisito legal:** Checkbox final: "Entiendo que el diseño tiene 1 revisión incluida"
- Una vez confirmado, pasa a checkout

### 4️⃣ Checkout con Upselling
- Resumen del proyecto
- Oferta: "Agrega Maintenance Plan $X/mes" (hosting + bugs + 1 cambio menor)
- Si acepta: total = setup fee + primer mes
- Cálculo de impuestos: `(subtotal × 0.19) + impuestos DIAN`

### 5️⃣ Pasarela Wompi
- Genera `wompiReference` único
- Calcula `signature = SHA256(reference + amount + integrityKey)`
- Redirige a checkout Wompi
- Usuario paga via PSE, tarjeta, etc.

### 6️⃣ Webhook de Confirmación
- Wompi envía webhook con status: `APPROVED` / `DECLINED` / `PENDING`
- **Validación obligatoria:** verifica firma HMAC-SHA256
- Si `APPROVED`:
  - Actualiza `Project.status = PAYMENT_APPROVED`
  - Genera PRD técnico con IA
  - Proyecto entra a cola de desarrollo
  - Envía email de confirmación

### 7️⃣ Admin Dashboard
- Panel muestra proyectos: `PENDING_PAYMENT` → `IN_QUEUE` → `IN_DEVELOPMENT` → `DELIVERED`
- Admin cambia a `IN_DEVELOPMENT` cuando inicia desarrollo
- Al terminar, sube:
  - Archivo `.zip` con código/assets
  - Link de Loom/YouTube (video walkthrough)
- Cambiar a `DELIVERED` dispara email con descarga + video

### 8️⃣ Cliente Recibe Proyecto
- Email con:
  - Link para descargar `.zip`
  - Video walkthrough explicativo
  - Factura
- Si tiene suscripción, comienza el ciclo mensual

## 🔐 Seguridad

### Validación de Webhooks Wompi

```typescript
// El webhook DEBE ser validado antes de procesar
const isValid = validateWompiWebhookSignature(
  body,
  signatureHeader,
  integrityKey
);

if (!isValid) return 401; // Rechazar
```

### Protección de Rutas Admin

```typescript
// Middleware en src/middleware.ts
import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';

export default withClerkMiddleware(async (req) => {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { userId } = getAuth(req);
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });
    if (user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });
  }
});
```

### SQL Injection / ORM Safety

- Usa Prisma: queries tipadas, parametrizadas automáticamente
- **NUNCA** concatenes SQL crudo

## 💰 Pricing & Tax Calculation

### Fórmula Base

```
BasePrice = EstimatedHours × $50/h
IVA = BasePrice × 0.19 (IVA Colombia)
Total = BasePrice + IVA
```

### Ejemplo

```
Feature "Dashboard": 12h → 12 × $50 = $600
Feature "API REST": 20h → 20 × $50 = $1,000
Total: $1,600

IVA: $1,600 × 0.19 = $304
A pagar: $1,904 (COP: ~$7.6M a tasa 2026)
```

## 📧 Email Templates (Resend)

### 1. Confirmación de Cotización

```jsx
// src/emails/QuotationEmail.tsx
import { Html, Button } from 'react-email';

export function QuotationEmail({ project, checkoutUrl }) {
  return (
    <Html>
      <h1>{project.title}</h1>
      <p>Tu cotización está lista!</p>
      <p>Total: ${project.basePrice}</p>
      <Button href={checkoutUrl}>Confirmar Scope</Button>
    </Html>
  );
}
```

### 2. Pago Confirmado

```jsx
export function PaymentConfirmedEmail({ project }) {
  return (
    <Html>
      <h1>¡Pago Recibido!</h1>
      <p>{project.title} está en la cola de desarrollo.</p>
      <p>Recibirás actualizaciones en tu dashboard.</p>
    </Html>
  );
}
```

### 3. Proyecto Entregado

```jsx
export function DeliveryEmail({ project, downloadUrl, videoUrl }) {
  return (
    <Html>
      <h1>Tu proyecto está listo!</h1>
      <Button href={downloadUrl}>Descargar Proyecto (.zip)</Button>
      <Button href={videoUrl}>Ver Video Explicativo</Button>
    </Html>
  );
}
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Conectar repositorio a Vercel
# Set environment variables en Vercel dashboard
# Deploy automático en cada push a main
```

### Self-Hosted (Node.js)

```bash
# Build
npm run build

# Start
npm start

# Con PM2
pm2 start "npm start" --name agencia-saas
```

## 📝 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/webhooks/wompi` | POST | Webhook de Wompi (validación + procesamiento) |
| `/quotation` | GET | Página del cotizador |
| `/checkout` | GET | Página de resumen antes de Wompi |
| `/dashboard` | GET | Dashboard del cliente |
| `/admin` | GET | Dashboard del admin (protegido) |

## 🧪 Testing

### Test de Cotización IA

```bash
# Terminal
curl -X POST http://localhost:3000/api/quotation \
  -H "Content-Type: application/json" \
  -d '{"description": "Quiero un app de tareas con autenticación"}'
```

### Test de Webhook Wompi

```bash
# Usar ngrok para tunneling local
ngrok http 3000

# En Wompi: Set webhook a https://xxx.ngrok.io/api/webhooks/wompi

# Hacer transacción de test en Wompi
```

## 📚 Documentación Externa

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Clerk Auth](https://clerk.com/docs)
- [Wompi API](https://docs.wompi.sv)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Tailwind CSS v4](https://tailwindcss.com)

## 🤝 Contribuir

1. Fork el repo
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT - Ver `LICENSE` para detalles

## ✨ Roadmap

- [ ] Admin: Generación de factura PDF
- [ ] Cliente: Seguimiento en tiempo real del desarrollo
- [ ] Sistema de revisiones ilimitadas (add-on)
- [ ] Plantillas de proyectos predefinidas
- [ ] Analytics dashboard (ingresos, proyectos)
- [ ] Integración Slack para notificaciones
- [ ] Multi-idioma (ES, EN)
- [ ] Soporte para otros gateways (Stripe, PayU)

## 📞 Soporte

Para reportar bugs o sugerencias: [issues](https://github.com/Jsosholberton/productized-service-saas/issues)

---

**Construido con ❤️ en Cali, Colombia**
