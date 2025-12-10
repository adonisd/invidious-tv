import "core-js/stable";
import "regenerator-runtime/runtime";

import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";

/* optional italic styles */
import "@fontsource/roboto/100-italic.css";
import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500-italic.css";
import "@fontsource/roboto/700-italic.css";
import "@fontsource/roboto/900-italic.css";

import { aliases, mdi } from "vuetify/iconsets/mdi";
import { themes, themeSelector } from "./helper/themes";

const app = createApp(App);

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  directives,
  components,
  theme: {
    defaultTheme: themeSelector.catppuccinMocha,
    themes,
    variations: {
      colors: ["primary", "secondary", "success", "error", "warning", "info"],
      lighten: 5,
      darken: 5,
    },
  },
});

app.use(vuetify);
app.use(router);
app.mount("#app");
