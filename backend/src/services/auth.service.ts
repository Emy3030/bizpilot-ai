import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';

interface RegisterInput {
  businessName: string;
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const SAFE_USER_SELECT = {
  id: true,
  businessName: true,
  name: true,
  email: true,
  role: true,
  currency: true,
  createdAt: true,
} as const;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        businessName: input.businessName,
        name: input.name,
        email: input.email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: SAFE_USER_SELECT,
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const { password: _password, ...safeUser } = user;

    return { user: safeUser, token };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },

  async updateProfile(userId: string, input: { businessName?: string; name?: string; currency?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.businessName !== undefined ? { businessName: input.businessName } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },
};
