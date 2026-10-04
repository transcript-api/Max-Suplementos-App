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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

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

        // Auto-transcribir
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
      setErrorMsg(err.message || 'Error transcribiendo el audio. Intentá de nuevo.');
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
        className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffffff]/20 text-slate-700 dark:text-[#d6d6d6] border border-[#ffffff]/30 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[24px]">speech_to_text</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Transcribir Audio
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#898a8c] mt-0.5">
                Habla por tu micrófono y transcribe tu voz con IA de alta precisión
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">error</span>
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-6 px-4 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/10 text-center relative overflow-hidden">
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
                    ? 'bg-red-600 text-slate-900 dark:text-white hover:bg-red-700 ring-4 ring-red-500/40 animate-pulse'
                    : isTranscribing
                    ? 'bg-[#0a0a0a] text-slate-500 dark:text-[#898a8c] cursor-not-allowed'
                    : 'bg-gradient-to-tr from-white dark:from-[#0a0a0a] to-slate-300 dark:to-[#545a5b] text-slate-900 dark:text-white hover:scale-105 shadow-black/30'
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
                  <span className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
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
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white text-xs font-bold transition-all shadow-md"
                  >
                    Detener y Transcribir
                  </button>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-slate-700 dark:text-[#d6d6d6] text-xs font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : isTranscribing ? (
              <div className="space-y-2 py-2">
                <div className="w-8 h-8 mx-auto border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-purple-300">
                  Transcribiendo audio...
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {audioBlob ? 'Audio grabado listo' : 'Toca el micrófono para comenzar'}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#898a8c] max-w-xs mx-auto">
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

          {/* Resultado de la Transcripción */}
          {transcription && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-white dark:from-[#0a0a0a] to-white dark:to-[#0a0a0a] border border-purple-500/30 space-y-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-purple-400">check_circle</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Transcripción completada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-1 rounded-lg text-slate-500 dark:text-[#898a8c] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors"
                    title="Copiar texto"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'done' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Texto transcrito */}
              <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-[#d6d6d6] leading-relaxed select-text font-normal">
                &ldquo;{transcription.text}&rdquo;
              </div>

              {/* Botones de acción con el texto transcrito */}
              <div className="flex flex-wrap gap-2 pt-1">
                {onSendToChat && (
                  <button
                    type="button"
                    onClick={handleSendToCoach}
                    className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-[#545a5b] text-slate-900 dark:text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>Enviar a MAX AI Coach</span>
                  </button>
                )}

                {onLogMeal && (
                  <button
                    type="button"
                    onClick={handleLogTranscribedMeal}
                    className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_task</span>
                    <span>Registrar como Comida</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="py-2 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-[#0a0a0a] text-slate-700 dark:text-[#d6d6d6] text-xs font-semibold transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5"
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
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-between text-xs text-slate-500 dark:text-[#898a8c]">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-purple-400">mic</span>
            <span>Entrada por voz &bull; Transcripción automática con IA</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-white dark:hover:bg-[#0a0a0a] text-slate-700 dark:text-[#d6d6d6] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
