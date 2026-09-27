import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudioWithGemini } from '../lib/gemini';

export type ChatRole = 'coach' | 'nutritionist' | 'fast' | 'auto';

export interface ChatRoleDefinition {
  id: ChatRole;
  name: string;
  shortName: string;
  model: string;
  taskType: string;
  icon: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  quickPrompts: string[];
}

export const CHAT_ROLES: ChatRoleDefinition[] = [
  {
    id: 'coach',
    name: 'Coach de Rendimiento',
    shortName: 'Coach General',
    model: 'gemini-3.5-flash',
    taskType: 'Tareas Generales',
    icon: 'fitness_center',
    badgeColor: 'text-blue-400 border-blue-500/30',
    badgeBg: 'bg-blue-500/10',
    description: 'Mentalidad de consistencia, racha ("Tú vs Tú"), hábitos y planificación diaria.',
    quickPrompts: [
      '¿Cómo mantengo mi racha hoy?',
      'Organizar mis comidas del día',
      '¿Qué como para llegar a mi proteína?',
      'Rutina de estiramiento y descanso',
    ],
  },
  {
    id: 'nutritionist',
    name: 'Nutricionista Bioquímico Pro',
    shortName: 'Nutrición Compleja',
    model: 'gemini-3.1-pro-preview',
    taskType: 'Tareas Complejas',
    icon: 'biotech',
    badgeColor: 'text-purple-400 border-purple-500/30',
    badgeBg: 'bg-purple-500/10',
    description: 'Fisiología avanzada: activación de mTOR, balance de nitrógeno, fórmulas Cunningham/Katch-McArdle y creatina Creapure.',
    quickPrompts: [
      'Calcular TMB y umbral de leucina mTOR',
      'Protocolo de saturación con creatina Creapure',
      'Periodización de carbohidratos peri-entreno',
      'Desglose fino de micronutrientes y electrolitos',
    ],
  },
  {
    id: 'fast',
    name: 'Fast Logger & Express',
    shortName: 'Express Rápido',
    model: 'gemini-3.1-flash-lite',
    taskType: 'Tareas Rápidas',
    icon: 'bolt',
    badgeColor: 'text-amber-400 border-amber-500/30',
    badgeBg: 'bg-amber-500/10',
    description: 'Estimaciones en microsegundos de macros y calorías con respuestas ultrarrápidas.',
    quickPrompts: [
      '2 huevos revueltos con tostada',
      '180g de pechuga de pollo grillada',
      '1 scoop Whey Protein con 200ml de leche',
      'Lata de atún al natural con 2 galletas',
    ],
  },
  {
    id: 'auto',
    name: 'Auto Inteligente',
    shortName: 'Auto',
    model: 'Detección dinámica',
    taskType: 'Adaptativo',
    icon: 'auto_awesome',
    badgeColor: 'text-emerald-400 border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    description: 'Detecta automáticamente la complejidad y selecciona el modelo de Gemini óptimo.',
    quickPrompts: [
      '📍 Tiendas de suplementos cerca',
      '🏋️ Gimnasios cerca de mi ubicación',
      '¿Qué puedo cenar rápido con 30g de proteína?',
      'Explícame la relación entre leucina e hipertrofia',
    ],
  },
];

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleId?: string;
  roleName?: string;
  options?: { title: string; protein: string; calories: string }[];
  quickReplies?: string[];
  places?: Array<{ title: string; uri: string; reviewSnippets?: string[] }>;
  isMapsGrounded?: boolean;
}

export interface MaxAiTabProps {
  initialPrompt?: string;
  currentProtein: number;
  streakDays: number;
  userName?: string;
  userId?: string;
  athleteLevel?: number;
  weightKg?: number;
  onAddMealEntry?: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => void;
  onOpenAudioTranscriber?: () => void;
}

export const MaxAiTab: React.FC<MaxAiTabProps> = ({
  initialPrompt,
  currentProtein,
  streakDays,
  userName = 'Atleta',
  userId = 'athlete_default',
  athleteLevel = 1,
  weightKg = 70.0,
  onAddMealEntry,
  onOpenAudioTranscriber,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRole>('coach');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const activeRoleDef = CHAT_ROLES.find((r) => r.id === selectedRole) || CHAT_ROLES[0];

  const getWelcomeMessageForRole = (role: ChatRole): Message => {
    switch (role) {
      case 'nutritionist':
        return {
          id: 'welcome-nutri',
          sender: 'ai',
          roleId: 'nutritionist',
          roleName: 'Nutricionista Bioquímico Pro',
          modelUsed: 'gemini-3.1-pro-preview',
          text: `Hola ${userName}. He activado el modo de **Nutrición Compleja (gemini-3.1-pro-preview)**.\n\nEstoy preparado para analizar cálculos metabólicos avanzados (fórmulas Cunningham / Katch-McArdle según tu composición corporal), balance de nitrógeno, periodización de carbohidratos y optimización de leucina para la síntesis proteica vía mTOR. Llevas **${currentProtein}g** de proteína registrados hoy. ¿Qué cálculo o protocolo abordamos?`,
          timestamp: 'Ahora',
          quickReplies: [
            'Calcular TMB y umbral de leucina mTOR',
            'Protocolo de creatina Creapure',
            'Periodización de carbohidratos',
          ],
        };
      case 'fast':
        return {
          id: 'welcome-fast',
          sender: 'ai',
          roleId: 'fast',
          roleName: 'Fast Logger & Express',
          modelUsed: 'gemini-3.1-flash-lite',
          text: `¡Listo ${userName}! Modo **Fast Logger activado (gemini-3.1-flash-lite)**. Dime qué comiste o qué necesitas en 1 línea y te daré el desglose de macros y kcal en microsegundos.`,
          timestamp: 'Ahora',
          quickReplies: [
            '2 huevos con 1 tostada',
            '180g de pollo con arroz',
            '1 scoop Whey con avena',
          ],
        };
      case 'auto':
        return {
          id: 'welcome-auto',
          sender: 'ai',
          roleId: 'auto',
          roleName: 'Auto Inteligente',
          modelUsed: 'gemini-3.5-flash',
          text: `Hola ${userName}. En modo **Auto Inteligente**, derivo automáticamente tus mensajes al modelo de Gemini óptimo:\n• **gemini-3.1-flash-lite** para consultas y conteos rápidos.\n• **gemini-3.1-pro-preview** para cálculos metabólicos y bioquímicos complejos.\n• **gemini-3.5-flash** para coaching general y Google Maps Grounding.`,
          timestamp: 'Ahora',
          quickReplies: [
            '📍 Tiendas de suplementos cerca',
            '¿Qué ceno para sumar 30g de proteína?',
            'Calcular mi gasto calórico exacto',
          ],
        };
      default:
        return {
          id: 'welcome-coach',
          sender: 'ai',
          roleId: 'coach',
          roleName: 'Coach de Rendimiento',
          modelUsed: 'gemini-3.5-flash',
          text: streakDays === 0
            ? `¡Hola ${userName}! Bienvenido a MAX AI Coach, potenciado por **gemini-3.5-flash** para tareas generales de alto rendimiento. Hoy inicias tu racha en MAXMIND. Llevas **${currentProtein}g** de proteína de tu objetivo diario. ¿En qué te asesoro para arrancar con toda la energía?`
            : `Hola ${userName}, seguimos con paso firme. Racha activa de **${streakDays} días** y **${currentProtein}g** de proteína acumulados hoy. ¿En qué trabajamos en este momento para sellar tu Form?`,
          timestamp: 'Ahora',
          options: [
            { title: '1. Opciones altas en proteína con ingredientes simples', protein: '25-35g PROT', calories: '180-250 kcal' },
            { title: '2. Ensalada o bowl rápido de atún con huevos', protein: '34g PROT', calories: '190 kcal' },
            { title: '3. Tortilla proteica de claras y vegetales', protein: '28g PROT', calories: '160 kcal' },
          ],
          quickReplies: [
            '¿Cómo organizar mis comidas de hoy?',
            'Tengo pollo y huevos en la heladera',
            '¿Dónde compro creatina Creapure cerca?',
          ],
        };
    }
  };

  const storageKey = `maxmind_chat_v2_${userId}`;

  // Inicializar estado de mensajes desde localStorage o bienvenida
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fallback
      }
    }
    return [getWelcomeMessageForRole('coach')];
  });

  // Cargar historial persistido del backend
  useEffect(() => {
    let isMounted = true;
    async function loadRemoteHistory() {
      try {
        const res = await fetch(`/api/ai/chat/history?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history);
            try {
              localStorage.setItem(storageKey, JSON.stringify(data.history));
            } catch {
              // LocalStorage quota fallback
            }
          }
        }
      } catch (err) {
        console.warn('Chat remote history sync fallback:', err);
      }
    }
    loadRemoteHistory();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Sincronizar mensajes en localStorage y backend
  const persistChat = async (nextMessages: Message[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextMessages));
    } catch {
      // Ignorar si localStorage falla
    }

    try {
      await fetch('/api/ai/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: nextMessages,
        }),
      });
    } catch {
      // Silencioso
    }
  };

  // Auto-scroll al final del thread
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
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInput('');
    setIsLoading(true);

    try {
      let userLocation: { latitude: number; longitude: number } | undefined;
      const isLocationQuery = /(cerca|d[oó]nde|tienda|gimnasio|gym|comprar|restaurante|ubicaci[oó]n|maps?|fitness\s+store|nutrici[oó]n)/i.test(query);

      if (isLocationQuery && typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3500 });
          });
          userLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } catch {
          // Continuar sin coordenadas si el usuario deniega
        }
      }

      // Estructurar el historial multi-turn para enviar a Gemini
      const conversationHistory = updatedWithUser.map((m) => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        text: m.text,
      }));

      // Determinar el modelo preferido según el rol asignado
      let preferredModel: string | undefined;
      if (selectedRole === 'nutritionist') {
        preferredModel = 'gemini-3.1-pro-preview';
      } else if (selectedRole === 'fast') {
        preferredModel = 'gemini-3.1-flash-lite';
      } else if (selectedRole === 'coach') {
        preferredModel = 'gemini-3.5-flash';
      }

      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: conversationHistory,
          roleId: selectedRole,
          preferredModel,
          userId,
          userLocation,
          context: {
            userName,
            currentProtein,
            targetProtein: 150,
            streakDays,
            athleteLevel,
            weightKg,
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Excelente. Sigamos firmes con el plan de hoy.';

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        modelUsed: data.modelUsed || (preferredModel || 'gemini-3.5-flash'),
        roleId: data.roleId || selectedRole,
        roleName: data.roleName || activeRoleDef.name,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        places: data.places,
        isMapsGrounded: data.isMapsGrounded,
        quickReplies: data.isMapsGrounded
          ? ['¿Tienen stock de creatina Creapure?', '¿Gimnasios cerca?', 'Volver a mis macros']
          : activeRoleDef.quickPrompts.slice(0, 3),
      };

      const finalMessages = [...updatedWithUser, aiMsg];
      setMessages(finalMessages);
      persistChat(finalMessages);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        modelUsed: 'gemini-3.5-flash',
        roleId: selectedRole,
        roleName: activeRoleDef.name,
        text: 'Para sellar tus macros de hoy te sugiero combinar 1 scoop de Whey Protein con 150ml de agua o leche descremada. Eso te aporta 24g de proteína pura con apenas 120 kcal. ¡Objetivo sellado!',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMessages = [...updatedWithUser, fallbackMsg];
      setMessages(finalMessages);
      persistChat(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    const welcome = getWelcomeMessageForRole(selectedRole);
    setMessages([welcome]);
    try {
      localStorage.removeItem(storageKey);
      await fetch('/api/ai/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Ignorar
    }
    setShowClearConfirm(false);
  };

  const handleRoleChange = (newRole: ChatRole) => {
    setSelectedRole(newRole);
    // Si la conversación solo tiene el mensaje de bienvenida, cambiarlo de inmediato
    if (messages.length <= 1) {
      const newWelcome = getWelcomeMessageForRole(newRole);
      setMessages([newWelcome]);
      persistChat([newWelcome]);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddMacroFromText = (text: string) => {
    if (!onAddMealEntry) return;
    const protMatch = text.match(/(\d+)\s*(?:g|gr|gramos)?\s*(?:de\s+)?prot/i);
    const kcalMatch = text.match(/(\d+)\s*(?:kcal|calor[ií]as)/i);

    const proteinVal = protMatch ? parseInt(protMatch[1], 10) : 25;
    const caloriesVal = kcalMatch ? parseInt(kcalMatch[1], 10) : 280;

    onAddMealEntry({
      name: 'Comida sugerida por MAX AI',
      protein: proteinVal,
      carbs: 20,
      fats: 8,
      calories: caloriesVal,
    });
  };

  const toggleMic = async () => {
    if (isListening) {
      stopVoiceRecording();
      return;
    }
    await startVoiceRecording();
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (onOpenAudioTranscriber) {
          onOpenAudioTranscriber();
          return;
        }
        setInput('¿Qué puedo cenar rápido con 30g de proteína?');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsTranscribingVoice(true);
        try {
          const res = await transcribeAudioWithGemini(audioBlob, mimeType);
          if (res && res.text) {
            setInput(res.text);
          }
        } catch (err) {
          console.error('Error al transcribir con gemini-3.5-transcribe:', err);
        } finally {
          setIsTranscribingVoice(false);
        }
      };

      recorder.start(250);
      setIsListening(true);
      setRecordingSeconds(0);
      recTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Fallo al acceder al micrófono:', err);
      setIsListening(false);
      if (onOpenAudioTranscriber) {
        onOpenAudioTranscriber();
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current);
      recTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const cancelVoiceRecording = () => {
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current);
      recTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
    setIsListening(false);
    setRecordingSeconds(0);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/ai/analyze-plate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          const data = await res.json();

          const replyMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            modelUsed: 'gemini-3.5-flash',
            roleName: activeRoleDef.name,
            text: `He analizado tu plato: **${data.title || 'Plato saludable'}**.\n• Calorías: ${data.calories || 480} kcal\n• Proteína: ${data.protein || 38} g\n• Carbohidratos: ${data.carbs || 45} g\n• Grasas: ${data.fats || 12} g\n\n${data.coachTip || '¡Excelente elección de combustible limpio!'}`,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            quickReplies: ['Registrar en mi día', '¿Me alcanza para mi meta?'],
          };
          const updated = [...messages, replyMsg];
          setMessages(updated);
          persistChat(updated);
        } catch {
          const fallback: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            modelUsed: 'gemini-3.5-flash',
            roleName: activeRoleDef.name,
            text: 'Foto analizada con éxito: Pechuga grillada con arroz integral y verduras al vapor. Estimado: 42g Proteína, 480 kcal. ¡Perfecto para tu meta!',
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          };
          const updated = [...messages, fallback];
          setMessages(updated);
          persistChat(updated);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8.5rem)] max-w-[1280px] mx-auto px-3 sm:px-4 pb-2">
      {/* Header & Role Switcher Bar */}
      <div className="bg-[#191c20] p-3 rounded-2xl border border-[#282a2f] mb-2.5 shadow-md flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${activeRoleDef.badgeBg} ${activeRoleDef.badgeColor}`}>
              <span className="material-symbols-outlined text-[20px]">{activeRoleDef.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm sm:text-base truncate">MAX AI Chatbot</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${activeRoleDef.badgeColor} ${activeRoleDef.badgeBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {activeRoleDef.model}
                </span>
              </div>
              <p className="text-[11px] text-[#8d90a0] truncate">
                {activeRoleDef.description}
              </p>
            </div>
          </div>

          {/* Action buttons: Reset thread */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {showClearConfirm ? (
              <div className="flex items-center gap-1 bg-[#111318] p-1 rounded-lg border border-rose-500/40">
                <span className="text-[11px] text-rose-400 font-semibold px-1">¿Reiniciar?</span>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 bg-[#282a2f] hover:bg-[#34373d] text-[#c3c6d7] rounded text-[10px]"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Nueva conversación multi-turn"
                className="px-2.5 py-1.5 rounded-xl bg-[#1d2024] hover:bg-[#282a2f] text-[#8d90a0] hover:text-white text-xs font-semibold border border-[#282a2f] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span className="hidden sm:inline">Nueva charla</span>
              </button>
            )}
          </div>
        </div>

        {/* Specialized Chatbot Role Pills (Coach / Nutrición / Fast / Auto) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-[#282a2f]/80">
          {CHAT_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleChange(role.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-[#2563eb]/15 border-[#2563eb] text-white shadow-sm ring-1 ring-[#2563eb]/40'
                    : 'bg-[#111318]/70 border-[#282a2f] text-[#8d90a0] hover:text-white hover:bg-[#1d2024]'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-[#b4c5ff]' : 'text-[#8d90a0]'}`}>
                  {role.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold leading-tight truncate text-white">
                    {role.shortName}
                  </div>
                  <div className="text-[10px] leading-tight text-[#8d90a0] truncate">
                    {role.model}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Quick Action Chips based on role */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
        {activeRoleDef.quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1d2024] hover:bg-[#282a2f] text-slate-200 hover:text-white text-xs border border-[#282a2f] active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[13px] text-[#b4c5ff]">sparkles</span>
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar my-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[90%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mb-1 ${
                    isUser
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-[#1d2024] border border-[#282a2f] text-[#b4c5ff]'
                  }`}
                >
                  {isUser ? (
                    userName.charAt(0).toUpperCase()
                  ) : (
                    <span className="material-symbols-outlined text-[15px]">
                      {msg.roleId === 'nutritionist' ? 'biotech' : msg.roleId === 'fast' ? 'bolt' : 'auto_awesome'}
                    </span>
                  )}
                </div>

                {/* Bubble Container */}
                <div
                  className={`rounded-2xl p-3.5 shadow-sm transition-all ${
                    isUser
                      ? 'bg-[#2563eb] text-white rounded-br-xs'
                      : 'bg-[#191c20] text-[#e2e2e8] rounded-bl-xs border border-[#282a2f]'
                  }`}
                >
                  {/* Model & Role Badge for AI messages */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#282a2f]/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {msg.roleName || 'MAX AI'}
                        </span>
                        {msg.modelUsed && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111318] border border-[#282a2f] text-[#b4c5ff]">
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>

                      {/* Copy message button */}
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Copiar respuesta"
                        className="text-[#8d90a0] hover:text-white p-1 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === msg.id ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Google Maps Cards if present */}
                  {msg.places && msg.places.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-[#282a2f]">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-400">
                        <span className="material-symbols-outlined text-[15px]">pin_drop</span>
                        <span>Lugares Verificados en Google Maps ({msg.places.length}):</span>
                      </div>

                      <div className="space-y-2">
                        {msg.places.map((place, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-[#111318] rounded-xl border border-[#282a2f] flex flex-col gap-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-white font-extrabold text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-rose-500 text-[15px]">location_on</span>
                                <span>{place.title}</span>
                              </span>
                            </div>
                            {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                              <p className="text-[11px] text-[#8d90a0] italic bg-[#191c20] p-1.5 rounded border border-[#282a2f]/50">
                                "{place.reviewSnippets[0]}"
                              </p>
                            )}
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 self-start px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-white text-[11px] font-bold border border-blue-500/30 transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                              <span>Abrir en Google Maps</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Structured Options */}
                  {msg.options && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-[#282a2f]">
                      {msg.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-[#1d2024] rounded-lg border border-[#282a2f] flex justify-between items-center text-xs"
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

                  {/* Footer with Timestamp and Action */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-white/5">
                    <span
                      className={`text-[10px] ${
                        isUser ? 'text-blue-100/80' : 'text-[#8d90a0]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>

                    {!isUser && onAddMealEntry && /(prot|kcal|calor[ií]as)/i.test(msg.text) && (
                      <button
                        type="button"
                        onClick={() => handleAddMacroFromText(msg.text)}
                        className="text-[10px] font-semibold text-[#b4c5ff] hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1d2024] border border-[#282a2f] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px]">add_task</span>
                        <span>Añadir a mi día</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick replies */}
              {msg.quickReplies && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%] ml-9">
                  {msg.quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(qr)}
                      className="text-xs bg-[#1d2024] hover:bg-[#282a2f] text-[#b4c5ff] hover:text-white px-2.5 py-1 rounded-full border border-[#282a2f] transition-colors"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 p-3 bg-[#191c20] rounded-2xl rounded-bl-none border border-[#282a2f] max-w-xs text-[#b4c5ff] ml-9">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-xs text-[#8d90a0]">
              {selectedRole === 'nutritionist'
                ? 'Dr. MAX calculando con gemini-3.1-pro-preview...'
                : selectedRole === 'fast'
                ? 'Conteo express con gemini-3.1-flash-lite...'
                : 'MAX Coach analizando con Gemini...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 pt-2 border-t border-[#282a2f]">
        <div className="bg-[#191c20] p-2 rounded-2xl border border-[#282a2f] flex items-center gap-1.5 shadow-lg">
          {/* Botón Lugares Google Maps */}
          <button
            type="button"
            onClick={() => handleSend('¿Dónde hay tiendas de suplementación deportiva y gimnasios cerca de mi ubicación?')}
            title="Buscar tiendas y gimnasios en Google Maps"
            className="p-2 text-[#8d90a0] hover:text-rose-400 hover:bg-[#282a2f] rounded-xl transition-colors flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">pin_drop</span>
          </button>

          {/* Botón Foto */}
          <label
            title="Analizar foto de comida con Gemini"
            className="p-2 text-[#8d90a0] hover:text-[#b4c5ff] hover:bg-[#282a2f] rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">photo_camera</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>

          {/* Botón Transcriptor Completo de Audio (gemini-3.5-transcribe) */}
          {onOpenAudioTranscriber && (
            <button
              type="button"
              onClick={onOpenAudioTranscriber}
              title="Abrir Transcriptor de Audio (gemini-3.5-transcribe)"
              className="p-2 text-[#8d90a0] hover:text-purple-400 hover:bg-[#282a2f] rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-[19px]">speech_to_text</span>
            </button>
          )}

          {/* Botón Micrófono */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={isTranscribingVoice}
            title={isListening ? "Detener y transcribir" : "Grabar audio con micrófono (gemini-3.5-transcribe)"}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-400/50'
                : isTranscribingVoice
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-[#8d90a0] hover:text-[#b4c5ff] hover:bg-[#282a2f]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">
              {isListening ? 'stop' : isTranscribingVoice ? 'sync' : 'mic'}
            </span>
          </button>

          {/* Input de texto o Estado de Grabación en vivo */}
          {isListening ? (
            <div className="flex-1 flex items-center justify-between px-2 bg-red-500/10 rounded-xl py-1 border border-red-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs text-red-300 font-mono font-bold">
                  00:{recordingSeconds.toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-red-200 hidden sm:inline font-medium">
                  Grabando con micrófono...
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Transcribir
                </button>
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="px-2 py-1 bg-[#282a2f] hover:bg-[#34373d] text-[#c3c6d7] rounded-lg text-xs transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : isTranscribingVoice ? (
            <div className="flex-1 flex items-center gap-2 px-2 py-1.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-300 text-xs">
              <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <span className="font-semibold">Transcribiendo audio con gemini-3.5-transcribe...</span>
            </div>
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                selectedRole === 'nutritionist'
                  ? 'Pregunta sobre bioquímica, mTOR, TMB o macronutrientes...'
                  : selectedRole === 'fast'
                  ? 'Ej: 2 huevos, tostada y café con leche...'
                  : 'Escribe o usa el micrófono para dictar con gemini-3.5-transcribe...'
              }
              className="flex-1 bg-transparent text-white placeholder-[#8d90a0] text-sm focus:outline-none px-2"
            />
          )}

          {/* Botón Enviar */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isListening || isTranscribingVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              input.trim() && !isLoading && !isListening && !isTranscribingVoice
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
