// Fondo de la app, estilo DORFic (Daylight, Orange, Red, Futurism, Graphic):
// un resplandor de luz de día arriba y, acumuladas al pie de la página,
// ondas en tonos de naranja. Cada onda suma varias sinusoides para que no
// se vean uniformes.

const ANCHO = 1440
const ALTO = 420

interface Componente {
  amplitud: number
  /** Ciclos a lo ancho de la pantalla. */
  ciclos: number
  fase: number
}

function curva(base: number, componentes: Componente[]): string {
  const puntos: string[] = []
  for (let x = 0; x <= ANCHO; x += 12) {
    const y = componentes.reduce(
      (suma, c) => suma + c.amplitud * Math.sin((x / ANCHO) * c.ciclos * 2 * Math.PI + c.fase),
      base,
    )
    puntos.push(`${x},${y.toFixed(1)}`)
  }
  return `M${puntos.join(' L')}`
}

/** Banda rellena: la curva y todo lo que queda debajo. */
const banda = (base: number, componentes: Componente[]) =>
  `${curva(base, componentes)} L${ANCHO},${ALTO} L0,${ALTO} Z`

// De atrás hacia adelante: cada banda más baja y más intensa. Los colores
// (--onda-0 a --onda-5) cambian en modo oscuro; ver index.css.
const BANDAS = [
  { base: 120, desde: 'var(--onda-0)', hasta: 'var(--onda-1)', opacidad: 0.8,
    ondas: [{ amplitud: 30, ciclos: 1.3, fase: 0.4 }, { amplitud: 12, ciclos: 3.1, fase: 1.9 }, { amplitud: 5, ciclos: 7, fase: 0.2 }] },
  { base: 180, desde: 'var(--onda-1)', hasta: 'var(--onda-2)', opacidad: 0.85,
    ondas: [{ amplitud: 26, ciclos: 1.7, fase: 2.6 }, { amplitud: 14, ciclos: 2.4, fase: 0.3 }, { amplitud: 4, ciclos: 6.3, fase: 1.1 }] },
  { base: 240, desde: 'var(--onda-2)', hasta: 'var(--onda-3)', opacidad: 0.85,
    ondas: [{ amplitud: 32, ciclos: 1.1, fase: 4.1 }, { amplitud: 10, ciclos: 3.7, fase: 2.2 }, { amplitud: 6, ciclos: 5.2, fase: 0.8 }] },
  { base: 300, desde: 'var(--onda-3)', hasta: 'var(--onda-4)', opacidad: 0.9,
    ondas: [{ amplitud: 22, ciclos: 1.9, fase: 1.2 }, { amplitud: 13, ciclos: 2.9, fase: 3.4 }, { amplitud: 4, ciclos: 8.1, fase: 2.7 }] },
  { base: 355, desde: 'var(--onda-4)', hasta: 'var(--onda-5)', opacidad: 0.95,
    ondas: [{ amplitud: 20, ciclos: 1.5, fase: 5.3 }, { amplitud: 9, ciclos: 3.3, fase: 0.9 }, { amplitud: 5, ciclos: 6.7, fase: 1.6 }] },
]

// Líneas finas que cruzan las bandas, para el toque gráfico. En modo oscuro
// las blancas pasan a naranjos tenues: el blanco sobre fondo oscuro encandila.
const LINEAS = [
  { base: 150, clase: 'stroke-white/70 dark:stroke-marca-300/25', grosor: 2,
    ondas: [{ amplitud: 34, ciclos: 1.4, fase: 1.0 }, { amplitud: 9, ciclos: 4.2, fase: 0.5 }] },
  { base: 205, clase: 'stroke-marca-500/35 dark:stroke-marca-400/30', grosor: 1.5,
    ondas: [{ amplitud: 28, ciclos: 1.2, fase: 3.0 }, { amplitud: 11, ciclos: 2.7, fase: 2.0 }] },
  { base: 262, clase: 'stroke-white/50 dark:stroke-marca-200/15', grosor: 3,
    ondas: [{ amplitud: 24, ciclos: 1.8, fase: 0.2 }, { amplitud: 8, ciclos: 5.1, fase: 1.4 }] },
  { base: 330, clase: 'stroke-marca-200/60 dark:stroke-marca-300/25', grosor: 1.5,
    ondas: [{ amplitud: 18, ciclos: 2.2, fase: 4.4 }, { amplitud: 10, ciclos: 3.4, fase: 0.7 }] },
]

export function FondoDorfic() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Luz de día: resplandor cálido arriba a la derecha */}
      <div className="absolute -top-1/3 -right-1/4 h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,#fff3c4_0%,#ffe2c8_35%,transparent_70%)] opacity-80 dark:bg-[radial-gradient(circle,#ef5a2a_0%,#742717_40%,transparent_70%)] dark:opacity-30" />
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[38vh] min-h-56 w-full dark:opacity-75"
      >
        <defs>
          {BANDAS.map((b, i) => (
            <linearGradient key={i} id={`banda-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: b.desde }} />
              <stop offset="100%" style={{ stopColor: b.hasta }} />
            </linearGradient>
          ))}
        </defs>
        {BANDAS.map((b, i) => (
          <g key={i} opacity={b.opacidad}>
            <path d={banda(b.base, b.ondas)} fill={`url(#banda-${i})`} />
            {/* Brillo en el borde de cada banda */}
            <path
              d={curva(b.base, b.ondas)}
              fill="none"
              strokeWidth={1.5}
              className="stroke-white/45 dark:stroke-marca-200/15"
            />
          </g>
        ))}
        {LINEAS.map((l, i) => (
          <path
            key={i}
            d={curva(l.base, l.ondas)}
            fill="none"
            className={l.clase}
            strokeWidth={l.grosor}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}
