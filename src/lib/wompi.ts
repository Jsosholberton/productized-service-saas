import crypto from 'crypto';

/**
 * Genera la firma de integridad requerida por Wompi
 * SHA256(referencia + amount + integrityKey)
 */
export function generateWompiSignature(
  reference: string,
  amount: number,
  integrityKey: string
): string {
  const data = `${reference}${amount}${integrityKey}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Valida la firma del webhook recibido de Wompi
 */
export function validateWompiWebhookSignature(
  body: string,
  signatureHeader: string,
  integrityKey: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', integrityKey)
    .update(body)
    .digest('hex');

  return expectedSignature === signatureHeader;
}

/**
 * Calcula IVA (19%) y otros impuestos para Colombia
 */
export function calculateTaxes(subtotal: number): { tax: number; total: number } {
  const ivaRate = 0.19; // IVA estándar Colombia
  const tax = Math.round(subtotal * ivaRate * 100) / 100;
  const total = subtotal + tax;

  return { tax, total };
}

/**
 * Genera una referencia única para la transacción
 */
export function generateWompiReference(projectId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `PRJ-${projectId.substring(0, 6)}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Construye la URL del checkout de Wompi
 */
export function buildWompiCheckoutUrl(
  reference: string,
  amount: number,
  signature: string,
  redirectUrl: string,
  clientEmail: string,
  clientName: string
): string {
  const params = new URLSearchParams({
    public-key: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '',
    reference,
    amount_in_cents: Math.round(amount * 100).toString(),
    signature,
    redirect_url: redirectUrl,
    customer_email: clientEmail,
    customer_name: clientName,
    currency: 'COP',
  });

  return `${process.env.NEXT_PUBLIC_WOMPI_ENDPOINT}?${params.toString()}`;
}

export interface WompiWebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      amount_in_cents: number;
      currency: string;
      status: 'APPROVED' | 'DECLINED' | 'PENDING';
      payment_method: {
        type: string;
      };
      customer_email: string;
      customer_data: {
        phone_number: string;
      };
      timestamp: string;
    };
  };
}
