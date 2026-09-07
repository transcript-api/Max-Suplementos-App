# MAXFORM — Catálogo de APIs y Contratos de Servicio

Todos los endpoints respetan el protocolo HTTPS, respuestas en formato JSON estructurado y códigos de estado HTTP estándar.

---

## 1. Atleta y Perfil

### `GET /api/me`
Retorna el estado autoritario del usuario autenticado.
- **Query Params**: `userId` (string)
- **Respuesta 200**:
  ```json
  {
    "userId": "usr_99812",
    "xp": 250,
    "levelNumber": 1,
    "levelName": "Básico",
    "timezone": "America/Argentina/Buenos_Aires",
    "serverTime": "2026-09-06T00:38:20.000Z",
    "canonicalDate": "2026-09-06",
    "membership": "pro"
  }
  ```

---

## 2. Dashboard y Gamificación

### `GET /api/dashboard`
Obtiene el resumen del día actual calculado por el servidor.
- **Respuesta 200**:
  ```json
  {
    "date": "2026-09-06",
    "totalXp": 250,
    "completedObjectives": ["entrenamiento", "agua"],
    "formPercentage": 33,
    "nutrition": { "protein": 45, "targetProtein": 150 }
  }
  ```

### `POST /api/objectives/complete` (o `POST /api/objectives/:id/complete`)
Completa un objetivo diario de manera idempotente adjudicando XP.
- **Body**:
  ```json
  {
    "userId": "usr_99812",
    "objectiveId": "entrenamiento",
    "date": "2026-09-06"
  }
  ```
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "alreadyCompleted": false,
    "xpAwarded": 25,
    "totalXp": 275,
    "levelNumber": 1,
    "levelName": "Básico"
  }
  ```

### `POST /api/xp/log-protein`
Registra ingesta de proteína con protección anti-exploit (máximo 80g por registro individual y techo diario de 350g).
- **Body**: `{ "userId": "usr_99812", "amount": 30, "targetProtein": 150 }`

---

## 3. Inteligencia Artificial

### `POST /api/ai/chat`
Conversación contextual con el coach inteligente MAX AI.
- **Body**: `{ "message": "¿Cómo llego a 150g de proteína?", "context": { ... } }`

### `POST /api/ai/refrigerator`
Analiza la lista de ingredientes disponibles en la heladera y sugiere opciones hiperproteicas.
- **Body**: `{ "ingredients": ["huevos", "pollo", "arroz"], "missingProtein": 30 }`

### `POST /api/ai/analyze-food`
Analiza una imagen en base64 o descripción textual estimando calorías, proteínas, carbohidratos y grasas.

---

## 4. Cupones y Suscripciones

### `POST /api/coupons/redeem` (o `POST /api/redeem-coupon`)
Valida y canjea de forma atómica un código de ticket físico de MAX Suplementos o cupón promocional.
- **Body**: `{ "code": "MAXPRO30", "userEmail": "atleta@correo.com" }`
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "¡Excelente! Se activaron 30 días de MAXMIND Pro para tu cuenta.",
    "plan": "pro",
    "durationDays": 30
  }
  ```

---

## 5. Automatización y Webhooks

### `POST /api/webhooks/trigger`
Despacha eventos a n8n para flujos de retención, avisos por WhatsApp y alertas de reposición de suplementos.
- **Body**: `{ "event": "SUPPLEMENT_REORDER_ALERT", "athleteName": "Valentín", "phone": "+54911223344" }`
