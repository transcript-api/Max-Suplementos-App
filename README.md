# MAXFORM — Sistema de Rendimiento Deportivo y Nutrición

**MAXFORM** es la plataforma deportiva integral de alto rendimiento diseñada bajo un enfoque **Mobile First** (Android e iOS con React Native + Expo, y cliente Web en Next.js), compartiendo un backend autoritario, motor determinista de gamificación, base de datos relacional y servicios de inteligencia artificial (Google Gemini).

---

## 🚀 Filosofía y Principios Centrales

1. **Mobile First**: La aplicación móvil para Android e iOS es el producto primario. Comparte tipos, servicios, validaciones y lógica de negocio con la aplicación web.
2. **Cero Absoluto para Nuevos Atletas**: Todo usuario nuevo comienza en 0 XP, Nivel 1 Básico, 0 días de racha, 0% Form y sin telemetría inventada. "Tu progreso empieza hoy".
3. **Lógica Autoritaria en Servidor**: El cálculo de XP, niveles, rachas, Form Diaria, canje de cupones y clasificación en Liga reside y se valida de forma estricta en el backend. El cliente nunca puede otorgarse XP ni activar suscripciones Premium de forma arbitraria.
4. **Inteligencia Artificial Contextual**: MAX AI y Heladera IA actúan como consejeros de alto rendimiento. Las sugerencias de comidas nunca se guardan en el historial del atleta sin confirmación explícita.
5. **Ecosistema y Automatización**: Preparado para la integración con MAX Suplementos, alertas por WhatsApp mediante webhooks n8n y análisis predictivo de reposición.

---

## 📁 Estructura del Repositorio

```text
MAXFORM/
├── app.json                  # Configuración de Expo (Android & iOS)
├── eas.json                  # Perfiles de compilación EAS Build (Play Store & App Store)
├── server.ts                 # Backend autoritario Express con APIs unificadas
├── src/                      # Código fuente de la aplicación
│   ├── components/           # Componentes modulares de interfaz (Dashboard, Nutrición, MAX AI, Retos, Stats)
│   ├── lib/                  # Lógica de negocio y persistencia
│   │   ├── shared/           # Cliente API isomórfico y servicios compartidos
│   │   ├── userStore.ts      # Estado del usuario y sincronización con Firestore / Supabase
│   │   ├── gamification.ts   # Reglas deterministas de XP y ligas
│   │   └── authService.ts    # Capa de autenticación y sesiones
│   └── main.tsx              # Punto de entrada de la aplicación
└── docs/                     # Documentación técnica de arquitectura
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── API.md
    ├── DEPLOYMENT.md
    ├── MOBILE.md
    └── SECURITY.md
```

---

## ⚙️ Inicio Rápido en Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en puerto 3000
npm run dev

# 3. Compilar para producción
npm run build
```

Variables de entorno requeridas en `.env`:
- `GEMINI_API_KEY`: Clave de acceso a Google Gen AI (mantenida exclusivamente en el backend).
- `PORT`: 3000 (preconfigurado por la infraestructura de contenedores).
