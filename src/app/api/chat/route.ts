import { google } from '@ai-sdk/google';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `
You are Cherine, an intelligent, friendly, and highly proactive sales assistant for FacePrint (faceprint.co.za), "The Banner Factory - Home of 24Hr Banners".

Key Information:
- FacePrint offers a 24-hour turnaround time on all printed products.
- Value Propositions: Same day printing, best prices guaranteed, free shipping on all orders, 100% money-back guarantee.

Your Capabilities (IMPORTANT):
- You have direct access to the database. If a user asks for prices, product options, or if we sell something, you MUST use the \`searchProducts\` tool to find the exact product, price, and description. Do NOT say pricing is dynamic without checking the database first.
- If a user asks for a quote, you MUST use the \`generateInstantQuote\` tool. 
- BEFORE submitting a quote, you MUST ask the user for their Name, Email address, Phone number, and the quantity they need. DO NOT use fake or placeholder data. You must explicitly ask the user for this information if they haven't provided it. Once they provide it, call the \`generateInstantQuote\` tool.

THE FACEPRINT UPSELL STRATEGY:
You are an expert at cross-selling and providing complete solutions. Whenever a customer asks for a product, ALWAYS recommend a complementary item to complete their setup.
- E.g., if they ask for a Gazebo, suggest a Branded Tablecloth or Telescopic Flags.
- E.g., if they ask for a Pullup Banner, suggest Flyers or Business Cards.
Use your intelligence to search for these related items and seamlessly weave them into your response.

THE "ASSUMPTIVE CLOSE":
Do not just give the price and wait. After providing the product details, always use an assumptive close to capture the lead. 
- Example: "Would you like me to generate a formal quote for this? Just drop your name and email address!"

FORMATTING RULES:
- Be polite, professional, and helpful. Keep answers concise.
- ALWAYS use direct Markdown links for products you find using the tool. The link format is: [Product Name](/products/item/{id})
- When quoting a price returned by the tool, format it nicely (e.g. "**R 450.00**").
`;

  const result = await streamText({
    model: google('gemini-flash-lite-latest'),
    system: systemPrompt,
    messages,
    stopWhen: stepCountIs(5),
    tools: {
      searchProducts: tool({
        description: 'Search the database for products to find prices, options, and descriptions.',
        parameters: z.object({
          keyword: z.string().describe('The search keyword, e.g., "banner", "correx", "flag"'),
        }),
        // @ts-ignore
        execute: async ({ keyword }) => {
          const products = await prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: { id: true, name: true, basePrice: true, description: true, sku: true },
          });
          return products;
        },
      }),
      generateInstantQuote: tool({
        description: 'Instantly generate an official Quote/Job for the user. Only call this when you have their name, email, the specific product ID, and quantity.',
        parameters: z.object({
          productId: z.string().describe('The ID of the product they want a quote for (found via searchProducts)'),
          guestName: z.string().describe('The user\'s name'),
          guestEmail: z.string().describe('The user\'s email address'),
          guestPhone: z.string().optional().describe('The user\'s phone number (optional)'),
          quantity: z.number().describe('How many items they need'),
          details: z.string().describe('Any extra details or options they requested'),
        }),
        // @ts-ignore
        execute: async ({ productId, guestName, guestEmail, guestPhone, quantity, details }) => {
          // 1. Find or create Client
          let client = await prisma.client.findUnique({ where: { email: guestEmail } });
          if (!client) {
            client = await prisma.client.create({
              data: {
                contactName: guestName,
                companyName: guestName,
                email: guestEmail,
                phone: guestPhone || '',
              }
            });
          }

          // 2. Fetch Product for pricing
          const product = await prisma.product.findUnique({ where: { id: productId } });
          if (!product) throw new Error('Product not found');

          // 3. Calculate Pricing
          const unitPrice = product.basePrice;
          const totalPrice = unitPrice * quantity;
          const tax = totalPrice * 0.15; // 15% VAT
          const totalAmount = totalPrice + tax;

          // 4. Generate Job Number
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const jobNumber = `Q${year}${month}${day}${hours}${minutes}`;

          // 5. Create Job (Quote)
          const job = await prisma.job.create({
            data: {
              jobNumber,
              status: 'PENDING',
              description: `Automated Quote via Cherine AI: ${details}`,
              totalAmount,
              balance: totalAmount,
              clientId: client.id,
              items: {
                create: [
                  {
                    productId: product.id,
                    description: product.name,
                    quantity,
                    unitPrice,
                    totalPrice
                  }
                ]
              }
            }
          });

          return { 
            success: true, 
            quoteUrl: `/quotes/${job.id}`, 
            message: 'Quote successfully generated! Give the user the quoteUrl so they can click it.' 
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
