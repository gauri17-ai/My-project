import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import prisma from '../../config/db';

// GET /api/admin/users
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';
    const status = req.query.status as string || '';
    const skip = (page - 1) * limit;

    const whereClause: any = {
      deletedAt: null,
      OR: [
        { fullName: { contains: search } },
        { email: { contains: search } }
      ]
    };

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items: users.map(u => ({
          id: u.id,
          full_name: u.fullName,
          email: u.email,
          role: u.role,
          status: u.status,
          last_login_at: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          created_at: u.createdAt.toISOString()
        })),
        pagination: { page, limit, total }
      },
      message: 'Users fetched successfully'
    });
  } catch (error: any) {
    console.error('Admin getUsers error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/admin/users/:id/suspend
export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    if (user.id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Self-suspension is not allowed' }
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'suspended' }
    });

    return res.status(200).json({
      success: true,
      data: { id: updated.id, status: updated.status },
      message: 'User suspended successfully'
    });
  } catch (error: any) {
    console.error('Admin suspendUser error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/admin/users/:id/activate
export const activateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'active' }
    });

    return res.status(200).json({
      success: true,
      data: { id: updated.id, status: updated.status },
      message: 'User activated successfully'
    });
  } catch (error: any) {
    console.error('Admin activateUser error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/admin/users/:id/role
export const changeUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['user', 'admin', 'guest'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid role' }
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    if (user.id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Self role-change is not allowed' }
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    });

    return res.status(200).json({
      success: true,
      data: { id: updated.id, role: updated.role },
      message: 'User role updated successfully'
    });
  } catch (error: any) {
    console.error('Admin changeUserRole error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// GET /api/admin/analytics
export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [totalUsers, totalProjects, totalConversations, totalDocs] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.conversation.count({ where: { senderType: 'user' } }),
      prisma.generatedDocument.count()
    ]);

    // Calculate AI failure counts and average latency
    const aiInteractions = await prisma.aIInteraction.findMany({
      select: { status: true, latencyMs: true }
    });

    const failedInteractions = aiInteractions.filter(i => i.status === 'failed').length;
    const successfulInteractions = aiInteractions.filter(i => i.status === 'success');
    const avgLatency = successfulInteractions.length > 0
      ? Math.round(successfulInteractions.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / successfulInteractions.length)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        total_users: totalUsers,
        total_projects: totalProjects,
        total_conversations: totalConversations,
        total_docs: totalDocs,
        ai_failure_count: failedInteractions,
        ai_average_latency_ms: avgLatency
      },
      message: 'Analytics stats fetched successfully'
    });
  } catch (error: any) {
    console.error('Admin getAnalytics error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// GET /api/admin/kb
export const getArticles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: articles.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        content: a.content,
        status: a.status,
        tags: a.tags ? JSON.parse(a.tags) : [],
        created_at: a.createdAt.toISOString()
      })),
      message: 'Knowledge base articles fetched successfully'
    });
  } catch (error: any) {
    console.error('Admin getArticles error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/admin/kb
export const createArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, content, status, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title, category, and content are required' }
      });
    }

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        category,
        content,
        status: status || 'draft',
        tags: tags ? JSON.stringify(tags) : null,
        createdBy: userId
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        category: article.category,
        status: article.status
      },
      message: 'Knowledge base article created successfully'
    });
  } catch (error: any) {
    console.error('Admin createArticle error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// PUT /api/admin/kb/:id
export const updateArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, content, status, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, deletedAt: null }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Article not found' }
      });
    }

    const updated = await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: {
        title: title !== undefined ? title : article.title,
        category: category !== undefined ? category : article.category,
        content: content !== undefined ? content : article.content,
        status: status !== undefined ? status : article.status,
        tags: tags !== undefined ? JSON.stringify(tags) : article.tags,
        updatedBy: userId
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        status: updated.status
      },
      message: 'Knowledge base article updated successfully'
    });
  } catch (error: any) {
    console.error('Admin updateArticle error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// DELETE /api/admin/kb/:id
export const deleteArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, deletedAt: null }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Article not found' }
      });
    }

    await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Knowledge base article deleted successfully'
    });
  } catch (error: any) {
    console.error('Admin deleteArticle error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};
