/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Minus, Power, AlertTriangle, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  isEditing: boolean;
  onStockChange: (id: string, delta: number) => void;
  onToggleActive?: (id: string) => void;
  onDeleteProduct?: (product: Product) => void;
  isDanger?: boolean;
  location?: 'roulote' | 'casa';
}

export function ProductCard({ product, isEditing, onStockChange, onToggleActive, onDeleteProduct, isDanger, location = 'roulote' }: ProductCardProps) {
  const isActive = product.active !== false;
  const isCustomProduct = Boolean(product.isCustom || product.id.startsWith('prod_'));
  const isMlFlavor = product.unitType === 'ml' || (!product.unitType && product.category === 'granizados' && product.id !== 'granizado_base');
  const isFourBarRoulote = (
    product.unitType === 'bars' ||
    (!product.unitType && (
      product.category === 'smoothies' ||
      product.id === 'ice' ||
      product.id === 'fresh_strawberries' ||
      product.id === 'fresh_watermelon' ||
      product.id === 'fresh_mango' ||
      product.id === 'fresh_melon' ||
      product.id === 'lids'
    ))
  ) && location === 'roulote';
  const isCasaGeral = location === 'casa' && (product.unitType === 'unit' || product.unitType === 'bars' || product.category === 'geral');

  const deltaStep = isFourBarRoulote ? 1 : isMlFlavor ? 50 : isCasaGeral ? 1 : 0.5;

  return (
    <div className={`bg-white rounded-md sm:rounded-xl shadow-xs border border-neutral-200 overflow-hidden hover:shadow-md transition-all flex flex-col ${!isActive ? 'opacity-65 bg-neutral-50' : ''} ${isDanger ? 'border-red-300 ring-1 ring-red-200' : ''}`}>
      <div className="aspect-square overflow-hidden bg-neutral-100 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all ${!isActive ? 'grayscale opacity-75' : ''}`}
          referrerPolicy="no-referrer"
        />
        {onDeleteProduct && isCustomProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProduct(product);
            }}
            title="Eliminar produto personalizado"
            className="absolute top-0.5 left-0.5 sm:top-2 sm:left-2 p-1 sm:p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 shadow-xs backdrop-blur-md transition-all active:scale-95"
          >
            <Trash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </button>
        )}
        {onToggleActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(product.id);
            }}
            title={isActive ? 'Desativar produto' : 'Ativar produto'}
            className={`absolute top-0.5 right-0.5 sm:top-2 sm:right-2 p-0.5 sm:p-1.5 rounded-full text-[9px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 shadow-xs backdrop-blur-md transition-colors ${
              isActive
                ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            <Power className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{isActive ? 'Ativo' : 'Inativo'}</span>
          </button>
        )}
      </div>
      <div className="p-1 sm:p-3 flex flex-col justify-between flex-1">
        <div className="flex items-center justify-between gap-0.5">
          <h3 className={`font-semibold text-[10px] sm:text-base truncate leading-tight ${!isActive ? 'text-neutral-400' : 'text-neutral-800'}`} title={product.name}>
            {product.name}
          </h3>
        </div>
        
        <div className="mt-0.5 sm:mt-2 flex flex-col justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-xs text-neutral-500 uppercase tracking-wider font-medium">
              {isActive ? 'Stock' : 'Estado'}
            </span>
            {isActive ? (
              isFourBarRoulote ? (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <div className="flex items-center justify-between gap-0.5">
                    <span className={`text-[10px] sm:text-sm font-bold ${isDanger ? 'text-red-600' : 'text-neutral-900'}`}>
                      {product.stock} {product.stock === 1 ? 'barra' : 'barras'}
                    </span>
                    {isDanger && (
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500/10 shrink-0" title="Aviso de perigo: Stock em nível crítico" />
                    )}
                  </div>
                  {/* 4-bar indicator */}
                  <div className="grid grid-cols-4 gap-0.5 sm:gap-1 w-full h-2 sm:h-3.5 rounded-xs sm:rounded-md bg-neutral-100 p-0.5 border border-neutral-200/80">
                    {[1, 2, 3, 4].map((barNum) => {
                      const isFilled = barNum <= product.stock;
                      let barColor = 'bg-neutral-200';
                      if (isFilled) {
                        if (product.stock >= 4) barColor = 'bg-emerald-500';
                        else if (product.stock === 3) barColor = 'bg-amber-400';
                        else if (product.stock === 2) barColor = 'bg-orange-500';
                        else if (product.stock === 1) barColor = 'bg-red-500';
                      }
                      return (
                        <div
                          key={barNum}
                          className={`h-full rounded-2xs transition-colors ${barColor}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className={`text-xs sm:text-2xl font-bold truncate ${isDanger ? 'text-red-600' : 'text-neutral-900'}`}>
                    {isMlFlavor ? `${product.stock} ml` : isCasaGeral ? product.stock.toLocaleString('pt-PT', { minimumFractionDigits: 0 }) : product.stock.toLocaleString('pt-PT', { minimumFractionDigits: 1 })}
                  </span>
                  {isDanger && (
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500/10 shrink-0" title="Aviso de perigo: Stock em nível crítico" />
                  )}
                </div>
              )
            ) : (
              <span className="text-[10px] sm:text-sm font-semibold text-neutral-400">
                Desativado
              </span>
            )}
          </div>

          {isEditing && isActive && (
            <div className="flex items-center justify-between gap-1 sm:gap-2 mt-1">
              <button
                onClick={() => onStockChange(product.id, -deltaStep)}
                disabled={product.stock <= 0}
                title={isFourBarRoulote ? 'Diminuir 1 barra' : isMlFlavor ? 'Diminuir 50ml' : isCasaGeral ? 'Diminuir 1' : 'Diminuir 0,5'}
                className="flex-1 flex items-center justify-center py-1 sm:py-1.5 px-1 bg-white border border-neutral-200 hover:border-red-300 hover:bg-red-50 active:bg-red-100 rounded-md sm:rounded-lg shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 hover:text-red-600"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => onStockChange(product.id, deltaStep)}
                disabled={isFourBarRoulote ? product.stock >= 4 : isMlFlavor ? product.stock >= 1000 : false}
                title={isFourBarRoulote ? 'Aumentar 1 barra' : isMlFlavor ? 'Aumentar 50ml' : isCasaGeral ? 'Aumentar 1' : 'Aumentar 0,5'}
                className="flex-1 flex items-center justify-center py-1 sm:py-1.5 px-1 bg-white border border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100 rounded-md sm:rounded-lg shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 hover:text-emerald-600"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
