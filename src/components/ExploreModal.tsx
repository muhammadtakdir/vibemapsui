import { useEffect, useState } from 'react';

export const ExploreModal = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<'trending'|'feed'|'leaderboard'|'notifications'>('trending');
  const [venues, setVenues] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'trending') {
      fetch('/api/venues/trending')
        .then(async (r) => r.ok ? await r.json() : [])
        .then((data) => setVenues(Array.isArray(data) ? data : []))
        .catch(() => setVenues([]));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'feed') {
      fetch('/api/feed', { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zklogin_user_email') || ''}` } })
        .then(async (r) => r.ok ? await r.json() : [])
        .then((data) => setFeed(Array.isArray(data) ? data : []))
        .catch(() => setFeed([]));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'leaderboard') {
      fetch('/api/leaderboard')
        .then(async (r) => r.ok ? await r.json() : [])
        .then((data) => setBoard(Array.isArray(data) ? data : []))
        .catch(() => setBoard([]));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'notifications') {
      fetch('/api/notifications', { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zklogin_user_email') || ''}` } })
        .then(async (r) => r.ok ? await r.json() : [])
        .then((data) => setNotes(Array.isArray(data) ? data : []))
        .catch(() => setNotes([]));
    }
  }, [tab]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30 p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Explore</h3>
          <div className="flex gap-2">
            <button onClick={() => setTab('trending')} className={`px-3 py-1 rounded ${tab==='trending'?'bg-blue-600 text-white':'bg-zinc-100'}`}>Trending</button>
            <button onClick={() => setTab('feed')} className={`px-3 py-1 rounded ${tab==='feed'?'bg-blue-600 text-white':'bg-zinc-100'}`}>Feed</button>
            <button onClick={() => setTab('leaderboard')} className={`px-3 py-1 rounded ${tab==='leaderboard'?'bg-blue-600 text-white':'bg-zinc-100'}`}>Leaderboard</button>
            <button onClick={() => setTab('notifications')} className={`px-3 py-1 rounded ${tab==='notifications'?'bg-blue-600 text-white':'bg-zinc-100'}`}>Notifications</button>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-zinc-100">Close</button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {tab === 'trending' && (
            <div className="grid gap-3">
              {venues.length === 0 && <div className="text-zinc-500">No trending venues yet</div>}
              {venues.map(v => (
                <div key={v.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{v.name}</div>
                    <div className="text-xs text-zinc-500">{v.address || ''}</div>
                  </div>
                  <div className="text-xs text-zinc-500">{v.totalCheckIns} check-ins</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'feed' && (
            <div className="space-y-3">
              {feed.length === 0 && <div className="text-zinc-500">Feed kosong</div>}
              {feed.map((f:any) => (
                <div key={f.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100" />
                    <div>
                      <div className="font-bold">{f.user?.username || 'user'}</div>
                      <div className="text-xs text-zinc-500">{new Date(f.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-sm">Checked in at <strong>{f.venue?.name}</strong></div>
                </div>
              ))}
            </div>
          )}

          {tab === 'leaderboard' && (
            <div className="space-y-3">
              {board.length === 0 && <div className="text-zinc-500">Leaderboard kosong</div>}
              {board.map((b,i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                  <div>
                    <div className="font-bold">#{i+1} {b.username}</div>
                    <div className="text-xs text-zinc-500">{b.walletAddress}</div>
                  </div>
                  <div className="text-sm">{b.totalStamps} stamps</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-3">
              {notes.length === 0 && <div className="text-zinc-500">No notifications</div>}
              {notes.map(n => (
                <div key={n.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="text-sm">{n.text}</div>
                  <div className="text-xs text-zinc-400">{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
