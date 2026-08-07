export const CATEGORY_COLORS: Record<string, string> = {
  'arte y cultura': 'chip--violet',
  'artesanias': 'chip--amber',
  'artesanías': 'chip--amber',
  'gastronomia': 'chip--amber',
  'gastronomía': 'chip--amber',
  'comida': 'chip--orange',
  'moda': 'chip--pink',
  'tecnologia': 'chip--cyan',
  'tecnología': 'chip--cyan',
  'salud': 'chip--green',
  'belleza': 'chip--rose',
  'hogar': 'chip--lime',
  'educacion': 'chip--sky',
  'educación': 'chip--sky',
  'entretenimiento': 'chip--coral',
  'deportes': 'chip--orange',
  'deporte': 'chip--orange',
  'servicios': 'chip--slate',
  'turismo': 'chip--teal',
  'agro': 'chip--green',
  'agroindustria': 'chip--green',
  'sostenibilidad': 'chip--green',
  'musica': 'chip--magenta',
  'música': 'chip--magenta',
  'juguete': 'chip--mandarin',
  'juguete en madera': 'chip--sand',
  'digital': 'chip--cyan',
  'emprendimiento': 'chip--indigo',
};

const FALLBACKS = [
  'chip--blue',
  'chip--indigo',
  'chip--cyan',
  'chip--green',
  'chip--amber',
  'chip--rose',
];

export function categoryChipClass(name?: string | null): string {
  if (!name) return 'chip--slate';
  const key = name.trim().toLowerCase();
  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key];
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length];
}

export function typeChipClass(code?: string | null): string {
  const map: Record<string, string> = {
    PHYSICAL: 'chip--violet',
    VIRTUAL: 'chip--cyan',
    HYBRID: 'chip--amber',
  };
  return code && map[code] ? map[code] : 'chip--slate';
}