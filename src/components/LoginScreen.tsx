import { initZkLogin } from '../lib/zklogin';

export const LoginScreen = () => {
  const handleLogin = () => {
    console.log('Login button clicked');
    try {
      const loginUrl = initZkLogin();
      console.log('Generated Login URL:', loginUrl);
      
      if (!loginUrl || loginUrl.includes('YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER')) {
        alert('Google Client ID belum diatur! Pastikan VITE_GOOGLE_CLIENT_ID ada di .env atau Vercel.');
      }
      
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error during zkLogin initialization:', error);
      alert('Gagal memulai login: ' + (error as Error).message);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-900 text-white p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="z-10 flex flex-col items-center gap-8 text-center max-w-md">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            VibeMap
          </h1>
          <p className="text-zinc-400 text-lg">
            Discover places, collect stamps, and earn rewards on Sui.
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-transform active:scale-95 shadow-xl shadow-white/10"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
          
          <p className="text-xs text-zinc-500">
            Powered by Sui zkLogin. No wallet needed.
          </p>
        </div>
      </div>
    </div>
  );
};
