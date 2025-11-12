// src/components/SmsVerification.jsx
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";
import { smsRequest, smsVerify } from "@/api/reservationsApi.js";

const SmsVerification = ({
  reservationId,
  phone,
  onSuccess,
  onCancel,
  onEvent,
  onSend,
  onVerify,
  digits = 4,
  resendCooldown = 30,
  className = "",
}) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const labels = useMemo(
    () => ({
      title: t("sms.title", "Weryfikacja numeru telefonu"),
      send: t("sms.send", "Wyślij kod SMS"),
      placeholder: t("sms.placeholder", "Wpisz kod"),
      verify: t("sms.verify", "Zweryfikuj"),
      cancel: t("common.cancel", "Anuluj"),
      wrong: t("sms.wrong", "Niepoprawny kod. Spróbuj ponownie."),
      sentInfo: t("sms.sentInfo", "Kod został wysłany."),
      resend: t("sms.resend", "Wyślij ponownie"),
      wait: t("sms.wait", "Poczekaj"),
      sendError: t("sms.sendError", "Nie udało się wysłać kodu."),
      verifyError: t("sms.verifyError", "Wystąpił błąd podczas weryfikacji."),
    }),
    [t]
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const sanitizeCode = useCallback(
    (val) => val.replace(/\D+/g, "").slice(0, Math.max(1, digits)),
    [digits]
  );

  const handleChange = useCallback(
    (e) => {
      setError("");
      setCode(sanitizeCode(e.target.value));
    },
    [sanitizeCode]
  );

  const sendCode = useCallback(async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    setError("");
    try {
      if (onSend) {
        await onSend();
      } else {
        if (!reservationId) throw new Error("reservationId required");
        await smsRequest({ reservationId, phone });
      }
      setSent(true);
      setCooldown(resendCooldown);
      onEvent?.("sms_code_sent");
    } catch (err) {                    // <-- używamy err
      console.error("SMS send error:", err);
      setError(labels.sendError);
      onEvent?.("sms_code_send_error");
    } finally {
      setSending(false);
    }
  }, [sending, cooldown, onSend, resendCooldown, onEvent, labels.sendError, reservationId, phone]);

  const verifyCode = useCallback(async () => {
    if (verifying) return;
    const value = sanitizeCode(code);
    if (value.length !== digits) {
      setError(labels.wrong);
      return;
    }
    setVerifying(true);
    setError("");
    try {
      let ok;
      if (onVerify) {
        ok = await onVerify(value);
      } else {
        if (!reservationId) throw new Error("reservationId required");
        const resp = await smsVerify({ reservationId, code: value });
        ok = !!resp?.verified || resp?.ok === true;
      }
      if (ok) {
        onEvent?.("sms_code_verified");
        onSuccess?.();
      } else {
        setError(labels.wrong);
        onEvent?.("sms_code_wrong");
      }
    } catch (err) {                    // <-- używamy err
      console.error("SMS verify error:", err);
      setError(labels.verifyError);
      onEvent?.("sms_code_verify_error");
    } finally {
      setVerifying(false);
    }
  }, [verifying, code, digits, onVerify, onSuccess, onEvent, sanitizeCode, labels.wrong, labels.verifyError, reservationId]);

  const containerCls = `bg-white p-4 border rounded shadow w-72 space-y-3 ${className}`;
  const btnPrimary =
    theme?.primaryButton ?? "bg-blue-600 text-white w-full py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-60";
  const btnSuccess =
    theme?.successButton ?? "bg-green-600 text-white w-full py-1 rounded hover:bg-green-700 text-sm disabled:opacity-60";
  const inputCls = theme?.textInput ?? "border px-2 py-1 w-full rounded text-sm";
  const hintCls = theme?.mutedText ?? "text-gray-500 hover:underline text-xs block text-center mt-2";

  return (
    <div className={containerCls} role="dialog" aria-label={labels.title}>
      <h2 className="text-sm font-semibold">{labels.title}</h2>

      {!sent ? (
        <button
          type="button"
          onClick={sendCode}
          className={btnPrimary}
          disabled={sending || cooldown > 0}
          aria-disabled={sending || cooldown > 0}
        >
          {cooldown > 0 ? `${labels.wait} (${cooldown}s)` : labels.send}
        </button>
      ) : (
        <>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={labels.placeholder}
            value={code}
            onChange={handleChange}
            className={inputCls}
            aria-label={labels.placeholder}
            maxLength={digits}
          />
          {error && (
            <p className="text-red-600 text-xs" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={verifyCode}
            className={btnSuccess}
            disabled={verifying || code.length !== digits}
            aria-disabled={verifying || code.length !== digits}
          >
            {labels.verify}
          </button>

          <button
            type="button"
            onClick={sendCode}
            className={btnPrimary}
            disabled={sending || cooldown > 0}
            aria-disabled={sending || cooldown > 0}
          >
            {cooldown > 0 ? `${labels.wait} (${cooldown}s)` : labels.resend}
          </button>

          <p className="text-xs text-gray-500 text-center">{labels.sentInfo}</p>
        </>
      )}

      <button type="button" onClick={onCancel} className={hintCls}>
        {labels.cancel}
      </button>
    </div>
  );
};

SmsVerification.propTypes = {
  reservationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  phone: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSend: PropTypes.func,
  onVerify: PropTypes.func,
  onEvent: PropTypes.func,
  digits: PropTypes.number,
  resendCooldown: PropTypes.number,
  className: PropTypes.string,
};

export default memo(SmsVerification);
