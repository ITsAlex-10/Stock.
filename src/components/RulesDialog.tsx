/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, Truck, Home, CupSoda, Snowflake, Layers } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { WARNING_RULES } from '../utils/warningRules';

interface RulesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'geral' | 'smoothies' | 'granizados';
}

export function RulesDialog({ isOpen, onClose, defaultCategory = 'geral' }: RulesDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'geral' | 'smoothies' | 'granizados'>(defaultCategory);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectCategory = (cat: 'geral' | 'smoothies' | 'granizados') => {
    setSelectedCategory(cat);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedCategory(defaultCategory);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultCategory]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedCategory]);

  if (!isOpen) return null;

  const filteredRules = WARNING_RULES.filter((rule) => rule.category === selectedCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-100 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-amber-50/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Regras de Aviso de Perigo
                </h2>
                <p className="text-xs text-neutral-500">
                  Consulte as regras de nível crítico de stock
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-white rounded-full transition-colors"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Category Selector */}
          <div className="p-4 sm:px-6 sm:py-4 bg-neutral-50/80 border-b border-neutral-100 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSelectCategory('geral')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  selectedCategory === 'geral'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <Layers size={15} />
                <span>Geral</span>
              </button>

              <button
                onClick={() => handleSelectCategory('smoothies')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  selectedCategory === 'smoothies'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <CupSoda size={15} />
                <span>Smoothies</span>
              </button>

              <button
                onClick={() => handleSelectCategory('granizados')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  selectedCategory === 'granizados'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <Snowflake size={15} />
                <span>Granizados</span>
              </button>
            </div>
          </div>

          {/* Content / Rules list */}
          <div ref={scrollContainerRef} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 grow">
            {filteredRules.length === 0 ? (
              <p className="text-center py-8 text-neutral-400 italic text-sm">
                Nenhuma regra registada para esta categoria.
              </p>
            ) : (
              filteredRules.map((rule) => (
                <div
                  key={rule.productId}
                  className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 shadow-xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      {rule.productName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-neutral-100 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-neutral-800 font-semibold">
                        <Truck size={14} className="text-amber-600" />
                        <span>Roulote</span>
                      </div>
                      <p className="text-neutral-600 leading-snug">
                        Aviso se stock ≤ <strong>{rule.rouloteRuleText}</strong>
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-neutral-100 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-neutral-800 font-semibold">
                        <Home size={14} className="text-blue-600" />
                        <span>Casa</span>
                      </div>
                      <p className="text-neutral-600 leading-snug">
                        {rule.casaRuleText.startsWith('N/A') ? (
                          <span className="text-neutral-400">{rule.casaRuleText}</span>
                        ) : (
                          <>
                            Aviso se stock ≤ <strong>{rule.casaRuleText}</strong>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-100 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
