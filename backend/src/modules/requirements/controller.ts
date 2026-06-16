import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import prisma from '../../config/db';
import { generateText } from '../ai/service';

// Helper to calculate project completion percentage based on mandatory requirements
export const calculateCompletionPercentage = async (projectId: string): Promise<number> => {
  const requirements = await prisma.requirement.findMany({
    where: { projectId, isMandatory: true }
  });
  if (requirements.length === 0) return 0;
  const answered = requirements.filter(r => r.status === 'answered' || r.status === 'validated').length;
  return Math.round((answered / requirements.length) * 100);
};

// GET /api/requirements/:project_id
export const getRequirements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: project_id, userId, deletedAt: null }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found or access denied' }
      });
    }

    const requirements = await prisma.requirement.findMany({
      where: { projectId: project_id },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: requirements.map(r => ({
        id: r.id,
        category: r.category,
        requirement_key: r.requirementKey,
        requirement_value: r.requirementValue,
        status: r.status,
        is_mandatory: r.isMandatory,
        source_message_id: r.sourceMessageId
      })),
      message: 'Requirements fetched successfully'
    });
  } catch (error: any) {
    console.error('Get requirements error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};


// POST /api/requirements/analyze
export const analyzeRequirements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id, idea } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: project_id, userId, deletedAt: null }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Call AI to identify applicable categories and generate summary
    const prompt = `Analyze this project idea: "${idea || project.description}".
    Identify the project type, a brief summary, and which of these mandatory requirement categories are relevant:
    - platform (Website, Web App, Mobile App, Both)
    - user_roles (Customer, Admin, etc.)
    - business_goal (Core objective)
    - features (Core functions)
    - auth (Auth requirements)
    - storage (Data storage assumptions)
    - admin (Admin dashboard requirements)
    - payment (Is online payment needed?)
    - notifications (SMS, Email, Push notifications)
    - deployment (Hosting preferences)

    Respond ONLY with a JSON object following this interface:
    {
      "project_type": string,
      "summary": string,
      "relevant_categories": string[]
    }`;

    let parsedResult;
    try {
      const aiResponse = await generateText(prompt, [], {
        projectId: project_id,
        mentorMode: 'business_analyst'
      });
      // Simple JSON parser extraction in case markdown wrapping is present
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResult = JSON.parse(aiResponse.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error('No valid JSON structure found in AI response');
      }
    } catch (e) {
      console.warn('AI analysis failed or returned invalid JSON. Using fallback.', e);
      parsedResult = {
        project_type: project.projectType || 'Web Application',
        summary: project.description.substring(0, 100) + '...',
        relevant_categories: ['platform', 'user_roles', 'business_goal', 'features', 'auth', 'storage', 'admin', 'payment', 'notifications', 'deployment']
      };
    }

    // Seed requirements in database
    await prisma.requirement.deleteMany({ where: { projectId: project_id } });

    const requirementsData = parsedResult.relevant_categories.map((cat: string) => ({
      projectId: project_id,
      category: cat,
      requirementKey: cat,
      requirementValue: null,
      status: 'pending',
      isMandatory: true
    }));

    await prisma.requirement.createMany({
      data: requirementsData
    });

    // Update project with type/category if applicable
    await prisma.project.update({
      where: { id: project_id },
      data: {
        projectType: parsedResult.project_type,
        requirementCompletionPercentage: 0
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        project_summary: parsedResult.summary,
        detected_project_type: parsedResult.project_type,
        missing_categories: parsedResult.relevant_categories,
        completion_percentage: 0
      },
      message: 'Requirement analysis completed successfully'
    });
  } catch (error: any) {
    console.error('Analyze requirements error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/requirements/question
export const generateNextQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: project_id, userId, deletedAt: null }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Find first pending requirement
    const pendingReq = await prisma.requirement.findFirst({
      where: { projectId: project_id, status: 'pending' },
      orderBy: { createdAt: 'asc' }
    });

    if (!pendingReq) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No pending requirements. Discovery completed!'
      });
    }

    // Generate question via AI or local template
    const prompt = `For the project "${project.projectName}" (${project.projectType}), generate ONE follow-up question to discover the requirements for the category: "${pendingReq.category}".
    
    Provide options if it is a choice question (e.g. single_choice, yes_no, multi_choice).
    
    Respond ONLY with a JSON object following this format:
    {
      "requirement_key": "${pendingReq.category}",
      "question": "The question text here",
      "answer_type": "single_choice" | "multi_choice" | "yes_no" | "text",
      "options": ["Option A", "Option B", ...] // array of strings or null
    }`;

    let parsedResult;
    try {
      const aiResponse = await generateText(prompt, [], {
        projectId: project_id,
        mentorMode: 'business_analyst'
      });
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResult = JSON.parse(aiResponse.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error('No valid JSON structure found in AI response');
      }
    } catch (e) {
      console.warn('AI question generation failed. Using default template.', e);
      // Basic fallback question templates based on category
      const fallbackQuestions: Record<string, any> = {
        platform: { question: 'What platform do you plan to build this on?', answer_type: 'single_choice', options: ['Website', 'Mobile App', 'Both'] },
        user_roles: { question: 'Which user roles will interact with your system?', answer_type: 'multi_choice', options: ['Admin', 'Customer/End-user', 'Partner/Merchant'] },
        auth: { question: 'What authentication methods do you want to offer?', answer_type: 'multi_choice', options: ['Email and Password', 'Social Sign-on (Google/Facebook)', 'OTP/Mobile Login'] },
        payment: { question: 'Do you need payment gateway integration?', answer_type: 'yes_no', options: ['Yes', 'No'] },
        notifications: { question: 'What notification methods are required?', answer_type: 'multi_choice', options: ['Email', 'SMS', 'Push Notifications', 'None'] }
      };

      parsedResult = fallbackQuestions[pendingReq.category] || {
        requirement_key: pendingReq.category,
        question: `Can you describe your requirements for "${pendingReq.category}"?`,
        answer_type: 'text',
        options: null
      };
    }

    // Save question in requirement_questions table
    const questionRecord = await prisma.requirementQuestion.create({
      data: {
        projectId: project_id,
        requirementKey: pendingReq.category,
        questionText: parsedResult.question,
        answerType: parsedResult.answer_type,
        options: parsedResult.options ? JSON.stringify(parsedResult.options) : null,
        displayOrder: 1,
        status: 'pending'
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        question_id: questionRecord.id,
        requirement_key: pendingReq.category,
        question: parsedResult.question,
        answer_type: parsedResult.answer_type,
        options: parsedResult.options || []
      },
      message: 'Next question generated successfully'
    });
  } catch (error: any) {
    console.error('Generate question error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/requirements/answer
export const saveRequirementAnswer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id, question_id, requirement_key, answer } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: project_id, userId, deletedAt: null }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Update Requirement
    await prisma.requirement.updateMany({
      where: { projectId: project_id, requirementKey: requirement_key },
      data: {
        requirementValue: answer,
        status: 'answered'
      }
    });

    // Update Question record if ID was passed
    if (question_id) {
      await prisma.requirementQuestion.update({
        where: { id: question_id },
        data: {
          status: 'answered',
          answeredAt: new Date()
        }
      });
    }

    // Recalculate progress
    const newCompletion = await calculateCompletionPercentage(project_id);

    // Save update to project
    await prisma.project.update({
      where: { id: project_id },
      data: {
        requirementCompletionPercentage: newCompletion,
        status: newCompletion === 100 ? 'completed' : 'in_progress'
      }
    });

    // Check if next requirement is needed
    const nextReq = await prisma.requirement.findFirst({
      where: { projectId: project_id, status: 'pending' }
    });

    return res.status(200).json({
      success: true,
      data: {
        requirement_key,
        status: 'answered',
        completion_percentage: newCompletion,
        next_required: !!nextReq
      },
      message: 'Requirement answer saved successfully'
    });
  } catch (error: any) {
    console.error('Save answer error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/requirements/validate
export const validateRequirements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const pendingMandatory = await prisma.requirement.findMany({
      where: {
        projectId: project_id,
        isMandatory: true,
        status: 'pending'
      }
    });

    const completion = await calculateCompletionPercentage(project_id);

    return res.status(200).json({
      success: true,
      data: {
        is_ready_for_recommendation: pendingMandatory.length === 0,
        completion_percentage: completion,
        missing_mandatory_requirements: pendingMandatory.map(r => r.requirementKey)
      },
      message: 'Requirements validated successfully'
    });
  } catch (error: any) {
    console.error('Validate requirements error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};
