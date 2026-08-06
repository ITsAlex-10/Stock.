import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, X, Upload, Check, Layers, CupSoda, Snowflake, Scale, Droplet, LayoutGrid } from 'lucide-react';
import { Product } from '../types';

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (newProduct: Product, lastChangeDate: string) => void;
}

// Preset gallery of existing stock product images for easy selection
const PRESET_IMAGES = [
  { label: 'Sumos / Garrafas', url: '/src/assets/images/joi_apple_juice_1_5l_1785849416303.jpg' },
  { label: 'Águas 1.5L', url: '/src/assets/images/water_1_5l_img_1785717467012.jpg' },
  { label: 'Águas 0.5L', url: '/src/assets/images/water_0_5l_img_1785717479860.jpg' },
  { label: 'Vodka / Bebidas', url: '/src/assets/images/vodka_bottle_img_1785717490823.jpg' },
  { label: 'Gelo', url: '/src/assets/images/ice_bag_img_1785717500599.jpg' },
  { label: 'Copos 500ml', url: '/src/assets/images/cups_500ml_img_1785717570387.jpg' },
  { label: 'Copos 300ml', url: '/src/assets/images/cups_300ml_img_1785717581180.jpg' },
  { label: 'Morangos', url: '/src/assets/images/fresh_strawberries_1785758561376.jpg' },
  { label: 'Smoothie Sunshine', url: '/src/assets/images/smoothie_sunshine_1785755825240.jpg' },
  { label: 'Smoothie Tropical', url: '/src/assets/images/smoothie_tropical_1785755874193.jpg' },
  { label: 'Granizado Morango', url: '/src/assets/images/slush_strawberry_1785757909834.jpg' },
  { label: 'Granizado Azul', url: '/src/assets/images/slush_blue_raspberry_1785757900829.jpg' },
  { label: 'Autocolantes / Geral', url: '/src/assets/images/stickers_img_1785717443710.jpg' },
];

export function CreateProductDialog({ isOpen, onClose, onProductCreated }: CreateProductDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'geral' | 'smoothies' | 'granizados'>('geral');
  const [unitType, setUnitType] = useState<'unit' | 'ml' | 'bars'>('unit');
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [imageMode, setImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form
      setName('');
      setCategory('geral');
      setUnitType('unit');
      setImageUrl(PRESET_IMAGES[0].url);
      setCustomUrlInput('');
      setImageMode('preset');
      setErrorMessage('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('A imagem deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          setErrorMessage('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor introduza o nome do produto.');
      return;
    }

    const finalImage = imageMode === 'url' ? (customUrlInput.trim() || PRESET_IMAGES[0].url) : imageUrl;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          unitType,
          imageUrl: finalImage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onProductCreated(data.product, data.lastChangeDate);
        onClose();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Erro ao criar produto.');
      }
    } catch (err) {
      setErrorMessage('Erro de ligação ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 flex items-center gap-2">
              <PlusCircle className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />
              Criar Novo Produto
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 hover:bg-neutral-200/60 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Nome do Produto */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1">
                Nome do Produto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sumo Laranja 250ml, Salsichas Extra..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm outline-none transition-all"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                Categoria <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('geral')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    category === 'geral'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Layers size={14} />
                  <span>Geral</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('smoothies')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    category === 'smoothies'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <CupSoda size={14} />
                  <span>Smoothies</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('granizados')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    category === 'granizados'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Snowflake size={14} />
                  <span>Granizados</span>
                </button>
              </div>
            </div>

            {/* Unidade de Medida */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                Unidade de Medida <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUnitType('unit')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    unitType === 'unit'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scale size={16} className={unitType === 'unit' ? 'text-emerald-400' : 'text-neutral-500'} />
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Quantidade / Unidades</div>
                      <div className={`text-[11px] ${unitType === 'unit' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        +-0,5 na Roulote | +-1 em Casa
                      </div>
                    </div>
                  </div>
                  {unitType === 'unit' && <Check size={16} className="text-emerald-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setUnitType('ml')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    unitType === 'ml'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Droplet size={16} className={unitType === 'ml' ? 'text-emerald-400' : 'text-neutral-500'} />
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Mililitros (ml)</div>
                      <div className={`text-[11px] ${unitType === 'ml' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Medição em ml (+-50ml)
                      </div>
                    </div>
                  </div>
                  {unitType === 'ml' && <Check size={16} className="text-emerald-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setUnitType('bars')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    unitType === 'bars'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid size={16} className={unitType === 'bars' ? 'text-emerald-400' : 'text-neutral-500'} />
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Traços / Barras</div>
                      <div className={`text-[11px] ${unitType === 'bars' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        4 Barras visuais na Roulote
                      </div>
                    </div>
                  </div>
                  {unitType === 'bars' && <Check size={16} className="text-emerald-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Imagem do Produto */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                Imagem do Produto
              </label>

              {/* Mode Tabs */}
              <div className="flex gap-2 mb-2.5 border-b border-neutral-200 pb-2">
                <button
                  type="button"
                  onClick={() => setImageMode('preset')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    imageMode === 'preset' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Galeria do Sistema
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    imageMode === 'upload' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Fazer Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    imageMode === 'url' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Link URL
                </button>
              </div>

              {/* Preset mode */}
              {imageMode === 'preset' && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border border-neutral-200 rounded-xl">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        imageUrl === preset.url ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent hover:opacity-80'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {imageUrl === preset.url && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <Check className="text-white bg-emerald-500 rounded-full p-0.5" size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Upload mode */}
              {imageMode === 'upload' && (
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:bg-neutral-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label htmlFor="product-image-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                    <Upload className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-700">Clique para selecionar imagem</span>
                    <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP (Max 5MB)</span>
                  </label>
                  {imageUrl.startsWith('data:') && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <img src={imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-neutral-200" />
                      <span className="text-xs text-emerald-600 font-semibold">Imagem carregada com sucesso!</span>
                    </div>
                  )}
                </div>
              )}

              {/* URL mode */}
              {imageMode === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => {
                      setCustomUrlInput(e.target.value);
                      if (e.target.value.trim()) setImageUrl(e.target.value.trim());
                    }}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm outline-none focus:border-neutral-900"
                  />
                  {customUrlInput.trim() && (
                    <div className="flex items-center gap-2">
                      <img
                        src={customUrlInput.trim()}
                        alt="URL Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-neutral-500">Pré-visualização</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm transition-colors flex items-center gap-2"
              >
                {isSubmitting ? 'A criar...' : 'Criar Produto'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
