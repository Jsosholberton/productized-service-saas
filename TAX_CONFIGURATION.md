# 🏛️ Tax Configuration Guide

## Current Status (2026-02-17)

**Tax Regime:** Persona Natural  
**IVA:** ❌ Not charged  
**Retefuente:** ❌ Not withheld  
**Other Taxes:** ❌ None  
**DIAN Reporting:** ❌ Not required  

---

## How Tax Configuration Works

The system uses a **flexible, centralized tax configuration** that can be changed without touching business logic.

### Architecture

```
src/lib/config/
└── tax-config.ts
    ├── TaxConfig interface
    ├── TAX_CONFIG_REGISTRY
    ├── Utility functions:
    │   ├── getActiveTaxConfig()
    │   ├── getTaxConfig(regime)
    │   ├── switchTaxRegime(newRegime)
    │   ├── calculatePriceWithTaxes()
    │   ├── validateInvoiceData()
    │   └── getDIANReportingRequirements()
    └── Pre-configured regimes:
        ├── PERSONA_NATURAL (current)
        ├── PERSONA_JURIDICA (future)
        ├── SIMPLIFICADO (future)
        └── ESPECIAL (future)

src/lib/wompi/
└── pricing.ts
    ├── calculateProjectPrice() → uses getActiveTaxConfig()
    ├── formatPrice()
    ├── createInvoiceData() → validates against current tax rules
    └── PricingCalculation type
```

### Data Flow

```
User creates project
    ↓
basePrice calculated by AI ($X COP)
    ↓
calculateProjectPrice(basePrice)
    ├─ calls getActiveTaxConfig()
    ├─ applies taxes/discounts based on regime
    └─ returns PricingCalculation with breakdown
    ↓
Display to client:
  Subtotal: $2,000,000 COP
  + IVA (19%): $0 COP [applies: false]
  - Retefuente (3%): $0 COP [applies: false]
  ────────────────────
  Total: $2,000,000 COP
```

---

## Switching Tax Regime

### When You Need to Change

1. **Formalizar empresa** (become Persona Jurídica)
   - Get NIT from DIAN
   - Register with RUT
   - Start charging IVA

2. **Reach revenue threshold** ($610M+ COP in Colombia)
   - Switch from PERSONA_NATURAL to PERSONA_JURIDICA
   - Start tax reporting obligations

3. **Qualify for special regime** (tech startups)
   - Apply for R. Tributación Especial
   - Get reduced tax rates

### Step 1: Update tax-config.ts

Change the `isActive` flag:

```typescript
// BEFORE
const PERSONA_NATURAL_CONFIG: TaxConfig = {
  // ...
  isActive: true,  // ← ACTIVE NOW
  // ...
};

const PERSONA_JURIDICA_CONFIG: TaxConfig = {
  // ...
  isActive: false,  // ← INACTIVE
  // ...
};

// AFTER (when switching)
const PERSONA_NATURAL_CONFIG: TaxConfig = {
  // ...
  isActive: false,  // ← DEACTIVATED
  // ...
};

const PERSONA_JURIDICA_CONFIG: TaxConfig = {
  // ...
  isActive: true,  // ← ACTIVATED
  resolutionNumber: 'DIAN-2024-001234',  // ← Fill in resolution
  // ...
};
```

### Step 2: Update resolution number (if applicable)

If switching to a regime requiring DIAN resolution:

```typescript
const PERSONA_JURIDICA_CONFIG: TaxConfig = {
  regime: 'PERSONA_JURIDICA',
  // ...
  invoicing: {
    requiresNIT: true,
    requiresRUT: true,
    requiresCEDULA: false,
    requiresResolution: true,
    resolutionNumber: 'DIAN-RES-2024-001234567',  // ← Your DIAN resolution
    sequentialNumbering: true,
  },
  // ...
};
```

### Step 3: Update company NIT/RUT/Cédula

If switching to PERSONA_JURIDICA, update Prisma User model:

```typescript
// In prisma/schema.prisma
model User {
  // ... existing fields
  
  // Add tax identification
  cedula         String?   @unique  // For PERSONA_NATURAL
  nit            String?   @unique  // For PERSONA_JURIDICA
  rut            String?   @unique  // For PERSONA_JURIDICA
  taxRegime      String    @default("PERSONA_NATURAL")
  dianResolution String?   // DIAN resolution if applicable
  
  // ...
}
```

### Step 4: Redeploy

```bash
# Test locally first
npm run dev

# Verify calculations
# Check that new tax configuration is applied

# Then deploy to production
git add .
git commit -m "Switch tax regime to PERSONA_JURIDICA"
git push origin main
# Vercel auto-deploys
```

### Step 5: Notify stakeholders

**CRITICAL**: Before switching, notify:

1. **Your accountant/CPA**
   - New tax regime
   - New reporting obligations
   - New invoice format/resolution

2. **DIAN** (if applicable)
   - Register new NIT
   - Register DIAN resolution
   - Start declaring transactions

3. **Existing clients** (if retroactive)
   - Explain tax change
   - Provide updated invoices if needed

4. **Wompi**
   - Update business info
   - Update bank details if PJ
   - Verify new NIT

---

## Tax Regimes Explained

### 🟢 PERSONA_NATURAL (Current)

**Status:** ✅ Active  
**Description:** Self-employed individual, no business registration  
**Requirements:**
- Only need Cédula (ID)
- No NIT or RUT needed

**Taxes:**
- IVA: ❌ No (consumer pays 19%)
- Retefuente: ❌ No
- Other: ❌ No

**Reporting:**
- DIAN: ❌ No formal reporting
- VAT: ❌ No
- Income: ✅ Yes, but only in annual tax return

**Invoicing:**
- Sequential numbering: ❌ No required
- Resolution: ❌ No required
- Format: Simple (name, cedula, amount)

**When to stay:** Under $610M COP annual revenue, no formal business structure

---

### 🟡 PERSONA_JURIDICA (Registered Company)

**Status:** ⏸️ Inactive (future)  
**Description:** Formal business registration  
**Requirements:**
- NIT (business tax ID)
- RUT (business registry)
- DIAN resolution for invoicing

**Taxes:**
- IVA: ✅ Charge 19%
- Retefuente: ✅ Withhold 3%
- Other: ❌ No

**Reporting:**
- DIAN: ✅ Monthly VAT declaration
- Income: ✅ Annual tax return
- Frequency: Monthly

**Invoicing:**
- Sequential numbering: ✅ Required by DIAN
- Resolution: ✅ Required (format: DIAN-RES-20XX-XXXXXXX)
- Format: Formal invoice with all company details

**When to switch:** Revenue $610M+ COP, formal business structure

---

### 🟠 SIMPLIFICADO (Simplified Regime)

**Status:** ⏸️ Inactive (future)  
**Description:** For small businesses with simplified obligations  
**Requirements:**
- NIT
- RUT
- Annual gross revenue < $1.45B COP

**Taxes:**
- IVA: ✅ Charge 19%
- Retefuente: ✅ Withhold 2% (reduced)
- Other: ❌ No

**Reporting:**
- DIAN: ✅ Quarterly (not monthly)
- Frequency: Quarterly

**When to use:** $610M - $1.45B COP annual revenue

---

### 🔵 ESPECIAL (Special Regime - Tech)

**Status:** ⏸️ Inactive (future)  
**Description:** Special benefits for tech startups/developers  
**Requirements:**
- NIT
- RUT
- Qualify through Ministry of ICT

**Taxes:**
- IVA: ✅ Charge 19%
- Retefuente: ✅ Withhold 1.5% (special reduced rate)
- Other: ❌ No

**Benefits:**
- Tax incentives
- Reduced withholding
- Priority support from DIAN

**When to use:** Tech services, if eligible

---

## Configuration Examples

### Example 1: Current Setup (Persona Natural - No Taxes)

```typescript
// Client buys project
const basePrice = 2_000_000; // $2,000,000 COP

const pricing = calculateProjectPrice(basePrice);

// Result:
// {
//   basePriceInCents: 200000000,
//   taxes: {
//     iva: 0,
//     reteFuente: 0,
//     otherTaxes: 0
//   },
//   totalInCents: 200000000,
//   breakdown: {
//     lineItems: [
//       { label: 'Subtotal', amount: 200000000 }
//     ],
//     summary: 'Régimen: Persona Natural - No IVA...'
//   }
// }

// ✅ Client pays: $2,000,000 COP
```

### Example 2: After Switching to Persona Jurídica (With Taxes)

```typescript
// After switch: isActive flags changed in tax-config.ts
const basePrice = 2_000_000; // $2,000,000 COP

const pricing = calculateProjectPrice(basePrice);

// Result:
// {
//   basePriceInCents: 200000000,
//   taxes: {
//     iva: 38000000,      // +19%
//     reteFuente: 6000000, // -3%
//     otherTaxes: 0
//   },
//   totalInCents: 232000000,
//   breakdown: {
//     lineItems: [
//       { label: 'Subtotal', amount: 200000000 },
//       { label: 'IVA (19%)', amount: 38000000, percentage: 19 },
//       { label: 'Retefuente (3%)', amount: -6000000, percentage: 3 }
//     ],
//     summary: 'Régimen: Persona Jurídica...'
//   }
// }

// ✅ Client pays: $2,320,000 COP
// 💰 You receive: $2,320,000 COP (after transfer costs)
// 📊 Breakdown:
//   - Subtotal: $2,000,000 (your service)
//   - IVA: +$380,000 (collected for DIAN)
//   - Retefuente: -$60,000 (withheld by payer)
```

---

## Implementation Checklist

### When Transitioning Tax Regimes:

- [ ] **Legal/Accounting**
  - [ ] Consult with CPA/accountant
  - [ ] Verify you qualify for new regime
  - [ ] Get DIAN resolution if applicable
  - [ ] Register NIT/RUT with DIAN

- [ ] **Technical**
  - [ ] Update `tax-config.ts` isActive flags
  - [ ] Update resolution numbers
  - [ ] Update Prisma User schema (if needed)
  - [ ] Test calculations locally
  - [ ] Verify invoice templates

- [ ] **Communication**
  - [ ] Notify accountant
  - [ ] Notify DIAN
  - [ ] Update Wompi business info
  - [ ] Inform existing clients
  - [ ] Update website/terms if needed

- [ ] **Deployment**
  - [ ] Code review
  - [ ] Deploy to staging
  - [ ] Test end-to-end
  - [ ] Deploy to production
  - [ ] Monitor for errors

- [ ] **Documentation**
  - [ ] Document transition date
  - [ ] Create audit trail
  - [ ] Archive old invoices
  - [ ] Update FAQ/help docs

---

## Rollback Plan

If something goes wrong:

```bash
# 1. Revert code change
git revert <commit-sha>

# 2. Redeploy
git push origin main

# 3. Verify in production
# Test a quote calculation

# 4. Notify accountant/DIAN
# Explain temporary revert

# 5. Fix issue and redeploy
```

---

## Monitoring After Change

After switching tax regimes, monitor:

1. **Quote calculations**
   - Verify prices are correct
   - Check tax breakdown in emails
   - Ensure Wompi receives correct amounts

2. **Invoices**
   - Verify all required fields present
   - Check sequential numbering (if applicable)
   - Ensure client receives correct invoice

3. **Payments**
   - Verify amounts match quotes
   - Check Wompi reconciliation
   - Monitor for client disputes

4. **Reporting**
   - Prepare DIAN declaration
   - Verify transaction logs
   - Reconcile with bank statements

---

## Future Features

To make tax management even easier, consider:

1. **Database-driven config**
   - Store tax regime in DB
   - Switch via admin UI (not code)
   - Add approval workflow
   - Audit logging

2. **Multi-currency support**
   - USD invoices for international
   - COP for domestic
   - Automatic conversion

3. **DIAN integration**
   - Auto-generate DIAN forms
   - E-invoicing (FacturElectrónica)
   - Automatic reporting

4. **Tax dashboard**
   - View tax obligations
   - Generate reports
   - Export for accountant
   - Compliance calendar

---

## Questions?

For tax/legal questions → **Consult with Colombian CPA**  
For technical questions → **Check code comments in tax-config.ts**
