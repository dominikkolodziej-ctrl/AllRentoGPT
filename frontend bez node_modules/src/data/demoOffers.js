// 📍 src/data/demoOffers.js
// i18n-ready demo offers: each item has `categoryKey` for translations and `category` as fallback label.

const demoOffers = [
  {
    id: 1,
    title: "Wynajem koparki",
    categoryKey: "category.constructionEquipment",
    category: "Sprzęt budowlany",
    price: 300,
    location: "Warszawa",
    lat: 52.2297,
    lng: 21.0122,
    date: "2024-12-01",
    promoted: true,
    userId: 2
  },
  {
    id: 2,
    title: "Powierzchnia biurowa 150m²",
    categoryKey: "category.officesSpaces",
    category: "Biura",
    price: 4500,
    location: "Wrocław",
    lat: 51.1079,
    lng: 17.0385,
    date: "2024-11-28",
    promoted: true,
    userId: 2
  },
  {
    id: 3,
    title: "Transport chłodniczy 24h",
    categoryKey: "category.roadTransport",
    category: "Transport",
    price: 900,
    location: "Gdańsk",
    lat: 54.3521,
    lng: 18.6464,
    date: "2024-11-25",
    promoted: true,
    userId: 2
  },
  {
    id: 4,
    title: "Wynajem laptopów",
    categoryKey: "category.itElectronics",
    category: "IT",
    price: 120,
    location: "Kraków",
    lat: 50.0647,
    lng: 19.945,
    date: "2024-11-20",
    promoted: true,
    userId: 2
  },
  {
    id: 5,
    title: "Wózek widłowy elektryczny",
    categoryKey: "category.forklifts",
    category: "Sprzęt budowlany",
    price: 240,
    location: "Poznań",
    lat: 52.4064,
    lng: 16.9252,
    date: "2024-12-10",
    promoted: true,
    userId: 2
  },
  {
    id: 6,
    title: "Powierzchnia magazynowa 1000m²",
    categoryKey: "category.officesSpaces",
    category: "Powierzchnie",
    price: 8900,
    location: "Łódź",
    lat: 51.7592,
    lng: 19.455,
    date: "2024-12-12",
    promoted: true,
    userId: 2
  },
  {
    id: 7,
    title: "Zestaw komputerowy do biura",
    categoryKey: "category.itElectronics",
    category: "IT",
    price: 160,
    location: "Szczecin",
    lat: 53.4285,
    lng: 14.5528,
    date: "2024-12-15",
    promoted: true,
    userId: 2
  },
  {
    id: 8,
    title: "Wynajem samochodu dostawczego",
    categoryKey: "category.commercialVehicles",
    category: "Pojazdy",
    price: 270,
    location: "Katowice",
    lat: 50.2649,
    lng: 19.0238,
    date: "2024-12-20",
    promoted: true,
    userId: 2
  },
  {
    id: 9,
    title: "Wynajem kontenera 6m",
    categoryKey: "category.containersModules",
    category: "Kontenery",
    price: 150,
    location: "Bydgoszcz",
    lat: 53.1235,
    lng: 18.0084,
    date: "2024-12-22",
    promoted: true,
    userId: 2
  },
  {
    id: 10,
    title: "Pomieszczenie biurowe 35m²",
    categoryKey: "category.officesSpaces",
    category: "Biura",
    price: 1100,
    location: "Lublin",
    lat: 51.2465,
    lng: 22.5684,
    date: "2024-12-23",
    promoted: true,
    userId: 2
  },
  {
    id: 11,
    title: "Wynajem rusztowań",
    categoryKey: "category.scaffoldingFormwork",
    category: "Sprzęt budowlany",
    price: 200,
    location: "Rzeszów",
    lat: 50.0412,
    lng: 21.9991,
    date: "2024-12-24",
    promoted: true,
    userId: 2
  },
  {
    id: 12,
    title: "Tymczasowy kontener socjalny",
    categoryKey: "category.containersModules",
    category: "Kontenery",
    price: 180,
    location: "Olsztyn",
    lat: 53.7784,
    lng: 20.4801,
    date: "2024-12-30",
    promoted: true,
    userId: 2
  }
];

export function translateOfferCategory(t, offer) {
  return (typeof t === 'function' ? t(offer.categoryKey) : null) || offer.category;
}

export function getTranslatedOffers(t) {
  return demoOffers.map((o) => ({
    ...o,
    categoryLabel: translateOfferCategory(t, o),
  }));
}

export default demoOffers;
