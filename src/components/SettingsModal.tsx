import { useState } from 'react';

export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const [isPro, setIsPro] = useState(() => localStorage.getItem('vibe_pro') === '1');
  const upgrade = () => {
    localStorage.setItem('vibe_pro', '1');
    setIsPro(true);
    alert('Thanks — you are now Pro (mock)');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Settings</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-zinc-100">Close</button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">VibeMap Pro</div>
                <div className="text-xs text-zinc-500">Unlimited check-ins, no ads, custom stamps</div>
              </div>
              <div>
                {isPro ? <div className="text-sm font-bold text-green-600">Active</div> : <button onClick={upgrade} className="px-3 py-2 bg-blue-600 text-white rounded-2xl">Upgrade $2.99</button>}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
            <div className="font-bold">Account</div>
            <div className="text-xs text-zinc-500 mt-2">Edit profile / connected accounts (mock)</div>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};
