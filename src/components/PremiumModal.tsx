import React from 'react';
import { MaxMindLogo } from './MaxMindLogo';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: (durationDays?: number, message?: string) => void;
  isDark?: boolean;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  isDark = true,
}) => {
  const [couponCode, setCouponCode] = React.useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError('Ingresa el código que figura en tu ticket de compra.');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCouponSuccess(data.message);
        setTimeout(() => {
          if (onUpgrade) onUpgrade(data.durationDays, data.message);
          onClose();
        }, 1800);
      } else {
        setCouponError(data.message || 'Código inválido o ya utilizado.');
      }
    } catch (err) {
      setCouponError('Error al contactar con el servidor. Intenta nuevamente.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const features = [
    { name: 'Form Diaria y Objetivos de Hoy', free: true, pro: true },
    { name: 'Rachas y Niveles de Compromiso', free: true, pro: true },
    { name: 'Registro de Suplementos (1-Tap)', free: true, pro: true },
    { name: 'Ranking Global y de Liga', free: true, pro: true },
    { name: 'MAX AI: Coach Inteligente con IA', free: false, pro: true, highlight: true },
    { name: 'Heladera IA: "¿Qué tengo para comer?" con fotos', free: false, pro: true, highlight: true },
    { name: 'Análisis Visual Predictivo de Platos y Macros', free: false, pro: true, highlight: true },
    { name: 'Desafíos Exclusivos y Cupones VIP (hasta 25% OFF)', free: false, pro: true },
    { name: 'Alertas Predictivas de Reposición de Suplementos', free: false, pro: true },
    { name: 'Exportación Clínica de Telemetría (PDF y CSV)', free: false, pro: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0B1220] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-fadeIn my-auto">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748B] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        {/* Encabezado con Logo MAXMIND */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="mb-1">
            <MaxMindLogo variant="symbol" size="md" isDark={true} />
          </div>
          <span className="px-3 py-1 rounded-full bg-[#2563EB]/20 text-[#3B82F6] font-bold text-[11px] uppercase tracking-wider border border-[#2563EB]/40 inline-block">
            MAXMIND PRO
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Llevá tu progreso al siguiente nivel
          </h2>
          <p className="text-xs text-[#CBD5E1] max-w-sm mx-auto">
            Desbloquea el análisis de alimentos por foto, coach IA ilimitado y descuentos exclusivos en MAX Suplementos.
          </p>
        </div>

        {/* Beneficio exclusivo para clientes MAX y Canje de Código */}
        <div className="p-4 bg-[#102A56]/60 border border-[#2563EB]/40 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">¿Compraste en MAX Suplementos?</h4>
              <p className="text-[11px] text-[#CBD5E1]">
                Ingresá el código de tu ticket o promoción (ej. <strong>MAXPRO30</strong>, <strong>TICKET-8849</strong>) para activar tu mes Pro.
              </p>
            </div>
          </div>

          {/* Formulario de Canje */}
          <form onSubmit={handleRedeemCoupon} className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DE TICKET (EJ. MAXPRO30)"
                className="flex-1 px-3 py-2 bg-[#0B1220] border border-[#2563EB]/50 rounded-xl text-xs text-white placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB] uppercase tracking-wider font-mono"
              />
              <button
                type="submit"
                disabled={isValidatingCoupon}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1"
              >
                {isValidatingCoupon ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>Canjear</span>
                  </>
                )}
              </button>
            </div>

            {couponError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{couponError}</span>
              </div>
            )}

            {couponSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{couponSuccess}</span>
              </div>
            )}
          </form>
        </div>

        {/* Tabla comparativa */}
        <div className="bg-[#101A2B] border border-[#1E293B] rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 p-2.5 bg-[#07090D] text-[11px] font-bold uppercase tracking-wider border-b border-[#1E293B]">
            <span className="col-span-4 text-[#64748B]">Funcionalidad</span>
            <span className="col-span-1 text-center text-[#64748B]">Gratis</span>
            <span className="col-span-1 text-center text-[#3B82F6]">Pro</span>
          </div>
          <div className="divide-y divide-[#1E293B] max-h-60 overflow-y-auto">
            {features.map((f, i) => (
              <div key={i} className="grid grid-cols-6 p-2.5 text-xs items-center">
                <span className={`col-span-4 font-medium ${f.highlight ? 'text-white font-semibold flex items-center gap-1' : 'text-[#CBD5E1]'}`}>
                  {f.highlight && <span className="text-[#3B82F6] text-[10px]">★</span>}
                  {f.name}
                </span>
                <span className="col-span-1 text-center">
                  {f.free ? (
                    <span className="text-emerald-400 font-bold">✓</span>
                  ) : (
                    <span className="text-[#64748B]">—</span>
                  )}
                </span>
                <span className="col-span-1 text-center">
                  <span className="text-[#3B82F6] font-bold">✓</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Planes */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-[#101A2B] border border-[#1E293B] rounded-xl text-center space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Mensual</span>
            <div className="text-lg font-black text-white">$9.99<span className="text-xs text-[#64748B] font-normal">/mes</span></div>
            <span className="text-[10px] text-[#64748B] block">Cancela cuando quieras</span>
          </div>
          <div className="p-3 bg-[#102A56]/40 border border-[#2563EB] rounded-xl text-center space-y-1 relative overflow-hidden">
            <span className="absolute top-1 right-2 text-[9px] font-bold text-emerald-400">AHORRA 30%</span>
            <span className="text-[10px] text-[#3B82F6] uppercase font-bold block">Anual VIP</span>
            <div className="text-lg font-black text-white">$6.99<span className="text-xs text-[#64748B] font-normal">/mes</span></div>
            <span className="text-[10px] text-emerald-400 block">+ Pack Shaker de regalo</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              if (onUpgrade) onUpgrade();
              onClose();
            }}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#2563EB]/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span>Activar 30 Días de Prueba Pro</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-[#64748B] hover:text-white transition-colors"
          >
            Continuar con el plan Gratuito
          </button>
        </div>
      </div>
    </div>
  );
};
