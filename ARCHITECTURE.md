# 🏗️ Arquitectura del Sistema: Agencia de Servicios Producto

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes Principales](#componentes-principales)
5. [Base de Datos](#base-de-datos)
6. [Integraciones Externas](#integraciones-externas)
7. [Seguridad](#seguridad)
8. [Escalabilidad](#escalabilidad)

---

## Visión General

La Agencia de Servicios Producto (Productized Service) es una plataforma SaaS automatizada que automatiza el flujo completo de venta y entrega de servicios de software:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                                 │
│  (Hero + Cómo Funciona + CTA)                                   │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COTIZADOR IA (Brain)                           │
│  • User: Describe proyecto en lenguaje natural                  │
│  • AI (GPT-4o): Genera features atómicas + estimaciones         │
│  • Output: Scope + Precio                                       │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SCOPE LOCK (Protección)                            │
│  • User confirma cada feature (checkbox)                        │
│  • Acepta términos legales                                      │
│  • Sistema: Genera firma de scope                               │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│           CHECKOUT + UPSELLING                                  │
│  • Resumen de proyecto                                          │
│  • Opción: Agregar Maintenance Plan ($X/mes)                   │
│  • Total con impuestos (IVA + Retefuente)                       │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│           PASARELA WOMPI                                        │
│  • Integración Widget/Checkout                                  │
│  • Firma de integridad SHA256                                   │
│  • Múltiples métodos: PSE, CARD, NEQUI                          │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│           WEBHOOK WOMPI (transaction.updated)                   │
│  • Verifica firma                                               │
│  • Status: APPROVED/DECLINED/VOIDED                             │
│  • Si APPROVED:                                                 │
│    - Genera Blueprint técnico (AI)                              │
│    - Actualiza status proyecto → PAID                           │
│    - Envía emails (admin + client)                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│        ADMIN DASHBOARD (Desarrollo)                             │
│  • Ver proyectos en cola                                        │
│  • Leer especificaciones técnicas (Blueprint)                   │
│  • Iniciar desarrollo                                           │
│  • Estado: PENDING → IN_DEVELOPMENT → REVIEW → DELIVERED       │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│           ENTREGA (Admin)                                       │
│  • Upload archivo .zip (código fuente)                          │
│  • Pegar link video Loom/YouTube (walkthrough)                  │
│  • Sistema: Genera factura                                      │
│  • Marcar "Entregado"                                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│           EMAIL DELIVERY (Client)                               │
│  • Link descarga del proyecto                                   │
│  • Link video walkthrough                                       │
│  • Factura                                                      │
│  • Términos de mantenimiento (si aplica)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Estilos**: Tailwind CSS v4 (CSS nativo, `@theme` variables)
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **Icons**: Lucide Icons
- **Form Handling**: React Hook Form
- **Data Fetching**: React Query (opcional)

### Backend

- **Runtime**: Node.js (via Next.js)
- **Server Actions**: Next.js Server Actions (RPC calls)
- **Authentication**: Clerk (OAuth, JWT)
- **API Integrations**: OpenAI, Wompi, Resend

### Database

- **Engine**: PostgreSQL (Neon/Supabase)
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Type Safety**: Prisma TypeScript generation

### AI/LLM

- **Provider**: OpenAI (GPT-4o model)
- **SDK**: Vercel AI SDK (`ai` package)
- **Prompts**: Structured, system-guided
- **Output Format**: Zod-validated JSON

### Payments

- **Gateway**: Wompi (Colombia local)
- **Integration**: REST API + Webhooks
- **Security**: SHA256 signature verification
- **Taxes**: IVA (19%) + Retefuente (3-8%)

### Email

- **Provider**: Resend
- **Templates**: React Email (JSX-based)
- **Styling**: Inline CSS
- **Events**: Payment, delivery, notifications

### Deployment

- **Frontend/Backend**: Vercel (recommended)
- **Database**: Neon (PostgreSQL serverless)
- **CDN**: Vercel Edge Network
- **Alternative**: Self-hosted on VPS (Docker optional)

---

## Flujo de Datos

### 1. Flujo de Cotización

```
Client Input (Text)
    ↓
[VALIDATE] Min 10 chars, not empty
    ↓
Server Action: generateProjectQuote()
    ↓
OpenAI GPT-4o (structured output)
    ↓
[PARSE] Features array + total hours
    ↓
[CALCULATE] basePrice = hours × $50/h × 1.3 margin
    ↓
[CREATE] Project + Features in DB
    ↓
Return: { projectId, features[], totalPrice, summary }
```

### 2. Flujo de Scope Lock

```
User Reviews Features
    ↓
[ITERATE] User checks/unchecks features
    ↓
SE: confirmFeature(featureId) ← per feature
    ↓
[DB] Update Feature.confirmed = true
    ↓
All Features Confirmed?
    ↓ (YES)
SE: confirmScopeLock(projectId)
    ↓
[DB] Project.scopeLocked = true, scopeLockedAt = now()
    ↓
UIFlow: Show Checkout Summary
```

### 3. Flujo de Pago

```
Client Clicks "Proceder al Pago"
    ↓
Server Action: createTransaction(projectId, includeMaintenance?)
    ↓
[GENERATE] Reference: PRJ-{timestamp}-{random}
    ↓
[CALCULATE] Total = project.totalPrice + (maintenance ? 150*100 : 0)
    ↓
[CALCULATE] IVA (19%), Retefuente (3%)
    ↓
[DB] Create Transaction (status: PENDING)
    ↓
[GENERATE] Wompi Integrity Signature (SHA256)
    ↓
Redirect → Wompi Checkout Widget
    ↓
[CLIENT] Selecciona método de pago (PSE, Card, etc.)
    ↓
[WOMPI] Procesa pago
```

### 4. Flujo de Webhook

```
Wompi → POST /api/webhooks/wompi
    ↓
[VERIFY] X-Wompi-Signature con HMAC-SHA256
    ↓
[PARSE] Event: transaction.updated
    ↓
[LOOKUP] Transaction by reference
    ↓
[STATUS] Wompi: APPROVED/DECLINED/ERROR
    ↓
IF APPROVED:
    ├─ [GENERATE] Technical Blueprint (GPT-4o)
    ├─ [UPDATE] Project.status = PAID
    ├─ [CREATE] Notification
    ├─ [SEND EMAIL] Admin: "Nuevo proyecto pagado"
    └─ [SEND EMAIL] Client: "Pago confirmado"
ELSE:
    └─ [UPDATE] Transaction.wompiStatus = DECLINED/ERROR
```

### 5. Flujo de Entrega

```
Admin Dashboard → Project En Desarrollo
    ↓
Admin Sube .zip + Video URL + Carga en Storage
    ↓
SE: deliverProject(projectId, fileUrl, videoUrl)
    ↓
[GENERATE] Invoice/Receipt
    ↓
[DB] Project.status = DELIVERED, deliveredAt = now()
    ↓
[SEND EMAIL] Client:
    ├─ Link descarga (.zip)
    ├─ Link video explicativo
    ├─ Factura PDF
    └─ Términos de mantenimiento (si aplica)
```

---

## Componentes Principales

### Frontend Components

```
src/components/
├── landing/
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   └── CTA.tsx
├── quote/
│   ├── QuoteForm.tsx (textarea input)
│   ├── LoadingQuote.tsx (streaming animation)
│   └── QuoteResult.tsx (display features + price)
├── scope/
│   ├── ScopeList.tsx (features con checkboxes)
│   ├── ScopeConfirmation.tsx (legal checkbox)
│   └── ScopeLockedView.tsx
├── checkout/
│   ├── OrderSummary.tsx
│   ├── MaintenancePlanCard.tsx (upsell)
│   └── PaymentButton.tsx (Wompi redirect)
├── dashboard/
│   ├── ClientDashboard.tsx (projects list)
│   ├── AdminDashboard.tsx (dev queue)
│   └── ProjectCard.tsx
└── shared/
    ├── Navbar.tsx
    ├── Footer.tsx
    └── LoadingSpinner.tsx
```

### Server Actions

```
src/app/actions/
├── quote.ts
│   ├── generateProjectQuote()
│   ├── confirmFeature()
│   ├── confirmScopeLock()
│   └── createTransaction()
├── project.ts
│   ├── updateProjectStatus()
│   ├── deliverProject()
│   └── getProjectDetails()
└── admin.ts
    ├── getAdminProjects()
    └── uploadDeliverable()
```

### API Routes

```
src/app/api/
├── webhooks/
│   ├── wompi/route.ts (POST payment notifications)
│   └── stripe/route.ts (optional, future)
├── projects/
│   ├── [id]/route.ts (GET project)
│   └── [id]/delivery/route.ts (POST file upload)
└── admin/
    └── projects/route.ts (GET all projects)
```

### Library Functions

```
src/lib/
├── ai/
│   └── quote-engine.ts
│       ├── generateQuote()
│       └── generateTechnicalBlueprint()
├── wompi/
│   └── integrity.ts
│       ├── generateWompiSignature()
│       ├── verifyWompiWebhookSignature()
│       ├── calculateIVA()
│       ├── calculateReteFuente()
│       └── generateTransactionReference()
├── email/
│   ├── templates.tsx (React Email components)
│   └── send.ts (Resend client)
└── db.ts (Prisma client)
```

---

## Base de Datos

### Modelos Principales

**User**
- clerkId (unique)
- email
- role: CLIENT | ADMIN
- createdAt, updatedAt

**Project**
- userId → User
- title, description
- status: PENDING | PAID | IN_DEVELOPMENT | REVIEW | DELIVERED
- basePrice, totalPrice (cents)
- scopeLocked, scopeLockedAt
- deliveryFile, videoWalkthrough, deliveredAt

**Feature** (Scope)
- projectId → Project
- name, description
- estimatedHours
- confirmed (checkbox by user)

**Transaction** (Wompi)
- projectId → Project (unique)
- wompiId, reference (unique)
- amountInCents, currency
- subtotal, iva, reteFuente
- wompiStatus: PENDING | APPROVED | DECLINED | VOIDED | ERROR
- integritySignature
- approvedAt

**Subscription**
- userId → User
- projectId → Project (unique)
- type: MAINTENANCE | PRIORITY_SUPPORT
- monthlyPrice (cents)
- status: ACTIVE | PAUSED | CANCELLED
- nextBillingDate, cancellationDate

**Notification**
- userId → User
- type: QUOTE_READY | PAYMENT_SUCCESS | DEVELOPMENT_START | DELIVERY_READY
- title, message, read

---

## Integraciones Externas

### OpenAI API

**Endpoint**: `POST https://api.openai.com/v1/chat/completions`

**Uso**:
1. Quote generation (structured output)
2. Blueprint generation (markdown)

**Modelos**:
- `gpt-4o` (latest)
- `gpt-4-turbo` (fallback)

**Pricing**: ~$0.003 por 1K tokens (quote), ~$0.05 per 1K tokens (blueprint)

### Wompi API

**Endpoints**:
- `POST /v1/transactions` (create transaction)
- `GET /v1/transactions/{id}` (get status)

**Webhook**: `POST /api/webhooks/wompi`
- Event: `transaction.updated`
- Header verification: `X-Wompi-Signature` (SHA256)

**Métodos de Pago**:
- PSE (Transferencia bancaria)
- Card (Crédito/Débito)
- Nequi (Billetera digital)

### Resend Email API

**Endpoint**: `POST https://api.resend.com/emails`

**Templates**:
1. Payment confirmation
2. Project delivery
3. Admin notification
4. Maintenance reminder

**Variables**: Soporte para JSX rendering

---

## Seguridad

### Autenticación & Autorización

```typescript
// Middleware protege rutas
- /dashboard → Require userId
- /admin/* → Require userId + role == ADMIN

// Server Actions verifican auth
const { userId } = auth();
if (!userId) throw new Error('Unauthorized');

// DB queries filtran por userId
await prisma.project.findMany({
  where: { userId, user: { clerkId: userId } }
});
```

### Integridad de Pagos

```typescript
// Wompi signature verification
const calculatedSig = SHA256(rawBody + integrityKey);
if (calculatedSig !== receivedHeader) {
  throw new Error('Signature mismatch - FRAUD ALERT');
}

// Reference validation
// Reference único per transaction (race condition proof)
```

### Datos Sensibles

```
❌ NUNCA en cliente:
- WOMPI_PRIVATE_KEY
- WOMPI_INTEGRITY_KEY
- OPENAI_API_KEY
- DATABASE_URL
- CLERK_SECRET_KEY

✅ SÍ en cliente (prefixed with NEXT_PUBLIC_):
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- NEXT_PUBLIC_WOMPI_PUBLIC_KEY
- NEXT_PUBLIC_APP_URL
```

### Rate Limiting

```
(Implementar con `next-rate-limit` o similar)
- Quote generation: 10 por IP por hora
- Webhook: 100 por segundo (Wompi)
- Email: 5 por usuario por hora
```

---

## Escalabilidad

### Database

- **Neon (Serverless PostgreSQL)**: Auto-scaling, backups, replication
- **Indexes**: Crear en campos frecuentemente filtrados
  - `Project(userId, status)`
  - `Transaction(projectId, wompiStatus)`
  - `User(clerkId)`

### Cache

```
- React Query para caching de cliente
- Prisma Query Caching (opcional)
- Redis para sessions (Clerk maneja)
```

### CDN

```
- Vercel Edge Network (automático)
- Imágenes: next/image component
- ISR: Revalidate landing page cada 1 hora
```

### Async Jobs

```
(Future) Usar Bull/BullMQ para:
- Email sending (queue)
- Blueprint generation (background)
- Report generation (scheduled)
```

---

## Monitoreo & Observabilidad

```
- Sentry (error tracking)
- LogRocket (session replay, optional)
- Vercel Analytics (built-in)
- Custom logging → Supabase logs
```

---

## Roadmap Futuro

1. **v1.1**: Subscriptions recurrentes (Wompi Plans)
2. **v1.2**: Admin dashboard con gráficos (charts.js)
3. **v1.3**: Client portal mejorado (uploads, comments)
4. **v2.0**: Múltiples modelos de precios (tiered)
5. **v2.1**: Marketplace (otros devs pueden vender)
