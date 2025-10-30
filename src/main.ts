import "core-js/stable";
import "regenerator-runtime/runtime";
// import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// import "@fontsource/roboto/100.css";
// import "@fontsource/roboto/300.css";
// import "@fontsource/roboto/400.css";
// import "@fontsource/roboto/500.css";
// import "@fontsource/roboto/700.css";
// import "@fontsource/roboto/900.css";

// /* optional italic styles */
// import "@fontsource/roboto/100-italic.css";
// import "@fontsource/roboto/300-italic.css";
// import "@fontsource/roboto/400-italic.css";
// import "@fontsource/roboto/500-italic.css";
// import "@fontsource/roboto/700-italic.css";
// import "@fontsource/roboto/900-italic.css";

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          background: "#121212",
          surface: "#1E1E1E",
          primary: "#BB86FC",
          "primary-darken-1": "#3700B3",
          secondary: "#03DAC6",
          "secondary-darken-1": "#018786",
          error: "#CF6679",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
        },
      },
    },
  },
});

app.use(createPinia());
app.use(router);
app.use(vuetify);
// app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith("media-");
app.mount("#app");
