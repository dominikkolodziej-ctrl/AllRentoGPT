export const offerCategories = Object.freeze([
  "Koparki",
  "Wózki widłowe",
  "Dźwigi",
  "Podnośniki",
  "Transport",
  "Inne",
]);

export const sortOptions = Object.freeze([
  { value: "recent", label: "Najnowsze" },
  { value: "price_low", label: "Cena rosnąco" },
  { value: "price_high", label: "Cena malejąco" },
  { value: "rating", label: "Najwyżej oceniane" },
]);

export const offerTypes = Object.freeze(["Wynajem", "Sprzedaż", "Leasing"]);

export const voivodeships = Object.freeze([
  "Dolnośląskie",
  "Kujawsko-Pomorskie",
  "Lubelskie",
  "Lubuskie",
  "Łódzkie",
  "Małopolskie",
  "Mazowieckie",
  "Opolskie",
  "Podkarpackie",
  "Podlaskie",
  "Pomorskie",
  "Śląskie",
  "Świętokrzyskie",
  "Warmińsko-Mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
]);

export const radiusOptions = Object.freeze([5, 10, 20, 50, 100]);

export default { offerCategories, sortOptions, offerTypes, voivodeships, radiusOptions };
