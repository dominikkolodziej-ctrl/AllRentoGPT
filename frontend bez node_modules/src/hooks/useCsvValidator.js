import { useCallback, useMemo, useState } from 'react';

// ✅ FAZA 10 WDROŻONA: walidacja CSV przed importem (bez zewnętrznych bibliotek)

/**
 * @typedef {Object} CsvValidatorOptions
 * @property {string[]} [requiredHeaders] - Nazwy kolumn wymaganych (case-insensitive).
 * @property {Record<string, (val: string, rowIndex: number) => string|null|undefined>} [columnValidators]
 *  Funkcje walidujące wartości dla konkretnych nagłówków; zwracają komunikat błędu lub null/undefined, gdy ok.
 * @property {string} [delimiter] - Wymuszony separator (gdy brak, dobierany heurystycznie: , ; \t |).
 * @property {boolean} [trim] - Czy przycinać spacje dla każdej komórki (domyślnie true).
 * @property {number} [maxRows] - Limit wierszy (łącznie z nagłówkiem) dla bezpieczeństwa (domyślnie 50000).
 * @property {string} [dedupeBy] - Nazwa kolumny, po której wykrywamy duplikaty.
 */

/**
 * @typedef {Object} CsvValidationError
 * @property {'missing_header'|'row_error'|'duplicate'|'format'|'limit'} type
 * @property {string} message
 * @property {number} [row] - 1-based (z nagłówkiem jako 1)
 * @property {number} [col] - 1-based
 * @property {string} [code]
 */

/**
 * @typedef {Object} CsvReport
 * @property {number} rows
 * @property {number} columns
 * @property {string} delimiter
 * @property {Record<string, number>} headerIndex - mapowanie nazwa->index (0-based)
 * @property {string[]} missingHeaders
 * @property {number} duplicates
 */

const DELIMS = [',', ';', '\t', '|'];

const normalize = (s) => String(s || '').trim().toLowerCase();

const sniffDelimiter = (text) => {
  const firstChunk = text.slice(0, Math.min(text.length, 50000));
  let best = ',', max = -1;
  for (const d of DELIMS) {
    const count = (firstChunk.match(new RegExp('\\' + d, 'g')) || []).length;
    if (count > max) {
      max = count;
      best = d;
    }
  }
  return best;
};

// Prosty parser CSV z obsługą cudzysłowów i podwójnych cudzysłowów ("")
const parseCSV = (text, delimiter, trim = true) => {
  /** @type {string[][]} */
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(trim ? field.trim() : field);
    field = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      pushField();
      continue;
    }
    if (ch === '\n') {
      pushField();
      pushRow();
      continue;
    }
    if (ch === '\r') {
      continue;
    }
    field += ch;
  }
  pushField();
  pushRow();

  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }
  return rows;
};

const buildHeaderIndex = (headerRow) => {
  /** @type {Record<string, number>} */
  const index = {};
  headerRow.forEach((name, i) => {
    const key = normalize(name);
    if (!(key in index)) index[key] = i;
  });
  return index;
};

/**
 * Hook walidujący CSV (plik lub tekst).
 * @param {CsvValidatorOptions} [options]
 * @returns {{
 *  validateFile: (file: File) => Promise<void>,
 *  validateText: (text: string) => Promise<void>,
 *  errors: CsvValidationError[],
 *  report: CsvReport | null,
 *  loading: boolean,
 *  reset: () => void
 * }}
 */
export function useCsvValidator(options = {}) {
  const {
    requiredHeaders = [],
    columnValidators = {},
    delimiter,
    trim = true,
    maxRows = 50000,
    dedupeBy,
  } = options;

  const [errors, setErrors] = useState(/** @type {CsvValidationError[]} */ ([]));
  const [report, setReport] = useState(/** @type {CsvReport|null} */ (null));
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setErrors([]);
    setReport(null);
    setLoading(false);
  }, []);

  const runValidation = useCallback(
    (text) => {
      /** @type {CsvValidationError[]} */
      const errs = [];

      const usedDelimiter = delimiter || sniffDelimiter(text);
      const rows = parseCSV(text, usedDelimiter, trim);

      if (!rows.length) {
        errs.push({ type: 'format', message: 'Brak danych w pliku CSV.', code: 'EMPTY' });
        setErrors(errs);
        setReport({
          rows: 0,
          columns: 0,
          delimiter: usedDelimiter,
          headerIndex: {},
          missingHeaders: requiredHeaders.slice(),
          duplicates: 0,
        });
        return;
      }

      if (rows.length > maxRows) {
        errs.push({
          type: 'limit',
          message: `Przekroczono limit wierszy (${rows.length} > ${maxRows}).`,
          code: 'ROW_LIMIT',
        });
      }

      const header = rows[0] || [];
      const headerIndex = buildHeaderIndex(header);

      const missing = requiredHeaders
        .map((h) => normalize(h))
        .filter((h) => !(h in headerIndex));
      missing.forEach((h) =>
        errs.push({
          type: 'missing_header',
          message: `Brak wymaganego nagłówka: ${h}`,
          code: 'MISSING_HEADER',
        })
      );

      let duplicates = 0;
      const dedupeSet = dedupeBy ? new Set() : null;
      const dedupeKey = dedupeBy ? normalize(dedupeBy) : null;
      const dedupeIdx = dedupeKey != null ? headerIndex[dedupeKey] : undefined;

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];

        if (dedupeSet && typeof dedupeIdx === 'number') {
          const key = row[dedupeIdx] ?? '';
          const k = String(trim ? String(key).trim() : key);
          if (dedupeSet.has(k)) {
            duplicates++;
            errs.push({
              type: 'duplicate',
              message: `Duplikat wartości w kolumnie "${dedupeBy}": ${k}`,
              row: r + 1,
              code: 'DUPLICATE',
            });
          } else {
            dedupeSet.add(k);
          }
        }

        for (const [headerName, validator] of Object.entries(columnValidators)) {
          if (typeof validator !== 'function') continue;
          const idx = headerIndex[normalize(headerName)];
          if (typeof idx !== 'number') continue;
          const value = row[idx] == null ? '' : String(row[idx]);
          const msg = validator(trim ? value.trim() : value, r);
          if (msg) {
            errs.push({
              type: 'row_error',
              message: msg,
              row: r + 1,
              col: idx + 1,
              code: 'VALIDATION',
            });
          }
        }
      }

      setErrors(errs);
      setReport({
        rows: rows.length,
        columns: header.length,
        delimiter: usedDelimiter,
        headerIndex,
        missingHeaders: missing,
        duplicates,
      });
    },
    [columnValidators, delimiter, maxRows, requiredHeaders, trim, dedupeBy]
  );

  const validateText = useCallback(
    async (text) => {
      setLoading(true);
      try {
        runValidation(text || '');
      } finally {
        setLoading(false);
      }
    },
    [runValidation]
  );

  const validateFile = useCallback(
    async (file) => {
      setLoading(true);
      try {
        const text = await file.text();
        runValidation(text);
      } catch {
        setErrors([{ type: 'format', message: 'Nie udało się odczytać pliku.', code: 'READ_ERROR' }]);
        setReport(null);
      } finally {
        setLoading(false);
      }
    },
    [runValidation]
  );

  return useMemo(
    () => ({ validateFile, validateText, errors, report, loading, reset }),
    [validateFile, validateText, errors, report, loading, reset]
  );
}

export default useCsvValidator;
