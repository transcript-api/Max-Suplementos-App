import React, { useState } from 'react';

export interface SupplementItem {
  id: string;
  name: string;
  brand: string;
  totalServings: number;
  remainingServings: number;
  unit: string;
  dailyDose: string;
  reorderDiscountPct: number;
}

interface SupplementReplenishmentCardProps {
  userName?: string;
  isDark?: boolean;
}

export const SupplementReplenishmentCard: React.FC<SupplementReplenishmentCardProps> = ({
  userName = 'Atleta',
  isDark = true,
}) => {
  const [supplements, setSupplements] = useState<SupplementItem[]>([
    {
      id: 'creatina',
      name: 'Creatina Monohidrato Creapure',
      brand: 'MAX Suplementos',
      totalServings: 60,
      remainingServings: 7, // Pocas tomas -> Gatilla alerta de reposición
      unit: 'dosis (5g)',
      dailyDose: '1 scoop diario post-entreno',
      reorderDiscountPct: 15,
    },
    {
      id: 'proteina',
      name: 'Whey Protein Isolate 90%',
      brand: 'MAX Suplementos',
      totalServings: 33,
      remainingServings: 14,
      unit: 'scoops (30g)',
      dailyDose: '1 scoop diario con agua/leche',
      reorderDiscountPct: 15,
    },
    {
      id: 'omega3',
      name: 'Ultra Omega 3 EPA/DHA',
      brand: 'MAX Suplementos',
      totalServings: 60,
      remainingServings: 28,
      unit: 'cápsulas',
      dailyDose: '2 cápsulas con el almuerzo',
      reorderDiscountPct: 10,
    },
  ]);

  const [referralCopied, setReferralCopied] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  // Código único de referido para el usuario
  const referralCode = `MAX-${userName.toUpperCase().replace(/\s+/g, '')}-777`;

  // Tomar una dosis diaria
  const handleTakeServing = (id: string) => {
    setSupplements((prev) =>
      prev.map((sup) => {
        if (sup.id === id && sup.remainingServings > 0) {
          return { ...sup, remainingServings: sup.remainingServings - 1 };
        }
        return sup;
      })
    );
  };

  // Copiar código de referido
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(
      `¡Unite a MAXFORM con mi código de atleta ${referralCode} y llevate 15% OFF en tu primera compra en MAX Suplementos! https://maxform.app/ref/${referralCode}`
    );
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 3000);
  };

  // Disparar prueba de webhook para n8n (WhatsApp / CRM)
  const handleTriggerWebhook = async (item: SupplementItem) => {
    setIsSendingWebhook(true);
    setWebhookMessage(null);
    try {
      const res = await fetch('/api/webhooks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'SUPPLEMENT_REORDER_ALERT',
          athleteName: userName,
          phone: '+54 9 11 0000-0000',
          payload: {
            supplementName: item.name,
            remainingServings: item.remainingServings,
            discountPct: item.reorderDiscountPct,
          },
        }),
      });
      const data = await res.json();
      setWebhookMessage(data.message || 'Webhook enviado exitosamente a n8n.');
      setTimeout(() => setWebhookMessage(null), 5000);
    } catch (err) {
      setWebhookMessage('Error al disparar el webhook hacia n8n.');
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Módulo de Reposición Inteligente de Suplementos */}
      <section
        id="supplement-replenishment-section"
        className="p-5 rounded-2xl dark:bg-[#111318] bg-white border dark:border-[#282a2f] border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b dark:border-[#282a2f] border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#2563eb] dark:text-[#b4c5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold dark:text-white text-slate-900">
                Pastillero & Reposición Inteligente
              </h3>
              <p className="text-xs dark:text-[#8d90a0] text-slate-500">
                Monitoreo de stock de tomas para no cortar la saturación de creatina ni la síntesis proteica.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
            Sincronizado con MAX Suplementos
          </span>
        </div>

        {webhookMessage && (
          <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-[#2563eb] dark:text-[#b4c5ff] text-xs flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
            <span>{webhookMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {supplements.map((sup) => {
            const isLowStock = sup.remainingServings <= 7;
            const pctRemaining = Math.round((sup.remainingServings / sup.totalServings) * 100);

            return (
              <div
                key={sup.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isLowStock
                    ? 'dark:bg-rose-950/20 bg-rose-50/50 border-rose-500/40'
                    : 'dark:bg-[#191c20] bg-slate-50 border-slate-200 dark:border-[#282a2f]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8d90a0] block">
                        {sup.brand}
                      </span>
                      <h4 className="font-bold text-sm dark:text-white text-slate-900 leading-snug">
                        {sup.name}
                      </h4>
                    </div>
                    {isLowStock ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-extrabold animate-pulse whitespace-nowrap">
                        STOCK BAJO
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                        OK
                      </span>
                    )}
                  </div>

                  {/* Barra de progreso de dosis restantes */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="dark:text-[#8d90a0] text-slate-500">Restante:</span>
                      <span className="font-bold dark:text-white text-slate-800">
                        {sup.remainingServings} de {sup.totalServings} {sup.unit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-[#111318] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isLowStock ? 'bg-rose-500' : 'bg-[#2563eb]'
                        }`}
                        style={{ width: `${pctRemaining}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-[11px] dark:text-[#8d90a0] text-slate-500 italic">
                    Dosis: {sup.dailyDose}
                  </p>
                </div>

                {/* Acciones del Suplemento */}
                <div className="pt-3 mt-2 border-t dark:border-[#282a2f] border-slate-200 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleTakeServing(sup.id)}
                    disabled={sup.remainingServings === 0}
                    className="w-full py-1.5 px-3 rounded-lg dark:bg-[#111318] bg-white hover:bg-slate-100 dark:hover:bg-[#20242b] border dark:border-[#282a2f] border-slate-200 text-xs font-bold dark:text-white text-slate-800 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">check</span>
                    <span>Tomar dosis hoy (-1 {sup.unit.split(' ')[0]})</span>
                  </button>

                  {isLowStock && (
                    <div className="space-y-1.5 pt-1">
                      <a
                        href={`https://wa.me/5491100000000?text=${encodeURIComponent(
                          `Hola MAX Suplementos! Se me están terminando las dosis de ${sup.name} en mi app MAXFORM. Quiero pedir reposición con mi ${sup.reorderDiscountPct}% OFF de atleta!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                        <span>Pedir Reposición ({sup.reorderDiscountPct}% OFF)</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleTriggerWebhook(sup)}
                        disabled={isSendingWebhook}
                        className="w-full py-1 px-2 rounded text-[10px] text-[#8d90a0] hover:dark:text-white hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
                        title="Simula el envío de webhook hacia n8n para disparo de WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        <span>Disparar flujo n8n WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Programa de Referidos & Crecimiento Viral */}
      <section
        id="athlete-referral-section"
        className="p-5 rounded-2xl dark:bg-[#111318] bg-white border dark:border-[#282a2f] border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b dark:border-[#282a2f] border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">share_reviews</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold dark:text-white text-slate-900">
                Programa de Referidos de Atletas
              </h3>
              <p className="text-xs dark:text-[#8d90a0] text-slate-500">
                Compartí tu código único con amigos del gimnasio y desbloqueá suplementos gratis.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 text-[11px] font-bold">
            Ganas Vos & Gana Tu Amigo
          </span>
        </div>

        {/* Tarjeta de Código */}
        <div className="p-4 rounded-xl dark:bg-[#191c20] bg-slate-50 border dark:border-[#282a2f] border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#8d90a0] block">Tu Código Personal</span>
            <div className="text-lg sm:text-xl font-mono font-black text-[#2563eb] dark:text-[#b4c5ff] tracking-wider">
              {referralCode}
            </div>
            <p className="text-xs dark:text-[#c3c6d7] text-slate-600">
              Otorga <strong>15% OFF</strong> a tus invitados en su primera compra en MAX Suplementos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyReferral}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">
              {referralCopied ? 'check' : 'content_copy'}
            </span>
            <span>{referralCopied ? '¡Enlace Copiado!' : 'Copiar Enlace de Invitación'}</span>
          </button>
        </div>

        {/* Niveles de Recompensas por Amigos Invitados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl dark:bg-[#191c20] bg-slate-50 border dark:border-[#282a2f] border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8d90a0]">Nivel 1 (1 Amigo)</span>
              <span className="text-xs">🥉</span>
            </div>
            <h5 className="font-bold text-xs dark:text-white text-slate-900">7 Días MAXMIND Pro</h5>
            <p className="text-[10px] dark:text-[#8d90a0] text-slate-500">
              Activación instantánea de análisis de comidas con IA ilimitado.
            </p>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#191c20] bg-slate-50 border dark:border-[#282a2f] border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-500">Nivel 2 (3 Amigos)</span>
              <span className="text-xs">🥈</span>
            </div>
            <h5 className="font-bold text-xs dark:text-white text-slate-900">Shaker Pro Térmico</h5>
            <p className="text-[10px] dark:text-[#8d90a0] text-slate-500">
              Retiralo gratis en sucursal con tu ticket de canje.
            </p>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#191c20] bg-slate-50 border border-emerald-500/40 dark:bg-emerald-950/20 bg-emerald-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-500">Nivel 3 (5 Amigos)</span>
              <span className="text-xs">🥇</span>
            </div>
            <h5 className="font-bold text-xs dark:text-white text-slate-900">$15.000 de Crédito</h5>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Válido para canjear en Creatina o Proteína en MAX Suplementos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
