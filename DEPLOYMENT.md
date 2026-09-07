# MAXFORM — Guía de Despliegue y Ambientes

Este documento define la estrategia de CI/CD y despliegue para desarrollo, pruebas y producción.

---

## 1. Ambientes de Ejecución

| Ambiente | Propósito | Plataforma Backend | URL / Endpoint |
|---|---|---|---|
| **Development** | Desarrollo activo local y preview AI Studio | Cloud Run / Dev Server | `http://localhost:3000` |
| **Staging** | Pruebas de integración, QA y builds internas EAS | Cloud Run / Staging | `https://ais-pre-*.run.app` |
| **Production** | Usuarios finales y tiendas de aplicaciones | Cloud Run / Vercel / Stores | `https://api.maxmindperformance.com` |

---

## 2. Compilación del Backend y Frontend Web

El comando estándar de compilación empaqueta la SPA web y genera el servidor ejecutable CommonJS en `dist/server.cjs`:

```bash
# Compilación completa
npm run build

# Ejecución en producción
npm start
```

---

## 3. Despliegue Móvil con EAS Build

Para compilar las aplicaciones nativas para Android e iOS:

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Generar compilación de producción para Android (Google Play AAB)
eas build --platform android --profile production

# Generar compilación de producción para iOS (App Store IPA)
eas build --platform ios --profile production

# Envío automático a las tiendas
eas submit --platform all
```

---

## 4. Gestión Segura de Secretos

- Las claves de API (como `GEMINI_API_KEY`) se inyectan a nivel de entorno en el servidor y **nunca** deben incluirse en bundles de React Native ni en el cliente web.
- Las variables para clientes móviles se configuran a través del archivo `eas.json` bajo perfiles de entorno independientes (`development`, `preview`, `production`).
