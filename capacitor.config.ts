import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wristyquill.invidious",
  appName: "Invidious TV",
  webDir: "hosted_web_app",
  server: {
    allowNavigation: ["*"],
  },
};

export default config;
