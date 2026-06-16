import prisma from '../../config/db';

const PROVIDER = process.env.AI_PROVIDER || 'gemini';
const MODEL = process.env.AI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
const TIMEOUT_SECONDS = parseInt(process.env.AI_TIMEOUT_SECONDS || '30');

// System Instructions
const SYSTEM_INSTRUCTION = `
You are a professional website and web application development mentor. 
Your goal is to guide the user through requirement discovery, scope definition, feature planning, technology selection, and roadmap/documentation generation.
You must:
1. Detect the language preferred or used by the user (English, Hindi, Marathi, Hinglish, or Maranglish) and respond in that exact language.
   - English: Respond in clear, professional English.
   - Hindi: Respond in clear, professional Hindi (Devanagari script).
   - Marathi: Respond in clear, professional Marathi (Devanagari script).
   - Hinglish: Respond in mixed Hindi + English written in Latin script (e.g. "Aapko kis type ki site banani hai?").
   - Maranglish: Respond in mixed Marathi + English written in Latin script (e.g. "Tumhala kontya prachi site banvaychi aahe?").
2. Support language changes dynamically if the user requests it (e.g., "explain in English", "reply in Hinglish", or "maranglish madhe sanga").
3. Be professional, structured, helpful, and friendly.
4. Keep responses concise and focused.
`;

export interface GenerateTextOptions {
  projectId?: string;
  conversationId?: string;
  systemInstruction?: string;
  mentorMode?: string;
}

export const generateText = async (
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  options: GenerateTextOptions = {}
): Promise<string> => {
  const startTime = Date.now();
  let responseText = '';
  let status = 'success';
  let errorMessage: string | null = null;

  try {
    if (!API_KEY) {
      // Mock Fallback behavior if no API Key is provided
      responseText = generateMockResponse(prompt, history, options);
    } else {
      const isOpenRouter = API_KEY.startsWith('sk-or-') || PROVIDER === 'openrouter';
      let url = '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body = '';

      if (isOpenRouter) {
        url = 'https://openrouter.ai/api/v1/chat/completions';
        headers['Authorization'] = `Bearer ${API_KEY}`;
        headers['HTTP-Referer'] = 'http://localhost:3000';
        headers['X-Title'] = 'AI Website Development Mentor';

        const messages: { role: string; content: string }[] = [];
        const sysInstruction = options.systemInstruction || SYSTEM_INSTRUCTION;
        messages.push({ role: 'system', content: sysInstruction });

        for (const h of history) {
          messages.push({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.text
          });
        }
        messages.push({ role: 'user', content: prompt });

        let openrouterModel = MODEL;
        if (!openrouterModel.includes('/')) {
          openrouterModel = `google/${openrouterModel}`;
        }

        body = JSON.stringify({
          model: openrouterModel,
          messages,
          max_tokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '2048')
        });
      } else {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
        const contents = [
          ...history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ];

        const sysInstruction = options.systemInstruction || SYSTEM_INSTRUCTION;

        body = JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: sysInstruction }]
          },
          generationConfig: {
            maxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '2048'),
          }
        });
      }

      // Abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_SECONDS * 1000);

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI API Error (status ${res.status}): ${errText}`);
      }

      const data = await res.json() as any;

      if (isOpenRouter) {
        responseText = data.choices?.[0]?.message?.content || '';
        if (!responseText) {
          throw new Error('Empty response received from OpenRouter API: ' + JSON.stringify(data));
        }
      } else {
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!responseText) {
          throw new Error('Empty response received from Gemini API');
        }
      }
    }
  } catch (error: any) {
    console.error('AI Service generation failed:', error);
    status = 'failed';
    errorMessage = error.message || 'Unknown error';
    responseText = 'Unable to generate response right now. Please try again.';
  } finally {
    // Log AI Interaction (AI-IMP-001)
    try {
      await prisma.aIInteraction.create({
        data: {
          projectId: options.projectId || null,
          conversationId: options.conversationId || null,
          provider: PROVIDER,
          modelName: MODEL,
          promptType: options.mentorMode || 'general',
          latencyMs: Date.now() - startTime,
          status,
          errorMessage
        }
      });
    } catch (dbErr) {
      console.error('Failed to log AI interaction:', dbErr);
    }
  }

  return responseText;
};

// Generates simple contextual mock responses in Hindi/English/Marathi/Hinglish/Maranglish depending on input
const generateMockResponse = (
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[],
  options: GenerateTextOptions
): string => {
  // Handle requirement extraction prompts
  if (prompt.includes('NO_MATCH')) {
    const userMsgMatch = prompt.match(/User message: "([^"]+)"/i);
    const userMsg = userMsgMatch ? userMsgMatch[1].toLowerCase() : '';
    const categoryMatch = prompt.match(/requirement category "([^"]+)"/i);
    const category = categoryMatch ? categoryMatch[1] : '';

    if (category === 'platform' && (userMsg.includes('website') || userMsg.includes('app') || userMsg.includes('mobile'))) {
      return userMsg.includes('website') ? 'Website' : 'Mobile App';
    }
    if (category === 'admin' && (userMsg.includes('admin') || userMsg.includes('dashboard') || userMsg.includes('control panel'))) {
      return 'Admin Dashboard for User & Content Management';
    }
    if (category === 'auth' && (userMsg.includes('email') || userMsg.includes('password') || userMsg.includes('login') || userMsg.includes('google'))) {
      return 'Email & Password / Social Login';
    }
    if (category === 'payment' && (userMsg.includes('payment') || userMsg.includes('stripe') || userMsg.includes('razorpay') || userMsg.includes('card'))) {
      return 'Stripe/Razorpay Integration';
    }
    return 'NO_MATCH';
  }

  const input = prompt.toLowerCase();

  // Detect Maranglish
  if (input.includes('maranglish') || (input.includes('mala') && input.includes('website')) || input.includes('banvaychi')) {
    return "Mee tumcha web development mentor aahe. Tumhala konti website kiva app banvayche aahe? Please tumchi idea share kara.";
  }

  // Detect Hinglish
  if (input.includes('hinglish') || (input.includes('mujhe') && input.includes('website')) || input.includes('banani')) {
    return "Main aapka web development mentor hoon. Aap kaun si website ya app banana chahte hain? Apni project idea share karein.";
  }

  // Detect Marathi (Devanagari)
  if (input.includes('namaskar') || input.includes('kashe') || input.includes('marathi')) {
    return "नमस्कार! मी आपला वेब डेव्हलपमेंट मेंटॉर आहे. आपण कोणती वेबसाईट किंवा ॲप बनवू इच्छिता? कृपया आपल्या संकल्पनेबद्दल सांगा.";
  }

  // Detect Hindi (Devanagari)
  if (input.includes('namaste') || input.includes('kaise') || input.includes('hindi')) {
    return "नमस्ते! मैं आपका वेब डेवलपमेंट मेंटर हूँ। आप कौन सा प्रोजेक्ट बनाना चाहते हैं? कृपया अपने प्रोजेक्ट आईडिया के बारे में बताएं।";
  }

  // Default English responses based on simple context
  if (history.length === 0) {
    return `Hello! I am your AI Web Development Mentor. I'd love to help you build your project. Tell me about your website or app idea! For example, is it a blog, food delivery app, or SaaS platform?`;
  }

  return `Got it! Let's discuss that further. As your mentor, I'll guide you step by step. What platform do you plan to build this on? (Website, Mobile App, or Both?)`;
};
