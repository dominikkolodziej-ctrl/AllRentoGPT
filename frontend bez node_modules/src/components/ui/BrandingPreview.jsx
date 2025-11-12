import React from 'react';
import PropTypes from 'prop-types';

const BrandingPreview = ({ branding }) => {
  if (!branding) return null;

  return (
    <div className="p-4 border rounded space-y-2">
      <div style={{ backgroundColor: branding?.primaryColor || "#000", height: "30px" }}></div>
      <div style={{ fontFamily: branding?.font || "inherit" }}>
        {branding?.font || "Brak fontu"}
      </div>
      <p>Logo URL: {branding?.logo || "Brak logo"}</p>
    </div>
  );
};

BrandingPreview.propTypes = {
  branding: PropTypes.shape({
    primaryColor: PropTypes.string,
    font: PropTypes.string,
    logo: PropTypes.string
  })
};

export default BrandingPreview;

// ✅ FAZA 12 – mikro-status (fallback wartości, brak logo/fontu)
// 🔹 ESLint: dodano optional chaining i default values
