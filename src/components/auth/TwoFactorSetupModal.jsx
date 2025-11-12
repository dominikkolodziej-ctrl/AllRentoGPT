import React, { useState } from 'react';
import { useTwoFactor } from '@/hooks/useTwoFactor.js';

const TwoFactorSetupModal = () => {
  const [phone, setPhone] = useState('');
  const { sendCode, loading } = useTwoFactor();

  const handleSend = () => sendCode(phone);

  return (
    <div className="p-4">
      <h3>Aktywuj 2FA</h3>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nr telefonu" />
      <button onClick={handleSend} disabled={loading}>Wyślij kod</button>
    </div>
  );
};

export default TwoFactorSetupModal;
