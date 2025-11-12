// i18n-ready categories with fallbacks

export const CATEGORIES = [
  { key: 'category.constructionEquipment', fallback: 'Sprzęt budowlany' },
  { key: 'category.roadMachines', fallback: 'Maszyny drogowe' },
  { key: 'category.liftsCranes', fallback: 'Podnośniki i dźwigi' },
  { key: 'category.excavatorsLoaders', fallback: 'Koparki i ładowarki' },
  { key: 'category.agriculturalMachines', fallback: 'Maszyny rolnicze' },
  { key: 'category.forklifts', fallback: 'Wózki widłowe' },
  { key: 'category.commercialVehicles', fallback: 'Pojazdy użytkowe' },
  { key: 'category.containersModules', fallback: 'Kontenery i moduły' },
  { key: 'category.toolsPowerTools', fallback: 'Narzędzia i elektronarzędzia' },
  { key: 'category.scaffoldingFormwork', fallback: 'Rusztowania i szalunki' },
  { key: 'category.powerGenerators', fallback: 'Energia i generatory' },
  { key: 'category.hvac', fallback: 'Klimatyzacja i ogrzewanie' },
  { key: 'category.lightingStage', fallback: 'Oświetlenie i scenotechnika' },
  { key: 'category.roadTransport', fallback: 'Transport drogowy' },
  { key: 'category.hdsSpecialTransport', fallback: 'Transport HDS i specjalistyczny' },
  { key: 'category.itElectronics', fallback: 'IT i elektronika' },
  { key: 'category.securityCctv', fallback: 'Zabezpieczenia i monitoring' },
  { key: 'category.officesSpaces', fallback: 'Biura i powierzchnie' },
  { key: 'category.events', fallback: 'Eventy i imprezy' },
  { key: 'category.staffRental', fallback: 'Wynajem pracowników' },
  { key: 'category.consulting', fallback: 'Usługi doradcze' },
  { key: 'category.designEngineering', fallback: 'Projektowanie i inżynieria' },
  { key: 'category.landscaping', fallback: 'Utrzymanie zieleni' },
  { key: 'category.advertisingMarketing', fallback: 'Reklama i marketing' },
  { key: 'category.otherServices', fallback: 'Inne usługi' },
];

export const categoriesKeys = CATEGORIES.map((c) => c.key);
export const categories = CATEGORIES.map((c) => c.fallback);

export function translateCategories(t) {
  return CATEGORIES.map((c) => t(c.key) || c.fallback);
}

export function getCategoryLabel(t, key) {
  const item = CATEGORIES.find((c) => c.key === key);
  return (typeof t === 'function' ? t(key) : null) || item?.fallback || key;
}

export default categories;
