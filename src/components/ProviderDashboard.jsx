import React, { useContext, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext.jsx';
import ContractWidget from '@/modules/contract/ContractWidget.jsx';
import { Building2, Mail, Layers3, Crown, FileText, AlertCircle, Wallet, Star } from 'lucide-react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const ShortcutCard = ({ Icon, title, subtitle, bgClass = '', onClick, ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`${bgClass} border p-4 rounded cursor-pointer hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-left`}
  >
    <Icon className="mb-2" />
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-gray-600">{subtitle}</p>
  </button>
);

ShortcutCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  bgClass: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
};

function ProviderDashboard({ onEvent, className = '' }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLiveText();
  const { theme } = useTheme();

  const company = user?.company || {};
  const unreadMessages = Number(user?.unreadMessages || 0);
  const activePlan = company?.subscriptionPlan || (t('plan.none') || 'Brak');
  const verified = Boolean(company?.verified);
  const offersCount = Number(company?.offersCount || 0);
  const offerLimit = Number(company?.offerLimit || 10);
  const billingStatus = company?.billingStatus || 'inactive';
  const planExpired = billingStatus === 'inactive' || billingStatus === 'overdue';

  const go = useCallback(
    (to, eventName) => {
      onEvent?.(eventName, { to });
      navigate(to);
    },
    [navigate, onEvent]
  );

  const container = `max-w-7xl mx-auto p-6 space-y-8 ${className}`;

  return (
    <div className={container}>
      <h1 className="text-3xl font-bold">
        {t('provider.panelTitle') || 'Panel firmy'}: {company.name || user?.companyName || user?.name || ''}
      </h1>

      {!verified && (
        <div className="bg-red-100 text-red-800 border border-red-300 p-4 rounded" role="alert">
          <AlertCircle className="inline mr-2" />
          {t('provider.notVerified') || 'Twoja firma nie została jeszcze zweryfikowana. Skontaktuj się z administratorem.'}
        </div>
      )}

      {planExpired && (
        <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-4 rounded flex items-center justify-between" role="alert">
          <div>
            <Wallet className="inline mr-2" />
            {t('provider.planExpired') || 'Twój plan subskrypcyjny wygasł lub jest nieaktywny.'}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline ml-4"
            onClick={() => go('/dashboard/provider/plan', 'provider_go_change_plan')}
          >
            {t('provider.changePlan') || 'Zmień plan'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ShortcutCard
          Icon={Layers3}
          title={t('provider.shortcuts.offersTitle') || 'Moje oferty'}
          subtitle={`${offersCount} / ${offerLimit} ${t('provider.shortcuts.active') || 'aktywnych'}`}
          bgClass="bg-blue-50"
          onClick={() => go('/dashboard/provider/offers', 'provider_go_offers')}
          ariaLabel={t('provider.shortcuts.offersAria') || 'Przejdź do ofert'}
        />

        <ShortcutCard
          Icon={Mail}
          title={t('provider.shortcuts.messagesTitle') || 'Wiadomości'}
          subtitle={`${unreadMessages} ${t('provider.shortcuts.unread') || 'nieprzeczytanych'}`}
          bgClass="bg-yellow-50"
          onClick={() => go('/dashboard/provider/inbox', 'provider_go_inbox')}
          ariaLabel={t('provider.shortcuts.messagesAria') || 'Przejdź do wiadomości'}
        />

        <ShortcutCard
          Icon={Building2}
          title={t('provider.shortcuts.profileTitle') || 'Profil firmy'}
          subtitle={verified ? t('provider.shortcuts.verified') || 'Zweryfikowana' : t('provider.shortcuts.notVerified') || 'Niezweryfikowana'}
          bgClass="bg-green-50"
          onClick={() => go('/dashboard/provider/profile', 'provider_go_profile')}
          ariaLabel={t('provider.shortcuts.profileAria') || 'Przejdź do profilu firmy'}
        />

        <ShortcutCard
          Icon={Crown}
          title={t('provider.shortcuts.statsTitle') || 'Statystyki'}
          subtitle={t('provider.shortcuts.statsSub') || 'CTR, rezerwacje, widoczność'}
          bgClass="bg-gray-50"
          onClick={() => go('/dashboard/provider/stats', 'provider_go_stats')}
          ariaLabel={t('provider.shortcuts.statsAria') || 'Przejdź do statystyk'}
        />

        <ShortcutCard
          Icon={FileText}
          title={t('provider.shortcuts.contractsTitle') || 'Umowy'}
          subtitle={t('provider.shortcuts.contractsSub') || 'Nowe, oczekujące podpisu'}
          bgClass="bg-purple-50"
          onClick={() => go('/dashboard/provider/stats', 'provider_go_contracts')}
          ariaLabel={t('provider.shortcuts.contractsAria') || 'Przejdź do umów'}
        />

        <ShortcutCard
          Icon={Star}
          title={t('provider.shortcuts.changePlanTitle') || 'Zmień plan'}
          subtitle={`${t('provider.shortcuts.yourPlan') || 'Twój plan'}: ${activePlan}`}
          bgClass="bg-indigo-50"
          onClick={() => go('/dashboard/provider/plan', 'provider_go_change_plan')}
          ariaLabel={t('provider.shortcuts.changePlanAria') || 'Przejdź do zmiany planu'}
        />
      </div>

      <div className={theme?.panel ?? ''}>
        <ContractWidget />
      </div>
    </div>
  );
}

ProviderDashboard.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(ProviderDashboard);
