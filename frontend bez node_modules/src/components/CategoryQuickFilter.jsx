import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const categories = [
  { key: "excavators", name: "Koparki", icon: "🚜" },
  { key: "forklifts", name: "Wózki widłowe", icon: "🏗️" },
  { key: "containers", name: "Kontenery", icon: "📦" },
  { key: "offices", name: "Biura", icon: "🏢" },
  { key: "transport", name: "Transport", icon: "🚚" },
  { key: "it", name: "IT", icon: "💻" },
  { key: "spaces", name: "Powierzchnie", icon: "🏬" },
  { key: "vehicles", name: "Pojazdy", icon: "🚗" },
];

const CategoryQuickFilter = ({ baseUrl = "/offers" }) => {
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  return (
    <div className={theme?.categoryFilter?.container || "flex flex-wrap gap-3 justify-center sm:justify-start"}>
      {categories.map((cat) => (
        <a
          key={cat.key}
          href={`${baseUrl}?category=${encodeURIComponent(cat.name)}`}
          className={
            theme?.categoryFilter?.item ||
            "flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-sm hover:bg-blue-100 transition"
          }
          aria-label={`${t(`categories.${cat.key}`) || cat.name}`}
        >
          <span className="text-lg">{cat.icon}</span>
          {t(`categories.${cat.key}`) || cat.name}
        </a>
      ))}
    </div>
  );
};

CategoryQuickFilter.propTypes = {
  baseUrl: PropTypes.string,
};

export default CategoryQuickFilter;
