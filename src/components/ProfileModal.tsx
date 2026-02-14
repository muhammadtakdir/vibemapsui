import { useCollectionStore } from '../store/useCollectionStore'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect, useState } from 'react'
import { SettingsModal } from './SettingsModal'
export const StampDetailModal = ({ stamp, onClose }: { stamp: any; onClose: () => void }) => {
  if (!stamp) return null
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-zinc-500">{stamp.venueName}</div>
            <h3 className="text-lg font-bold mt-1">Stamp • {stamp.rarity || 'SILVER'}</h3>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">Close</button>
        </div>
        <img src={stamp.photoUrl} alt="stamp" className="w-full h-56 object-cover rounded-lg mb-3" />
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">{stamp.caption}</p>
        <div className="text-xs text-zinc-400">Minted: {new Date(stamp.timestamp).toLocaleString()}</div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-2xl">Share</button>
          <button className="w-28 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">Like</button>
        </div>
      </div>
    </div>
  )
}

export const ProfileModal = ({ onClose }: { onClose: () => void }) => {
  const user = useAuthStore((s) => s.user)
  const { stamps, load } = useCollectionStore()
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => { load() }, [load])

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30 p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{(user?.username || 'U').charAt(0)}</div>
            <div>
              <div className="text-lg font-bold">{user?.username || 'Vibe Explorer'}</div>
              <div className="text-sm text-zinc-500">@{user?.username || 'you'}</div>
            </div>
          </div>
          <div className="text-sm text-zinc-500">Stamps: <strong className="text-zinc-800 dark:text-zinc-100">{stamps.length}</strong></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stamps.length === 0 && (
            <div className="col-span-4 py-8 text-center text-zinc-500">No stamps yet — check in somewhere!</div>
          )}
          {stamps.map((s) => (
            <button key={s.id} onClick={() => setSelected(s)} className="overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1">
              <img src={s.photoUrl} alt="stamp" className="w-full h-32 object-cover rounded-md" />
              <div className="text-xs text-zinc-500 mt-2">{s.venueName}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setShowSettings(true)} className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800">Settings</button>
          <button onClick={onClose} className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800">Close</button>
        </div>
      </div>

      {selected && <StampDetailModal stamp={selected} onClose={() => setSelected(null)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
