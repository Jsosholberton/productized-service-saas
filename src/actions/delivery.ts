'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/db';

/**
 * Genera un Blueprint Técnico detallado (PRD) basado en las features del proyecto
 */
export async function generateQuotationPRD(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { features: true },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  const featuresText = project.features
    .map(
      (f) =>
        `- ${f.name}: ${f.description} (Complejidad: ${f.complexity}, ~${f.estimatedHours}h)`
    )
    .join('\n');

  const prompt = `Eres un Product Manager senior. Genera un PRD técnico detallado pero conciso en Markdown para este proyecto:

Título: ${project.title}
Descripción: ${project.description}

Features identificadas:
${featuresText}

Genera una especificación técnica que incluya:
1. Resumen ejecutivo
2. Objetivos del producto
3. Scope del proyecto (lista las features)
4. Requerimientos funcionales
5. Arquitectura recomendada
6. Plan de desarrollo (fases)

Formato: Markdown puro, sin código.
`;

  try {
    const { text: prd } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.6,
    });

    // Guardar PRD en metadatos del proyecto (como archivo virtual)
    // En producción, guardarías en S3 o similar
    console.log(`PRD generado para proyecto ${projectId}`);

    return prd;
  } catch (error) {
    console.error('Error generando PRD:', error);
    throw error;
  }
}

/**
 * Admin sube el archivo .zip del proyecto entregado
 */
export async function uploadProjectDelivery(
  projectId: string,
  zipUrl: string,
  videoUrl: string
): Promise<void> {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'DELIVERED',
      deliveryZipUrl: zipUrl,
      deliveryVideoUrl: videoUrl,
      completedAt: new Date(),
    },
  });

  // Disparar email con enlace de descarga
  try {
    await sendDeliveryEmail(project);
  } catch (error) {
    console.error('Error enviando email de entrega:', error);
  }
}

/**
 * Envía email de entrega al cliente
 */
async function sendDeliveryEmail(project: any) {
  // Aqui usarias Resend para enviar el email
  // Ejemplo (requiere email template):
  /*
  await resend.emails.send({
    from: 'noreply@agencia.co',
    to: project.client.email,
    subject: `Tu proyecto ${project.title} ha sido entregado`,
    html: renderDeliveryEmailTemplate(project),
  });
  */

  console.log(`Email de entrega enviado a ${project.clientId}`);
}
