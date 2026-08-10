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
      // 'body' only resizes the <body> element, not the WebView frame
      // itself — CSS units like 100dvh are measured against the WebView
      // frame, so with 'body' our layout never actually shrank and the
      // input bar stayed pinned to the (now keyboard-covered) bottom of
      // the old full height. 'native' resizes the real WebView frame,
      // so 100dvh recalculates correctly and the input bar ends up
      // right above the keyboard, fully visible.
      resize: 'native',
      style: 'default',
    },
  },
};

export default config;
