import {
  AmenityCategory,
  AmenityItem,
  ComparisonRow,
  DestinationFile,
  DestinationKey,
  PlanetFicha,
  PlanetKey,
  PoiItem,
  PremiumExperience,
  TestimonialItem
} from '../types';

export const DESTINATION_FILES: Record<DestinationKey, DestinationFile> = {
  [DestinationKey.Luna]: {
    key: DestinationKey.Luna,
    departure: 'Noviembre 2026',
    title: 'La Luna',
    formOptionValue: 'La Luna',
    subtitle: 'Expedición Cis-Lunar Artemisa Prime',
    dist: '384,400 KM',
    duration: '6 Días Terrestres',
    gravity: '0.16 G',
    temp: '-53 °C',
    price: '$1,250,000 USD',
    cardDesc:
      'Aterrizaje en el Cráter Shackleton con pernocta en suites presurizadas de titanio translúcido. Experimente caminatas lunares con vista perpetua a la Tierra.',
    cardHighlights: [
      'Almuerzo privado en el borde del Polo Sur Lunar',
      'Paseo extravehicular (EVA) en baja gravedad con traje a medida'
    ],
    highlights: [
      'Aterrizaje en el Cráter Shackleton con pernocta presurizada',
      'Caminata lunar (EVA) con traje a medida en baja gravedad',
      'Almuerzo privado en el borde del Polo Sur Lunar'
    ],
    luxuries: [
      'Suite Celestial Sovereign de 42 m³ presurizada a 1 ATM',
      'Chef personal y cava de colección a bordo',
      'Enlace cuántico continuo con la Tierra'
    ]
  },
  [DestinationKey.Marte]: {
    key: DestinationKey.Marte,
    departure: 'Marzo 2027',
    title: 'Marte',
    formOptionValue: 'Marte',
    subtitle: 'Odisea Valles Marineris & Oasis Rojo',
    dist: '225,000,000 KM',
    duration: '180 Días de Travesía',
    gravity: '0.38 G',
    temp: '-63 °C',
    price: '$4,800,000 USD',
    cardDesc:
      'La expedición cumbre de la civilización humana. Cruce el espacio interplanetario a bordo de nuestro crucero de ultra-lujo y explore cañones titánicos.',
    cardHighlights: [
      'Travesía en crucero con anillo de gravedad centrífuga 1g',
      'Alojamiento en el primer Domo Biosférico Geodésico'
    ],
    highlights: [
      'Travesía en crucero con anillo de gravedad centrífuga 1g',
      'Exploración de los cañones de Valles Marineris',
      'Estancia en el Domo Biosférico Geodésico'
    ],
    luxuries: [
      'Stateroom con cúpula de observación privada',
      'Laboratorio culinario y huerta hidropónica a bordo',
      'Retransmisión holográfica de eventos en la Tierra'
    ]
  },
  [DestinationKey.Iss]: {
    key: DestinationKey.Iss,
    departure: 'Diciembre 2026',
    title: 'Estación Espacial',
    formOptionValue: 'Estación Espacial Internacional',
    subtitle: 'Residencia Apex Cupola',
    dist: '408 KM (Órbita Baja)',
    duration: '10 Días en Órbita',
    gravity: '0.00 G',
    temp: '-120 °C (exterior)',
    price: '$750,000 USD',
    cardDesc:
      'Flote en gravedad cero absoluta mientras contempla 16 amaneceres y atardeceres cada 24 horas con el mirador Cupola reservado en exclusividad.',
    cardHighlights: [
      '16 amaneceres diarios observando auroras polares',
      'Entrenamiento acrobático y meditación en microgravedad'
    ],
    highlights: [
      '16 amaneceres diarios observando auroras polares',
      'Flote en gravedad cero absoluta (microgravedad)',
      'Meditación y entrenamiento acrobático en órbita'
    ],
    luxuries: [
      'Residencia exclusiva en la Cupola panorámica 360°',
      'Pod privado de ingravidez con ventana de cuarzo de zafiro',
      'Enlace láser de 10 Gbps con la Tierra'
    ]
  }
};

export const PLANET_FICHAS: Record<PlanetKey, PlanetFicha> = {
  [PlanetKey.Tierra]: {
    key: PlanetKey.Tierra,
    targetKey: 'earth',
    name: 'La Tierra',
    shortName: 'Tierra',
    sub: 'PLANETA DE ORIGEN · ÓRBITA DE SALIDA',
    img: './assets/imagenes/planeta-tierra.jpg',
    thumbWebp: './assets/imagenes/planeta-tierra-160.webp',
    dist: '0 km',
    diam: '12,742 km',
    grav: '1.00 g',
    temp: '+15 °C',
    viaje: 'Punto de partida',
    desc: 'El único planeta conocido con vida. Desde 400 km de altitud, su curvatura azul y las auroras polares se despliegan en el ventanal: el mejor recordatorio de por qué valió la pena partir.'
  },
  [PlanetKey.Marte]: {
    key: PlanetKey.Marte,
    targetKey: 'mars',
    name: 'Marte',
    shortName: 'Marte',
    sub: 'ODISEA VALLES MARINERIS · MISIÓN CT-2026-MAR',
    img: './assets/imagenes/planeta-marte.jpg',
    thumbWebp: './assets/imagenes/planeta-marte-326.webp',
    dist: '225 M km',
    diam: '6,779 km',
    grav: '0.38 g',
    temp: '-63 °C',
    viaje: '180 días',
    desc: 'El destino cumbre de la civilización humana: cañones de 4,000 km, el Monte Olimpo —el más alto del sistema solar— y el primer domo biosférico geodésico reservado para nuestros tripulantes.'
  },
  [PlanetKey.Luna]: {
    key: PlanetKey.Luna,
    targetKey: 'luna',
    name: 'La Luna',
    shortName: 'La Luna',
    sub: 'EXPEDICIÓN CIS-LUNAR ARTEMISA PRIME',
    img: './assets/imagenes/planeta-luna.jpg',
    thumbWebp: './assets/imagenes/planeta-luna-229.webp',
    dist: '384,400 km',
    diam: '3,474 km',
    grav: '0.16 g',
    temp: '-20 °C',
    viaje: '3 días',
    desc: 'Aterrizaje en el Cráter Shackleton con pernocta en suites presurizadas de titanio. Caminatas lunares con vista perpetua a la Tierra y almuerzo privado en el borde del Polo Sur.'
  },
  [PlanetKey.Jupiter]: {
    key: PlanetKey.Jupiter,
    targetKey: 'jupiter',
    name: 'Júpiter',
    shortName: 'Júpiter',
    sub: 'OBSERVATORIO JOVIANO · PRÓXIMA TEMPORADA',
    img: './assets/imagenes/planeta-jupiter.jpg',
    thumbWebp: './assets/imagenes/planeta-jupiter-480.webp',
    dist: '628 M km',
    diam: '139,820 km',
    grav: '2.40 g',
    temp: '-108 °C',
    viaje: 'Próximamente',
    desc: 'El gigante gasoso con la Gran Mancha Roja, un huracán mayor que la Tierra. Nuestro programa de reconocimiento joviano abrirá reservas tras consolidar la ruta cis-joviana.'
  },
  [PlanetKey.Saturno]: {
    key: PlanetKey.Saturno,
    targetKey: 'saturno',
    name: 'Saturno',
    shortName: 'Saturno',
    sub: 'VIDRIERAS DE LOS ANILLOS · PRÓXIMA TEMPORADA',
    img: './assets/imagenes/planeta-saturno.jpg',
    thumbWebp: './assets/imagenes/planeta-saturno-352.webp',
    dist: '1.4 B km',
    diam: '116,460 km',
    grav: '1.04 g',
    temp: '-139 °C',
    viaje: 'Próximamente',
    desc: 'Sus anillos de hielo se extienden 280,000 km. El programa de cruceros al sistema saturniano está en fase de certificación para vuelos de ultra-larga travesía.'
  }
};

export const ZERO_G_ITEMS_INITIAL = [
  { id: 'zg-item-1', emoji: '🍸', label: 'Copa Molecular' },
  { id: 'zg-item-2', emoji: '🎖️', label: 'Insignia Cosmos' },
  { id: 'zg-item-3', emoji: '🪐', label: 'Esfera Cuántica' },
  { id: 'zg-item-4', emoji: '⏱️', label: 'Cronómetro Titanio' },
  { id: 'zg-item-5', emoji: '🌸', label: 'Flor Hidropónica' }
];

export const POI_ITEMS: PoiItem[] = [
  {
    id: 'nebula',
    modifierClass: 'poi-marker--nebula',
    symbol: '★',
    label: 'Nebulosa de Orión (M42)',
    tooltip: 'Nebulosa de Orión (M42) - 1,344 años luz',
    img: './assets/imagenes/nebulosa-orion.jpg',
    title: 'Nebulosa de Orión (M42)',
    meta: '1,344 AÑOS LUZ · CUNA ESTELAR',
    story:
      'A 1,344 años luz de la Tierra, M42 es la cuna estelar más cercana: una gigantesca nube de gas donde nacen estrellas aún hoy. Los antiguos la reconocieron como la espada de Orión, y su brillo la hace visible a simple vista incluso desde la ciudad. Desde la cupola de Cosmos Tour, su verdadero color verde-azulado —invisible al ojo humano en tierra— se revela en toda su magnitud.'
  },
  {
    id: 'pleiades',
    modifierClass: 'poi-marker--pleiades',
    symbol: '✦',
    label: 'Cúmulo de las Pléyades',
    tooltip: 'Cúmulo de las Pléyades - 444 años luz',
    img: './assets/imagenes/pleiades.jpg',
    title: 'Cúmulo de las Pléyades',
    meta: '444 AÑOS LUZ · SIETE HERMANAS',
    story:
      'Conocidas como Las Siete Hermanas o Las Pléyades, estas estrellas jóvenes —de apenas 100 millones de años— brillan a 444 años luz. Marineros de todas las civilizaciones las usaron para orientarse y aparecen en la mitología griega, japonesa y de los pueblos andinos. Su cúmulo azul se dispersará dentro de 250 millones de años: presencie, desde órbita, un instante irrepetible en términos cósmicos.'
  },
  {
    id: 'aurora',
    modifierClass: 'poi-marker--aurora',
    symbol: '❇',
    label: 'Aurora Australis Terrestre',
    tooltip: 'Aurora Australis Terrestre - 110 km altitud',
    img: './assets/imagenes/aurora-australis.jpg',
    title: 'Aurora Australis',
    meta: '110 KM DE ALTITUD · SHOW DE PARTÍCULAS',
    story:
      'A 110 km de altitud, partículas del viento solar chocan contra la magnetosfera terrestre y excitan los átomos de oxígeno, que devuelven esa luz verde y roja característica. Visible solo desde el hemisferio sur, la Australis se despliega sobre la Antártida como una cortina viva. En órbita baja la vea correr a 28,000 km/h sobre el planeta.'
  }
];

export const AMENITIES_LIST: AmenityItem[] = [
  {
    id: 'drawer-suites',
    category: AmenityCategory.Suites,
    webp640: './assets/imagenes/amenity-suite-640.webp',
    webpLarge: './assets/imagenes/amenity-suite-1280.webp',
    webpLargeWidth: '1280w',
    jpg: './assets/imagenes/amenity-suite.jpg',
    alt: 'Interior de un módulo de la Estación Espacial Internacional con equipos, cables y portas en todas las paredes',
    badgeLeft: 'COSMOS TOUR EXCLUSIVE',
    badgeRight: 'CLASE SUPERIOR',
    title: 'Suites Presurizadas "Celestial Sovereign"',
    subtitle: 'Titanio pulido y descanso ingrávido',
    desc: 'Espacios habitacionales privados presurizados a 1 ATM con control acústico cuántico, aislamiento térmico multiespectral y camas ergonómicas que recrean el descanso más placentero sin puntos de presión.',
    specs: [
      { name: 'Volumen Habitable', val: '42 m³' },
      { name: 'Presión Interior', val: '101.3 kPa (1 ATM)' },
      { name: 'Nivel Acústico', val: '< 38 dB' },
      { name: 'Blindaje Radiación', val: 'Polietileno Ultra-Alto Peso' }
    ]
  },
  {
    id: 'drawer-gastronomia',
    category: AmenityCategory.Gastronomia,
    webp640: './assets/imagenes/amenity-gastronomia-640.webp',
    webpLarge: './assets/imagenes/amenity-gastronomia-1280.webp',
    webpLargeWidth: '1280w',
    jpg: './assets/imagenes/amenity-gastronomia.jpg',
    alt: 'Raciones de comida espacial envasadas al vacío, cubos de alimento, tijeras y dispensador de agua sobre fondo azul',
    badgeLeft: '3 ESTRELLAS MICHELIN',
    badgeRight: 'MARIDAJE CÓSMICO',
    title: 'Alta Cocina Molecular en Microgravedad',
    subtitle: 'Menús gastronómicos adaptados a 0g',
    desc: 'En microgravedad, el paladar humano experimenta cambios sensoriales sutiles. Nuestros chefs consultores han formulado una sinfonía culinaria con esferificaciones de caldos cósmicos y copas de tensión capilar.',
    specs: [
      { name: 'Servicio', val: 'En suite o salón' },
      { name: 'Vajilla', val: 'Titanio anodizado' },
      { name: 'Conservación', val: 'Criopreservación de vapor' },
      { name: 'Nutrición', val: 'Calibración biométrica' }
    ]
  },
  {
    id: 'drawer-observatorio',
    category: AmenityCategory.Observatorio,
    webp640: './assets/imagenes/amenity-cupola-640.webp',
    webpLarge: './assets/imagenes/amenity-cupola-1279.webp',
    webpLargeWidth: '1279w',
    jpg: './assets/imagenes/amenity-cupola.jpg',
    alt: 'Astronauta fotografiándose frente al ventanal circular de la cúpula con la Tierra, océanos y nubes al otro lado',
    badgeLeft: 'VISTA 360° CONTINUA',
    badgeRight: 'ZAFIRO SINTÉTICO',
    title: 'Cupola Panorámica 360° & Club Privado',
    subtitle: 'El salón social más exclusivo del universo',
    desc: 'El centro de encuentro del crucero: una monumental cúpula de observación con vistas ininterrumpidas a la curvatura planetaria, nebulosas distantes y auroras polares, equipada con telescopio espectral.',
    specs: [
      { name: 'Ángulo de Visión', val: '360° continuo' },
      { name: 'Capacidad', val: 'Máx. 8 tripulantes' },
      { name: 'Óptica', val: 'Multicapa atérmica' },
      { name: 'Filtro Radiación', val: '99.98% de bloqueo' }
    ]
  },
  {
    id: 'drawer-academia',
    category: AmenityCategory.Academia,
    webp640: './assets/imagenes/amenity-academia-640.webp',
    webpLarge: './assets/imagenes/amenity-academia-1280.webp',
    webpLargeWidth: '1280w',
    jpg: './assets/imagenes/amenity-academia.jpg',
    alt: 'Tres especialistas asisten a un astronauta a colocarse el traje espacial blanco a bordo de la estación',
    badgeLeft: 'PREPARACIÓN VIP',
    badgeRight: 'SASTRERÍA BALÍSTICA',
    title: 'Academia & Trajes de Alta Costura Espacial',
    subtitle: 'Instrucción civil y trajes a medida',
    desc: 'Antes del despegue, los pasajeros completan 3 días de inmersión en nuestro centro privado. Trajes presurizados confeccionados a medida que combinan seguridad balística con ergonomía de alta sastrería.',
    specs: [
      { name: 'Duración Pre-Vuelo', val: '3 a 5 días' },
      { name: 'Material Traje', val: 'Kevlar & Fibra Nomex' },
      { name: 'Instructores', val: 'Veteranos ESA / NASA' },
      { name: 'Acompañantes', val: 'Hasta 2 en base' }
    ]
  }
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Tipo de Alojamiento',
    apex: 'Pod Privado con Ventana',
    artemis: 'Suite Cis-Lunar 42 m³',
    sovereign: 'Stateroom con Domo Biosférico'
  },
  {
    feature: 'Paseo Extravehicular (EVA)',
    apex: 'Simulación Virtual 8K',
    artemis: 'EVA Real en Superficie Lunar',
    sovereign: 'Múltiples Salidas en Cañones'
  },
  {
    feature: 'Gastronomía Personalizada',
    apex: 'Menú 3 Estrellas Michelin',
    artemis: 'Chef Personal + Cava',
    sovereign: 'Laboratorio Culinario & Huerta'
  },
  {
    feature: 'Enlace con la Tierra',
    apex: 'Láser 10 Gbps',
    artemis: 'Enlace Cuántico Continuo',
    sovereign: 'Retransmisión Holográfica'
  },
  {
    feature: 'Traje Confeccionado',
    apex: 'Presión Ligero',
    artemis: 'Superficie Lunar a Medida',
    sovereign: 'Armadura Térmica Blindada'
  }
];

export const TESTIMONIALS_LIST: TestimonialItem[] = [
  {
    id: 'test-1',
    quote:
      '"El instante en que la Tierra reapareció tras el ventanal de cuarzo de zafiro no se compara con nada que haya vivido. La suite presurizada, el silencio absoluto y el amanecer sobre el cráter Shackleton superaron cada expectativa que había construido durante años de anticipación."',
    authorName: 'Isabela Fontaine Rivas',
    authorRole: 'Directora de Arte · Ciudad de México, México',
    missionTag: 'MISIÓN CT-2026-LUN-014'
  },
  {
    id: 'test-2',
    quote:
      '"Diez días en microgravedad reordenan por completo la mente. El equipo médico estuvo presente en cada fase y la Cupola Panorámica, reservada en exclusividad para nuestra familia, convirtió cada órbita en una cena privada frente a la curvatura del planeta."',
    authorName: 'Rafael Augusto Miranda Cardona',
    authorRole: 'CEO de Fintech Andina · Bogotá, Colombia',
    missionTag: 'MISIÓN CT-2026-EEI-087'
  },
  {
    id: 'test-3',
    quote:
      '"A mis 58 años temía el despegue; la secuencia de ignición fue sorprendentemente suave y los asientos de fibra de carbono absorben la vibración mejor que cualquier primer clase aérea. Ver Valles Marineris desde la cupola es algo que intento describir desde entonces sin éxito."',
    authorName: 'Claire Bouchard Lefèvre',
    authorRole: 'Cirujana Cardiovascular Consultora · Lyon, Francia',
    missionTag: 'MISIÓN CT-2027-MAR-006'
  },
  {
    id: 'test-4',
    quote:
      '"Reservé la expedición como regalo de jubilación y terminó siendo el viaje definitorio de mi vida. La atención al detalle —desde el traje confeccionado a medida hasta el menú molecular en ingravidez— justifica con creces la inversión."',
    authorName: 'Hiroshi Tanaka Endo',
    authorRole: 'Ingeniero Jefe de Robótica (Jubilado) · Kioto, Japón',
    missionTag: 'MISIÓN CT-2026-LUN-031'
  }
];

export const EXPERIENCIAS_CATALOGO: PremiumExperience[] = [
  {
    id: 'cena-molecular',
    inputId: 'exp-cena-molecular',
    nombre: 'Cena Molecular con Chef Michelin',
    precio: 15000
  },
  {
    id: 'cupola-panoramica',
    inputId: 'exp-cupola-panoramica',
    nombre: 'Sesión Privada en Cupola Panorámica',
    precio: 8500
  },
  {
    id: 'eva-personalizado',
    inputId: 'exp-eva-personalizado',
    nombre: 'Entrenamiento EVA Personalizado',
    precio: 22000
  },
  {
    id: 'fotografia-zero-g',
    inputId: 'exp-fotografia-zero-g',
    nombre: 'Fotografía Profesional en Gravedad Cero',
    precio: 5000
  },
  {
    id: 'suite-upgrade',
    inputId: 'exp-suite-upgrade',
    nombre: 'Suite Celestial Sovereign Upgrade',
    precio: 50000
  }
];
