import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Default initial products list
const INITIAL_PRODUCTS = [
  { id: 'stickers', name: 'Autoculantes', stock: 0, imageUrl: '/src/assets/images/stickers_img_1785717443710.jpg', category: 'geral', active: true },
  { id: 'joi', name: 'Joi', stock: 0, imageUrl: '/src/assets/images/joi_apple_juice_1_5l_1785849416303.jpg', category: 'geral', active: true },
  { id: 'water_1_5', name: 'Águas 1,5L', stock: 0, imageUrl: '/src/assets/images/water_1_5l_img_1785717467012.jpg', category: 'geral', active: true },
  { id: 'water_0_5', name: 'Águas 0,5L', stock: 0, imageUrl: '/src/assets/images/water_0_5l_img_1785717479860.jpg', category: 'geral', active: true },
  { id: 'vodka', name: 'Vodka', stock: 0, imageUrl: '/src/assets/images/vodka_bottle_img_1785717490823.jpg', category: 'geral', active: true },
  { id: 'ice', name: 'Gelo', stock: 0, imageUrl: '/src/assets/images/ice_bag_img_1785717500599.jpg', category: 'geral', active: true },
  { id: 'sausages', name: 'Salsichas', stock: 0, imageUrl: '/src/assets/images/long_canned_sausages_1785849817108.jpg', category: 'geral', active: true },
  { id: 'bread', name: 'Pão', stock: 0, imageUrl: '/src/assets/images/hot_dog_buns_1785849436765.jpg', category: 'geral', active: true },
  { id: 'potatoes', name: 'Batata', stock: 0, imageUrl: '/src/assets/images/shoestring_potatoes_loose_1785849805131.jpg', category: 'geral', active: true },
  { id: 'onions', name: 'Cebola', stock: 0, imageUrl: '/src/assets/images/fried_onions_hot_dog_1785849791780.jpg', category: 'geral', active: true },
  { id: 'cheese', name: 'Queijo', stock: 0, imageUrl: '/src/assets/images/cheddar_cheese_packaging_1785849459020.jpg', category: 'geral', active: true },
  { id: 'fresh_strawberries', name: 'Morangos', stock: 0, imageUrl: '/src/assets/images/fresh_strawberries_1785758561376.jpg', category: 'geral', active: true },
  { id: 'fresh_watermelon', name: 'Melancia', stock: 0, imageUrl: '/src/assets/images/whole_watermelon_img_1785849470212.jpg', category: 'geral', active: true },
  { id: 'fresh_mango', name: 'Manga', stock: 0, imageUrl: '/src/assets/images/whole_mangoes_img_1785849482245.jpg', category: 'geral', active: true },
  { id: 'fresh_melon', name: 'Melão', stock: 0, imageUrl: '/src/assets/images/whole_melon_img_1785849494031.jpg', category: 'geral', active: true },
  { id: 'cups_500', name: 'Copos 500ml', stock: 0, imageUrl: '/src/assets/images/cups_500ml_img_1785717570387.jpg', category: 'geral', active: true },
  { id: 'cups_300', name: 'Copos 300ml', stock: 0, imageUrl: '/src/assets/images/cups_300ml_img_1785717581180.jpg', category: 'geral', active: true },
  { id: 'lids', name: 'Tampas', stock: 0, imageUrl: '/src/assets/images/dome_cup_lids_1785849505908.jpg', category: 'geral', active: true },
  { id: 'hotdog_boxes', name: 'Caixas de Cachorro', stock: 0, imageUrl: '/src/assets/images/hot_dog_boxes_img_1785717591810.jpg', category: 'geral', active: true },
  { id: 'napkins', name: 'Guardanapos', stock: 0, imageUrl: '/src/assets/images/napkins_img_1785755171665.jpg', category: 'geral', active: true },

  // Smoothies
  { id: 'smoothie_sunshine', name: 'Sunshine', stock: 0, imageUrl: '/src/assets/images/smoothie_sunshine_1785755825240.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_pina_colada', name: 'Piña Colada', stock: 0, imageUrl: '/src/assets/images/smoothie_pina_colada_1785755836406.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_sunset', name: 'Sunset', stock: 0, imageUrl: '/src/assets/images/smoothie_sunset_1785755846441.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_paradise', name: 'Paradise', stock: 0, imageUrl: '/src/assets/images/smoothie_paradise_1785755855266.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_fantasy', name: 'Fantasy', stock: 0, imageUrl: '/src/assets/images/smoothie_fantasy_1785755865304.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_tropical', name: 'Tropical', stock: 0, imageUrl: '/src/assets/images/smoothie_tropical_1785755874193.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_blueberry', name: 'Blueberry', stock: 0, imageUrl: '/src/assets/images/smoothie_blueberry_1785755883417.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_palmbeach', name: 'Palmbeach', stock: 0, imageUrl: '/src/assets/images/smoothie_palmbeach_1785755893885.jpg', category: 'smoothies', active: true },
  { id: 'smoothie_green', name: 'Green', stock: 0, imageUrl: '/src/assets/images/smoothie_green_1785755905022.jpg', category: 'smoothies', active: true },

  // Granizados
  { id: 'granizado_base', name: 'Base', stock: 0, imageUrl: '/src/assets/images/white_jerrycan_red_cap_1785850250657.jpg', category: 'granizados', active: true },
  { id: 'granizado_morango', name: 'Morango', stock: 0, imageUrl: '/src/assets/images/slush_strawberry_1785757909834.jpg', category: 'granizados', active: true },
  { id: 'granizado_melancia', name: 'Melancia', stock: 0, imageUrl: '/src/assets/images/slush_watermelon_1785757921202.jpg', category: 'granizados', active: true },
  { id: 'granizado_framboesa_azul', name: 'Framboesa azul', stock: 0, imageUrl: '/src/assets/images/slush_blue_raspberry_1785757900829.jpg', category: 'granizados', active: true },
  { id: 'granizado_maracuja', name: 'Maracujá', stock: 0, imageUrl: '/src/assets/images/slush_passion_fruit_1785757935067.jpg', category: 'granizados', active: true },
  { id: 'granizado_cola', name: 'Cola', stock: 0, imageUrl: '/src/assets/images/slush_cola_1785757945768.jpg', category: 'granizados', active: true },
  { id: 'granizado_fruto_do_bosque', name: 'Fruto do bosque', stock: 0, imageUrl: '/src/assets/images/slush_berries_1785757968016.jpg', category: 'granizados', active: false },
  { id: 'granizado_cereja', name: 'Cereja', stock: 0, imageUrl: '/src/assets/images/slush_strawberry_1785757909834.jpg', category: 'granizados', active: false },
  { id: 'granizado_limao', name: 'Limão', stock: 0, imageUrl: '/src/assets/images/slush_lemon_1785757957543.jpg', category: 'granizados', active: false },
  { id: 'granizado_laranja', name: 'Laranja', stock: 0, imageUrl: '/src/assets/images/slush_passion_fruit_1785757935067.jpg', category: 'granizados', active: false },
  { id: 'granizado_menta', name: 'Menta', stock: 0, imageUrl: '/src/assets/images/smoothie_green_1785755905022.jpg', category: 'granizados', active: false },
  { id: 'granizado_melao', name: 'Melão', stock: 0, imageUrl: '/src/assets/images/slush_lemon_1785757957543.jpg', category: 'granizados', active: false },
  { id: 'granizado_toranja', name: 'Toranja', stock: 0, imageUrl: '/src/assets/images/smoothie_sunset_1785755846441.jpg', category: 'granizados', active: false },
  { id: 'granizado_menta_e_lima', name: 'Menta e Lima', stock: 0, imageUrl: '/src/assets/images/smoothie_green_1785755905022.jpg', category: 'granizados', active: false },
  { id: 'granizado_flor_de_sabugueiro', name: 'Flor de sabugueiro', stock: 0, imageUrl: '/src/assets/images/smoothie_pina_colada_1785755836406.jpg', category: 'granizados', active: false },
];

// Persistent file database path
const DB_FILE = path.join(process.cwd(), 'stock_db.json');

interface StockDB {
  roulote: any[];
  casa: any[];
  last_change_roulote: string | null;
  last_change_casa: string | null;
}

const getDB = (): StockDB => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading stock_db.json:', err);
  }
  return {
    roulote: INITIAL_PRODUCTS,
    casa: INITIAL_PRODUCTS,
    last_change_roulote: null,
    last_change_casa: null,
  };
};

const saveDB = (db: StockDB) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stock_db.json:', err);
  }
};

// Optional sync to external Google Sheets WebApp if configured
const syncToGoogleSheetsWebApp = async (payload: any) => {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webAppUrl) return;

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Error syncing to Google Sheets WebApp:', err);
  }
};

// --- STOCK API ENDPOINTS ---

app.get('/api/stock', (req, res) => {
  const location = req.query.location === 'casa' ? 'casa' : 'roulote';
  const db = getDB();

  res.json({
    location,
    products: db[location] || INITIAL_PRODUCTS,
    lastChangeDate: location === 'casa' ? db.last_change_casa : db.last_change_roulote,
  });
});

app.post('/api/stock/update', (req, res) => {
  const { location, products, lastChangeDate } = req.body;
  const locKey = location === 'casa' ? 'casa' : 'roulote';
  const dateStr = lastChangeDate || new Date().toISOString();

  const db = getDB();
  db[locKey] = products;
  if (locKey === 'casa') {
    db.last_change_casa = dateStr;
  } else {
    db.last_change_roulote = dateStr;
  }
  saveDB(db);

  syncToGoogleSheetsWebApp({ action: 'update', location: locKey, products, lastChangeDate: dateStr });

  res.json({ success: true, lastChangeDate: dateStr });
});

app.post('/api/stock/transfer', (req, res) => {
  const { casaProducts, rouloteProducts, lastChangeDate } = req.body;
  const dateStr = lastChangeDate || new Date().toISOString();

  const db = getDB();
  if (casaProducts) db.casa = casaProducts;
  if (rouloteProducts) db.roulote = rouloteProducts;
  db.last_change_casa = dateStr;
  db.last_change_roulote = dateStr;
  saveDB(db);

  syncToGoogleSheetsWebApp({ action: 'transfer', casaProducts, rouloteProducts, lastChangeDate: dateStr });

  res.json({ success: true, lastChangeDate: dateStr });
});

app.post('/api/products/create', (req, res) => {
  const { name, category, unitType, imageUrl } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
  }

  const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const defaultImg = '/src/assets/images/stickers_img_1785717443710.jpg';

  const newRouloteProduct = {
    id,
    name,
    stock: 0,
    imageUrl: imageUrl || defaultImg,
    category,
    active: true,
    unitType: unitType || 'unit',
    isCustom: true,
  };

  const newCasaProduct = {
    id,
    name,
    stock: 0,
    imageUrl: imageUrl || defaultImg,
    category,
    active: true,
    unitType: unitType || 'unit',
    isCustom: true,
  };

  const db = getDB();
  db.roulote = [...(db.roulote || INITIAL_PRODUCTS), newRouloteProduct];
  db.casa = [...(db.casa || INITIAL_PRODUCTS), newCasaProduct];
  db.last_change_roulote = now;
  db.last_change_casa = now;

  saveDB(db);

  res.json({
    success: true,
    product: newRouloteProduct,
    lastChangeDate: now,
  });
});

app.post('/api/products/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ID do produto é obrigatório' });
  }

  const db = getDB();
  const rouloteList = db.roulote || INITIAL_PRODUCTS;
  const casaList = db.casa || INITIAL_PRODUCTS;

  const product = rouloteList.find((p: any) => p.id === id) || casaList.find((p: any) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const isInitialDefault = INITIAL_PRODUCTS.some((p: any) => p.id === id);

  // Check if it's a default product that cannot be deleted
  if (isInitialDefault || (!product.isCustom && !id.startsWith('prod_'))) {
    return res.status(400).json({ error: 'Os produtos predefinidos do site não podem ser eliminados.' });
  }

  const now = new Date().toISOString();
  db.roulote = rouloteList.filter((p: any) => p.id !== id);
  db.casa = casaList.filter((p: any) => p.id !== id);
  db.last_change_roulote = now;
  db.last_change_casa = now;

  saveDB(db);

  res.json({ success: true, lastChangeDate: now });
});

// --- VITE & STATIC FILES SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor a correr na porta ${PORT}`);
  });
}

startServer();
