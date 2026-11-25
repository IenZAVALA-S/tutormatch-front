# tutormatch-front

Frontend de **TutorMatch**: estudiantes reservan tutorías con otros estudiantes que aprobaron el ramo.
React + Vite + TypeScript, Apollo Client (GraphQL), Tailwind CSS y GraphQL Codegen.

El contexto y las reglas están en [`CLAUDE.md`](CLAUDE.md); el flujo de pantallas, en [`docs/flujo.md`](docs/flujo.md).

## Requisitos

- Node 20 o superior.
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

## Tipos de GraphQL (codegen)

Los tipos se generan desde el esquema del BFF; no se escriben a mano.

```bash
npm run codegen    # con el BFF corriendo en localhost:3000
```

También se puede generar desde el `schema.gql` del BFF sin levantarlo:

```bash
CODEGEN_SCHEMA=../BFF-TutorMatch/src/schema.gql npm run codegen
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
  gql/                  Generado por codegen
```

## Rutas

| Ruta | Pantalla |
|---|---|
| `/login`, `/registro` | Login y registro |
| `/inscripcion-tutor` | Formulario de ramos para inscribirse como tutor |
| `/tutor` | Calendario (y `archivos`, `resenas`, `perfil`) |
| `/alumno` | Reservas (y `tutorias`, `archivos`, `avisos`, `resenas`, `agente`, `perfil`) |
