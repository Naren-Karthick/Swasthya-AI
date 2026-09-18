import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { AccessToken } from 'livekit-server-sdk'

// Middleware plugin to serve /api/livekit-token in Vite dev server
function livekitTokenPlugin() {
  return {
    name: 'livekit-token-api',
    configureServer(server) {
      server.middlewares.use('/api/livekit-token', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const room = urlObj.searchParams.get('room') || 'swasthya-consultation';
          const identity = urlObj.searchParams.get('identity') || `patient-${Date.now()}`;
          const name = urlObj.searchParams.get('name') || 'Swasthya Patient';

          const env = loadEnv(server.config.mode || 'development', process.cwd(), '');
          const apiKey = env.LIVEKIT_API_KEY || env.VITE_LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY || '';
          const apiSecret = env.LIVEKIT_API_SECRET || env.VITE_LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET || '';
          const livekitUrl = env.LIVEKIT_URL || env.VITE_LIVEKIT_URL || process.env.LIVEKIT_URL || 'wss://swathya-ai-llrcu8m1.livekit.cloud';

          const at = new AccessToken(apiKey, apiSecret, {
            identity,
            name,
            ttl: '4h'
          });

          at.addGrant({
            roomJoin: true,
            room,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true
          });

          const token = await at.toJwt();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            token,
            room,
            identity,
            url: livekitUrl
          }));
        } catch (err) {
          console.error('Error in /api/livekit-token middleware:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), livekitTokenPlugin()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/@google/genai')) {
            return 'genai-sdk';
          }
          if (id.includes('node_modules/livekit-client') || id.includes('node_modules/@livekit')) {
            return 'livekit-vendor';
          }
        }
      }
    }
  }
})
