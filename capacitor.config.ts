import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "online.backstagepro.app",
  appName: "Backstage Pro",
  webDir: "dist",
  // Em produção (APK/AAB) serve os arquivos localmente do dist/
  // Em dev pode apontar para o servidor vite via server.url
  server: {
    androidScheme: "https",
    // Descomente a linha abaixo APENAS para live-reload durante desenvolvimento:
    // url: "http://SEU_IP_LOCAL:8080",
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined, // configure ao gerar o keystore de produção
      keystoreAlias: undefined,
    },
    // Ícone e splash são copiados pelo capacitor copy via res/
    backgroundColor: "#F5F7FA",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // true apenas em debug
  },
  plugins: {
    // SplashScreen — mostrado enquanto o WebView carrega
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Browser — abre links externos no browser do sistema
    Browser: {
      presentationStyle: "fullscreen",
    },
    // Permissões de câmera/storage usadas no upload de avatar
    Filesystem: {},
    Camera: {},
  },
};

export default config;
