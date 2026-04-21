export const sampleClubs = [
  { name: 'Club Atlético Quibdó', municipality: 'Quibdó', athletes: 24, status: 'Activo', coach: 'Carlos Palacios' },
  { name: 'Club San Juan Racing', municipality: 'San Juan', athletes: 18, status: 'Activo', coach: 'María López' },
  { name: 'Club Atrato Veloz', municipality: 'Quibdó', athletes: 15, status: 'Activo', coach: 'José Rivas' },
  { name: 'Club Istmina Corre', municipality: 'Istmina', athletes: 12, status: 'En revisión', coach: 'Ana Mosquera' },
  { name: 'Club Condoto Sport', municipality: 'Condoto', athletes: 10, status: 'Activo', coach: 'Pedro Valencia' },
  { name: 'Club Tadó Atlético', municipality: 'Tadó', athletes: 8, status: 'Activo', coach: 'Luis Murillo' }
] as const;

export const sampleNews = [
  {
    title: 'Resultados del Grand Prix Quibdó 2026',
    excerpt: 'Consulta los resultados completos del evento celebrado el pasado fin de semana.',
    date: '2026-04-10',
    category: 'Resultados',
    body: [
      'La Liga de Atletismo del Chocó comparte los resultados oficiales del Grand Prix Quibdó 2026.',
      'En los próximos días se publicarán los rankings actualizados por prueba y categoría.'
    ]
  },
  {
    title: 'Convocatoria abierta para Selectivo Nacional',
    excerpt: 'La Liga convoca a todos los atletas interesados en representar al Chocó.',
    date: '2026-04-05',
    category: 'Convocatorias',
    body: [
      'Se encuentra abierta la convocatoria para el proceso selectivo nacional.',
      'Los clubes podrán postular atletas cumpliendo requisitos y fechas de cierre.'
    ]
  },
  {
    title: 'Nuevo récord departamental en 100m',
    excerpt: 'Valentina Rojas establece nueva marca con 11.22 segundos.',
    date: '2026-03-28',
    category: 'Logros',
    body: [
      'Con una marca destacada, se actualiza el registro departamental de los 100m.',
      'La comisión técnica verificará el acta oficial y condiciones de viento.'
    ]
  },
  {
    title: 'Calendario oficial 2026 publicado',
    excerpt: 'Consulta todas las fechas de competencias y eventos del año.',
    date: '2026-03-15',
    category: 'Anuncios',
    body: ['Ya está disponible el calendario oficial con eventos, sedes y categorías.']
  },
  {
    title: 'Capacitación para entrenadores',
    excerpt: 'Inscríbete en el curso de actualización técnica para entrenadores.',
    date: '2026-03-10',
    category: 'Formación',
    body: ['La Liga abre un espacio de formación y actualización para entrenadores afiliados.']
  },
  {
    title: 'Alianza con Indeportes Chocó',
    excerpt: 'La Liga firma convenio de cooperación para el desarrollo deportivo.',
    date: '2026-02-20',
    category: 'Institucional',
    body: ['Se fortalece el trabajo conjunto por el atletismo del departamento.']
  }
] as const;

export const sampleConvocatorias = [
  {
    title: 'Selectivo Nacional 2026',
    status: 'Abierta',
    openDate: '2026-04-01',
    closeDate: '2026-04-25',
    audience: 'Clubes y atletas',
    description:
      'Convocatoria para postulación de atletas que representarán al departamento en el proceso nacional.',
    requirements: ['Carta del club', 'Documento de identidad', 'Soporte de marca', 'Autorización tratamiento de datos'],
    categories: ['U18', 'U20', 'Mayores']
  },
  {
    title: 'Concentración Departamental de Talentos',
    status: 'Próximamente',
    openDate: '2026-05-10',
    closeDate: '2026-05-25',
    audience: 'Atletas',
    description: 'Proceso de identificación y seguimiento de talentos para semilleros.',
    requirements: ['Formulario de salud', 'Autorización acudiente (si aplica)'],
    categories: ['U14', 'U16']
  }
] as const;

export const sampleCompetencias = [
  {
    title: 'Campeonato Departamental de Velocidad',
    status: 'Confirmado',
    date: '2026-05-04',
    location: 'Quibdó',
    description: 'Evento oficial de pista enfocado en pruebas de velocidad y relevos.',
    downloads: [{ label: 'Circular oficial', href: '#' }, { label: 'Manual técnico', href: '#' }]
  },
  {
    title: 'Copa de Saltos y Lanzamientos',
    status: 'Confirmado',
    date: '2026-06-12',
    location: 'Istmina',
    description: 'Competencia para pruebas de campo con participación de clubes afiliados.',
    downloads: [{ label: 'Circular oficial', href: '#' }]
  }
] as const;

export const sampleBlogPosts = [
  {
    title: 'Cómo preparar tu temporada: base aeróbica y técnica',
    excerpt: 'Una guía práctica para atletas y entrenadores sobre planificación de temporada.',
    date: '2026-04-08',
    tags: ['Formación', 'Entrenamiento'],
    body: [
      'La planificación por bloques permite controlar carga, intensidad y recuperación.',
      'Prioriza técnica de carrera, movilidad y fuerza general en etapas iniciales.'
    ]
  },
  {
    title: 'Reglamentos clave: lo que debes saber sobre viento y marcas legales',
    excerpt: 'Entiende cuándo una marca es legal y cómo se registra en resultados oficiales.',
    date: '2026-03-22',
    tags: ['Reglamentación'],
    body: [
      'Para pruebas de velocidad y saltos, el viento puede afectar la validez de la marca.',
      'Los jueces registran condiciones y observaciones técnicas en el acta.'
    ]
  }
] as const;

