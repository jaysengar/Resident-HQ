import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.residenthq.app',
  appName: 'ResidentHQ',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Point directly to the live Vercel deployment
    url: 'https://resident-hq.vercel.app/',
    cleartext: true
  }
};

export default config;
