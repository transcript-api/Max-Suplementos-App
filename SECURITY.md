# MAXFORM — Arquitectura de Seguridad y Anti-Explotación

Este documento detalla las defensas técnicas implementadas para proteger la integridad de datos, cuentas de usuario y el motor de gamificación de MAXFORM.

---

## 1. Aislamiento Absoluto de Usuarios (Tenancy)

- Todos los registros de progreso, ingestas de comida, conversaciones con MAX AI y suplementos están asociados al `userId` del atleta.
- Ningún usuario puede invocar endpoints con el `userId` de otro atleta para alterar su historial o leer sus métricas privadas.
- Las consultas en base de datos están protegidas por Row-Level Security (RLS).

---

## 2. Prevención de Explotación de XP y Proteína

En versiones previas, se identificó el riesgo de spam clicks en el botón de registro de proteína para acumular XP artificialmente. Las defensas actuales son:
1. **Límite por Ingesta Individual**: Máximo 80g de proteína por registro individual.
2. **Techo Fisiológico Diario**: Máximo 350g acumulados por día por atleta.
3. **Control de Frecuencia (Rate Limiting)**: Mínimo 300ms entre taps consecutivos.
4. **Idempotencia de Objetivos**: Un objetivo completado en una fecha determinada no vuelve a sumar XP en ese mismo día, retornando `{ alreadyCompleted: true, xpAwarded: 0 }`.

---

## 3. Seguridad de Cupones y Suscripciones Pro

- **Validación Estrictamente en Servidor**: El frontend nunca puede activar `isPremium = true` de forma autónoma.
- **Base de Datos Autoritaria**: El canje de tickets físicos de compra (`MAXPRO30`, `TICKET-8849`, etc.) valida fecha de caducidad, límite de canjes máximos y unicidad por cuenta.

---

## 4. Protección de Credenciales y LLM

- La clave de API de Google Gen AI (`GEMINI_API_KEY`) reside **exclusivamente** en las variables de entorno del servidor Express.
- Las imágenes enviadas para análisis visual de comidas se procesan en el backend y se transmiten al modelo sin exponer cabeceras privadas al navegador o dispositivo móvil.
