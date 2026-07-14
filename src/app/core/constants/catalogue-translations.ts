import type { CatalogueValue } from '../../shared-domain/models/catalogue-value';

export const CATALOGUE_TRANSLATIONS: Record<string, string> = {
  FAIR: 'Feria',
  EVENT: 'Evento',
  PHYSICAL_EVENT: 'Evento Físico',
  VIRTUAL_EVENT: 'Evento Virtual',
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
  INVITED: 'Invitado',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TWITTER: 'Twitter',
  LINKEDIN: 'LinkedIn',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram',
};

export function translateCatalogueValues(values: CatalogueValue[]): CatalogueValue[] {
  return values.map((v) => ({
    ...v,
    name: CATALOGUE_TRANSLATIONS[v.code] ?? v.name,
  }));
}
