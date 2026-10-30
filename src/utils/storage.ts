import { DESTINATION_FILES, EXPERIENCIAS_CATALOGO } from '../data/catalog';
import { DestinationKey, PasajeroConvertido, ReservaDraft } from '../types';

export const THEME_STORAGE_KEY = 'cosmos-tour-theme';
export const RESERVA_ACTIVA_KEY = 'cosmostour_reserva_activa';
export const PASAJERO_CONVERTIDO_KEY = 'cosmostour_pasajero_convertido';
export const EXPERIENCIAS_EXTRAS_KEY = 'cosmostour_experiencias_extras';
export const VISOR_SESSION_KEY = 'cosmostour_visor_orbital';
export const BACKUP_RESERVA_PREFIX = 'cosmostour_reserva_backup_';
export const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mjyyolgb';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function formatDate(
  date: Date | string = new Date(),
  tipo: 'timestamp' | 'ventana' | 'fecha_mision' = 'timestamp'
): string {
  try {
    const fecha = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(fecha.getTime())) {
      return typeof date === 'string' ? date : '';
    }
    const MESES = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    if (tipo === 'ventana') {
      return `${MESES[fecha.getMonth()]} ${anio}`;
    }
    if (tipo === 'fecha_mision') {
      return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${anio}`;
    }
    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  } catch {
    return '';
  }
}

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function removeStorage(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function limpiarBackupsAntiguos(dias = 30): void {
  try {
    const ahora = Date.now();
    const umbralEdad = dias * 24 * 60 * 60 * 1000;
    const respaldos: { clave: string; timestamp: number }[] = [];

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const clave = window.localStorage.key(i);
      if (!clave || !clave.startsWith(BACKUP_RESERVA_PREFIX)) {
        continue;
      }
      const timestamp = Number(clave.slice(BACKUP_RESERVA_PREFIX.length));
      respaldos.push({
        clave,
        timestamp: Number.isFinite(timestamp) ? timestamp : 0
      });
    }

    respaldos.sort((a, b) => b.timestamp - a.timestamp);
    const MAX_RESPALDOS = 12;
    const clavesAEliminar = respaldos
      .filter((item, index) => ahora - item.timestamp > umbralEdad || index >= MAX_RESPALDOS)
      .map((item) => item.clave);

    clavesAEliminar.forEach((clave) => removeStorage(clave));
  } catch {
    // Ignore storage cleanup errors
  }
}

export function writeStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    limpiarBackupsAntiguos(30);
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): boolean {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function parsearJSONSeguro<T = unknown>(raw: string | null): T | null {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return null;
  }
  try {
    const datos = JSON.parse(raw);
    if (datos === null || typeof datos !== 'object') {
      return null;
    }
    return datos as T;
  } catch {
    return null;
  }
}

export function generateMissionCode(destination: string): string {
  const prefixes: Record<string, string> = {
    'La Luna': 'LUN',
    Marte: 'MAR',
    'Estación Espacial Internacional': 'EEI'
  };
  const prefix = prefixes[destination] || 'ORB';
  const semillaUnica = (Date.now() + Math.floor(Math.random() * 10000)) % 9000;
  const cuatroDigitos = String(semillaUnica + 1000);
  return `CT-2026-${prefix}-${cuatroDigitos}`;
}

export function obtenerIconoDestino(destino: string): string {
  const iconos: Record<string, string> = {
    'La Luna': '🌙',
    Marte: '🔴',
    'Estación Espacial Internacional': '🛰️'
  };
  return iconos[destino] || '🛸';
}

export function obtenerInfoDestino(destino: string): { dist: string; duration: string } {
  const claves: Record<string, DestinationKey> = {
    'La Luna': DestinationKey.Luna,
    Marte: DestinationKey.Marte,
    'Estación Espacial Internacional': DestinationKey.Iss
  };
  const key = claves[destino];
  const archivo = key ? DESTINATION_FILES[key] : undefined;
  return {
    dist: archivo ? archivo.dist : '—',
    duration: archivo ? archivo.duration : '—'
  };
}

export function leerIdsCarrito(): string[] {
  const raw = readStorage(EXPERIENCIAS_EXTRAS_KEY);
  const datos = parsearJSONSeguro<unknown>(raw);
  if (!Array.isArray(datos)) {
    return [];
  }
  return datos
    .map((item) => String(item))
    .filter((id) => EXPERIENCIAS_CATALOGO.some((item) => item.id === id));
}

export function guardarIdsCarrito(ids: string[]): boolean {
  return writeStorage(EXPERIENCIAS_EXTRAS_KEY, JSON.stringify(ids));
}

export function calcularTotalCarrito(ids: string[]): number {
  return ids.reduce((total, id) => {
    const experiencia = EXPERIENCIAS_CATALOGO.find((item) => item.id === id);
    return total + (experiencia ? experiencia.precio : 0);
  }, 0);
}

export function formatearMontoUSD(monto: number): string {
  return `$${monto.toLocaleString('en-US')} USD`;
}

export function obtenerExperienciasExtrasTextos(ids: string[]): string[] {
  return ids.map((id) => {
    const experiencia = EXPERIENCIAS_CATALOGO.find((item) => item.id === id);
    return experiencia
      ? `${experiencia.nombre} ($${experiencia.precio.toLocaleString('en-US')} USD)`
      : id;
  });
}

export function crearBackupReserva(): void {
  const raw = readStorage(RESERVA_ACTIVA_KEY);
  if (!raw) {
    return;
  }
  const claveBackup = `${BACKUP_RESERVA_PREFIX}${Date.now()}`;
  if (writeStorage(claveBackup, raw)) {
    limpiarBackupsAntiguos(30);
  }
}

export function leerPasajeroConvertido(): PasajeroConvertido | null {
  const raw = readStorage(PASAJERO_CONVERTIDO_KEY);
  const parsed = parsearJSONSeguro<PasajeroConvertido>(raw);
  if (parsed && parsed.convertido === true) {
    return parsed;
  }
  return null;
}

export function leerReservaBorrador(): ReservaDraft | null {
  const raw = readStorage(RESERVA_ACTIVA_KEY);
  return parsearJSONSeguro<ReservaDraft>(raw);
}
