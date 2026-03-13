export const APP_NAME = 'MONCH';
export const APP_TAGLINE = 'Rescata comida, ahorra dinero';
export const DEFAULT_COUNTRY_CODE = 'PA';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_PHONE_PREFIX = '+507';

// Bag size defaults (value = original retail value, price = what user pays)
export const BAG_SIZES = {
  small: {
    label: 'Pequena',
    value: 15.0,
    price: 4.99,
  },
  medium: {
    label: 'Mediana',
    value: 18.0,
    price: 5.99,
  },
  large: {
    label: 'Grande',
    value: 21.0,
    price: 6.99,
  },
} as const;

export type BagSize = keyof typeof BAG_SIZES;

export const DEFAULT_BAG_QUANTITY = 3;
export const MIN_BAG_QUANTITY = 1;
export const MAX_BAG_QUANTITY = 50;

export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mie' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sab' },
  { key: 'sun', label: 'Dom' },
] as const;
