import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Category } from '@/types/inventory';

export function CategoryManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync(newName.trim());
      setNewName('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id: editingId, name: editingName.trim() });
      setEditingId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
            <DialogDescription>Organize your products into categories.</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} isLoading={createCategory.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-lg" />)
            ) : categories && categories.length > 0 ? (
              categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  {editingId === c.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      <div className="ml-2 flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">
                        {c.name}{' '}
                        <span className="text-xs text-muted-foreground">({c._count?.products ?? 0})</span>
                      </span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category?"
        description={`Products in "${deleteTarget?.name}" will become uncategorized, not deleted.`}
        confirmLabel="Delete"
        isLoading={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
