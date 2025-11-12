export const offers = [
  {
    id: 1,
    title: "Koparka CAT 320",
    categoryKey: "category.excavatorsLoaders",
    category: "Koparki i ładowarki",
    location: "Warszawa",
    price: 1200,
    unitKey: "unit.day",
    unit: "dzień",
    year: 2018,
    manufacturer: "Caterpillar",
    available: true,
    lat: 52.2297,
    lng: 21.0122
  },
  {
    id: 2,
    title: "Wózek widłowy Toyota",
    categoryKey: "category.forklifts",
    category: "Wózki widłowe",
    location: "Kraków",
    price: 600,
    unitKey: "unit.day",
    unit: "dzień",
    year: 2020,
    manufacturer: "Toyota",
    available: false,
    lat: 50.0647,
    lng: 19.945
  },
  {
    id: 3,
    title: "Kontener biurowy 6x2",
    categoryKey: "category.containersModules",
    category: "Kontenery i moduły",
    location: "Poznań",
    price: 300,
    unitKey: "unit.day",
    unit: "dzień",
    year: 2022,
    manufacturer: "ModulRent",
    available: true,
    lat: 52.4064,
    lng: 16.9252
  }
];

export function translateOffer(t, offer) {
  return {
    ...offer,
    categoryLabel: (typeof t === 'function' ? t(offer.categoryKey) : null) || offer.category,
    unitLabel: (typeof t === 'function' ? t(offer.unitKey) : null) || offer.unit
  };
}

export function getTranslatedOffers(t) {
  return offers.map((o) => translateOffer(t, o));
}

export default offers;
