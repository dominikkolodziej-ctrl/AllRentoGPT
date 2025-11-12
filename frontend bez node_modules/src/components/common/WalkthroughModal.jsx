import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding.ts';

const WalkthroughModal = () => {
  const { step, completed, next } = useOnboarding();

  if (completed) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">👋 Witaj!</h2>
        <p className="mb-4">{step.message}</p>
        <button onClick={next} className="px-4 py-2 bg-blue-500 text-white rounded">
          Dalej
        </button>
      </div>
    </div>
  );
};

export default WalkthroughModal;
