import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RefreshCw, Edit2, ShieldAlert, AlertCircle, Layers, CupSoda, Snowflake, PlusCircle } from 'lucide-react';
import { Product, StockChange } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { ProductCard } from './components/ProductCard';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { TransferDialog } from './components/TransferDialog';
import { RulesDialog } from './components/RulesDialog';
import { CreateProductDialog } from './components/CreateProductDialog';
import { DeleteProductDialog } from './components/DeleteProductDialog';
import { isDangerStock } from './utils/warningRules';

const STORAGE_KEY_PREFIX = 'stock_manager_data_';

const formatLastChange = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const month = monthNames[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} de ${month} às ${hours}:${minutes}`;
};

const loadLocationProductsFallback = (loc: 'roulote' | 'casa'): Product[] => {
  const savedData = localStorage.getItem(`${STORAGE_KEY_PREFIX}${loc}`);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Error loading fallback local data', e);
    }
  }
  return INITIAL_PRODUCTS;
};

export default function App() {
  const [activeLocation, setActiveLocation] = useState<'roulote' | 'casa'>('roulote');
  const [rouloteProducts, setRouloteProducts] = useState<Product[]>([]);
  const [casaProducts, setCasaProducts] = useState<Product[]>([]);
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastChangeDate, setLastChangeDate] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState<'geral' | 'smoothies' | 'granizados'>('geral');

  // State to hold Roulote products for transfer summary
  const [rouloteProductsForTransfer, setRouloteProductsForTransfer] = useState<Product[]>([]);

  const handleProductCreated = (newProduct: Product, lastChangeIso: string) => {
    const d = new Date(lastChangeIso);
    setLastChangeDate(d);
    fetchStockData(activeLocation);
  };

  const handleConfirmDeleteProduct = async (productId: string) => {
    const res = await fetch('/api/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.lastChangeDate) {
        setLastChangeDate(new Date(data.lastChangeDate));
      }
      fetchStockData(activeLocation);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao eliminar produto.');
    }
  };

  // Touch swipe handling to switch between Roulote and Casa
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (isEditing || isRulesOpen || isConfirming || isTransferring || isCreateOpen || deletingProduct) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isEditing || isRulesOpen || isConfirming || isTransferring || isCreateOpen || deletingProduct) return;
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activeLocation === 'roulote') {
        handleSelectLocation('casa');
      } else if (deltaX > 0 && activeLocation === 'casa') {
        handleSelectLocation('roulote');
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleSelectCategory = (cat: 'geral' | 'smoothies' | 'granizados') => {
    setActiveCategory(cat);
    scrollToTop();
  };

  const handleSelectLocation = (loc: 'roulote' | 'casa') => {
    setActiveLocation(loc);
    scrollToTop();
  };

  // Fetch stock from backend server
  const fetchStockData = async (targetLoc: 'roulote' | 'casa') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock?location=${targetLoc}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          if (targetLoc === 'roulote') {
            setRouloteProducts(data.products);
          } else {
            setCasaProducts(data.products);
          }
          setDraftProducts(data.products);
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${targetLoc}`, JSON.stringify(data.products));
        }
        if (data.lastChangeDate) {
          const d = new Date(data.lastChangeDate);
          setLastChangeDate(d);
          localStorage.setItem(`${STORAGE_KEY_PREFIX}last_change_${targetLoc}`, d.toISOString());
        } else {
          const savedLastChange = localStorage.getItem(`${STORAGE_KEY_PREFIX}last_change_${targetLoc}`);
          setLastChangeDate(savedLastChange ? new Date(savedLastChange) : null);
        }
      } else {
        // Fallback to local storage
        const fallback = loadLocationProductsFallback(targetLoc);
        if (targetLoc === 'roulote') setRouloteProducts(fallback);
        else setCasaProducts(fallback);
        setDraftProducts(fallback);
      }
    } catch (err) {
      console.error('Error fetching backend stock:', err);
      const fallback = loadLocationProductsFallback(targetLoc);
      if (targetLoc === 'roulote') setRouloteProducts(fallback);
      else setCasaProducts(fallback);
      setDraftProducts(fallback);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
      scrollToTop();
    }
  };

  useEffect(() => {
    fetchStockData(activeLocation);

    if (activeLocation === 'casa' && activeCategory === 'granizados') {
      setActiveCategory('geral');
    }
  }, [activeLocation]);

  useEffect(() => {
    scrollToTop();
  }, [activeCategory]);

  const products = activeLocation === 'roulote' ? rouloteProducts : casaProducts;
  const otherLocationProducts = activeLocation === 'roulote' ? casaProducts : rouloteProducts;

  const handleStockChange = (id: string, delta: number) => {
    setDraftProducts(prev => prev.map(p => {
      if (p.id === id) {
        const isMlFlavor = p.category === 'granizados' && p.id !== 'granizado_base';
        const maxLimit = isMlFlavor ? 1000 : Infinity;
        const newStock = Math.min(maxLimit, Math.max(0, p.stock + delta));
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const handleToggleActive = async (id: string) => {
    const toggle = (list: Product[]) => list.map(p => {
      if (p.id === id) {
        return { ...p, active: p.active === false ? true : false };
      }
      return p;
    });

    const now = new Date();
    let updated: Product[] = [];

    if (activeLocation === 'roulote') {
      updated = toggle(rouloteProducts);
      setRouloteProducts(updated);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}roulote`, JSON.stringify(updated));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}last_change_roulote`, now.toISOString());
    } else {
      updated = toggle(casaProducts);
      setCasaProducts(updated);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}casa`, JSON.stringify(updated));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}last_change_casa`, now.toISOString());
    }
    setDraftProducts(prev => toggle(prev));
    setLastChangeDate(now);

    // Sync active state toggle to backend
    try {
      await fetch('/api/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: activeLocation,
          products: updated,
          lastChangeDate: now.toISOString(),
        }),
      });
    } catch (e) {
      console.error('Error toggling active state on server:', e);
    }
  };

  const categoryLowStock = useMemo(() => {
    const list = isEditing ? draftProducts : products;
    const checkLow = (cat: string) =>
      list.some(p => {
        if ((p.category || 'geral') !== cat || p.active === false) return false;
        const otherP = otherLocationProducts.find(o => o.id === p.id);
        const otherStock = otherP ? otherP.stock : 0;
        return isDangerStock(p.id, activeLocation, p.stock, otherStock, p.category);
      });

    return {
      geral: checkLow('geral'),
      smoothies: checkLow('smoothies'),
      granizados: activeLocation === 'roulote' ? checkLow('granizados') : false,
    };
  }, [isEditing, draftProducts, products, activeLocation, otherLocationProducts]);

  const currentList = useMemo(() => {
    const all = isEditing ? draftProducts : products;
    if (activeLocation === 'casa') {
      return all.filter(p => p.category !== 'granizados' && (p.category || 'geral') === activeCategory);
    }
    return all.filter(p => (p.category || 'geral') === activeCategory);
  }, [isEditing, draftProducts, products, activeCategory, activeLocation]);

  const changes = useMemo(() => {
    const list: StockChange[] = [];
    draftProducts.forEach((draft) => {
      const original = products.find(p => p.id === draft.id);
      if (original && draft.stock !== original.stock) {
        list.push({
          productId: draft.id,
          productName: draft.name,
          category: draft.category,
          oldStock: original.stock,
          newStock: draft.stock
        });
      }
    });
    return list;
  }, [draftProducts, products]);

  const handleTrySave = () => {
    if (changes.length === 0) {
      setIsEditing(false);
      return;
    }

    if (activeLocation === 'casa') {
      const decreases = changes.filter(c => c.newStock < c.oldStock);
      if (decreases.length > 0) {
        setRouloteProductsForTransfer(rouloteProducts);
        setIsTransferring(true);
        return;
      }
    }

    setIsConfirming(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const now = new Date();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${activeLocation}`, JSON.stringify(draftProducts));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}last_change_${activeLocation}`, now.toISOString());
      if (activeLocation === 'roulote') {
        setRouloteProducts(draftProducts);
      } else {
        setCasaProducts(draftProducts);
      }

      await fetch('/api/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: activeLocation,
          products: draftProducts,
          lastChangeDate: now.toISOString(),
        }),
      });

      setIsConfirming(false);
      setIsEditing(false);
      setLastChangeDate(now);
    } catch (error) {
      console.error('Save error:', error);
      alert('Erro ao guardar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmTransfer = async (transferToRoulote: boolean) => {
    setIsSaving(true);

    try {
      const now = new Date();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}casa`, JSON.stringify(draftProducts));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}last_change_casa`, now.toISOString());
      setCasaProducts(draftProducts);

      let updatedRoulote = rouloteProductsForTransfer;
      if (transferToRoulote) {
        const decreases = changes.filter(c => c.newStock < c.oldStock);
        updatedRoulote = rouloteProductsForTransfer.map(p => {
          const change = decreases.find(d => d.productId === p.id);
          if (change) {
            const delta = change.oldStock - change.newStock;
            return { ...p, stock: p.stock + delta };
          }
          return p;
        });
        localStorage.setItem(`${STORAGE_KEY_PREFIX}roulote`, JSON.stringify(updatedRoulote));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}last_change_roulote`, now.toISOString());
        setRouloteProducts(updatedRoulote);
      }

      if (transferToRoulote) {
        await fetch('/api/stock/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            casaProducts: draftProducts,
            rouloteProducts: updatedRoulote,
            lastChangeDate: now.toISOString(),
          }),
        });
      } else {
        await fetch('/api/stock/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'casa',
            products: draftProducts,
            lastChangeDate: now.toISOString(),
          }),
        });
      }

      setIsTransferring(false);
      setIsEditing(false);
      setLastChangeDate(now);
    } catch (e) {
      alert('Erro ao processar a transferência.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-neutral-50 text-neutral-900 font-sans"
      onTouchStart={(e) => handleTouchStart(e.nativeEvent)}
      onTouchEnd={(e) => handleTouchEnd(e.nativeEvent)}
    >
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-neutral-900 truncate">
                Gestão de Stock
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {lastChangeDate ? (
                <span className="text-[10px] sm:text-sm text-neutral-600 font-medium bg-neutral-100 border border-neutral-200/80 px-2 py-1 rounded-lg flex items-center gap-1 sm:gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span className="text-neutral-500 hidden md:inline">Última alteração:</span>
                  <span className="font-semibold text-neutral-800 text-[10px] sm:text-xs md:text-sm">{formatLastChange(lastChangeDate)}</span>
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs text-neutral-400 font-medium bg-neutral-100/60 border border-neutral-200/50 px-2 py-1 rounded-lg">
                  Sem alterações
                </span>
              )}
              
              {!isEditing && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setIsRulesOpen(true)}
                    className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    title="Regras de Aviso"
                  >
                    <AlertCircle size={18} />
                  </button>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white py-1.5 px-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                    title="Criar Novo Produto"
                  >
                    <PlusCircle size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Criar Produto</span>
                    <span className="xs:hidden">Criar</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 bg-neutral-900 text-white py-1.5 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    <Edit2 size={14} className="sm:w-4 sm:h-4" />
                    <span>Editar Stock</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location Switcher */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => handleSelectLocation('roulote')}
                disabled={isEditing}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeLocation === 'roulote'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🚚 Roulote
              </button>
              <button
                onClick={() => handleSelectLocation('casa')}
                disabled={isEditing}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeLocation === 'casa'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🏠 Casa
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
              <ShieldAlert size={14} className="text-amber-500" />
              <span>Limites de alerta ativos</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-neutral-100 bg-neutral-50/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSelectCategory('geral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'geral'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Layers size={14} className="shrink-0" />
              <span>Geral</span>
              {categoryLowStock.geral && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => handleSelectCategory('smoothies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'smoothies'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <CupSoda size={14} className="shrink-0" />
              <span>Smoothies</span>
              {categoryLowStock.smoothies && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            {activeLocation === 'roulote' && (
              <button
                onClick={() => handleSelectCategory('granizados')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === 'granizados'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <Snowflake size={14} className="shrink-0" />
                <span>Granizados</span>
                {categoryLowStock.granizados && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-1.5 sm:px-4 pt-3 sm:pt-8 transition-all ${isEditing ? 'pb-32 sm:pb-40' : 'pb-12 sm:pb-16'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
            <RefreshCw size={32} className="animate-spin mb-4" />
            <p className="text-sm font-medium">A carregar produtos do servidor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-4">
            {currentList.map((product) => {
              const otherStock = otherLocationProducts.find(o => o.id === product.id)?.stock ?? 0;
              const isDanger = isDangerStock(product.id, activeLocation, product.stock, otherStock, product.category);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isEditing={isEditing}
                  location={activeLocation}
                  isDanger={isDanger}
                  onStockChange={handleStockChange}
                  onToggleActive={handleToggleActive}
                  onDeleteProduct={(prod) => setDeletingProduct(prod)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Editing Floating Action Bar */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 backdrop-blur-md text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-neutral-700/50 flex items-center gap-4 w-[92%] sm:w-auto justify-between">
          <div className="text-xs sm:text-sm font-medium">
            <span className="text-neutral-400">Alterações:</span>{' '}
            <span className="font-bold text-amber-400">{changes.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDraftProducts(products);
                setIsEditing(false);
              }}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleTrySave}
              className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmationDialog
        isOpen={isConfirming}
        changes={changes}
        isSaving={isSaving}
        location={activeLocation}
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleSave}
      />

      <TransferDialog
        isOpen={isTransferring}
        decreases={changes.filter(c => c.newStock < c.oldStock)}
        rouloteProducts={rouloteProductsForTransfer}
        isSaving={isSaving}
        onCancel={() => setIsTransferring(false)}
        onConfirmTransfer={() => confirmTransfer(true)}
        onConfirmNoTransfer={() => confirmTransfer(false)}
      />

      <RulesDialog
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <CreateProductDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProductCreated={handleProductCreated}
      />

      <DeleteProductDialog
        isOpen={Boolean(deletingProduct)}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirmDelete={handleConfirmDeleteProduct}
      />
    </div>
  );
}
