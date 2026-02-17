/**
 * Tax Configuration System
 *
 * This module manages all tax-related configurations for different roles/scenarios:
 * - Persona Natural (current: no taxes)
 * - Persona Jurídica (future: IVA + Retefuente)
 * - Régimen Simplificado
 * - Régimen de Tributación Especial
 *
 * Easily extendable for future tax obligation changes.
 */

export type TaxRegime = 'PERSONA_NATURAL' | 'PERSONA_JURIDICA' | 'SIMPLIFICADO' | 'ESPECIAL';

export interface TaxConfig {
  regime: TaxRegime;
  description: string;
  isActive: boolean;
  charges: {
    appliesIVA: boolean;
    ivaRate: number; // e.g., 0.19 for 19%
    appliesReteFuente: boolean;
    reteFuenteRate: number; // e.g., 0.03 for 3%
    appliesOtherTaxes: boolean;
    otherTaxes: Array<{
      name: string;
      rate: number;
      description: string;
    }>;
  };
  invoicing: {
    requiresNIT: boolean;
    requiresRUT: boolean;
    requiresCEDULA: boolean;
    requiresResolution: boolean;
    resolutionNumber?: string; // DIAN resolution if applicable
    sequentialNumbering: boolean; // DIAN requires sequential invoices
  };
  reporting: {
    requiresDIANReporting: boolean;
    reportingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'NONE';
    requiresVATDeclaration: boolean; // Declaración de IVA
    requiresIncomeDeclaration: boolean; // Declaración de Renta
  };
}

/**
 * Current Tax Configuration: Persona Natural (No taxes)
 *
 * CURRENT STATE (as of 2026-02-17):
 * - No IVA charged
 * - No Retefuente withheld
 * - Only need Cédula for invoicing
 * - No DIAN reporting required
 */
const PERSONA_NATURAL_CONFIG: TaxConfig = {
  regime: 'PERSONA_NATURAL',
  description: 'Persona Natural - No IVA, No Impuestos Adicionales',
  isActive: true,
  charges: {
    appliesIVA: false,
    ivaRate: 0,
    appliesReteFuente: false,
    reteFuenteRate: 0,
    appliesOtherTaxes: false,
    otherTaxes: [],
  },
  invoicing: {
    requiresNIT: false,
    requiresRUT: false,
    requiresCEDULA: true,
    requiresResolution: false,
    sequentialNumbering: false,
  },
  reporting: {
    requiresDIANReporting: false,
    reportingFrequency: 'NONE',
    requiresVATDeclaration: false,
    requiresIncomeDeclaration: false,
  },
};

/**
 * Future Configuration: Persona Jurídica (PJ)
 * With IVA + Retefuente
 * Can be activated when transitioning to formal business structure
 */
const PERSONA_JURIDICA_CONFIG: TaxConfig = {
  regime: 'PERSONA_JURIDICA',
  description: 'Persona Jurídica - IVA 19% + Retefuente 3%',
  isActive: false, // Will activate in future
  charges: {
    appliesIVA: true,
    ivaRate: 0.19, // 19% standard in Colombia
    appliesReteFuente: true,
    reteFuenteRate: 0.03, // 3% for services
    appliesOtherTaxes: false,
    otherTaxes: [],
  },
  invoicing: {
    requiresNIT: true,
    requiresRUT: true,
    requiresCEDULA: false,
    requiresResolution: true,
    resolutionNumber: '', // To be filled when activated
    sequentialNumbering: true, // DIAN requires sequential
  },
  reporting: {
    requiresDIANReporting: true,
    reportingFrequency: 'MONTHLY',
    requiresVATDeclaration: true,
    requiresIncomeDeclaration: true,
  },
};

/**
 * Future Configuration: Régimen Simplificado
 * For smaller businesses with simplified tax obligations
 */
const SIMPLIFICADO_CONFIG: TaxConfig = {
  regime: 'SIMPLIFICADO',
  description: 'Régimen Simplificado - IVA 19% + Retefuente 2%',
  isActive: false,
  charges: {
    appliesIVA: true,
    ivaRate: 0.19,
    appliesReteFuente: true,
    reteFuenteRate: 0.02, // 2% simplified rate
    appliesOtherTaxes: false,
    otherTaxes: [],
  },
  invoicing: {
    requiresNIT: true,
    requiresRUT: true,
    requiresCEDULA: false,
    requiresResolution: true,
    sequentialNumbering: true,
  },
  reporting: {
    requiresDIANReporting: true,
    reportingFrequency: 'QUARTERLY',
    requiresVATDeclaration: true,
    requiresIncomeDeclaration: true,
  },
};

/**
 * Future Configuration: Régimen de Tributación Especial
 * For special cases (tech startups, etc.)
 */
const ESPECIAL_CONFIG: TaxConfig = {
  regime: 'ESPECIAL',
  description: 'Régimen Especial - Beneficios para Tech',
  isActive: false,
  charges: {
    appliesIVA: true,
    ivaRate: 0.19,
    appliesReteFuente: true,
    reteFuenteRate: 0.015, // 1.5% reduced rate
    appliesOtherTaxes: false,
    otherTaxes: [],
  },
  invoicing: {
    requiresNIT: true,
    requiresRUT: true,
    requiresCEDULA: false,
    requiresResolution: true,
    sequentialNumbering: true,
  },
  reporting: {
    requiresDIANReporting: true,
    reportingFrequency: 'QUARTERLY',
    requiresVATDeclaration: true,
    requiresIncomeDeclaration: true,
  },
};

/**
 * Registry of all tax configurations
 * Add new regimes here
 */
const TAX_CONFIG_REGISTRY: Record<TaxRegime, TaxConfig> = {
  PERSONA_NATURAL: PERSONA_NATURAL_CONFIG,
  PERSONA_JURIDICA: PERSONA_JURIDICA_CONFIG,
  SIMPLIFICADO: SIMPLIFICADO_CONFIG,
  ESPECIAL: ESPECIAL_CONFIG,
};

/**
 * Get active tax configuration
 * Returns the currently active tax regime configuration
 */
export function getActiveTaxConfig(): TaxConfig {
  const activeConfig = Object.values(TAX_CONFIG_REGISTRY).find((config) => config.isActive);
  if (!activeConfig) {
    throw new Error('No active tax configuration found. Please set one in tax-config.ts');
  }
  return activeConfig;
}

/**
 * Get specific tax configuration by regime
 */
export function getTaxConfig(regime: TaxRegime): TaxConfig {
  const config = TAX_CONFIG_REGISTRY[regime];
  if (!config) {
    throw new Error(`Tax regime '${regime}' not found`);
  }
  return config;
}

/**
 * List all available tax regimes
 */
export function listAvailableTaxRegimes(): Array<{
  regime: TaxRegime;
  description: string;
  isActive: boolean;
}> {
  return Object.values(TAX_CONFIG_REGISTRY).map((config) => ({
    regime: config.regime,
    description: config.description,
    isActive: config.isActive,
  }));
}

/**
 * Switch active tax configuration
 * Call this function when changing tax regime
 *
 * Example:
 * switchTaxRegime('PERSONA_JURIDICA')
 *
 * IMPORTANT: This is a LOCAL function. For production:
 * 1. Store active regime in database (environment variable or config table)
 * 2. Add audit logging (who changed it, when, from what to what)
 * 3. Add approval workflow (requires admin confirmation)
 * 4. Notify accountant/DIAN representative
 * 5. Generate migration report (old vs new tax obligations)
 */
export function switchTaxRegime(newRegime: TaxRegime): TaxConfig {
  const config = getTaxConfig(newRegime);

  // TODO: Implement in production:
  // 1. Update database: UPDATE config SET active_tax_regime = newRegime
  // 2. Log change: INSERT INTO audit_log (action, old_regime, new_regime, timestamp, user_id)
  // 3. Send notifications
  // 4. Generate migration documentation

  console.warn(`[TAX REGIME CHANGE] Switching from ${getActiveTaxConfig().regime} to ${newRegime}`);
  console.warn(`[TAX REGIME CHANGE] This requires updating the isActive flag in tax-config.ts`);
  console.warn(`[TAX REGIME CHANGE] Changes take effect after restart`);

  return config;
}

/**
 * Calculate final price with taxes
 * Takes base price and applies appropriate taxes
 */
export function calculatePriceWithTaxes(basePriceInCents: number): {
  subtotal: number;
  iva: number;
  reteFuente: number;
  otherTaxes: number;
  total: number;
  taxBreakdown: string;
} {
  const config = getActiveTaxConfig();

  // Calculate IVA
  const iva = config.charges.appliesIVA ? Math.round(basePriceInCents * config.charges.ivaRate) : 0;

  // Calculate Retefuente
  const reteFuente = config.charges.appliesReteFuente
    ? Math.round(basePriceInCents * config.charges.reteFuenteRate)
    : 0;

  // Calculate other taxes
  let otherTaxes = 0;
  if (config.charges.appliesOtherTaxes) {
    otherTaxes = config.charges.otherTaxes.reduce((sum, tax) => {
      return sum + Math.round(basePriceInCents * tax.rate);
    }, 0);
  }

  // Total = subtotal + IVA - Retefuente + other taxes
  const total = basePriceInCents + iva - reteFuente + otherTaxes;

  // Generate breakdown message
  let taxBreakdown = `Régimen: ${config.description}\n`;
  taxBreakdown += `Subtotal: $${(basePriceInCents / 100).toLocaleString('es-CO')} COP\n`;

  if (config.charges.appliesIVA) {
    taxBreakdown += `+ IVA (${config.charges.ivaRate * 100}%): $${(iva / 100).toLocaleString('es-CO')} COP\n`;
  }

  if (config.charges.appliesReteFuente) {
    taxBreakdown += `- Retefuente (${config.charges.reteFuenteRate * 100}%): $${(reteFuente / 100).toLocaleString('es-CO')} COP\n`;
  }

  if (config.charges.appliesOtherTaxes) {
    config.charges.otherTaxes.forEach((tax) => {
      const amount = Math.round(basePriceInCents * tax.rate);
      taxBreakdown += `+ ${tax.name} (${tax.rate * 100}%): $${(amount / 100).toLocaleString('es-CO')} COP\n`;
    });
  }

  taxBreakdown += `---\nTotal a Pagar: $${(total / 100).toLocaleString('es-CO')} COP`;

  return {
    subtotal: basePriceInCents,
    iva,
    reteFuente,
    otherTaxes,
    total,
    taxBreakdown,
  };
}

/**
 * Validate invoice data based on current tax requirements
 * Ensures all required fields are present for DIAN compliance
 */
export function validateInvoiceData(invoiceData: {
  cedula?: string;
  nit?: string;
  rut?: string;
  clientEmail: string;
  amount: number;
}): { valid: boolean; errors: string[] } {
  const config = getActiveTaxConfig();
  const errors: string[] = [];

  if (config.invoicing.requiresCEDULA && !invoiceData.cedula) {
    errors.push('Cédula is required for this tax regime');
  }

  if (config.invoicing.requiresNIT && !invoiceData.nit) {
    errors.push('NIT is required for this tax regime');
  }

  if (config.invoicing.requiresRUT && !invoiceData.rut) {
    errors.push('RUT is required for this tax regime');
  }

  if (!invoiceData.clientEmail) {
    errors.push('Client email is required');
  }

  if (invoiceData.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get DIAN reporting requirements for current regime
 */
export function getDIANReportingRequirements(): {
  required: boolean;
  frequency: string;
  requiredReports: string[];
} {
  const config = getActiveTaxConfig();

  if (!config.reporting.requiresDIANReporting) {
    return {
      required: false,
      frequency: 'NONE',
      requiredReports: [],
    };
  }

  const requiredReports: string[] = [];
  if (config.reporting.requiresVATDeclaration) {
    requiredReports.push('Declaración de IVA (Monthly/Quarterly)');
  }
  if (config.reporting.requiresIncomeDeclaration) {
    requiredReports.push('Declaración de Renta y Complementarios (Annual)');
  }

  return {
    required: true,
    frequency: config.reporting.reportingFrequency,
    requiredReports,
  };
}
