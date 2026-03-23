import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dailyLog.app",
  appName: "daily-log",
  webDir: "public",
  server: {
    url: "https://daily-log-frontend.vercel.app",
    cleartext: false, // http라면 true, https면 없어도 됨
  },
};

export default config;
