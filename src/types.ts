/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  stock: number;
  imageUrl: string;
  category?: 'geral' | 'smoothies' | 'granizados' | string;
  active?: boolean;
  unitType?: 'unit' | 'ml' | 'bars';
  isCustom?: boolean;
}

export interface StockChange {
  productId: string;
  productName: string;
  category?: string;
  oldStock: number;
  newStock: number;
}
