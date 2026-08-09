import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { productService } from '../services/product.service';
import { ApiError } from '../utils/ApiError';
import { uploadBuffer } from '../config/cloudinary';

async function uploadImage(req: Request): Promise<string | null> {
  if (!req.file) return null;
  const { url } = await uploadBuffer(req.file.buffer, {
    folder: 'bizpilot/products',
    resource_type: 'image',
  });
  return url;
}

function parseProductBody(body: Record<string, string>) {
  return {
    name: body.name,
    description: body.description,
    sku: body.sku,
    barcode: body.barcode,
    categoryId: body.categoryId,
    costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
    sellingPrice: body.sellingPrice !== undefined ? Number(body.sellingPrice) : undefined,
    stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined,
  };
}

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const lowStockOnly = req.query.lowStockOnly === 'true';

    const result = await productService.list(req.user.userId, { search, categoryId, lowStockOnly, page, limit });
    res.status(200).json({ success: true, data: result.products, meta: result.meta });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = parseProductBody(req.body);

    if (!input.name || input.costPrice === undefined || input.sellingPrice === undefined) {
      throw ApiError.badRequest('name, costPrice and sellingPrice are required');
    }

    const product = await productService.create(
      req.user.userId,
      {
        name: input.name,
        description: input.description,
        sku: input.sku,
        barcode: input.barcode,
        categoryId: input.categoryId,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        stockQuantity: input.stockQuantity ?? 0,
        lowStockThreshold: input.lowStockThreshold,
      },
      await uploadImage(req)
    );

    res.status(201).json({ success: true, message: 'Product added', data: product });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const product = await productService.getById(req.user.userId, req.params.id);
    res.status(200).json({ success: true, data: product });
  }),

  insights: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const insights = await productService.getInventoryInsights(req.user.userId);
    res.status(200).json({ success: true, data: insights });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = parseProductBody(req.body);
    const newImageUrl = req.file ? await uploadImage(req) : undefined;

    const product = await productService.update(req.user.userId, req.params.id, input, newImageUrl);
    res.status(200).json({ success: true, message: 'Product updated', data: product });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await productService.remove(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  }),
};
