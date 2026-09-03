<template>
  <section class="adm-page dash">
    <header class="dash-hero">
      <div>
        <p class="adm-eyebrow">Administration</p>
        <h1 class="adm-title">Bonjour{{ greetingName }}</h1>
        <p class="adm-subtitle">{{ heroLine }}</p>
      </div>
      <div class="dash-hero-actions">
        <Button label="Nouveau RDV" icon="pi pi-plus" @click="router.push('/admin/calendrier')" />
        <Button label="Statistiques" icon="pi pi-chart-bar" severity="secondary" outlined @click="router.push('/admin/statistiques')" />
      </div>
    </header>

    <p v-if="error" class="adm-error">{{ error }}</p>

    <div class="kpi-row">
      <article v-for="(card, i) in kpiCards" :key="card.label" class="kpi" :style="{ animationDelay: `${i * 60}ms` }">
        <div class="kpi-top">
          <span class="kpi-label">{{ card.label }}</span>
          <i :class="card.icon"></i>
        </div>
        <p class="kpi-value">{{ card.count }}</p>
        <p class="kpi-meta">rendez-vous</p>
        <p class="kpi-ca">{{ formatEuro(card.total) }}</p>
      </article>
    </div>

    <div class="focus-row">
      <section class="adm-panel next-card" v-if="nextAppt">
        <p class="next-kicker">Prochain rendez-vous</p>
        <h2>{{ formatTime(nextAppt.date) }}</h2>
        <p class="next-who">{{ nextAppt.clientFirstName }} {{ nextAppt.clientName }}</p>
        <p class="next-svc">{{ nextAppt.serviceName }} · {{ nextAppt.price }} €</p>
        <p class="next-countdown">{{ countdownLabel }}</p>
        <Button label="Ouvrir l'agenda" size="small" text icon="pi pi-arrow-right" @click="router.push('/admin/calendrier')" />
      </section>
      <section class="adm-panel next-card idle" v-else>
        <p class="next-kicker">Prochain rendez-vous</p>
        <h2>Rien de prévu</h2>
        <p class="next-svc">La journée est encore ouverte — parfait pour un créneau surprise.</p>
        <Button label="Planifier" size="small" @click="router.push('/admin/calendrier')" />
      </section>

      <section class="adm-panel week-strip">
        <div class="panel-head compact">
          <div>
            <h2>Cette semaine</h2>
            <p>Charge journalière</p>
          </div>
        </div>
        <div class="week-bars">
          <button
            v-for="d in weekStrip"
            :key="d.key"
            type="button"
            class="week-bar"
            :class="{ today: d.key === todayKey, busy: d.count > 0 }"
            @click="router.push('/admin/calendrier')"
          >
            <span class="bar-fill" :style="{ height: `${d.pct}%` }"></span>
            <strong>{{ d.count }}</strong>
            <em>{{ d.label }}</em>
          </button>
        </div>
        <p class="occ">Occupation estimée jour : <b>{{ occupancyPct }}%</b> (créneaux 8h–20h)</p>
      </section>
    </div>

    <div class="dash-grid">
      <section class="adm-panel agenda-panel">
        <div class="panel-head">
          <div>
            <h2>Aujourd'hui</h2>
            <p>{{ formatLongDate(todayKey) }}</p>
          </div>
          <router-link to="/admin/calendrier" class="panel-link">Voir l'agenda →</router-link>
        </div>

        <div v-if="loading" class="skeleton-stack">
          <div v-for="n in 3" :key="n" class="skeleton"></div>
        </div>

        <div v-else-if="todayAppts.length === 0" class="empty">
          <i class="pi pi-sun"></i>
          <p>Aucune prestation prévue aujourd'hui.</p>
          <Button label="Planifier" size="small" @click="router.push('/admin/calendrier')" />
        </div>

        <ul v-else class="timeline">
          <li v-for="a in todayAppts" :key="a.id" class="timeline-item" :style="chipStyle(a.serviceId)" @click="router.push('/admin/calendrier')">
            <div class="tl-time">
              <strong>{{ formatTime(a.date) }}</strong>
              <span>{{ formatTime(a.endDate) }}</span>
            </div>
            <div class="tl-body">
              <h3>{{ a.serviceName }}</h3>
              <p>{{ a.clientFirstName }} {{ a.clientName }}</p>
            </div>
            <div class="tl-price">{{ a.price }} €</div>
          </li>
        </ul>
      </section>

      <section class="adm-panel chart-panel">
        <div class="panel-head">
          <div>
            <h2>Mix du mois</h2>
            <p>Répartition du chiffre d'affaires</p>
          </div>
        </div>
        <div v-if="!loading && monthMix.labels.length" class="chart-wrap">
          <Chart type="doughnut" :data="monthMix" :options="doughnutOptions" class="chart" />
        </div>
        <div v-else-if="!loading" class="empty compact">
          <p>Pas encore de CA ce mois-ci.</p>
        </div>
        <div v-else class="skeleton chart-skel"></div>
      </section>

      <section class="adm-panel trend-panel">
        <div class="panel-head">
          <div>
            <h2>Tendance 14 jours</h2>
            <p>Chiffre d'affaires quotidien</p>
          </div>
        </div>
        <div v-if="!loading" class="chart-wrap tall">
          <Chart type="line" :data="trendData" :options="lineOptions" class="chart" />
        </div>
        <div v-else class="skeleton chart-skel tall"></div>
      </section>

      <section class="shortcuts">
        <router-link v-for="card in cards" :key="card.to" :to="card.to" class="shortcut">
          <span class="shortcut-ico"><i :class="card.icon"></i></span>
          <span>
            <strong>{{ card.label }}</strong>
            <small>{{ card.desc }}</small>
          </span>
          <i class="pi pi-arrow-right arrow"></i>
        </router-link>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import { adminApi } from '@/services/adminApi';
import { useAuthStore } from '@/stores/authStore';
import {
  addDays,
  formatEuro,
  formatLongDate,
  formatTime,
  serviceColor,
  startOfWeek,
  toDateKey,
} from '@/utils/adminFormat';
import { chartFonts, salonChartColors } from '@/utils/chartSetup';

type Appt = {
  id: number; date: string; endDate: string; price: number;
  serviceId: number; serviceName: string; clientId: number; clientName: string; clientFirstName: string;
};

const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);
const error = ref('');
const appointments = ref<Appt[]>([]);
const nowTick = ref(Date.now());
let timer: number | undefined;
const stats = ref<Record<string, { count: number; total: number }>>({
  day: { count: 0, total: 0 },
  week: { count: 0, total: 0 },
  month: { count: 0, total: 0 },
  year: { count: 0, total: 0 },
});

const todayKey = toDateKey(new Date());
const weekdayShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const greetingName = computed(() => {
  const n = auth.user?.firstName?.trim();
  return n ? `, ${n}` : '';
});

const heroLine = computed(() => {
  const n = stats.value.day.count;
  if (n === 0) return 'Journée libre — idéal pour préparer le salon ou avancer sur le catalogue.';
  if (n === 1) return '1 rendez-vous aujourd\'hui. Belle journée devant toi.';
  return `${n} rendez-vous aujourd'hui · ${formatEuro(stats.value.day.total)} de CA prévu.`;
});

const kpiCards = computed(() => [
  { label: "Aujourd'hui", count: stats.value.day.count, total: stats.value.day.total, icon: 'pi pi-sun' },
  { label: 'Cette semaine', count: stats.value.week.count, total: stats.value.week.total, icon: 'pi pi-calendar' },
  { label: 'Ce mois', count: stats.value.month.count, total: stats.value.month.total, icon: 'pi pi-wallet' },
  { label: 'Cette année', count: stats.value.year.count, total: stats.value.year.total, icon: 'pi pi-chart-line' },
]);

const todayAppts = computed(() =>
  appointments.value
    .filter((a) => a.date?.startsWith(todayKey))
    .sort((a, b) => a.date.localeCompare(b.date)),
);

const nextAppt = computed(() => {
  const now = nowTick.value;
  return [...appointments.value]
    .filter((a) => new Date(a.date).getTime() >= now - 2 * 60000)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
});

const countdownLabel = computed(() => {
  if (!nextAppt.value) return '';
  const diff = new Date(nextAppt.value.date).getTime() - nowTick.value;
  if (diff <= 0) return 'En cours ou imminent';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `Dans ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `Dans ${h} h ${m.toString().padStart(2, '0')}`;
});

const weekStrip = computed(() => {
  const start = startOfWeek(new Date());
  const counts = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const key = toDateKey(d);
    const count = appointments.value.filter((a) => a.date?.startsWith(key)).length;
    return { key, count, label: weekdayShort[i] };
  });
  const max = Math.max(1, ...counts.map((c) => c.count));
  return counts.map((c) => ({ ...c, pct: Math.max(8, Math.round((c.count / max) * 100)) }));
});

const occupancyPct = computed(() => {
  const minsBusy = todayAppts.value.reduce((sum, a) => {
    const d = Math.max(0, (new Date(a.endDate).getTime() - new Date(a.date).getTime()) / 60000);
    return sum + d;
  }, 0);
  const dayCapacity = (20 - 8) * 60;
  return Math.min(100, Math.round((minsBusy / dayCapacity) * 100));
});

const monthKey = todayKey.slice(0, 7);

const monthMix = computed(() => {
  const map = new Map<string, number>();
  for (const a of appointments.value) {
    if (!a.date?.startsWith(monthKey) || !a.price) continue;
    map.set(a.serviceName, (map.get(a.serviceName) || 0) + a.price);
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  return {
    labels: entries.map(([k]) => k),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: salonChartColors.slice(0, entries.length),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
});

const trendData = computed(() => {
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const key = toDateKey(d);
    labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
    values.push(
      appointments.value
        .filter((a) => a.date?.startsWith(key))
        .reduce((sum, a) => sum + (a.price || 0), 0),
    );
  }
  return {
    labels,
    datasets: [{
      label: 'CA (€)',
      data: values,
      fill: true,
      borderColor: '#c17f59',
      backgroundColor: 'rgba(193, 127, 89, 0.16)',
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: '#c17f59',
      borderWidth: 2.5,
    }],
  };
});

const doughnutOptions = {
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, font: { family: chartFonts.family, size: 11 }, color: '#6e675f', padding: 14 },
    },
  },
};

const lineOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: chartFonts.family, size: 10 }, color: '#6e675f' } },
    y: { grid: { color: 'rgba(230,223,214,0.8)' }, ticks: { font: { family: chartFonts.family, size: 10 }, color: '#6e675f' } },
  },
};

const cards = [
  { to: '/admin/calendrier', label: 'Calendrier', desc: 'Agenda jour · semaine · mois', icon: 'pi pi-calendar' },
  { to: '/admin/clients', label: 'Clients', desc: 'Fiches et historique', icon: 'pi pi-users' },
  { to: '/admin/prestations', label: 'Prestations', desc: 'Catalogue et tarifs', icon: 'pi pi-list' },
  { to: '/admin/images', label: 'Galerie', desc: 'Images du site', icon: 'pi pi-images' },
];

const chipStyle = (serviceId: number) => {
  const c = serviceColor(serviceId);
  return { '--chip-bg': c.bg, '--chip-border': c.border, '--chip-text': c.text } as Record<string, string>;
};

onMounted(async () => {
  try {
    const [dash, appts] = await Promise.all([adminApi.getDashboard(), adminApi.listAppointments()]);
    stats.value = dash.data.stats;
    appointments.value = appts.data.appointments;
  } catch {
    error.value = 'Impossible de charger le tableau de bord.';
  } finally {
    loading.value = false;
  }
  timer = window.setInterval(() => { nowTick.value = Date.now(); }, 30000);
});
onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<style scoped>
.dash-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.dash-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.kpi-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.kpi {
  position: relative;
  overflow: hidden;
  background: var(--adm-surface);
  border: 1px solid var(--adm-border);
  border-radius: var(--adm-radius);
  padding: 18px 18px 16px;
  box-shadow: var(--adm-shadow);
  animation: adm-fade-up 0.5s var(--adm-ease) both;
}
.kpi::after {
  content: "";
  position: absolute;
  inset: auto -20% -40% auto;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(193,127,89,0.18), transparent 70%);
  pointer-events: none;
}
.kpi-top { display: flex; justify-content: space-between; align-items: center; color: var(--adm-muted); }
.kpi-top i { color: var(--adm-accent); }
.kpi-label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; }
.kpi-value {
  font-family: var(--adm-font-display);
  font-size: 2.4rem;
  line-height: 1;
  margin: 10px 0 0;
}
.kpi-meta { margin: 4px 0 0; font-size: 0.8rem; color: var(--adm-muted); }
.kpi-ca { margin: 10px 0 0; color: var(--adm-accent-deep); font-weight: 600; }

.focus-row {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
  margin-bottom: 16px;
}
.next-card {
  padding: 22px 22px 18px;
  background:
    radial-gradient(500px 200px at 0% 0%, rgba(193,127,89,0.18), transparent 55%),
    var(--adm-surface);
}
.next-kicker {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--adm-accent);
}
.next-card h2 {
  margin: 8px 0 0;
  font-family: var(--adm-font-display);
  font-size: 2.4rem;
  font-weight: 500;
  line-height: 1;
}
.next-who { margin: 10px 0 0; font-weight: 600; font-size: 1.05rem; }
.next-svc { margin: 4px 0 0; color: var(--adm-muted); font-size: 0.9rem; }
.next-countdown {
  margin: 14px 0 10px;
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--adm-accent-soft);
  color: var(--adm-accent-deep);
  font-weight: 700;
  font-size: 0.85rem;
}
.next-card.idle h2 { font-size: 1.8rem; }

.week-strip { padding: 18px; }
.panel-head.compact { margin-bottom: 10px; }
.week-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  align-items: end;
  min-height: 120px;
}
.week-bar {
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font: inherit;
  padding: 0;
  height: 120px;
  justify-content: end;
}
.bar-fill {
  width: 100%;
  max-width: 28px;
  border-radius: 10px 10px 4px 4px;
  background: linear-gradient(180deg, #d4a084, #c17f59);
  opacity: 0.35;
  transition: height 0.35s var(--adm-ease), opacity 0.2s;
}
.week-bar.busy .bar-fill { opacity: 1; }
.week-bar.today .bar-fill { box-shadow: 0 0 0 3px rgba(193,127,89,0.25); }
.week-bar strong { font-size: 0.85rem; }
.week-bar em { font-style: normal; font-size: 0.68rem; color: var(--adm-muted); text-transform: uppercase; }
.occ { margin: 12px 0 0; font-size: 0.82rem; color: var(--adm-muted); }
.occ b { color: var(--adm-accent-deep); }

.dash-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
  margin-bottom: 16px;
}
.panel-head h2 {
  font-family: var(--adm-font-display);
  font-size: 1.45rem;
  font-weight: 500;
  margin: 0;
}
.panel-head p { margin: 4px 0 0; color: var(--adm-muted); font-size: 0.85rem; }
.panel-link {
  color: var(--adm-accent);
  text-decoration: none;
  font-size: 0.85rem;
  white-space: nowrap;
}
.agenda-panel, .chart-panel, .trend-panel { padding: 20px; }

.timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.timeline-item {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--chip-bg, #f3e4d8);
  border: 1px solid color-mix(in srgb, var(--chip-border, #c17f59) 35%, transparent);
  color: var(--chip-text, #5c3a28);
  transition: transform 0.2s var(--adm-ease), box-shadow 0.2s var(--adm-ease);
  cursor: pointer;
}
.timeline-item:hover { transform: translateY(-1px); box-shadow: var(--adm-shadow); }
.tl-time { display: flex; flex-direction: column; font-size: 0.78rem; }
.tl-time strong { font-size: 0.95rem; }
.tl-body h3 { margin: 0; font-size: 0.95rem; font-weight: 600; }
.tl-body p { margin: 2px 0 0; font-size: 0.82rem; opacity: 0.85; }
.tl-price { font-weight: 700; font-size: 0.9rem; }

.chart-wrap { position: relative; min-height: 220px; }
.chart-wrap.tall { min-height: 260px; }
.chart { max-width: 100%; }

.empty {
  display: grid;
  place-items: center;
  gap: 10px;
  text-align: center;
  padding: 36px 12px;
  color: var(--adm-muted);
}
.empty i { font-size: 1.6rem; color: var(--adm-accent); }
.empty.compact { padding: 48px 12px; }

.skeleton {
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(90deg, #efe8e0, #f7f2ec, #efe8e0);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
.skeleton-stack { display: grid; gap: 10px; }
.chart-skel { min-height: 220px; }
.chart-skel.tall { min-height: 260px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.shortcuts { display: grid; gap: 10px; }
.shortcut {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 16px 18px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface);
  border: 1px solid var(--adm-border);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--adm-shadow);
  transition: border-color 0.2s var(--adm-ease), transform 0.2s var(--adm-ease);
}
.shortcut:hover { border-color: var(--adm-accent); transform: translateY(-2px); }
.shortcut-ico {
  width: 42px; height: 42px; border-radius: 12px;
  display: grid; place-items: center;
  background: var(--adm-accent-soft); color: var(--adm-accent);
}
.shortcut strong { display: block; font-size: 0.98rem; }
.shortcut small { color: var(--adm-muted); font-size: 0.8rem; }
.shortcut .arrow { color: var(--adm-accent); opacity: 0.5; }

@media (min-width: 900px) {
  .kpi-row { grid-template-columns: repeat(4, 1fr); }
  .focus-row { grid-template-columns: 0.9fr 1.1fr; }
  .dash-grid {
    grid-template-columns: 1.2fr 1fr;
    grid-template-areas:
      "agenda mix"
      "trend trend"
      "shortcuts shortcuts";
  }
  .agenda-panel { grid-area: agenda; }
  .chart-panel { grid-area: mix; }
  .trend-panel { grid-area: trend; }
  .shortcuts {
    grid-area: shortcuts;
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 899px) {
  .dash-hero-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .dash-hero-actions :deep(.p-button) { width: 100%; }
  .kpi-value { font-size: 1.85rem; }
  .kpi { padding: 14px; }
  .next-card h2 { font-size: 2rem; }
  .week-bars { gap: 4px; min-height: 100px; }
  .week-bar { height: 100px; }
  .bar-fill { max-width: 22px; }
  .timeline-item {
    grid-template-columns: 56px 1fr;
    gap: 8px;
  }
  .tl-price {
    grid-column: 2;
    justify-self: start;
    font-size: 0.82rem;
  }
  .chart-wrap, .chart-skel { min-height: 200px; }
  .chart-wrap.tall, .chart-skel.tall { min-height: 220px; }
  .shortcuts { grid-template-columns: 1fr; }
}
</style>