import React, { useState } from "react";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import ProviderLayout from "@/components/layouts/ProviderLayout.jsx";
import InboxView from "@/pages/InboxView.jsx";
import ConversationThread from "@/ConversationThread";

const ProviderInbox = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia

  return (
    <ProviderLayout>
      <div className="flex flex-col sm:flex-row h-[80vh] border rounded shadow">
        <div className="w-full sm:w-1/3 border-r overflow-y-auto">
          <InboxView onSelect={setActiveConversation} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeConversation ? (
            <ConversationThread conversation={activeConversation} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {t('inbox.selectConversation') || 'Wybierz konwersację, aby ją otworzyć'}
            </div>
          )}
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ProviderInbox;
