# TutorMatch · Frontend

Frontend de **TutorMatch**: plataforma donde estudiantes reservan tutorías con otros estudiantes (tutores) que aprobaron el ramo. Proyecto 2 del curso de Arquitectura de Sistemas; microservicios en Kubernetes.

El flujo de pantallas acordado está en [`docs/flujo.md`](docs/flujo.md). Leerlo antes de construir o cambiar una pantalla.

## Stack

- React + Vite + TypeScript.
- Apollo Client para GraphQL.
- Tailwind CSS.
- Tipos generados desde el esquema del BFF con GraphQL Codegen (no escribirlos a mano).

## Arquitectura: el front solo habla con el BFF

```
Front ──GraphQL──▶ BFF ──gRPC──▶ Usuarios, Sesiones, Material
      ──REST────▶ /archivos
```

- **Nunca** llamar a Usuarios, Sesiones ni Material directamente.
- BFF: repo `dazztyn/BFF-TutorMatch` (NestJS + GraphQL, a cargo de Vicente). Su esquema completo está en su `schema.gql`, que se genera desde el código.
- **Rutas relativas siempre** (`/graphql`, `/archivos`), nunca `http://localhost:3000`:
  - En desarrollo, el proxy de Vite reenvía `/graphql` y `/archivos` a `http://localhost:3000`.
  - En Docker y Kubernetes, el nginx del front (`nginx.conf`) sirve el build y reenvía `/graphql` y `/archivos` al Service `bff:3000`. No hay ingress: el navegador ve un solo dominio.
  - Por eso el BFF no habilita CORS. Si el front se publicara en otro dominio, habría que pedírselo a Vicente.

### Levantar el BFF para desarrollar

En el repo del BFF, `npm run start:dev` sin variables usa **mocks en memoria** que aplican las mismas reglas que los servicios reales. No hace falta levantar nada más. Los datos se borran cada vez que el BFF se reinicia. GraphiQL queda en `http://localhost:3000/graphql`.

## Autenticación

- `registro(input: { nombre, email, password })` y `login(input: { email, password })` devuelven `{ token, usuario }`.
- El token va en `Authorization: Bearer <token>` en todo lo que lo pida (GraphQL y `/archivos`).
- Dura **24 horas**. Al vencer, todo responde `UNAUTHENTICATED`: volver al login.
- El JWT no lleva rol. `usuario.esTutor` (verdadero si tiene al menos un ramo activo) **solo decide qué portal se muestra**; los permisos los validan los servicios.
- Sin token: `registro`, `login`, `ramos`, `tutoresPorRamo`, `disponibilidad`, `buscarDisponibilidad`. Todo lo demás lo exige, incluidos `sesiones` y `sesion`.
- `sesiones` solo devuelve sesiones del usuario logueado:
  - Con `tutorId` (portal del tutor) o `estudianteId` (portal del alumno), siempre el id propio.
  - Sin `tutorId` ni `estudianteId`: sus sesiones como tutor y como alumno juntas, ordenadas por `inicio`.
  - Con el id de otra persona responde `FORBIDDEN`; `sesion(id)` de una sesión en la que no participa responde `NOT_FOUND`.

## Errores

GraphQL: el tipo de error está en `errors[0].extensions.code`. Distinguir siempre por el código, no por el texto del mensaje.

| `extensions.code` | Cuándo |
|---|---|
| `BAD_REQUEST` | Datos inválidos: horario que no es un bloque o ya pasó, reservarse a sí mismo, nota fuera de 1 a 5 |
| `UNAUTHENTICATED` | Sin token, token vencido o inválido, o email y contraseña incorrectos |
| `FORBIDDEN` | No participa en la sesión, la casilla o el material no es suyo, solo el tutor confirma o finaliza, publicar sin tener el ramo activo |
| `NOT_FOUND` | No existe, o no tiene permiso para verlo |
| `CONFLICT` | Casilla ocupada o solapada, cruce de horario, ramo no activo, transición de estado inválida, email repetido, sesión ya evaluada, desmarcar una casilla con sesión activa |
| `SERVICE_UNAVAILABLE` | Un servicio no responde |
| `TOO_MANY_REQUESTS` | Agente: demasiados mensajes seguidos |
| `GATEWAY_TIMEOUT` | Agente: no terminó a tiempo |

Los mensajes por código están en `src/apollo/errores.ts` (`mensajeError`).

El `stacktrace` de las respuestas es solo de desarrollo; no depender de él.

## Archivos (REST, no GraphQL)

- **Subir:** `POST /archivos`, multipart con `archivo`, `ramoCodigo` y `titulo`. Responde 201 con el `Material` creado. Solo PDF, PNG o JPEG, hasta 10 MB; el BFF revisa además los primeros bytes. Validar tipo y tamaño también en el front antes de enviar.
- **Descargar:** `GET /archivos/:id`. **Pide el token en la cabecera**, así que un `<img src>` o un `<a href>` directo da 401. Se baja con `fetch` (con `Authorization`), se crea un blob y se muestra o descarga con `URL.createObjectURL` (y `URL.revokeObjectURL` al terminar).
- Errores con el formato de Nest, `{ statusCode, message, error }`: 400 (falta un campo, el archivo no es PDF, PNG ni JPEG de verdad, o se pidió descargar un aviso), 401, 403 (no tiene el ramo activo), 404 (no existe o no puede verlo), 413 (más de 10 MB; mensaje en inglés), 503.

## Fechas y bloques horarios

- El BFF recibe y devuelve fechas en **UTC** (`DateTime`, ISO-8601).
- Las casillas son los bloques de clase de la universidad: **90 minutos, de lunes a viernes**, en hora de Chile:

| Bloque | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Inicio (Chile) | 08:10 | 09:55 | 11:40 | 14:30 | 16:15 | 18:00 |

- Convertir con la zona `America/Santiago` usando una librería (por ejemplo `date-fns-tz`), **nunca** sumando un número fijo de horas: el desfase cambia con el horario de verano.
- La semana o el mes se calculan en hora de Chile y se piden al BFF como rango UTC (`desde` incluido, `hasta` excluido).
- Solo se aceptan casillas futuras.

## Reglas de negocio que el front debe reflejar

- **Casillas:** el tutor marca casillas con fecha concreta, por ramo (`marcarCasilla(ramoCodigo, inicio)`). Una casilla marcada para un ramo deja de estar disponible para los otros. No hay "copiar semana".
- **Desmarcar** una casilla con sesión `PENDIENTE` o `CONFIRMADA` da `CONFLICT`: primero se cancela la sesión.
- **Reservar** (`crearSesion(input: { tutorId, ramoCodigo, inicio })`): solo se envía el inicio; el fin lo calcula el BFF. Nadie se reserva a sí mismo, y un usuario no puede tener dos sesiones que se crucen, aunque en una sea alumno y en la otra tutor (`CONFLICT`).
- **Ciclo de una sesión:** `PENDIENTE → CONFIRMADA → FINALIZADA`, o `CANCELADA`.
  - Queda `PENDIENTE` hasta que el tutor la confirma (`confirmarSesion`). Rechazar es cancelar (`cancelarSesion`).
  - Una `PENDIENTE` cuyo inicio pasa sin confirmar se cancela sola.
  - Una `CONFIRMADA` pasa sola a `FINALIZADA` al terminar el bloque.
- **Aviso al tutor:** no hay websockets. Consultar `sesiones(tutorId, estado: PENDIENTE)` al cargar y cada 30 a 60 segundos (`pollInterval` de Apollo).
- **Material visible:** el tutor ve el suyo; un alumno ve el de un tutor en un ramo si tiene o tuvo una sesión no cancelada con él en ese ramo. Lo decide el back; el front no filtra.
- **Evaluaciones:** solo sesiones `FINALIZADA` en las que participó, una por sesión, nota entera de 1 a 5 y comentario opcional de hasta 1000 caracteres. No se editan ni se borran. Son anónimas (`EvaluacionAnonima` no trae autor ni sesión).
- **Inscripción como tutor:** por cada ramo, nota de aprobación (4.0 a 7.0) y periodo (ej. `2025-2`). Todo o nada. Un ramo quitado se reactiva sin repetir el formulario.
- **Tutor de una casilla:** `BloqueDisponibilidad` trae `tutor { id nombre promedioEvaluaciones cantidadEvaluaciones }` (o `null` si el usuario ya no existe). Usarlo en las tarjetas de reserva en vez del id.

## Agente

- `chatAgente(mensaje, conversacionId)` devuelve `{ respuesta, conversacionId, acciones { id tipo } }`. Ya funciona con Gemini real: busca tutores y horarios y crea la reserva.
- Puede tardar **hasta unos 2 minutos**: mostrar que está pensando y **no reintentar**.
- Para seguir la conversación, mandar el `conversacionId` de la respuesta anterior (el primer mensaje va sin él).
- Si `acciones` trae `sesion.creada`, refrescar la vista de reservas.
- Errores propios: `TOO_MANY_REQUESTS` y `GATEWAY_TIMEOUT`.

## Pendiente en el back

- `Material` trae `tutorId` pero no el nombre del tutor. Se pidió agregar `tutor: Usuario`. **Mientras tanto, mostrar el id del tutor** donde iría el nombre, como recordatorio visible.

## Despliegue

- `Dockerfile`: build con Node 22 y nginx sin root en el puerto 8080. Recargar una ruta como `/alumno/...` devuelve `index.html`.
- nginx reenvía `/graphql` y `/archivos` a `bff:3000`, con `client_max_body_size 11m` (archivos de hasta 10 MB) y `proxy_read_timeout 150s` (el agente tarda hasta unos 2 minutos). Resuelve `bff` al arrancar: aplicar el BFF antes que el front.
- `k8s/front.yaml`: Deployment y Service `LoadBalancer` (Docker Desktop lo publica en `http://localhost`).
- CI (`.github/workflows/ci.yml`): build, tests con cobertura ≥ 60 % y prueba de la imagen con un BFF falso.

## Convenciones

- Interfaz, comentarios y documentación en español.
- Componentes reutilizables donde el flujo lo indica (selector de asignatura, topbar, modales).
- **Git:** no hacer `git commit`, `git push`, `git merge` ni `git rebase` sin que el usuario lo pida.
