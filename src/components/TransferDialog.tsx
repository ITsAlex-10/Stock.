/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, X, ArrowRight, Truck, Home } from 'lucide-react';
import { StockChange, Product } from '../types';
import { useState, useEffect } from 'react';

interface TransferDialogProps {
  isOpen: boolean;
  decreases: StockChange[];
  rouloteProducts: Product[];
  onConfirmTransfer: () => void;
  onConfirmNoTransfer: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

type Step = 'ask' | 'confirm-yes' | 'confirm-no';

export function TransferDialog({ 
  isOpen, 
  decreases, 
  rouloteProducts,
  onConfirmTransfer, 
  onConfirmNoTransfer, 
  onCancel, 
  isSaving 
}: TransferDialogProps) {
  const [step, setStep] = useState<Step>('ask');

  // Reset to first step whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('ask');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderAsk = () => (
    <div className="p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
        <Truck size={32} />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 mb-2">Transferir Stock?</h2>
      <p className="text-neutral-600 mb-8">
        Deseja adicionar o stock retirado de <strong>Casa</strong> à <strong>Roulote</strong>?
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <button
          onClick={() => setStep('confirm-no')}
          className="py-4 px-6 bg-white border-2 border-neutral-200 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-all"
        >
          Não, apenas retirar
        </button>
        <button
          onClick={() => setStep('confirm-yes')}
          className="py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Sim, transferir
        </button>
      </div>
    </div>
  );

  const renderConfirmYes = () => {
    const transferSummary = decreases.map(change => {
      const rouloteProduct = rouloteProducts.find(p => p.id === change.productId);
      const delta = change.oldStock - change.newStock;
      const currentRouloteStock = rouloteProduct?.stock || 0;
      return {
        ...change,
        delta,
        currentRouloteStock,
        newRouloteStock: currentRouloteStock + delta
      };
    });

    return (
      <>
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Truck className="text-blue-600" />
            Confirmar Transferência
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={24} className="text-neutral-400" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="text-blue-600 mt-0.5" size={20} />
            <p className="text-blue-800 text-sm">
              O stock abaixo será retirado de <strong>Casa</strong> e adicionado à <strong>Roulote</strong>.
            </p>
          </div>

          <div className="space-y-3">
            {transferSummary.map((item) => (
              <div key={item.productId} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="font-bold text-neutral-800 mb-2">{item.productName}</div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-neutral-500 text-[10px] uppercase font-bold">Casa</span>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-neutral-400">{item.oldStock}</span>
                      <ArrowRight size={14} className="text-neutral-300" />
                      <span className="text-red-600">{item.newStock}</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-neutral-200" />
                  <div className="flex flex-col items-end text-right">
                    <span className="text-neutral-500 text-[10px] uppercase font-bold">Roulote</span>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-neutral-400">{item.currentRouloteStock}</span>
                      <ArrowRight size={14} className="text-neutral-300" />
                      <span className="text-green-600">{item.newRouloteStock}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-neutral-50 flex gap-3">
          <button
            onClick={() => setStep('ask')}
            disabled={isSaving}
            className="flex-1 py-4 px-4 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={onConfirmTransfer}
            disabled={isSaving}
            className="flex-1 py-4 px-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
          >
            {isSaving ? 'A guardar...' : 'Confirmar Tudo'}
          </button>
        </div>
      </>
    );
  };

  const renderConfirmNo = () => (
    <div className="p-8 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-black text-neutral-900 mb-4">Atenção!</h2>
      <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
        Ao confirmar vai <strong className="text-red-600">RETIRAR</strong> stock de <strong className="text-neutral-900">CASA</strong> sem adicionar ao stock da <strong className="text-neutral-900">ROULOTE</strong>.
      </p>
      
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onConfirmNoTransfer}
          disabled={isSaving}
          className="w-full py-4 px-6 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all"
        >
          {isSaving ? 'A processar...' : 'Confirmar e Retirar'}
        </button>
        <button
          onClick={() => setStep('ask')}
          disabled={isSaving}
          className="w-full py-4 px-6 bg-white border border-neutral-200 text-neutral-500 font-bold rounded-2xl hover:bg-neutral-50 transition-all"
        >
          Voltar atrás
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
        >
          {step === 'ask' && renderAsk()}
          {step === 'confirm-yes' && renderConfirmYes()}
          {step === 'confirm-no' && renderConfirmNo()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
