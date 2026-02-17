import crypto from 'crypto';

/**
 * Generate Wompi integrity signature (SHA256)
 * Required for generating transactions
 * Formula: SHA256(reference + amount_in_cents + currency + integrityKey)
 */
export function generateWompiSignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integrityKey: string
): string {
  const payload = `${reference}${amountInCents}${currency}${integrityKey}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Verify webhook signature from Wompi
 * X-Wompi-Signature header should match our calculated signature
 */
export function verifyWompiWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  integrityKey: string
): boolean {
  const calculatedSignature = crypto
    .createHash('sha256')
    .update(rawBody + integrityKey)
    .digest('hex');

  return calculatedSignature === receivedSignature;
}

/**
 * Calculate IVA (Value Added Tax) for Colombia
 * Standard rate: 19%
 */
export function calculateIVA(subtotal: number): number {
  return Math.round(subtotal * 0.19);
}

/**
 * Calculate Retención en la Fuente (Source Withholding)
 * For services in Colombia: 3% to 8% depending on type
 * For software services: typically 3%
 */
export function calculateReteFuente(subtotal: number, rate: number = 0.03): number {
  return Math.round(subtotal * rate);
}

/**
 * Calculate total amount to charge including taxes
 * Used for Wompi transaction
 */
export function calculateTotalWithTaxes(
  subtotal: number,
  includeIVA: boolean = true,
  includeReteFuente: boolean = false
): { subtotal: number; iva: number; reteFuente: number; total: number } {
  const iva = includeIVA ? calculateIVA(subtotal) : 0;
  const reteFuente = includeReteFuente ? calculateReteFuente(subtotal) : 0;

  // Total = subtotal + IVA - Retenção
  const total = subtotal + iva - reteFuente;

  return { subtotal, iva, reteFuente, total };
}

/**
 * Generate unique transaction reference
 * Format: PRJ-TIMESTAMP-RANDOM (e.g., PRJ-1708097600000-ABC123)
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PRJ-${timestamp}-${random}`;
}
