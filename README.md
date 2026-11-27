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
`http://localhost:3000` (ver `vite.config.ts`); en Docker y Kubernetes lo hace el nginx del front hacia `bff:3000`. Por eso ninguna ruta del front puede empezar con `/graphql` ni `/archivos`.

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

La imagen compila con Node y sirve `dist/` con nginx sin root, en el puerto **8080**. nginx también reenvía
`/graphql` y `/archivos` al BFF en `bff:3000`, así que no hace falta ingress ni CORS.

```bash
docker build -t tutormatch-front .
# Con el BFF corriendo en tu máquina (npm run start:dev en su repo):
docker run --rm -p 8080:8080 --add-host bff:host-gateway tutormatch-front   # http://localhost:8080
```

- nginx resuelve `bff` al arrancar: si ese nombre no existe, no arranca. En local, `--add-host bff:host-gateway`
  lo apunta al BFF de tu máquina; en Kubernetes es el Service `bff`.
- Recargar una ruta del front (por ejemplo `/alumno/tutorias`) devuelve `index.html`, no 404.
- `client_max_body_size 11m` deja pasar archivos de hasta 10 MB (el BFF valida el límite), y
  `proxy_read_timeout 150s` da tiempo al agente, que puede tardar hasta unos 2 minutos (`proxy-bff.inc`).
- `GET /salud` responde `ok`, para el healthcheck y las sondas de Kubernetes.
- Los tipos de `src/gql/` están en el repo, así que el build no necesita el BFF.

## Kubernetes

`k8s/front.yaml` tiene el Deployment (2 réplicas) y un Service `LoadBalancer`, que Docker Desktop publica en
`http://localhost`:

```bash
docker build -t tutormatch-front:latest .
kubectl apply -f k8s/front.yaml   # después de que exista el Service bff
kubectl get svc front             # EXTERNAL-IP localhost, puerto 80
```

La imagen se usa en local (`imagePullPolicy: IfNotPresent`): Docker Desktop la comparte con su Kubernetes.

## CI

`.github/workflows/ci.yml` corre en cada push a `main` y en cada pull request:

1. `npm ci` y `npm run build` (revisa tipos y compila).
2. `npm run test:cobertura` (mínimo 60 %); el reporte queda como artefacto `cobertura`.
3. Construye la imagen Docker y, con un BFF falso llamado `bff` en la misma red, comprueba `/salud`, que una ruta
   del front devuelve `index.html` y que `/graphql` y `/archivos` llegan al BFF.

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
