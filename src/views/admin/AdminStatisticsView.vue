<template>
  <section class="adm-page stats">
    <header class="stats-hero">
      <div>
        <p class="adm-eyebrow">Pilotage</p>
        <h1 class="adm-title">Statistiques</h1>
        <p class="adm-subtitle">Visualise le rythme du salon : volumes, mix prestations et chiffre d'affaires.</p>
      </div>
    </header>

    <div class="filters adm-panel">
      <SelectButton
        v-model="period"
        :options="periodOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
      <InputText v-if="period === 'daily'" v-model="selected" type="date" @change="load" />
      <InputText v-else-if="period === 'yearly'" v-model="selected" type="number" @change="load" />
      <InputText
        v-else
        v-model="selected"
        type="text"
        :placeholder="period === 'weekly' ? 'WW-YYYY' : 'MM-YYYY'"
        @change="load"
      />
      <Button icon="pi pi-refresh" severity="secondary" outlined @click="load" :loading="loading" />
    </div>

    <p v-if="error" class="adm-error">{{ error }}</p>

    <div class="summary">
      <article class="adm-panel kpi">
        <span>Rendez-vous</span>
        <strong>{{ total.count }}</strong>
        <small>{{ periodLabel }}</small>
      </article>
      <article class="adm-panel kpi accent">
        <span>Chiffre d'affaires</span>
        <strong>{{ formatEuro(total.total) }}</strong>
        <small>panier moyen {{ formatEuro(avgTicket) }}</small>
      </article>
      <article class="adm-panel kpi">
        <span>vs période préc.</span>
        <strong :class="deltaClass">{{ deltaLabel }}</strong>
        <small>{{ formatEuro(previousTotal) }} avant</small>
      </article>
      <article class="adm-panel kpi">
        <span>Prestations</span>
        <strong>{{ rows.length }}</strong>
        <small>dans la période</small>
      </article>
    </div>

    <div class="charts">
      <section class="adm-panel chart-card">
        <div class="panel-head">
          <h2>Mix prestations</h2>
          <p>Part du CA</p>
        </div>
        <div v-if="loading" class="skel"></div>
        <div v-else-if="doughnutData.labels.length" class="chart-box">
          <Chart type="doughnut" :data="doughnutData" :options="doughnutOptions" />
        </div>
        <div v-else class="empty">Aucune donnée pour cette période.</div>
      </section>

      <section class="adm-panel chart-card">
        <div class="panel-head">
          <h2>CA par prestation</h2>
          <p>Comparaison</p>
        </div>
        <div v-if="loading" class="skel"></div>
        <div v-else-if="barData.labels.length" class="chart-box tall">
          <Chart type="bar" :data="barData" :options="barOptions" />
        </div>
        <div v-else class="empty">Aucune donnée pour cette période.</div>
      </section>
    </div>

    <section class="adm-panel chart-card trend" v-if="trendData.labels.length">
      <div class="panel-head">
        <h2>Évolution récente</h2>
        <p>CA des 30 derniers jours (tous rendez-vous)</p>
      </div>
      <div class="chart-box tall">
        <Chart type="line" :data="trendData" :options="lineOptions" />
      </div>
    </section>

    <section class="adm-panel table-card">
      <div class="panel-head">
        <h2>Détail</h2>
        <p>Classement par chiffre d'affaires</p>
      </div>
      <div class="table-wrap">
        <DataTable :value="rows" :loading="loading" striped-rows size="small" class="stats-table">
          <Column field="service" header="Prestation" />
          <Column field="count" header="Nb" style="width: 5rem" />
          <Column header="CA">
            <template #body="{ data }">{{ data.total }} €</template>
          </Column>
          <Column header="Part">
            <template #body="{ data }">
              <div class="share">
                <div class="share-bar"><span :style="{ width: `${data.share}%` }"></span></div>
                <em>{{ data.share }} %</em>
              </div>
            </template>
          </Column>
          <template #empty>Aucune donnée pour cette période.</template>
        </DataTable>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import { adminApi } from '@/services/adminApi';
import { addDays, formatEuro, toDateKey } from '@/utils/adminFormat';
import { chartFonts, salonChartColors } from '@/utils/chartSetup';

type Row = { service: string; count: number; total: number; share: number };
type Appt = { date: string; price: number; serviceName: string };

const period = ref('monthly');
const now = new Date();
const weekNumber = (() => {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
})();

const defaultSelected = (p: string) => {
  if (p === 'daily') return toDateKey(now);
  if (p === 'weekly') return `${String(weekNumber).padStart(2, '0')}-${now.getFullYear()}`;
  if (p === 'yearly') return String(now.getFullYear());
  return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
};

const selected = ref(defaultSelected('monthly'));
const loading = ref(true);
const error = ref('');
const rows = ref<Row[]>([]);
const total = ref({ count: 0, total: 0 });
const allAppointments = ref<Appt[]>([]);

const periodOptions = [
  { label: 'Jour', value: 'daily' },
  { label: 'Semaine', value: 'weekly' },
  { label: 'Mois', value: 'monthly' },
  { label: 'Année', value: 'yearly' },
];

const periodLabel = computed(() => {
  const map: Record<string, string> = {
    daily: 'journée sélectionnée',
    weekly: 'semaine sélectionnée',
    monthly: 'mois sélectionné',
    yearly: 'année sélectionnée',
  };
  return map[period.value] || '';
});

const avgTicket = computed(() =>
  total.value.count ? Math.round(total.value.total / total.value.count) : 0,
);

/** Clé période précédente (même format API). */
const previousSelected = computed(() => {
  if (period.value === 'daily') {
    return toDateKey(addDays(new Date(`${selected.value}T12:00:00`), -1));
  }
  if (period.value === 'weekly') {
    const [ww, yy] = selected.value.split('-');
    const week = Number(ww);
    const year = Number(yy);
    if (week <= 1) return `52-${year - 1}`;
    return `${String(week - 1).padStart(2, '0')}-${year}`;
  }
  if (period.value === 'yearly') {
    return String(Number(selected.value) - 1);
  }
  const [mm, yy] = selected.value.split('-');
  let month = Number(mm);
  let year = Number(yy);
  month -= 1;
  if (month < 1) { month = 12; year -= 1; }
  return `${String(month).padStart(2, '0')}-${year}`;
});

const matchesPeriodKey = (dateIso: string, key: string, p: string) => {
  const d = new Date(dateIso);
  if (p === 'daily') return toDateKey(d) === key;
  if (p === 'weekly') {
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${String(week).padStart(2, '0')}-${tmp.getUTCFullYear()}` === key;
  }
  if (p === 'yearly') return String(d.getFullYear()) === key;
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}` === key;
};

const previousTotal = computed(() =>
  allAppointments.value
    .filter((a) => a.date && matchesPeriodKey(a.date, previousSelected.value, period.value))
    .reduce((sum, a) => sum + (a.price || 0), 0),
);

const deltaPct = computed(() => {
  if (!previousTotal.value) return total.value.total > 0 ? 100 : 0;
  return Math.round(((total.value.total - previousTotal.value) / previousTotal.value) * 100);
});

const deltaLabel = computed(() => {
  const n = deltaPct.value;
  if (n === 0) return '0 %';
  return `${n > 0 ? '+' : ''}${n} %`;
});

const deltaClass = computed(() => {
  if (deltaPct.value > 0) return 'up';
  if (deltaPct.value < 0) return 'down';
  return '';
});

const doughnutData = computed(() => ({
  labels: rows.value.map((r) => r.service),
  datasets: [{
    data: rows.value.map((r) => r.total),
    backgroundColor: salonChartColors.slice(0, Math.max(rows.value.length, 1)),
    borderWidth: 0,
    hoverOffset: 8,
  }],
}));

const barData = computed(() => ({
  labels: rows.value.map((r) => r.service),
  datasets: [{
    label: 'CA (€)',
    data: rows.value.map((r) => r.total),
    backgroundColor: 'rgba(193, 127, 89, 0.85)',
    borderRadius: 10,
    maxBarThickness: 42,
  }],
}));

const trendData = computed(() => {
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const key = toDateKey(d);
    labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
    values.push(
      allAppointments.value
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
      backgroundColor: 'rgba(193, 127, 89, 0.14)',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2.5,
    }],
  };
});

const doughnutOptions = {
  cutout: '66%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 14, font: { family: chartFonts.family, size: 11 }, color: '#6e675f' },
    },
  },
};

const barOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      ticks: { font: { family: chartFonts.family, size: 10 }, color: '#6e675f', maxRotation: 35 },
      grid: { display: false },
    },
    y: {
      ticks: { font: { family: chartFonts.family, size: 10 }, color: '#6e675f' },
      grid: { color: 'rgba(230,223,214,0.85)' },
    },
  },
};

const lineOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      ticks: { font: { family: chartFonts.family, size: 9 }, color: '#6e675f', maxTicksLimit: 8 },
      grid: { display: false },
    },
    y: {
      ticks: { font: { family: chartFonts.family, size: 10 }, color: '#6e675f' },
      grid: { color: 'rgba(230,223,214,0.85)' },
    },
  },
};

const onPeriodChange = () => {
  selected.value = defaultSelected(period.value);
  load();
};

watch(period, onPeriodChange);

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: Record<string, string> = { period: period.value };
    if (period.value === 'daily') params.date = selected.value;
    else if (period.value === 'weekly') params.week = selected.value;
    else if (period.value === 'yearly') params.year = selected.value;
    else params.month = selected.value;

    const [{ data }, appts] = await Promise.all([
      adminApi.getStatistics(params),
      adminApi.listAppointments(),
    ]);
    rows.value = data.rows;
    total.value = data.total;
    selected.value = data.selected;
    allAppointments.value = (appts.data.appointments || []).map((a: any) => ({
      date: a.date,
      price: a.price,
      serviceName: a.serviceName,
    }));
  } catch {
    error.value = 'Impossible de charger les statistiques.';
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
.stats-hero { margin-bottom: 20px; }

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  margin-bottom: 18px;
}

.summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.kpi {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kpi span {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--adm-muted);
}
.kpi strong {
  font-family: var(--adm-font-display);
  font-size: 2.1rem;
  font-weight: 500;
  line-height: 1.1;
}
.kpi strong.up { color: var(--adm-success); }
.kpi strong.down { color: var(--adm-danger); }
.kpi small { color: var(--adm-muted); font-size: 0.82rem; }
.kpi.accent {
  background:
    radial-gradient(420px 180px at 100% 0%, rgba(193,127,89,0.22), transparent 60%),
    var(--adm-surface);
}
.kpi.accent strong { color: var(--adm-accent-deep); }

.charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.chart-card, .table-card {
  padding: 18px 18px 14px;
  margin-bottom: 16px;
}
.panel-head { margin-bottom: 12px; }
.panel-head h2 {
  margin: 0;
  font-family: var(--adm-font-display);
  font-size: 1.4rem;
  font-weight: 500;
}
.panel-head p { margin: 4px 0 0; color: var(--adm-muted); font-size: 0.85rem; }
.chart-box { min-height: 260px; position: relative; }
.chart-box.tall { min-height: 300px; }
.skel {
  min-height: 260px;
  border-radius: 12px;
  background: linear-gradient(90deg, #efe8e0, #f7f2ec, #efe8e0);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.empty {
  min-height: 220px;
  display: grid;
  place-items: center;
  color: var(--adm-muted);
}

.share {
  display: flex;
  align-items: center;
  gap: 10px;
}
.share-bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: #efe8e0;
  overflow: hidden;
}
.share-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #c17f59, #d4a084);
  border-radius: inherit;
}
.share em {
  font-style: normal;
  font-size: 0.8rem;
  color: var(--adm-muted);
  min-width: 3.2rem;
  text-align: right;
}

@media (min-width: 800px) {
  .summary { grid-template-columns: repeat(4, 1fr); }
  .charts { grid-template-columns: 0.9fr 1.1fr; }
}
@media (max-width: 799px) {
  .filters {
    flex-wrap: nowrap;
    gap: 8px;
    padding: 10px;
  }
  .filters :deep(.p-selectbutton) { flex-shrink: 0; }
  .filters :deep(.p-inputtext),
  .filters input { min-width: 9rem; }
  .summary { grid-template-columns: 1fr 1fr; }
  .kpi strong { font-size: 1.55rem; }
  .chart-box, .skel { min-height: 220px; }
  .chart-box.tall { min-height: 240px; }
}
</style>
