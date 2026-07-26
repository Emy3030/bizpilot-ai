import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

interface ListParams {
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
  page: number;
  limit: number;
}

interface ProductInput {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold?: number;
}

function deleteImageFile(imageUrl: string | null) {
  if (!imageUrl) return;
  const filePath = path.join(__dirname, '..', '..', imageUrl.replace(/^\/uploads/, 'uploads'));
  fs.unlink(filePath, () => {
    /* best-effort cleanup; ignore errors (e.g. file already gone) */
  });
}

export const productService = {
  async list(userId: string, { search, categoryId, lowStockOnly, page, limit }: ListParams) {
    const where = {
      userId,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { sku: { contains: search, mode: 'insensitive' as const } },
              { barcode: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    // lowStockOnly needs a JS-side filter since Prisma can't compare two
    // columns of the same row (stockQuantity vs lowStockThreshold) in `where`.
    if (lowStockOnly) {
      const all = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      });
      const filtered = all.filter((p) => p.stockQuantity <= p.lowStockThreshold);
      const total = filtered.length;
      const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);
      return { products: paged, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  },

  async create(userId: string, input: ProductInput, imageUrl: string | null) {
    return prisma.product.create({
      data: {
        userId,
        name: input.name,
        description: input.description || null,
        sku: input.sku || null,
        barcode: input.barcode || null,
        categoryId: input.categoryId || null,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold ?? 5,
        imageUrl,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async getById(userId: string, id: string) {
    const product = await prisma.product.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  },

  async update(userId: string, id: string, input: Partial<ProductInput>, imageUrl?: string | null) {
    const existing = await prisma.product.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    // A new image replaces (and cleans up) the old one on disk
    if (imageUrl !== undefined && existing.imageUrl && imageUrl !== existing.imageUrl) {
      deleteImageFile(existing.imageUrl);
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description || null } : {}),
        ...(input.sku !== undefined ? { sku: input.sku || null } : {}),
        ...(input.barcode !== undefined ? { barcode: input.barcode || null } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
        ...(input.costPrice !== undefined ? { costPrice: input.costPrice } : {}),
        ...(input.sellingPrice !== undefined ? { sellingPrice: input.sellingPrice } : {}),
        ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
        ...(input.lowStockThreshold !== undefined ? { lowStockThreshold: input.lowStockThreshold } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.product.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    const saleItemCount = await prisma.saleItem.count({ where: { productId: id } });
    if (saleItemCount > 0) {
      throw ApiError.conflict(
        'This product has sales history and cannot be deleted. Set its stock to 0 instead.'
      );
    }

    await prisma.product.delete({ where: { id } });
    deleteImageFile(existing.imageUrl);
  },
};
