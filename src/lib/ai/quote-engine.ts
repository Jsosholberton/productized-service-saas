import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the schema for features
const FeatureSchema = z.object({
  name: z.string().describe('Feature name (e.g., "User Authentication")'),
  description: z.string().describe('Brief description of the feature'),
  estimatedHours: z.number().describe('Estimated development hours'),
});

const QuoteSchema = z.object({
  features: z.array(FeatureSchema).describe('List of atomic features'),
  totalEstimatedHours: z.number().describe('Total estimated development hours'),
  complexity: z.enum(['low', 'medium', 'high']).describe('Project complexity'),
  summary: z.string().describe('Executive summary of the project scope'),
});

type QuoteResult = z.infer<typeof QuoteSchema>;

const BASE_HOURLY_RATE = 50; // USD per hour (adjust based on market)
const MARGIN_MULTIPLIER = 1.3; // 30% margin on top of dev cost

/**
 * Generate a project quote based on user description using OpenAI GPT-4o
 * @param projectDescription - User's project description in natural language
 * @returns Quote with features, total hours, and pricing
 */
export async function generateQuote(projectDescription: string): Promise<{
  features: z.infer<typeof FeatureSchema>[];
  totalPrice: number; // in cents
  totalEstimatedHours: number;
  complexity: string;
  summary: string;
}> {
  const systemPrompt = `You are an expert software architect and product manager.
  
Your task is to analyze project descriptions and break them down into atomic, well-scoped features.

Guidelines:
1. Each feature should be independently deliverable
2. Estimate realistic development hours (consider setup, testing, deployment)
3. Group related functionality logically
4. Be conservative in estimates (add 20% buffer for unknowns)
5. If scope is ambiguous, assume MVP (minimum viable product)
6. For each feature, provide:
   - Clear, descriptive name
   - Brief explanation of what it includes
   - Realistic time estimate in hours

Example breakdown:
- "E-commerce store" → [Product catalog, Shopping cart, Payment integration, User accounts, Admin dashboard, etc.]

Be professional, realistic, and thorough.`;

  const userPrompt = `Analyze this project and create a detailed quote breakdown:

"${projectDescription}"

Provide:
1. A list of atomic features with estimated hours
2. Total estimated hours
3. Complexity assessment (low/medium/high)
4. Executive summary`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: QuoteSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    // Calculate pricing
    const totalHours = result.object.totalEstimatedHours;
    const devCost = totalHours * BASE_HOURLY_RATE; // in USD
    const totalPrice = Math.round(devCost * MARGIN_MULTIPLIER * 100); // convert to cents

    return {
      features: result.object.features,
      totalPrice,
      totalEstimatedHours: totalHours,
      complexity: result.object.complexity,
      summary: result.object.summary,
    };
  } catch (error) {
    console.error('Error generating quote:', error);
    throw new Error('Failed to generate quote. Please try again.');
  }
}

/**
 * Generate a technical blueprint/PRD based on the confirmed features
 * Called after payment is received
 */
export async function generateTechnicalBlueprint(features: {
  name: string;
  description: string;
  estimatedHours: number;
}[]): Promise<string> {
  const systemPrompt = `You are a senior software architect creating technical specifications.
  
Create a comprehensive, professional technical blueprint (PRD) in Markdown format.
Include:
- Project overview
- Tech stack recommendations
- Architecture diagram description
- API specifications (if applicable)
- Database schema overview
- Security considerations
- Testing strategy
- Deployment plan
- Timeline

Be thorough but concise. Use professional terminology.`;

  const featuresList = features
    .map((f) => `- **${f.name}**: ${f.description} (~${f.estimatedHours}h)`)
    .join('\n');

  const userPrompt = `Generate a technical blueprint for a project with these features:

${featuresList}

Provide a detailed, professional technical specification document.`;

  try {
    const result = await openai('gpt-4o').doGenerate({
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.6,
    });

    return result.text;
  } catch (error) {
    console.error('Error generating blueprint:', error);
    throw new Error('Failed to generate technical blueprint.');
  }
}
