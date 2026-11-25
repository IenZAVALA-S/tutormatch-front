# Flujo de pantallas

Acordado el 24-11-2026. Entre paréntesis, la operación del BFF que usa cada acción (ver `schema.gql` del BFF).

## Login y registro

Primera pantalla que ve el usuario.

- **Iniciar sesión** con email y contraseña (`login`). Hay dos botones: **Ingreso como tutor** e **Ingreso como alumno**. El login es uno solo; el botón solo elige qué portal se abre.
  - Si entra como tutor con `esTutor = false`, se le muestra el **formulario de ramos** para inscribirse como tutor.
- **Registrarse:** nombre, email y contraseña (`registro`). El registro de tutor agrega el formulario de ramos (`agregarRamosTutor`): por cada ramo del catálogo (`ramos`), nota de aprobación (4.0 a 7.0) y periodo (ej. `2025-2`).
- **Cerrar sesión** desde la topbar. Si el token vence (24 h) o cualquier operación responde `UNAUTHENTICATED`, volver a esta pantalla.

## Común a los dos portales

- **Topbar** arriba de todo: logo (placeholder por ahora) y navegación rápida.
- Un usuario que es alumno y tutor a la vez puede **cambiar de portal desde la topbar** ("Ir al portal de alumno" / "Ir al portal de tutor"), sin volver a iniciar sesión. El enlace al portal de tutor solo aparece si `esTutor` es verdadero.
- **Selector de asignatura:** un solo componente, reutilizado en el calendario del tutor, en sus archivos y en las reservas del alumno.

## Portal del tutor

Topbar: Calendario, Archivos, Reseñas, Perfil.

### Calendario (pantalla principal)

- Vista **semana a semana**, de lunes a viernes, con los bloques A–F de cada día. Navegación a la semana anterior y siguiente.
- Arriba del calendario, dos mitades:
  - **Selector de asignatura:** al cambiar, una pequeña carga antes de que el calendario refleje la selección.
  - **Caja de Notificaciones:** las reservas pendientes (`sesiones(tutorId, estado: PENDIENTE)`), cada una con alumno, asignatura y horario, y los botones **Aceptar** (`confirmarSesion`) y **Rechazar** (`cancelarSesion`).
- Datos de la semana en una sola consulta: `disponibilidad(tutorId, desde, hasta)` y `sesiones(tutorId, desde, hasta)`. `disponibilidad` trae las casillas de todos los ramos; el front muestra la asignatura elegida.
- Estados de cada casilla:

| Estado | Qué se ve | Qué se puede hacer |
|---|---|---|
| Libre | Sin marcar | Marcar disponible (`marcarCasilla`) |
| Disponible | Marcada para esta asignatura | Desmarcar (`desmarcarCasilla`) |
| Ocupada por otra asignatura | Marcada para otro ramo; no se puede usar aquí | Nada (se cambia desde esa asignatura) |
| Pendiente | Reservada, esperando confirmación | Aceptar o rechazar |
| Confirmada | Reservada y confirmada, con el alumno | Cancelar la sesión (`cancelarSesion`) |
| Pasada | Ya empezó | Nada |

- Una casilla reservada no se desmarca: primero se cancela la sesión.
- **Toast de reserva nueva:** abajo a la izquierda, se cierra solo. Aparece cuando la consulta periódica de pendientes (cada 30 a 60 s, `pollInterval`) trae una sesión que no estaba en la anterior.

### Archivos

- Debajo de la topbar: el título de la asignatura con el mismo selector de asignatura.
- Lista del material del tutor en esa asignatura (`material(tutorId, ramoCodigo)`): título, nombre del archivo, tipo, tamaño y fecha. Cada uno con **Eliminar** (`eliminarMaterial`), pidiendo confirmación.
- Abajo a la derecha:
  - **Subir archivo:** modal con título y archivo (PDF, PNG o JPEG, hasta 10 MB) → `POST /archivos`.
  - **Publicar aviso:** modal con título y texto (`publicarAviso`).
- Abrir o descargar un archivo con `fetch` y blob (ver `CLAUDE.md`).
- Si el ramo está quitado, su material se sigue viendo, pero no se puede subir más (`FORBIDDEN` / 403).

### Reseñas

- Promedio, cantidad y comentarios anónimos del propio tutor (`evaluacionesTutor(tutorId)` con su id).

### Perfil

- Sus datos y sus ramos (`yo { ramos { ramo activo } }`): agregar ramos (`agregarRamosTutor`, con el mismo formulario del registro), quitar (`quitarRamoTutor`) y reactivar (`reactivarRamoTutor`).

## Portal del alumno

Topbar: Reservas, Mis tutorías, Archivos, Avisos, Reseñas, Agente, Perfil.

### Reservas

- **Primero se elige la asignatura** con el selector. Sin asignatura elegida no se muestra el calendario (`buscarDisponibilidad` exige `ramoCodigo`).
- **Vista del mes completo:** cada día es una casilla con la cantidad de horarios disponibles (`buscarDisponibilidad(ramoCodigo, desde, hasta)`). Navegación sencilla entre meses o rangos.
- Al hacer clic en un día con horarios, **popup** con una tarjeta por horario: tutor, horario y asignatura.
  - Mientras el back no agregue el nombre, la tarjeta muestra el **id del tutor**.
  - **Inscribirme** (`crearSesion`). La reserva queda pendiente hasta que el tutor la acepte.
  - **Cancelar**, si ya está inscrito (`cancelarSesion`). `buscarDisponibilidad` solo trae casillas libres, así que las reservas propias salen de `sesiones(estudianteId)` y se cruzan con el calendario.
  - **Sobre el tutor:** sus reseñas (`evaluacionesTutor`).
- No mostrar las casillas propias de un usuario que también es tutor (no puede reservarse a sí mismo).
- Un cruce de horario responde `CONFLICT`: mostrar el mensaje.

### Mis tutorías

- Las próximas sesiones del alumno (`sesiones(estudianteId, desde: ahora)`), con su estado (pendiente o confirmada) y **Cancelar**.

### Archivos

- Todo el material de tipo `ARCHIVO` que puede ver (`material` sin filtros), agrupado **por asignatura** y, dentro de cada una, **por tutor** (id del tutor por ahora).
- Ver y descargar con `fetch` y blob.

### Avisos

- El material de tipo `AVISO`, con la misma agrupación por asignatura y tutor.

### Reseñas

- Las sesiones `FINALIZADA` del alumno (`sesiones(estudianteId, estado: FINALIZADA)`). Cada una con **Evaluar**, o marcada como ya evaluada si está en `misEvaluaciones`.
- **Evaluar** abre un popup con estrellas de 1 a 5 y un comentario opcional (hasta 1000 caracteres). Al guardar, una confirmación avisa que **la reseña no se puede editar** antes de enviarla (`evaluar`).

### Agente

- Pantalla de "próximamente". Más adelante: chat con un agente de IA que busca tutorías y reserva por el alumno.

### Perfil

- Sus datos. Si no es tutor, un acceso al formulario de ramos para inscribirse como tutor.

## Pendiente en el back

- `tutor: Usuario` en `BloqueDisponibilidad` y en `Material` (lo pide Ien). Al estar, reemplazar los ids de tutor por el nombre.
- Más datos personales en el registro, si se piden: Usuarios (Pablo) y BFF.
- Contrato y módulo del agente.
