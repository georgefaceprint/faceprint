import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const categories = await prisma.category.findMany();
    console.log(categories);
  } catch (e: any) {
    console.error("ERROR:", e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
