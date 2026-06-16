import { PrismaClient } from '@prisma/client';
import { generateText } from './modules/ai/service';
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.generatedDocument.findMany();
  console.log(`Found ${docs.length} documents.`);

  for (const doc of docs) {
    console.log(`Processing document: ID = ${doc.id}, Title = ${doc.title}`);

    // Detect if Devanagari or common Hinglish words are present in doc.content
    const hasDevanagari = /[\u0900-\u097F]/.test(doc.content);
    // Common transliterated Hindi/Marathi words
    const hasHinglish = /\b(mujhe|banana|karne|hai|kaise|kya|meri|mala|karaych|banvaych|ahe)\b/i.test(doc.content);

    if (hasDevanagari || hasHinglish) {
      console.log(`Document "${doc.title}" is in Hindi/Marathi/Hinglish/Maranglish. Translating to English...`);
      
      const translationPrompt = `Translate the following project document titled "${doc.title}" to clear, professional, and structured English. Preserve all Markdown formatting, sections, headers, and bullet points. Output only the translated document content.
      
      Document Content:
      ${doc.content}`;

      try {
        const translatedContent = await generateText(translationPrompt, [], {
          mentorMode: 'product_manager',
          systemInstruction: 'You are a professional technical translator. Translate the document to clear, professional, structured English. Output only the translated Markdown text.'
        });

        if (translatedContent && translatedContent.trim() !== '') {
          await prisma.generatedDocument.update({
            where: { id: doc.id },
            data: { content: translatedContent.trim() }
          });
          console.log(`Successfully updated document "${doc.title}" to English.`);
        }
      } catch (e) {
        console.error(`Failed to translate document "${doc.title}":`, e);
      }
    } else {
      console.log(`Document "${doc.title}" is already in English.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
