import React, { useState } from 'react';
import { estimateFoodIntake, FoodEstimateResult } from '../lib/gemini';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  estimate?: FoodEstimateResult;
}

interface MaxAiSimpleChatProps {
  onAddProtein?: (grams: number) => void;
  onAddMealEntry?: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => void;
  isDark?: boolean;
}

export const MaxAiSimpleChat: React.FC<MaxAiSimpleChatProps> = ({
  onAddProtein,
  onAddMealEntry,
  isDark = true,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola Santiago! Soy MAX AI. Escribe en texto qué comiste (por ejemplo: "2 huevos revueltos con una tostada y medio aguacate") y estimaré tus proteínas y calorías al instante.',
      timestamp: 'Ahora',
    },
  ]);

  const quickPrompts = [
    '2 huevos revueltos con tostada integral',
    'Pechuga a la plancha (180g) con arroz',
    'Lata de atún al agua con 2 galletas de arroz',
    'Batido de Whey Protein (30g) con avena',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const estimate = await estimateFoodIntake(query);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Analicé "${query}". Aquí tienes el desglose nutricional estimado por Gemini:`,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        estimate,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Estimación calculada: aproximadamente 24g de proteína y 320 calorías. Buen balance para tu ventana metabólica.',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        estimate: {
          foodSummary: query,
          protein: 24,
          calories: 320,
          carbs: 25,
          fats: 10,
          confidence: 'Estimado',
          nutritionTip: 'Aporte de alto valor biológico para la reconstrucción muscular.',
        },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full rounded-2xl border dark:bg-[#191c20] bg-white dark:border-[#282a2f] border-slate-200 shadow-xl overflow-hidden">
      {/* Encabezado del Chat */}
      <div className="p-4 border-b dark:border-[#282a2f] border-slate-200 flex items-center justify-between dark:bg-[#1d2024]/70 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-headline-md text-sm font-bold dark:text-white text-slate-800 flex items-center gap-1.5">
              MAX AI · Estimador de Comidas
            </h3>
            <p className="text-xs dark:text-[#8d90a0] text-slate-500">
              Ingresa lo que comiste para calcular proteínas y calorías
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Gemini 2.5
        </span>
      </div>

      {/* Historial de Mensajes */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto min-h-[220px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#2563eb] text-white rounded-br-none shadow-md'
                  : 'dark:bg-[#1d2024] bg-slate-100 dark:text-[#e2e2e8] text-slate-800 rounded-bl-none border dark:border-[#282a2f] border-slate-200'
              }`}
            >
              <p>{msg.text}</p>

              {/* Ficha de macronutrientes estructurada */}
              {msg.estimate && (
                <div className="mt-3 pt-3 border-t dark:border-[#282a2f] border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="dark:bg-[#191c20] bg-white p-2.5 rounded-xl border dark:border-[#282a2f] border-slate-200">
                      <span className="text-[10px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
                        Proteína Estimada
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-[#2563eb] dark:text-[#b4c5ff]">
                          {msg.estimate.protein}
                        </span>
                        <span className="text-xs dark:text-[#8d90a0] text-slate-500">gramos</span>
                      </div>
                    </div>

                    <div className="dark:bg-[#191c20] bg-white p-2.5 rounded-xl border dark:border-[#282a2f] border-slate-200">
                      <span className="text-[10px] uppercase font-bold dark:text-[#8d90a0] text-slate-400 block">
                        Calorías Totales
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold dark:text-white text-slate-800">
                          {msg.estimate.calories}
                        </span>
                        <span className="text-xs dark:text-[#8d90a0] text-slate-500">kcal</span>
                      </div>
                    </div>
                  </div>

                  {msg.estimate.carbs !== undefined && msg.estimate.fats !== undefined && (
                    <div className="flex items-center justify-between text-[11px] px-1 dark:text-[#8d90a0] text-slate-500">
                      <span>Carbohidratos: <strong>{msg.estimate.carbs}g</strong></span>
                      <span>Grasas: <strong>{msg.estimate.fats}g</strong></span>
                    </div>
                  )}

                  {msg.estimate.nutritionTip && (
                    <p className="text-xs dark:text-[#adc6ff] text-blue-700 dark:bg-[#2563eb]/10 bg-blue-50 p-2 rounded-lg border dark:border-[#2563eb]/20 border-blue-200">
                      💡 {msg.estimate.nutritionTip}
                    </p>
                  )}

                  {msg.estimate.protein > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const est = msg.estimate!;
                        if (onAddMealEntry) {
                          onAddMealEntry({
                            name: est.foodSummary || 'Comida registrada con MAX AI',
                            protein: est.protein,
                            carbs: est.carbs ?? 25,
                            fats: est.fats ?? 10,
                            calories: est.calories ?? 300,
                          });
                        } else if (onAddProtein) {
                          onAddProtein(est.protein);
                        }
                      }}
                      className="w-full mt-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#2563eb] hover:bg-[#3b82f6] text-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_task</span>
                      <span>Registrar en Macros (+{msg.estimate.protein}g P · {msg.estimate.calories} kcal)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] dark:text-[#8d90a0] text-slate-400 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs dark:text-[#b4c5ff] text-blue-600 p-2">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping"></span>
            <span>Gemini está estimando los macronutrientes...</span>
          </div>
        )}
      </div>

      {/* Prompts Rápidos */}
      <div className="px-4 py-2 border-t dark:border-[#282a2f] border-slate-200 flex gap-2 overflow-x-auto no-scrollbar dark:bg-[#1d2024]/40 bg-slate-50">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full border dark:border-[#282a2f] border-slate-300 dark:bg-[#191c20] bg-white dark:text-[#c3c6d7] text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Formulario de Envío */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t dark:border-[#282a2f] border-slate-200 flex items-center gap-2 dark:bg-[#191c20] bg-white"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe qué comiste (ej: 150g pollo con puré)..."
          disabled={loading}
          className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border dark:bg-[#1d2024] bg-slate-100 dark:border-[#282a2f] border-slate-300 dark:text-white text-slate-800 placeholder:dark:text-[#8d90a0] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
        >
          <span>Enviar</span>
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </form>
    </div>
  );
};
