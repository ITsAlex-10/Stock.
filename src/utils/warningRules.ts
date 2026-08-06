/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WarningRule {
  productId: string;
  productName: string;
  category: 'geral' | 'smoothies' | 'granizados';
  rouloteRuleText: string;
  casaRuleText: string;
}

export const WARNING_RULES: WarningRule[] = [
  {
    productId: 'stickers',
    productName: 'Autocolantes',
    category: 'geral',
    rouloteRuleText: '1,5 se houver 0 em casa; 0,5 se houver pelo menos 1 em casa',
    casaRuleText: '0',
  },
  {
    productId: 'joi',
    productName: 'Joi',
    category: 'geral',
    rouloteRuleText: '6 se houver 0 em casa; 4 se houver pelo menos 2 em casa',
    casaRuleText: '3',
  },
  {
    productId: 'water_1_5',
    productName: 'Águas 1,5L',
    category: 'geral',
    rouloteRuleText: '1 se houver 0 em casa; 0,5 se houver pelo menos 1 em casa',
    casaRuleText: '0',
  },
  {
    productId: 'water_0_5',
    productName: 'Águas 0,5L',
    category: 'geral',
    rouloteRuleText: '1 se houver 0 em casa; 0,5 se houver pelo menos 1 em casa',
    casaRuleText: '0',
  },
  {
    productId: 'vodka',
    productName: 'Vodka',
    category: 'geral',
    rouloteRuleText: '2 se houver 0 em casa; 1 se houver pelo menos 1 em casa',
    casaRuleText: '1',
  },
  {
    productId: 'ice',
    productName: 'Gelo',
    category: 'geral',
    rouloteRuleText: '4 barras se 0 em casa; 3 barras se 1 em casa; 2 barras se 2 em casa; 1 barra se ≥3 em casa',
    casaRuleText: '3',
  },
  {
    productId: 'cups_500',
    productName: 'Copos 500ml',
    category: 'geral',
    rouloteRuleText: '4 se houver 0 em casa; 3 se houver pelo menos 1 em casa',
    casaRuleText: '2',
  },
  {
    productId: 'cups_300',
    productName: 'Copos 300ml',
    category: 'geral',
    rouloteRuleText: '3 se houver 0 em casa; 2 se houver pelo menos 1 em casa',
    casaRuleText: '1',
  },
  {
    productId: 'fresh_fruits',
    productName: 'Frutas (Morangos, Melancia, Manga, Melão)',
    category: 'geral',
    rouloteRuleText: '1 barra',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'sausages',
    productName: 'Salsichas',
    category: 'geral',
    rouloteRuleText: '1',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'bread',
    productName: 'Pão',
    category: 'geral',
    rouloteRuleText: '0,5',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'potatoes',
    productName: 'Batata',
    category: 'geral',
    rouloteRuleText: '0,5',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'onions',
    productName: 'Cebola',
    category: 'geral',
    rouloteRuleText: '0,5',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'cheese',
    productName: 'Queijo',
    category: 'geral',
    rouloteRuleText: '0,5',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'lids',
    productName: 'Tampas',
    category: 'geral',
    rouloteRuleText: '1 barra',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'hotdog_boxes',
    productName: 'Caixas de Cachorro',
    category: 'geral',
    rouloteRuleText: '0,5',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'napkins',
    productName: 'Guardanapos',
    category: 'geral',
    rouloteRuleText: '0,5',
    casaRuleText: 'Sem regra',
  },
  {
    productId: 'granizado_base',
    productName: 'Granizados - Base',
    category: 'granizados',
    rouloteRuleText: '1',
    casaRuleText: 'N/A (sem stock em Casa)',
  },
  {
    productId: 'granizado_sabores',
    productName: 'Granizados - Sabores',
    category: 'granizados',
    rouloteRuleText: '150 ml',
    casaRuleText: 'N/A (sem stock em Casa)',
  },
  {
    productId: 'smoothies_sunshine',
    productName: 'Smoothies (Sunshine, Piña Colada, Sunset)',
    category: 'smoothies',
    rouloteRuleText: '2 barras',
    casaRuleText: '1,5',
  },
  {
    productId: 'smoothies_paradise',
    productName: 'Smoothies (Paradise, Fantasy, Tropical)',
    category: 'smoothies',
    rouloteRuleText: '2 barras',
    casaRuleText: '1',
  },
  {
    productId: 'smoothies_blueberry',
    productName: 'Smoothies (Blueberry, Palmbeach, Green)',
    category: 'smoothies',
    rouloteRuleText: '2 barras',
    casaRuleText: '0,5',
  },
];

export function isDangerStock(
  productId: string,
  location: 'roulote' | 'casa',
  stockInCurrentLocation: number,
  stockInOtherLocation: number,
  category?: string
): boolean {
  if (location === 'roulote') {
    if (productId === 'stickers') {
      const threshold = stockInOtherLocation >= 1 ? 0.5 : 1.5;
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'joi') {
      const threshold = stockInOtherLocation >= 2 ? 4 : 6;
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'water_1_5') {
      const threshold = stockInOtherLocation >= 1 ? 0.5 : 1;
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'water_0_5') {
      const threshold = stockInOtherLocation >= 1 ? 0.5 : 1;
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'vodka') {
      const threshold = stockInOtherLocation >= 1 ? 1 : 2;
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'ice') {
      const threshold = Math.max(1, 4 - Math.floor(stockInOtherLocation));
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'cups_500') {
      const threshold = stockInOtherLocation >= 1 ? 3 : 4;
      return stockInCurrentLocation <= threshold;
    }
    if (productId === 'cups_300') {
      const threshold = stockInOtherLocation >= 1 ? 2 : 3;
      return stockInCurrentLocation <= threshold;
    }
    if (
      productId === 'fresh_strawberries' ||
      productId === 'fresh_watermelon' ||
      productId === 'fresh_mango' ||
      productId === 'fresh_melon' ||
      productId === 'lids'
    ) {
      return stockInCurrentLocation <= 1;
    }
    if (productId === 'sausages') {
      return stockInCurrentLocation <= 1;
    }
    if (
      productId === 'bread' ||
      productId === 'potatoes' ||
      productId === 'onions' ||
      productId === 'cheese' ||
      productId === 'hotdog_boxes' ||
      productId === 'napkins'
    ) {
      return stockInCurrentLocation <= 0.5;
    }
    if (productId === 'granizado_base') {
      return stockInCurrentLocation <= 1;
    }
    if (category === 'granizados' || productId.startsWith('granizado_')) {
      return stockInCurrentLocation <= 150;
    }
    if (category === 'smoothies' || productId.startsWith('smoothie_')) {
      return stockInCurrentLocation <= 2;
    }
  } else if (location === 'casa') {
    if (productId === 'stickers') {
      return stockInCurrentLocation <= 0;
    }
    if (productId === 'joi') {
      return stockInCurrentLocation <= 3;
    }
    if (productId === 'water_1_5') {
      return stockInCurrentLocation <= 0;
    }
    if (productId === 'water_0_5') {
      return stockInCurrentLocation <= 0;
    }
    if (productId === 'vodka') {
      return stockInCurrentLocation <= 1;
    }
    if (productId === 'ice') {
      return stockInCurrentLocation <= 3;
    }
    if (productId === 'cups_500') {
      return stockInCurrentLocation <= 2;
    }
    if (productId === 'cups_300') {
      return stockInCurrentLocation <= 1;
    }
    // Smoothies em Casa
    if (
      productId === 'smoothie_sunshine' ||
      productId === 'smoothie_pina_colada' ||
      productId === 'smoothie_sunset'
    ) {
      return stockInCurrentLocation <= 1.5;
    }
    if (
      productId === 'smoothie_paradise' ||
      productId === 'smoothie_fantasy' ||
      productId === 'smoothie_tropical'
    ) {
      return stockInCurrentLocation <= 1;
    }
    if (
      productId === 'smoothie_blueberry' ||
      productId === 'smoothie_palmbeach' ||
      productId === 'smoothie_green'
    ) {
      return stockInCurrentLocation <= 0.5;
    }
  }

  return false;
}
