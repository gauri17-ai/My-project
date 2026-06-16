import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const interactions = await prisma.aIInteraction.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('AI Interactions:', JSON.stringify(interactions, null, 2));

  const conversations = await prisma.conversation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Conversations:', JSON.stringify(conversations, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
