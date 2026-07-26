import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productSchema, ProductFormValues } from '@/utils/productSchemas';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { Product } from '@/types/inventory';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const isEditing = !!product;
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      categoryId: '',
      costPrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name || '',
        description: product?.description || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        categoryId: product?.categoryId || '',
        costPrice: product ? Number(product.costPrice) : 0,
        sellingPrice: product ? Number(product.sellingPrice) : 0,
        stockQuantity: product?.stockQuantity ?? 0,
        lowStockThreshold: product?.lowStockThreshold ?? 5,
      });
      setImageFile(null);
      setImagePreview(getAssetUrl(product?.imageUrl));
    }
  }, [open, product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
      categoryId: values.categoryId || undefined,
      costPrice: values.costPrice,
      sellingPrice: values.sellingPrice,
      stockQuantity: values.stockQuantity,
      lowStockThreshold: values.lowStockThreshold,
      image: imageFile,
    };

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, input: payload });
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(payload);
        toast.success('Product added');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this product's details." : 'Add a new product to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/50">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? 'Change image' : 'Upload image'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP or GIF. Max 5MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" placeholder="e.g. Men's cotton t-shirt" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="optional" {...register('sku')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" placeholder="optional" {...register('barcode')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('categoryId')}
            >
              <option value="">Uncategorized</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost price</Label>
              <Input id="costPrice" type="number" step="0.01" min="0" {...register('costPrice')} />
              {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling price</Label>
              <Input id="sellingPrice" type="number" step="0.01" min="0" {...register('sellingPrice')} />
              {errors.sellingPrice && <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Current stock</Label>
              <Input id="stockQuantity" type="number" min="0" {...register('stockQuantity')} />
              {errors.stockQuantity && <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low stock alert at</Label>
              <Input id="lowStockThreshold" type="number" min="0" {...register('lowStockThreshold')} />
              {errors.lowStockThreshold && (
                <p className="text-sm text-destructive">{errors.lowStockThreshold.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="optional" {...register('description')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Add product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
