// TODO [FAZA 1: w komponentach UI użyć t(i18nKey) zamiast label, gdy dostępne]

export const STATUS_OPTIONS = [
  { value: "draft", label: "📝 Robocza", i18nKey: "offer.status.draft" },
  { value: "active", label: "✅ Aktywna", i18nKey: "offer.status.active" },
  { value: "archived", label: "📦 Zarchiwizowana", i18nKey: "offer.status.archived" }
] as const;
export type StatusValue = typeof STATUS_OPTIONS[number]["value"];

export const AUDIENCE_TYPES = [
  { value: "b2b", label: "🏢 B2B", i18nKey: "offer.audience.b2b" },
  { value: "b2c", label: "🛍️ B2C", i18nKey: "offer.audience.b2c" },
  { value: "internal", label: "🔒 Wewnętrzna", i18nKey: "offer.audience.internal" }
] as const;
export type AudienceValue = typeof AUDIENCE_TYPES[number]["value"];

export const PRIORITY_FLAGS = [
  { value: "high", label: "🔥 Wysoki priorytet", i18nKey: "offer.priority.high" },
  { value: "normal", label: "⚪ Normalny", i18nKey: "offer.priority.normal" },
  { value: "low", label: "🌿 Niski", i18nKey: "offer.priority.low" }
] as const;
export type PriorityValue = typeof PRIORITY_FLAGS[number]["value"];
