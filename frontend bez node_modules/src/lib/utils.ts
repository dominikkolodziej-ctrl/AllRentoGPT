import { twMerge } from 'tailwind-merge';

type ClassPrimitive = string | number | null | undefined | boolean;
type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassValue = ClassPrimitive | ClassDictionary | ClassValue[];

function toClassString(value: ClassValue): string {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(toClassString).filter(Boolean).join(' ');
  if (typeof value === 'object') {
    return Object.keys(value)
      .filter((key) => (value as ClassDictionary)[key])
      .join(' ');
  }
  return '';
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(toClassString(inputs));
}
