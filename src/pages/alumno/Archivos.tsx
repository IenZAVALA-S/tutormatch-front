import { MaterialAgrupado } from './material/MaterialAgrupado'

/** Archivos que el alumno puede ver, por asignatura y tutor. */
export function ArchivosAlumno() {
  return <MaterialAgrupado tipo="ARCHIVO" titulo="Archivos" vacio="Todavía no tienes archivos." />
}
