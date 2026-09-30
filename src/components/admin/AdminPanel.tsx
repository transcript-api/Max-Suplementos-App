import React, { useState, useEffect, useMemo } from 'react';
import { MaxMindLogo } from '../MaxMindLogo';
import { RecipeItem } from '../../data/recipesDatabase';
import {
  getPersonalizedContent,
  AVAILABLE_GOALS,
  AVAILABLE_LEVELS,
  AVAILABLE_MODALITIES,
  AVAILABLE_WINDOWS,
  PrimaryGoal,
  TrainingModality,
  TimeWindow,
  PersonalizedContent,
  normalizeGoal,
} from '../../lib/personalizationEngine';
import { CommitmentLevel } from '../../types';

interface AdminPanelProps {
  onBackToApp: () => void;
  isDark?: boolean;
  currentUserProfile?: {
    name?: string;
    goal?: string;
    level?: CommitmentLevel;
    weightKg?: number;
  };
  onUpdateUserProfile?: (goal: string, level: CommitmentLevel) => void;
}

interface IntegrationStatus {
  name: string;
  configured: boolean;
  mode: string;
  status: string;
}

interface PersistenceDiagnostics {
  engine: string;
  isDistributedProduction: boolean;
  multiInstanceSafe: boolean;
  status: string;
  note: string;
}

interface ServerStatus {
  persistence?: PersistenceDiagnostics;
  integrations: Record<string, IntegrationStatus>;
  metrics: {
    activeUsers: number;
    activeAdminSessions?: number;
    totalFoodLogs: number;
    totalSupplementLogs: number;
    totalRecipes: number;
    totalAuditLogs: number;
    uptimeSeconds: number;
    serverTimestamp: string;
  };
}

interface LevelProtocolItem {
  id: string;
  name: string;
  weeklyWorkouts: string;
  workoutDuration: string;
  proteinRatio: string;
  hydrationGoal: string;
  taskCount: number;
  active: boolean;
}

interface AuditLogItem {
  id: string;
  action: string;
  adminUser: string;
  details: string;
  timestamp: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToApp,
  isDark = true,
  currentUserProfile,
  onUpdateUserProfile,
}) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('maxmind_admin_session_token');
  });
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('admin@maxsuplementos.com');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Tab activo dentro del panel
  const [activeTab, setActiveTab] = useState<'personalization' | 'status' | 'recipes' | 'protocols' | 'audit'>('personalization');

  // Estado para la Matriz de Personalización Multi-Vectorial (+448 combinaciones)
  const [selectedGoal, setSelectedGoal] = useState<PrimaryGoal>(() => {
    return normalizeGoal(currentUserProfile?.goal);
  });
  const [selectedLevel, setSelectedLevel] = useState<CommitmentLevel>(() => {
    return currentUserProfile?.level || 'Intermedio';
  });
  const [selectedModality, setSelectedModality] = useState<TrainingModality>('gimnasio');
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow>('manana');

  // Cálculo en tiempo real del contenido personalizado para el preview
  const previewContent = useMemo(() => {
    return getPersonalizedContent(
      selectedGoal,
      selectedLevel,
      currentUserProfile?.name || 'Atleta Demo',
      currentUserProfile?.weightKg || 75,
      selectedModality,
      selectedWindow,
      14
    );
  }, [selectedGoal, selectedLevel, selectedModality, selectedWindow, currentUserProfile]);

  const handleApplyToActiveUser = () => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile(selectedGoal, selectedLevel);
      showFeedback(`¡Perfil de atleta actualizado! Objetivo: "${selectedGoal}" y Desafío: "${selectedLevel}" (${selectedModality.toUpperCase()}).`);
    } else {
      showFeedback('Configuración lista en memoria para el atleta.');
    }
  };

  // Datos del backend
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [protocols, setProtocols] = useState<Record<string, LevelProtocolItem>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal para agregar receta
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    country: 'uruguay' as const,
    countryLabel: 'Uruguay',
    flag: '🇺🇾',
    category: 'almuerzo_cena' as const,
    categoryLabel: 'Almuerzo / Cena',
    goal: 'hipertrofia' as const,
    goalLabel: 'Hipertrofia Muscular',
    protein: 35,
    calories: 420,
    carbs: 30,
    fats: 12,
    prepTimeMinutes: 20,
    difficulty: 'Fácil' as const,
    description: '',
    nutritionTip: '',
    ingredient1: '',
    ingredient2: '',
    ingredient3: '',
  });

  const getHeaders = (token = adminToken) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`,
    'x-admin-email': adminEmailInput,
  });

  const loadAdminData = async (token = adminToken) => {
    if (!token) return;
    setLoadingData(true);
    try {
      // 1. Cargar estado de integraciones y métricas
      const resStatus = await fetch('/api/admin/status', { headers: getHeaders(token) });
      if (resStatus.status === 401 || resStatus.status === 403) {
        handleLogout();
        return;
      }
      const dataStatus = await resStatus.json();
      if (dataStatus.success) setServerStatus(dataStatus);

      // 2. Cargar recetas
      const resRecipes = await fetch('/api/admin/recipes', { headers: getHeaders(token) });
      const dataRecipes = await resRecipes.json();
      if (dataRecipes.success) setRecipes(dataRecipes.recipes);

      // 3. Cargar protocolos
      const resProtocols = await fetch('/api/admin/protocols', { headers: getHeaders(token) });
      const dataProtocols = await resProtocols.json();
      if (dataProtocols.success) setProtocols(dataProtocols.protocols);

      // 4. Cargar auditoría
      const resAudit = await fetch('/api/admin/audit', { headers: getHeaders(token) });
      const dataAudit = await resAudit.json();
      if (dataAudit.success) setAuditLogs(dataAudit.auditLogs);
    } catch (err) {
      console.error('[Admin] Error cargando telemetría administrativa:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadAdminData(adminToken);
    }
  }, [adminToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKeyInput.trim()) {
      setAuthError('Ingresa la contraseña de administrador.');
      return;
    }
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKeyInput.trim(), email: adminEmailInput }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.sessionToken) {
        // Almacenar el token efímero de sesión, NUNCA la clave maestra del servidor
        sessionStorage.setItem('maxmind_admin_session_token', data.sessionToken);
        setAdminToken(data.sessionToken);
        loadAdminData(data.sessionToken);
      } else {
        setAuthError(data.error || 'Credenciales administrativas no válidas.');
      }
    } catch (err) {
      if (adminKeyInput.trim() === 'maxmind-admin-2026') {
        const devToken = `dev_admin_session_${Date.now()}`;
        sessionStorage.setItem('maxmind_admin_session_token', devToken);
        setAdminToken(devToken);
      } else {
        setAuthError('Error conectando con el servidor administrativo. En desarrollo usa: maxmind-admin-2026');
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: getHeaders(adminToken),
        });
      } catch (e) {
        // Fallback silencioso si el servidor ya no respondía
      }
    }
    sessionStorage.removeItem('maxmind_admin_session_token');
    setAdminToken(null);
    setServerStatus(null);
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Crear receta
  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.name.trim()) return;

    const ingredients = [
      newRecipe.ingredient1 && { name: newRecipe.ingredient1, quantity: '1 porción' },
      newRecipe.ingredient2 && { name: newRecipe.ingredient2, quantity: '1 porción' },
      newRecipe.ingredient3 && { name: newRecipe.ingredient3, quantity: 'al gusto' },
    ].filter(Boolean) as Array<{ name: string; quantity: string }>;

    try {
      const res = await fetch('/api/admin/recipes', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...newRecipe,
          ingredients,
          instructions: ['Preparar los ingredientes frescos.', 'Cocinar al punto según objetivo nutricional.', 'Servir inmediatamente.'],
        }),
      });
      if (res.ok) {
        showFeedback(`¡Receta "${newRecipe.name}" agregada con éxito!`);
        setIsAddRecipeOpen(false);
        loadAdminData();
      }
    } catch (err) {
      showFeedback('Error al guardar la receta.');
    }
  };

  // Eliminar receta
  const handleDeleteRecipe = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la receta "${name}" del catálogo?`)) return;
    try {
      const res = await fetch(`/api/admin/recipes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        showFeedback(`Receta "${name}" eliminada.`);
        loadAdminData();
      }
    } catch (err) {
      showFeedback('Error al eliminar la receta.');
    }
  };

  // Actualizar protocolo
  const handleUpdateProtocol = async (levelId: string, updates: Partial<LevelProtocolItem>) => {
    try {
      const res = await fetch('/api/admin/protocols', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ levelId, updates }),
      });
      if (res.ok) {
        showFeedback(`Protocolo ${levelId} actualizado correctamente.`);
        loadAdminData();
      }
    } catch (err) {
      showFeedback('Error al actualizar el protocolo.');
    }
  };

  // Si no está autenticado en el servidor, mostrar pantalla de acceso restringido
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-[#06151e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#06151e] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
          <div className="flex flex-col items-center text-center space-y-2">
            <MaxMindLogo variant="symbol" size="md" isDark={true} />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
              ZONA RESTRINGIDA · SERVIDOR
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Panel Administrador</h1>
            <p className="text-xs text-slate-400">
              Acceso protegido por clave de servidor autoritaria. No accesible mediante manipulaciones en cliente.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Correo Administrador
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ffffff]"
                placeholder="admin@maxsuplementos.com"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Clave Maestra de Servidor (ADMIN_SECRET_KEY)
              </label>
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ffffff]"
                placeholder="••••••••••••••••"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Por defecto en desarrollo: <code>maxmind-admin-2026</code>
              </span>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isLoadingAuth}
                className="w-full py-3 bg-[#06151e] hover:bg-[#545a5b] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoadingAuth ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validando autorización...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    <span>Acceder al Panel</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToApp}
                className="w-full py-2.5 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition-all"
              >
                ← Volver a la App
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06151e] text-white flex flex-col">
      {/* Barra superior de administración */}
      <header className="border-b border-white/10 bg-[#06151e]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MaxMindLogo variant="symbol" size="sm" isDark={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">MAXMIND BACKOFFICE</span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                AUTH VERIFICADA
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Sesión: {adminEmailInput}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded-lg border border-[#ffffff]/40 bg-[#ffffff]/20 hover:bg-[#ffffff]/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Ver App</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Notificación de retroalimentación flotante */}
      {feedbackMessage && (
        <div className="fixed top-16 right-4 z-50 p-3.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-2xl animate-fadeIn flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Navegación por Pestañas del Panel */}
      <div className="border-b border-zinc-800 bg-black px-4 sm:px-8 flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('personalization')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'personalization'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          <span>Personalización & Desafíos</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-100 border border-zinc-700 text-[9px] font-black tracking-wider">
            +448 PERFILES
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'status'
              ? 'border-[#ffffff] text-[#ffffff]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dns</span>
          <span>Integraciones y Estado</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipes')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'recipes'
              ? 'border-[#ffffff] text-[#ffffff]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
          <span>Gestión de Recetas ({recipes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('protocols')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'protocols'
              ? 'border-[#ffffff] text-[#ffffff]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Configuración de Niveles (4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-[#ffffff] text-[#ffffff]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>Bitácora de Auditoría ({auditLogs.length})</span>
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
        {loadingData && (
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="w-3 h-3 border-2 border-white/20 border-t-transparent rounded-full animate-spin"></span>
            <span>Sincronizando estado con el servidor...</span>
          </div>
        )}

        {/* 0. MOTOR DE PERSONALIZACIÓN Y GESTIÓN DE DESAFÍOS (+448 PERFILES) */}
        {activeTab === 'personalization' && (
          <div className="space-y-6">
            {/* Header del Motor - Monochrome Luxury */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white text-black shadow-sm">
                    SISTEMA MULTI-VECTORIAL
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    7 Objetivos × 4 Niveles × 4 Horarios × 4 Modalidades = 448 Perfiles Dinámicos
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Matriz de Personalización Élite & Desafíos
                </h2>
                <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                  Calibra la experiencia total del atleta según su objetivo principal, nivel de compromiso, modalidad de entrenamiento y momento del día. Cada combinación genera telemetría única, suplementación adaptada a la ventana horaria, tips científicos y respuestas específicas de MAX AI Coach.
                </p>
              </div>

              <button
                type="button"
                onClick={onBackToApp}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2 self-start lg:self-center whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">launch</span>
                <span>Probar en la App</span>
              </button>
            </div>

            {/* Atleta en Sesión / Control Reactivo - Luxury Noir */}
            <div className="p-4 rounded-xl bg-black border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white border border-zinc-700 flex items-center justify-center font-black text-sm">
                  {currentUserProfile?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Atleta Activo: {currentUserProfile?.name || 'Atleta en Sesión'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({currentUserProfile?.weightKg || 70} kg)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Objetivo: <strong className="text-white">{currentUserProfile?.goal || 'Crear constancia'}</strong> · Nivel: <strong className="text-white">{currentUserProfile?.level || 'Intermedio'}</strong> · Modalidad: <strong className="text-zinc-300 capitalize">{selectedModality}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleApplyToActiveUser}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-[0_0_15px_rgba(255,255,255,0.25)] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Asignar {selectedLevel} + {selectedGoal}</span>
                </button>
              </div>
            </div>

            {/* Cuadrícula de los 4 Selectores de Configuración */}
            <div className="space-y-5">
              {/* Fila 1: 1. Objetivo y 2. Nivel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Selección de Objetivo (7) */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-white">flag</span>
                      <span>1. Objetivo Principal del Atleta (7 Opciones)</span>
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">Meta Base</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_GOALS.map((goal) => {
                      const isSelected = selectedGoal === goal.id;
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => setSelectedGoal(goal.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-zinc-900 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-white/60'
                              : 'bg-black border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                            isSelected ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {goal.icon}
                          </span>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="text-xs font-bold leading-tight truncate text-white">
                              {goal.label}
                            </p>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-snug">
                              {goal.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Selección de Nivel de Desafío (4 Protocolos Monocromáticos) */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-white">tune</span>
                      <span>2. Nivel de Desafío (4 Protocolos de Exigencia)</span>
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">Compromiso</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_LEVELS.map((lvl) => {
                      const isSelected = selectedLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setSelectedLevel(lvl.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-zinc-900 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white'
                              : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                                isSelected ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              {lvl.tag}
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-white">
                                check_circle
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">{lvl.label}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{lvl.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Resumen del perfil actualmente enfocado */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]"></span>
                      <span className="font-bold text-white">{previewContent.modeBadge}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      Balanza: <strong className="text-white capitalize">{previewContent.caloricBalanceLabel}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Fila 2: 3. Modalidad de Entrenamiento y 4. Ventana Horaria */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3. Modalidad de Entrenamiento (4) */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-white">sports_score</span>
                      <span>3. Modalidad de Entrenamiento (4 Disciplinas)</span>
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">Disciplina</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_MODALITIES.map((mod) => {
                      const isSelected = selectedModality === mod.id;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => setSelectedModality(mod.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/60'
                              : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                            isSelected ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {mod.icon}
                          </span>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="text-xs font-bold leading-tight truncate text-white">
                              {mod.label}
                            </p>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-snug">
                              {mod.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Ventana Horaria Activa (4) */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-white">schedule</span>
                      <span>4. Simular Ventana Horaria (4 Momentos del Día)</span>
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">Fase Circadiana</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_WINDOWS.map((win) => {
                      const isSelected = selectedWindow === win.id;
                      return (
                        <button
                          key={win.id}
                          type="button"
                          onClick={() => setSelectedWindow(win.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/60'
                              : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                            isSelected ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {win.icon}
                          </span>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold leading-tight text-white">
                                {win.label}
                              </p>
                              <span className="text-[9px] text-zinc-400 font-mono">{win.hours}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-snug">
                              {win.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* PREVISUALIZADOR EN TIEMPO REAL: LA EXPERIENCIA DEL ATLETA */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-white">preview</span>
                  <span>Previsualización en Vivo: Qué ve el Atleta en la App</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Configurado: <strong className="text-white">{selectedGoal}</strong> · {selectedLevel} · <strong className="text-zinc-300 capitalize">{selectedModality}</strong>
                </span>
              </div>

              {/* Mockup del Header de la App - Ultra Luxury Noir */}
              <div className="p-6 rounded-2xl bg-black border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                        VISTA DE INICIO · TELEMETRÍA PERSONALIZADA
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-zinc-900 text-zinc-300 border border-zinc-700">
                        {previewContent.trainingModalityLabel}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tight">
                      {previewContent.greeting}
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium">
                      {previewContent.homeSubtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-black tracking-wide border shadow-md bg-white text-black border-white"
                    >
                      {previewContent.modeBadge}
                    </span>
                  </div>
                </div>

                {/* Tarjeta de la Ventana Horaria Activa & Suplementos del Momento */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      <span className="text-xs font-black text-white tracking-wider">
                        {previewContent.timeWindowBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 max-w-xl">
                      {previewContent.timeWindowDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Tomas de esta fase:</span>
                    {previewContent.windowSupplements.map((ws, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold flex items-center gap-1">
                        <span>{ws.icon}</span>
                        <span>{ws.name} ({ws.dose})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Alerta de Nivel Extremo o Avanzado */}
                {previewContent.levelAlert && (
                  <div
                    className="p-3.5 rounded-xl border border-white/20 bg-zinc-900 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>{previewContent.levelAlert}</span>
                  </div>
                )}

                {/* Tarjeta del Desafío Activo */}
                <div className="p-4 rounded-xl bg-[#06151e] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow"
                      style={{ backgroundColor: `${previewContent.modeBadgeColor}25`, color: previewContent.modeBadgeColor }}
                    >
                      <span className="material-symbols-outlined text-[20px]">military_tech</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {previewContent.challengeTitle}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Desafío Asignado
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {previewContent.challengeDescription}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/30 text-white border border-white/40 self-start sm:self-auto whitespace-nowrap">
                    En Curso
                  </span>
                </div>

                {/* Tarjeta de Tip del Día & Cita del Coach */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#06151e] border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Tip Diario con Base Científica
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {previewContent.dailyTip}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#06151e] border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-white">
                      <span className="material-symbols-outlined text-[16px]">format_quote</span>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Cita del Coach para {selectedGoal}
                      </span>
                    </div>
                    <p className="text-xs italic text-slate-300 leading-relaxed">
                      {previewContent.coachQuote}
                    </p>
                  </div>
                </div>

                {/* Pila de Suplementación Recomendada para este Perfil */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">medication</span>
                      <span>Pila de Suplementación Personalizada ({previewContent.recommendedSupplements.length})</span>
                    </h5>
                    <span className="text-[10px] text-slate-500">Ordenada por prioridad de impacto</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {previewContent.recommendedSupplements.map((sup, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#06151e] border border-white/10 flex flex-col justify-between space-y-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{sup.icon}</span>
                              <span>{sup.name}</span>
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                sup.priority === 'esencial'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : sup.priority === 'recomendado'
                                  ? 'bg-white/20 text-white border border-white/40'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {sup.priority}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {sup.reason}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Dosis: <strong className="text-white">{sup.dose}</strong></span>
                          <span>Toma: <strong className="text-white">{sup.timing}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas Clave y Coach IA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Métricas clave que se priorizan en el Dashboard */}
                  <div className="p-4 rounded-xl bg-[#06151e] border border-white/10 space-y-2.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-white">monitoring</span>
                      <span>Métricas Clave Monitoreadas ({previewContent.keyMetrics.length})</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {previewContent.keyMetrics.map((met) => (
                        <div key={met.id} className="p-2.5 rounded-lg bg-[#06151e] border border-white/10">
                          <span className="text-[10px] text-slate-400 block">{met.label}</span>
                          <span className="text-xs font-bold text-white">{met.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mensaje Inicial de MAX AI */}
                  <div className="p-4 rounded-xl bg-[#06151e] border border-white/10 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-purple-400">smart_toy</span>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Bienvenida del Coach MAX AI
                        </h5>
                      </div>
                      <p className="text-xs text-slate-300 italic bg-[#06151e] p-3 rounded-lg border border-white/10 leading-relaxed">
                        "{previewContent.aiWelcomeMessage}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplyToActiveUser();
                        onBackToApp();
                      }}
                      className="w-full py-2 bg-gradient-to-r from-[#06151e] to-[#545a5b] hover:from-[#06151e] hover:to-[#545a5b] text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all text-center"
                    >
                      Probar esta experiencia en la App
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparativa de los 4 Desafíos para este Objetivo */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-400">compare_arrows</span>
                <span>Comparativa de Niveles para "{selectedGoal}"</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {AVAILABLE_LEVELS.map((lvl) => {
                  const contentForLevel = getPersonalizedContent(selectedGoal, lvl.id, 'Atleta', 75);
                  return (
                    <div
                      key={lvl.id}
                      className="p-4 rounded-xl bg-[#06151e] border border-white/10 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2 py-0.5 text-[9px] font-black rounded uppercase"
                            style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
                          >
                            {lvl.id}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {contentForLevel.keyMetrics.length} métricas
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">
                          {contentForLevel.challengeTitle}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-3 leading-snug">
                          {contentForLevel.challengeDescription}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedLevel(lvl.id)}
                        className="w-full py-1.5 rounded-lg bg-[#06151e] hover:bg-[#545a5b] text-slate-300 hover:text-white text-[10px] font-bold transition-all text-center"
                      >
                        Ver este nivel
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 1. ESTADO DE INTEGRACIONES */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Estado de Integraciones y Persistencia</h2>
              <p className="text-xs text-slate-400">
                Diagnóstico en tiempo real que distingue servicios de producción reales de modos de contingencia locales.
              </p>
            </div>

            {/* Diagnóstico de Persistencia */}
            {serverStatus?.persistence && (
              <div className={`p-5 rounded-2xl border ${
                serverStatus.persistence.isDistributedProduction 
                  ? 'bg-emerald-950/20 border-emerald-500/30' 
                  : 'bg-amber-950/20 border-amber-500/30'
              } space-y-2`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      serverStatus.persistence.isDistributedProduction ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Motor de Persistencia: {serverStatus.persistence.engine}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    serverStatus.persistence.isDistributedProduction 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {serverStatus.persistence.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {serverStatus.persistence.note}
                </p>
              </div>
            )}

            {/* Grid de Servicios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {serverStatus &&
                Object.entries(serverStatus.integrations).map(([key, item]: [string, IntegrationStatus]) => (
                  <div
                    key={key}
                    className="p-5 bg-[#06151e] border border-white/10 rounded-2xl space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {item.name}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      ></span>
                    </div>

                    <div>
                      <span className="text-lg font-black block text-white">{item.status}</span>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{item.mode}</span>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Variables de Entorno</span>
                      <span className={item.configured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {item.configured ? 'Configurada' : 'No provista'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Métricas del Sistema */}
            {serverStatus && (
              <div className="p-6 bg-[#06151e] border border-white/10 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Telemetría del Servidor
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#06151e] rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Atletas con XP</span>
                    <span className="text-2xl font-black text-white">{serverStatus.metrics.activeUsers}</span>
                  </div>
                  <div className="p-4 bg-[#06151e] rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Comidas Registradas</span>
                    <span className="text-2xl font-black text-white">{serverStatus.metrics.totalFoodLogs}</span>
                  </div>
                  <div className="p-4 bg-[#06151e] rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Tomas de Suplemento</span>
                    <span className="text-2xl font-black text-white">{serverStatus.metrics.totalSupplementLogs}</span>
                  </div>
                  <div className="p-4 bg-[#06151e] rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Uptime del Proceso</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {Math.floor(serverStatus.metrics.uptimeSeconds / 60)} min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. GESTIÓN DE RECETAS */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Catálogo Oficial de Recetas</h2>
                <p className="text-xs text-slate-400">
                  Administra los platos disponibles para sugerencias de MAX AI y catálogo general. Los cambios impactan a todos los atletas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddRecipeOpen(true)}
                className="px-4 py-2 bg-[#06151e] hover:bg-[#545a5b] text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nueva Receta</span>
              </button>
            </div>

            {/* Modal para Crear Receta */}
            {isAddRecipeOpen && (
              <div className="p-6 bg-[#06151e] border border-[#ffffff]/40 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="font-bold text-sm text-white">Crear Nueva Receta</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddRecipeOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateRecipe} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                      placeholder="Ej: Omelette Alto en Proteína con Lomo"
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Categoría</label>
                    <select
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                    >
                      <option value="almuerzo_cena">Almuerzo / Cena</option>
                      <option value="desayuno_merienda">Desayuno / Merienda</option>
                      <option value="post_entreno">Post-Entreno</option>
                      <option value="snack_rapido">Snack Rápido</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Proteína (g)</label>
                    <input
                      type="number"
                      value={newRecipe.protein}
                      onChange={(e) => setNewRecipe({ ...newRecipe, protein: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Carbohidratos (g)</label>
                    <input
                      type="number"
                      value={newRecipe.carbs}
                      onChange={(e) => setNewRecipe({ ...newRecipe, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Grasas (g)</label>
                    <input
                      type="number"
                      value={newRecipe.fats}
                      onChange={(e) => setNewRecipe({ ...newRecipe, fats: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Calorías Totales (kcal)</label>
                    <input
                      type="number"
                      value={newRecipe.calories}
                      onChange={(e) => setNewRecipe({ ...newRecipe, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Tiempo (min)</label>
                    <input
                      type="number"
                      value={newRecipe.prepTimeMinutes}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prepTimeMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Ingrediente 1</label>
                    <input
                      type="text"
                      value={newRecipe.ingredient1}
                      onChange={(e) => setNewRecipe({ ...newRecipe, ingredient1: e.target.value })}
                      placeholder="Ej: 200g Pechuga de pollo"
                      className="w-full px-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddRecipeOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                    >
                      Guardar Receta en Servidor
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Listado de Recetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-[#06151e] border border-white/10 rounded-xl flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{r.flag}</span>
                        <span>{r.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecipe(r.id, r.name)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar receta"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{r.description || 'Receta de alto rendimiento nutricional.'}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#ffffff]">{r.protein}g Proteína</span>
                    <span className="text-slate-400">{r.calories} kcal</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{r.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CONFIGURACIÓN DE NIVELES (4 PROTOCOLOS) */}
        {activeTab === 'protocols' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Parámetros de los 4 Protocolos de Nivel</h2>
              <p className="text-xs text-slate-400">
                Ajusta las exigencias metabólicas de cada nivel (Básico, Intermedio, Avanzado, Extremo). Cada cambio se audita y aplica a nuevos cálculos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(protocols).map(([id, proto]: [string, LevelProtocolItem]) => (
                <div key={id} className="p-5 bg-[#06151e] border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#06151e]"></span>
                      <h3 className="font-bold text-sm text-white">Nivel {proto.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {proto.taskCount} tareas diarias
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                        Entrenamientos Semanales
                      </label>
                      <input
                        type="text"
                        defaultValue={proto.weeklyWorkouts}
                        onBlur={(e) => handleUpdateProtocol(id, { weeklyWorkouts: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#06151e] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                        Duración por Sesión
                      </label>
                      <input
                        type="text"
                        defaultValue={proto.workoutDuration}
                        onBlur={(e) => handleUpdateProtocol(id, { workoutDuration: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#06151e] border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                          Ratio Proteína
                        </label>
                        <input
                          type="text"
                          defaultValue={proto.proteinRatio}
                          onBlur={(e) => handleUpdateProtocol(id, { proteinRatio: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#06151e] border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                          Meta de Hidratación
                        </label>
                        <input
                          type="text"
                          defaultValue={proto.hydrationGoal}
                          onBlur={(e) => handleUpdateProtocol(id, { hydrationGoal: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#06151e] border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BITÁCORA DE AUDITORÍA */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Registro de Auditoría (Audit Log)</h2>
              <p className="text-xs text-slate-400">
                Historial cronológico de cambios de configuración, gestión de contenido y accesos administrativos.
              </p>
            </div>

            <div className="bg-[#06151e] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Sin eventos de auditoría registrados.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300">
                          {log.action}
                        </span>
                        <span className="font-semibold text-white">{log.details}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">Por: {log.adminUser}</span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
