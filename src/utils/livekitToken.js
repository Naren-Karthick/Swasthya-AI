/**
 * LiveKit Access Token Utility for Swasthya AI
 * Handles secure token generation for connecting to LiveKit Cloud WebRTC rooms.
 * Supports:
 *  1. Vite dev server / backend API endpoint (`/api/livekit-token`)
 *  2. Universal Web Crypto HMAC-SHA256 JWT generation as a reliable fallback
 */

const DEFAULT_LIVEKIT_URL = 'wss://swathya-ai-llrcu8m1.livekit.cloud';

export const getLiveKitConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_LIVEKIT_URL || import.meta.env.LIVEKIT_URL)
    : (typeof process !== 'undefined' ? (process.env.VITE_LIVEKIT_URL || process.env.LIVEKIT_URL) : null);
  const envKey = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_LIVEKIT_API_KEY || import.meta.env.LIVEKIT_API_KEY)
    : (typeof process !== 'undefined' ? (process.env.VITE_LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY) : null);
  const envSecret = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_LIVEKIT_API_SECRET || import.meta.env.LIVEKIT_API_SECRET)
    : (typeof process !== 'undefined' ? (process.env.VITE_LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET) : null);

  return {
    url: envUrl || DEFAULT_LIVEKIT_URL,
    apiKey: envKey || '',
    apiSecret: envSecret || ''
  };
};

/**
 * Generates an HMAC-SHA256 signed JWT for LiveKit room access using Web Crypto API.
 */
async function generateClientToken({ apiKey, apiSecret, roomName, identity, name, ttlSeconds = 14400 }) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    name: name || 'Swasthya Patient',
    sub: identity,
    iss: apiKey,
    nbf: now - 5,
    exp: now + ttlSeconds,
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    }
  };

  const base64UrlEncode = (str) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const base64UrlEncodeBytes = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return base64UrlEncode(binary);
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
  const signatureB64 = base64UrlEncodeBytes(signature);

  return `${dataToSign}.${signatureB64}`;
}

/**
 * Retrieves a LiveKit room token, trying the backend API first, then client-side signing.
 * 
 * @param {object} params
 * @param {string} params.roomName - Unique room name
 * @param {string} [params.identity] - Participant identity
 * @param {string} [params.name] - Display name
 * @returns {Promise<{ token: string, url: string, room: string, identity: string }>}
 */
export async function getLiveKitToken({ roomName = 'swasthya-consultation', identity, name = 'Patient' } = {}) {
  const config = getLiveKitConfig();
  const participantIdentity = identity || `patient-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try local dev endpoint / backend route if available
  try {
    const query = new URLSearchParams({
      room: roomName,
      identity: participantIdentity,
      name
    });
    const res = await fetch(`/api/livekit-token?${query.toString()}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        return {
          token: data.token,
          url: data.url || config.url,
          room: data.room || roomName,
          identity: data.identity || participantIdentity
        };
      }
    }
  } catch {
    // If running in pure client build or preview without server endpoint, proceed to client fallback
  }

  // 2. Client-side Web Crypto fallback
  const token = await generateClientToken({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    roomName,
    identity: participantIdentity,
    name
  });

  return {
    token,
    url: config.url,
    room: roomName,
    identity: participantIdentity
  };
}
