# ✅ Checklist de Implementación - Sistema Tributario

Siga este checklist para integrar completamente el sistema tributario en su aplicación.

---

## 📚 FASE 1: Documentación y Comprensión (2-3 horas)

- [ ] **Leer documentación principal**
  - [ ] `TAX_FAQ.md` - Entender las obligaciones actuales
  - [ ] `TAX_CONFIGURATION_SUMMARY.md` - Resumen ejecutivo
  - [ ] `MIGRATION_TAX_REGIME.md` - Guardar para referencia futura

- [ ] **Validar con contador/CPA**
  - [ ] Confirmar que como Persona Natural no cobras IVA
  - [ ] Validar que no hay otras obligaciones tributarias
  - [ ] Obtener recomendación para cuando formalizar

- [ ] **Entender la arquitectura**
  - [ ] Revisar `src/lib/config/tax-config.ts`
  - [ ] Entender diferencia entre "Persona Natural" y "Persona Jurídica"
  - [ ] Conocer cómo se calculan impuestos

---

## 💻 FASE 2: Integración de Componentes (4-6 horas)

### 2.1 Componente de Desglose de Precios

- [ ] **Integrar TaxBreakdown en checkout**
  - [ ] Copiar `src/components/checkout/TaxBreakdown.tsx` a tu proyecto
  - [ ] Importar en página de checkout
  - [ ] Pasar props correctamente (basePrice, lineItems, totalPrice)
  - [ ] Verificar que se renderiza correctamente
  - [ ] Probar con diferentes montos

- [ ] **Estilos y diseño**
  - [ ] Ajustar estilos si es necesario (Tailwind classes)
  - [ ] Verificar responsive en móvil
  - [ ] Confirmar contraste de colores (accesibilidad)

### 2.2 Panel Admin

- [ ] **Integrar TaxConfigAdmin**
  - [ ] Crear ruta `/admin/settings/tax` o similar
  - [ ] Copiar `src/components/admin/TaxConfigAdmin.tsx`
  - [ ] Configurar permisos (solo admin puede acceder)
  - [ ] Verificar que se renderiza

- [ ] **Validar funcionalidad**
  - [ ] Botón "Activar" aparece para regímenes inactivos
  - [ ] Información actual se muestra correctamente
  - [ ] Formulario de edición funciona (UI al menos)

### 2.3 Otros componentes (Opcional pero recomendado)

- [ ] **TaxInfoBadge en presupuestos**
  - [ ] Crear o copiar componente
  - [ ] Mostrar en página de presupuestos
  - [ ] Mostrar en listado de presupuestos

---

## 🔧 FASE 3: Integración de Lógica (6-8 horas)

### 3.1 Cálculo de Precios

- [ ] **Integrar calculatePriceWithTaxes**
  - [ ] Usar en `calculateProjectPrice()` existente
  - [ ] Verificar cálculos manualmente:
    - [ ] Persona Natural: $10M → $10M (sin cambios)
    - [ ] PJ (futuro): $10M → IVA $1.9M + Refe -$300k = $11.6M
  - [ ] Probar con diferentes montos

- [ ] **Validar integración con Wompi**
  - [ ] Verificar que Wompi recibe monto correcto
  - [ ] Probar con transacción de prueba
  - [ ] Confirmar descripción incluye detalles

### 3.2 Generación de Facturas

- [ ] **Crear función de validación de factura**
  - [ ] Usar `validateInvoiceData()` en generación
  - [ ] Validar que cliente tenga datos requeridos
  - [ ] Mostrar error si falta información

- [ ] **Generar factura con impuestos**
  - [ ] Incluir desglose de impuestos en factura
  - [ ] Mostrar "Sin IVA" si es PN
  - [ ] Mostrar IVA + Retefuente si es PJ
  - [ ] Almacenar en BD para auditoría

- [ ] **Enviar factura por email**
  - [ ] Usar template de email con desglose tributario
  - [ ] Incluir información legal (NIT, RUT si aplica)
  - [ ] Probar envío

### 3.3 Obtener Configuración Activa

- [ ] **Usar getActiveTaxConfig() en componentes**
  - [ ] Hacer hook personalizado (useTaxConfig)
  - [ ] Usar en checkout para mostrar desglose correcto
  - [ ] Usar en facturas para información legal
  - [ ] Usar en admin para información actual

- [ ] **Verificar en toda la app**
  - [ ] Buscar hardcoded "sin impuestos"
  - [ ] Reemplazar por getActiveTaxConfig()
  - [ ] Asegurar dinamicidad

---

## 🗄️ FASE 4: Base de Datos (Opcional, solo si migras a BD)

- [ ] **Crear migrations de Prisma**
  ```bash
  npx prisma migrate dev --name add_tax_config
  ```
  - [ ] TaxConfig table
  - [ ] AuditLog table
  - [ ] User.updatedById relation

- [ ] **Migrar datos actuales**
  - [ ] Crear seed script para datos iniciales
  - [ ] Correr seed: `npx prisma db seed`
  - [ ] Verificar que datos se crearon

- [ ] **Crear API endpoints**
  - [ ] GET `/api/admin/tax-config` - obtener actual
  - [ ] POST `/api/admin/tax-config` - actualizar
  - [ ] GET `/api/admin/tax-config/history` - historial
  - [ ] Agregar autenticación/autorización

- [ ] **Conectar componentes a API**
  - [ ] TaxConfigAdmin: usar API en lugar de estado local
  - [ ] Refrescar config después de cambios
  - [ ] Mostrar mensajes de éxito/error

---

## 🧪 FASE 5: Testing (4-6 horas)

### 5.1 Unit Tests

- [ ] **Tests de cálculo de precios**
  ```bash
  npm run test -- tax-config.test.ts
  ```
  - [ ] Persona Natural: sin impuestos
  - [ ] Persona Jurídica: con IVA y Retefuente
  - [ ] Casos edge: 0, 1M, 1000M

- [ ] **Tests de validación**
  - [ ] Validación con datos completos
  - [ ] Validación con datos faltantes
  - [ ] Errores apropiados

### 5.2 Integration Tests

- [ ] **Flujo completo de presupuesto**
  - [ ] Crear presupuesto
  - [ ] Verificar precio con impuestos
  - [ ] Generar factura
  - [ ] Enviar email
  - [ ] Verificar en BD

- [ ] **Cambio de régimen**
  - [ ] Cambiar a Persona Jurídica
  - [ ] Verificar que nuevo presupuesto tiene impuestos
  - [ ] Verificar que presupuestos viejos no cambian
  - [ ] Revertir a Persona Natural

### 5.3 Manual Testing

- [ ] **Checkout flow**
  - [ ] Crear presupuesto de prueba
  - [ ] Verificar desglose de precios
  - [ ] Completar pago con Wompi
  - [ ] Recibir factura por email
  - [ ] Verificar que factura es correcta

- [ ] **Admin panel**
  - [ ] Acceder a `/admin/settings/tax`
  - [ ] Ver configuración actual
  - [ ] Intentar cambiar régimen
  - [ ] Ver historial

- [ ] **Casos edge**
  - [ ] Presupuesto de $0
  - [ ] Presupuesto muy grande ($100M+)
  - [ ] Cliente sin email
  - [ ] Cambios rápidos de régimen

---

## 📋 FASE 6: Documentación Final (2-3 horas)

- [ ] **Documentar tu implementación**
  - [ ] Crear README interno sobre sistema tributario
  - [ ] Documentar cambios custom que hiciste
  - [ ] Incluir ejemplos específicos de tu proyecto
  - [ ] Guardar en `/docs/TAX_SYSTEM.md`

- [ ] **Actualizar docs existentes**
  - [ ] Actualizar README principal si es necesario
  - [ ] Agregar link a TAX_FAQ.md
  - [ ] Agregar sección de configuración tributaria

- [ ] **Guardar referencia para contador**
  - [ ] Imprimir o guardar TAX_FAQ.md
  - [ ] Compartir MIGRATION_TAX_REGIME.md
  - [ ] Documentar cuándo fue el último cambio

---

## ⚠️ FASE 7: Pre-Launch Checklist (1-2 horas)

### Antes de ir a producción:

- [ ] **Verificaciones técnicas**
  - [ ] Todos los tests pasan: `npm run test`
  - [ ] No hay errores de compilación: `npm run build`
  - [ ] Linter limpio: `npm run lint`
  - [ ] No hay secrets en código: `npm run audit`

- [ ] **Verificaciones funcionales**
  - [ ] Presupuestos se generan correctamente
  - [ ] Precios se muestran sin impuestos (PN)
  - [ ] Facturas se generan correctamente
  - [ ] Emails se envían correctamente
  - [ ] Admin panel funciona

- [ ] **Verificaciones de seguridad**
  - [ ] Admin panel tiene autenticación
  - [ ] Solo admin puede cambiar régimen
  - [ ] API endpoints están protegidos
  - [ ] Datos sensibles (NIT, RUT) no se loguean

- [ ] **Verificaciones de datos**
  - [ ] Datos históricos no se pierden
  - [ ] Backups están configurados
  - [ ] Auditoría de cambios está activa

---

## 🚀 FASE 8: Deployment (1-2 horas)

- [ ] **Preparar deployment**
  - [ ] Crear rama: `git checkout -b feat/tax-system`
  - [ ] Comitear cambios
  - [ ] Crear PR con descripción clara
  - [ ] Pasar code review

- [ ] **Merge y deploy**
  - [ ] Mergear a main
  - [ ] Triggear deploy automático (o manual)
  - [ ] Verificar que todos los tests pasan
  - [ ] Verificar que aplicación se inicia

- [ ] **Post-deployment**
  - [ ] Probar en producción
  - [ ] Monitorear logs
  - [ ] Verificar emails se envían
  - [ ] Probar flujo completo
  - [ ] Celebrar 🎉

---

## 🔄 FASE 9: Mantenimiento Continuo

### Semanal

- [ ] Revisar logs por errores
- [ ] Verificar que facturas se generan
- [ ] Probar que emails se envían

### Mensual

- [ ] Revisar auditlog de cambios
- [ ] Verificar que no hay presupuestos con precios incorrectos
- [ ] Hacer respaldo de configuración
- [ ] Revisar si hay actualizaciones de tasas DIAN

### Trimestral

- [ ] Revisar con contador estado fiscal
- [ ] Verificar cumplimiento tributario
- [ ] Actualizar documentación si es necesario

### Anualmente

- [ ] Prepararse para cambiar de régimen (si es necesario)
- [ ] Auditoría completa del sistema
- [ ] Revisión de seguridad
- [ ] Plan para el siguiente año fiscal

---

## 📞 Soporte y Referencias

**Si tienes dudas:**

1. **Sobre impuestos:** Consulta `TAX_FAQ.md`
2. **Sobre migración:** Consulta `MIGRATION_TAX_REGIME.md`
3. **Sobre código:** Consulta `INTEGRATION_EXAMPLES.md`
4. **Con contador:** Lleva TAX_FAQ.md y TAX_CONFIGURATION_SUMMARY.md
5. **DIAN oficial:** www.dian.gov.co

---

## 📊 Tracking de Progreso

Usa esta tabla para rastrear tu progreso:

| Fase | Descripción | Estado | Fecha Inicio | Fecha Fin |
|------|-------------|--------|--------------|----------|
| 1 | Documentación | 🔲 | | |
| 2 | Integración Componentes | 🔲 | | |
| 3 | Integración Lógica | 🔲 | | |
| 4 | Base de Datos | 🔲 | | |
| 5 | Testing | 🔲 | | |
| 6 | Documentación Final | 🔲 | | |
| 7 | Pre-Launch | 🔲 | | |
| 8 | Deployment | 🔲 | | |
| 9 | Mantenimiento | 🔲 | | |

**Leyenda:**
- 🔲 No iniciado
- 🔄 En progreso
- ✅ Completado

---

## 🎯 Próximos Pasos

### Hoy/Mañana:

1. [ ] Lee este checklist completamente
2. [ ] Lee TAX_FAQ.md
3. [ ] Habla con tu contador
4. [ ] Estima tiempo para implementar

### Esta semana:

1. [ ] Comienza FASE 1
2. [ ] Comienza FASE 2
3. [ ] Prueba en desarrollo

### Este mes:

1. [ ] Completa todas las fases
2. [ ] Tests funcionales
3. [ ] Deploy a producción

### Para el futuro:

1. [ ] Guardar MIGRATION_TAX_REGIME.md
2. [ ] Establecer recordatorios anuales
3. [ ] Planificar formalización si es necesario

---

**Fecha de este checklist:** 17 Febrero, 2026  
**Versión:** 1.0  
**Última actualización:** 17 Febrero, 2026
