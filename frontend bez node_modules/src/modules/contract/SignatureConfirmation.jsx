import PropTypes from 'prop-types';
import React from 'react';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

export default function SignatureConfirmation({ signerName, signedAt, ipAddress }) {
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  if (!signedAt) return null;

  const date =
    signedAt instanceof Date ? signedAt : new Date(signedAt);
  const formatted =
    isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd HH:mm');

  return (
    <div
      className="p-4 rounded mb-6 border-l-4"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        borderLeftColor: theme?.primary || undefined,
        color: theme?.text || undefined,
      }}
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold mb-1">
        {t('signature.signedElectronically') || 'Podpisano elektronicznie:'}
      </p>
      <ul className="text-sm list-disc list-inside">
        <li>
          <strong>{t('signature.signer') || 'Podpisujący:'}</strong> {signerName}
        </li>
        <li>
          <strong>{t('signature.datetime') || 'Data i godzina:'}</strong> {formatted}
        </li>
        {ipAddress ? (
          <li>
            <strong>{t('signature.ip') || 'Adres IP:'}</strong> {ipAddress}
          </li>
        ) : null}
      </ul>
      <p className="text-xs mt-2" style={{ color: theme?.text || undefined }}>
        {t('signature.notice') ||
          'Ten podpis ma charakter potwierdzenia akceptacji warunków umowy w rozumieniu dokumentacji B2B Rental.'}
      </p>
    </div>
  );
}

SignatureConfirmation.propTypes = {
  signerName: PropTypes.string.isRequired,
  signedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
  ipAddress: PropTypes.string,
};
