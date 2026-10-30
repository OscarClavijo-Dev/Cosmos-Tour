export enum ThemeMode {
  Dark = 'dark',
  Light = 'light'
}

export enum FlightStage {
  Lanzamiento = 'lanzamiento',
  GravedadCero = 'gravedad_cero',
  Ventana = 'ventana'
}

export enum AmenityCategory {
  All = 'all',
  Suites = 'suites',
  Gastronomia = 'gastronomia',
  Observatorio = 'observatorio',
  Academia = 'academia'
}

export enum DestinationKey {
  Luna = 'luna',
  Marte = 'marte',
  Iss = 'iss'
}

export enum PlanetKey {
  Tierra = 'tierra',
  Marte = 'marte',
  Luna = 'luna',
  Jupiter = 'jupiter',
  Saturno = 'saturno'
}

export interface DestinationFile {
  key: DestinationKey;
  departure: string;
  title: string;
  formOptionValue: string;
  subtitle: string;
  dist: string;
  duration: string;
  gravity: string;
  temp: string;
  price: string;
  cardDesc: string;
  cardHighlights: string[];
  highlights: string[];
  luxuries: string[];
}

export interface PlanetFicha {
  key: PlanetKey;
  targetKey: string;
  name: string;
  shortName: string;
  sub: string;
  img: string;
  thumbWebp: string;
  dist: string;
  diam: string;
  grav: string;
  temp: string;
  viaje: string;
  desc: string;
}

export interface PoiItem {
  id: string;
  modifierClass: string;
  symbol: string;
  label: string;
  tooltip: string;
  img: string;
  title: string;
  meta: string;
  story: string;
}

export interface AmenitySpec {
  name: string;
  val: string;
}

export interface AmenityItem {
  id: string;
  category: AmenityCategory;
  webp640: string;
  webpLarge: string;
  webpLargeWidth: string;
  jpg: string;
  alt: string;
  badgeLeft: string;
  badgeRight: string;
  title: string;
  subtitle: string;
  desc: string;
  specs: AmenitySpec[];
}

export interface ComparisonRow {
  feature: string;
  apex: string;
  artemis: string;
  sovereign: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  missionTag: string;
}

export interface PremiumExperience {
  id: string;
  inputId: string;
  nombre: string;
  precio: number;
}

export interface ReservaDraft {
  nombreCompleto: string;
  correoElectronico: string;
  numeroPasaporte: string;
  expedicionSeleccionada: string;
  categoriaSuite: string;
  ventanaDespegue: string;
  rolManifiesto: string;
  terminosAceptados: boolean;
  timestamp: string;
}

export interface PasajeroConvertido {
  convertido: boolean;
  timestamp: string;
  destinoConfirmado: string;
  codigoMision: string;
  nombrePasajero: string;
  ventanaDespegue: string;
  categoriaSuite: string;
  rolManifiesto?: string;
  experienciasExtras: string[];
  totalExperienciasUSD: number;
}

export interface VisorOrbitalState {
  altitud: number;
  velocidad: number;
  periodo: number;
  destinoActivo: string;
  timestamp: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}
