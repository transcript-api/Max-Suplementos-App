import React, { useState } from 'react';
import { SupplementPot, NutritionFactItem } from '../types/maxSuplementosV1';
import { MAX_STORE_CATALOG } from '../lib/maxSuplementosV1Service';

interface RegisterPotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePot: (pot: SupplementPot) => void;
  isDark?: boolean;
}

export const RegisterPotModal: React.FC<RegisterPotModalProps> = ({
  isOpen,
  onClose,
  onSavePot,
  isDark = true,
}) => {
  const [step, setStep] = useState<'scan' | 'found' | 'manual' | 'ocr_review'>('scan');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('MAX Suplementos');
  const [category, setCategory] = useState<'creatina' | 'proteina' | 'pre-treino' | 'vitaminas' | 'outro'>('creatina');
  const [totalSize, setTotalSize] = useState<number>(300);
  const [sizeUnit, setSizeUnit] = useState<'g' | 'scoops' | 'cápsulas' | 'comprimidos' | 'ml'>('g');
  const [dailyDose, setDailyDose] = useState<number>(5);
  const [openingDate, setOpeningDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isStoreVerified, setIsStoreVerified] = useState<boolean>(true);
  const [nutritionFacts, setNutritionFacts] = useState<NutritionFactItem[]>([
    { name: 'Creatina Monohidratada', amount: 5, unit: 'g' },
  ]);

  if (!isOpen) return null;

  // Simular escaneo de código de barras
  const handleSimulateScan = (scannedCode: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const matched = MAX_STORE_CATALOG.find((p) => p.barcode === scannedCode);
      if (matched) {
        setName(matched.name);
        setBrand(matched.brand);
        setCategory(matched.category);
        setTotalSize(matched.defaultSize);
        setSizeUnit(matched.sizeUnit);
        setDailyDose(matched.defaultDose);
        setNutritionFacts(matched.nutritionFacts);
        setIsStoreVerified(true);
        setStep('found');
      } else {
        // No encontrado -> flujo de foto de rótulo / manual
        setName('Suplemento Escaneado');
        setBrand('Marca Externa');
        setIsStoreVerified(false);
        setNutritionFacts([
          { name: 'Creatina', amount: 3, unit: 'g' },
          { name: 'Beta-alanina', amount: 1600, unit: 'mg' },
          { name: 'Cafeína', amount: 200, unit: 'mg' },
        ]);
        setStep('ocr_review');
      }
    }, 700);
  };

  const handleAddNutritionFact = () => {
    setNutritionFacts([...nutritionFacts, { name: '', amount: 0, unit: 'g' }]);
  };

  const handleUpdateFact = (idx: number, field: keyof NutritionFactItem, value: any) => {
    const updated = [...nutritionFacts];
    updated[idx] = { ...updated[idx], [field]: value };
    setNutritionFacts(updated);
  };

  const handleRemoveFact = (idx: number) => {
    setNutritionFacts(nutritionFacts.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const newPot: SupplementPot = {
      id: `pot-${Date.now()}`,
      name: name.trim() || 'Pote de Suplemento',
      brand: brand.trim() || 'MAX Suplementos',
      category,
      totalSize: Number(totalSize) || 300,
      sizeUnit,
      dailyDose: Number(dailyDose) || 5,
      openingDate,
      status: 'ativo',
      isStoreVerified,
      nutritionFactsPerDose: nutritionFacts.filter((f) => f.name.trim() !== ''),
      dosesHistory: [new Date().toISOString().slice(0, 10)], // marca la primera dosis hoy
      warningDaysBefore: 4,
    };

    onSavePot(newPot);
    onClose();
  };

  // Cálculo de término estimado inmediato (según flujo 1 del PDF)
  const totalDosesEstimate = Math.floor((Number(totalSize) || 300) / (Number(dailyDose) || 1));
  const estimatedEndDate = new Date();
  estimatedEndDate.setDate(estimatedEndDate.getDate() + totalDosesEstimate);
  const formattedEndDate = estimatedEndDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#191c20] text-white rounded-2xl max-w-lg w-full border border-[#282a2f] shadow-2xl p-5 my-8 space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#282a2f] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {step === 'scan' ? 'barcode_scanner' : 'medication'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {step === 'scan' && 'Cadastrar o Pote'}
                {step === 'found' && 'Produto Encontrado (MAX)'}
                {step === 'ocr_review' && 'Leitura do Rótulo com IA'}
                {step === 'manual' && 'Preencher Dados do Pote'}
              </h3>
              <p className="text-xs text-[#8d90a0]">
                {step === 'scan' && 'Escaneie o código de barras ou escolha da loja'}
                {step === 'found' && 'Dados que a MAX já conferiu e validou'}
                {step === 'ocr_review' && 'Ingredientes por dose lidos do rótulo (editáveis)'}
                {step === 'manual' && 'Menos de um minuto, uma vez por pote'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8d90a0] hover:text-white p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* STEP 1: Escaneo o selección rápida */}
        {step === 'scan' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#111318] border border-dashed border-[#282a2f] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 text-[#2563eb] dark:text-[#adc6ff] flex items-center justify-center mx-auto">
                <span className={`material-symbols-outlined text-[32px] ${isScanning ? 'animate-pulse' : ''}`}>
                  barcode_scanner
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Aponte a câmera para o código de barras</p>
                <p className="text-[11px] text-[#8d90a0]">
                  Se a MAX já tem o produto no catálogo, os dados vêm 100% preenchidos.
                </p>
              </div>

              {/* Botones de simulación de escaneo para demo rápida */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('7898123456789')}
                  disabled={isScanning}
                  className="w-full py-2 px-3 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Escanear Creatina Creapure MAX (300g)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan('7898999887766')}
                  disabled={isScanning}
                  className="w-full py-2 px-3 rounded-xl bg-[#1d2024] hover:bg-[#282a2f] border border-[#282a2f] text-xs font-bold text-[#c3c6d7] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Escanear Whey Isolado MAX (900g)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan('EXTERNAL_999')}
                  disabled={isScanning}
                  className="w-full py-2 px-3 rounded-xl bg-[#1d2024] hover:bg-[#282a2f] border border-amber-500/30 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">document_scanner</span>
                  <span>Fotografar Tabela de Marca Externa (Leitura IA)</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('manual')}
                className="text-xs font-bold text-[#adc6ff] hover:underline"
              >
                Ou preencher manualmente sem câmera
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Revisión de OCR (Rótulo) */}
        {step === 'ocr_review' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <div>
                <strong>Aguardando confirmação da loja:</strong> O app leu os ingredientes do rótulo. Você pode revisar e salvar normalmente.
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-[#8d90a0] block">Nome do Produto:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111318] border border-[#282a2f] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#8d90a0] block">Marca:</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#111318] border border-[#282a2f] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#8d90a0] block">Tamanho total:</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={totalSize}
                      onChange={(e) => setTotalSize(Number(e.target.value))}
                      className="w-20 bg-[#111318] border border-[#282a2f] rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    />
                    <select
                      value={sizeUnit}
                      onChange={(e: any) => setSizeUnit(e.target.value)}
                      className="flex-1 bg-[#111318] border border-[#282a2f] rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="g">gramas (g)</option>
                      <option value="scoops">scoops</option>
                      <option value="cápsulas">cápsulas</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredientes por dose lidos */}
            <div className="space-y-1.5 pt-2 border-t border-[#282a2f]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Ingredientes por dose (Lidos do rótulo)
                </span>
                <button
                  type="button"
                  onClick={handleAddNutritionFact}
                  className="text-[11px] font-bold text-[#adc6ff] hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {nutritionFacts.map((fact, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-[#111318] p-1.5 rounded-lg border border-[#282a2f]">
                    <input
                      type="text"
                      placeholder="Ingrediente (ex: Cafeína)"
                      value={fact.name}
                      onChange={(e) => handleUpdateFact(idx, 'name', e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white outline-none px-1"
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={fact.amount}
                      onChange={(e) => handleUpdateFact(idx, 'amount', Number(e.target.value))}
                      className="w-16 bg-[#191c20] text-xs text-white border border-[#282a2f] rounded px-1.5 py-0.5 outline-none text-right font-bold"
                    />
                    <select
                      value={fact.unit}
                      onChange={(e: any) => handleUpdateFact(idx, 'unit', e.target.value)}
                      className="bg-[#191c20] text-xs text-white border border-[#282a2f] rounded px-1 py-0.5 outline-none"
                    >
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                      <option value="mcg">mcg</option>
                      <option value="kcal">kcal</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveFact(idx)}
                      className="text-rose-400 hover:text-rose-300 p-0.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="w-1/3 py-2 px-3 rounded-xl bg-[#282a2f] text-xs font-bold text-white hover:bg-[#35373d]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep('found')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-xs font-bold text-white transition-all shadow-md"
              >
                Avançar para Dose
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 / FOUND: 3 informações essenciais (Tamanho, Dose Diária, Data de Abertura) */}
        {(step === 'found' || step === 'manual') && (
          <div className="space-y-4">
            {/* Tag de confirmação da loja ou selo provisório */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111318] border border-[#282a2f]">
              <div>
                <h4 className="font-bold text-sm text-white">{name || 'Produto'}</h4>
                <p className="text-[11px] text-[#8d90a0]">{brand} · {totalSize} {sizeUnit}</p>
              </div>
              {isStoreVerified ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Verificado MAX</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Aguardando loja
                </span>
              )}
            </div>

            {/* Regra de ouro da especificação: O app nunca sugere nem preenche dose diária */}
            <div className="space-y-3 bg-[#111318] p-3.5 rounded-xl border border-[#282a2f]">
              <div>
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Dose diária que você toma:</span>
                  <span className="text-[10px] text-[#8d90a0]">Definida por você</span>
                </label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min="1"
                    value={dailyDose}
                    onChange={(e) => setDailyDose(Math.max(1, Number(e.target.value)))}
                    className="flex-1 bg-[#191c20] border border-[#282a2f] rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-[#2563eb]"
                  />
                  <span className="text-xs text-[#8d90a0] font-bold">
                    {sizeUnit} por dia
                  </span>
                </div>
                <p className="text-[10px] text-[#8d90a0] mt-1">
                  Use a dose que você já toma. O app não recomenda dosagens.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">Abriu o pote em:</label>
                <input
                  type="date"
                  value={openingDate}
                  onChange={(e) => setOpeningDate(e.target.value)}
                  className="w-full bg-[#191c20] border border-[#282a2f] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* Previsão de término em tempo real */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#adc6ff] block">
                    Previsão de término na hora:
                  </span>
                  <span className="font-extrabold text-sm text-white">
                    {formattedEndDate} ({totalDosesEstimate} dias)
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#2563eb] text-[22px]">calendar_month</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="py-2.5 px-4 rounded-xl bg-[#282a2f] hover:bg-[#35373d] text-xs font-bold text-[#c3c6d7]"
              >
                Trocar Produto
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Confirmar Pote</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
