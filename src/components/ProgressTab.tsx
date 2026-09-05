import React, { useState } from 'react';

interface ProgressTabProps {
  xp: number;
  formScore: number;
  streakDays: number;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ xp, formScore, streakDays }) => {
  const [period, setPeriod] = useState<'Semana' | 'Mes' | '3 meses' | 'Todo'>('Semana');
  const [todayPhoto, setTodayPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setTodayPhoto(uploadEvent.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 space-y-5 max-w-[1280px] mx-auto pb-24">
      {/* Encabezado de Progreso */}
      <div className="flex flex-col space-y-1 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-[#b4c5ff] uppercase tracking-widest font-bold">
              Telemetría Biomecánica
            </span>
          </div>
          <span className="font-label-caps text-label-caps text-[#8d90a0] bg-[#1d2024] px-2 py-0.5 rounded-full border border-[#282a2f]">
            Sincronizado hoy
          </span>
        </div>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-white tracking-tight font-bold">
          Mi progreso
        </h1>
        <p className="font-body-md text-body-md text-[#8d90a0]">
          Consistencia y métricas biométricas de alto rendimiento
        </p>
      </div>

      {/* Selector de Períodos */}
      <div className="p-1 bg-[#191c20] rounded-xl flex items-center justify-between gap-1 border border-[#282a2f]">
        {(['Semana', 'Mes', '3 meses', 'Todo'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPeriod(item)}
            className={`flex-1 py-2 rounded-lg font-headline-md text-body-sm text-center transition-all ${
              period === item
                ? 'bg-[#2563eb] text-white font-bold shadow-sm'
                : 'text-[#8d90a0] hover:text-white font-medium'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Tarjetas de Métricas Clave (Grid 2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Peso Actual */}
        <div className="bg-[#1d2024] p-4 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden border border-[#282a2f]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">Peso actual</span>
            <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">monitor_weight</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-metric-stat text-metric-stat text-white font-bold">72,4</span>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">kg</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[16px]">trending_down</span>
            <span className="font-body-sm text-body-sm text-[#b4c5ff] font-medium">-0,6 kg vs sem. ant.</span>
          </div>
        </div>

        {/* Form Promedio */}
        <div className="bg-[#1d2024] p-4 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden border border-[#282a2f]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">Form promedio</span>
            <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">bolt</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-metric-stat text-metric-stat text-white font-bold">{formScore}</span>
            <span className="font-body-sm text-body-sm text-[#b4c5ff] font-semibold">%</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[16px]">trending_up</span>
            <span className="font-body-sm text-body-sm text-[#b4c5ff] font-medium">+12% vs sem. ant.</span>
          </div>
        </div>

        {/* Racha Activa */}
        <div className="bg-[#1d2024] p-4 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden border border-[#282a2f]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">Racha activa</span>
            <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">local_fire_department</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-metric-stat text-metric-stat text-white font-bold">{streakDays}</span>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">días</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[#8d90a0] text-[16px]">military_tech</span>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">Récord: 18 días</span>
          </div>
        </div>

        {/* XP Acumulado */}
        <div className="bg-[#1d2024] p-4 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden border border-[#282a2f]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">XP acumulado</span>
            <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">stars</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-metric-stat text-metric-stat text-white font-bold">{xp.toLocaleString('es-ES')}</span>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">XP</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
            <span className="font-body-sm text-body-sm text-[#b4c5ff] truncate font-medium">Nivel 7 Avanzado</span>
          </div>
        </div>
      </div>

      {/* Sección TÚ VS. TÚ */}
      <div className="bg-[#1d2024] p-5 rounded-xl shadow-lg relative overflow-hidden border border-[#282a2f]">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">swap_calls</span>
            <h2 className="font-headline-md text-headline-md text-white font-bold">TÚ VS. TÚ</h2>
          </div>
          <span className="font-label-caps text-label-caps text-[#b4c5ff] px-2 py-0.5 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/30 font-bold">
            Progreso real
          </span>
        </div>
        
        <p className="font-body-sm text-body-sm text-[#8d90a0] mt-1">
          Superando tu propia marca histórica sin comparaciones externas.
        </p>

        <div className="my-4 flex items-center justify-between p-4 bg-[#191c20] rounded-xl border border-[#282a2f]">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">Evolución neta</span>
            <span className="font-display-hero-mobile text-display-hero-mobile text-[#b4c5ff] tracking-tight font-extrabold">+12%</span>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">Mejora de ejecución</span>
          </div>
          
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path 
                className="text-[#333539]" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3.5" 
              />
              <path 
                className="text-[#2563eb]" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeDasharray="84, 100" 
                strokeLinecap="round" 
                strokeWidth="3.5" 
              />
            </svg>
            <span className="absolute font-headline-md text-headline-md text-white font-bold">84%</span>
          </div>
        </div>

        {/* Comparativa de Barras */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between font-body-sm text-body-sm">
              <span className="text-white font-semibold">Esta semana</span>
              <span className="text-[#b4c5ff] font-bold">84% de cumplimiento</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#333539] overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between font-body-sm text-body-sm">
              <span className="text-[#8d90a0]">Semana anterior</span>
              <span className="text-[#8d90a0] font-semibold">72%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#333539] overflow-hidden">
              <div className="h-full bg-[#8d90a0] rounded-full opacity-50" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>

        {/* Mensaje de consistencia */}
        <div className="mt-4 p-3 bg-[#333539]/40 rounded-lg flex items-start gap-2 border border-[#333539]">
          <span className="material-symbols-outlined text-[#b4c5ff] text-[18px] mt-0.5">verified</span>
          <p className="font-body-sm text-body-sm text-[#e2e2e8] leading-snug">
            <strong className="text-[#b4c5ff]">Clave de la semana:</strong> Tu mayor aumento fue en regularidad de hidratación y descanso.
          </p>
        </div>
      </div>

      {/* Gráfico de Consistencia y Form Diaria */}
      <div className="bg-[#1d2024] p-5 rounded-xl shadow-lg space-y-4 border border-[#282a2f]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-[#8d90a0] uppercase font-bold">Ritmo Semanal</span>
            <h2 className="font-headline-md text-headline-md text-white font-bold">Consistencia y Form Diaria</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-[#191c20] px-2.5 py-1 rounded-full border border-[#282a2f]">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
            <span className="font-body-sm text-body-sm text-[#8d90a0]">Semana actual</span>
          </div>
        </div>

        {/* Visualizador de Barras Semanal */}
        <div className="grid grid-cols-7 gap-2 pt-2 items-end h-44">
          {[
            { day: 'Lun', val: 80, isPeak: false },
            { day: 'Mar', val: 100, isPeak: true },
            { day: 'Mié', val: 75, isPeak: false },
            { day: 'Jue', val: 100, isPeak: true },
            { day: 'Vie', val: 85, isPeak: false },
            { day: 'Sáb', val: 90, isPeak: false },
            { day: 'Dom', val: 78, isPeak: false, isToday: true },
          ].map((bar) => (
            <div key={bar.day} className={`flex flex-col items-center gap-1 h-full justify-end ${bar.isToday ? 'relative' : ''}`}>
              <span className={`font-label-caps text-[10px] ${bar.isPeak ? 'text-[#b4c5ff] font-bold' : bar.isToday ? 'text-white font-bold' : 'text-[#8d90a0]'}`}>
                {bar.val}%
              </span>
              <div className={`w-full rounded-md ${bar.isToday ? 'bg-[#191c20] ring-1 ring-[#2563eb]' : 'bg-[#333539]'} h-32 flex flex-col justify-end p-0.5 overflow-hidden`}>
                <div 
                  className={`w-full rounded-sm transition-all duration-700 ${
                    bar.isPeak ? 'bg-[#b4c5ff]' : 'bg-[#2563eb]'
                  }`} 
                  style={{ height: `${bar.val}%` }}
                ></div>
              </div>
              <span className={`font-body-sm text-body-sm ${bar.isToday ? 'text-[#b4c5ff] font-bold' : 'text-[#8d90a0]'}`}>
                {bar.day}
              </span>
            </div>
          ))}
        </div>

        {/* Leyenda de estatus */}
        <div className="flex items-center justify-between pt-1 text-[#8d90a0] font-body-sm text-body-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#b4c5ff]"></span>
            <span>Máximo (100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
            <span>Estándar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#333539]"></span>
            <span>Meta base</span>
          </div>
        </div>
      </div>

      {/* Galería Privada de Evolución Física */}
      <div className="bg-[#1d2024] p-5 rounded-xl shadow-lg space-y-4 border border-[#282a2f]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-white font-bold">Registro visual de progreso</h2>
            <p className="font-body-sm text-body-sm text-[#8d90a0]">Capturas biomecánicas estandarizadas</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#191c20] px-2.5 py-1 rounded-full text-[#8d90a0] border border-[#282a2f]">
            <span className="material-symbols-outlined text-[14px] text-[#b4c5ff]">lock</span>
            <span className="font-label-caps text-label-caps font-bold">Privado por defecto</span>
          </div>
        </div>

        {/* Carrusel de fotos previas + Registro nuevo */}
        <div className="grid grid-cols-2 gap-3">
          {/* Registro anterior */}
          <div className="bg-[#191c20] rounded-xl overflow-hidden flex flex-col relative border border-[#282a2f] group">
            <div className="h-48 w-full relative">
              <img 
                alt="Registro físico anterior" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2HDmwkOxxQD0b6f5jzNrt9ZQeIAOaqY9OGoPwPcek43uThuHmRkl5JKf6LPZQtPkIflMTHibiRmUpynlYzTdek2L4w73fMPDOlkv-0VQPpozyZVHUgy3dWubGruSRiW5x80RTJXxS2Y-dtdSAJkJdrUIpBJ1M8PYG97RF36bXUkdanLdhCiQ1Epcil6ZPzMsZpHOS3eHDMFwwqrkZP99ZVC2RgyLhIq-2eaVyBn7OTHfH2G5DCKBd2w"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent"></div>
              <span className="absolute bottom-2 left-2 font-label-caps text-label-caps bg-[#1d2024]/90 backdrop-blur-md text-white px-2 py-0.5 rounded border border-[#282a2f]">
                Hace 7 días
              </span>
            </div>
            <div className="p-2.5 flex justify-between items-center text-[#8d90a0]">
              <span className="font-body-sm text-white font-bold">73,0 kg</span>
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            </div>
          </div>

          {/* Tarjeta para capturar hoy */}
          <div className="bg-[#191c20] rounded-xl overflow-hidden p-4 flex flex-col items-center justify-center text-center relative border-dashed border-2 border-[#333539] space-y-2">
            {todayPhoto ? (
              <div className="w-full h-full relative rounded-lg overflow-hidden flex flex-col items-center">
                <img src={todayPhoto} alt="Captura hoy" className="w-full h-36 object-cover rounded-lg" />
                <span className="mt-2 text-emerald-400 font-label-caps text-label-caps font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span> Registrado hoy
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#2563eb]/20 flex items-center justify-center text-[#b4c5ff] mb-1">
                  <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                </div>
                <span className="font-headline-md text-body-md text-white font-bold">Captura de hoy</span>
                <span className="font-body-sm text-body-sm text-[#8d90a0]">Alineación con guía de silueta</span>
                
                <label className="w-full mt-1 py-2 bg-[#2563eb] hover:bg-[#3b82f6] text-white rounded-lg font-headline-md text-body-sm flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{isUploading ? 'Procesando...' : 'Registrar'}</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapturePhoto} />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Nota de seguridad criptográfica */}
        <div className="flex items-center gap-2 pt-1 text-[#8d90a0]">
          <span className="material-symbols-outlined text-[#8d90a0] text-[16px]">shield</span>
          <span className="font-body-sm text-body-sm">Cifrado de extremo a extremo en dispositivo local y respaldo seguro.</span>
        </div>
      </div>
    </div>
  );
};
