import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import prisma from '../../config/db';
import { generateText } from '../ai/service';
import { generatePDF, generateDOCX } from '../../utils/exportHelper';

// POST /api/docs/:document_type
export const generateDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { document_type } = req.params;
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

    const validTypes = ['prd'];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid document type. Allowed types: ${validTypes.join(', ')}` }
      });
    }

    const reqSummary = project.requirements
      .map(r => `- ${r.requirementKey}: ${r.requirementValue || 'Not specified'}`)
      .join('\n');

    const title = `${project.projectName} - Product Requirements Document`;
    const prompt = `Generate a comprehensive Product Requirements Document (PRD) for:
    Project Name: ${project.projectName}
    Description: ${project.description}
    Requirements:
    ${reqSummary}
    
    Structure:
    1. Executive Summary
    2. User Personas & Roles
    3. Functional Requirements
    4. Non-Functional Requirements
    5. Out of Scope Features
    
    Respond only with the PRD markdown text.`;

    let generatedContent = '';
    try {
      generatedContent = await generateText(prompt, [], {
        projectId: project_id,
        mentorMode: 'product_manager',
        systemInstruction: `You are a professional website and web application development mentor and product manager. 
        Your goal is to generate professional project documentation (PRDs, SRS, Use Cases, User Stories, Roadmaps).
        CRITICAL RULE: You must write the entire document in ENGLISH ONLY. Even if the project description, requirements summary, or user inputs are in Hindi, Marathi, Hinglish, or Maranglish, you must translate them and write the final document output strictly in clear, professional English. Do not use Devanagari or transliterated Hindi/Marathi script.`
      });
    } catch (e: any) {
      console.warn('AI document generation failed. Using mock text.', e);
      generatedContent = `# ${title}\n\n## Summary\nThis is a placeholder generated document for project **${project.projectName}** due to API timeout or error.\n\nDescription: ${project.description}`;
    }

    // Save generated document
    const doc = await prisma.generatedDocument.create({
      data: {
        projectId: project_id,
        documentType: document_type,
        title,
        content: generatedContent,
        versionNumber: 1,
        generatedBy: userId
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        document_id: doc.id,
        document_type: doc.documentType,
        version_number: doc.versionNumber,
        content: doc.content
      },
      message: 'Document generated successfully'
    });
  } catch (error: any) {
    console.error('Generate document error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// GET /api/docs/:document_id/export
export const exportDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { document_id } = req.params;
    const format = (req.query.format as string || 'md').toLowerCase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const doc = await prisma.generatedDocument.findFirst({
      where: { id: document_id, user: { id: userId } }
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found or access denied' }
      });
    }

    if (format === 'json') {
      return res.status(200).json({
        success: true,
        data: {
          id: doc.id,
          title: doc.title,
          document_type: doc.documentType,
          content: doc.content,
          version: doc.versionNumber,
          created_at: doc.createdAt
        }
      });
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(doc.title, doc.content);
      const fileName = `${doc.title.replace(/\s+/g, '_')}_v${doc.versionNumber}.pdf`;
      res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-type', 'application/pdf');
      return res.send(pdfBuffer);
    }

    if (format === 'docx') {
      const docxBuffer = await generateDOCX(doc.title, doc.content);
      const fileName = `${doc.title.replace(/\s+/g, '_')}_v${doc.versionNumber}.docx`;
      res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      return res.send(docxBuffer);
    }

    // Export as Markdown attachment download
    const fileName = `${doc.title.replace(/\s+/g, '_')}_v${doc.versionNumber}.md`;
    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', 'text/markdown');
    return res.send(doc.content);
  } catch (error: any) {
    console.error('Export document error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// GET /api/docs/project/:project_id
export const getProjectDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const docs = await prisma.generatedDocument.findMany({
      where: { projectId: project_id, project: { userId } },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: docs.map(d => ({
        id: d.id,
        document_type: d.documentType,
        title: d.title,
        version: d.versionNumber,
        created_at: d.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Get project documents error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};
