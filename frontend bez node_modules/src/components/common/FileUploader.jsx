import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import axios from 'axios';

const FileUploader = ({ onUpload }) => {
  const inputRef = useRef();

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('/api/upload', formData);
    if (onUpload) {
      onUpload(res.data);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="px-3 py-1 bg-gray-200 rounded"
      >
        📎 Dodaj plik
      </button>
    </div>
  );
};

FileUploader.propTypes = {
  onUpload: PropTypes.any,
};

export default FileUploader;
