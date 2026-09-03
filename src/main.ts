import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import router from "./router";
import "./assets/main.css";
import "./assets/admin.css";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";
import { createPinia } from "pinia";
import { ensureChartsRegistered } from "@/utils/chartSetup";

ensureChartsRegistered();

const app = createApp(App);
const pinia = createPinia();

const primeVueConfig = {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
  locale: {
    firstDayOfWeek: 1,
    dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
    dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
    monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    monthNamesShort: ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"],
    today: "Aujourd'hui",
    clear: "Effacer",
    dateFormat: "dd/mm/yy",
    accept: "Oui",
    reject: "Non",
  },
};

app.use(PrimeVue, primeVueConfig);
app.use(ToastService);
app.use(ConfirmationService);
app.use(pinia);
app.use(router);
app.mount("#app");