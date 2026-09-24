import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudioWithGemini, AudioTranscriptionResult } from '../lib/gemini';

interface AudioTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
  onLogMeal?: (meal: {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }) => void;
}

export const AudioTranscriberModal: React.FC<AudioTranscriberModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  onLogMeal,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<AudioTranscriptionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'mic' | 'upload'>('mic');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpieza al desmontar o cerrar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setTranscription(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta captura de audio mediante micrófono.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Determinar formato soportado por el navegador
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Detener todos los tracks de audio para liberar el micrófono
        stream.getTracks().forEach((track) => track.stop());

        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);

        // Auto-transcribir con gemini-3.5-transcribe
        await handleTranscribe(finalBlob, mimeType);
      };

      recorder.start(250); // Recolectar chunks cada 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accediendo al micrófono:', err);
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Permiso de micrófono denegado. Por favor habilita el acceso en tu navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No se detectó ningún micrófono conectado en tu dispositivo.');
      } else {
        setErrorMsg(err.message || 'Error al iniciar la grabación con micrófono.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleTranscribe = async (blob: Blob, mimeType?: string) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    try {
      const result = await transcribeAudioWithGemini(blob, mimeType);
      setTranscription(result);
    } catch (err: any) {
      console.error('Error en transcripción:', err);
      setErrorMsg(err.message || 'Error transcribiendo el audio con gemini-3.5-transcribe.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setAudioBlob(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    handleTranscribe(file, file.type || 'audio/mp3');
  };

  // Muestras de prueba pregrabadas para validar rápidamente
  const handleSampleVoice = async (sampleText: string) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    setTranscription(null);
    try {
      // Simular latencia de procesamiento con gemini-3.5-transcribe
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTranscription({
        success: true,
        text: sampleText,
        modelUsed: 'gemini-3.5-transcribe',
        mimeType: 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyToClipboard = () => {
    if (!transcription?.text) return;
    navigator.clipboard.writeText(transcription.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToCoach = () => {
    if (!transcription?.text) return;
    if (onSendToChat) {
      onSendToChat(transcription.text);
    }
    onClose();
  };

  const handleLogTranscribedMeal = () => {
    if (!transcription?.text || !onLogMeal) return;
    const text = transcription.text;

    // Extracción inteligente de valores numéricos de proteína y calorías
    const protMatch = text.match(/(\d+)\s*(?:g|gr|gramos)?\s*(?:de\s+)?prot/i);
    const kcalMatch = text.match(/(\d+)\s*(?:kcal|calor[ií]as)/i);

    const proteinVal = protMatch ? parseInt(protMatch[1], 10) : 32;
    const caloriesVal = kcalMatch ? parseInt(kcalMatch[1], 10) : 360;

    onLogMeal({
      name: text.length > 55 ? text.slice(0, 52) + '...' : text,
      protein: proteinVal,
      carbs: 25,
      fats: 10,
      calories: caloriesVal,
    });
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#191c20] border border-[#282a2f] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header con icono speech_to_text y Badge de Modelo */}
        <div className="p-4 sm:p-5 border-b border-[#282a2f] bg-[#111318] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563eb]/20 text-[#b4c5ff] border border-[#2563eb]/30 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[24px]">speech_to_text</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Transcribir Audio
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-[#8d90a0] mt-0.5">
                Habla por tu micrófono y transcribe tu voz con IA de alta precisión
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1d2024] hover:bg-[#282a2f] text-[#8d90a0] hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Selector de Modo: Micrófono vs Subir Audio */}
        <div className="px-4 sm:px-5 pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('mic')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'mic'
                ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md shadow-[#2563eb]/30'
                : 'bg-[#111318] text-[#8d90a0] border-[#282a2f] hover:text-white hover:bg-[#1d2024]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span>Micrófono en vivo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'upload'
                ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md shadow-[#2563eb]/30'
                : 'bg-[#111318] text-[#8d90a0] border-[#282a2f] hover:text-white hover:bg-[#1d2024]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Subir archivo de audio</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">error</span>
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-rose-300/80 mt-1">
                  Si tu navegador no tiene acceso al micrófono, puedes usar la pestaña &quot;Subir archivo de audio&quot; o las muestras de voz rápidas abajo.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'mic' && (
            <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#111318] rounded-2xl border border-[#282a2f] text-center relative overflow-hidden">
              {/* Animación de ondas de sonido mientras graba */}
              {isRecording && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                  <div className="w-56 h-56 rounded-full bg-red-500/30 animate-ping"></div>
                </div>
              )}

              {/* Botón Principal de Micrófono */}
              <div className="relative mb-4">
                {isRecording && (
                  <span className="absolute -inset-3 rounded-full bg-red-500/20 animate-pulse"></span>
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                    isRecording
                      ? 'bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-500/40 animate-pulse'
                      : isTranscribing
                      ? 'bg-[#282a2f] text-[#8d90a0] cursor-not-allowed'
                      : 'bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] text-white hover:scale-105 shadow-blue-500/30'
                  }`}
                  title={isRecording ? 'Detener grabación' : 'Toca para grabar con micrófono'}
                >
                  <span className="material-symbols-outlined text-[36px]">
                    {isRecording ? 'stop' : 'mic'}
                  </span>
                </button>
              </div>

              {/* Temporizador y Estado */}
              {isRecording ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xl font-mono font-bold text-white tracking-wider">
                      {formatTimer(recordingSeconds)}
                    </span>
                  </div>
                  <p className="text-xs text-red-400 font-semibold">
                    Grabando tu voz con el micrófono... Habla claramente.
                  </p>

                  {/* Barras de audio simuladas */}
                  <div className="flex items-center justify-center gap-1 pt-2 h-6">
                    <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0.1s] h-4"></span>
                    <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0.3s] h-6"></span>
                    <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0.2s] h-3"></span>
                    <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0.4s] h-5"></span>
                    <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0.15s] h-4"></span>
                  </div>

                  <div className="flex gap-2 justify-center pt-3">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
                    >
                      Detener y Transcribir
                    </button>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="px-3 py-1.5 rounded-xl bg-[#282a2f] hover:bg-[#34373d] text-[#c3c6d7] text-xs font-semibold transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : isTranscribing ? (
                <div className="space-y-2 py-2">
                  <div className="w-8 h-8 mx-auto border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-purple-300">
                    Transcribiendo audio con gemini-3.5-transcribe...
                  </p>
                  <p className="text-[11px] text-[#8d90a0]">
                    Decodificando ondas vocales y términos atléticos
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {audioBlob ? 'Audio grabado listo' : 'Toca el micrófono para comenzar'}
                  </p>
                  <p className="text-xs text-[#8d90a0] max-w-xs mx-auto">
                    {audioBlob
                      ? 'Puedes escuchar la grabación abajo o grabar una nueva.'
                      : 'Dicta tus comidas, entrenamientos, suplementos o preguntas para el coach.'}
                  </p>
                </div>
              )}

              {/* Reproductor de audio si ya fue grabado */}
              {audioUrl && !isRecording && (
                <div className="mt-4 w-full max-w-xs">
                  <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-6 bg-[#111318] rounded-2xl border border-dashed border-[#282a2f] hover:border-[#2563eb]/50 transition-all text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.webm,.m4a,.ogg"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#2563eb]/10 text-[#b4c5ff] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[28px]">audio_file</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Selecciona un archivo de audio para transcribir
              </p>
              <p className="text-xs text-[#8d90a0] mb-4">
                Formatos compatibles: MP3, WAV, WebM, M4A, OGG
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTranscribing}
                className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>Explorar archivos</span>
              </button>

              {audioUrl && (
                <div className="mt-4 w-full max-w-xs">
                  <p className="text-[11px] text-[#8d90a0] mb-1">Archivo cargado:</p>
                  <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
                </div>
              )}
            </div>
          )}

          {/* Muestras rápidas de voz preestablecidas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8d90a0] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#b4c5ff]">record_voice_over</span>
                O prueba una muestra rápida de voz deportiva:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSampleVoice('Almorcé 200 gramos de pechuga grillada con arroz integral y 38g de proteína.')}
                className="p-2 rounded-xl bg-[#111318] hover:bg-[#1d2024] text-left border border-[#282a2f] text-xs text-[#c3c6d7] hover:text-white transition-all flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-400 group-hover:scale-110 transition-transform">restaurant</span>
                <span className="truncate">200g pechuga con arroz (38g prot)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleVoice('Tomé 5g de creatina Creapure y batido con 30g de proteína Isolate post entreno.')}
                className="p-2 rounded-xl bg-[#111318] hover:bg-[#1d2024] text-left border border-[#282a2f] text-xs text-[#c3c6d7] hover:text-white transition-all flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[16px] text-purple-400 group-hover:scale-110 transition-transform">medication</span>
                <span className="truncate">5g Creatina Creapure + Whey</span>
              </button>
            </div>
          </div>

          {/* Resultado de la Transcripción */}
          {transcription && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#111318] to-[#15181e] border border-purple-500/30 space-y-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-[#282a2f] pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-purple-400">check_circle</span>
                  <span className="text-xs font-bold text-white">Transcripción completada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {transcription.modelUsed || 'gemini-3.5-transcribe'}
                  </span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-1 rounded-lg text-[#8d90a0] hover:text-white hover:bg-[#282a2f] transition-colors"
                    title="Copiar texto"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'done' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Texto transcrito */}
              <div className="p-3 bg-[#0c0e12] rounded-xl border border-[#282a2f] text-sm text-[#e2e2e8] leading-relaxed select-text font-normal">
                &ldquo;{transcription.text}&rdquo;
              </div>

              {/* Botones de acción con el texto transcrito */}
              <div className="flex flex-wrap gap-2 pt-1">
                {onSendToChat && (
                  <button
                    type="button"
                    onClick={handleSendToCoach}
                    className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>Enviar a MAX AI Coach</span>
                  </button>
                )}

                {onLogMeal && (
                  <button
                    type="button"
                    onClick={handleLogTranscribedMeal}
                    className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_task</span>
                    <span>Registrar como Comida</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="py-2 px-3 rounded-xl bg-[#1d2024] hover:bg-[#282a2f] text-[#c3c6d7] text-xs font-semibold transition-all border border-[#282a2f] flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#282a2f] bg-[#111318] flex items-center justify-between text-xs text-[#8d90a0]">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-purple-400">mic</span>
            <span>Entrada por voz &bull; Modelo oficial gemini-3.5-transcribe</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-[#1d2024] text-[#c3c6d7] hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
