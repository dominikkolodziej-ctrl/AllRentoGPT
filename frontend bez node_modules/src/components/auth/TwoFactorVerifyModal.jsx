import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTwoFactor } from '@/hooks/useTwoFactor.js';

const TwoFactorVerifyModal = ({ phone, onSuccess }) => {
  const [code, setCode] = useState('');
  const { verifyCode, loading } = useTwoFactor();

  const handleVerify = async () => {
    const result = await verifyCode(phone, code);
    if (result?.verified) onSuccess();
  };

  return (
    <div className="p-4">
      <h3>Weryfikacja 2FA</h3>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Kod SMS" />
      <button onClick={handleVerify} disabled={loading}>Zweryfikuj</button>
    </div>
  );
};

TwoFactorVerifyModal.propTypes = {
  phone: PropTypes.any,
  onSuccess: PropTypes.any,
};

export default TwoFactorVerifyModal;
