# 💻 Ejemplos de Integración - Sistema Tributario

Ejemplos de código para integrar el sistema tributario en diferentes partes de tu aplicación.

---

## 1. Mostrar Desglose de Precios en Checkout

### Uso básico

```typescript
// pages/checkout.tsx
import { TaxBreakdown } from '@/components/checkout/TaxBreakdown';
import { calculatePriceWithTaxes } from '@/lib/wompi/pricing';

export default function CheckoutPage({ quote }: { quote: Quote }) {
  const { subtotal, iva, reteFuente, total } = calculatePriceWithTaxes(quote.basePrice);

  return (
    <div className="space-y-6">
      {/* ... otros elementos del checkout ... */}

      <TaxBreakdown
        basePrice={quote.basePrice}
        lineItems={[
          {
            label: 'Desarrollo de app',
            amount: quote.basePrice,
            percentage: 0,
          },
          // Opcionalmente agregar otros items
        ]}
        totalPrice={total}
        taxRegime="PERSONA_NATURAL"
        showDetails={true}
      />

      {/* ... botón de pago ... */}
    </div>
  );
}
```

### Con cálculo dinámico

```typescript
// components/checkout/DynamicCheckout.tsx
import { TaxBreakdown } from '@/components/checkout/TaxBreakdown';
import { getActiveTaxConfig, calculatePriceWithTaxes } from '@/lib/config/tax-config';

export function DynamicCheckout({ basePrice }: { basePrice: number }) {
  const config = getActiveTaxConfig();
  const calculation = calculatePriceWithTaxes(basePrice);

  const lineItems = [
    {
      label: 'Servicio profesional',
      amount: basePrice,
    },
  ];

  // Agregar impuestos como line items si es Persona Jurídica
  if (config.ivaRate > 0) {
    lineItems.push({
      label: `IVA (${(config.ivaRate * 100).toFixed(0)}%)`,
      amount: calculation.iva,
      percentage: config.ivaRate * 100,
    });
  }

  if (config.reteFuenteRate > 0) {
    lineItems.push({
      label: `Retefuente (${(config.reteFuenteRate * 100).toFixed(0)}%)`,
      amount: -calculation.reteFuente,
      percentage: -(config.reteFuenteRate * 100),
    });
  }

  return (
    <TaxBreakdown
      basePrice={basePrice}
      lineItems={lineItems}
      totalPrice={calculation.total}
      taxRegime={config.regime}
      showDetails={true}
    />
  );
}
```

---

## 2. Integrar en Admin Dashboard

### Instalación básica

```typescript
// app/admin/settings/tax/page.tsx
import { TaxConfigAdmin } from '@/components/admin/TaxConfigAdmin';
import { requireAuth } from '@/lib/auth';
import { requireAdmin } from '@/lib/auth/permissions';

export default async function TaxAdminPage() {
  // Verificar permisos
  const user = await requireAuth();
  await requireAdmin(user.id);

  return (
    <div className="container mx-auto py-8">
      <TaxConfigAdmin />
    </div>
  );
}
```

### Con layout personalizado

```typescript
// app/admin/layout.tsx
import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## 3. Crear Facturas con Validación Tributaria

### Función para generar factura

```typescript
// lib/invoicing/generateInvoice.ts
import { getActiveTaxConfig, validateInvoiceData } from '@/lib/config/tax-config';
import { calculatePriceWithTaxes } from '@/lib/wompi/pricing';

interface InvoiceInput {
  clientName: string;
  clientCedula: string;
  clientEmail: string;
  description: string;
  basePrice: number; // en centavos
  dueDate?: Date;
}

export async function generateInvoice(input: InvoiceInput) {
  const config = getActiveTaxConfig();

  // Validar datos según régimen tributario
  const validation = validateInvoiceData({
    cedula: input.clientCedula,
    nit: config.regime === 'PERSONA_JURIDICA' ? input.clientNit : undefined,
    email: input.clientEmail,
    amount: input.basePrice,
  });

  if (!validation.valid) {
    throw new Error(`Invoice validation failed: ${validation.errors.join(', ')}`);
  }

  // Calcular precios con impuestos
  const pricing = calculatePriceWithTaxes(input.basePrice);

  // Generar factura
  const invoice = {
    id: generateInvoiceId(),
    number: generateInvoiceNumber(config),
    clientName: input.clientName,
    clientCedula: input.clientCedula,
    clientEmail: input.clientEmail,
    description: input.description,
    subtotal: pricing.subtotal,
    iva: pricing.iva,
    reteFuente: pricing.reteFuente,
    total: pricing.total,
    taxRegime: config.regime,
    nit: config.regime === 'PERSONA_JURIDICA' ? config.nit : null,
    dianResolution: config.dianResolution,
    issuedAt: new Date(),
    dueDate: input.dueDate || addDays(new Date(), 30),
  };

  // Guardar en BD
  await db.invoice.create({
    data: invoice,
  });

  // Enviar por email
  await sendInvoiceEmail(input.clientEmail, invoice);

  return invoice;
}
```

### Validación de factura antes de generar

```typescript
// Usar en formulario de factura
import { validateInvoiceData } from '@/lib/config/tax-config';

export function useInvoiceValidation() {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (data: InvoiceFormData) => {
    const validation = validateInvoiceData({
      cedula: data.cedula,
      nit: data.nit,
      email: data.email,
      amount: data.amount,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors([]);
    return true;
  };

  return { validate, errors };
}
```

---

## 4. Obtener Configuración Activa en Componentes

### Hook personalizado

```typescript
// hooks/useTaxConfig.ts
import { useEffect, useState } from 'react';
import { getActiveTaxConfig, type TaxConfig } from '@/lib/config/tax-config';

export function useTaxConfig() {
  const [config, setConfig] = useState<TaxConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const activeConfig = getActiveTaxConfig();
      setConfig(activeConfig);
    } catch (error) {
      console.error('Error loading tax config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { config, loading };
}

// Uso en componente
function MyComponent() {
  const { config, loading } = useTaxConfig();

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <div>
      <p>Régimen actual: {config?.regime}</p>
      <p>IVA: {(config?.ivaRate ?? 0) * 100}%</p>
    </div>
  );
}
```

---

## 5. Mostrar Información en Presupuesto

### Componente de resumen tributario

```typescript
// components/quote/TaxInfoBadge.tsx
import { getActiveTaxConfig } from '@/lib/config/tax-config';

export function TaxInfoBadge() {
  const config = getActiveTaxConfig();
  const isTaxed = config.ivaRate > 0 || config.reteFuenteRate > 0;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm">
      {isTaxed ? (
        <>
          <span className="text-blue-600 font-semibold">⚠️ Con impuestos</span>
          <span className="text-xs text-blue-500">
            IVA {(config.ivaRate * 100).toFixed(0)}% + Refe {(config.reteFuenteRate * 100).toFixed(0)}%
          </span>
        </>
      ) : (
        <>
          <span className="text-green-600 font-semibold">✓ Sin impuestos</span>
          <span className="text-xs text-green-500">Precio neto</span>
        </>
      )}
    </div>
  );
}
```

### En la página de presupuesto

```typescript
// app/quotes/[id]/page.tsx
import { TaxInfoBadge } from '@/components/quote/TaxInfoBadge';

export default function QuotePage({ params }: { params: { id: string } }) {
  const quote = getQuote(params.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>Presupuesto #{quote.number}</h1>
        <TaxInfoBadge />
      </div>

      {/* ... resto del contenido ... */}
    </div>
  );
}
```

---

## 6. Enviar Factura por Email

### Template de email

```typescript
// templates/invoice-email.tsx
import { getActiveTaxConfig } from '@/lib/config/tax-config';
import { formatPrice } from '@/lib/wompi/pricing';

interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  total: number;
  iva: number;
  reteFuente: number;
}

export function InvoiceEmailTemplate({
  clientName,
  invoiceNumber,
  amount,
  total,
  iva,
  reteFuente,
}: InvoiceEmailProps) {
  const config = getActiveTaxConfig();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #0f172a; color: white; padding: 20px; }
          .invoice { margin: 20px 0; }
          .line-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Factura #${invoiceNumber}</h1>
            <p>Para: ${clientName}</p>
          </div>

          <div class="invoice">
            <div class="line-item">
              <span>Subtotal</span>
              <span>${formatPrice(amount)}</span>
            </div>
            ${iva > 0 ? `
            <div class="line-item">
              <span>IVA (${(config.ivaRate * 100).toFixed(0)}%)</span>
              <span>+ ${formatPrice(iva)}</span>
            </div>
            ` : ''}
            ${reteFuente > 0 ? `
            <div class="line-item">
              <span>Retefuente (${(config.reteFuenteRate * 100).toFixed(0)}%)</span>
              <span>- ${formatPrice(reteFuente)}</span>
            </div>
            ` : ''}
            <div class="line-item total">
              <span>TOTAL A PAGAR</span>
              <span>${formatPrice(total)}</span>
            </div>
          </div>

          <p>Gracias por tu confianza.</p>
        </div>
      </body>
    </html>
  `;
}
```

### Enviar email

```typescript
// lib/email/sendInvoice.ts
import { Resend } from 'resend';
import { InvoiceEmailTemplate } from '@/templates/invoice-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(toEmail: string, invoice: Invoice) {
  try {
    const result = await resend.emails.send({
      from: 'facturas@tuempresa.com',
      to: toEmail,
      subject: `Factura #${invoice.number}`,
      html: InvoiceEmailTemplate({
        clientName: invoice.clientName,
        invoiceNumber: invoice.number,
        amount: invoice.subtotal,
        total: invoice.total,
        iva: invoice.iva,
        reteFuente: invoice.reteFuente,
      }),
    });

    return result;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}
```

---

## 7. Cambiar Régimen Tributario (Admin)

### API endpoint

```typescript
// app/api/admin/tax-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/permissions';

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const user = await requireAdmin();

    const body = await request.json();
    const { regime, nit, rut, dianResolution } = body;

    // Validar datos
    if (!regime) {
      return NextResponse.json(
        { error: 'Régimen tributario requerido' },
        { status: 400 }
      );
    }

    // En una implementación real, aquí guardarías en BD
    // Para ahora, solo estamos validando en código

    // Registrar cambio en audit log
    await db.auditLog.create({
      action: 'TAX_REGIME_CHANGED',
      userId: user.id,
      details: {
        oldRegime: 'PERSONA_NATURAL', // obtener del config actual
        newRegime: regime,
        nit,
        rut,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Régimen cambiado a ${regime}`,
      regime,
      appliedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating tax config:', error);
    return NextResponse.json(
      { error: 'Error actualizando configuración' },
      { status: 500 }
    );
  }
}
```

### Llamar desde cliente

```typescript
// hooks/useTaxConfigMutation.ts
import { useMutation } from '@tanstack/react-query';

export function useTaxConfigMutation() {
  return useMutation({
    mutationFn: async (data: { regime: string; nit?: string; rut?: string }) => {
      const response = await fetch('/api/admin/tax-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update tax config');
      }

      return response.json();
    },
  });
}
```

---

## 8. Tests Unitarios

```typescript
// __tests__/tax-config.test.ts
import { describe, it, expect } from 'vitest';
import {
  getActiveTaxConfig,
  calculatePriceWithTaxes,
  validateInvoiceData,
  listAvailableTaxRegimes,
} from '@/lib/config/tax-config';

describe('Tax Configuration', () => {
  describe('getActiveTaxConfig', () => {
    it('should return active tax config', () => {
      const config = getActiveTaxConfig();
      expect(config).toBeDefined();
      expect(config.isActive).toBe(true);
    });
  });

  describe('calculatePriceWithTaxes - PERSONA_NATURAL', () => {
    it('should return same price without taxes', () => {
      const result = calculatePriceWithTaxes(10000000);
      expect(result.subtotal).toBe(10000000);
      expect(result.iva).toBe(0);
      expect(result.reteFuente).toBe(0);
      expect(result.total).toBe(10000000);
    });
  });

  describe('calculatePriceWithTaxes - PERSONA_JURIDICA', () => {
    it('should apply IVA and Retefuente', () => {
      // Mock cambio a Persona Jurídica
      const result = calculatePriceWithTaxes(10000000, 'PERSONA_JURIDICA');
      expect(result.subtotal).toBe(10000000);
      expect(result.iva).toBe(1900000); // 19%
      expect(result.reteFuente).toBe(300000); // 3% of 10M
      expect(result.total).toBe(11600000);
    });
  });

  describe('validateInvoiceData', () => {
    it('should validate invoice for PERSONA_NATURAL', () => {
      const result = validateInvoiceData({
        cedula: '1234567890',
        email: 'client@example.com',
        amount: 5000000,
      });
      expect(result.valid).toBe(true);
    });

    it('should require NIT for PERSONA_JURIDICA', () => {
      // Mock PJ config
      const result = validateInvoiceData({
        cedula: '1234567890',
        email: 'client@example.com',
        amount: 5000000,
        // Missing NIT
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('NIT requerido');
    });
  });

  describe('listAvailableTaxRegimes', () => {
    it('should list all available regimes', () => {
      const regimes = listAvailableTaxRegimes();
      expect(Array.isArray(regimes)).toBe(true);
      expect(regimes.length).toBeGreaterThan(0);
    });

    it('should have exactly one active regime', () => {
      const regimes = listAvailableTaxRegimes();
      const active = regimes.filter((r) => r.isActive);
      expect(active.length).toBe(1);
    });
  });
});
```

---

## 9. Migración a Base de Datos (Futuro)

```typescript
// prisma/schema.prisma
model TaxConfig {
  id        String   @id @default(cuid())
  regime    String   @unique // 'PERSONA_NATURAL', 'PERSONA_JURIDICA'
  isActive  Boolean  @default(false)
  
  // Rates
  ivaRate         Float   @default(0)
  reteFuenteRate  Float   @default(0)
  
  // Legal info
  nit                String?
  rut                String?
  dianResolution     String?
  resolutionExpiry   DateTime?
  
  // Config flags
  requiresFacturacion      Boolean @default(false)
  requiresDIANReporting    Boolean @default(false)
  
  // Metadata
  description      String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  updatedBy        User     @relation(fields: [updatedById], references: [id])
  updatedById      String
  
  auditLogs        AuditLog[]

  @@index([isActive])
  @@index([regime])
}

model AuditLog {
  id          String   @id @default(cuid())
  action      String   // 'TAX_REGIME_CHANGED', 'CONFIG_UPDATED'
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  taxConfig   TaxConfig @relation(fields: [taxConfigId], references: [id])
  taxConfigId String
  details     Json
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([taxConfigId])
}
```

---

## 10. Environment Variables

```bash
# .env.local

# Tax Configuration
TAX_REGIME=PERSONA_NATURAL
TAX_NIT=
TAX_RUT=
DIAN_RESOLUTION=
DIAN_RESOLUTION_EXPIRY=

# Para Persona Jurídica
# TAX_REGIME=PERSONA_JURIDICA
# TAX_NIT=900123456-7
# TAX_RUT=RUT-2024-001234
# DIAN_RESOLUTION=DIAN-RES-2024-00123456
# DIAN_RESOLUTION_EXPIRY=2026-02-17

# Email
RESEND_API_KEY=your_api_key

# Wompi (para procesar pagos)
WOMPI_MERCHANT_CODE=your_code
WOMPI_API_KEY=your_key
```

---

**¿Necesitas más ejemplos? Consulta `TAX_FAQ.md` o `MIGRATION_TAX_REGIME.md`**
