import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateWompiWebhookSignature, WompiWebhookPayload } from '@/lib/wompi';
import { generateQuotationPRD } from '@/actions/delivery';

/**
 * POST /api/webhooks/wompi
 * Procesa webhooks de Wompi cuando un pago es confirmado/rechazado
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar firma del webhook
    const body = await request.text();
    const signatureHeader = request.headers.get('X-Wompi-Signature') || '';

    const isValid = validateWompiWebhookSignature(
      body,
      signatureHeader,
      process.env.WOMPI_INTEGRITY_KEY || ''
    );

    if (!isValid) {
      console.error('Firma de Wompi inválida');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Parsear payload
    const payload: WompiWebhookPayload = JSON.parse(body);
    const { event, data } = payload;

    // 3. Solo procesar eventos de transacción
    if (!event.includes('transaction')) {
      return NextResponse.json({ received: true });
    }

    const transaction = data.transaction;

    // 4. Buscar transacción en BD
    const dbTransaction = await prisma.transaction.findUnique({
      where: { wompiReference: transaction.reference },
      include: { project: { include: { features: true } } },
    });

    if (!dbTransaction) {
      console.error(`Transacción no encontrada: ${transaction.reference}`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // 5. Actualizar estado de transacción
    const wompiStatus =
      transaction.status === 'APPROVED'
        ? 'APPROVED'
        : transaction.status === 'DECLINED'
          ? 'DECLINED'
          : 'PENDING';

    await prisma.transaction.update({
      where: { id: dbTransaction.id },
      data: {
        wompiStatus,
        wompiTransactionId: transaction.id,
        paymentMethod: transaction.payment_method.type,
        approvedAt: wompiStatus === 'APPROVED' ? new Date() : null,
        errorMessage:
          wompiStatus === 'DECLINED'
            ? `Pago rechazado por ${transaction.payment_method.type}`
            : null,
      },
    });

    // 6. Si el pago fue aprobado, actualizar proyecto
    if (wompiStatus === 'APPROVED') {
      // Cambiar status a IN_QUEUE
      const project = await prisma.project.update({
        where: { id: dbTransaction.projectId },
        data: { status: 'PAYMENT_APPROVED' },
        include: { features: true },
      });

      // Generar Blueprint Técnico con IA
      try {
        await generateQuotationPRD(project.id);
      } catch (error) {
        console.error('Error generando PRD:', error);
        // No fallar el webhook, solo log
      }

      console.log(`Pago aprobado para proyecto ${project.id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en webhook de Wompi:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
