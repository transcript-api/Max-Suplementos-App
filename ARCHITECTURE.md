# MAXFORM — Arquitectura del Sistema

Este documento describe la arquitectura técnica de MAXFORM, estructurada para escalar desde cientos hasta millones de atletas sin necesidad de reescrituras de código.

---

## 1. Topología del Sistema

```text
                               MAXFORM
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
        React Native + Expo                     Next.js
                 │                                 │
           ┌─────┴─────┐                           │
           ▼           ▼                           ▼
        Android       iOS                         WEB
           │           │                           │
           └─────┬─────┘                           │
                 └──────────────┬──────────────────┘
                                │ (Isomorphic ApiClient)
                                ▼
                       MAXFORM CORE (Backend)
                                │
                 ┌──────────────┼────────────────┐
                 ▼              ▼                ▼
            PostgreSQL          AI              n8n
          (Supabase/Cloud)  (Gemini API)    (Webhooks CRM)
```

---

## 2. Capa de Aplicaciones (Frontend & Mobile)

- **Mobile (React Native + Expo)**: Base de código única para Android (.aab) e iOS (.ipa). Maneja cámara nativa, notificaciones push, HealthKit y Google Fit.
- **Web (Next.js / Vite SPA)**: Cliente web reactivo para computadoras y tablets, utilizando el mismo diseño oscuro/claro premium con Tailwind CSS y componentes modulares.
- **Shared Code (`src/lib/shared/`)**: Tipos TypeScript, cliente HTTP isomórfico (`MaxFormApiClient`), validaciones de entrada y fórmulas de nutrición y XP comunes a ambas plataformas.

---

## 3. Capa de Backend Autoritario (`server.ts`)

El backend actúa como la única fuente de verdad:
- **Determinismo estricto**: La IA nunca decide si un objetivo fue cumplido, cuánto XP asignar o qué posición ocupa el usuario en la liga. El backend calcula y persiste los estados.
- **Idempotencia**: Todas las mutaciones de XP y canje de cupones cuentan con claves de idempotencia para evitar duplicación por reintentos de red o taps rápidos.
- **Aislamiento Multiusuario**: Cada registro incluye `userId`. Ningún usuario puede leer o modificar información de otros atletas.

---

## 4. Integraciones Externas

- **Google Gen AI (Gemini 3.8 Flash)**: Proveedor de visión computacional para fotos de platos e ingredientes de heladera, y motor conversacional de MAX AI. Todas las llamadas se realizan del lado del servidor protegiendo las credenciales.
- **n8n Automation Hub**: Despachador de webhooks (`/api/webhooks/trigger`) para alertas de rescate de racha, resúmenes diarios y reposición predictiva de suplementos por WhatsApp y CRM.
- **MAX Suplementos**: Pasarela de cupones de compra y validación de tickets de sucursales físicas para activación de membresías Pro.
