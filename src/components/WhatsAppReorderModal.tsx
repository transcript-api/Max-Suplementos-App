import React from 'react';
import { SupplementPot } from '../types/maxSuplementosV1';

interface WhatsAppReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  potsToOrder: SupplementPot[];
  storeWhatsApp?: string;
  isVip?: boolean;
}

export const WhatsAppReorderModal: React.FC<WhatsAppReorderModalProps> = ({
  isOpen,
  onClose,
  potsToOrder,
  storeWhatsApp = '5491100000000',
  isVip = false,
}) => {
  if (!isOpen || potsToOrder.length === 0) return null;

  const isGrouped = potsToOrder.length > 1;

  // Construir mensaje de WhatsApp con formato profesional y listo
  const buildWhatsAppMessage = () => {
    if (potsToOrder.length === 1) {
      const pot = potsToOrder[0];
      return `Olá MAX Suplementos! 👋\n\nMeu ${pot.name} (${pot.brand}) está acabando pelo app MAX Tracker.\n\nGostaria de pedir a reposição:\n- Produto: ${pot.name}\n- Quantidade: 1 pote (${pot.totalSize} ${pot.sizeUnit})\n\nPor favor, confirmem o valor com desconto e a entrega!`;
    }

    // Pedido agrupado (VIP)
    const itemsList = potsToOrder
      .map((p, i) => `${i + 1}. ${p.name} (${p.brand}) - ${p.totalSize} ${p.sizeUnit}`)
      .join('\n');

    return `Olá MAX Suplementos! 👋\n\nEstou usando o app MAX Tracker (VIP) e tenho suplementos acabando nos próximos dias. Gostaria de fazer o PEDIDO AGRUPADO:\n\n${itemsList}\n\nPor favor, me enviem o valor total e o prazo de entrega. Obrigado!`;
  };

  const messageText = buildWhatsAppMessage();
  const whatsappUrl = `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#191c20] text-white rounded-2xl max-w-md w-full border border-[#282a2f] shadow-2xl p-5 space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#282a2f] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isGrouped ? 'Pedido Agrupado (VIP)' : 'Confirmar Pedido'}
              </h3>
              <p className="text-xs text-[#8d90a0]">
                O fechamento e pagamento continuam direto com a MAX
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

        {/* Resumen de items a pedir */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8d90a0]">
            {isGrouped ? `Itens para reposição (${potsToOrder.length})` : 'Item para reposição'}
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {potsToOrder.map((pot) => (
              <div
                key={pot.id}
                className="p-2.5 rounded-xl bg-[#111318] border border-[#282a2f] flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{pot.name}</h4>
                  <span className="text-[10px] text-[#8d90a0]">
                    {pot.brand} · {pot.totalSize} {pot.sizeUnit}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-extrabold text-[10px]">
                  1 un
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vista previa do WhatsApp */}
        <div className="p-3 rounded-xl bg-[#111318] border border-[#282a2f] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#25d366] font-bold">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>Mensagem já escrita para o WhatsApp:</span>
          </div>
          <div className="p-2 rounded-lg bg-[#0c0e12] text-[11px] text-[#c3c6d7] font-mono whitespace-pre-line border border-[#282a2f]/60 max-h-28 overflow-y-auto">
            {messageText}
          </div>
        </div>

        <p className="text-[11px] text-[#8d90a0] text-center">
          Ao tocar abaixo, o WhatsApp abre direto com a loja. Sem pagamento dentro do app.
        </p>

        {/* Botão de continuação */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-[#282a2f] hover:bg-[#35373d] text-xs font-bold text-[#c3c6d7]"
          >
            Cancelar
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-black text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Continuar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
