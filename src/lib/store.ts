import fs from 'node:fs/promises';
import path from 'node:path';

export type Store = {
  settings: {
    siteName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    contactPhone: string;
    social: Record<string, string>;
  };
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
    badge: string;
  };
  home: {
    news: Array<{
      title: string;
      excerpt: string;
      category: string;
      dateText: string;
      href: string;
      imageUrl?: string;
    }>;
    eventHighlight: {
      sourceEventId?: number;
      sourceCompetenciaTitle?: string;
      eventDateTime?: string;
      title: string;
      subtitle: string;
      venueText: string;
      participantsText: string;
      audienceText: string;
      primaryCtaLabel: string;
      primaryCtaHref: string;
    };
    stars: Array<{
      name: string;
      discipline: string;
      badge: string;
      stat: string;
      imageUrl: string;
    }>;
    cta: {
      titleHtml: string;
      subtitle: string;
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel: string;
      secondaryHref: string;
      footnote: string;
    };
    sponsors: Array<{
      name: string;
      href: string;
      logoUrl?: string;
    }>;
  };
  federation: {
    about: string;
    mission: string;
    vision: string;
  };
  publicSite: {
    pageHeroes: Record<string, string>;
    laLiga: {
      heroTitle: string;
      heroSubtitle: string;
      historyImageUrl: string;
      principles: Array<{
        icon: string;
        title: string;
        desc: string;
      }>;
      governanceItems: Array<{
        label: string;
        title: string;
      }>;
      normativeDocs: Array<{
        icon: string;
        title: string;
        href: string;
      }>;
    };
  };
  newsPage: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    newsletterCta: string;
  };
  news: Array<{
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    imageUrl?: string;
    body: string[];
  }>;
  blogPage: {
    title: string;
    subtitle: string;
    featuredTag: string;
    featuredTitle: string;
    featuredImageUrl: string;
    featuredCtaLabel: string;
    calloutTitle: string;
    calloutCtaLabel: string;
    calloutCtaHref: string;
  };
  blogPosts: Array<{
    slug: string;
    type: 'Entrevista' | 'Video' | 'Galería' | 'Técnico' | 'Competición' | string;
    title: string;
    excerpt: string;
    date: string;
    tags: string[];
    imageUrl?: string;
    body: string[];
  }>;
  events: Array<{
    id?: number;
    name: string;
    date: string;
    location: string;
    category?: string;
    status: string;
    resultsUrl?: string;
  }>;
  records: Array<{
    athlete: string;
    mark: string;
    category: string;
    date: string;
  }>;
  rankings: Array<{
    rank: string;
    athlete: string;
    club: string;
    mark: string;
    status: string;
    imageUrl?: string;
    category: string;
    discipline: string;
    gender: 'Masculino' | 'Femenino' | string;
    season: string;
  }>;
  results: Array<{
    pos: string;
    athlete: string;
    category: string;
    club: string;
    mark: string;
    event: string;
    date: string;
    imageUrl?: string;
    downloadUrl?: string;
    isGold?: boolean;
  }>;
  documents: Array<{
    title: string;
    description: string;
    href: string;
    category?: string;
    date?: string;
  }>;
  convocatorias: Array<{
    title: string;
    category: string;
    status: 'Abierta' | 'Próximamente' | 'Cerrada' | string;
    statusMode?: 'auto' | 'manual' | string;
    openDate: string;
    closeDate: string;
    location: string;
    audience: string;
    description: string;
    requirements: string[];
    categories: string[];
    imageUrl?: string;
  }>;
  competencias: Array<{
    title: string;
    status: string;
    date: string;
    location: string;
    description: string;
    type?: string;
    imageUrl?: string;
    downloads: Array<{
      label: string;
      href: string;
    }>;
  }>;
  clubs: Array<{
    id?: number;
    name: string;
    municipality: string;
    athletes: number;
    status: string;
    coach: string;
    contactEmail?: string;
    contactPhone?: string;
    imageUrl?: string;
    category?: string;
  }>;
};

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');

const defaultStore: Store = {
  settings: {
    siteName: 'Liga de Atletismo',
    logoUrl: '',
    primaryColor: '#1E6BFF',
    secondaryColor: '#FF6A00',
    contactEmail: 'contacto@liga-atletismo.com',
    contactPhone: '+57 000 000 000',
    social: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      x: 'https://x.com'
    }
  },
  hero: {
    title: 'Una liga que impulsa el talento con datos, velocidad y comunidad.',
    subtitle:
      'Gestiona competencias, atletas y marcas en tiempo real. Todo el contenido es editable desde el panel administrativo para que la liga siempre este actualizada.',
    imageUrl: '',
    badge: 'EL CORAZÓN DEL PACÍFICO'
  },
  home: {
    news: [
      {
        category: 'Resultados',
        title: 'Resultados del Grand Prix Quibdó 2026',
        excerpt: 'Consulta los resultados completos del evento celebrado el pasado fin de semana.',
        dateText: 'Abril 10, 2026',
        href: '/noticias/resultados-del-grand-prix-quibdo-2026',
        imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=4000&auto=format&fit=crop'
      },
      {
        category: 'Convocatorias',
        title: 'Convocatoria abierta para Selectivo Nacional',
        excerpt: 'La Liga convoca a atletas y clubes para el proceso de selección departamental.',
        dateText: 'Abril 5, 2026',
        href: '/convocatorias/selectivo-nacional-2026'
      },
      {
        category: 'Documentos',
        title: 'Resultados Intercolegiales (PDF)',
        excerpt: 'Descarga el PDF completo con las marcas y clasificaciones de la jornada juvenil.',
        dateText: 'Actualizado',
        href: '/documentos'
      }
    ],
    eventHighlight: {
      title: 'Próxima Gran Cita',
      subtitle: 'La élite del atletismo chocoano se reúne para definir quién es el más veloz de la región.',
      venueText: 'Estadio "La Normal" - Quibdó',
      participantsText: 'Estado general',
      audienceText: 'Información oficial',
      primaryCtaLabel: 'Registrarse',
      primaryCtaHref: '/registro'
    },
    stars: [
      {
        name: 'Mateo Córdoba',
        discipline: '100m / 200m velocidad',
        badge: '100M / 200M VELOCIDAD',
        stat: '10.02s PB',
        imageUrl: 'https://images.unsplash.com/photo-1461896756984-8fd40bfb3202?w=4000&auto=format&fit=crop'
      },
      {
        name: 'Elena Rentería',
        discipline: 'Vallas 110m',
        badge: 'VALLAS 110M',
        stat: 'Campeona Jr',
        imageUrl: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=2072&auto=format&fit=crop'
      },
      {
        name: 'Andrés Mena',
        discipline: 'Salto largo / triple',
        badge: 'SALTO LARGO / TRIPLE',
        stat: '8.15m PB',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=4000&auto=format&fit=crop'
      }
    ],
    cta: {
      titleHtml: 'Tu Legado Empieza <br /> <span class="text-[#fdd835]">En La Pista</span>',
      subtitle:
        'Únete a la Liga de Atletismo del Chocó. Contamos con entrenadores certificados, infraestructura en desarrollo y el espíritu indomable del Pacífico.',
      primaryLabel: 'Afíliate Hoy',
      primaryHref: '/registro',
      secondaryLabel: 'Ver Convocatorias',
      secondaryHref: '/convocatorias',
      footnote: 'Cupos abiertos para semilleros y clubes regionales.'
    },
    sponsors: [
      { name: 'Indeportes ChocÃ³', href: '#', logoUrl: '' },
      { name: 'AlcaldÃ­a de QuibdÃ³', href: '#', logoUrl: '' },
      { name: 'GobernaciÃ³n del ChocÃ³', href: '#', logoUrl: '' },
      { name: 'Aliado Deportivo', href: '#', logoUrl: '' }
    ]
  },
  federation: {
    about:
      'Somos la entidad que coordina el atletismo competitivo, con una vision de excelencia deportiva y formacion integral.',
    mission:
      'Desarrollar atletas de alto rendimiento mediante una estructura moderna, datos confiables y eventos de clase mundial que inspiren a la comunidad deportiva.',
    vision: 'Ser la federacion referente en Latinoamerica por su innovacion y transparencia.'
  },
  publicSite: {
    pageHeroes: {
      laLiga: '',
      convocatorias: '',
      competencias: '',
      calendario: '',
      resultados: '',
      ranking: '',
      clubes: '',
      noticias: '',
      blog: ''
    },
    laLiga: {
      heroTitle: 'La Liga',
      heroSubtitle: 'Forjando campeones con pasión tropical desde el corazón del Pacífico colombiano.',
      historyImageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop',
      principles: [
        {
          icon: 'diversity_3',
          title: 'Inclusión',
          desc: 'Puertas abiertas para cada talento del Pacífico sin distinción alguna.'
        },
        {
          icon: 'verified_user',
          title: 'Transparencia',
          desc: 'Claridad absoluta en el manejo de recursos y procesos selectivos.'
        },
        {
          icon: 'military_tech',
          title: 'Excelencia',
          desc: 'Búsqueda incansable de la calidad técnica y el alto rendimiento.'
        },
        {
          icon: 'groups',
          title: 'Comunidad',
          desc: 'Fortalecimiento del tejido social a través del deporte regional.'
        },
        {
          icon: 'schedule',
          title: 'Disciplina',
          desc: 'El rigor como base fundamental para alcanzar el éxito deportivo.'
        },
        {
          icon: 'flag',
          title: 'Identidad',
          desc: 'Orgullo por nuestras raíces chocoanas y espíritu resiliente.'
        }
      ],
      governanceItems: [
        { label: 'Liderazgo Principal', title: 'Presidencia' },
        { label: 'Soporte Ejecutivo', title: 'Vicepresidencia' },
        { label: 'Gestión Administrativa', title: 'Secretaría General' },
        { label: 'Control Financiero', title: 'Tesorería' },
        { label: 'Planeación Estratégica', title: 'Junta Directiva' },
        { label: 'Ética y Normativa', title: 'Comité Disciplinario' }
      ],
      normativeDocs: [
        { icon: 'menu_book', title: 'Estatutos Institucionales', href: '/documentos' },
        { icon: 'gavel', title: 'Reglamento Interno', href: '/documentos' },
        { icon: 'policy', title: 'Código de Ética', href: '/documentos' }
      ]
    }
  },
  newsPage: {
    badge: 'DESTACADO',
    heroTitle: 'VELOCIDAD PURA EN EL CORAZÓN DEL CHOCÓ',
    heroSubtitle:
      'La delegación regional rompe récords históricos y consolida al Chocó como potencia atlética. Lee comunicados, logros y actualizaciones oficiales.',
    newsletterTitle: 'MANTENTE EN EL CARRIL RÁPIDO',
    newsletterSubtitle: 'Suscríbete para recibir notificaciones sobre resultados, convocatorias y eventos.',
    newsletterCta: 'UNIRME'
  },
  news: [
    {
      slug: 'resultados-del-grand-prix-quibdo-2026',
      title: 'Resultados del Grand Prix Quibdó 2026',
      excerpt: 'Consulta los resultados completos del evento celebrado el pasado fin de semana.',
      date: '2026-04-10',
      category: 'RESULTADOS',
      imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=4000&auto=format&fit=crop',
      body: [
        'La Liga de Atletismo del Chocó comparte los resultados oficiales del Grand Prix Quibdó 2026.',
        'En los próximos días se publicarán los rankings actualizados por prueba y categoría.'
      ]
    },
    {
      slug: 'convocatoria-abierta-selectivo-nacional',
      title: 'Convocatoria abierta para Selectivo Nacional',
      excerpt: 'La Liga convoca a clubes y atletas para el proceso de selección departamental.',
      date: '2026-04-05',
      category: 'CONVOCATORIAS',
      imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=4000&auto=format&fit=crop',
      body: [
        'Se encuentra abierta la convocatoria para el proceso selectivo nacional.',
        'Los clubes podrán postular atletas cumpliendo requisitos y fechas de cierre.'
      ]
    },
    {
      slug: 'nuevo-record-departamental-100m',
      title: 'Nuevo récord departamental en 100m',
      excerpt: 'Valentina Rojas establece nueva marca con 11.22 segundos.',
      date: '2026-03-28',
      category: 'LOGROS',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=4000&auto=format&fit=crop',
      body: [
        'Con una marca destacada, se actualiza el registro departamental de los 100m.',
        'La comisión técnica verificará el acta oficial y condiciones de viento.'
      ]
    }
  ],
  blogPage: {
    title: 'Blog de la Liga',
    subtitle: 'Contenidos técnicos, entrevistas y crónicas para atletas, clubes y entrenadores.',
    featuredTag: 'Video',
    featuredTitle: 'Ruta al Oro: Preparación técnica en el corazón del Chocó',
    featuredImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdUj1sgLgV0TyPjridxo-iRPgiJelXSqsGjbz9xPLhUg5z4qRRNEEeTrXHvRzz1mzz-zvw1GkS_laXY__uuRh-X2vISSJvNjpeiXLKhGRQ-tJ7JIKv_Td_uN6LGvjeVO36j49CPbaEcYloxJNr-oMUNgRiIbZWm8LGeu3Tz_TsMMQMkQJtAFkkg5UnaOSwas9jxCouWWL-Tc7It88s3ZQYvn8IAsJ58EK1yE30pYLpyV4Z0u_tLJgbS-6SvwLdJ9tA8TVQouQ1oV4q',
    featuredCtaLabel: 'Ver video',
    calloutTitle: 'Únete a la nueva generación de campeones',
    calloutCtaLabel: 'Inscripciones abiertas',
    calloutCtaHref: '/registro'
  },
  blogPosts: [
    {
      slug: 'como-preparar-tu-temporada-base-aerobica-y-tecnica',
      type: 'Técnico',
      title: 'Cómo preparar tu temporada: base aeróbica y técnica',
      excerpt: 'Una guía práctica para atletas y entrenadores sobre planificación de temporada.',
      date: '2026-04-08',
      tags: ['Formación', 'Entrenamiento'],
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=4000&auto=format&fit=crop',
      body: [
        'La planificación por bloques permite controlar carga, intensidad y recuperación.',
        'Prioriza técnica de carrera, movilidad y fuerza general en etapas iniciales.'
      ]
    },
    {
      slug: 'reglamentos-clave-viento-y-marcas-legales',
      type: 'Competición',
      title: 'Reglamentos clave: lo que debes saber sobre viento y marcas legales',
      excerpt: 'Entiende cuándo una marca es legal y cómo se registra en resultados oficiales.',
      date: '2026-03-22',
      tags: ['Reglamentación'],
      imageUrl: 'https://images.unsplash.com/photo-1530549387074-d5629d75b734?w=4000&auto=format&fit=crop',
      body: [
        'Para pruebas de velocidad y saltos, el viento puede afectar la validez de la marca.',
        'Los jueces registran condiciones y observaciones técnicas en el acta.'
      ]
    }
  ],
  events: [
    {
      name: 'Gran Prix Apertura',
      date: '2026-05-04',
      location: 'Estadio Central',
      category: 'Velocidad y Saltos',
      status: 'Inscripciones abiertas',
      resultsUrl: ''
    },
    {
      name: 'Copa Velocidad',
      date: '2026-06-12',
      location: 'Pista Norte',
      category: 'Velocidad',
      status: 'Clasificatoria',
      resultsUrl: ''
    },
    {
      name: 'Maraton Metropolitano',
      date: '2026-08-30',
      location: 'Circuito Urbano',
      category: 'Ruta',
      status: 'Confirmado',
      resultsUrl: ''
    }
  ],
  records: [
    {
      athlete: 'Valentina Rojas',
      mark: '11.22s',
      category: '100m',
      date: '2025-11-12'
    },
    {
      athlete: 'Carlos Mejia',
      mark: '2:09:43',
      category: 'Maraton',
      date: '2025-10-02'
    },
    {
      athlete: 'Andrea Ruiz',
      mark: '6.45m',
      category: 'Salto largo',
      date: '2025-09-18'
    }
  ]
  ,
  rankings: [
    {
      rank: '01',
      athlete: 'Carlos Palacios',
      club: 'Atletas de Oro Condoto',
      mark: '10.15s',
      status: 'Verificado',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDkV2cWTE-uyFe4M7kWry8P8hpguB1DtRI1qy7TCXkJegF81J8VKsyeLjZkeSrm9stErigrSDkqrvzRXlbE5Itkr-Jwh9sPh-9_7GTTLtAyovk4hyMGu5QvrJBX0rV67Ujx6g9gvYxzS7drpjDHU8eaMtgmOHvhRDHl59vzWhRZ54cxE68sZsDvUOiZPX6cMQwHof0RDAC10W9yQ4LDaBiNq2xf_Mqa5Wn-aUECp15WI26U-dp6GN3Vlhbk7tg0e1Ka2jmkBDWipnoe',
      category: 'Mayores (Elite)',
      discipline: '100 Metros Planos',
      gender: 'Masculino',
      season: '2026'
    },
    {
      rank: '02',
      athlete: 'Elena Quinto',
      club: 'Club Guepardos de Quibdó',
      mark: '10.42s',
      status: 'Verificado',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCOnf31JjWOcN_3zyLYWsPAurMUNOJ7TqUH1mQSN-_hGwjKeqvo4SllRtLpthAI2hapExjNcoYWegnG918f_Rkx8cAr0heSaxXYkwvJO0lkxviDwesB2CzcPv7NsHTGIbGLhAzx1mgi97vQYMlj00scuClzBOMIdrr_hOzit2C36cnX4-oKvuRCGs1Bljg67sb5og9zD8Pa5LBzQDYnD5gTFE8qKy1aAeHNFlM62w36xtnaL1rG1C9E3ESYccEMhUOrbj-oUTW24ijC',
      category: 'Mayores (Elite)',
      discipline: '100 Metros Planos',
      gender: 'Masculino',
      season: '2026'
    },
    {
      rank: '03',
      athlete: 'Mateo Mena',
      club: 'Liceo de Istmina',
      mark: '10.58s',
      status: 'Verificado',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCRqNZaRAt3uIAXeSYGxRpARJqID62NoZ4KAPR7LKaP0OmUe6j5tBEchO-ejQEgRBsQvHkgyE-6x08fP8c__8gAcRGOVPoViEFjYemQ8kdsLYmlU2eOZ2JRetdOOg4xc1886GDW2lqLgxei_fSYX9ZyConOlW7hou25qoTaYyK8n5JhYTFd7jl0FLDii1AwviyUefo6SjMQU809D95zdJQ2rf8UiX7uA5dyDVrXOiy7FkiwOG_wMJ18VG7d976YxBUmOCVkxrcznroA',
      category: 'Mayores (Elite)',
      discipline: '100 Metros Planos',
      gender: 'Masculino',
      season: '2026'
    },
    {
      rank: '04',
      athlete: 'Samuel Valencia',
      club: 'Bahía Solano Athl.',
      mark: '10.72s',
      status: 'Verificado',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC3XR-h88QSaHhmog_BVsLuYjSxgqpnMz1m4xfiXBvoh1eRLd4VKWNPqFmWuwI4QhrpE0RgLzhY21ZinDtMuj4QT98AZPllrd2zNP4Tgqvdp5Q36mOSChAdW1Hwhr0OlEgjH01XTsJAe-AGIpCHHu0-xVW7xTRLTp0E0YDYW5OV0C3OzNfrkde-dfd2MikDyJtPp4G5WnP1DBSTHb-YZKTbE_gsRlczEBF12tMSbJXWK1M0zkC_iWEBzs3wpoqyOiXw-fpjXHuZvZZD',
      category: 'Mayores (Elite)',
      discipline: '100 Metros Planos',
      gender: 'Masculino',
      season: '2026'
    },
    {
      rank: '05',
      athlete: 'Lucía Moreno',
      club: 'Club Tadó Runners',
      mark: '10.85s',
      status: 'Verificado',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC3aybzYQM50UIHqwLOsLN3MxOypAA-bZG7CYDnOo7Wa0YyyXFLNHZwrHQLpfArfoFkfYWGujmPDeM-TDvxgjIk5usHD0i0wD_XftXLsLnvcKjoJgrrFsAY08-G8ZPlJNtHmogHqu4ZntX7l3nyZLi6ytcap1Algg-6bhuyDzGTts4pfj2Irp886qBch_4SLZIDYjAaVUTCk_yJ8y9M1r2SZUIbt5DPskjLBCSuL-2JDBa7pTaiDH1yfJgXAKmsaWGFvkz8wZeoR4n7',
      category: 'Mayores (Elite)',
      discipline: '100 Metros Planos',
      gender: 'Masculino',
      season: '2026'
    }
  ],
  results: [
    {
      pos: '01',
      athlete: 'Andrés Caicedo',
      category: 'Juvenil A',
      club: 'Club Velocidad Chocó',
      mark: '10.12s',
      event: 'Grand Prix Quibdó',
      date: '2026-04-12',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCx900aqjILNGxfTzZIl9C1EpOIf45CsGaQEqbC4csgVCGT4ny7XhNdH8hICbdvNlMaLUivRUK0XlA7CbW92QtCjcYLcjW52Dkmhr9cixuVToyWJr1fHEvt6NrALVAy-3MTRUgAYoz_FIWcMmO6Q918NtgLVi9AG3soO-OmTfsnmN5mQpcOb5U6VV2Rf2LV6R1QigySLzU5QRfqvuJiixmGdsrvnzMHSH3WNZRdt5M4BN0wmE8vPq4KOxAe5m4QZHovPB8PGFR8Ndfs',
      isGold: true
    },
    {
      pos: '02',
      athlete: 'Mariana Murillo',
      category: 'Élite',
      club: 'Istmina Track Club',
      mark: '10.28s',
      event: 'Interclubes Istmina',
      date: '2026-04-05',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAFKDb8E-dNE8nsZeoqRulPcRkewjWh96c2ARqaLYjkFNnZqduqSK7pNkl-7o2FPSpRpTYRyU2sBNPQe7_f2qRZCo3kZKCnX1-AHh6fMIvmR1i1mr1pVOD4jAl7qrumC5PVrD9PqNv9ID185mL986Af-G7hcwRIoS5lRzzF2H2PACKOGdla8sEKK2fpZa7S6sZc8VS52fR2yt_Y-gyyzDX8X9_3PH9MeVbUV99OKghKbYX45dxvOvp1YMyrkxbYYB3pYfKLD0RiiS1q'
    },
    {
      pos: '03',
      athlete: 'Kevin Moreno',
      category: 'Juvenil B',
      club: 'Titanes del Atrato',
      mark: '10.45s',
      event: 'Grand Prix Quibdó',
      date: '2026-04-12',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCaHYDPf8aKxFat62IeOBFERcY3C4rj36O8wpqfvELWV_q1qK83JbyWiQdbVbfM3oNwvjoZzCu0Wrtln52_v1zVIBF_HErpkC9aeB7zRCukFRfvKzJMATUe-syRg3hAmatCHtnBIKZYHiCRnwkKJK3EfbYitncQrYKKZiQEYvcgHBXlkmIzokACLrwG7FikCy9OiAlnt-z2wV2aJrq8nLWjCcFf-v9p7r9g7iOZrizUE2Jd5ROWZRFElSERDyzsz90RlIUb1SatxAdA'
    }
  ],
  documents: [
    {
      title: 'Reglamento General',
      description: 'Normativa oficial de la liga (PDF).',
      href: '#',
      category: 'Normativo',
      date: '2026-04-01'
    },
    {
      title: 'Calendario Oficial 2026',
      description: 'Fechas, sedes y categorías (PDF).',
      href: '#',
      category: 'Competencias',
      date: '2026-03-15'
    },
    {
      title: 'Formato de Inscripción',
      description: 'Formulario para clubes y atletas (PDF).',
      href: '#',
      category: 'Formatos',
      date: '2026-02-10'
    }
  ]
  ,
  convocatorias: [
    {
      title: 'Selectivo Nacional 2026',
      category: 'Selección',
      status: 'Abierta',
      openDate: '2026-04-01',
      closeDate: '2026-04-25',
      location: 'Quibdó',
      audience: 'Clubes y atletas',
      description: 'Convocatoria para postulaciones al proceso selectivo nacional.',
      requirements: ['Carta del club', 'Documento de identidad', 'Soporte de marca', 'Autorización tratamiento de datos'],
      categories: ['U18', 'U20', 'Mayores'],
      imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=4000&auto=format&fit=crop'
    },
    {
      title: 'Concentración Departamental de Talentos',
      category: 'Talentos',
      status: 'Próximamente',
      openDate: '2026-05-10',
      closeDate: '2026-05-25',
      location: 'Istmina',
      audience: 'Atletas',
      description: 'Proceso de identificación y seguimiento de talentos para semilleros.',
      requirements: ['Formulario de salud', 'Autorización acudiente (si aplica)'],
      categories: ['U14', 'U16']
    }
  ],
  competencias: [
    {
      title: 'Campeonato Departamental de Velocidad',
      status: 'Confirmado',
      date: '2026-05-04',
      location: 'Quibdó',
      type: 'Oficial',
      description: 'Evento oficial de pista enfocado en pruebas de velocidad y relevos.',
      imageUrl: 'https://images.unsplash.com/photo-1530549387074-d56a99e148c9?w=4000&auto=format&fit=crop',
      downloads: [
        { label: 'Circular oficial', href: '#' },
        { label: 'Manual técnico', href: '#' }
      ]
    },
    {
      title: 'Copa de Saltos y Lanzamientos',
      status: 'Confirmado',
      date: '2026-06-12',
      location: 'Istmina',
      type: 'Avalada',
      description: 'Competencia para pruebas de campo con participación de clubes afiliados.',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=4000&auto=format&fit=crop',
      downloads: [{ label: 'Circular oficial', href: '#' }]
    }
  ],
  clubs: [
    {
      name: 'Club Atlético Quibdó',
      municipality: 'Quibdó',
      athletes: 24,
      status: 'Activo',
      coach: 'Carlos Palacios',
      category: 'Velocidad y relevos',
      imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=4000&auto=format&fit=crop'
    },
    {
      name: 'Club San Juan Racing',
      municipality: 'San Juan',
      athletes: 18,
      status: 'Activo',
      coach: 'María López',
      category: 'Resistencia',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=4000&auto=format&fit=crop'
    },
    {
      name: 'Club Atrato Veloz',
      municipality: 'Quibdó',
      athletes: 15,
      status: 'Activo',
      coach: 'José Rivas',
      category: 'Velocidad pura',
      imageUrl: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=4000&auto=format&fit=crop'
    },
    {
      name: 'Club Istmina Corre',
      municipality: 'Istmina',
      athletes: 12,
      status: 'En revisión',
      coach: 'Ana Mosquera',
      category: 'Saltos y campo'
    },
    {
      name: 'Club Condoto Sport',
      municipality: 'Condoto',
      athletes: 10,
      status: 'Activo',
      coach: 'Pedro Valencia',
      category: 'Fondo / medio fondo'
    },
    {
      name: 'Club Tadó Atlético',
      municipality: 'Tadó',
      athletes: 8,
      status: 'Activo',
      coach: 'Luis Murillo',
      category: 'Formación juvenil'
    }
  ]
};

function normalizeStore(raw: unknown): Store {
  const input = (raw && typeof raw === 'object' ? (raw as Partial<Store>) : {}) as Partial<Store>;

  const settings = (input.settings ?? {}) as Partial<Store['settings']>;
  const hero = (input.hero ?? {}) as Partial<Store['hero']>;
  const federation = (input.federation ?? {}) as Partial<Store['federation']>;
  const publicSite = (input.publicSite ?? {}) as Partial<Store['publicSite']>;
  const home = (input.home ?? {}) as Partial<Store['home']>;
  const newsPage = ((input as any).newsPage ?? {}) as Partial<Store['newsPage']>;
  const blogPage = ((input as any).blogPage ?? {}) as Partial<Store['blogPage']>;
  const clubs = Array.isArray(input.clubs) ? input.clubs : defaultStore.clubs;
  const convocatorias = Array.isArray(input.convocatorias) ? input.convocatorias : defaultStore.convocatorias;
  const competencias = Array.isArray(input.competencias) ? input.competencias : defaultStore.competencias;
  const news = Array.isArray((input as any).news) ? (input as any).news : (defaultStore as any).news;
  const blogPosts = Array.isArray((input as any).blogPosts) ? (input as any).blogPosts : (defaultStore as any).blogPosts;
  const results = Array.isArray((input as any).results) ? (input as any).results : (defaultStore as any).results;
  const rankings = Array.isArray((input as any).rankings) ? (input as any).rankings : (defaultStore as any).rankings;

  const normalized: Store = {
    ...defaultStore,
    ...input,
    settings: {
      ...defaultStore.settings,
      ...settings,
      social: {
        ...defaultStore.settings.social,
        ...(settings.social ?? {})
      }
    },
    hero: {
      ...defaultStore.hero,
      ...hero
    },
    home: {
      ...defaultStore.home,
      ...home,
      news: Array.isArray(home.news) && home.news.length ? home.news : defaultStore.home.news,
      stars: Array.isArray(home.stars) && home.stars.length ? home.stars : defaultStore.home.stars,
      eventHighlight: home.eventHighlight ?? defaultStore.home.eventHighlight,
      cta: home.cta ?? defaultStore.home.cta,
      sponsors: Array.isArray((home as any).sponsors)
        ? (home as any).sponsors.map((s: any) => ({
            name: String(s?.name ?? ''),
            href: String(s?.href ?? '#'),
            logoUrl: typeof s?.logoUrl === 'string' && s.logoUrl.trim() ? s.logoUrl.trim() : undefined
          }))
        : defaultStore.home.sponsors
    },
    federation: {
      ...defaultStore.federation,
      ...federation
    },
    publicSite: {
      ...defaultStore.publicSite,
      ...publicSite,
      pageHeroes: {
        ...defaultStore.publicSite.pageHeroes,
        ...(publicSite.pageHeroes ?? {})
      },
      laLiga: {
        ...defaultStore.publicSite.laLiga,
        ...(publicSite.laLiga ?? {}),
        principles: Array.isArray(publicSite.laLiga?.principles)
          ? publicSite.laLiga!.principles.map((item: any) => ({
              icon: String(item?.icon ?? 'star'),
              title: String(item?.title ?? ''),
              desc: String(item?.desc ?? '')
            }))
          : defaultStore.publicSite.laLiga.principles,
        governanceItems: Array.isArray(publicSite.laLiga?.governanceItems)
          ? publicSite.laLiga!.governanceItems.map((item: any) => ({
              label: String(item?.label ?? ''),
              title: String(item?.title ?? '')
            }))
          : defaultStore.publicSite.laLiga.governanceItems,
        normativeDocs: Array.isArray(publicSite.laLiga?.normativeDocs)
          ? publicSite.laLiga!.normativeDocs.map((item: any) => ({
              icon: String(item?.icon ?? 'menu_book'),
              title: String(item?.title ?? ''),
              href: String(item?.href ?? '/documentos')
            }))
          : defaultStore.publicSite.laLiga.normativeDocs
      }
    },
    newsPage: {
      ...defaultStore.newsPage,
      ...newsPage
    },
    blogPage: {
      ...defaultStore.blogPage,
      ...blogPage
    },
    news: Array.isArray(news)
      ? news.map((n: any) => ({
          slug: String(n?.slug ?? ''),
          title: String(n?.title ?? ''),
          excerpt: String(n?.excerpt ?? ''),
          date: String(n?.date ?? ''),
          category: String(n?.category ?? ''),
          imageUrl: typeof n?.imageUrl === 'string' && n.imageUrl.trim() ? n.imageUrl.trim() : undefined,
          body: Array.isArray(n?.body) ? n.body.map((x: any) => String(x)) : []
        }))
      : (defaultStore as any).news,
    blogPosts: Array.isArray(blogPosts)
      ? blogPosts.map((p: any) => ({
          slug: String(p?.slug ?? ''),
          type: String(p?.type ?? ''),
          title: String(p?.title ?? ''),
          excerpt: String(p?.excerpt ?? ''),
          date: String(p?.date ?? ''),
          tags: Array.isArray(p?.tags) ? p.tags.map((x: any) => String(x)) : [],
          imageUrl: typeof p?.imageUrl === 'string' && p.imageUrl.trim() ? p.imageUrl.trim() : undefined,
          body: Array.isArray(p?.body) ? p.body.map((x: any) => String(x)) : []
        }))
      : (defaultStore as any).blogPosts,
    events: Array.isArray(input.events)
      ? input.events.map((e: any) => ({
          ...e,
          category: typeof e?.category === 'string' ? e.category : ''
        }))
      : defaultStore.events,
    records: Array.isArray(input.records) ? input.records : defaultStore.records,
    rankings: Array.isArray(rankings)
      ? rankings.map((r: any) => ({
          rank: String(r?.rank ?? '').padStart(2, '0'),
          athlete: String(r?.athlete ?? ''),
          club: String(r?.club ?? ''),
          mark: String(r?.mark ?? ''),
          status: String(r?.status ?? 'Verificado'),
          imageUrl: typeof r?.imageUrl === 'string' && r.imageUrl.trim() ? r.imageUrl.trim() : undefined,
          category: String(r?.category ?? ''),
          discipline: String(r?.discipline ?? ''),
          gender: String(r?.gender ?? ''),
          season: String(r?.season ?? '')
        }))
      : (defaultStore as any).rankings,
    results: Array.isArray(results)
      ? results.map((r: any) => ({
          pos: String(r?.pos ?? '').padStart(2, '0'),
          athlete: String(r?.athlete ?? ''),
          category: String(r?.category ?? ''),
          club: String(r?.club ?? ''),
          mark: String(r?.mark ?? ''),
          event: String(r?.event ?? ''),
          date: String(r?.date ?? ''),
          imageUrl: typeof r?.imageUrl === 'string' && r.imageUrl.trim() ? r.imageUrl.trim() : undefined,
          downloadUrl: typeof r?.downloadUrl === 'string' && r.downloadUrl.trim() ? r.downloadUrl.trim() : undefined,
          isGold: Boolean(r?.isGold)
        }))
      : (defaultStore as any).results,
    documents: Array.isArray(input.documents) ? input.documents : defaultStore.documents,
    convocatorias,
    competencias,
    clubs
  };

  return normalized;
}

async function ensureStore() {
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(defaultStore, null, 2), 'utf-8');
  }
}

export async function readStore(): Promise<Store> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  const normalized = normalizeStore(parsed);

  // Persist migrations (when store.json is from an older schema)
  const current = JSON.stringify(parsed);
  const next = JSON.stringify(normalized);
  if (current !== next) {
    await fs.writeFile(STORE_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
  }

  return normalized;
}

export async function writeStore(data: Store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
