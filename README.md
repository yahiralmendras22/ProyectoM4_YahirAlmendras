# ✅ MateCode Tasks

Aplicación SPA de gestión de tareas desarrollada para **MateCode**, una startup que construye aplicaciones web para pequeñas empresas. Permite a los usuarios registrarse, iniciar sesión, y gestionar sus tareas diarias (crear, editar, completar, eliminar) de forma persistente y accesible desde cualquier dispositivo, con la posibilidad de recibir un resumen de sus tareas por email.

🔗 **URL de producción:** https://proyecto-m4-yahir-almendras.vercel.app/

---

## 🛠️ Stack

- ⚛️ **Frontend:** React + TypeScript (Vite)
- 🔥 **Backend as a Service:** Firebase (Authentication + Firestore)
- 📧 **Notificaciones por email:** AWS SES, invocado a través de una Vercel Function
- ▲ **Deploy:** Vercel
- 🧪 **Testing:** Vitest + React Testing Library

---

## 🧩 Tecnologías utilizadas

**Core**
- ⚛️ [React 19](https://react.dev/) — librería de UI
- 🔷 [TypeScript](https://www.typescriptlang.org/) — tipado estático
- ⚡ [Vite](https://vite.dev/) — build tool y dev server
- 🧭 [React Router](https://reactrouter.com/) (`react-router-dom`) — routing de la SPA

**Backend as a Service**
- 🔥 [Firebase Authentication](https://firebase.google.com/docs/auth) — registro/login con email-password y Google
- 📚 [Cloud Firestore](https://firebase.google.com/docs/firestore) — base de datos NoSQL en tiempo real (`onSnapshot`)

**Email**
- 📧 [AWS SES](https://aws.amazon.com/ses/) (`@aws-sdk/client-ses`) — envío de emails
- ▲ [Vercel Functions](https://vercel.com/docs/functions) (`@vercel/node`) — función serverless intermediaria

**Testing**
- 🧪 [Vitest](https://vitest.dev/) — test runner
- 🧬 [React Testing Library](https://testing-library.com/react) (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`) — testing de componentes
- 🌐 [jsdom](https://github.com/jsdom/jsdom) — entorno de DOM simulado para los tests

**Deploy e infraestructura**
- ▲ [Vercel](https://vercel.com/) — hosting, deploy continuo y funciones serverless
- 🐙 [GitHub](https://github.com/) — control de versiones

**Herramientas de desarrollo**
- 🧹 [oxlint](https://oxc.rs/docs/guide/usage/linter.html) — linter
- 🖋️ [Antigravity IDE](https://antigravity.google/) (con Gemini integrado) — editor y asistencia de código
- 💬 [Claude](https://claude.ai/) — planificación, debugging y revisión de código en el proceso de desarrollo

---

## 🏗️ Decisiones arquitectónicas

- 📂 **Estructura por capas** dentro de `src/`: `pages` (vistas), `components` (UI reutilizable), `features` (lógica de dominio, como autenticación), `services` (integraciones externas: Firebase, tasksService), `routes` (routing y protección de rutas), `types` (modelos de datos), `hooks` (lógica de estado reutilizable), `utils` (funciones puras).
- 🔐 **Contexto de autenticación centralizado** (`src/features/auth/AuthContext.tsx`): expone `user`, `loading`, `signIn`, `signUp`, `signInWithGoogle` y `logout` a través de un hook `useAuth()`, basado en el patrón Observer de Firebase (`onAuthStateChanged`) con cleanup correcto en `useEffect` para evitar memory leaks.
- 🛡️ **Rutas protegidas** (`src/routes/RequireAuth.tsx`): envuelve las rutas privadas (`/tasks`, `/calendar`) y redirige a `/login` si no hay sesión activa, manejando explícitamente el estado de carga para evitar redirecciones prematuras.
- 🪝 **Custom hook `useTasks`** (`src/hooks/useTasks.ts`): encapsula la suscripción en tiempo real a Firestore (`onSnapshot`) con su cleanup, reutilizado tanto en `Tasks.tsx` como en `Calendar.tsx` sin duplicar lógica.
- 📋 **Servicio de tareas separado** (`src/services/tasksService.ts`): toda la lógica de Firestore (crear, actualizar, eliminar, suscripción en tiempo real) vive acá, desacoplada de los componentes de UI.
- 📨 **Envío de email desacoplado del frontend**: el frontend nunca llama a AWS SES directamente. Llama a una Vercel Function (`api/send-email.ts`) que valida los datos recibidos y hace la llamada a AWS con credenciales que solo existen en el servidor.
- 🔒 **Reglas de seguridad de Firestore**: cada documento de la colección `tasks` solo puede ser leído, creado, actualizado o eliminado por el usuario dueño (comparando `request.auth.uid` contra el campo `userId` del documento).
- 🧭 **SPA rewrites en Vercel** (`vercel.json`): todas las rutas redirigen a `index.html` para que React Router pueda manejar la navegación del lado del cliente, incluso al refrescar la página en una ruta como `/tasks`.

---

## 🚀 Instalación

```bash
git clone https://github.com/yahiralmendras22/ProyectoM4_YahirAlmendras.git
cd ProyectoM4_YahirAlmendras
npm install
```

Creá un archivo `.env` en la raíz (ver sección de variables de entorno más abajo, o copiá `.env.example` como base).

Para correr en desarrollo:

```bash
npm run dev
```

Para correr los tests:

```bash
npm run test
```

Para build de producción:

```bash
npm run build
```

---

## 🔑 Variables de entorno

Ver `.env.example` para la plantilla completa. Ninguna de estas variables se sube al repositorio (`.env` está en `.gitignore`).

**🌐 Frontend (Firebase)** — requieren el prefijo `VITE_` para ser accesibles desde el navegador:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**🖥️ Backend / Vercel Function (AWS SES)** — sin prefijo, solo accesibles desde el servidor:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_SES_FROM_EMAIL=
```

En Vercel, estas mismas variables se configuran en **Settings → Environment Variables**, y requieren un redeploy manual para tomar efecto en un deploy ya existente.

---

## 📬 Flujo de envío de emails

1. 🖱️ El usuario hace click en "Enviar resumen por email" desde `/tasks`.
2. 📦 El frontend arma un array con sus tareas actuales (`título`, `descripción`, `completed`) y hace un `POST` a `/api/send-email` con `{ recipient, tasks }`.
3. ⚙️ La Vercel Function (`api/send-email.ts`):
   - Valida que el método sea `POST`.
   - Valida el formato del email destinatario y la forma de cada tarea (rechaza con `400` si algo no es válido).
   - Arma el cuerpo del email (HTML con formato + texto plano) usando los datos recibidos, escapando cualquier contenido para evitar inyección de HTML.
   - Llama a AWS SES (`SendEmailCommand`) usando las credenciales del entorno del servidor.
4. ✅❌ El frontend muestra un estado de éxito o error según la respuesta.

> ⚠️ **Nota:** AWS SES está en modo sandbox, por lo que solo puede enviar emails a direcciones verificadas en la consola de SES. Además, al enviarse desde una dirección de Gmail sin dominio propio con SPF/DKIM/DMARC configurados, los emails suelen caer en la carpeta de spam del destinatario — es una limitación esperable de este entorno de pruebas, no un error del flujo de envío.

---

## 🧪 Testing

Los tests están en `tests/` y usan Vitest + React Testing Library. Los servicios externos (Firebase Auth, Firestore) están **mockeados** en todos los tests — ninguno hace llamadas reales.

- 🔹 `tests/validation.test.ts`: test unitario de la función pura `passwordsMatch`.
- 🔹 `tests/Login.test.tsx`: renderizado del formulario, login exitoso (navega a `/tasks`), login fallido (muestra el mensaje de error correspondiente al código de Firebase).
- 🔹 `tests/Tasks.test.tsx`: estado vacío, validación de título requerido (caso borde), creación exitosa de una tarea.

---

## 🤖 Uso de IA en el desarrollo

Combiné dos herramientas de IA a lo largo del proyecto, con roles distintos:

- 💬 **Claude**, en modo conversacional, para ir paso a paso: planificar cada hito antes de escribir código, revisar y corregir el código que yo mismo generaba con la otra herramienta, y para debuggear errores reales que aparecían en el navegador o la terminal (por ejemplo, un bug de bucle infinito en un test causado por un mock que regeneraba un objeto en cada render, o un bug de regex mal escrito en la validación de email del backend).
- ✨ **Gemini** (integrado en el editor, Antigravity IDE), para generar código puntual a partir de prompts específicos que armé con ayuda de Claude — por ejemplo, el sistema de diseño CSS completo y el componente de calendario mensual — y para resolver algunos errores de sintaxis directamente sobre el código.

### 🔍 Patrones que encontré efectivos

- ❓ Pedir explicaciones de *por qué* funciona algo, no solo el código — por ejemplo, entender por qué `onSnapshot` necesita un cleanup en `useEffect`, o por qué las variables de entorno de AWS no llevan el prefijo `VITE_` mientras que las de Firebase sí.
- 🐛 Cuando algo no funcionaba, pegar el error exacto de la consola/terminal en vez de describirlo de memoria — varias veces el problema real (por ejemplo, un archivo con cambios sin guardar, o un mock que rompía por referencia) no era el que yo pensaba a primera vista.
- ✅ Escribir tests para confirmar que un fix realmente funcionaba, en vez de asumirlo por lectura del código.

### 🧠 Decisiones que tomé críticamente en vez de aceptar la primera sugerencia

- 🎨 Descarté Tailwind CSS después de instalarlo, porque preferí mantener todo el CSS en un único archivo (`index.css`) para reducir la superficie de error, ya que tuve varios problemas de sincronización de archivos durante el desarrollo.
- 🔄 Cuando una IA generó un backend de email con un contrato distinto al que ya tenía en el frontend, revisé y adapté ambos lados en vez de descartar el código nuevo, porque su versión validaba mejor los datos de entrada y generaba HTML.
- 🔧 Encontré y corregí manualmente un bug de lógica invertida en la validación de "las contraseñas coinciden" en el registro, que había pasado desapercibido en una revisión rápida.
- 🪝 Extraje la lógica de suscripción a Firestore, que estaba duplicada en dos componentes, a un custom hook (`useTasks`) propio en lugar de dejar la duplicación.

---

## 📁 Estructura del proyecto

```
api/
└─ send-email.ts       # Vercel Function (AWS SES)
src/
├─ assets/
│  └─ mate.svg          # Ilustración propia
├─ components/
│  └─ Navbar.tsx
├─ features/
│  └─ auth/
│     └─ AuthContext.tsx
├─ hooks/
│  └─ useTasks.ts
├─ pages/
│  ├─ Calendar.tsx
│  ├─ Home.tsx
│  ├─ Login.tsx
│  ├─ Register.tsx
│  └─ Tasks.tsx
├─ routes/
│  ├─ AppRoutes.tsx
│  └─ RequireAuth.tsx
├─ services/
│  ├─ firebase.ts
│  └─ tasksService.ts
├─ types/
│  └─ task.ts
├─ utils/
│  ├─ authErrors.ts
│  └─ validation.ts
├─ App.tsx
├─ index.css
└─ main.tsx
tests/
├─ setup.ts
├─ validation.test.ts
├─ Login.test.tsx
└─ Tasks.test.tsx
vercel.json
```