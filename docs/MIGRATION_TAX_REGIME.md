# 🏛️ Guía: Migración de Régimen Tributario

Guia paso a paso para cambiar de **Persona Natural** a **Persona Jurídica** o cualquier otro régimen tributario.

---

## 📡 Requisitos Previos

Antes de hacer cambios en el sistema, tienes que completar los trámites legales/fiscales:

### 1. Constituir tu empresa

```
1.1 Contacta abogado que haga constitución
    └─ Costo: ~$300,000 - $600,000 COP
    └─ Tiempo: 5-7 días

1.2 Obtiene:
    └─ Acta constitutiva
    └─ Estatutos
    └─ Cedulación
```

### 2. Registro en Cámara de Comercio

```
2.1 Presenta documentos:
    └─ Copia del cédula
    └─ Acta constitutiva
    └─ Estatutos
    └─ Formulario (disponible en cámara)

2.2 Paga matrícula:
    └─ Primer año: ~$500,000 - $1,000,000 COP
    └─ Años siguientes: Renovación anual

2.3 Obtiene:
    └─ Certificado de existencia
    └─ NIT provisional
```

### 3. Solicitar NIT en DIAN

```
3.1 Vía DIAN:
    └─ www.dian.gov.co/tramites
    └─ Selecciona: "Solicitud NIT empresa nueva"
    └─ Carga documentos

3.2 O presencialmente:
    └─ Seccional DIAN Yumbo/Cali
    └─ Horarios: 8am-12pm
    └─ Documentos:
        └─ Cédula fotocopia
        └─ Acta constitutiva
        └─ Certificado Cámara de Comercio

3.3 Obtiene:
    └─ NIT definitivo
    └─ RUT (Registro Único Tributario)
```

### 4. Resolución DIAN para Facturación

```
4.1 Solicitar autorizar facturación secuencial
    └─ Formulario: Solicitud Resolución DIAN
    └─ Presentar en seccional DIAN

4.2 DIAN otorga:
    └─ Resoluci–n de facturación
    └─ Rango secuencial (ej: 0001-5000)
    └─ Vigencia (generalmente 2 años)
```

**⏱ Tiempo total:** 2-4 semanas  
**💰 Costo total:** ~$1,300,000 - $2,000,000 COP

---

## 🔠 Paso 1: Actualizar Configuración en Código

Una vez tienes NIT y RUT, actualiza el archivo de configuración.

### 1.1 Editar `tax-config.ts`

**Ruta:** `src/lib/config/tax-config.ts`

```typescript
// ANTES (Persona Natural)
export const PERSONA_NATURAL: TaxConfig = {
  regime: 'PERSONA_NATURAL',
  isActive: true,  // ← Cambiar a false
  description: 'Persona Natural sin obligaciones IVA',
  ivaRate: 0,
  reteFuenteRate: 0,
  requiresFacturacion: false,
  requiresDIANReporting: false,
  dianResolution: null,
  resolutionExpiry: null,
};

// DESPUÉS (Persona Jurídica)
export const PERSONA_JURIDICA: TaxConfig = {
  regime: 'PERSONA_JURIDICA',
  isActive: true,  // ← Cambiar a true
  description: 'Empresa con obligaciones IVA, Retefuente y reportes DIAN',
  ivaRate: 0.19,
  reteFuenteRate: 0.03,
  requiresFacturacion: true,
  requiresDIANReporting: true,
  dianResolution: 'DIAN-RES-2024-00123456',  // ← Tu resolución
  resolutionExpiry: '2026-02-17',  // ← Tu fecha
};
```

### 1.2 Actualizar perfil del usuario

**En tu perfil o base de datos:**

```typescript
// Base de datos (Prisma model)
model User {
  // ... campos existentes
  
  // Información tributaria
  cedula: String  // Ya tienes
  nit: String?    // Añadir
  rut: String?    // Añadir
  
  // Config impuestos
  taxRegime: String  // 'PERSONA_NATURAL' | 'PERSONA_JURIDICA'
  taxRegimeUpdatedAt: DateTime
  
  // Para auditoria
  updatedBy: String  // Quién hizo el cambio
}
```

**En el UI (tu perfil):**

```typescript
// Mostrar información tributaria
<div className="space-y-3">
  <div>
    <label className="text-sm font-medium">Régimen Tributario</label>
    <p className="text-lg font-semibold">{user.taxRegime}</p>
  </div>
  
  <div>
    <label className="text-sm font-medium">NIT</label>
    <p className="text-mono">{user.nit}</p>
  </div>
  
  <div>
    <label className="text-sm font-medium">RUT</label>
    <p className="text-mono">{user.rut}</p>
  </div>
  
  <div>
    <label className="text-sm font-medium">Cambio realizado</label>
    <p className="text-sm text-gray-600">
      {format(user.taxRegimeUpdatedAt, 'dd/MMM/yyyy')}
    </p>
  </div>
</div>
```

---

## 🔐 Paso 2: Verificaciones del Sistema

Antes de hacer deploy, verifica que todo funcione:

### 2.1 Pruebas locales

```bash
# 1. Inicia servidor local
npm run dev

# 2. Creá un presupuesto de prueba
# Debe mostrar:
#   - Subtotal: $10,000,000
#   - IVA (19%): $1,900,000
#   - Retefuente (3%): $300,000
#   - TOTAL: $11,600,000

# 3. Prueba flujo de pago
# Debe ir a Wompi con monto actualizado

# 4. Verifica factura generada
# Debe mostrar NIT y desglose de impuestos
```

### 2.2 Pruebas unitarias

```typescript
// tests/tax-config.test.ts

import { getTaxConfig, calculatePriceWithTaxes } from '@/lib/config/tax-config';

describe('Tax Config - PERSONA_JURIDICA', () => {
  it('should apply IVA correctly', () => {
    const config = getTaxConfig('PERSONA_JURIDICA');
    expect(config.ivaRate).toBe(0.19);
  });

  it('should apply Retefuente correctly', () => {
    const config = getTaxConfig('PERSONA_JURIDICA');
    expect(config.reteFuenteRate).toBe(0.03);
  });

  it('should calculate total price correctly', () => {
    const result = calculatePriceWithTaxes(10000000); // $10M COP
    expect(result.subtotal).toBe(10000000);
    expect(result.iva).toBe(1900000);
    expect(result.reteFuente).toBe(300000);
    expect(result.total).toBe(11600000);
  });
});
```

**Ejecutar pruebas:**

```bash
npm run test -- tax-config.test.ts
```

### 2.3 Verificar integración Wompi

```typescript
// Verificar que Wompi recibe monto correcto
// En tu seccional de prueba (test mode):

1. Genera presupuesto por $1 USD (~$4M COP)
2. Total debe ser: $1 USD × 1.19 IVA × 0.97 (100%-3% retefuente)
3. Total esperado: $1.1543 USD aprox
4. Haz transacción de prueba
5. Verifica en Wompi dashboard:
   - Monto correcto
   - Descripción incluye impuestos
```

---

## 🚀 Paso 3: Deployment a Producción

### 3.1 Crear commit y PR

```bash
# 1. Crear rama de cambios
git checkout -b feat/switch-to-pj-tax-regime

# 2. Añadir cambios
git add src/lib/config/tax-config.ts
git add src/components/profile/TaxInfo.tsx
git add .env.local  # Si necesita actualizar env vars

# 3. Hacer commit con mensaje descriptivo
git commit -m "feat: Switch to Persona Jurídica tax regime

- Updated tax config with NIT, RUT, and DIAN resolution
- IVA (19%) and Retefuente (3%) now applied to pricing
- Updated UI to display new tax regime
- All tests passing

NIT: 900123456-7
DIAN Res: DIAN-RES-2024-00123456
Effective: 2026-02-17"

# 4. Push y crear PR
git push origin feat/switch-to-pj-tax-regime
```

### 3.2 Code review checklist

Antes de mergear, verificar:

- [ ] Todos los tests pasan
- [ ] No hay cambios no intencionados
- [ ] NIT y RUT en formato correcto
- [ ] Resolución DIAN es válida
- [ ] UI muestra impuestos correctamente
- [ ] Precios se calculan correctamente
- [ ] Facturas incluyen detalles tributarios
- [ ] Base de datos ha sido migrada (si aplica)

### 3.3 Deployment

```bash
# 1. Mergear PR a main
git checkout main
git merge feat/switch-to-pj-tax-regime

# 2. Deployar a producción (según tu setup)
# Ejemplo con Vercel:
vercel --prod

# 3. Verificar cambios en vivo
# - Accede a tu app en producción
# - Crea nuevo presupuesto
# - Verifica que se apliquen impuestos
# - Prueba flujo completo de pago
```

### 3.4 Monitoreo inicial

Primeras 24 horas después de deploy:

```
📅 Checklist:
[ ] Clientes pueden crear presupuestos
[ ] Precios correctos con impuestos
[ ] Flujo de pago funciona
[ ] Facturas se generan correctamente
[ ] No hay errores en logs
[ ] Integración Wompi responde bien
```

---

## 📄 Paso 4: Comunicación a Clientes

Avisa a tus clientes sobre el cambio:

### 4.1 Email template

```
Asunto: Actualização de Datos de Facturación

Estimado [Cliente],

Te informamos que a partir del [FECHA], nuestro régimen tributario ha 
cambiado de Persona Natural a Empresa Formal.

Esta actualización implica:

✓ Facturas más formales y reconocidas
✓ Numeración secuencial ante DIAN
✓ Cumplimiento tributario verificado

⚠️ IVA y Retefuente se aplicarán a tus futuras compras:

   Subtotal: $X
   + IVA (19%): $Y
   - Retefuente (3%): $Z  (retenido por DIAN)
   ___________________________
   TOTAL: $Final

Tu factura especificará:
- NIT: 900123456-7
- Resolución DIAN: DIAN-RES-2024-00123456

Para preguntas, responde a este email.

Cordialmente,
[Tu empresa]
```

### 4.2 Actualizar website/presupuesto

```html
<!-- Términos de servicio / Políticas fiscales -->
<div className="bg-blue-50 p-4 rounded">
  <h4 className="font-semibold">Información Fiscal</h4>
  <p className="text-sm mt-2">
    Operamos como empresa formal registrada ante DIAN con NIT 900123456-7.
    Nuestras facturas incluyen:
  </p>
  <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
    <li>IVA (19%) sobre el servicio</li>
    <li>Retefuente (3%) retenido por DIAN</li>
  </ul>
</div>
```

---

## 🐝 Rollback (Por si acaso)

Si algo sale mal y necesitas volver a Persona Natural:

```bash
# 1. Ver historial de cambios
git log --oneline src/lib/config/tax-config.ts

# 2. Revertir al commit anterior
git revert <commit-id>

# 3. O en caso de emergencia (SOLO si no hay cambios importantes)
git reset --hard <commit-anterior>

# 4. Hacer deploy de emergencia
vercel --prod
```

---

## 📈 Post-Migration

### Nuevas responsabilidades mensuales:

```
📅 Cada mes:
[ ] Generar reporte IVA
[ ] Revisar retenciones a DIAN
[ ] Guardar copia de facturas
[ ] Actualizar base de datos de clientes

📅 Cada trimestre:
[ ] Declarar IVA ante DIAN
[ ] Revisar obligaciones actuales
[ ] Actualizar RUT si hay cambios

📅 Cada año:
[ ] Renovar matrícula Cámara de Comercio
[ ] Declaración de renta
[ ] Renovar resolución DIAN
```

### Sistema de alertas recomendado:

```typescript
// Crear reminders para:
- Vencimiento de resolución DIAN (2 meses antes)
- Vencimiento de renovación Cámara (1 mes antes)
- Fechas de declaración DIAN
- Cierre de periodo fiscal

// Enviar a email/chat/app
import { sendAlert } from '@/lib/notifications';

sendAlert({
  type: 'tax_deadline',
  title: 'Vencimiento de Resolución DIAN',
  dueDate: '2026-02-15',
  daysUntil: 30,
  action: 'Solicitar renovación'
});
```

---

## 🗣️ Preguntas?

- **Técnicas:** Revisa `TAX_FAQ.md` o contacta equipo de desarrollo
- **Fiscales:** Consulta con tu contador o CPA
- **DIAN:** www.dian.gov.co o seccional local

---

**Última actualización:** 2026-02-17
