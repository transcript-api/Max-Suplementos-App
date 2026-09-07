# MAXFORM — Arquitectura y Guía de la Aplicación Móvil

MAXFORM sitúa a la experiencia móvil (Android e iOS) como el producto central de la plataforma, utilizando **React Native**, **Expo** y **TypeScript**.

---

## 1. Configuración de Plataforma (`app.json`)

- **Android Package**: `com.maxmind.performance`
- **iOS Bundle Identifier**: `com.maxmind.performance`
- **Esquema Deep Linking**: `maxform://`
- **Iconos y Splash**: Assets de alta densidad ubicados en `public/icon-192.png` y `public/icon-512.png` con paleta oscura `#0B1220`.

---

## 2. Permisos Nativos y Políticas de Privacidad

### Android
- `CAMERA`: Escaneo inteligente de comidas e ingredientes de heladera.
- `POST_NOTIFICATIONS`: Recordatorios de racha diaria y alertas de reposición de suplementos.
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`: Almacenamiento local seguro de caché fotográfica.

### iOS (`infoPlist`)
- `NSCameraUsageDescription`: Explicación contextual para el usuario al abrir la cámara de platos.
- `NSPhotoLibraryUsageDescription`: Selección de imágenes de progreso o ingredientes.
- `NSHealthShareUsageDescription` & `NSHealthUpdateUsageDescription`: Sincronización con Apple Health para calorías, pasos y agua.

---

## 3. Navegación Principal

La interfaz táctil prioriza una navegación inferior rápida de 5 accesos directos:
1. **Inicio**: Form diaria, anillo de porcentaje, acceso rápido a proteína y suplementos.
2. **Progreso**: Historial real (Tú vs. Tú), peso corporal y desglose de constancia.
3. **MAX AI**: Coach deportivo y asistente para calcular comidas restantes.
4. **Retos**: Desafíos semanales y tabla de liga.
5. **Perfil**: Configuración biométrica, cupones de MAX Suplementos y preferencias.

---

## 4. Estrategia Offline y Sincronización

- Las acciones offline (como marcar un suplemento o registrar agua) se guardan en una cola local con clave de idempotencia única.
- Al restablecerse la conectividad, el cliente isomórfico (`MaxFormApiClient`) envía las mutaciones al backend sin duplicar adjudicaciones de XP.
