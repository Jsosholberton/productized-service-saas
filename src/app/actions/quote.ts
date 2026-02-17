'use server';

import { generateQuote } from '@/lib/ai/quote-engine';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { generateTransactionReference } from '@/lib/wompi/integrity';

interface GenerateQuoteInput {
  description: string;
}

interface QuoteResponse {
  success: boolean;
  projectId?: string;
  error?: string;
  data?: {
    features: Array<{ name: string; description: string; estimatedHours: number }>;
    totalPrice: number;
    totalEstimatedHours: number;
    complexity: string;
    summary: string;
  };
}

/**
 * Generate quote and create project in database
 * Returns project ID and quote details
 */
export async function generateProjectQuote(input: GenerateQuoteInput): Promise<QuoteResponse> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!input.description || input.description.trim().length < 10) {
      return { success: false, error: 'Description must be at least 10 characters' };
    }

    // Get or create user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: '',
        role: 'CLIENT',
      },
    });

    // Generate quote using AI
    const quoteData = await generateQuote(input.description);

    // Create project in database
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: `Project - ${new Date().toLocaleDateString()}`,
        description: input.description,
        basePrice: quoteData.totalPrice,
        totalPrice: quoteData.totalPrice,
        status: 'PENDING',
        features: {
          createMany: {
            data: quoteData.features.map((feature) => ({
              name: feature.name,
              description: feature.description,
              estimatedHours: feature.estimatedHours,
              confirmed: false,
            })),
          },
        },
      },
      include: {
        features: true,
      },
    });

    return {
      success: true,
      projectId: project.id,
      data: {
        features: quoteData.features,
        totalPrice: quoteData.totalPrice,
        totalEstimatedHours: quoteData.totalEstimatedHours,
        complexity: quoteData.complexity,
        summary: quoteData.summary,
      },
    };
  } catch (error) {
    console.error('Error generating quote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate quote',
    };
  }
}

/**
 * Confirm scope lock - user confirms all features
 */
export async function confirmScopeLock(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify user owns project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project || project.user.clerkId !== userId) {
      return { success: false, error: 'Project not found or access denied' };
    }

    // Verify all features are confirmed
    const allConfirmed = await prisma.feature.findMany({
      where: { projectId, confirmed: false },
    });

    if (allConfirmed.length > 0) {
      return { success: false, error: 'All features must be confirmed' };
    }

    // Lock scope
    await prisma.project.update({
      where: { id: projectId },
      data: {
        scopeLocked: true,
        scopeLockedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error confirming scope lock:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm scope',
    };
  }
}

/**
 * Mark feature as confirmed by user
 */
export async function confirmFeature(featureId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify user owns the project that contains this feature
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
      include: { project: { include: { user: true } } },
    });

    if (!feature || feature.project.user.clerkId !== userId) {
      return { success: false, error: 'Feature not found or access denied' };
    }

    // Mark as confirmed
    await prisma.feature.update({
      where: { id: featureId },
      data: { confirmed: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error confirming feature:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm feature',
    };
  }
}

/**
 * Create payment transaction in Wompi
 */
export async function createTransaction(
  projectId: string,
  includeMaintenancePlan: boolean = false
): Promise<{
  success: boolean;
  transactionId?: string;
  wompiReference?: string;
  totalAmount?: number;
  wompiCheckoutUrl?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true, subscription: true },
    });

    if (!project || project.user.clerkId !== userId) {
      return { success: false, error: 'Project not found' };
    }

    if (!project.scopeLocked) {
      return { success: false, error: 'Scope must be locked first' };
    }

    // Calculate total
    let totalAmount = project.totalPrice;
    if (includeMaintenancePlan) {
      // Add first month of maintenance (if selected)
      const maintenancePrice = Math.round(15000 * 100); // $150/month in cents
      totalAmount += maintenancePrice;
    }

    // Generate reference
    const reference = generateTransactionReference();

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        projectId,
        wompiId: '', // Will be updated by webhook
        reference,
        amountInCents: totalAmount,
        currency: 'COP',
        subtotal: project.totalPrice,
        ivaTax: 0,
        reteFuente: 0,
        wompiStatus: 'PENDING',
      },
    });

    // TODO: Integrate with Wompi API to generate actual checkout
    // For now, return transaction data
    const wompiCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${transaction.id}`;

    return {
      success: true,
      transactionId: transaction.id,
      wompiReference: reference,
      totalAmount,
      wompiCheckoutUrl,
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transaction',
    };
  }
}
