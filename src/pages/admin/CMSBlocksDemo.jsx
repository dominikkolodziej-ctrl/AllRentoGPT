import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import TextBlock from '@/components/ui/TextBlock.jsx';
import FeatureList from '@/components/ui/FeatureList.jsx';
import CalloutBox from '@/components/ui/CalloutBox.jsx';
import { cmsData } from '@/api/mockCMSData.js';

const CMSBlocksDemo = () => {
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  const title =
    (cmsData.titleKey && (t(cmsData.titleKey) || cmsData.title)) || cmsData.title;
  const description =
    (cmsData.descriptionKey && (t(cmsData.descriptionKey) || cmsData.description)) ||
    cmsData.description;
  const calloutMessage =
    (cmsData.calloutKey && (t(cmsData.calloutKey) || cmsData.callout)) ||
    cmsData.callout;

  return (
    <div
      className="p-6 space-y-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <TextBlock title={title} description={description} />
      <FeatureList features={cmsData.features} />
      <CalloutBox message={calloutMessage} tone="info" />
    </div>
  );
};

export default CMSBlocksDemo;
