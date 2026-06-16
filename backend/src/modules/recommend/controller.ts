import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import prisma from '../../config/db';
import { generateText } from '../ai/service';

// GET /api/recommend/:project_id
export const getRecommendations = async (req: AuthenticatedRequest, res: Response) => {
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

    const recommendations = await prisma.recommendation.findMany({
      where: { projectId: project_id }
    });

    const formattedRecs = recommendations.map(r => {
      let parsedText = r.recommendationText;
      try {
        parsedText = JSON.parse(r.recommendationText);
      } catch (e) {
        // Keep as string if not parseable
      }
      return {
        id: r.id,
        recommendation_type: r.recommendationType,
        recommendation_text: parsedText,
        confidence_score: r.confidenceScore,
        rationale: r.rationale,
        created_at: r.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedRecs,
      message: 'Recommendations fetched successfully'
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/recommend/technology
export const generateTechRecommendation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id, constraints } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: project_id, userId, deletedAt: null },
      include: { requirements: true }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Format requirements for prompt context
    const reqSummary = project.requirements
      .map(r => `${r.requirementKey}: ${r.requirementValue || 'Not specified'}`)
      .join('\n');

    const budget = constraints?.budget || 'low/medium';
    const skill = constraints?.team_skill || 'beginner/intermediate';
    const deploy = constraints?.deployment_preference || 'cloud';

    const prompt = `As a Solution Architect, recommend a complete technology stack for this project:
    Project Name: ${project.projectName}
    Description: ${project.description}
    Requirements gathered:
    ${reqSummary}
    
    Constraints:
    - Budget: ${budget}
    - Team Skill: ${skill}
    - Deployment Preference: ${deploy}

    Respond ONLY with a JSON object following this interface:
    {
      "frontend": string,
      "backend": string,
      "database": string,
      "authentication": string,
      "deployment": string,
      "rationale": string
    }`;

    let parsedResult;
    try {
      const aiResponse = await generateText(prompt, [], {
        projectId: project_id,
        mentorMode: 'solution_architect'
      });
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResult = JSON.parse(aiResponse.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error('No valid JSON structure found in AI response');
      }
    } catch (e) {
      console.warn('AI tech recommendation failed. Using fallback.', e);
      parsedResult = {
        frontend: 'Next.js + TypeScript + Tailwind CSS',
        backend: 'Node.js + Express.js',
        database: 'PostgreSQL',
        authentication: 'JWT + Refresh Token',
        deployment: 'Vercel frontend, Render backend, managed PostgreSQL',
        rationale: 'Recommended for beginner-friendly development, clean JS/TS ecosystem and robust scalability.'
      };
    }

    // Save recommendation in database
    await prisma.recommendation.deleteMany({
      where: { projectId: project_id, recommendationType: 'technology' }
    });

    await prisma.recommendation.create({
      data: {
        projectId: project_id,
        recommendationType: 'technology',
        recommendationText: JSON.stringify(parsedResult),
        confidenceScore: 0.95,
        rationale: parsedResult.rationale
      }
    });

    return res.status(200).json({
      success: true,
      data: parsedResult,
      message: 'Technology recommendation generated successfully'
    });
  } catch (error: any) {
    console.error('Generate tech recommendation error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/recommend/features
export const generateFeatureRecommendation = async (req: AuthenticatedRequest, res: Response) => {
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
      where: { id: project_id, userId, deletedAt: null },
      include: { requirements: true }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const reqSummary = project.requirements
      .map(r => `${r.requirementKey}: ${r.requirementValue || 'Not specified'}`)
      .join('\n');

    const prompt = `As a Product Manager, suggest feature recommendations for this project:
    Project Name: ${project.projectName}
    Description: ${project.description}
    Requirements gathered:
    ${reqSummary}

    Respond ONLY with a JSON object following this interface:
    {
      "must_have": string[],
      "should_have": string[],
      "future": string[]
    }`;

    let parsedResult;
    try {
      const aiResponse = await generateText(prompt, [], {
        projectId: project_id,
        mentorMode: 'product_manager'
      });
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResult = JSON.parse(aiResponse.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error('No valid JSON structure found in AI response');
      }
    } catch (e) {
      console.warn('AI feature recommendation failed. Using fallback.', e);
      parsedResult = {
        must_have: ['User registration and Login', 'Project board/management', 'Basic search functionality'],
        should_have: ['Document Export in Markdown', 'Interactive walkthrough tool'],
        future: ['Team collaboration workspaces', 'Visual flow dashboard builder']
      };
    }

    // Save recommendations in database
    await prisma.recommendation.deleteMany({
      where: { projectId: project_id, recommendationType: 'features' }
    });

    await prisma.recommendation.create({
      data: {
        projectId: project_id,
        recommendationType: 'features',
        recommendationText: JSON.stringify(parsedResult),
        confidenceScore: 0.90,
        rationale: 'Generated based on standard project template categories'
      }
    });

    return res.status(200).json({
      success: true,
      data: parsedResult,
      message: 'Feature recommendations generated successfully'
    });
  } catch (error: any) {
    console.error('Generate feature recommendation error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};
