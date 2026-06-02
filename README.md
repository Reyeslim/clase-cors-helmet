# Sprint 10 · Live 2 — Frontend + Seguridad de la API

> **Objetivo de la Clase**
> Conectar un frontend HTML/JS con el backend autenticado mediante cookies httpOnly del Live 1 y proteger la API con middlewares de seguridad esenciales: CORS, Helmet y Rate Limit.

---

## 📂 Estructura del Proyecto

```text
10-live-2/
├── backend/                    # Backend del Live 1 + seguridad añadida
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.js              # CORS, Helmet y Rate Limit configurados aquí
│       ├── server.js           # Arranque del servidor HTTP
│       ├── db/database.js
│       ├── routes/auth.routes.js
│       ├── controllers/auth.controller.js
│       ├── services/auth.service.js
│       └── middlewares/
│           ├── authMiddleware.js
│           └── requireRole.js
│
└── frontend/
    ├── index.html              # Formulario de login interactivo
    └── script.js              # Lógica de peticiones fetch enviando credenciales

```

---

## Bloque 1 · Teoría: Seguridad en la API (15 min)

### ¿Qué es CORS?

CORS (_Cross-Origin Resource Sharing_) es un mecanismo de seguridad implementado por los **navegadores** que restringe los recursos compartidos entre dominios u orígenes distintos.

```text
Frontend (Origen A) → http://localhost:5500  (Servido por Live Server)
Backend  (Origen B) → http://http://localhost:3000  (Servido por Express)

```

Por defecto, el navegador bloqueará cualquier petición que el frontend intente hacer al backend por considerarla insegura, aunque esa misma petición funcione perfectamente en Postman.

- **Sin CORS configurado:** El navegador bloquea la respuesta en el frontend de forma inmediata.
- **Con CORS activo + `credentials: true`:** El navegador autoriza el cruce de datos y consiente el intercambio seguro de cookies entre ambos dominios.

💡 **Punto clave:** Postman no es un navegador, por lo que ignora las restricciones de CORS. Si una ruta funciona en Postman pero falla en tu aplicación web, la falta de configuración de CORS en el servidor es siempre la responsable.

---

### ¿Qué hace Helmet?

Helmet ayuda a proteger la aplicación Express configurando de forma automática diversas cabeceras HTTP de seguridad que mitigan vulnerabilidades habituales de la web:

| Cabecera                    | Mitiga o Protege contra                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `X-Frame-Options`           | **Clickjacking:** Inyección de capas invisibles para engañar al usuario y forzar clics maliciosos.                                         |
| `X-Content-Type-Options`    | **MIME Sniffing:** Previenen que el navegador adivine el formato de un archivo e interprete código malicioso disfrazado de texto o imagen. |
| `Strict-Transport-Security` | **Ataques de Downgrade:** Fuerza de manera estricta las conexiones cifradas seguras (HTTPS).                                               |

---

### ¿Qué hace Rate Limit?

Controla y limita el número de peticiones permitidas por una misma dirección IP en un intervalo de tiempo específico. Es crucial para:

- Detener ataques de fuerza bruta en rutas críticas como `/login`.
- Evitar el abuso involuntario o masivo que degrade el rendimiento de la API.

---

## Bloque 2 · Añadir Seguridad al Backend (15 min)

Instala los módulos de seguridad dentro del directorio del servidor:

```bash
cd backend
npm install cors helmet express-rate-limit

```

Los middlewares deben importarse e instanciarse en `src/app.js` antes de las declaraciones de tus rutas. Al trabajar con cookies `httpOnly`, la configuración de CORS requiere obligatoriamente definir el origen exacto del cliente y activar la propiedad de credenciales:

```js
// Configuración crítica de CORS para Cookies
app.use(
  cors({
    origin: "http://localhost:5500", // El origen del frontend
    credentials: true, // Permite recibir y enviar cookies
  }),
)
```

---

## Bloque 3 · Crear el Frontend (25 min)

Construiremos una interfaz minimalista utilizando HTML5 semántico y manipulación nativa del DOM a través de JavaScript con la API `fetch`.

### Ejecutar el entorno del cliente

Utilizaremos la extensión **Live Server** de VS Code para desplegar el entorno cliente bajo un origen web válido (`http://localhost:5500`):

1. Haz clic derecho sobre el archivo `frontend/index.html`.
2. Selecciona la opción **Open with Live Server**.

---

## Bloque 4 · Login desde el Navegador (15 min)

Estructura didáctica para explicar `frontend/script.js`:

1. **Función `login()**`: Realiza una petición `POST /login` enviando las credenciales estructuradas en formato JSON.
2. **Transferencia transparente**: Como el backend responde inyectando un encabezado `Set-Cookie`, el navegador **guarda automáticamente** la cookie `httpOnly` de forma interna. El código de JavaScript no manipula el token en ningún momento.
3. **Comprobación visual**: Enseñar a los alumnos a inspeccionar la cookie guardada abriendo las herramientas de desarrollador del navegador (_DevTools → Application → Cookies → http://localhost:5500_).

> **Pregunta para reflexionar con los alumnos:** _"¿Por qué en esta clase ya no usamos localStorage para almacenar el token?"_
> **Respuesta correcta:** Por razones de seguridad. `localStorage` es accesible desde cualquier script del navegador, lo que expone el token ante ataques de inyección de código (XSS). La cookie `httpOnly` es inaccesible para JavaScript y el navegador la protege de manera nativa.

---

## Bloque 5 · Acceder a Rutas Protegidas (20 min)

1. **Función `getProfile()**`: Realiza la petición `GET /profile`. Al invocar `fetch`, es indispensable incluir la opción `credentials: 'include'`. Esto le ordena al navegador adjuntar de forma automática la cookie `httpOnly` en la cabecera del mensaje.
2. **Función `getAdmin()**`: Realiza un `GET /admin`. Si se accede autenticado como `ana@example.com`, el backend interceptará la petición mediante el middleware `requireRole`devolviendo un estado`403 Forbidden`.
3. **Validación de privilegios**: Iniciar sesión con la cuenta `admin@example.com` y verificar que ahora el acceso a la ruta restringida devuelve un código `200 OK`.
4. **Comprobación de anonimato**: Eliminar manualmente la cookie desde la pestaña _Application_ y recargar la aplicación para constatar que el servidor deniega el acceso con un error `401 Unauthorized`.

---

## ✅ Resumen Final

- [ ] Entiendo el problema de CORS al conectar aplicaciones distribuidas y por qué requiere credenciales explícitas para las cookies.
- [ ] Sé cómo integrar Helmet para blindar las cabeceras de respuesta HTTP en Express.
- [ ] Comprendo cómo mitigar ataques de fuerza bruta usando `express-rate-limit`.
- [ ] Sé cómo configurar `fetch()` con la opción `credentials: 'include'` para transmitir cookies.
- [ ] Comprendo por qué las cookies `httpOnly` ofrecen una capa superior de seguridad contra XSS comparadas con `localStorage`.

---
