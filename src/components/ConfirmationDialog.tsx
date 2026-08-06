/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { StockChange } from '../types';
import { useEffect } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  changes: StockChange[];
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
  location?: 'roulote' | 'casa';
}

export function ConfirmationDialog({ isOpen, changes, onConfirm, onCancel, isSaving, location = 'roulote' }: ConfirmationDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <AlertCircle className="text-amber-500" />
              Confirmar Alterações
            </h2>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
              disabled={isSaving}
            >
              <X size={24} className="text-neutral-400" />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <p className="text-neutral-600 mb-4">
              Por favor, reveja as alterações de stock abaixo antes de confirmar:
            </p>
            
            <div className="space-y-3">
              {changes.length === 0 ? (
                <p className="text-center py-8 text-neutral-400 italic">Nenhuma alteração detectada.</p>
              ) : (
                changes.map((change) => {
                  const isMl = change.category === 'granizados' && change.productId !== 'granizado_base';
                  const isFourBar = (
                    change.category === 'smoothies' ||
                    change.productId === 'ice' ||
                    change.productId === 'fresh_strawberries' ||
                    change.productId === 'fresh_watermelon' ||
                    change.productId === 'fresh_mango' ||
                    change.productId === 'fresh_melon' ||
                    change.productId === 'lids'
                  ) && location === 'roulote';
                  const isCasaGeral = location === 'casa' && change.category === 'geral';

                  const formatVal = (val: number) => {
                    if (isMl) return `${val} ml`;
                    if (isFourBar) return `${val} ${val === 1 ? 'barra' : 'barras'}`;
                    if (isCasaGeral) return val.toLocaleString('pt-PT', { minimumFractionDigits: 0 });
                    return val.toLocaleString('pt-PT', { minimumFractionDigits: 1 });
                  };

                  return (
                    <div key={change.productId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                      <div>
                        <span className="font-medium text-neutral-800">{change.productName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-400 line-through text-sm">
                          {formatVal(change.oldStock)}
                        </span>
                        <span className="text-neutral-400">→</span>
                        <span className={`font-bold ${change.newStock > change.oldStock ? 'text-green-600' : 'text-red-600'}`}>
                          {formatVal(change.newStock)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-6 bg-neutral-50 flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isSaving || changes.length === 0}
              className="flex-1 py-3 px-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Confirmar e Guardar
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
