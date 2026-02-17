# 📄 Tax FAQ - Preguntas Frecuentes sobre Impuestos

## 👤 Preguntas Personales

### P: ¿Por qué no cobro IVA si vendo en Colombia?

**R:** Actualmente estás registrado como **Persona Natural**, no como empresa formalizada. Las personas naturales en Colombia NO son responsables del IVA por servicios profesionales (con algunas excepciones). Los clientes pagan el precio sin IVA adicional.

**Nota:** Esto puede cambiar si:
- Te formalizas como Persona Jurídica (abres empresa)
- Tu ingreso anual supera $610 millones COP
- Solicitas voluntariamente ser responsable del IVA

---

### P: ¿Qué necesito para cambiar a Persona Jurídica en el futuro?

**R:** Para formalizarte:

1. **Documentos legales:**
   - Constitución (con abogado)
   - Cedulación (registro en Cámara de Comercio)
   - Inscripción en DIAN como empresa

2. **Obtener:**
   - **NIT** (Número de Identificación Tributaria)
   - **RUT** (Registro Único Tributario)
   - **Resolución DIAN** para numeración de facturas

3. **En el sistema:**
   - Cambiar `isActive` en `tax-config.ts`
   - Actualizar NIT/RUT en perfil
   - Notificar a Wompi

**Costo aproximado:** $300,000 - $800,000 COP (dep. del abogado)

---

### P: ¿Qué impuestos tengo que pagar como persona natural?

**R:** Como persona natural en Colombia:

1. **Impuesto a la Renta (Anual)**
   - Sólo si ganas más de ~$47M COP/año
   - Lo pagas en tu declaración de renta
   - Alrededor del 19-37% sobre renta neta

2. **IVA (No aplica en tu caso)**
   - ❌ No cobras IVA
   - ❌ No haces declaración de IVA
   - ❌ Clientes pagan el precio neto

3. **Otros (Generalmente no)**
   - ❌ Retefuente (aplica a PJ)
   - ❌ Impuesto municipal
   - ❌ Gravamen a movimientos (GMF) si aplica

---

### P: ¿Cuándo tengo que declarar mis ingresos?

**R:** Debes declarar renta si:

- Ganas **más de $47 millones COP/año** (2024)
- O si ganaste más de $25M en ingresos por trabajo independiente
- Tienes bienes por más de cierto monto

**Frecuencia:** Una vez al año (marzo/abril) ante DIAN

**Recomendación:** Consulta con contador o CPA para tu caso específico

---

## 💳 Preguntas sobre Pagos

### P: ¿Qué información necesito de un cliente para facturar?

**R:** Actualmente (Persona Natural):

- Nombre completo
- Email
- **Cédula de ciudadanía** (opcional, pero recomendado)
- Monto

**NO necesitas:**
- ❌ NIT (es para empresas)
- ❌ RUT (es para empresas)
- ❌ Resolución DIAN

---

### P: ¿Cuál es la factura que recibe el cliente?

**R:** Actualmente:

- **Tipo:** Factura simplificada
- **Contenido:** Nombre, cédula, descripción, monto
- **Formato:** PDF enviado por email
- **Secuencial:** No requerido
- **DIAN:** No registrada en DIAN

**Después de formalizar (PJ):**
- Factura electrónica (FacturElectrónica)
- Con numeración secuencial
- Registrada en DIAN
- Más formal/reconocida

---

### P: ¿Qué pasa si me equivoco en el monto o factura?

**R:** Como persona natural:

- Puedes emitir nota crédito (ajuste simple)
- Explica el error al cliente
- Emite factura correcta
- Conserva registro de la corrección

Como PJ (en el futuro):
- Más formalizado
- Nota crédito registrada ante DIAN
- Debes seguir procedure estricto

---

## 🂡 Preguntas Técnicas

### P: ¿Cómo cambio de régimen tributario en el sistema?

**R:** Pasos en el código:

1. Abre `src/lib/config/tax-config.ts`

2. Cambia los flags `isActive`:
   ```typescript
   // De:
   isActive: true,  // PERSONA_NATURAL
   
   // A:
   isActive: false, // PERSONA_NATURAL
   isActive: true,  // PERSONA_JURIDICA
   ```

3. Actualiza la resolución DIAN:
   ```typescript
   resolutionNumber: 'DIAN-RES-2024-001234567'
   ```

4. Deploya cambios:
   ```bash
   git add .
   git commit -m "Switch to PERSONA_JURIDICA tax regime"
   git push origin main
   ```

5. Verifica en producción que los precios cambien

---

### P: ¿Qué pasa con los precios cuando cambio de régimen?

**R:** Se aplican automáticamente:

**Hoy (Persona Natural):**
```
Cliente pide presupuesto: "Quiero un app"
↓
AI calcula: 50h × $50/h = $2,500 USD = $10,000,000 COP
↓
Precio sin cambios:
Subtotal: $10,000,000
+ IVA: $0 (no aplica)
- Retefuente: $0 (no aplica)
↓
Cliente paga: $10,000,000 COP
Ñ Tú recibes: $10,000,000 COP
```

**Después de cambio (Persona Jurídica):**
```
Mismo cliente pide presupuesto:
↓
AI calcula: 50h × $50/h = $2,500 USD = $10,000,000 COP (base)
↓
Precio con impuestos:
Subtotal: $10,000,000
+ IVA (19%): $1,900,000
- Retefuente (3%): $300,000
↓
Cliente paga: $11,600,000 COP
Ñ Tú recibes: $11,600,000 COP (luego envian retefuente a DIAN)
```

**Nota:** El "valor del trabajo" ($10M) es el mismo, pero el cliente paga más por impuestos.

---

### P: ¿Dónde se guardan los datos de tax config?

**R:** Actualmente en el código mismo:

```
src/lib/config/tax-config.ts
├─ Define todos los regimenes
├─ Marca cuai está activo (isActive)
├─ Funciones para calcular impuestos
└─ Funciones para validar facturas
```

**En el futuro** (mejora recomendada):

```
BD Prisma:
model TaxConfig {
  regime: String
  isActive: Boolean
  ivaRate: Float
  reteFuenteRate: Float
  dianResolution: String
  updatedAt: DateTime
  updatedBy: User  // quién hizo el cambio
}
```

Beneficios:
- Cambiar de régimen sin hacer deploy
- Audit trail automático
- Admin UI para cambios
- Aprobaciones workflow

---

### P: ¿Qué funciones tengo disponibles para manejar impuestos?

**R:** En `src/lib/config/tax-config.ts`:

```typescript
// Obtener configuración activa
getActiveTaxConfig() → TaxConfig

// Obtener config específica
getTaxConfig('PERSONA_JURIDICA') → TaxConfig

// Listar todos los regímenes
listAvailableTaxRegimes() → Array<{regime, description, isActive}>

// Cambiar régimen (actualiza flags)
switchTaxRegime('PERSONA_JURIDICA') → TaxConfig

// Calcular precio con impuestos
calculatePriceWithTaxes(1000000) → { subtotal, iva, reteFuente, total, breakdown }

// Validar factura contra obligaciones
validateInvoiceData({cedula, nit, rut, email, amount}) → {valid, errors}

// Requisitos DIAN
getDIANReportingRequirements() → {required, frequency, reports}
```

En `src/lib/wompi/pricing.ts`:

```typescript
// Calcular precio del proyecto
calculateProjectPrice(basePrice) → PricingCalculation

// Formatear precio para UI
formatPrice(cents) → "$10,000,000 COP"

// Crear factura con validación
creatInvoiceData(invoiceData) → {valid, invoice, errors}
```

---

## 📉 Preguntas sobre Reportes

### P: ¿Necesito hacer reportes a DIAN ahora?

**R:** **NO**, como persona natural:

- ✅ Declaración anual de renta (si superas umbral)
- ❌ IVA mensual/trimestral (no aplica)
- ❌ Retención en la fuente (no aplica)
- ❌ Facturas secuenciales (no requeridas)

**Despupés de formalizar:**
- ✅ Declaración IVA mensual
- ✅ Declaración renta anual
- ✅ Reportes mensuales a DIAN
- ✅ Facturas secuenciales obligatorias

---

### P: ¿Qué documentos debo guardar?

**R:** Conserva (al menos 5 años):

1. **Facturas emitidas**
   - Copia para tu registro
   - Email confirmación de envio
   - Recibos de pago de clientes

2. **Comprobantes de pago**
   - Transferencias bancarias
   - Comprobantes Wompi/pasarela
   - Facturas de proveedores

3. **Correspondencia**
   - Emails con clientes
   - Presupuestos
   - Acuerdos de scope

4. **Registros personales**
   - Cédula copia
   - Banco datos
   - Historico de cambios

**Recomendación:** Sistema automatizado en BD (auditoría DIAN puede pedir)

---

## 📁 Más Información

### Sitios oficiales

- **DIAN:** www.dian.gov.co
- **Cámara de Comercio de Yumbo:** www.camarayumbo.org.co
- **CONFECAMARAS:** www.confecamaras.org.co

### Recomendaciones profesionales

1. **Consultúclate con CPA/Contador** para:
   - Revisión anual de obligaciones
   - Declaraciones de renta
   - Cambios de régimen

2. **Revisa las nuevas reglas**
   - DIAN publica cambios anualmente
   - Umbrales de renta se actualizan cada año
   - Tasas de impuesto pueden variar

3. **Usa software de contabilidad**
   - Registra todos los ingresos
   - Mantén recibos/facturas
   - Facilita auditoría

---

## 🗣️ Preguntas No Cubiertas Aqui?

Consulta con:
- **Tu contador:** Para situaciones fiscales personales
- **DIAN:** Para interpretaciones oficiales
- **Equipo técnico:** Para configuración del sistema

---

**Última actualización:** 2026-02-17
