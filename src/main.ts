import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import router from "./router";
import './assets/main.css'
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia';

const app = createApp(App);
const pinia = createPinia();

const primeVueConfig = {
    pt: Aura,
    locale: {
        firstDayOfWeek: 1,
        dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
        dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
        monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        monthNamesShort: ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"],
        today: "Aujourd'hui",
        clear: "Effacer",
        dateFormat: "dd/mm/yy"
    }
};

// Utiliser PrimeVue avec la configuration définie
app.use(PrimeVue, primeVueConfig);
app.use(pinia);
app.use(router);
app.mount('#app');
