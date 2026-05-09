<template>
  <div class="res-page">
    <template v-if="service">

      <!-- ══ Bandeau service (pleine largeur) ══ -->
      <div class="res-banner">
        <div class="res-banner-inner">
          <router-link to="/#booking" class="res-back">
            <i class="pi pi-arrow-left"></i> Prestations
          </router-link>
          <div class="res-banner-center">
            <h1 class="res-title">{{ service.name }}</h1>
          </div>
          <div class="res-banner-right">
            <span class="res-meta"><i class="pi pi-clock"></i>&nbsp;{{ service.duration }}&nbsp;min</span>
            <span class="res-meta res-meta--price">{{ service.price }}&nbsp;€</span>
          </div>
        </div>
      </div>

      <!-- ══ Grille principale (pleine largeur) ══ -->
      <div class="res-grid">

        <!-- ─ Calendrier ─ -->
        <div class="col-calendar">
          <p class="col-label">Choisissez une date</p>
          <ModernCalendar
            v-model="reservation.date"
            :disabledDays="daysDisabled"
            :minDate="new Date()"
            :service="service"
            :appointments="appointments"
            :showPopup="false"
            @slots-available="onSlotsAvailable"
          />
        </div>

        <!-- ─ Créneaux + confirmation ─ -->
        <div class="col-slots" ref="slotsColRef">

          <Transition name="fade" mode="out-in">

            <!-- Aucune date encore -->
            <div v-if="!reservation.date" key="empty" class="slots-empty">
              <i class="pi pi-hand-pointer slots-empty-icon"></i>
              <p class="slots-empty-text">Sélectionnez un jour<br>dans le calendrier</p>
            </div>

            <!-- Date sélectionnée -->
            <div v-else key="active" class="slots-active">

              <div class="slots-header">
                <p class="col-label">Horaires disponibles</p>
                <p class="slots-date">{{ formattedDate }}</p>
              </div>

              <!-- Aucun créneau -->
              <div v-if="availableSlots.length === 0" class="no-slots">
                <i class="pi pi-calendar-times no-slots-icon"></i>
                <p>Aucun créneau disponible ce jour.</p>
                <p class="no-slots-hint">Choisissez une autre date.</p>
              </div>

              <!-- Grille créneaux -->
              <div v-else class="slots-grid">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.value"
                  class="slot-btn"
                  :class="{ 'slot-btn--active': reservation.time === slot.value }"
                  @click="selectTime(slot.value)"
                >{{ slot.label }}</button>
              </div>

              <!-- Confirmation -->
              <Transition name="confirm-in">
                <div v-if="reservation.time" class="confirm-box">
                  <div class="confirm-recap">
                    <div class="confirm-line confirm-line--main">
                      <span class="confirm-service">{{ service.name }}</span>
                      <span class="confirm-price">{{ service.price }}&nbsp;€</span>
                    </div>
                    <div class="confirm-line confirm-line--sub">
                      <span>{{ formattedDate }} &nbsp;·&nbsp; <strong>{{ reservation.time }}</strong></span>
                      <span>{{ service.duration }}&nbsp;min</span>
                    </div>
                  </div>
                  <button class="btn-confirm" @click="submitReservation">
                    <i class="pi pi-check"></i> Confirmer la réservation
                  </button>
                  <button class="btn-change" @click="reservation.time = ''">
                    Modifier l'horaire
                  </button>
                </div>
              </Transition>

            </div>
          </Transition>

        </div>
      </div>

    </template>

    <!-- Chargement -->
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement…</p>
    </div>

    <!-- Dialog confirmation -->
    <Dialog
      v-model:visible="showDialog"
      header="Réservation confirmée"
      :closable="true"
      :modal="true"
      class="custom-dialog"
    >
      <p class="dialog-text">
        Votre rendez-vous pour <strong>{{ service?.name }}</strong> a bien été enregistré
        le <strong>{{ formattedDate }}</strong> à <strong>{{ reservation.time }}</strong>.
      </p>
      <p class="dialog-text dialog-text--sub">
        Un email de confirmation vous a été envoyé. Vérifiez vos courriers indésirables si vous ne le trouvez pas.
      </p>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServiceStore } from "@/stores/entityStore";
import axios from 'axios';
import ModernCalendar from "@/components/ModernCalendar.vue";
import Dialog from 'primevue/dialog';

interface Service {
  id: number; name: string; description: string; duration: number; price: number; picture: string;
}
interface Appointment { date: string; endDate: string; }
interface TimeSlot { label: string; value: string | null; disabled?: boolean; }

const route = useRoute();
const router = useRouter();
const serviceStore  = useServiceStore();
const service       = ref<Service | null>(null);
const daysDisabled  = ref([]);
const reservation   = ref<{ date: Date | null; time: string }>({ date: null, time: '' });
const appointments  = ref<Appointment[]>([]);
const showDialog    = ref(false);
const availableSlots = ref<TimeSlot[]>([]);
const slotsColRef   = ref<HTMLElement | null>(null);

const formattedDate = computed(() => {
  if (!reservation.value.date) return '';
  return reservation.value.date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
});

const fetchServices = async () => {
  await serviceStore.fetchEntities();
  const name = route.params.service as string;
  service.value = serviceStore.services?.find((s: Service) => s.name === name) || null;
};
const fetchAppointments = async () => {
  try {
    const r = await axios.get('https://backoffice.atelier-de-marie.com/api/appointment/list');
    appointments.value = r.data.appointments;
  } catch (e) { console.error(e); }
};

const onSlotsAvailable = async (slots: TimeSlot[]) => {
  availableSlots.value = slots;
  reservation.value.time = '';
  // Sur mobile, scroll vers la colonne des créneaux
  await nextTick();
  if (window.innerWidth < 860 && slotsColRef.value) {
    slotsColRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const selectTime = (val: string | null) => {
  if (val) reservation.value.time = val;
};

const submitReservation = async () => {
  if (!reservation.value.date || !reservation.value.time || !service.value) {
    alert('Veuillez choisir une date et une heure.'); return;
  }
  const dt = new Date(reservation.value.date);
  const [h, m] = reservation.value.time.split(':').map(Number);
  dt.setHours(h, m);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user?.id) { alert('Veuillez vous connecter.'); return; }
  const utc = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  try {
    const res = await axios.post('https://backoffice.atelier-de-marie.com/api/appointment/create', {
      date: utc.toISOString(), serviceId: service.value.id, clientId: user.id,
    });
    if (res.data.success) {
      showDialog.value = true;
      setTimeout(() => { showDialog.value = false; router.push('/mes-rendez-vous'); }, 10000);
    } else { alert(res.data.message || 'Une erreur est survenue.'); }
  } catch { alert('Une erreur est survenue.'); }
};

fetchServices();
fetchAppointments();
</script>

<style scoped>
/* ══════════════════════════════════════════
   PAGE — aucun max-width, pleine largeur
══════════════════════════════════════════ */
.res-page {
  background: var(--cream);
  min-height: 70vh;
}

/* ══════════════════════════════════════════
   BANDEAU SERVICE
══════════════════════════════════════════ */
.res-banner {
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  padding: 0 5%;
}
.res-banner-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 72px;
  flex-wrap: wrap;
}
.res-back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
  flex-shrink: 0;
  transition: color 0.2s ease;
}
.res-back:hover { color: var(--taupe); }
.res-back .pi { font-size: 0.62rem; }

.res-banner-center { flex: 1; text-align: center; }
.res-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.3rem, 2.5vw, 1.8rem);
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.res-banner-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.res-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 5px 12px;
}
.res-meta .pi { font-size: 0.68rem; }
.res-meta--price {
  background: var(--taupe);
  border-color: var(--taupe);
  color: white;
  font-family: "Cormorant Garamond", serif;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* ══════════════════════════════════════════
   GRILLE PLEINE LARGEUR
══════════════════════════════════════════ */
.res-grid {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 140px);
}

/* ── Labels de colonne ── */
.col-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 18px;
}

/* ── Colonne calendrier ── */
.col-calendar {
  background: var(--white);
  padding: 32px 5%;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.col-calendar > .col-label { align-self: flex-start; }

/* ── Colonne créneaux ── */
.col-slots {
  flex: 1;
  padding: 32px 5%;
  display: flex;
  flex-direction: column;
}

/* ── Placeholder ── */
.slots-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 0;
}
.slots-empty-icon {
  font-size: 2rem;
  color: var(--taupe);
  opacity: 0.2;
}
.slots-empty-text {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.2rem;
  font-weight: 300;
  text-align: center;
  line-height: 1.65;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

/* ── Panel actif (date sélectionnée) ── */
.slots-active { display: flex; flex-direction: column; gap: 0; flex: 1; }

.slots-header { margin-bottom: 18px; }
.slots-date {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: var(--text-dark);
  text-transform: capitalize;
  letter-spacing: 0.02em;
  margin-top: -10px;
}

/* ── Aucun créneau ── */
.no-slots {
  padding: 24px 0;
  color: var(--text-muted);
}
.no-slots-icon {
  font-size: 1.8rem;
  color: var(--taupe);
  opacity: 0.35;
  display: block;
  margin-bottom: 10px;
}
.no-slots p { font-size: 0.85rem; margin: 0; }
.no-slots-hint { font-size: 0.78rem; opacity: 0.7; margin-top: 4px !important; }

/* ══════════════════════════════════════════
   GRILLE CRÉNEAUX — uniforme, bien alignée
══════════════════════════════════════════ */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 28px;
}

.slot-btn {
  width: 100%;
  background: var(--white);
  border: 1px solid var(--border-color);
  padding: 13px 0;
  font-family: "Cormorant Garamond", serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-dark);
  letter-spacing: 0.04em;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.slot-btn:hover {
  background: var(--blush);
  border-color: var(--taupe);
  color: var(--taupe);
}
.slot-btn--active {
  background: var(--taupe);
  border-color: var(--taupe);
  color: white;
}

/* ══════════════════════════════════════════
   CONFIRMATION
══════════════════════════════════════════ */
.confirm-box {
  border-top: 1px solid var(--border-color);
  padding-top: 22px;
}

.confirm-recap {
  background: var(--blush);
  border-left: 3px solid var(--taupe);
  padding: 14px 18px;
  margin-bottom: 14px;
}
.confirm-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.confirm-line + .confirm-line { margin-top: 6px; }
.confirm-line--main {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-dark);
}
.confirm-line--sub {
  font-size: 0.76rem;
  color: var(--text-muted);
}
.confirm-line--sub strong { color: var(--taupe); font-weight: 700; }
.confirm-service { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.confirm-price {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--taupe);
  flex-shrink: 0;
}

.btn-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--taupe);
  color: white;
  border: none;
  padding: 16px 32px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.22s ease;
  margin-bottom: 10px;
  width: 100%;
  max-width: 400px;
}
.btn-confirm:hover { background: var(--taupe-dark); }

.btn-change {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s ease;
}
.btn-change:hover { color: var(--taupe); }

/* ══════════════════════════════════════════
   LOADING & DIALOG
══════════════════════════════════════════ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 320px;
  color: var(--text-muted);
  font-size: 0.82rem;
}
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 1.5px solid var(--border-color);
  border-top-color: var(--taupe);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.dialog-text { font-size: 0.9rem; color: var(--text-dark); line-height: 1.8; margin-bottom: 12px; }
.dialog-text--sub { font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-bottom: 0; }

/* ══════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.confirm-in-enter-active { transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.confirm-in-enter-from   { opacity: 0; transform: translateY(8px); }

/* ══════════════════════════════════════════
   DESKTOP — deux colonnes pleine hauteur
══════════════════════════════════════════ */
@media (min-width: 860px) {
  .res-grid {
    flex-direction: row;
    align-items: stretch;
  }

  .col-calendar {
    width: 460px;
    flex-shrink: 0;
    border-bottom: none;
    border-right: 1px solid var(--border-color);
    align-items: flex-start;
    padding: 36px 40px;
  }

  .col-slots {
    flex: 1;
    padding: 36px 48px;
    min-width: 0;
  }

  /* Créneaux : colonnes fixes 88px, grille alignée à gauche */
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(88px, 88px));
  }

  .slot-btn { width: 88px; }

  .btn-confirm {
    max-width: 360px;
  }
}

@media (min-width: 1200px) {
  .col-calendar { padding: 40px 56px; }
  .col-slots    { padding: 40px 60px; }
}
</style>
