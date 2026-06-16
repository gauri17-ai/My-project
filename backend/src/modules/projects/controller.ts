import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import prisma from '../../config/db';

// POST /api/projects
export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_name, project_type, category, description } = req.body;
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

    // Validation (VR-003 & VR-004)
    if (!project_name || project_name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project name cannot be empty',
        },
      });
    }

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project description must be at least 20 characters long',
        },
      });
    }

    const newProject = await prisma.project.create({
      data: {
        userId,
        projectName: project_name,
        projectType: project_type || 'Web App',
        category: category || null,
        description: description,
        status: 'draft',
        requirementCompletionPercentage: 0,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        project_id: newProject.id,
        status: newProject.status,
        requirement_completion_percentage: newProject.requirementCompletionPercentage,
      },
      message: 'Project created successfully',
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating the project',
      },
    });
  }
};

// GET /api/projects
export const listProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId,
      deletedAt: null,
    };

    if (status) {
      whereClause.status = status;
    }

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({
        where: whereClause,
      }),
    ]);

    const items = projects.map((project) => ({
      id: project.id,
      project_name: project.projectName,
      project_type: project.projectType,
      category: project.category,
      description: project.description,
      status: project.status,
      requirement_completion_percentage: project.requirementCompletionPercentage,
      updated_at: project.updatedAt.toISOString(),
    }));

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
        },
      },
      message: 'Projects fetched successfully',
    });
  } catch (error: any) {
    console.error('List projects error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching projects',
      },
    });
  }
};

// GET /api/projects/:id
export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication is required',
        },
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
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

    return res.status(200).json({
      success: true,
      data: {
        id: project.id,
        project_name: project.projectName,
        project_type: project.projectType,
        category: project.category,
        description: project.description,
        status: project.status,
        requirement_completion_percentage: project.requirementCompletionPercentage,
        current_phase: project.currentPhase,
        created_at: project.createdAt.toISOString(),
        updated_at: project.updatedAt.toISOString(),
      },
      message: 'Project details fetched successfully',
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching the project',
      },
    });
  }
};

// PUT /api/projects/:id
export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { project_name, project_type, category, description, status, current_phase } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication is required',
        },
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
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

    // Validation checks if variables are provided
    if (project_name !== undefined && project_name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project name cannot be empty',
        },
      });
    }

    if (description !== undefined && description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project description must be at least 20 characters long',
        },
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        projectName: project_name !== undefined ? project_name : project.projectName,
        projectType: project_type !== undefined ? project_type : project.projectType,
        category: category !== undefined ? category : project.category,
        description: description !== undefined ? description : project.description,
        status: status !== undefined ? status : project.status,
        currentPhase: current_phase !== undefined ? current_phase : project.currentPhase,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updatedProject.id,
        project_name: updatedProject.projectName,
        status: updatedProject.status,
        updated_at: updatedProject.updatedAt.toISOString(),
      },
      message: 'Project updated successfully',
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating the project',
      },
    });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication is required',
        },
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
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

    // Soft delete configuration (set deletedAt timestamp)
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting the project',
      },
    });
  }
};
