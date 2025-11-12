import React from 'react';
import { useLiveTextContext } from '@/context/LiveTextContext.jsx'; // ✅ FAZA 1

export default function LiveTextDebugger() {
  const { debugLog, lang } = useLiveTextContext(); // ✅ FAZA 1

  if (!window?.location?.search.includes("debug=1")) return null;

  return (
    <div style={{
      position: "fixed", bottom: 10, right: 10, background: "#111",
      color: "#fff", padding: 12, zIndex: 9999, maxHeight: "50vh", overflowY: "auto"
    }}>
      <strong>LiveText DEBUG ({lang})</strong>
      <ul style={{ fontSize: 12 }}>
        {debugLog.map((entry, idx) => (
          <li key={idx}>
            <code>{entry.key}</code> → <em>{entry.value || "❌ brak"}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
