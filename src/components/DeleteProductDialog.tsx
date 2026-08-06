import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface DeleteProductDialogProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmDelete: (productId: string) => Promise<void>;
}

export function DeleteProductDialog({ isOpen, product, onClose, onConfirmDelete }: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirmDelete(product.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao eliminar produto.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-red-50/50">
            <h2 className="text-base sm:text-lg font-black text-red-900 flex items-center gap-2">
              <AlertTriangle className="text-red-600 w-5 h-5 shrink-0" />
              Eliminar Produto
            </h2>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1 hover:bg-neutral-200/60 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-neutral-900 truncate">{product.name}</div>
                <div className="text-xs text-neutral-500 capitalize">Categoria: {product.category || 'Geral'}</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Tem a certeza que pretende eliminar este produto criado? Esta ação irá remover o produto de ambos os locais (Roulote e Casa) e é irreversível.
            </p>
          </div>

          {/* Buttons */}
          <div className="p-4 sm:p-5 border-t border-neutral-100 flex items-center justify-end gap-2 bg-neutral-50/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={15} />
              <span>{isDeleting ? 'A eliminar...' : 'Eliminar Produto'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
