'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

interface QuotationRequest {
  description: string;
  clientName: string;
  clientEmail: string;
}

interface Feature {
  name: string;
  description: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedHours: number;
}

interface QuotationResponse {
  title: string;
  features: Feature[];
  basePrice: number;
  estimatedHours: number;
  projectId: string;
}

const COMPLEXITY_HOURS = {
  LOW: 4,
  MEDIUM: 12,
  HIGH: 24,
};

const HOURLY_RATE = 50; // USD

/**
 * Motor de Cotización IA
 * Analiza descripción en lenguaje natural y desglos a features atómicas
 */
export async function generateQuotation(
  request: QuotationRequest
): Promise<QuotationResponse> {
  // 1. Validar usuario autenticado
  const user = await currentUser();
  if (!user || !user.emailAddresses[0]?.emailAddress) {
    throw new Error('Usuario no autenticado');
  }

  // 2. Prompt del Sistema para IA
  const systemPrompt = `Eres un arquitecto de software senior especializado en productizar servicios.
Tu tarea es analizar la descripción de un proyecto del cliente y:
1. Generar un título claro para el proyecto
2. Desglosar en features atómicas (máximo 8 features)
3. Clasificar cada feature por complejidad: LOW (4h), MEDIUM (12h), HIGH (24h)
4. Responder SOLO en JSON válido sin texto adicional

Formato de respuesta:
{
  "title": "Título del proyecto",
  "features": [
    {
      "name": "Feature 1",
      "description": "Descripción breve",
      "complexity": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}`;

  try {
    // 3. Llamar a OpenAI vía Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt: `Cliente solicita: ${request.description}`,
      temperature: 0.7,
    });

    // 4. Parsear respuesta JSON
    const parsed = JSON.parse(text);
    const features = parsed.features.map(
      (f: Omit<Feature, 'estimatedHours'>) => ({
        ...f,
        estimatedHours: COMPLEXITY_HOURS[f.complexity],
      })
    );

    // 5. Calcular precaos
    const totalHours = features.reduce(
      (sum: number, f: Feature) => sum + f.estimatedHours,
      0
    );
    const basePrice = totalHours * HOURLY_RATE;

    // 6. Crear proyecto en BD
    const user_record = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!user_record) {
      throw new Error('Usuario no encontrado en BD');
    }

    const project = await prisma.project.create({
      data: {
        clientId: user_record.id,
        title: parsed.title,
        description: request.description,
        basePrice,
        estimatedHours: totalHours,
        features: {
          createMany: {
            data: features.map((f: Feature) => ({
              name: f.name,
              description: f.description,
              complexity: f.complexity,
              estimatedHours: f.estimatedHours,
            })),
          },
        },
      },
      include: { features: true },
    });

    return {
      title: parsed.title,
      features,
      basePrice,
      estimatedHours: totalHours,
      projectId: project.id,
    };
  } catch (error) {
    console.error('Error en generación de cotización:', error);
    throw new Error(
      `Fallo en cotización IA: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Confirma el Scope Lock (usuario marca todos los checkboxes)
 */
export async function confirmScopeLock(projectId: string): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error('No autenticado');

  // Verificar que todas las features estén confirmadas
  const features = await prisma.feature.findMany({
    where: { projectId },
  });

  const allConfirmed = features.every((f) => f.confirmed);
  if (!allConfirmed) {
    throw new Error('No todas las features han sido confirmadas');
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { scopeConfirmed: true },
  });
}

/**
 * Marca una feature como confirmada (checkbox del usuario)
 */
export async function confirmFeature(
  featureId: string,
  projectId: string
): Promise<void> {
  await prisma.feature.update({
    where: { id: featureId },
    data: { confirmed: true },
  });
}
