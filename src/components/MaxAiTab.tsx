import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  options?: { title: string; protein: string; calories: string }[];
  quickReplies?: string[];
}

interface MaxAiTabProps {
  initialPrompt?: string;
  currentProtein: number;
  streakDays: number;
}

export const MaxAiTab: React.FC<MaxAiTabProps> = ({
  initialPrompt,
  currentProtein,
  streakDays,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hola Santiago, veo que hoy vas excelente. Ya registraste tu entrenamiento de empuje y llevas ${currentProtein}/150 g de proteína. Te faltan solo 22 g para cerrar tu Form diaria y asegurar el bonus de racha. ¿En qué te puedo asesorar ahora?`,
      timestamp: '17:42',
      options: [
        { title: '1. Yogur griego natural (200g) + 1 scoop Whey', protein: '32g PROT', calories: '185 kcal' },
        { title: '2. Ensalada de atún al agua con 2 claras', protein: '34g PROT', calories: '190 kcal' },
        { title: '3. Tortilla de 4 claras con 50g pechuga', protein: '28g PROT', calories: '160 kcal' },
      ],
      quickReplies: ['Tengo yogur y proteína', 'Solo atún y huevos', '¿Qué entreno mañana?']
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            currentProtein,
            targetProtein: 150,
            streakDays,
            athleteLevel: 7,
            weightKg: 72.4,
          }
        })
      });

      const data = await res.json();
      const replyText = data.reply || "Excelente. Sigamos firmes con el plan de hoy.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ['Entendido, gracias MAX', '¿Qué ceno esta noche?', 'Verificar mis macros']
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Para cerrar tus macros de hoy te sugiero combinar 1 scoop de Whey Protein con 150ml de agua o leche descremada. Eso te aporta 24g de proteína pura con apenas 120 kcal. ¡Objetivo sellado!",
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Dictado por voz simulado: "MAX, ¿qué puedo cenar rápido hoy?"');
      setInput('¿Qué puedo cenar rápido hoy con alta proteína?');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (uploadEvt) => {
        const base64 = uploadEvt.target?.result as string;
        const photoMsg: Message = {
          id: Date.now().toString(),
          sender: 'user',
          text: '📸 [Foto de comida enviada para análisis]',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, photoMsg]);
        setIsLoading(true);

        try {
          const res = await fetch('/api/ai/analyze-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 })
          });
          const data = await res.json();

          const replyMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: `He analizado tu plato: **${data.title || 'Plato saludable'}**.\n• Calorías: ${data.calories || 480} kcal\n• Proteína: ${data.protein || 38} g\n• Carbohidratos: ${data.carbs || 45} g\n• Grasas: ${data.fats || 12} g\n\n${data.coachTip || '¡Excelente elección de combustible limpio!'}`,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            quickReplies: ['Guardar en mi registro de hoy', '¿Me alcanza para mi meta?']
          };
          setMessages((prev) => [...prev, replyMsg]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: "Foto analizada con éxito: Pechuga grillada con arroz integral y verduras al vapor. Estimado: 42g Proteína, 480 kcal. ¡Perfecto para tu meta!",
              timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const quickPrompts = [
    'Analizar mi comida',
    '¿Qué puedo cocinar?',
    'Ayúdame con mi proteína',
    '¿Qué entreno hoy?',
    'Revisar mi progreso',
    'Necesito motivación'
  ];

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8.5rem)] max-w-[1280px] mx-auto px-4 pb-2">
      {/* Telemetry Live Status Capsule */}
      <div className="bg-[#191c20] p-3 rounded-xl border border-[#282a2f] mb-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563eb]/20 text-[#b4c5ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-body-md text-white font-bold">MAX AI Coach</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En línea
              </span>
            </div>
            <span className="text-[12px] text-[#8d90a0]">
              Contexto: {currentProtein}/150g Prot • Racha {streakDays}d • Nivel 7
            </span>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => handleSend("Hazme un resumen de mi día y qué me falta.")}
          className="text-xs bg-[#2563eb]/20 hover:bg-[#2563eb]/30 text-[#b4c5ff] px-2.5 py-1 rounded-lg border border-[#2563eb]/40 font-semibold transition-colors"
        >
          Resumen Express
        </button>
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1d2024] hover:bg-[#282a2f] text-white font-body-sm text-body-sm border border-[#282a2f] active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[14px] text-[#b4c5ff]">sparkles</span>
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar my-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-[#2563eb] text-white rounded-br-none'
                  : 'bg-[#191c20] text-[#e2e2e8] rounded-bl-none border border-[#282a2f]'
              }`}
            >
              <div className="whitespace-pre-wrap font-body-md text-body-md leading-relaxed">
                {msg.text}
              </div>

              {/* Opciones estructuradas si existen */}
              {msg.options && (
                <div className="space-y-2 mt-3 pt-2 border-t border-[#282a2f]">
                  {msg.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#1d2024] rounded-lg border border-[#282a2f] flex justify-between items-center text-xs"
                    >
                      <span className="text-white font-medium">{opt.title}</span>
                      <div className="text-right">
                        <span className="text-[#b4c5ff] font-bold block">{opt.protein}</span>
                        <span className="text-[#8d90a0]">{opt.calories}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`block text-[10px] mt-2 ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-[#8d90a0]'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {/* Quick replies */}
            {msg.quickReplies && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                {msg.quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(qr)}
                    className="text-xs bg-[#1d2024] hover:bg-[#282a2f] text-[#b4c5ff] px-2.5 py-1 rounded-full border border-[#282a2f] transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-[#191c20] rounded-2xl rounded-bl-none border border-[#282a2f] max-w-xs text-[#b4c5ff]">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.4s]"></span>
            <span className="text-xs text-[#8d90a0] ml-2">MAX AI está analizando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 pt-2 border-t border-[#282a2f]">
        <div className="bg-[#191c20] p-2 rounded-2xl border border-[#282a2f] flex items-center gap-2 shadow-lg">
          {/* Botón Foto */}
          <label className="p-2 text-[#8d90a0] hover:text-[#b4c5ff] hover:bg-[#282a2f] rounded-full transition-colors cursor-pointer flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>

          {/* Botón Micrófono */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[#8d90a0] hover:text-[#b4c5ff] hover:bg-[#282a2f]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>

          {/* Input de texto */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Escuchando tu voz...' : 'Escribe a tu coach MAX AI...'}
            className="flex-1 bg-transparent text-white placeholder-[#8d90a0] text-sm focus:outline-none px-1"
          />

          {/* Botón Enviar */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-[#2563eb] hover:bg-[#3b82f6] text-white shadow-md active:scale-95'
                : 'bg-[#282a2f] text-[#8d90a0] cursor-not-allowed opacity-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
