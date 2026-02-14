import { useState } from 'react';
const steps = [
  {
    title: 'Welcome',
    illustration: '🗺️',
    description: 'Explore Places, Collect Stamps!\nTurn your visits into NFT collectibles.'
  },
  {
    title: 'How it Works',
    illustration: '📍',
    description: 'Visit cool places → Take photo → Get NFT stamp.'
  },
  {
    title: 'Rewards',
    illustration: '🎁',
    description: 'Collect stamps → Unlock achievements → Get real rewards.'
  },
  {
    title: 'Permission',
    illustration: '📍',
    description: 'Allow location access to find nearby places.'
  }
];

export const OnboardingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => onFinish(),
          () => onFinish()
        );
      } else {
        onFinish();
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-7xl mb-6 animate-bounce">{steps[step].illustration}</div>
        <h2 className="text-3xl font-bold mb-4">{steps[step].title}</h2>
        <p className="text-lg text-center whitespace-pre-line mb-8 max-w-xs">{steps[step].description}</p>
      </div>
      <button
        onClick={handleNext}
        className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg text-lg transition-all active:scale-95"
      >
        {step < steps.length - 1 ? 'Next →' : 'Allow Location'}
      </button>
      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${i === step ? 'bg-white' : 'bg-white/40'}`}></div>
        ))}
      </div>
    </div>
  );
};
