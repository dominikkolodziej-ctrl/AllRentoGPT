import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const CATEGORIES = [
  { key: "construction_equipment", name: "Sprzęt budowlany" },
  { key: "road_machinery", name: "Maszyny drogowe" },
  { key: "lifts_cranes", name: "Podnośniki i dźwigi" },
  { key: "excavators_loaders", name: "Koparki i ładowarki" },
  { key: "agriculture", name: "Maszyny rolnicze" },
  { key: "forklifts", name: "Wózki widłowe" },
  { key: "commercial_vehicles", name: "Pojazdy użytkowe" },
  { key: "containers_modules", name: "Kontenery i moduły" },
  { key: "tools_power_tools", name: "Narzędzia i elektronarzędzia" },
  { key: "scaffolding_formwork", name: "Rusztowania i szalunki" },
  { key: "energy_generators", name: "Energia i generatory" },
  { key: "aircon_heating", name: "Klimatyzacja i ogrzewanie" },
  { key: "lighting_stage", name: "Oświetlenie i scenotechnika" },
  { key: "road_transport", name: "Transport drogowy" },
  { key: "hds_special_transport", name: "Transport HDS i specjalistyczny" },
  { key: "it_electronics", name: "IT i elektronika" },
  { key: "security_monitoring", name: "Zabezpieczenia i monitoring" },
  { key: "offices_spaces", name: "Biura i powierzchnie" },
  { key: "events", name: "Eventy i imprezy" },
  { key: "staff_rental", name: "Wynajem pracowników" },
  { key: "consulting", name: "Usługi doradcze" },
  { key: "design_engineering", name: "Projektowanie i inżynieria" },
  { key: "green_maintenance", name: "Utrzymanie zieleni" },
  { key: "advertising_marketing", name: "Reklama i marketing" },
  { key: "other_services", name: "Inne usługi" },
];

const CategorySelector = ({ selectedCategories, setSelectedCategories }) => {
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  const categories = Array.isArray(selectedCategories) ? selectedCategories : [];

  const toggleCategory = (category) => {
    if (categories.includes(category)) {
      setSelectedCategories(categories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...categories, category]);
    }
  };

  return (
    <div className={theme?.categorySelector?.container || "space-y-4"}>
      <h3 className={theme?.categorySelector?.title || "text-xl font-semibold text-blue-700"}>
        {t("categories.title") || "Kategorie działalności"}
      </h3>
      <div
        className={
          theme?.categorySelector?.grid ||
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto"
        }
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => toggleCategory(cat.name)}
            className={
              categories.includes(cat.name)
                ? theme?.categorySelector?.active ||
                  "p-2 text-sm border rounded-lg transition text-left bg-blue-500 text-white"
                : theme?.categorySelector?.inactive ||
                  "p-2 text-sm border rounded-lg transition text-left bg-white text-gray-800 hover:bg-blue-100"
            }
          >
            {t(`categories.${cat.key}`) || cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

CategorySelector.propTypes = {
  selectedCategories: PropTypes.array,
  setSelectedCategories: PropTypes.func,
};

export default CategorySelector;
