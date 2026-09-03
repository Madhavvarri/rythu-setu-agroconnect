import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rythusetu.connect",
  appName: "RythuSetu",
  // Static SPA shell produced by `npm run build:mobile` (CAP_BUILD=1 vite build).
  webDir: "dist/client",
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#1b7f4b",
      overlaysWebView: false,
    },
  },
};

export default config;
