import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oxsporties.app',
  appName: 'OxSporties',
  webDir: 'public',
  server: {
    // Remote-load mode: the app shell loads the live production site
    // directly, so feature/content updates ship via your normal Vercel
    // deploy with NO app store re-review needed. Only native-level
    // changes (new plugins, permissions, push logic, icon/branding)
    // require a rebuild + resubmission.
    url: 'https://oxsporties.com',
    cleartext: false,
  },
  plugins: {
    Keyboard: {
      // Without this, WKWebView doesn't shrink the page when the
      // keyboard opens — it just overlays the keyboard on top of a
      // full-height page, leaving a dead gap between the last visible
      // content (e.g. a chat input bar) and the keyboard itself.
      // 'body' tells the native layer to actually resize the page,
      // so 100dvh-based layouts correctly shrink and the input bar
      // ends up flush against the keyboard.
      resize: 'body',
      style: 'default',
    },
  },
};

export default config;
