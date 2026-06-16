import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import prisma from '../../config/db';
import { generateText } from '../ai/service';

// POST /api/chat/message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id, message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication is required',
        },
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'project_id is required',
        },
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message content cannot be empty',
        },
      });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: project_id,
        userId,
        deletedAt: null,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        },
      });
    }

    // Determine session ID (use a simple UUID or query the last session_id, or create a new one if empty)
    const lastMessage = await prisma.conversation.findFirst({
      where: { projectId: project_id },
      orderBy: { createdAt: 'desc' },
    });

    const sessionId = lastMessage?.sessionId || crypto.randomUUID();

    // 1. Save User Message to Database
    const userMessageRecord = await prisma.conversation.create({
      data: {
        userId,
        projectId: project_id,
        sessionId,
        senderType: 'user',
        message: message.trim(),
      },
    });

    // 2. Fetch Recent Chat History for LLM Context (last 10 messages for simplicity and token limits)
    const recentMessages = await prisma.conversation.findMany({
      where: { projectId: project_id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Reverse to chronological order for LLM context
    const contextHistory = recentMessages
      .reverse()
      .filter((m) => m.id !== userMessageRecord.id) // Exclude current user message
      .map((m) => ({
        role: (m.senderType === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.message,
      }));

    // Fetch user preference to use as fallback/default language
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true }
    });
    const preferredLanguage = userRecord?.preferredLanguage || 'en';

    // Auto-detect the exact language of the incoming message
    let detectedLanguage = 'en';
    const lowerMessage = message.toLowerCase();
    const hasDevanagari = /[\u0900-\u097F]/.test(message);

    if (hasDevanagari) {
      // Differentiate Marathi vs Hindi using common grammatical markers
      // Marathi markers: आहे (ahe), काय (kay), करतो (karato), नाही (nahi), झाले (zhale), मला (mala - devanagari)
      if (/आहे|काय|करतो|नाही|झाले|काही|नको|तेव्हा|केला|केली/.test(message)) {
        detectedLanguage = 'mr';
      } else {
        detectedLanguage = 'hi';
      }
    } else {
      // Latin script - detect Hinglish, Maranglish, or English
      // Common Maranglish patterns: mala, karaych, banvaych, karu, nahi/nahy, pan, kont, kas, maz, krt, ahe
      const maranglishWords = /\b(mala|karaych|banvaych|karu|nahy|pan|kont|kas|maz|krt|ahe|chaltel|pahije)\b/;
      // Common Hinglish patterns: mujhe, banana, karne, hai, kaise, kya, meri, ko, se, krna, chalega, chahiye
      const hinglishWords = /\b(mujhe|banana|karne|hai|kaise|kya|meri|krna|chalega|chahiye|hoga|bana)\b/;

      if (maranglishWords.test(lowerMessage)) {
        detectedLanguage = 'maranglish';
      } else if (hinglishWords.test(lowerMessage)) {
        detectedLanguage = 'hinglish';
      } else if (lowerMessage.includes('english')) {
        detectedLanguage = 'en';
      } else if (lowerMessage.includes('marathi') || lowerMessage.includes('मराठी')) {
        detectedLanguage = 'mr';
      } else if (lowerMessage.includes('hindi') || lowerMessage.includes('हिंदी')) {
        detectedLanguage = 'hi';
      } else {
        // Fallback to the user's settings preference
        detectedLanguage = preferredLanguage;
      }
    }

    // 3. Dynamic Requirement Tracking
    // Seed requirements if none exist
    let requirements = await prisma.requirement.findMany({
      where: { projectId: project_id }
    });

    if (requirements.length === 0) {
      // Seed default requirements
      const defaultCategories = ['platform', 'user_roles', 'business_goal', 'features', 'auth', 'storage', 'admin', 'payment', 'notifications', 'deployment'];
      await prisma.requirement.createMany({
        data: defaultCategories.map(cat => ({
          projectId: project_id,
          category: cat,
          requirementKey: cat,
          requirementValue: null,
          status: 'pending',
          isMandatory: true
        }))
      });
      requirements = await prisma.requirement.findMany({
        where: { projectId: project_id }
      });
    }

    let pendingReq = requirements.find(r => r.status === 'pending');
    let updatedPercentage = project.requirementCompletionPercentage;

    if (pendingReq) {
      // Ask AI to extract answer if present
      const extractionPrompt = `User message: "${message.trim()}"
      Does this message contain information that answers the requirement category "${pendingReq.category}"?
      If yes, reply with only the extracted answer.
      If no, reply with exactly "NO_MATCH".`;

      try {
        const extraction = await generateText(extractionPrompt, [], {
          projectId: project_id,
          mentorMode: 'business_analyst'
        });

        if (extraction.trim() && !extraction.includes('NO_MATCH')) {
          await prisma.requirement.update({
            where: { id: pendingReq.id },
            data: {
              requirementValue: extraction.trim(),
              status: 'answered',
              sourceMessageId: userMessageRecord.id
            }
          });

          // Recalculate completion
          const allReqs = await prisma.requirement.findMany({ where: { projectId: project_id } });
          const answeredCount = allReqs.filter(r => r.status === 'answered').length;
          updatedPercentage = Math.round((answeredCount / allReqs.length) * 100);

          await prisma.project.update({
            where: { id: project_id },
            data: {
              requirementCompletionPercentage: updatedPercentage,
              status: updatedPercentage === 100 ? 'completed' : 'in_progress'
            }
          });

          // Move to next pending requirement
          requirements = await prisma.requirement.findMany({ where: { projectId: project_id } });
          pendingReq = requirements.find(r => r.status === 'pending');
        }
      } catch (err) {
        console.warn('Requirement extraction failed:', err);
      }
    }

    // Call AI to generate chat response and build the next question
    let systemPromptModifier = '';
    if (pendingReq) {
      systemPromptModifier = `\nThe current requirement discovery progress is ${updatedPercentage}%.
      Please ask a follow-up question for the category: "${pendingReq.category}".
      Be sure to ask ONLY ONE question at a time.`;
    } else {
      systemPromptModifier = `\nAll requirements have been gathered! The discovery progress is 100%. 
      Summarize the project structure and let the user know they can now view the Summary, Tech Stack, Roadmap, and Documentation tabs.`;
    }

    // Force strict script rules for transliterated languages
    let scriptRestriction = '';
    if (detectedLanguage === 'hinglish') {
      scriptRestriction = `\n[CRITICAL SCRIPT RULE]: Respond in HINGLISH (mixed Hindi + English) using LATIN ALPHABET ONLY. Do NOT use any Devanagari characters (like नमस्ते or है). Write all Hindi/English words in English letters. Example: "Main aapki help kar sakta hoon."`;
    } else if (detectedLanguage === 'maranglish') {
      scriptRestriction = `\n[CRITICAL SCRIPT RULE]: Respond in MARANGLISH (mixed Marathi + English) using LATIN ALPHABET ONLY. Do NOT use any Devanagari characters. Write all Marathi/English words in English letters. Example: "Mee tumhala project banvaychi tips deto."`;
    } else if (detectedLanguage === 'hi') {
      scriptRestriction = `\n[CRITICAL SCRIPT RULE]: Respond in clear HINDI using DEVANAGARI script only. Do NOT transliterate into English letters.`;
    } else if (detectedLanguage === 'mr') {
      scriptRestriction = `\n[CRITICAL SCRIPT RULE]: Respond in clear MARATHI using DEVANAGARI script only. Do NOT transliterate into English letters.`;
    }

    const aiResponse = await generateText(message.trim(), contextHistory, {
      projectId: project_id,
      conversationId: userMessageRecord.id,
      systemInstruction: `You are a professional website and web application development mentor. 
      Your goal is to guide the user through requirement discovery, scope definition, feature planning, technology selection, and roadmap/documentation generation.
      You must:
      1. Respond in the user's preferred/detected language: "${detectedLanguage}". ${scriptRestriction}
         - If "${detectedLanguage}" is "en", respond in clear, professional English.
         - If "${detectedLanguage}" is "hi", respond in clear, professional Hindi (using Devanagari script).
         - If "${detectedLanguage}" is "mr", respond in clear, professional Marathi (using Devanagari script).
         - If "${detectedLanguage}" is "hinglish", respond in Hinglish (mixed Hindi + English written in Latin script, e.g., "Main aapka web development mentor hoon. Aapko kis tarah ki website banani hai?").
         - If "${detectedLanguage}" is "maranglish", respond in Maranglish (mixed Marathi + English written in Latin script, e.g., "Mee tumcha web development mentor aahe. Tumhala kontya type chi website banvaychi aahe?").
      2. Support language changes dynamically if the user requests it (e.g. "explain in Marathi", "now reply in Hinglish", or "maranglish me bolo").
      3. Be professional, structured, helpful, and friendly.
      4. Keep responses concise and focused. ${systemPromptModifier}`,
      mentorMode: 'business_analyst',
    });

    // 4. Save AI Response to Database
    const aiMessageRecord = await prisma.conversation.create({
      data: {
        userId,
        projectId: project_id,
        sessionId,
        senderType: 'ai',
        message: aiResponse,
        detectedLanguage,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        conversation_id: aiMessageRecord.id,
        ai_response: aiResponse,
        detected_language: detectedLanguage,
        next_action: pendingReq ? 'answer_requirement_question' : 'discovery_completed',
        requirement_completion_percentage: updatedPercentage,
      },
      message: 'AI response generated successfully',
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while generating AI response',
      },
    });
  }
};

// GET /api/chat/history/:project_id
export const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { project_id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication is required',
        },
      });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: project_id,
        userId,
        deletedAt: null,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        },
      });
    }

    const messages = await prisma.conversation.findMany({
      where: { projectId: project_id },
      orderBy: { createdAt: 'asc' },
    });

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      sender_type: m.senderType,
      message: m.message,
      created_at: m.createdAt.toISOString(),
    }));

    return res.status(200).json({
      success: true,
      data: {
        messages: formattedMessages,
      },
      message: 'Chat history fetched successfully',
    });
  } catch (error: any) {
    console.error('Fetch chat history error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching chat history',
      },
    });
  }
};

// DELETE /api/chat/history/:project_id
export const clearChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { project_id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication is required',
        },
      });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: project_id,
        userId,
        deletedAt: null,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        },
      });
    }

    // Delete conversations, reset project progress, and clear requirements
    await prisma.$transaction([
      prisma.conversation.deleteMany({
        where: { projectId: project_id },
      }),
      prisma.requirement.updateMany({
        where: { projectId: project_id },
        data: {
          requirementValue: null,
          status: 'pending',
          sourceMessageId: null,
        },
      }),
      prisma.project.update({
        where: { id: project_id },
        data: {
          requirementCompletionPercentage: 0,
          status: 'draft',
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Chat history cleared successfully',
    });
  } catch (error: any) {
    console.error('Clear chat history error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while clearing chat history',
      },
    });
  }
};
