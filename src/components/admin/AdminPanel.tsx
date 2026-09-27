import React, { useState, useEffect } from 'react';
import { MaxMindLogo } from '../MaxMindLogo';
import { RecipeItem } from '../../data/recipesDatabase';

interface AdminPanelProps {
  onBackToApp: () => void;
  isDark?: boolean;
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp, isDark = true }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('maxmind_admin_session_token');
  });
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('admin@maxsuplementos.com');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Tab activo dentro del panel
  const [activeTab, setActiveTab] = useState<'status' | 'recipes' | 'protocols' | 'audit'>('status');

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
      setAuthError('Error conectando con el servidor administrativo.');
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
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0F141C] border border-[#1E2530] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
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
                className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
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
                className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
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
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-[#07090D] text-white flex flex-col">
      {/* Barra superior de administración */}
      <header className="border-b border-[#1E2530] bg-[#0B0F17]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
            className="px-3 py-1.5 rounded-lg border border-[#2563EB]/40 bg-[#2563EB]/20 hover:bg-[#2563EB]/30 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5"
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
      <div className="border-b border-[#1E2530] bg-[#07090D] px-4 sm:px-8 flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'status'
              ? 'border-[#2563EB] text-[#3B82F6]'
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
              ? 'border-[#2563EB] text-[#3B82F6]'
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
              ? 'border-[#2563EB] text-[#3B82F6]'
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
              ? 'border-[#2563EB] text-[#3B82F6]'
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
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Sincronizando estado con el servidor...</span>
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
                    className="p-5 bg-[#0F141C] border border-[#1E2530] rounded-2xl space-y-3 relative overflow-hidden"
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

                    <div className="pt-2 border-t border-[#1E2530] flex items-center justify-between text-[11px]">
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
              <div className="p-6 bg-[#0F141C] border border-[#1E2530] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Telemetría del Servidor
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#07090D] rounded-xl border border-[#1E2530]">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Atletas con XP</span>
                    <span className="text-2xl font-black text-white">{serverStatus.metrics.activeUsers}</span>
                  </div>
                  <div className="p-4 bg-[#07090D] rounded-xl border border-[#1E2530]">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Comidas Registradas</span>
                    <span className="text-2xl font-black text-white">{serverStatus.metrics.totalFoodLogs}</span>
                  </div>
                  <div className="p-4 bg-[#07090D] rounded-xl border border-[#1E2530]">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Tomas de Suplemento</span>
                    <span className="text-2xl font-black text-white">{serverStatus.metrics.totalSupplementLogs}</span>
                  </div>
                  <div className="p-4 bg-[#07090D] rounded-xl border border-[#1E2530]">
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
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nueva Receta</span>
              </button>
            </div>

            {/* Modal para Crear Receta */}
            {isAddRecipeOpen && (
              <div className="p-6 bg-[#0F141C] border border-[#2563EB]/40 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-[#1E2530] pb-3">
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
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Categoría</label>
                    <select
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
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
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Carbohidratos (g)</label>
                    <input
                      type="number"
                      value={newRecipe.carbs}
                      onChange={(e) => setNewRecipe({ ...newRecipe, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Grasas (g)</label>
                    <input
                      type="number"
                      value={newRecipe.fats}
                      onChange={(e) => setNewRecipe({ ...newRecipe, fats: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Calorías Totales (kcal)</label>
                    <input
                      type="number"
                      value={newRecipe.calories}
                      onChange={(e) => setNewRecipe({ ...newRecipe, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Tiempo (min)</label>
                    <input
                      type="number"
                      value={newRecipe.prepTimeMinutes}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prepTimeMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
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
                      className="w-full px-3 py-2 bg-[#07090D] border border-[#232A36] rounded-xl text-xs text-white"
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
                  className="p-4 bg-[#0F141C] border border-[#1E2530] rounded-xl flex flex-col justify-between space-y-3"
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

                  <div className="pt-2 border-t border-[#1E2530] flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#3B82F6]">{r.protein}g Proteína</span>
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
                <div key={id} className="p-5 bg-[#0F141C] border border-[#1E2530] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E2530] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
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
                        className="w-full px-3 py-1.5 bg-[#07090D] border border-[#232A36] rounded-lg text-xs text-white"
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
                        className="w-full px-3 py-1.5 bg-[#07090D] border border-[#232A36] rounded-lg text-xs text-white"
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
                          className="w-full px-3 py-1.5 bg-[#07090D] border border-[#232A36] rounded-lg text-xs text-white"
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
                          className="w-full px-3 py-1.5 bg-[#07090D] border border-[#232A36] rounded-lg text-xs text-white"
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

            <div className="bg-[#0F141C] border border-[#1E2530] rounded-2xl overflow-hidden divide-y divide-[#1E2530]">
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
