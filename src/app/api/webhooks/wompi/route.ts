import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWompiWebhookSignature } from '@/lib/wompi/integrity';
import { generateTechnicalBlueprint } from '@/lib/ai/quote-engine';

const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;

export async function POST(req: NextRequest) {
  try {
    // Verify signature from header
    const signature = req.headers.get('x-wompi-signature');
    if (!signature || !WOMPI_INTEGRITY_KEY) {
      console.error('Missing signature or integrity key');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify signature
    const isValid = verifyWompiWebhookSignature(
      rawBody,
      signature,
      WOMPI_INTEGRITY_KEY
    );

    if (!isValid) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    // Handle transaction.updated event
    if (event === 'transaction.updated') {
      const transaction = data.transaction;
      const { reference, status, id: wompiId } = transaction;

      // Update transaction in database
      const dbTransaction = await prisma.transaction.findUnique({
        where: { reference },
        include: { project: { include: { features: true } } },
      });

      if (!dbTransaction) {
        console.warn(`Transaction not found for reference: ${reference}`);
        return NextResponse.json(
          { message: 'Transaction not found' },
          { status: 404 }
        );
      }

      // Map Wompi status to our enum
      let statusMap: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING' = 'PENDING';
      if (status === 'APPROVED') statusMap = 'APPROVED';
      else if (status === 'DECLINED') statusMap = 'DECLINED';
      else if (status === 'VOIDED') statusMap = 'VOIDED';
      else if (status === 'ERROR') statusMap = 'ERROR';

      // Update transaction
      await prisma.transaction.update({
        where: { id: dbTransaction.id },
        data: {
          wompiStatus: statusMap,
          wompiId: wompiId,
          approvedAt: statusMap === 'APPROVED' ? new Date() : null,
        },
      });

      // If payment approved, update project status and generate blueprint
      if (statusMap === 'APPROVED') {
        const project = dbTransaction.project;

        // Generate technical blueprint
        const blueprint = await generateTechnicalBlueprint(
          project.features.map((f) => ({
            name: f.name,
            description: f.description,
            estimatedHours: f.estimatedHours,
          }))
        );

        // Log blueprint for now (in production, save to S3 or database)
        console.log(`Blueprint generated for project ${project.id}:`, blueprint.substring(0, 100) + '...');

        // Update project status
        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: 'PAID',
          },
        });

        // TODO: Send email to admin and client
        // - Admin: "New project ready for development" with blueprint
        // - Client: "Payment received, development starts soon"
      }

      return NextResponse.json(
        { message: 'Webhook processed successfully' },
        { status: 200 }
      );
    }

    // For other events, just acknowledge
    return NextResponse.json(
      { message: 'Event received' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
