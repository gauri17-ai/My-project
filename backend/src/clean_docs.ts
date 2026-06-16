import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.generatedDocument.deleteMany({
    where: {
      NOT: {
        documentType: 'prd'
      }
    }
  });
  console.log(`Deleted ${result.count} non-prd documents.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
