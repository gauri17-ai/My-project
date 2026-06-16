import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_123!';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Helper to generate access & refresh tokens
const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY as any }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY as any }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required (full_name, email, password)',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email address format',
        },
      });
    }

    // Password validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long, contain an uppercase letter, lowercase letter, number, and a special character',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'An account with this email address already exists',
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName: full_name,
        email: normalizedEmail,
        passwordHash,
        role: 'user', // Default role
        status: 'active',
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        user_id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during registration',
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUSPENDED_ACCOUNT',
          message: 'Your account is suspended. Please contact admin.',
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Hash refresh token for storage
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Save session
    const ipAddress = req.ip || null;
    const userAgent = req.headers['user-agent'] || null;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          full_name: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login',
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    // We decode without verification to find the user sessions, then verify/match
    const decoded: any = jwt.decode(refresh_token);
    if (!decoded || !decoded.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid refresh token format',
        },
      });
    }

    // Get active sessions for user
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: decoded.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    // Match the refresh token
    let matchedSession = null;
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refresh_token, session.refreshTokenHash);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (matchedSession) {
      // Revoke session
      await prisma.userSession.update({
        where: { id: matchedSession.id },
        data: { revokedAt: new Date() },
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during logout',
      },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(refresh_token, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        },
      });
    }

    // Check user and session in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.status === 'suspended' || user.deletedAt) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
        },
      });
    }

    const sessions = await prisma.userSession.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchedSession = null;
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refresh_token, session.refreshTokenHash);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session not found or revoked',
        },
      });
    }

    // Rotate refresh token (Refresh Token Rotation strategy)
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Hash new refresh token
    const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);

    // Revoke old session and create new one (or update existing)
    await prisma.$transaction([
      prisma.userSession.update({
        where: { id: matchedSession.id },
        data: { revokedAt: new Date() },
      }),
      prisma.userSession.create({
        data: {
          userId: user.id,
          refreshTokenHash: newRefreshHash,
          ipAddress: req.ip || null,
          userAgent: req.headers['user-agent'] || null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during token refresh',
      },
    });
  }
};

// GET /api/auth/profile
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        role: user.role,
        preferred_language: user.preferredLanguage || 'en',
        status: user.status
      },
      message: 'User profile fetched successfully'
    });
  } catch (error: any) {
    console.error('getProfile error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { full_name, preferred_language } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (full_name !== undefined && full_name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Full name cannot be empty' }
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: full_name !== undefined ? full_name : undefined,
        preferredLanguage: preferred_language !== undefined ? preferred_language : undefined
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        full_name: updated.fullName,
        preferred_language: updated.preferredLanguage
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// PUT /api/auth/profile/password
export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect current password' }
      });
    }

    // Validate new password rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long, contain an uppercase letter, lowercase letter, number, and a special character'
        }
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('updatePassword error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
    });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email address is required' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (user && !user.deletedAt) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });

      console.log(`[PASS_RESET] Reset Link: http://localhost:3000/reset-password?token=${token}`);
    }

    return res.status(200).json({
      success: true,
      data: {},
      message: 'If the email exists, a password reset link has been generated.'
    });
  } catch (error: any) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred during password recovery' }
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Token and new password are required' }
      });
    }

    // Validate new password rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long, contain an uppercase letter, lowercase letter, number, and a special character'
        }
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetTokenRecord || resetTokenRecord.user.deletedAt) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Reset token is invalid, expired, or already used' }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password and revoke token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error: any) {
    console.error('resetPassword error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred during password reset' }
    });
  }
};

