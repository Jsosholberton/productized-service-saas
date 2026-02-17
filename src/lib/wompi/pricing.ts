'use server';

import { calculatePriceWithTaxes, validateInvoiceData, getActiveTaxConfig } from '@/lib/config/tax-config';

export interface PricingCalculation {
  basePriceInCents: number;
  taxes: {
    iva: number;
    reteFuente: number;
    otherTaxes: number;
  };
  totalInCents: number;
  breakdown: {
    lineItems: Array<{
      label: string;
      amount: number;
      percentage?: number;
    }>;
    summary: string;
  };
  taxRegime: string;
}

/**
 * Calculate final price for quote
 * Uses current tax configuration
 * Easy to change when tax obligations change
 */
export function calculateProjectPrice(basePriceInCents: number): PricingCalculation {
  const taxCalc = calculatePriceWithTaxes(basePriceInCents);
  const config = getActiveTaxConfig();

  const lineItems: Array<{
    label: string;
    amount: number;
    percentage?: number;
  }> = [];

  lineItems.push({
    label: 'Subtotal',
    amount: basePriceInCents,
  });

  if (config.charges.appliesIVA) {
    lineItems.push({
      label: `IVA (${config.charges.ivaRate * 100}%)`,
      amount: taxCalc.iva,
      percentage: config.charges.ivaRate * 100,
    });
  }

  if (config.charges.appliesReteFuente) {
    lineItems.push({
      label: `Retefuente en la Fuente (${config.charges.reteFuenteRate * 100}%)`,
      amount: -taxCalc.reteFuente,
      percentage: config.charges.reteFuenteRate * 100,
    });
  }

  if (config.charges.appliesOtherTaxes) {
    config.charges.otherTaxes.forEach((tax) => {
      const amount = Math.round(basePriceInCents * tax.rate);
      lineItems.push({
        label: `${tax.name} (${tax.rate * 100}%)`,
        amount,
        percentage: tax.rate * 100,
      });
    });
  }

  return {
    basePriceInCents,
    taxes: {
      iva: taxCalc.iva,
      reteFuente: taxCalc.reteFuente,
      otherTaxes: taxCalc.otherTaxes,
    },
    totalInCents: taxCalc.total,
    breakdown: {
      lineItems,
      summary: taxCalc.taxBreakdown,
    },
    taxRegime: config.regime,
  };
}

/**
 * Format price for display
 */
export function formatPrice(cents: number, locale: string = 'es-CO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Create invoice with tax compliance
 */
export interface InvoiceData {
  projectId: string;
  clientName: string;
  clientEmail: string;
  clientCedula?: string;
  clientNIT?: string;
  clientRUT?: string;
  serviceName: string;
  serviceDescription: string;
  amount: number;
}

export async function createInvoiceData(data: InvoiceData): Promise<{
  valid: boolean;
  invoice?: any;
  errors?: string[];
}> {
  // Validate invoice data against current tax requirements
  const validation = validateInvoiceData({
    cedula: data.clientCedula,
    nit: data.clientNIT,
    rut: data.clientRUT,
    clientEmail: data.clientEmail,
    amount: data.amount,
  });

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
    };
  }

  const priceCalc = calculateProjectPrice(data.amount);
  const config = getActiveTaxConfig();

  const invoice = {
    id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId: data.projectId,
    date: new Date().toISOString(),
    client: {
      name: data.clientName,
      email: data.clientEmail,
      cedula: data.clientCedula,
      nit: data.clientNIT,
      rut: data.clientRUT,
    },
    service: {
      name: data.serviceName,
      description: data.serviceDescription,
    },
    pricing: priceCalc,
    taxRegime: config.regime,
    invoiceNumber: null, // Will be assigned by DIAN if required
    resolution: config.invoicing.resolutionNumber || null,
  };

  return {
    valid: true,
    invoice,
  };
}
