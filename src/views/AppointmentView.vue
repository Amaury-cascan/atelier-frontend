<template>
  <div class="appt-page">

    <!-- ── En-tête ── -->
    <header class="appt-header">
      <p class="header-eyebrow">Espace personnel</p>
      <h1 class="header-title">Mes rendez-vous</h1>
      <p v-if="!loading && upcomingAppointments.length > 0" class="header-count">
        {{ upcomingAppointments.length }}
        {{ upcomingAppointments.length === 1 ? 'rendez-vous à venir' : 'rendez-vous à venir' }}
      </p>
    </header>

    <!-- ── Skeleton ── -->
    <div v-if="loading" class="appt-list">
      <div v-for="n in 3" :key="n" class="appt-card skeleton-card">
        <div class="skeleton-badge"></div>
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line--sm"></div>
          <div class="skeleton-line skeleton-line--lg"></div>
          <div class="skeleton-line skeleton-line--md"></div>
        </div>
      </div>
    </div>

    <!-- ── Liste des RDV à venir ── -->
    <div v-else-if="upcomingAppointments.length > 0" class="appt-list">
      <div
        v-for="(appt, i) in upcomingAppointments"
        :key="i"
        class="appt-card"
        :class="{
          'appt-card--urgent': daysUntil(appt.date) === 0 || daysUntil(appt.date) === 1,
          'appt-card--soon':   daysUntil(appt.date) <= 7 && daysUntil(appt.date) > 1,
        }"
      >
        <!-- Badge date calendrier -->
        <div class="date-badge">
          <span class="date-badge-day">{{ fmt(appt.date).dayNum }}</span>
          <span class="date-badge-month">{{ fmt(appt.date).month }}</span>
          <span class="date-badge-year">{{ fmt(appt.date).year }}</span>
        </div>

        <!-- Détails -->
        <div class="appt-body">
          <div class="appt-row-top">
            <span class="appt-weekday">{{ fmt(appt.date).dayName }}</span>
            <span
              class="appt-chip"
              :class="{
                'chip--urgent': daysUntil(appt.date) <= 1,
                'chip--soon':   daysUntil(appt.date) <= 7 && daysUntil(appt.date) > 1,
              }"
            >{{ countdownLabel(appt.date) }}</span>
          </div>

          <h3 class="appt-service">{{ appt.service }}</h3>

          <p class="appt-time">
            <i class="pi pi-clock"></i>
            {{ fmt(appt.date).time }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── État vide ── -->
    <div v-else class="empty-state">
      <div class="empty-icon-wrap">
        <i class="pi pi-calendar empty-icon"></i>
      </div>
      <h2 class="empty-title">Aucun rendez-vous à venir</h2>
      <p class="empty-sub">
        Prenez rendez-vous en ligne pour profiter de nos soins
      </p>
      <button @click="goToBooking" class="empty-cta">
        Prendre rendez-vous
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

interface Appointment {
  date: string;
  service: string;
  user: number;
}

const router      = useRouter();
const appointments = ref<Appointment[]>([]);
const loading      = ref(true);

const user   = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;

// ── Fetch ──
const fetchAppointments = async () => {
  try {
    const response = await axios.get(
      'https://backoffice.atelier-de-marie.com/api/appointment/list'
    );
    appointments.value = response.data.appointments;
  } catch (e) {
    console.error('Erreur récupération RDV :', e);
  } finally {
    loading.value = false;
  }
};

// ── Filtrage : uniquement les RDV futurs/aujourd'hui ──
const upcomingAppointments = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return appointments.value
    .filter((a) => a.user === userId && new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// ── Helpers date ──
const DAYS   = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
                'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];

const fmt = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    dayName: DAYS[d.getDay()],
    dayNum:  d.getDate(),
    month:   MONTHS[d.getMonth()],
    year:    d.getFullYear(),
    time:    `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`,
  };
};

const daysUntil = (dateStr: string): number => {
  const appt  = new Date(dateStr);
  appt.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((appt.getTime() - today.getTime()) / 86_400_000);
};

const countdownLabel = (dateStr: string): string => {
  const d = daysUntil(dateStr);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return 'Demain';
  return `Dans ${d} jours`;
};

const goToBooking = () => router.push({ path: '/', hash: '#booking' });

onMounted(fetchAppointments);
</script>

<style scoped>
/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
.appt-page {
  background-color: var(--cream);
  min-height: 100%;
  padding-bottom: 80px;
}

/* ─────────────────────────────────────────────
   En-tête
───────────────────────────────────────────── */
.appt-header {
  text-align: center;
  padding: 56px 24px 40px;
}

.header-eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--taupe);
  margin-bottom: 8px;
}

.header-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  font-weight: 300;
  color: var(--text-dark);
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.header-count {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-style: italic;
  letter-spacing: 0.06em;
}

/* ─────────────────────────────────────────────
   Liste
───────────────────────────────────────────── */
.appt-list {
  width: 92%;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ─────────────────────────────────────────────
   Carte RDV
───────────────────────────────────────────── */
.appt-card {
  background: var(--white);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--border-color);
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow: hidden;
  transition: box-shadow 0.22s ease, border-left-color 0.22s ease;
}

.appt-card:hover {
  box-shadow: var(--shadow-md);
}

/* Variante urgent (aujourd'hui / demain) */
.appt-card--urgent {
  border-left-color: var(--taupe);
}

/* Variante bientôt (≤ 7 jours) */
.appt-card--soon {
  border-left-color: var(--gold);
}

/* ── Badge date ── */
.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 18px;
  background: var(--blush);
  border-right: 1px solid var(--border-color);
  min-width: 72px;
  gap: 1px;
  flex-shrink: 0;
}

.appt-card--urgent .date-badge {
  background: rgba(166, 124, 136, 0.1);
}

.date-badge-day {
  font-family: "Cormorant Garamond", serif;
  font-size: 2rem;
  font-weight: 500;
  color: var(--text-dark);
  line-height: 1;
}

.date-badge-month {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--taupe);
}

.date-badge-year {
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  margin-top: 2px;
}

/* ── Corps ── */
.appt-body {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.appt-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.appt-weekday {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Chip countdown */
.appt-chip {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--blush);
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.chip--urgent {
  background: rgba(166, 124, 136, 0.15);
  color: var(--taupe-dark);
}

.chip--soon {
  background: rgba(200, 168, 130, 0.15);
  color: #8a6830;
}

.appt-service {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--text-dark);
  letter-spacing: 0.02em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appt-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

.appt-time .pi {
  font-size: 0.72rem;
  color: var(--taupe);
}

/* ─────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────── */
.skeleton-card {
  background: var(--white);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--border-color);
  display: flex;
  align-items: stretch;
  overflow: hidden;
  animation: none !important;
}

.skeleton-badge {
  width: 72px;
  flex-shrink: 0;
  background: var(--blush);
  background: linear-gradient(90deg, var(--blush) 25%, #ede0dd 50%, var(--blush) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  flex: 1;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.skeleton-line {
  border-radius: 2px;
  background: linear-gradient(90deg, var(--blush) 25%, #ede0dd 50%, var(--blush) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  height: 10px;
}
.skeleton-line--sm  { width: 35%; }
.skeleton-line--lg  { width: 70%; height: 14px; }
.skeleton-line--md  { width: 25%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─────────────────────────────────────────────
   État vide
───────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 24px 40px;
  text-align: center;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--blush);
  border: 1.5px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.empty-icon {
  font-size: 1.8rem;
  color: var(--taupe);
  opacity: 0.7;
}

.empty-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.7rem;
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 0.03em;
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  max-width: 320px;
  line-height: 1.6;
}

.empty-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--taupe);
  color: white;
  border: none;
  padding: 13px 28px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.empty-cta:hover {
  background: var(--taupe-dark);
  transform: translateY(-1px);
}

.empty-cta .pi {
  font-size: 0.75rem;
  transition: transform 0.22s ease;
}

.empty-cta:hover .pi {
  transform: translateX(4px);
}

/* ─────────────────────────────────────────────
   Responsive
───────────────────────────────────────────── */
@media (min-width: 640px) {
  .date-badge {
    min-width: 84px;
    padding: 22px 22px;
  }

  .date-badge-day {
    font-size: 2.4rem;
  }

  .appt-service {
    font-size: 1.25rem;
  }
}
</style>
