import React, { useState, useEffect } from 'react';
import { CommitmentLevel } from '../types';
import { OnboardingProfileInput } from '../lib/objectiveEngine';
import { MaxMindLogo } from './MaxMindLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  userId?: string;
  initialName?: string;
  onComplete: (profile: OnboardingProfileInput) => void;
  onClose?: () => void;
  isDark?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userId = 'default',
  initialName = '',
  onComplete,
  onClose,
  isDark = true,
}) => {
  const [step, setStep] = useState<number>(1);

  // Estados de los 6 pasos del Onboarding sin valores prefabricados engañosos
  const [name, setName] = useState<string>(initialName);
  const [goal, setGoal] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<CommitmentLevel>('Intermedio');
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<'Sedentario' | 'Ligero' | 'Moderado' | 'Muy activo'>('Moderado');
  const [trainingFrequency, setTrainingFrequency] = useState<'0' | '1–2' | '3–4' | '5–6' | '7'>('3–4');
  const [trainingTypes, setTrainingTypes] = useState<string[]>(['Gimnasio']);
  const [otherTraining, setOtherTraining] = useState<string>('');
  const [diet, setDiet] = useState<string>('Normal');
  const [avoidFoods, setAvoidFoods] = useState<string>('');
  const [usesSupplements, setUsesSupplements] = useState<'Sí' | 'No' | 'No estoy seguro'>('Sí');
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([
    'Proteína Whey',
    'Creatina Monohidrato',
  ]);
  const [suppTime, setSuppTime] = useState<string>('Post-entreno');

  const draftKey = `maxform_onboarding_draft_${userId}`;

  // Cargar borrador persistente para no perder avance si se cierra
  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.name) setName(draft.name);
        if (draft.goal) setGoal(draft.goal);
        if (draft.experienceLevel) setExperienceLevel(draft.experienceLevel);
        if (draft.age) setAge(draft.age);
        if (draft.height) setHeight(draft.height);
        if (draft.weight) setWeight(draft.weight);
        if (draft.activityLevel) setActivityLevel(draft.activityLevel);
        if (draft.trainingFrequency) setTrainingFrequency(draft.trainingFrequency);
        if (draft.trainingTypes) setTrainingTypes(draft.trainingTypes);
        if (draft.diet) setDiet(draft.diet);
        if (draft.usesSupplements) setUsesSupplements(draft.usesSupplements);
        if (draft.selectedSupplements) setSelectedSupplements(draft.selectedSupplements);
        if (draft.step) setStep(draft.step);
      } else if (initialName) {
        setName(initialName);
      }
    } catch (e) {
      console.warn('Error leyendo borrador de onboarding:', e);
    }
  }, [isOpen, draftKey, initialName]);

  // Guardar avance en cada cambio
  const saveDraft = (nextStep?: number) => {
    try {
      const draft = {
        name,
        goal,
        experienceLevel,
        age,
        height,
        weight,
        activityLevel,
        trainingFrequency,
        trainingTypes,
        diet,
        usesSupplements,
        selectedSupplements,
        step: nextStep || step,
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      console.warn('Error guardando borrador:', e);
    }
  };

  if (!isOpen) return null;

  const goalOptions = [
    { id: 'Ganar masa muscular', icon: 'fitness_center', desc: 'Hipertrofia, aumento de fuerza y superávit limpio' },
    { id: 'Perder grasa', icon: 'local_fire_department', desc: 'Déficit calórico inteligente y preservación de masa magra' },
    { id: 'Mejorar mi rendimiento', icon: 'bolt', desc: 'Potencia neuromuscular, resistencia y recuperación metabólica' },
    { id: 'Mejorar mi alimentación', icon: 'restaurant', desc: 'Calidad nutricional, distribución de macros y energía' },
    { id: 'Crear constancia', icon: 'calendar_today', desc: 'Hábitos diarios inquebrantables y racha sin fallar' },
    { id: 'Mejorar mi condición física', icon: 'directions_run', desc: 'Capacidad aeróbica, movilidad y bienestar general' },
    { id: 'Mejorar mis hábitos', icon: 'verified', desc: 'Sueño de calidad, hidratación óptima y balance diario' },
  ];

  const experienceLevels: Array<{
    id: CommitmentLevel;
    title: string;
    sub: string;
    badgeColor: string;
    specs: string;
  }> = [
    { 
      id: 'Básico', 
      title: 'Básico', 
      sub: 'Iniciación y hábito saludable. Sin fricción ni saturación mental.', 
      badgeColor: 'border-emerald-500 text-emerald-300',
      specs: '3 tareas diarias · 2.2L agua · 1.3g/kg prot · 3 sesiones ligeras'
    },
    { 
      id: 'Intermedio', 
      title: 'Intermedio', 
      sub: 'Construyendo constancia atlética. Sobrecarga progresiva y 4 macros.', 
      badgeColor: 'border-blue-500 text-blue-300',
      specs: '4 tareas diarias · 2.8L agua · 1.7g/kg prot · 4 sesiones estructuradas'
    },
    { 
      id: 'Avanzado', 
      title: 'Avanzado', 
      sub: 'Alto rendimiento. Rutina pesada RPE 8-9, leucina mTOR y timing.', 
      badgeColor: 'border-indigo-500 text-indigo-300',
      specs: '5 tareas diarias · 3.3L agua · 2.0g/kg prot · 5 sesiones de rigor'
    },
    { 
      id: 'Extremo', 
      title: 'Extremo', 
      sub: 'Élite · Tolerancia Cero. Macros exactos al gramo y disciplina total.', 
      badgeColor: 'border-rose-500 text-rose-300',
      specs: '6 tareas diarias · 3.8L agua · 2.3g/kg prot · 5-6 sesiones de máxima intensidad'
    },
  ];

  const trainingOptions = [
    { id: 'Gimnasio', icon: 'fitness_center' },
    { id: 'Running', icon: 'directions_run' },
    { id: 'Cross training', icon: 'bolt' },
    { id: 'Deportes', icon: 'sports_soccer' },
    { id: 'Entrenamiento en casa', icon: 'home' },
    { id: 'Otro', icon: 'more_horiz' },
  ];

  const supplementList = [
    'Proteína Whey',
    'Creatina Monohidrato',
    'Pre-entreno',
    'Multivitamínico',
    'Omega 3',
    'Otro',
  ];

  const toggleTrainingType = (t: string) => {
    if (trainingTypes.includes(t)) {
      if (trainingTypes.length > 1) {
        setTrainingTypes(trainingTypes.filter((item) => item !== t));
      }
    } else {
      setTrainingTypes([...trainingTypes, t]);
    }
  };

  const toggleSupplement = (s: string) => {
    if (selectedSupplements.includes(s)) {
      setSelectedSupplements(selectedSupplements.filter((item) => item !== s));
    } else {
      setSelectedSupplements([...selectedSupplements, s]);
    }
  };

  const handleNext = () => {
    saveDraft(step + 1);
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    saveDraft(step - 1);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleComplete = () => {
    // Limpiar borrador temporal al completar
    localStorage.removeItem(draftKey);

    const mappedSupplements =
      usesSupplements === 'Sí'
        ? selectedSupplements.map((s) => ({
            name: s,
            serving: s.includes('Creatina') ? '5g' : s.includes('Proteína') ? '30g' : '1 porción',
            preferred_time: suppTime,
          }))
        : [];

    onComplete({
      name: name.trim() || 'Atleta',
      primary_goal: goal || 'Crear constancia',
      experience_level: experienceLevel,
      age: Number(age) || 25,
      height: Number(height) || 172,
      weight: Number(weight) || 70,
      activity_level: activityLevel,
      training_frequency: trainingFrequency,
      training_type: trainingTypes.includes('Otro') && otherTraining.trim()
        ? [...trainingTypes.filter((t) => t !== 'Otro'), otherTraining.trim()]
        : trainingTypes,
      dietary_preferences: diet,
      foods_to_avoid: avoidFoods,
      supplements: mappedSupplements,
    });
  };

  // Validaciones por paso
  const isStep1Valid = name.trim().length > 0;
  const isStep2Valid = goal.length > 0;
  const isStep3Valid = Boolean(experienceLevel);
  const isStep4Valid = Boolean(height && weight && Number(height) > 100 && Number(weight) > 30);
  const isStep5Valid = trainingTypes.length > 0;
  const isStep6Valid = true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0B1220] border border-[#1E293B] rounded-3xl p-5 sm:p-7 shadow-2xl text-white space-y-6 my-auto">
        {/* Encabezado con Indicador de Progreso Dinámico (1 / 6) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <MaxMindLogo variant="symbol" size="xs" isDark={true} />
            <span className="font-bold text-xs uppercase tracking-wider text-[#3B82F6]">
              Configuración Inicial · {step} / 6
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-[#2563EB]'
                    : s < step
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-[#1E293B]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CONTENIDO SEGÚN PASO */}

        {/* PASO 1: NOMBRE */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ¿Cómo querés que te llamemos?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Personalizaremos tus objetivos, tu racha y la telemetría con tu nombre real.
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Tu Nombre o Apodo
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ejemplo: Santiago"
                className="w-full px-4 py-3.5 bg-[#151D30] border border-[#1E293B] focus:border-[#2563EB] rounded-2xl text-base text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Este nombre aparecerá en tu saludo matutino y en tu tarjeta de atleta.
              </p>
            </div>
          </div>
        )}

        {/* PASO 2: OBJETIVO PRINCIPAL */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ¿Cuál es tu objetivo principal?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                MAXMIND calibrará tus calorías, proteínas y objetivos diarios según esta meta.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {goalOptions.map((opt) => {
                const isSelected = goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGoal(opt.id)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-[#1E293B] border-[#2563EB] text-white shadow-lg ring-1 ring-[#2563EB]/40'
                        : 'bg-[#151D30] border-[#1E293B] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#1E293B] text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm block text-white">{opt.id}</span>
                      <span className="text-xs text-slate-400 line-clamp-1">{opt.desc}</span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#3B82F6] text-[20px]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 3: NIVEL DE EXPERIENCIA */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ¿Cuál es tu nivel actual?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Selecciona la intensidad con la que construirás tu disciplina.
              </p>
            </div>

            {/* Aviso explicativo del protocolo de 14 días y oportunidad de cambio */}
            <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-[#2563EB]/40 text-xs text-blue-200 flex items-start gap-2.5">
              <span className="text-base leading-none">⚖️</span>
              <div className="space-y-0.5">
                <strong className="block text-blue-100 font-bold text-xs">
                  Regla de Protocolo y Adaptación Biológica (14 Días)
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Cada nivel calibra tus objetivos, agua y proteína. Al entrar a la app tendrás <strong>1 oportunidad para recalibrarlo</strong>; posteriormente entrarás en un ciclo cerrado de <strong>14 días obligatorios</strong> para asegurar adaptaciones fisiológicas reales sin cambiar a capricho.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {experienceLevels.map((lvl) => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all active:scale-[0.99] flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#1E293B] border-[#2563EB] text-white ring-1 ring-[#2563EB]/40 shadow-lg'
                        : 'bg-[#151D30] border-[#1E293B] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{lvl.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${lvl.badgeColor}`}>
                          Nivel de Compromiso
                        </span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#3B82F6] text-[20px]">
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{lvl.sub}</p>
                    <div className="pt-1.5 border-t border-slate-700/50 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <span className="text-[#3B82F6]">⚡</span>
                      <span>{lvl.specs}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 4: DATOS CORPORALES */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tus datos biométricos
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Solo lo necesario para calcular tu consumo basal de agua y tu gasto metabólico.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Peso (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="35"
                    max="220"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="72"
                    className="w-full px-3.5 py-3 bg-[#151D30] border border-[#1E293B] focus:border-[#2563EB] rounded-2xl text-sm text-white focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-bold">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Altura (cm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="175"
                    className="w-full px-3.5 py-3 bg-[#151D30] border border-[#1E293B] focus:border-[#2563EB] rounded-2xl text-sm text-white focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-bold">cm</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Edad
                </label>
                <input
                  type="number"
                  min="14"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="25"
                  className="w-full px-3.5 py-3 bg-[#151D30] border border-[#1E293B] focus:border-[#2563EB] rounded-2xl text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nivel de Actividad Diaria
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full px-3 py-3 bg-[#151D30] border border-[#1E293B] focus:border-[#2563EB] rounded-2xl text-xs text-white focus:outline-none"
                >
                  <option value="Sedentario">Sedentario (Oficina)</option>
                  <option value="Ligero">Ligero (1–2 días activo)</option>
                  <option value="Moderado">Moderado (3–4 días)</option>
                  <option value="Muy activo">Muy activo (5+ días)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: ENTRENAMIENTO */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tu rutina de entrenamiento
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Personalizaremos tu meta deportiva para que no recibas tareas que no realizas.
              </p>
            </div>

            {/* Días a la semana */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                ¿Cuántos días entrenás normalmente?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['0', '1–2', '3–4', '5–6', '7'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setTrainingFrequency(freq)}
                    className={`py-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      trainingFrequency === freq
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md'
                        : 'bg-[#151D30] text-slate-400 border-[#1E293B] hover:border-slate-500'
                    }`}
                  >
                    {freq} {freq === '0' ? 'días' : 'días'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de entrenamiento */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                ¿Qué tipo de entrenamiento hacés? (puedes elegir varios)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {trainingOptions.map((opt) => {
                  const isSelected = trainingTypes.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleTrainingType(opt.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#1E293B] border-[#2563EB] text-white'
                          : 'bg-[#151D30] border-[#1E293B] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {opt.icon}
                      </span>
                      <span className="truncate">{opt.id}</span>
                    </button>
                  );
                })}
              </div>

              {trainingTypes.includes('Otro') && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={otherTraining}
                    onChange={(e) => setOtherTraining(e.target.value)}
                    placeholder="Especifica tu deporte o disciplina"
                    className="w-full px-3.5 py-2.5 bg-[#151D30] border border-[#1E293B] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 6: NUTRICIÓN Y SUPLEMENTOS */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Nutrición y Suplementación
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Último paso para generar tus metas diarias y tu balance de macronutrientes.
              </p>
            </div>

            {/* Tipo de Alimentación */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ¿Cómo describirías tu alimentación?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Normal', 'Alta en proteína', 'Vegetariana', 'Vegana', 'Flexible', 'Otra'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiet(d)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all truncate ${
                      diet === d
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#151D30] text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Suplementos */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ¿Usás suplementos actualmente?
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(['Sí', 'No', 'No estoy seguro'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setUsesSupplements(opt)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      usesSupplements === opt
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#151D30] text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {usesSupplements === 'Sí' && (
                <div className="p-3 bg-[#151D30] rounded-2xl border border-[#1E293B] space-y-2.5 animate-fadeIn">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Selecciona tus suplementos:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {supplementList.map((supp) => {
                      const isChecked = selectedSupplements.includes(supp);
                      return (
                        <button
                          key={supp}
                          type="button"
                          onClick={() => toggleSupplement(supp)}
                          className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#1E293B] border-[#3B82F6] text-white'
                              : 'bg-[#111827] border-[#1E293B] text-slate-400'
                          }`}
                        >
                          <span className="truncate">{supp}</span>
                          {isChecked && (
                            <span className="material-symbols-outlined text-[16px] text-[#3B82F6]">
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Momento preferido:</span>
                    <select
                      value={suppTime}
                      onChange={(e) => setSuppTime(e.target.value)}
                      className="bg-[#111827] border border-[#1E293B] text-white rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="Mañana">Por la mañana</option>
                      <option value="Pre-entreno">Pre-entreno</option>
                      <option value="Post-entreno">Post-entreno</option>
                      <option value="Noche">Antes de dormir</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN */}
        <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-[#1E293B] text-slate-400 hover:text-white text-xs font-bold transition-colors"
            >
              Anterior
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid) ||
                (step === 4 && !isStep4Valid) ||
                (step === 5 && !isStep5Valid)
              }
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <span>Siguiente</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!isStep6Valid}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-1.5 active:scale-95"
            >
              <span>Completar y Generar Plan</span>
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
