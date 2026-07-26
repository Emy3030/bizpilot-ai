export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  costPrice: string | number;
  sellingPrice: string | number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormInput {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  image?: File | null;
}
