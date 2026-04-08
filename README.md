# video-converter-fe

Frontend de **Web-Utils** — plataforma de utilidades web construida con Next.js 16.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.1.7 | Framework (App Router) |
| React | ^19 | UI |
| TypeScript | ^5.9 | Tipado estático |
| Tailwind CSS | ^4 | Estilos |
| Shadcn UI | ^4.1 | Componentes accesibles |
| Socket.io Client | ^4.8 | WebSockets |
| Axios | ^1.13 | HTTP |
| driver.js | ^1.4 | Tours interactivos |
| next-themes | ^0.4 | Modo oscuro/claro |
| media-chrome | ^4.18 | Reproductor de audio |

---

## Estructura

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fuentes, ThemeProvider)
│   ├── page.tsx                # Página raíz "/"
│   └── d/                      # Dashboard (con sidebar)
│       ├── layout.tsx          # Layout con AppSidebar
│       ├── page.tsx            # Overview con cards de utilidades
│       ├── converter/
│       │   └── page.tsx        # Convertidor de video
│       └── music/
│           └── page.tsx        # Búsqueda de música
├── shared/
│   ├── components/
│   │   ├── app-sidebar.tsx     # Sidebar + tour driver.js
│   │   ├── converter-dropzone.tsx
│   │   ├── nav-main.tsx        # Nav colapsable
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   ├── use-socket.ts       # WebSocket connection
│   │   ├── use-video-converter.ts
│   │   └── use-music-search.ts # Búsqueda de música + paginación
│   ├── lib/
│   │   └── features.ts         # Parser de NEXT_PUBLIC_FEATURES_SETTINGS
│   └── shadcn/                 # Componentes Shadcn UI
├── components/
│   └── ai-elements/
│       └── audio-player.tsx    # Reproductor media-chrome
└── styles/
    └── globals.css
```

---

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/d/` | Overview con tarjetas de utilidades |
| `/d/converter` | Convertidor MOV → MP4 |
| `/d/music` | Búsqueda de música (Jamendo) |

---

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL base del backend |
| `NEXT_PUBLIC_FEATURES_SETTINGS` | `{"feats":{...}}` | Config de features (sin `keys`) |

---

## Scripts

```bash
npm run dev        # Dev con Turbopack
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linting
npm run format     # Prettier
npm run typecheck  # Verificación TypeScript
```

---

## Funcionalidades

### Convertidor de Video
- Drag & drop o file picker (solo `.mov`)
- Upload con barra de progreso por archivo
- Conversión en tiempo real vía Socket.io
- Descarga individual o por lote
- Estado: `IDLE → UPLOADING → CONVERTING → FINISHED`

### Búsqueda de Música
- Búsqueda por término, género, orden y paginación
- Lista de resultados normalizados desde Jamendo
- Preview de audio en línea (proxy BE, no expone CDN)
- Descarga via enlace directo
- Caché en el servidor (10 min TTL)
