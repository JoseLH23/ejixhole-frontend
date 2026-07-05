/**
 * Ilustración de marca original (SVG, no una fotografía) — capas de
 * selva en silueta + una cascada con líneas animadas. Se usa sobre el
 * fondo `.gradient-mesh-hero`, por eso todo está pintado en blanco
 * translúcido en vez de colores propios: se apoya en el degradado de
 * fondo en vez de competir con él.
 *
 * Nota honesta: no existen fotografías reales de EjiXhole en este
 * proyecto, así que en vez de usar una imagen de stock genérica
 * haciéndose pasar por el parque, se optó por una ilustración propia.
 */
export function ParkIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Capa de montaña/selva más lejana */}
      <path
        d="M0 260 L60 210 L120 250 L180 190 L240 240 L300 170 L360 235 L420 195 L480 245 L540 205 L600 250 L600 400 L0 400 Z"
        fill="white"
        fillOpacity="0.08"
      />
      {/* Capa media */}
      <path
        d="M0 300 L50 265 L100 295 L160 250 L220 290 L280 240 L340 285 L400 250 L460 290 L520 255 L600 295 L600 400 L0 400 Z"
        fill="white"
        fillOpacity="0.14"
      />
      {/* Copas de árboles — silueta redondeada tipo canopy, capa frontal */}
      <g fill="white" fillOpacity="0.22">
        <circle cx="70" cy="330" r="34" />
        <circle cx="115" cy="345" r="26" />
        <circle cx="480" cy="335" r="30" />
        <circle cx="530" cy="350" r="24" />
        <circle cx="40" cy="355" r="20" />
        <circle cx="560" cy="360" r="18" />
      </g>

      {/* Cascada central: caída de agua con líneas verticales animadas */}
      <g>
        <path d="M280 60 Q300 40 320 60 L332 320 Q300 345 268 320 Z" fill="white" fillOpacity="0.16" />
        {[286, 296, 306, 314].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1="70"
            x2={x - 6}
            y2="310"
            stroke="white"
            strokeOpacity="0.55"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDelay: `${i * 300}ms`, animationDuration: "2.4s" }}
          />
        ))}
        {/* Espuma en la base de la cascada */}
        <ellipse cx="300" cy="325" rx="42" ry="10" fill="white" fillOpacity="0.3" />
      </g>

      {/* Hojas flotando — detalle final, muy sutil */}
      <g fill="white" fillOpacity="0.25">
        <path d="M150 120 q10 -14 22 -4 q-6 14 -22 4Z" />
        <path d="M430 90 q10 -14 22 -4 q-6 14 -22 4Z" />
        <path d="M500 150 q10 -14 22 -4 q-6 14 -22 4Z" />
      </g>
    </svg>
  );
}
