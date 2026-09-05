import React, { useState } from 'react';

interface ChallengesTabProps {
  xp: number;
  streakDays: number;
  userName?: string;
  isDemoMode?: boolean;
}

export const ChallengesTab: React.FC<ChallengesTabProps> = ({
  xp,
  streakDays,
  userName = 'Santiago',
  isDemoMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'retos' | 'ranking' | 'recompensas' | 'suplementos'>('retos');
  const [rankingPeriod, setRankingPeriod] = useState<'semanal' | 'mensual' | 'global'>('semanal');
  const [reordered, setReordered] = useState<string | null>(null);
  const [claimedReward, setClaimedReward] = useState<string | null>(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Mateo R.',
      badge: 'Nivel 8',
      text: 'Completé la sesión de empuje pesado + 3L de agua hoy. ¡La racha no se corta!',
      time: 'Hace 25 min',
      likes: 14,
      liked: false
    },
    {
      id: 2,
      user: 'Camila V.',
      badge: 'Nivel 6',
      text: 'Preparé el bowl de pollo con arroz de la recomendación de MAX AI. Delicioso y 42g de proteína clavados.',
      time: 'Hace 1 hora',
      likes: 22,
      liked: true
    }
  ]);

  const [newPostText, setNewPostText] = useState('');

  const toggleLike = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost = {
      id: Date.now(),
      user: `${userName} (Tú)`,
      badge: isDemoMode ? 'Nivel 7' : 'Nivel 1',
      text: newPostText,
      time: 'Ahora mismo',
      likes: 1,
      liked: true
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const rewardsList = [
    {
      id: 'cup-10',
      title: '10% de descuento en MAX Suplementos',
      costXp: 1500,
      code: 'MAX-ATLETA-10',
      desc: 'Válido para cualquier compra en tienda física, online o por WhatsApp.',
      badge: 'Más popular',
      icon: 'percent'
    },
    {
      id: 'envio-free',
      title: 'Envío Gratis en tu próximo pedido',
      costXp: 3000,
      code: 'MAX-ENVIOGRATIS',
      desc: 'Sin mínimo de compra en todo el país.',
      badge: 'Ahorro directo',
      icon: 'local_shipping'
    },
    {
      id: 'shaker-pro',
      title: 'Shaker Pro MAX Edición Atleta + Muestra Creapure',
      costXp: 5000,
      code: 'MAX-SHAKER-VIP',
      desc: 'Botella mezcladora premium antiderrame con compartimento de polvo.',
      badge: 'Exclusivo VIP',
      icon: 'card_giftcard'
    }
  ];

  return (
    <div className="flex flex-col w-full px-4 space-y-4 max-w-[1280px] mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="font-label-caps text-label-caps text-[#3B82F6] uppercase tracking-wider block font-bold">
            Comunidad y Gamificación
          </span>
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-white font-bold">
            Retos, Liga & Recompensas
          </h1>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="p-1 bg-[#0B1220] rounded-xl flex items-center justify-between gap-1 border border-[#1E293B]">
        {(['retos', 'ranking', 'recompensas', 'suplementos'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg font-headline-md text-xs sm:text-sm text-center capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                : 'text-[#64748B] hover:text-white font-medium'
            }`}
          >
            {tab === 'retos'
              ? 'Desafíos'
              : tab === 'ranking'
              ? 'Ranking'
              : tab === 'recompensas'
              ? 'Recompensas'
              : 'Suplementos'}
          </button>
        ))}
      </div>

      {/* VISTA: RETOS */}
      {activeTab === 'retos' && (
        <div className="space-y-4">
          {/* Reto Principal: 30 Días Sin Romper Racha */}
          <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="bg-[#2563eb]/20 text-[#b4c5ff] font-label-caps text-label-caps px-2.5 py-0.5 rounded-full border border-[#2563eb]/30 font-bold uppercase">
                  Desafío Mensual
                </span>
                <h3 className="font-headline-md text-white font-bold mt-1">30 días de consistencia sin romper racha</h3>
              </div>
              <span className="text-2xl">🏆</span>
            </div>

            <p className="font-body-sm text-[#8d90a0] mb-3">
              Completa al menos el 80% de tu Form Diaria durante 30 días seguidos para desbloquear la insignia Titán y un 25% de descuento en Max Nutrition.
            </p>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">Día {streakDays} de 30</span>
                <span className="text-[#b4c5ff] font-bold">{Math.round((streakDays / 30) * 100)}%</span>
              </div>
              <div className="w-full bg-[#0c0e12] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2563eb] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(streakDays / 30) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#282a2f] flex justify-between items-center text-xs text-[#8d90a0]">
              <span>Recompensa: +500 XP · Cupón VIP</span>
              <span className="text-emerald-400 font-bold">En curso activo</span>
            </div>
          </div>

          {/* Otros retos secundarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#191c20] p-4 rounded-xl border border-[#282a2f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0566d9]/20 text-[#adc6ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">water_drop</span>
                </div>
                <div>
                  <h4 className="font-body-md text-white font-bold">Hidratación Maestra</h4>
                  <p className="text-xs text-[#8d90a0]">3L de agua 7 días continuos</p>
                  <span className="text-[11px] text-[#b4c5ff] font-semibold">5 / 7 días logrados</span>
                </div>
              </div>
              <span className="text-xs bg-[#1d2024] text-white px-2 py-1 rounded font-bold border border-[#282a2f]">
                +150 XP
              </span>
            </div>

            <div className="bg-[#191c20] p-4 rounded-xl border border-[#282a2f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2563eb]/20 text-[#b4c5ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">fitness_center</span>
                </div>
                <div>
                  <h4 className="font-body-md text-white font-bold">Sobrecarga Progresiva</h4>
                  <p className="text-xs text-[#8d90a0]">Registrar 4 sesiones con RPE 8+</p>
                  <span className="text-[11px] text-[#b4c5ff] font-semibold">3 / 4 sesiones</span>
                </div>
              </div>
              <span className="text-xs bg-[#1d2024] text-white px-2 py-1 rounded font-bold border border-[#282a2f]">
                +200 XP
              </span>
            </div>
          </div>

          {/* Muro Comunitario */}
          <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-3">
            <h3 className="font-headline-md text-white font-bold">Muro de Atletas</h3>

            {/* Crear post rápido */}
            <form onSubmit={handleCreatePost} className="flex gap-2">
              <input
                type="text"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Comparte una victoria o tu marca de hoy..."
                className="flex-1 bg-[#191c20] rounded-lg px-3 py-2 text-sm text-white border border-[#282a2f] focus:outline-none focus:border-[#2563eb]"
              />
              <button
                type="submit"
                className="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-all"
              >
                Publicar
              </button>
            </form>

            {/* Lista de posts */}
            <div className="space-y-2.5 pt-1">
              {posts.map((p) => (
                <div key={p.id} className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.user}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#282a2f] text-[#b4c5ff] text-[10px]">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[#8d90a0]">{p.time}</span>
                  </div>
                  <p className="text-sm text-[#c3c6d7]">{p.text}</p>
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleLike(p.id)}
                      className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full border transition-colors ${
                        p.liked 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                          : 'bg-[#1d2024] text-[#8d90a0] border-[#282a2f] hover:text-white'
                      }`}
                    >
                      <span>🔥</span>
                      <span>{p.likes} Kudos</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA: RANKING COMPLETO */}
      {activeTab === 'ranking' && (
        <div className="bg-[#101A2B] rounded-2xl p-5 border border-[#1E293B] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="font-label-caps text-[#64748B] uppercase block text-[11px] font-bold">Clasificación de Liga</span>
              <h3 className="font-headline-md text-white font-bold text-lg">Liga Diamante · Top Atletas</h3>
            </div>
            {/* Filtros Semanal / Mensual / Global */}
            <div className="flex items-center bg-[#0B1220] p-1 rounded-xl border border-[#1E293B]">
              {(['semanal', 'mensual', 'global'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRankingPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    rankingPeriod === p
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#64748B] hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta de Proximidad Psicológica (Sección 25 del Master Prompt) */}
          <div className="p-3.5 bg-[#102A56]/60 border border-[#2563EB]/50 rounded-xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold flex-shrink-0">
                #127
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isDemoMode ? '¡A solo 12 XP de superar el puesto #126!' : 'Comenzando tu ascenso en la liga'}
                </span>
                <span className="text-[11px] text-[#CBD5E1]">
                  {isDemoMode
                    ? 'Cumple una tarea diaria más hoy para adelantar a Mateo R. (4.872 XP).'
                    : 'Registra tus tareas diarias de hoy para escalar en la tabla global.'}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#2563EB]/20 text-[#3B82F6] text-xs font-black border border-[#2563EB]/40 whitespace-nowrap">
              {isDemoMode ? '+12 XP' : '¡Subí ya!'}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { rank: 1, name: 'Lucas F.', xp: 5120, badge: '🥇', level: 'Nivel 8', delta: '+150' },
              { rank: 2, name: 'Camila V.', xp: 5040, badge: '🥈', level: 'Nivel 8', delta: '+120' },
              { rank: 3, name: 'Martín G.', xp: 4980, badge: '🥉', level: 'Nivel 7', delta: '+95' },
              { rank: 125, name: 'Ignacio M.', xp: 4890, badge: '', level: 'Nivel 7', delta: '+30' },
              { rank: 126, name: 'Mateo R.', xp: 4872, badge: '', level: 'Nivel 7', delta: '+15' },
              { rank: 127, name: `${userName} (Tú)`, xp: xp, badge: '⭐', level: isDemoMode ? 'Nivel 7' : 'Nivel 1', isYou: true, delta: '+45' },
              { rank: 128, name: 'Valentin D.', xp: 4840, badge: '', level: 'Nivel 7', delta: '+20' },
              { rank: 129, name: 'Agustín P.', xp: 4815, badge: '', level: 'Nivel 6', delta: '+10' },
            ].map((atleta) => (
              <div
                key={atleta.rank}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  atleta.isYou
                    ? 'bg-[#102A56]/80 border-[#2563EB] text-white font-bold shadow-md ring-1 ring-[#2563EB]/50'
                    : 'bg-[#0B1220] border-[#1E293B] text-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 text-xs font-bold text-center ${atleta.isYou ? 'text-[#3B82F6]' : 'text-[#64748B]'}`}>
                    {atleta.badge || `#${atleta.rank}`}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-white block">{atleta.name}</span>
                    <span className="text-xs text-[#64748B]">{atleta.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#3B82F6]">{atleta.xp.toLocaleString('es-ES')} XP</span>
                  {atleta.isYou ? (
                    <span className="block text-[10px] text-emerald-400 font-bold">Tu posición actual</span>
                  ) : (
                    <span className="block text-[10px] text-[#64748B]">{atleta.delta} hoy</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA: RECOMPENSAS Y CUPONES MAX SUPLEMENTOS */}
      {activeTab === 'recompensas' && (
        <div className="space-y-4">
          <div className="bg-[#101A2B] rounded-2xl p-5 border border-[#1E293B] space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-caps text-[#64748B] uppercase block text-[11px] font-bold">Club Atleta MAX</span>
                <h3 className="font-headline-md text-white font-bold text-lg">Canje de Experiencia (XP)</h3>
              </div>
              <div className="px-3 py-1 bg-[#2563EB]/20 border border-[#2563EB]/40 rounded-xl text-right">
                <span className="text-[10px] text-[#64748B] block">Tu balance</span>
                <span className="text-sm font-black text-[#3B82F6]">{xp.toLocaleString('es-ES')} XP</span>
              </div>
            </div>
            <p className="text-xs text-[#CBD5E1]">
              Tu constancia tiene recompensa real. Canjeá tus puntos acumulados por descuentos y productos en MAX Suplementos.
            </p>

            {claimedReward && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Cupón desbloqueado: <strong>{claimedReward}</strong>. ¡Copiado al portapapeles!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setClaimedReward(null)}
                  className="text-xs text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {rewardsList.map((reward) => {
                const canAfford = xp >= reward.costXp;
                return (
                  <div
                    key={reward.id}
                    className="p-4 bg-[#0B1220] border border-[#1E293B] rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[#3B82F6] bg-[#2563EB]/20 border border-[#2563EB]/30 px-2 py-0.5 rounded-full">
                          {reward.badge}
                        </span>
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">stars</span>
                          {reward.costXp} XP
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{reward.title}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">{reward.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-[#1E293B]">
                      <button
                        type="button"
                        onClick={() => {
                          if (canAfford) {
                            navigator.clipboard?.writeText(reward.code);
                            setClaimedReward(reward.code);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-[#2563EB] hover:bg-[#3B82F6] text-white active:scale-95 shadow-md shadow-[#2563EB]/20'
                            : 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {canAfford ? 'redeem' : 'lock'}
                        </span>
                        <span>{canAfford ? `Canjear Cupón (${reward.code})` : `Faltan ${reward.costXp - xp} XP`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISTA: SUPLEMENTOS & RECOMPRA INTELIGENTE */}
      {activeTab === 'suplementos' && (
        <div className="space-y-4">
          <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">notifications_active</span>
              <h3 className="font-headline-md text-white font-bold">Alerta de Reposición Inteligente</h3>
            </div>
            <p className="text-sm text-[#8d90a0]">
              Basado en tus registros de consumo diario, te quedan aproximadamente <strong>5 días de Creatina Creapure</strong> y <strong>6 días de Whey Isolada</strong>.
            </p>

            {reordered && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{reordered}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#191c20] p-4 rounded-xl border border-[#282a2f] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#b4c5ff] bg-[#2563eb]/20 px-2 py-0.5 rounded">
                      Consumo habitual
                    </span>
                    <span className="text-xs text-[#8d90a0]">5g diarios</span>
                  </div>
                  <h4 className="text-white font-bold text-base mt-2">Creatina Creapure 300g</h4>
                  <p className="text-xs text-[#8d90a0]">Máxima pureza micronizada para fuerza y ATP celular.</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#282a2f]">
                  <div>
                    <span className="text-white font-bold text-sm">$28.90</span>
                    <span className="text-xs text-emerald-400 block">-20% Club Atleta</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReordered('¡Orden de Creatina enviada con 1-Click! Llegará en 48hs.')}
                    className="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-sm"
                  >
                    Reponer 1-Click
                  </button>
                </div>
              </div>

              <div className="bg-[#191c20] p-4 rounded-xl border border-[#282a2f] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#adc6ff] bg-[#0566d9]/20 px-2 py-0.5 rounded">
                      Consumo habitual
                    </span>
                    <span className="text-xs text-[#8d90a0]">30g diarios</span>
                  </div>
                  <h4 className="text-white font-bold text-base mt-2">100% Whey Isolate 1kg</h4>
                  <p className="text-xs text-[#8d90a0]">Sabor Chocolate Belga · 27g de proteína pura por scoop.</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#282a2f]">
                  <div>
                    <span className="text-white font-bold text-sm">$45.50</span>
                    <span className="text-xs text-emerald-400 block">-20% Club Atleta</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReordered('¡Orden de Whey Isolada procesada! Llegará en 48hs.')}
                    className="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-sm"
                  >
                    Reponer 1-Click
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
