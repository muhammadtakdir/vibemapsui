import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export const zkLoginConfig = {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER.apps.googleusercontent.com',
    REDIRECT_URI: 'https://vibemap.app/callback', // Update this to your Vercel URL later
};

export const initZkLogin = () => {
    const ephemeralKeyPair = new Ed25519Keypair();
    const randomness = generateRandomness();
    const maxEpoch = 2000; // Should fetch current epoch and add buffer
    const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

    // Save state to localStorage for callback handling
    localStorage.setItem('zklogin_state', JSON.stringify({
        ephemeralKeyPair: ephemeralKeyPair.getSecretKey(),
        randomness,
        maxEpoch,
        nonce
    }));

    const params = new URLSearchParams({
        client_id: zkLoginConfig.CLIENT_ID,
        redirect_uri: zkLoginConfig.REDIRECT_URI,
        response_type: 'id_token',
        scope: 'openid email',
        nonce: nonce,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const getStoredZkLoginState = () => {
    const state = localStorage.getItem('zklogin_state');
    return state ? JSON.parse(state) : null;
};
