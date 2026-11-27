# tutormatch-front

Frontend de **TutorMatch**: estudiantes reservan tutorías con otros estudiantes que aprobaron el ramo.
React + Vite + TypeScript, Apollo Client (GraphQL), Tailwind CSS y GraphQL Codegen.

El contexto y las reglas están en [`CLAUDE.md`](CLAUDE.md); el flujo de pantallas, en [`docs/flujo.md`](docs/flujo.md).

## Requisitos

- Node 22 (la CI usa 22; Vite 8 pide 20.19 o superior).
- El BFF ([`dazztyn/BFF-TutorMatch`](https://github.com/dazztyn/BFF-TutorMatch)) corriendo en `http://localhost:3000`.
  En su repo, `npm run start:dev` sin variables usa mocks en memoria (los datos se borran al reiniciarlo).

## Levantarlo

```bash
npm install
npm run dev        # http://localhost:5173
```

El front solo usa rutas relativas (`/graphql`, `/archivos`). En desarrollo, el proxy de Vite las reenvía a
`http://localhost:3000` (ver `vite.config.ts`); en Kubernetes, el ingress publica el front y el BFF en el mismo
dominio. Por eso ninguna ruta del front puede empezar con `/graphql` ni `/archivos`.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con proxy al BFF |
| `npm run build` | Revisa tipos y genera `dist/` |
| `npm run preview` | Sirve `dist/` para probar el build |
| `npm run codegen` | Genera los tipos de GraphQL en `src/gql/` |
| `npm test` | Corre los tests una vez |
| `npm run test:watch` | Tests en modo observación, mientras se programa |
| `npm run test:cobertura` | Tests con cobertura; falla si baja del 60 % (reporte en `coverage/index.html`) |

## Tests

Vitest con jsdom y Testing Library. Los tests están junto al código (`*.test.ts(x)`):

- `utils/`, `auth/`, `apollo/`: conversión de bloques con `America/Santiago`, validación de ramos, archivos con
  `fetch` y blob, sesión, token en `Authorization` y salida ante `UNAUTHENTICATED`.
- `components/` y `layout/`: componentes reutilizables y topbar.
- `pages/`: cada pantalla con Apollo de prueba (`MockedProvider`) y la fecha fijada, para que no dependan del día.

Las ayudas comunes (sesión de prueba, mocks de Apollo, router en memoria) están en `src/test/utilidades.tsx`.
La cobertura excluye solo lo generado por codegen (`src/gql/`) y `src/main.tsx`.

## Docker

La imagen compila con Node y sirve `dist/` con nginx sin root, en el puerto **8080**:

```bash
docker build -t tutormatch-front .
docker run --rm -p 8080:8080 tutormatch-front   # http://localhost:8080
```

- `nginx.conf` devuelve `index.html` para cualquier ruta que no sea un archivo, así recargar `/alumno/tutorias`
  no da 404.
- `/graphql` y `/archivos` **no** los sirve nginx: en Kubernetes el ingress los manda al BFF en el mismo dominio.
  Si llegan al contenedor, responde 404 (indica que el ingress está mal configurado). Por eso, la imagen sola
  muestra la app pero no puede iniciar sesión sin el ingress o un proxy delante.
- `GET /salud` responde `ok`, para el healthcheck y las sondas de Kubernetes.
- Los tipos de `src/gql/` están en el repo, así que el build no necesita el BFF.

## CI

`.github/workflows/ci.yml` corre en cada push a `main` y en cada pull request:

1. `npm ci` y `npm run build` (revisa tipos y compila).
2. `npm run test:cobertura` (mínimo 60 %); el reporte queda como artefacto `cobertura`.
3. Construye la imagen Docker y comprueba que responde `/salud`, que una ruta del front devuelve `index.html` y
   que `/graphql` da 404.

## Tipos de GraphQL (codegen)

Los tipos se generan desde el esquema del BFF; no se escriben a mano.

```bash
npm run codegen    # con el BFF corriendo en localhost:3000
```

También se puede generar desde el `schema.gql` del BFF sin levantarlo:

```bash
CODEGEN_SCHEMA=../BFF-TutorMatch/schema.gql npm run codegen
```

Las operaciones se escriben con `graphql()` de `src/gql` (preset `client`), y codegen genera sus tipos.
Volver a correrlo cada vez que cambie el esquema o una operación.

## Estructura

```
src/
  apollo/cliente.ts     Apollo Client: token en Authorization y salida al login ante UNAUTHENTICATED
  auth/                 Sesión (token + usuario en localStorage), hook y rutas protegidas
  layout/               Topbar y layouts de portal y de páginas públicas
  pages/                Login, registro, inscripción como tutor, portal de tutor y portal de alumno
  utils/bloques.ts      Bloques A–F y conversión hora de Chile ↔ UTC (America/Santiago)
  utils/archivos.ts     Subir y bajar archivos de /archivos con fetch y blob
  hooks/                Hooks compartidos (asignatura recordada)
  components/           Componentes reutilizables (selector, modal, toasts, estrellas…)
  test/                 Preparación y ayudas de los tests
  gql/                  Generado por codegen
```

## Rutas

| Ruta | Pantalla |
|---|---|
| `/login`, `/registro` | Login y registro |
| `/inscripcion-tutor` | Formulario de ramos para inscribirse como tutor |
| `/tutor` | Calendario (y `archivos`, `resenas`, `perfil`) |
| `/alumno` | Reservas (y `tutorias`, `archivos`, `avisos`, `resenas`, `agente`, `perfil`) |
