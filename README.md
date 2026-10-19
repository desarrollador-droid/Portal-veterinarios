# VetLab - Espacio de Trabajo Limpio (Full-Stack JavaScript)

Espacio de trabajo configurado desde cero con la misma estructura modular que `localweb` para el Frontend y una arquitectura profesional por capas para el Backend.

Ambos entornos trabajan con **JavaScript moderno (ES Modules)** y tienen sus dependencias instaladas y listas para usar.

---

## 📂 Estructura de Carpetas

### 🌐 Frontend (`/frontend`) - React 19 + Vite + Tailwind CSS + MUI
Estructura idéntica a la arquitectura modular de `localweb`, con carpetas limpias listas para albergar el código:

```text
frontend/
├── public/                       # Archivos estáticos públicos (imágenes, iconos, robots.txt, sitemaps)
├── src/
│   ├── assets/                   # Archivos estáticos importables (JSONs de datos, vectores, logos)
│   ├── components/               # Componentes reutilizables o vistas generales de la aplicación
│   ├── features/                 # Módulos organizados por dominio / funcionalidad
│   │   ├── auth/                 # Módulo de Autenticación
│   │   │   ├── components/       # Componentes específicos de auth (ej. LoginForm, RegisterModal)
│   │   │   ├── hooks/            # Hooks específicos de auth (ej. useAuth)
│   │   │   ├── pages/            # Vistas/páginas de auth (ej. LoginPage, ForgotPasswordPage)
│   │   │   ├── services/         # Llamadas API del módulo auth (ej. authApi.js)
│   │   │   └── slices/           # Estado global / slices (ej. authSlice.js)
│   │   └── dashboard/            # Módulo de Panel / Dashboard
│   │       ├── components/       # Componentes del dashboard (tablas, cards, gráficos)
│   │       ├── hooks/            # Hooks propios del dashboard
│   │       ├── pages/            # Páginas del dashboard
│   │       ├── services/         # Peticiones al backend de datos del dashboard
│   │       └── slices/           # Manejo de estado del dashboard
│   ├── shared/                   # Código y componentes compartidos transversalmente
│   │   ├── components/           # Componentes UI globales (Header, Footer, Navbar, Buttons)
│   │   ├── contexts/             # Contextos de React (ThemeContext, NotificationContext)
│   │   ├── hooks/                # Custom hooks genéricos (useDebounce, useWindowSize)
│   │   ├── services/             # Configuración base de clientes HTTP (instancia Axios)
│   │   ├── styles/               # Estilos globales o temas personalizados
│   │   └── utils/                # Funciones de ayuda compartidas (formateadores, validadores)
│   ├── utils/                    # Utilidades auxiliares generales del proyecto
│   ├── App.jsx                   # Componente raíz y definición de rutas principales
│   └── main.jsx                  # Punto de entrada de React (montaje en el DOM)
├── index.html                    # Plantilla HTML base de Vite
├── package.json                  # Dependencias de React, Vite, MUI, Tailwind, Formik, Yup, Axios
└── vite.config.js                # Configuración de Vite con plugins de React y Tailwind
```

---

### ⚙️ Backend (`/backend`) - Node.js + Express
Estructura por capas (Clean Architecture / MVC modular):

```text
backend/
├── src/
│   ├── config/                   # Configuración del entorno y conexión a bases de datos (env.js, db.js)
│   ├── controllers/              # Controladores que reciben req y envían res
│   ├── middlewares/              # Interceptores (authMiddleware, errorHandler, validaciones)
│   ├── models/                   # Modelos de datos / esquemas (MongoDB, PostgreSQL, MySQL)
│   ├── routes/                   # Definición de rutas y endpoints de la API REST
│   ├── services/                 # Lógica de negocio pura independiente de Express
│   ├── utils/                    # Funciones utilitarias, constantes y respuestas estandarizadas
│   └── server.js                 # Punto de entrada y levantamiento del servidor Express
├── .env                          # Variables de entorno locales (PORT, DB_URL, etc.)
├── .env.example                  # Plantilla de variables de entorno
└── package.json                  # Dependencias de Express, CORS, Dotenv, Morgan
```

---

## 🚀 Comandos de Ejecución

Desde la raíz (`vetlab`):

- **Levantar Frontend**:
  ```bash
  npm run dev:frontend
  ```
  *(Disponible en http://localhost:5173)*

- **Levantar Backend**:
  ```bash
  npm run dev:backend
  ```
  *(Disponible en http://localhost:5000)*
