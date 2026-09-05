import React, { useState } from 'react';
import { authService, AppUser } from '../lib/authService';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: AppUser) => void;
  onClose?: () => void;
  onSwitchToDemo?: () => void;
  initialMode?: 'login' | 'register' | 'recovery';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  onSwitchToDemo,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        const user = await authService.register(email, password, name);
        onSuccess(user);
      } else if (mode === 'login') {
        const user = await authService.login(email, password);
        onSuccess(user);
      } else if (mode === 'recovery') {
        await authService.resetPassword(email);
        setRecoverySuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Por favor inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 my-auto">
        {/* Encabezado con Logo y Marca */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[28px] text-white">bolt</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'register' && 'Crea tu Cuenta MAXFORM'}
            {mode === 'login' && 'Bienvenido de Nuevo'}
            {mode === 'recovery' && 'Recuperar Contraseña'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs">
            {mode === 'register' && 'Configura tu cuenta personal y comienza desde cero hacia tu mejor versión.'}
            {mode === 'login' && 'Ingresa a tu cuenta para continuar con tus objetivos diarios y tu racha.'}
            {mode === 'recovery' && 'Ingresa tu correo y te enviaremos las instrucciones de recuperación.'}
          </p>
        </div>

        {/* Pestañas de Cambio de Modo */}
        {mode !== 'recovery' && (
          <div className="p-1 bg-[#151D30] rounded-xl flex items-center border border-[#1E293B]">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Mensajes de Estado */}
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {recoverySuccess ? (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-emerald-400">mark_email_read</span>
            <p className="text-xs text-emerald-200">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
            </p>
            <button
              type="button"
              onClick={() => { setMode('login'); setRecoverySuccess(false); }}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-xs font-bold rounded-xl text-white transition-colors"
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ¿Cómo te llamas?
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-slate-500">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Martín"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#151D30] border border-[#1E293B] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-slate-500">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151D30] border border-[#1E293B] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {mode !== 'recovery' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('recovery'); setError(null); }}
                      className="text-[11px] text-[#3B82F6] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-slate-500">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#151D30] border border-[#1E293B] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-slate-500">
                    check_circle
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#151D30] border border-[#1E293B] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>
                    {mode === 'register' && 'Crear Cuenta y Comenzar Onboarding'}
                    {mode === 'login' && 'Entrar a MAXFORM'}
                    {mode === 'recovery' && 'Enviar Enlace de Recuperación'}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Opciones Inferiores y Modo Demo */}
        <div className="pt-2 border-t border-[#1E293B] flex flex-col items-center gap-3">
          {mode === 'recovery' ? (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="text-xs text-slate-400 hover:text-white"
            >
              ← Volver al Inicio de Sesión
            </button>
          ) : (
            onSwitchToDemo && (
              <button
                type="button"
                onClick={onSwitchToDemo}
                className="text-xs text-slate-400 hover:text-[#3B82F6] flex items-center gap-1.5 transition-colors"
              >
                <span>O probar perfil de demostración</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1E293B] text-slate-300">
                  Santiago (12d racha)
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
