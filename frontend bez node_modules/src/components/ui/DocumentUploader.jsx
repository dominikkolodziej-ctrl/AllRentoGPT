import React from 'react';
import PropTypes from 'prop-types';

const DocumentUploader = ({ onUpload }) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && typeof onUpload === 'function') {
      onUpload(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        className="text-sm"
        aria-label="Wybierz dokument do przesłania"
      />
    </div>
  );
};

DocumentUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default DocumentUploader;

// ✅ FAZA 12 – mikro-status (obsługa wyboru pliku z walidacją)
