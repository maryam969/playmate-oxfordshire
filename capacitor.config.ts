import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oxsporties.app',
  appName: 'OxSporties',
  webDir: 'public',
  server: {
    // Remote-load mode: the app shell loads the live production site
    // directly, so feature/content updates ship via your normal Vercel
    // deploy with NO app store re-review required. Only native-level
    // changes (new plugins, permissions, push logic, icon/branding)
    // require a rebuild + resubmission.
    url: 'https://oxsporties.com',
    cleartext: false,
  },
};

export default config;
