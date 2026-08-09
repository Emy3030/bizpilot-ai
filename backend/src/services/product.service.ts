import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { cloudinary, extractPublicId } from '../config/cloudinary';

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
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;
  cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {
    /* best-effort cleanup; ignore errors (e.g. asset already gone) */
  });
}

async function assertCategoryOwned(userId: string, categoryId: string | null | undefined) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw ApiError.badRequest('Selected category was not found');
  }
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
    await assertCategoryOwned(userId, input.categoryId);
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

    if (input.categoryId !== undefined) {
      await assertCategoryOwned(userId, input.categoryId);
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

  /** Derived entirely from real sale history over the last 30 days — no
   *  fabricated supplier data (there's no supplier entity in the schema
   *  yet), just velocity-based restock forecasting and movement ranking. */
  async getInventoryInsights(userId: string) {
    const now = new Date();
    const cutoff30 = new Date(now);
    cutoff30.setDate(cutoff30.getDate() - 30);
    const cutoff14 = new Date(now);
    cutoff14.setDate(cutoff14.getDate() - 14);
    const cutoff28 = new Date(now);
    cutoff28.setDate(cutoff28.getDate() - 28);

    const [products, soldByProduct30d, soldLast14, soldPrior14] = await Promise.all([
      prisma.product.findMany({
        where: { userId },
        select: { id: true, name: true, imageUrl: true, stockQuantity: true, lowStockThreshold: true },
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { userId, createdAt: { gte: cutoff30 } } },
        _sum: { quantity: true },
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { userId, createdAt: { gte: cutoff14 } } },
        _sum: { quantity: true },
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { userId, createdAt: { gte: cutoff28, lt: cutoff14 } } },
        _sum: { quantity: true },
      }),
    ]);

    const soldMap = new Map(soldByProduct30d.map((s) => [s.productId, s._sum.quantity || 0]));
    const last14Map = new Map(soldLast14.map((s) => [s.productId, s._sum.quantity || 0]));
    const prior14Map = new Map(soldPrior14.map((s) => [s.productId, s._sum.quantity || 0]));

    const enriched = products.map((p) => {
      const unitsSold30d = soldMap.get(p.id) || 0;
      const dailyVelocity = unitsSold30d / 30;
      const daysUntilStockout = dailyVelocity > 0 ? Math.round(p.stockQuantity / dailyVelocity) : null;

      const last14 = last14Map.get(p.id) || 0;
      const prior14 = prior14Map.get(p.id) || 0;
      const velocityChangePct = prior14 > 0 ? Math.round(((last14 - prior14) / prior14) * 100) : last14 > 0 ? 100 : 0;

      return {
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        unitsSold30d,
        daysUntilStockout,
        velocityChangePct,
      };
    });

    const fastMoving = [...enriched]
      .filter((p) => p.unitsSold30d > 0)
      .sort((a, b) => b.unitsSold30d - a.unitsSold30d)
      .slice(0, 5);

    const slowMoving = enriched
      .filter((p) => p.unitsSold30d === 0 && p.stockQuantity > 0)
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, 5);

    // Two independent signals, either one qualifies: a velocity-projected
    // stockout within 14 days, OR already at/below the low-stock threshold
    // right now. A product can be low-stock with too little sales history
    // to project a velocity (e.g. one sale ever) — without this second
    // condition it would never surface here at all.
    const restockRecommendations = enriched
      .filter((p) => (p.daysUntilStockout !== null && p.daysUntilStockout <= 14) || p.stockQuantity <= p.lowStockThreshold)
      .sort((a, b) => (a.daysUntilStockout ?? 9999) - (b.daysUntilStockout ?? 9999))
      .slice(0, 8);

    return { fastMoving, slowMoving, restockRecommendations, totalProducts: products.length };
  },

  /** Guarded the same way sale.service.ts's stock decrement is — a
   *  conditional update, not read-then-write, so concurrent adjustments
   *  can't race. Used by agentAction.service.ts when a RESTOCK_PRODUCT
   *  proposal is approved. */
  async adjustStock(userId: string, id: string, delta: number) {
    const result = await prisma.product.updateMany({
      where: { id, userId },
      data: { stockQuantity: { increment: delta } },
    });
    if (result.count === 0) {
      throw ApiError.notFound('Product not found');
    }
    return prisma.product.findFirstOrThrow({ where: { id, userId } });
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
