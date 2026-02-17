'use server';

import { prisma } from '@/lib/db';
import {
  generateWompiReference,
  calculateTaxes,
  generateWompiSignature,
  buildWompiCheckoutUrl,
} from '@/lib/wompi';
import { currentUser } from '@clerk/nextjs/server';

interface CreatePaymentRequest {
  projectId: string;
  addSubscription?: boolean;
  subscriptionPrice?: number;
}

export async function createPaymentSession(
  request: CreatePaymentRequest
) {
  const user = await currentUser();
  if (!user || !user.emailAddresses[0]) {
    throw new Error('Usuario no autenticado');
  }

  const userEmail = user.emailAddresses[0].emailAddress;

  // 1. Obtener proyecto
  const project = await prisma.project.findUnique({
    where: { id: request.projectId },
    include: { features: true },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // 2. Validar que scope esté locked
  if (!project.scopeConfirmed) {
    throw new Error('Scope no ha sido confirmado');
  }

  // 3. Calcular total
  let subtotal = project.basePrice;
  if (request.addSubscription && request.subscriptionPrice) {
    subtotal += request.subscriptionPrice; // Setup fee + primer mes
  }

  const { tax, total } = calculateTaxes(subtotal);

  // 4. Generar referencia Wompi
  const wompiReference = generateWompiReference(project.id);

  // 5. Generar firma
  const signature = generateWompiSignature(
    wompiReference,
    total,
    process.env.WOMPI_INTEGRITY_KEY || ''
  );

  // 6. Crear transacción en BD
  const transaction = await prisma.transaction.create({
    data: {
      projectId,
      wompiReference,
      subtotal,
      tax,
      total,
      currency: 'COP',
    },
  });

  // 7. Construir URL de Wompi
  const checkoutUrl = buildWompiCheckoutUrl(
    wompiReference,
    total,
    signature,
    `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    userEmail,
    user.firstName || 'Cliente'
  );

  return {
    transactionId: transaction.id,
    checkoutUrl,
    wompiReference,
    total,
    tax,
    subtotal,
  };
}

/**
 * Crea suscripción cuando el pago es aprobado
 */
export async function createSubscriptionAfterPayment(
  projectId: string,
  monthlyPrice: number
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Calcular próxima fecha de billing (30 días)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  const subscription = await prisma.subscription.create({
    data: {
      userId: project.clientId,
      projectId,
      planName: 'MAINTENANCE',
      monthlyPrice,
      nextBillingDate,
    },
  });

  return subscription;
}
