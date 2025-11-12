import { useEffect, useState } from 'react';
import rawConfig from '@/config/abTestConfig.json';

type Variant = 'A' | 'B';
type ABConfig = Record<string, { ratio: number }>;

const config = rawConfig as ABConfig;

const readStoredVariant = (experimentName: string): Variant | null => {
  try {
    const v = localStorage.getItem(`ab:${experimentName}`);
    return v === 'A' || v === 'B' ? v : null;
  } catch {
    return null;
  }
};

const storeVariant = (experimentName: string, v: Variant) => {
  try {
    localStorage.setItem(`ab:${experimentName}`, v);
  } catch {
    /* ignore */
  }
};

export const useExperiment = (experimentName: string): Variant => {
  const [variant, setVariant] = useState<Variant>(() => readStoredVariant(experimentName) ?? 'A');

  useEffect(() => {
    if (!experimentName) return;

    const existing = readStoredVariant(experimentName);
    if (existing) {
      setVariant(existing);
      return;
    }

    const exp = config[experimentName];
    const ratio = typeof exp?.ratio === 'number' ? exp.ratio : 0.5;
    const chosen: Variant = Math.random() < ratio ? 'A' : 'B';

    setVariant(chosen);
    storeVariant(experimentName, chosen);

    try {
      window.dispatchEvent(
        new CustomEvent('ab:assigned', { detail: { experiment: experimentName, variant: chosen } })
      );
    } catch {
      /* ignore */
    }
  }, [experimentName]);

  return variant;
};
