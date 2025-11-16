import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/denodo': {
        target: 'http://santhosh-portfolio.local:9090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/denodo/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const credentials = Buffer.from('admin:admin').toString('base64');
            proxyReq.setHeader('Authorization', `Basic ${credentials}`);
          });
        }
      },
      '/api/google': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/google/, ''),
      }
    }
  }
});
