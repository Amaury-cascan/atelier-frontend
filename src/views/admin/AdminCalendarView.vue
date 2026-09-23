<template>
  <section class="adm-page cal">
    <header class="adm-hero">
      <div>
        <p class="adm-eyebrow">Agenda salon</p>
        <h1 class="adm-title">Calendrier</h1>
        <p class="adm-subtitle">{{ mobileHint }}</p>
      </div>
      <div class="hero-actions desktop-cta">
        <Button label="Nouveau RDV" icon="pi pi-plus" @click="openCreate()" />
      </div>
    </header>

    <div class="strip" :class="{ 'strip--desktop': !isNarrow }">
      <div class="strip-card">
        <span class="strip-ico" aria-hidden="true"><i class="pi pi-calendar"></i></span>
        <div class="strip-copy">
          <span class="strip-label">Sur la période</span>
          <strong class="strip-value">{{ rangeStats.count }} <em>RDV</em></strong>
        </div>
      </div>
      <div class="strip-card strip-card--ca">
        <span class="strip-ico" aria-hidden="true"><i class="pi pi-wallet"></i></span>
        <div class="strip-copy">
          <span class="strip-label">Chiffre d'affaires</span>
          <strong class="strip-value">{{ formatEuro(rangeStats.total) }}</strong>
          <small>panier moyen {{ formatEuro(rangeStats.avg) }}</small>
        </div>
      </div>
      <div class="strip-card strip-card--next">
        <span class="strip-ico" aria-hidden="true"><i class="pi pi-clock"></i></span>
        <div class="strip-copy">
          <span class="strip-label">Prochain RDV</span>
          <strong class="strip-value strip-value--next">{{ nextLabel }}</strong>
          <small class="truncate">{{ nextMeta }}</small>
        </div>
      </div>
      <p v-if="!isNarrow" class="strip-hint">
        <i class="pi pi-info-circle"></i>
        {{ hintText }}
      </p>
    </div>

    <div class="cal-toolbar adm-panel">
      <div class="nav-cluster">
        <Button icon="pi pi-chevron-left" severity="secondary" text rounded aria-label="Précédent" @click="shift(-1)" />
        <Button :label="isNarrow ? 'Auj.' : 'Aujourd\'hui'" severity="secondary" outlined size="small" @click="goToday" />
        <Button icon="pi pi-chevron-right" severity="secondary" text rounded aria-label="Suivant" @click="shift(1)" />
      </div>
      <SelectButton v-model="view" :options="viewOptions" option-label="label" option-value="value" :allow-empty="false" />
      <div class="legend" v-if="!isNarrow && legendServices.length">
        <span v-for="s in legendServices" :key="s.id" class="legend-pill" :style="chipStyle(s.id)">{{ s.name }}</span>
      </div>
      <div v-if="dayScheduleBadge" class="sched-badge" :class="dayScheduleBadge.kind">
        {{ dayScheduleBadge.label }}
      </div>
    </div>

    <p v-if="error" class="adm-error">{{ error }}</p>
    <div v-if="loading" class="loading-veil"><i class="pi pi-spin pi-spinner"></i> Chargement…</div>

    <!-- ========== MOBILE AGENDA (pas de grilles) ========== -->
    <template v-else-if="isNarrow">
      <!-- Mobile DAY -->
      <div
        v-if="view === 'day'"
        class="agenda-mobile"
        @touchstart.passive="onSwipeStart"
        @touchend.passive="onSwipeEnd"
      >
        <div class="agenda-day-head adm-panel">
          <div>
            <h2>{{ formatLongDate(cursor) }}</h2>
            <p class="sched-line">{{ cursorSchedule.display }}</p>
          </div>
          <span v-if="cursorSchedule.closed" class="badge closed">Fermé</span>
          <span v-else-if="cursorSchedule.special" class="badge special">Extérieur</span>
        </div>

        <div v-if="cursorSchedule.closed" class="adm-panel agenda-empty">
          <p>Salon fermé ce jour. Naviguez vers un jour d’ouverture.</p>
          <Button label="Prochain jour ouvert" size="small" @click="goNextOpen" />
        </div>

        <template v-else>
          <ul v-if="dayAppointments.length" class="agenda-list">
            <li
              v-for="a in dayAppointments"
              :key="a.id"
              class="agenda-card"
              :class="{ overlap: isOverlap(a) }"
              :style="cardAccent(a.serviceId)"
              @click="openEdit(a)"
            >
              <em>{{ formatTime(a.date) }} – {{ formatTime(a.endDate) }}</em>
              <strong>{{ a.clientFirstName }} {{ a.clientName }}</strong>
              <span>{{ a.serviceName }}</span>
              <b>{{ a.price }} €</b>
            </li>
          </ul>
          <p v-else class="agenda-empty-inline">Aucun RDV — choisissez un créneau ci-dessous.</p>

          <h3 class="slots-title">Créneaux d’ouverture</h3>
          <div class="slot-wrap">
            <button
              v-for="slot in freeSlots"
              :key="slot"
              type="button"
              class="slot-btn"
              @click="openCreate(minsToLocalInput(cursorKey, slot))"
            >
              {{ formatMin(slot) }}
            </button>
            <p v-if="!freeSlots.length" class="agenda-empty-inline">Plus de créneau libre sur cette journée.</p>
          </div>
        </template>
      </div>

      <!-- Mobile WEEK -->
      <div
        v-else-if="view === 'week'"
        class="agenda-mobile"
        @touchstart.passive="onSwipeStart"
        @touchend.passive="onSwipeEnd"
      >
        <section v-for="d in openWeekDays" :key="d.key" class="week-section adm-panel">
          <header class="week-section-head" @click="focusDay(d.key)">
            <div>
              <strong>{{ d.label }}</strong>
              <small>{{ d.schedule.display }}</small>
            </div>
            <div class="week-section-meta">
              <span v-if="d.schedule.special" class="badge special">Extérieur</span>
              <span class="count-chip">{{ d.count }} RDV</span>
            </div>
          </header>
          <ul v-if="d.list.length" class="agenda-list compact">
            <li
              v-for="a in d.list"
              :key="a.id"
              class="agenda-card"
              :class="{ overlap: isOverlap(a) }"
              :style="cardAccent(a.serviceId)"
              @click="openEdit(a)"
            >
              <em>{{ formatTime(a.date) }}</em>
              <strong>{{ a.clientFirstName }} {{ a.clientName }}</strong>
              <span>{{ a.serviceName }}</span>
              <b>{{ a.price }} €</b>
            </li>
          </ul>
          <button v-else type="button" class="add-slot-row" @click="openCreateForDay(d.key)">
            <i class="pi pi-plus"></i> Ajouter un RDV
          </button>
        </section>
        <p v-if="!openWeekDays.length" class="agenda-empty-inline">Aucun jour d’ouverture cette semaine.</p>
      </div>

      <!-- Mobile MONTH -->
      <div
        v-else
        class="agenda-mobile"
        @touchstart.passive="onSwipeStart"
        @touchend.passive="onSwipeEnd"
      >
        <button
          v-for="d in openMonthDays"
          :key="d.key"
          type="button"
          class="month-row adm-panel"
          :class="{ today: d.key === todayKey, selected: d.key === cursorKey }"
          @click="focusDay(d.key)"
        >
          <div class="month-row-left">
            <strong>{{ d.num }}</strong>
            <div>
              <span class="m-weekday">{{ d.label }}</span>
              <small>{{ d.schedule.display }}</small>
            </div>
          </div>
          <div class="month-row-right">
            <span v-if="d.schedule.special" class="badge special">Extérieur</span>
            <span class="count-chip">{{ d.count }} RDV</span>
            <em v-if="d.total">{{ d.total }} €</em>
            <i class="pi pi-chevron-right chev"></i>
          </div>
        </button>
        <p v-if="!openMonthDays.length" class="agenda-empty-inline">Aucun jour d’ouverture ce mois.</p>
      </div>
    </template>

    <!-- ========== DESKTOP ========== -->
    <template v-else>
      <!-- DAY -->
      <div
        v-if="view === 'day'"
        class="workspace"
        @touchstart.passive="onSwipeStart"
        @touchend.passive="onSwipeEnd"
      >
        <aside class="adm-panel day-side">
          <h2>Journée</h2>
          <p class="sched-line">{{ cursorSchedule.display }}</p>
          <ul v-if="dayAppointments.length" class="side-list">
            <li v-for="a in dayAppointments" :key="a.id" @click="openEdit(a)">
              <em :style="chipStyle(a.serviceId)">{{ formatTime(a.date) }}</em>
              <div>
                <strong>{{ a.clientFirstName }} {{ a.clientName }}</strong>
                <span>{{ a.serviceName }}</span>
              </div>
              <b>{{ a.price }} €</b>
            </li>
          </ul>
          <p v-else class="side-empty">Aucun RDV — cliquez un créneau ouvert.</p>
        </aside>
        <div class="adm-panel day-view">
          <div
            class="day-rail"
            :style="{ height: railHeightPx.value + 'px' }"
            @click="onDayRailClick"
          >
            <div
              v-for="(band, i) in dayClosedBands"
              :key="'gap-' + i"
              class="closed-band"
              :style="{ top: band.top + 'px', height: band.height + 'px' }"
            >
              <span>{{ band.label }}</span>
            </div>
            <div
              v-for="h in dayHourMarks"
              :key="h"
              class="hour-mark"
              :style="{ top: topFromMin(h * 60) + 'px' }"
            >
              <span class="hour-label">{{ String(h).padStart(2, '0') }}:00</span>
              <div class="hour-lane"></div>
            </div>
            <div v-if="nowLineVisible(cursorKey)" class="now-line" :style="{ top: nowTopPx + 'px' }">
              <em>{{ nowClock }}</em>
            </div>
            <div
              v-if="drag && view === 'day'"
              class="drag-guide"
              :style="{ top: drag.previewTop + 'px' }"
            >
              <span>{{ dragPreviewLabel }}</span>
            </div>
            <button
              v-for="a in dayAppointments"
              :key="a.id"
              type="button"
              class="event-block"
              :class="{ 'is-dragging': drag?.id === a.id, overlap: isOverlap(a) }"
              :style="eventStyle(a)"
              @pointerdown="onDragStart($event, a, cursorKey)"
            >
              <span class="event-grip" aria-hidden="true"><i class="pi pi-bars"></i></span>
              <div class="event-body">
                <strong>{{ drag?.id === a.id ? dragPreviewLabel : `${formatTime(a.date)} – ${formatTime(a.endDate)}` }}</strong>
                <span>{{ a.serviceName }}</span>
                <small>{{ a.clientFirstName }} {{ a.clientName }} · {{ a.price }} €</small>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- WEEK -->
      <div
        v-else-if="view === 'week'"
        class="adm-panel week-view"
        @touchstart.passive="onSwipeStart"
        @touchend.passive="onSwipeEnd"
      >
        <div class="week-head" :style="weekGridStyle">
          <div class="corner"></div>
          <div
            v-for="d in openWeekDays"
            :key="d.key"
            class="week-day-head"
            :class="{ today: d.key === todayKey, active: d.key === cursorKey }"
            @click="focusDay(d.key)"
          >
            <span>{{ d.short }}</span>
            <strong>{{ d.num }}</strong>
            <small v-if="d.schedule.special" class="ext-tag">Ext.</small>
            <small v-if="d.count" class="count-pill">{{ d.count }}</small>
          </div>
        </div>
        <div class="week-body" :style="{ ...weekGridStyle, minheight: railHeightPx.value + 'px' }">
          <div class="week-hours" :style="{ height: railHeightPx.value + 'px' }">
            <div
              v-for="h in weekHourMarks"
              :key="h"
              class="wh"
              :style="{ top: topFromMin(h * 60) + 'px' }"
            >{{ String(h).padStart(2, '0') }}h</div>
          </div>
          <div
            v-for="d in openWeekDays"
            :key="d.key"
            class="week-col"
            :class="{ today: d.key === todayKey }"
            :data-day="d.key"
            :style="{ height: railHeightPx.value + 'px' }"
            @click="onWeekSlotClick($event, d.key)"
          >
            <div
              v-for="(band, i) in closedBandsForKey(d.key)"
              :key="d.key + '-g-' + i"
              class="closed-band week"
              :style="{ top: band.top + 'px', height: band.height + 'px' }"
            />
            <div v-if="nowLineVisible(d.key)" class="now-line" :style="{ top: nowTopPx + 'px' }"></div>
            <div
              v-if="drag && drag.dayKey === d.key"
              class="drag-guide week"
              :style="{ top: drag.previewTop + 'px' }"
            >
              <span>{{ dragPreviewLabel }}</span>
            </div>
            <button
              v-for="a in appointmentsFor(d.key)"
              :key="a.id"
              type="button"
              class="event-block compact"
              :class="{ 'is-dragging': drag?.id === a.id, overlap: isOverlap(a) }"
              :style="eventStyle(a)"
              @pointerdown="onDragStart($event, a, d.key)"
            >
              <strong>{{ drag?.id === a.id ? dragPreviewLabel : formatTime(a.date) }}</strong>
              <span>{{ a.clientFirstName }}</span>
              <small>{{ a.serviceName }}</small>
            </button>
          </div>
        </div>
      </div>

      <!-- MONTH desktop : liste des jours d’ouverture (pas de grille 7 cols) -->
      <div
        v-else
        class="agenda-mobile desktop-month"
        @touchstart.passive="onSwipeStart"
        @touchend.passive="onSwipeEnd"
      >
        <button
          v-for="d in openMonthDays"
          :key="d.key"
          type="button"
          class="month-row adm-panel"
          :class="{ today: d.key === todayKey, selected: d.key === cursorKey }"
          @click="focusDay(d.key)"
        >
          <div class="month-row-left">
            <strong>{{ d.num }}</strong>
            <div>
              <span class="m-weekday">{{ d.label }}</span>
              <small>{{ d.schedule.display }}</small>
            </div>
          </div>
          <div class="month-row-right">
            <span v-if="d.schedule.special" class="badge special">Extérieur</span>
            <span class="count-chip">{{ d.count }} RDV</span>
            <em v-if="d.total">{{ d.total }} €</em>
            <i class="pi pi-chevron-right chev"></i>
          </div>
        </button>
        <p v-if="!openMonthDays.length" class="agenda-empty-inline">Aucun jour d’ouverture ce mois.</p>
      </div>
    </template>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editingId ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'"
      :style="{ width: 'min(540px, 94vw)' }"
      :draggable="false"
    >
      <form class="appt-form" @submit.prevent="save">
        <label>
          <span>Cliente</span>
          <Select v-model="form.clientId" :options="clientOptions" option-label="label" option-value="value" filter placeholder="Choisir" class="w-full" />
        </label>
        <label>
          <span>Prestation</span>
          <Select v-model="form.serviceId" :options="serviceOptions" option-label="label" option-value="value" placeholder="Choisir" class="w-full" @update:model-value="onServiceChange" />
        </label>
        <div class="row2">
          <label>
            <span>Début</span>
            <InputText v-model="form.date" type="datetime-local" class="w-full" @change="onServiceChange" />
          </label>
          <label>
            <span>Fin</span>
            <InputText v-model="form.endDate" type="datetime-local" class="w-full" />
          </label>
        </div>
        <label>
          <span>Prix (€)</span>
          <InputNumber v-model="form.price" :min="0" class="w-full" input-class="w-full" />
        </label>
        <p v-if="outsideHoursWarning" class="warn"><i class="pi pi-clock"></i> {{ outsideHoursWarning }}</p>
        <p v-if="overlapWarning" class="warn"><i class="pi pi-exclamation-triangle"></i> {{ overlapWarning }}</p>
        <div class="form-actions">
          <Button v-if="editingId" type="button" label="Supprimer" severity="danger" text @click="removeCurrent" />
          <span class="spacer"></span>
          <Button type="button" label="Annuler" severity="secondary" outlined @click="dialogOpen = false" />
          <Button type="submit" label="Enregistrer" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <button type="button" class="fab" aria-label="Nouveau rendez-vous" @click="openCreate()">
      <i class="pi pi-plus"></i>
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { adminApi } from '@/services/adminApi';
import {
  PX_PER_MIN,
  SNAP_MIN,
  absoluteMinFromTop,
  minsToLocalInput,
  snapMinutes,
  topFromAbsoluteMin,
} from '@/utils/agendaConstants';
import {
  formatMin,
  globalOpenBounds,
  isOpenDate,
  isWithinOpening,
  nextOpenDate,
  openDaysInMonth,
  openDaysInWeek,
  openSlotsForDate,
  scheduleForDate,
} from '@/utils/openingHours';
import { useScheduleStore } from '@/stores/scheduleStore';
import {
  addDays,
  durationMinutes,
  formatEuro,
  formatLongDate,
  formatTime,
  parseLocalDate,
  serviceColor,
  startOfWeek,
  toDateKey,
  toLocalInput,
} from '@/utils/adminFormat';

type Appt = {
  id: number; date: string; endDate: string; price: number; duration?: number;
  serviceId: number; serviceName: string; clientId: number; clientName: string; clientFirstName: string;
};
type MetaService = { id: number; name: string; duration: number; price: number; active: boolean };
type MetaClient = { id: number; name: string; firstName: string };

type DragState = {
  id: number;
  dayKey: string;
  startY: number;
  originTop: number;
  previewTop: number;
  durationMin: number;
  moved: boolean;
};

type ClosedBand = { top: number; height: number; label: string };

const toast = useToast();
const confirm = useConfirm();
const scheduleStore = useScheduleStore();

const appointments = ref<Appt[]>([]);
const services = ref<MetaService[]>([]);
const clients = ref<MetaClient[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const view = ref<'day' | 'week' | 'month'>('week');
const isNarrow = ref(false);
const swipeX = ref(0);
const cursor = ref(nextOpenDate(new Date()));
const form = reactive({ clientId: 0 as number, serviceId: 0 as number, date: '', endDate: '', price: 0 });
const drag = ref<DragState | null>(null);
const nowTick = ref(Date.now());
let nowTimer: number | undefined;
let dragMoveFn: ((e: PointerEvent) => void) | null = null;
let dragUpFn: ((e: PointerEvent) => void) | null = null;
let dragTargetAppt: Appt | null = null;

const dragPreviewLabel = computed(() => {
  if (!drag.value) return '';
  const mins = absoluteMinFromTop(drag.value.previewTop, bounds.value.startMin);
  const end = mins + drag.value.durationMin;
  return `${formatMin(mins)} – ${formatMin(end)}`;
});

const bounds = computed(() => {
  void scheduleStore.loaded;
  void scheduleStore.versions.length;
  return globalOpenBounds();
});
const railHeightPx = computed(() => (bounds.value.endMin - bounds.value.startMin) * PX_PER_MIN);

const weekdayShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const viewOptions = computed(() =>
  isNarrow.value
    ? [
        { label: 'Jour', value: 'day' },
        { label: 'Sem.', value: 'week' },
        { label: 'Mois', value: 'month' },
      ]
    : [
        { label: 'Jour', value: 'day' },
        { label: 'Semaine', value: 'week' },
        { label: 'Mois', value: 'month' },
      ],
);

const periodLabel = computed(() => {
  if (view.value === 'day') return formatLongDate(cursor.value);
  if (view.value === 'week') {
    const start = startOfWeek(cursor.value);
    const end = addDays(start, 6);
    return `Semaine du ${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
  }
  return cursor.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
});

const mobileHint = computed(() => {
  if (isNarrow.value) {
    return `${periodLabel.value} · swipe ← → · horaires d’ouverture`;
  }
  return `${periodLabel.value} · glissez un RDV · hors horaires = créneau fermé`;
});

const hintText = computed(() =>
  isNarrow.value
    ? 'Créneaux selon les horaires d’ouverture du salon'
    : 'Clic = créer · Glisser = déplacer · Uniquement sur jours / heures d’ouverture',
);

const updateNarrow = () => {
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const wasNarrow = isNarrow.value;
  isNarrow.value = narrow;
  if (narrow && !wasNarrow) view.value = 'day';
};

const onSwipeStart = (e: TouchEvent) => {
  swipeX.value = e.changedTouches[0]?.clientX ?? 0;
};
const onSwipeEnd = (e: TouchEvent) => {
  if (drag.value) return;
  const x = e.changedTouches[0]?.clientX ?? 0;
  const dx = x - swipeX.value;
  if (Math.abs(dx) < 70) return;
  shift(dx < 0 ? 1 : -1);
};

const todayKey = computed(() => toDateKey(new Date(nowTick.value)));
const cursorKey = computed(() => toDateKey(cursor.value));
const cursorSchedule = computed(() => scheduleForDate(cursor.value));

const dayScheduleBadge = computed(() => {
  if (view.value !== 'day') return null;
  const s = cursorSchedule.value;
  if (s.closed) return { kind: 'closed', label: 'Fermé' };
  if (s.special) return { kind: 'special', label: 'Extérieur' };
  return null;
});

const activeServices = computed(() => services.value.filter((s) => s.active));
const serviceOptions = computed(() => activeServices.value.map((s) => ({ label: `${s.name} (${s.duration} min)`, value: s.id })));
const clientOptions = computed(() => clients.value.map((c) => ({ label: `${c.firstName} ${c.name}`, value: c.id })));
const legendServices = computed(() => activeServices.value.slice(0, 6));

const topFromMin = (mins: number) => topFromAbsoluteMin(mins, bounds.value.startMin);

const nowTopPx = computed(() => {
  const n = new Date(nowTick.value);
  return topFromMin(n.getHours() * 60 + n.getMinutes());
});
const nowClock = computed(() =>
  new Date(nowTick.value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
);
const nowLineVisible = (key: string) => {
  const n = new Date(nowTick.value);
  const mins = n.getHours() * 60 + n.getMinutes();
  return key === todayKey.value && mins >= bounds.value.startMin && mins <= bounds.value.endMin;
};

const hourMarksFromRanges = (date: Date) => {
  const sched = scheduleForDate(date);
  const marks = new Set<number>();
  for (const r of sched.ranges) {
    let h = Math.floor(r.startMin / 60);
    const endH = Math.ceil(r.endMin / 60);
    while (h < endH) {
      marks.add(h);
      h += 1;
    }
  }
  return [...marks].sort((a, b) => a - b);
};

const dayHourMarks = computed(() => hourMarksFromRanges(cursor.value));
const weekHourMarks = computed(() => {
  const marks = new Set<number>();
  for (const d of openWeekDays.value) {
    for (const h of hourMarksFromRanges(parseLocalDate(d.key))) marks.add(h);
  }
  if (!marks.size) {
    for (let h = Math.floor(bounds.value.startMin / 60); h < Math.ceil(bounds.value.endMin / 60); h++) marks.add(h);
  }
  return [...marks].sort((a, b) => a - b);
});

const closedBandsForDate = (date: Date): ClosedBand[] => {
  const sched = scheduleForDate(date);
  const bands: ClosedBand[] = [];
  if (sched.closed) {
    bands.push({
      top: 0,
      height: railHeightPx.value.value,
      label: 'Fermé',
    });
    return bands;
  }
  let cursorMin = bounds.value.startMin;
  for (const r of sched.ranges) {
    if (r.startMin > cursorMin) {
      bands.push({
        top: topFromMin(cursorMin),
        height: Math.max(0, (r.startMin - cursorMin) * PX_PER_MIN),
        label: 'Pause',
      });
    }
    cursorMin = Math.max(cursorMin, r.endMin);
  }
  if (cursorMin < bounds.value.endMin) {
    bands.push({
      top: topFromMin(cursorMin),
      height: Math.max(0, (bounds.value.endMin - cursorMin) * PX_PER_MIN),
      label: 'Fermé',
    });
  }
  return bands.filter((b) => b.height > 4);
};

const dayClosedBands = computed(() => closedBandsForDate(cursor.value));
const closedBandsForKey = (key: string) => closedBandsForDate(parseLocalDate(key));

const isMinOpenOnDate = (date: Date, mins: number) => {
  const sched = scheduleForDate(date);
  if (sched.closed) return false;
  return sched.ranges.some((r) => mins >= r.startMin && mins < r.endMin);
};

const snapToOpen = (date: Date, mins: number) => {
  const snapped = snapMinutes(mins);
  if (isMinOpenOnDate(date, snapped)) return snapped;
  const slots = openSlotsForDate(date, SNAP_MIN);
  if (!slots.length) return snapped;
  let best = slots[0];
  let bestDist = Math.abs(best - snapped);
  for (const s of slots) {
    const dist = Math.abs(s - snapped);
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best;
};

const openWeekDays = computed(() => {
  const start = startOfWeek(cursor.value);
  return openDaysInWeek(start).map((d) => {
    const key = toDateKey(d);
    const list = appointmentsFor(key);
    const schedule = scheduleForDate(d);
    return {
      key,
      num: d.getDate(),
      short: weekdayShort[d.getDay()],
      label: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }),
      count: list.length,
      list,
      schedule,
    };
  });
});

const weekGridStyle = computed(() => ({
  gridTemplateColumns: `52px repeat(${Math.max(openWeekDays.value.length, 1)}, 1fr)`,
}));

const openMonthDays = computed(() => {
  const y = cursor.value.getFullYear();
  const m = cursor.value.getMonth();
  return openDaysInMonth(y, m).map((d) => {
    const key = toDateKey(d);
    const list = appointmentsFor(key);
    return {
      key,
      num: d.getDate(),
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count: list.length,
      list,
      total: list.reduce((s, a) => s + (a.price || 0), 0),
      schedule: scheduleForDate(d),
    };
  });
});

const dayAppointments = computed(() => appointmentsFor(cursorKey.value));

const freeSlots = computed(() => {
  const slots = openSlotsForDate(cursor.value, 30);
  return slots.filter((slot) => {
    const start = slot;
    const end = slot + 30;
    return !dayAppointments.value.some((a) => {
      const s = new Date(a.date).getHours() * 60 + new Date(a.date).getMinutes();
      const e = new Date(a.endDate).getHours() * 60 + new Date(a.endDate).getMinutes();
      return start < e && end > s;
    });
  });
});

const rangeKeys = computed(() => {
  if (view.value === 'day') return [cursorKey.value];
  if (view.value === 'week') return openWeekDays.value.map((d) => d.key);
  return openMonthDays.value.map((d) => d.key);
});

const rangeStats = computed(() => {
  const list = appointments.value.filter((a) => rangeKeys.value.some((k) => a.date?.startsWith(k)));
  const total = list.reduce((s, a) => s + (a.price || 0), 0);
  return {
    count: list.length,
    total,
    avg: list.length ? Math.round(total / list.length) : 0,
  };
});

const upcoming = computed(() => {
  const now = nowTick.value;
  return [...appointments.value]
    .filter((a) => new Date(a.date).getTime() >= now - 5 * 60000)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
});

const nextLabel = computed(() => {
  if (!upcoming.value) return '—';
  return formatTime(upcoming.value.date);
});
const nextMeta = computed(() => {
  if (!upcoming.value) return 'Rien de prévu';
  return `${upcoming.value.clientFirstName} · ${upcoming.value.serviceName}`;
});

const appointmentsFor = (key: string) =>
  appointments.value.filter((a) => a.date?.startsWith(key)).sort((a, b) => a.date.localeCompare(b.date));

const chipStyle = (id: number) => {
  const c = serviceColor(id);
  return { background: c.bg, borderColor: c.border, color: c.text };
};

const cardAccent = (id: number) => {
  const c = serviceColor(id);
  return {
    '--chip-bg': c.bg,
    '--chip-border': c.border,
    '--chip-text': c.text,
    borderLeftColor: c.border,
  } as Record<string, string>;
};

const eventStyle = (a: Appt) => {
  const c = serviceColor(a.serviceId);
  const start = new Date(a.date);
  const mins = start.getHours() * 60 + start.getMinutes();
  let top = topFromMin(mins);
  if (drag.value?.id === a.id) top = drag.value.previewTop;
  const height = Math.max(28, durationMinutes(a.date, a.endDate) * PX_PER_MIN);
  return {
    top: `${top}px`,
    height: `${height}px`,
    background: c.bg,
    borderColor: c.border,
    color: c.text,
  };
};

const isOverlap = (a: Appt) => {
  const s = new Date(a.date).getTime();
  const e = new Date(a.endDate).getTime();
  return appointments.value.some((other) => {
    if (other.id === a.id) return false;
    const os = new Date(other.date).getTime();
    const oe = new Date(other.endDate).getTime();
    return s < oe && e > os;
  });
};

const overlapWarning = computed(() => {
  if (!form.date || !form.endDate) return '';
  const start = new Date(form.date).getTime();
  const end = new Date(form.endDate).getTime();
  const hit = appointments.value.find((a) => {
    if (editingId.value && a.id === editingId.value) return false;
    const s = new Date(a.date).getTime();
    const e = new Date(a.endDate).getTime();
    return start < e && end > s;
  });
  return hit ? `Chevauchement avec ${hit.clientFirstName} (${formatTime(hit.date)})` : '';
});

const outsideHoursWarning = computed(() => {
  if (!form.date) return '';
  if (isWithinOpening(form.date.length === 16 ? `${form.date}:00` : form.date)) return '';
  return 'Le début est hors horaires d’ouverture du salon.';
});

const ensureOpenCursor = () => {
  if (view.value === 'day' && !isOpenDate(cursor.value)) {
    cursor.value = nextOpenDate(cursor.value);
  }
};

watch([view, cursor], ensureOpenCursor);

const shiftOpenDay = (dir: number) => {
  let d = addDays(cursor.value, dir);
  for (let i = 0; i < 14; i++) {
    if (isOpenDate(d)) {
      cursor.value = d;
      return;
    }
    d = addDays(d, dir);
  }
};

const shift = (dir: number) => {
  if (view.value === 'day') shiftOpenDay(dir);
  else if (view.value === 'week') cursor.value = addDays(cursor.value, dir * 7);
  else cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + dir, 1);
};

const goToday = () => {
  const t = new Date();
  cursor.value = isOpenDate(t) ? t : nextOpenDate(t);
};

const goNextOpen = () => {
  cursor.value = nextOpenDate(addDays(cursor.value, 1));
};

const focusDay = (key: string) => {
  const d = parseLocalDate(key);
  if (!isOpenDate(d)) {
    cursor.value = nextOpenDate(d);
  } else {
    cursor.value = d;
  }
  view.value = 'day';
};

const defaultStartForDay = (key: string) => {
  const d = parseLocalDate(key);
  const slots = openSlotsForDate(d, 30);
  const first = slots[0] ?? bounds.value.startMin;
  return minsToLocalInput(key, first);
};

const openCreateForDay = (key: string) => {
  openCreate(defaultStartForDay(key));
};

const onDayRailClick = (ev: MouseEvent) => {
  if ((ev.target as HTMLElement).closest('.event-block')) return;
  const el = ev.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const y = ev.clientY - rect.top;
  let mins = absoluteMinFromTop(y, bounds.value.startMin);
  if (!isMinOpenOnDate(cursor.value, mins)) {
    toast.add({ severity: 'info', summary: 'Hors horaires', detail: 'Ce créneau n’est pas ouvert.', life: 2200 });
    return;
  }
  mins = snapToOpen(cursor.value, mins);
  openCreate(minsToLocalInput(cursorKey.value, mins));
};

const onWeekSlotClick = (ev: MouseEvent, key: string) => {
  if ((ev.target as HTMLElement).closest('.event-block')) return;
  const el = ev.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const y = ev.clientY - rect.top;
  const date = parseLocalDate(key);
  let mins = absoluteMinFromTop(y, bounds.value.startMin);
  if (!isMinOpenOnDate(date, mins)) {
    toast.add({ severity: 'info', summary: 'Hors horaires', detail: 'Ce créneau n’est pas ouvert.', life: 2200 });
    return;
  }
  mins = snapToOpen(date, mins);
  openCreate(minsToLocalInput(key, mins));
};

const onDragStart = (e: PointerEvent, a: Appt, dayKey: string) => {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  e.preventDefault();
  e.stopPropagation();

  const start = new Date(a.date);
  const mins = start.getHours() * 60 + start.getMinutes();
  const top = topFromMin(mins);

  dragTargetAppt = a;
  drag.value = {
    id: a.id,
    dayKey,
    startY: e.clientY,
    originTop: top,
    previewTop: top,
    durationMin: durationMinutes(a.date, a.endDate),
    moved: false,
  };

  document.body.classList.add('adm-dragging');

  dragMoveFn = (ev: PointerEvent) => {
    if (!drag.value) return;
    ev.preventDefault();
    const dy = ev.clientY - drag.value.startY;
    if (Math.abs(dy) > 4) drag.value.moved = true;

    const maxTop = Math.max(0, railHeightPx.value - Math.max(28, drag.value.durationMin * PX_PER_MIN));
    const rawTop = drag.value.originTop + dy;
    const snappedTop = snapMinutes(rawTop / PX_PER_MIN) * PX_PER_MIN;
    drag.value.previewTop = Math.max(0, Math.min(snappedTop, maxTop));
  };

  dragUpFn = async () => {
    const state = drag.value;
    const appt = dragTargetAppt;
    teardownDragListeners();
    drag.value = null;
    dragTargetAppt = null;
    document.body.classList.remove('adm-dragging');

    if (!state || !appt) return;
    if (!state.moved) {
      openEdit(appt);
      return;
    }

    const date = parseLocalDate(state.dayKey);
    let mins2 = absoluteMinFromTop(state.previewTop, bounds.value.startMin);
    mins2 = snapToOpen(date, mins2);
    if (!isMinOpenOnDate(date, mins2)) {
      toast.add({ severity: 'warn', summary: 'Hors horaires d’ouverture', life: 2800 });
      return;
    }

    const startLocal = minsToLocalInput(state.dayKey, mins2);
    const startDate = new Date(`${startLocal}:00`);
    const endDate = new Date(startDate.getTime() + state.durationMin * 60000);
    const payload = {
      clientId: appt.clientId,
      serviceId: appt.serviceId,
      date: toLocalInput(startDate),
      endDate: toLocalInput(endDate),
      price: appt.price,
    };

    // Optimistic UI
    const idx = appointments.value.findIndex((x) => x.id === appt.id);
    const prev = idx >= 0 ? { ...appointments.value[idx] } : null;
    if (idx >= 0) {
      appointments.value[idx] = {
        ...appointments.value[idx],
        date: payload.date,
        endDate: payload.endDate,
      };
    }

    try {
      await adminApi.updateAppointment(appt.id, payload);
      toast.add({
        severity: 'success',
        summary: 'Déplacé',
        detail: `${formatTime(payload.date)} · ${appt.clientFirstName}`,
        life: 2200,
      });
    } catch {
      if (prev && idx >= 0) appointments.value[idx] = prev;
      toast.add({ severity: 'error', summary: 'Déplacement impossible', life: 3000 });
    }
  };

  window.addEventListener('pointermove', dragMoveFn, { passive: false });
  window.addEventListener('pointerup', dragUpFn);
  window.addEventListener('pointercancel', dragUpFn);
};

const teardownDragListeners = () => {
  if (dragMoveFn) window.removeEventListener('pointermove', dragMoveFn);
  if (dragUpFn) {
    window.removeEventListener('pointerup', dragUpFn);
    window.removeEventListener('pointercancel', dragUpFn);
  }
  dragMoveFn = null;
  dragUpFn = null;
};

const cancelDrag = () => {
  teardownDragListeners();
  drag.value = null;
  dragTargetAppt = null;
  document.body.classList.remove('adm-dragging');
};

const load = async (showSpinner = true) => {
  if (showSpinner) loading.value = true;
  error.value = '';
  try {
    const [a, m] = await Promise.all([
      adminApi.listAppointments(),
      adminApi.appointmentsMeta(),
      scheduleStore.fetchPublic(),
    ]);
    appointments.value = a.data.appointments;
    services.value = m.data.services;
    clients.value = m.data.clients;
    ensureOpenCursor();
  } catch {
    error.value = 'Impossible de charger le calendrier.';
  } finally {
    loading.value = false;
  }
};

const onServiceChange = () => {
  const service = services.value.find((s) => s.id === form.serviceId);
  if (!service || !form.date) return;
  form.price = service.price;
  const start = new Date(form.date);
  start.setMinutes(start.getMinutes() + service.duration);
  form.endDate = toLocalInput(start);
};

const openCreate = (localStart?: string) => {
  editingId.value = null;
  let start: Date;
  if (localStart) {
    start = new Date(localStart.length === 16 ? `${localStart}:00` : localStart);
  } else {
    const key = isOpenDate(cursor.value) ? cursorKey.value : toDateKey(nextOpenDate(cursor.value));
    start = new Date(`${defaultStartForDay(key)}:00`);
  }
  form.clientId = clients.value[0]?.id ?? 0;
  form.serviceId = activeServices.value[0]?.id ?? 0;
  form.date = toLocalInput(start);
  form.endDate = '';
  form.price = activeServices.value[0]?.price ?? 0;
  onServiceChange();
  dialogOpen.value = true;
};

const openEdit = (a: Appt) => {
  editingId.value = a.id;
  form.clientId = a.clientId;
  form.serviceId = a.serviceId;
  form.date = toLocalInput(a.date);
  form.endDate = toLocalInput(a.endDate);
  form.price = a.price;
  dialogOpen.value = true;
};

const save = async () => {
  if (!form.clientId || !form.serviceId || !form.date || !form.endDate) {
    toast.add({ severity: 'warn', summary: 'Champs manquants', life: 2800 });
    return;
  }
  saving.value = true;
  try {
    const payload = {
      clientId: form.clientId,
      serviceId: form.serviceId,
      date: form.date,
      endDate: form.endDate,
      price: form.price,
    };
    if (editingId.value) await adminApi.updateAppointment(editingId.value, payload);
    else await adminApi.createAppointment(payload);
    dialogOpen.value = false;
    toast.add({ severity: 'success', summary: 'Enregistré', life: 2200 });
    await load(false);
  } catch {
    toast.add({ severity: 'error', summary: 'Enregistrement impossible', life: 3200 });
  } finally {
    saving.value = false;
  }
};

const removeCurrent = () => {
  if (!editingId.value) return;
  const id = editingId.value;
  confirm.require({
    message: 'Supprimer définitivement ce rendez-vous ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await adminApi.deleteAppointment(id);
        dialogOpen.value = false;
        toast.add({ severity: 'success', summary: 'Supprimé', life: 2000 });
        await load(false);
      } catch {
        toast.add({ severity: 'error', summary: 'Suppression impossible', life: 3000 });
      }
    },
  });
};

onMounted(() => {
  updateNarrow();
  if (isNarrow.value) view.value = 'day';
  ensureOpenCursor();
  window.addEventListener('resize', updateNarrow);
  load();
  nowTimer = window.setInterval(() => { nowTick.value = Date.now(); }, 30000);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateNarrow);
  cancelDrag();
  if (nowTimer) window.clearInterval(nowTimer);
});
</script>

<style scoped>
.cal {
  overflow-x: hidden;
  max-width: 100%;
}
.hero-actions { display: flex; gap: 8px; }
.strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.strip-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--adm-surface);
  border: 1px solid var(--adm-border);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: var(--adm-shadow);
}
.strip-ico {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: var(--adm-accent-soft);
  color: var(--adm-accent-deep);
  font-size: 0.95rem;
}
.strip-card--ca .strip-ico {
  background: rgba(193, 127, 89, 0.2);
}
.strip-card--next .strip-ico {
  background: rgba(61, 139, 110, 0.12);
  color: var(--adm-success);
}
.strip-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.strip-label {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--adm-muted);
  font-weight: 600;
}
.strip-value {
  font-family: var(--adm-font-display);
  font-size: 1.65rem;
  font-weight: 500;
  line-height: 1.1;
  color: var(--adm-text);
}
.strip-value em {
  font-style: normal;
  font-family: var(--adm-font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--adm-muted);
  margin-left: 4px;
}
.strip-value--next {
  color: var(--adm-accent-deep);
  font-size: 1.45rem;
}
.strip-copy small {
  color: var(--adm-muted);
  font-size: 0.8rem;
  line-height: 1.3;
}
.strip-hint {
  display: none;
}

/* Desktop : une seule barre élégante */
.strip--desktop {
  grid-template-columns: minmax(140px, 0.8fr) minmax(180px, 1fr) minmax(200px, 1.2fr);
  gap: 0;
  background:
    linear-gradient(120deg, rgba(255,253,250,0.98), rgba(250,245,239,0.95));
  border: 1px solid var(--adm-border);
  border-radius: 20px;
  box-shadow: var(--adm-shadow);
  overflow: hidden;
  align-items: stretch;
  position: relative;
  padding-bottom: 36px;
}
.strip--desktop .strip-card {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 18px 22px 12px;
  border-right: 1px solid var(--adm-border);
}
.strip--desktop .strip-card:last-of-type {
  border-right: none;
}
.strip--desktop .strip-card--ca {
  background: linear-gradient(180deg, rgba(193,127,89,0.08), transparent 70%);
}
.strip--desktop .strip-value {
  font-size: 1.85rem;
}
.strip--desktop .strip-value--next {
  font-size: 1.55rem;
}
.strip--desktop .strip-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 10px;
  margin: 0;
  font-size: 0.78rem;
  color: var(--adm-muted);
}
.strip--desktop .strip-hint i {
  color: var(--adm-accent);
  font-size: 0.85rem;
}
.strip--desktop:hover {
  box-shadow: var(--adm-shadow-lg);
}

.cal-toolbar {
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
  padding: 12px 14px; margin-bottom: 16px;
}
.nav-cluster { display: flex; align-items: center; gap: 4px; }
.legend { display: flex; flex-wrap: wrap; gap: 6px; margin-left: auto; }
.legend-pill { font-size: 0.72rem; padding: 4px 10px; border-radius: 999px; border: 1px solid; }
.sched-badge {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 999px;
}
.sched-badge.closed { background: rgba(110, 103, 95, 0.14); color: var(--adm-muted); }
.sched-badge.special { background: rgba(193, 127, 89, 0.18); color: var(--adm-accent-deep); }
.loading-veil {
  padding: 48px; text-align: center; color: var(--adm-muted);
  display: flex; gap: 10px; justify-content: center; align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.badge.closed { background: rgba(110, 103, 95, 0.14); color: var(--adm-muted); }
.badge.special { background: rgba(193, 127, 89, 0.18); color: var(--adm-accent-deep); }
.count-chip {
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--adm-accent);
  color: #fff;
  padding: 4px 8px;
  border-radius: 999px;
}
.sched-line {
  margin: 0;
  color: var(--adm-muted);
  font-size: 0.84rem;
}

/* —— Mobile agenda —— */
.agenda-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
}
.agenda-day-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}
.agenda-day-head h2 {
  margin: 0 0 4px;
  font-family: var(--adm-font-display);
  font-size: 1.35rem;
  font-weight: 500;
  text-transform: capitalize;
}
.agenda-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--adm-muted);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.agenda-empty-inline {
  margin: 4px 0 8px;
  color: var(--adm-muted);
  font-size: 0.9rem;
  padding: 0 4px;
}
.agenda-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.agenda-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "time name price"
    "time svc price";
  gap: 2px 12px;
  align-items: center;
  padding: 14px 16px 14px 18px;
  min-height: 68px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--chip-border, #c17f59) 28%, var(--adm-border));
  border-left-width: 5px;
  border-left-color: var(--chip-border, var(--adm-accent));
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--chip-bg, #f3e4d8) 70%, #fff), #fff);
  color: var(--chip-text, var(--adm-text));
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 8px 24px rgba(45, 42, 38, 0.06);
  transition: transform 0.18s var(--adm-ease), box-shadow 0.18s var(--adm-ease);
}
.agenda-card:active {
  transform: scale(0.985);
}
.agenda-card.overlap { box-shadow: 0 0 0 2px rgba(201, 74, 74, 0.4); }
.agenda-card em {
  grid-area: time;
  font-style: normal;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}
.agenda-card strong {
  grid-area: name;
  font-size: 0.95rem;
}
.agenda-card span {
  grid-area: svc;
  font-size: 0.8rem;
  opacity: 0.8;
}
.agenda-card b {
  grid-area: price;
  font-size: 0.9rem;
  color: var(--adm-accent-deep);
}
.agenda-list.compact .agenda-card { min-height: 56px; padding: 12px 14px; }

.slots-title {
  margin: 8px 4px 0;
  font-family: var(--adm-font-display);
  font-size: 1.15rem;
  font-weight: 500;
}
.slot-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.slot-btn {
  min-height: 48px;
  min-width: calc(33.333% - 6px);
  flex: 1 1 calc(33.333% - 6px);
  max-width: calc(33.333% - 6px);
  border: 1px dashed var(--adm-border);
  border-radius: 12px;
  background: var(--adm-surface);
  color: var(--adm-text);
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.slot-btn:active { background: var(--adm-accent-soft); border-color: var(--adm-accent); }

.week-section { padding: 0; overflow: hidden; }
.week-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--adm-border);
  background: linear-gradient(180deg, #fffdfb, #faf6f1);
}
.week-section-head strong {
  display: block;
  font-family: var(--adm-font-display);
  font-size: 1.2rem;
  font-weight: 500;
  text-transform: capitalize;
}
.week-section-head small { color: var(--adm-muted); font-size: 0.78rem; }
.week-section-meta { display: flex; align-items: center; gap: 8px; }
.week-section .agenda-list { padding: 10px 12px 12px; }
.add-slot-row {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--adm-accent-deep);
  font: inherit;
  font-weight: 600;
  padding: 16px;
  min-height: 52px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.month-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  min-height: 72px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}
.month-row.today { outline: 2px solid var(--adm-accent); outline-offset: -2px; }
.month-row.selected { background: var(--adm-accent-soft); }
.month-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.month-row-left strong {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--adm-font-display);
  font-size: 1.25rem;
  font-weight: 500;
  background: rgba(193, 127, 89, 0.12);
  flex-shrink: 0;
}
.month-row.today .month-row-left strong {
  background: var(--adm-accent);
  color: #fff;
}
.month-row-left .m-weekday {
  display: block;
  font-weight: 600;
  text-transform: capitalize;
}
.month-row-left small {
  color: var(--adm-muted);
  font-size: 0.75rem;
}
.month-row-right {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}
.month-row-right em {
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--adm-accent-deep);
}
.month-row-right .chev {
  color: var(--adm-muted);
  font-size: 0.85rem;
}
.desktop-month {
  max-width: 720px;
}

/* —— Desktop day / week —— */
.workspace {
  display: grid;
  gap: 14px;
  grid-template-columns: 1.5fr 0.7fr;
}
.day-side { padding: 16px; order: 2; }
.day-side h2 {
  margin: 0 0 6px;
  font-family: var(--adm-font-display);
  font-size: 1.35rem;
  font-weight: 500;
}
.day-side .sched-line { margin-bottom: 12px; }
.side-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.side-list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--adm-border);
  cursor: pointer;
  transition: border-color 0.15s var(--adm-ease);
}
.side-list li:hover { border-color: var(--adm-accent); }
.side-list em {
  font-style: normal;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid;
}
.side-list strong { display: block; font-size: 0.9rem; }
.side-list span { font-size: 0.78rem; color: var(--adm-muted); }
.side-list b { font-size: 0.85rem; color: var(--adm-accent-deep); }
.side-empty { color: var(--adm-muted); font-size: 0.9rem; margin: 24px 0; }

.day-view, .week-view, .month-view { overflow: hidden; }
.day-view {
  order: 1;
  background:
    linear-gradient(180deg, #fffdfa 0%, #faf6f1 100%);
}
.day-rail {
  position: relative;
  padding-left: 64px;
}
.week-view {
  background: linear-gradient(180deg, #fffdfa, #faf6f1);
}
.week-col {
  position: relative;
  border-right: 1px solid var(--adm-border);
  cursor: crosshair;
  background: rgba(255,255,255,0.35);
}
.week-col.today {
  background: rgba(193, 127, 89, 0.07);
}
.hour-mark {
  position: absolute;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: 64px 1fr;
  pointer-events: none;
}
.hour-label { font-size: 0.72rem; color: var(--adm-muted); padding: 0 8px 0 12px; transform: translateY(-6px); }
.hour-lane { border-top: 1px dashed var(--adm-border); }
.closed-band {
  position: absolute;
  left: 64px;
  right: 8px;
  z-index: 1;
  background: repeating-linear-gradient(
    -45deg,
    rgba(110, 103, 95, 0.06),
    rgba(110, 103, 95, 0.06) 6px,
    rgba(110, 103, 95, 0.12) 6px,
    rgba(110, 103, 95, 0.12) 12px
  );
  border-radius: 8px;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.closed-band span {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--adm-muted);
  background: rgba(255, 252, 249, 0.85);
  padding: 2px 8px;
  border-radius: 6px;
}
.closed-band.week {
  left: 2px;
  right: 2px;
  border-radius: 4px;
}

.now-line {
  position: absolute;
  left: 56px;
  right: 8px;
  height: 2px;
  background: #e4572e;
  z-index: 4;
  pointer-events: none;
}
.now-line em {
  position: absolute;
  left: -48px;
  top: -10px;
  font-style: normal;
  font-size: 0.68rem;
  font-weight: 700;
  color: #e4572e;
  background: #fff;
  padding: 0 4px;
}

.drag-guide {
  position: absolute;
  left: 64px;
  right: 8px;
  z-index: 6;
  height: 0;
  border-top: 2px dashed var(--adm-accent);
  pointer-events: none;
}
.drag-guide span {
  position: absolute;
  left: 0;
  top: -22px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  background: var(--adm-accent);
  padding: 3px 8px;
  border-radius: 999px;
  box-shadow: 0 6px 16px rgba(193, 127, 89, 0.35);
}
.drag-guide.week {
  left: 2px;
  right: 2px;
}

.event-block {
  position: absolute;
  left: 64px;
  right: 10px;
  z-index: 2;
  border: 1px solid;
  border-left-width: 5px;
  border-radius: 14px;
  padding: 0;
  text-align: left;
  cursor: grab;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  box-shadow: 0 10px 28px rgba(45, 42, 38, 0.1);
  transition: box-shadow 0.18s var(--adm-ease), transform 0.18s var(--adm-ease);
  display: flex;
  align-items: stretch;
  gap: 0;
  font: inherit;
  background-clip: padding-box;
}
.event-grip {
  display: grid;
  place-items: center;
  width: 22px;
  flex-shrink: 0;
  opacity: 0.45;
  font-size: 0.65rem;
  border-right: 1px solid rgba(45, 42, 38, 0.08);
}
.event-body {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.event-block:hover {
  box-shadow: var(--adm-shadow-lg);
  z-index: 3;
  transform: translateY(-1px);
}
.event-block.overlap { box-shadow: 0 0 0 2px rgba(201, 74, 74, 0.4); }
.event-block.is-dragging {
  opacity: 0.88;
  cursor: grabbing;
  z-index: 8;
  transition: none !important;
  transform: scale(1.02);
  box-shadow: 0 18px 40px rgba(45, 42, 38, 0.22);
}
.event-block strong { font-size: 0.82rem; }
.event-block span { font-size: 0.84rem; font-weight: 600; }
.event-block small { font-size: 0.72rem; opacity: 0.85; }
.event-block.compact {
  left: 4px;
  right: 4px;
  border-radius: 10px;
  border-left-width: 4px;
}
.event-block.compact .event-grip { display: none; }
.event-block.compact .event-body { padding: 5px 7px; }
.event-block.compact strong { font-size: 0.7rem; }
.event-block.compact span { font-size: 0.72rem; }
.event-block.compact small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.week-head {
  display: grid;
  border-bottom: 1px solid var(--adm-border);
  background: linear-gradient(180deg, #fffdfb, #faf6f1);
}
.corner { border-right: 1px solid var(--adm-border); }
.week-day-head {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 4px; cursor: pointer; border-right: 1px solid var(--adm-border);
}
.week-day-head span { font-size: 0.7rem; text-transform: uppercase; color: var(--adm-muted); letter-spacing: 0.08em; }
.week-day-head strong {
  font-family: var(--adm-font-display); font-size: 1.35rem; font-weight: 500;
  width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%;
}
.week-day-head.today strong { background: var(--adm-accent); color: #fff; }
.week-day-head.active { background: var(--adm-accent-soft); }
.ext-tag {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--adm-accent-deep);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.count-pill {
  position: absolute; top: 8px; right: 8px;
  background: var(--adm-accent); color: #fff;
  font-size: 0.62rem; font-weight: 700;
  min-width: 16px; height: 16px; border-radius: 999px;
  display: grid; place-items: center; padding: 0 4px;
}

.week-body {
  display: grid;
}
.week-hours {
  position: relative;
  border-right: 1px solid var(--adm-border);
}
.wh {
  position: absolute;
  left: 0;
  right: 0;
  font-size: 0.68rem;
  color: var(--adm-muted);
  padding: 0 6px;
  transform: translateY(-6px);
}
.week-col .now-line {
  left: 0;
  right: 0;
}

.month-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  padding: 12px 8px 8px; font-size: 0.72rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--adm-muted); text-align: center;
}
.month-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px;
  background: var(--adm-border); border-top: 1px solid var(--adm-border);
}
.month-cell {
  position: relative;
  min-height: 118px; background: var(--adm-surface); border: none; text-align: left;
  padding: 8px; cursor: pointer; font: inherit;
  display: flex; flex-direction: column; gap: 6px;
  transition: filter 0.15s var(--adm-ease);
}
.month-cell:hover { filter: brightness(0.98); }
.month-cell.muted { color: #a39b93; }
.month-cell.closed { cursor: default; background: #f3f0ec; }
.month-cell.today .m-num { background: var(--adm-accent); color: #fff; }
.month-cell.selected { outline: 2px solid var(--adm-accent); outline-offset: -2px; }
.m-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center; font-weight: 600; font-size: 0.85rem;
}
.m-closed, .m-ext {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--adm-muted);
}
.m-ext { color: var(--adm-accent-deep); }
.m-events { display: flex; flex-direction: column; gap: 3px; }
.m-pill {
  font-size: 0.68rem; border-radius: 6px; padding: 2px 6px; border: 1px solid;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.month-cell .m-more { font-size: 0.68rem; color: var(--adm-muted); padding-left: 4px; }
.m-ca {
  margin-top: auto;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--adm-accent-deep);
}

.appt-form { display: flex; flex-direction: column; gap: 14px; }
.appt-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--adm-muted); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.w-full { width: 100%; }
.form-actions { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.spacer { flex: 1; }
.warn {
  margin: 0; color: #9a6b20; background: #fff6e8; border: 1px solid #f0d7a8;
  border-radius: 10px; padding: 10px 12px; font-size: 0.82rem;
  display: flex; gap: 8px; align-items: center;
}

.fab { display: none; }
.desktop-cta { display: flex; }

@media (max-width: 900px) {
  .desktop-cta { display: none; }
  .legend { display: none; }
  .sched-badge { margin-left: 0; }
  .row2 { grid-template-columns: 1fr; }
  .strip {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .strip-card {
    padding: 12px 14px;
  }
  .strip-ico {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  .strip-value {
    font-size: 1.35rem;
  }
  .strip-value--next {
    font-size: 1.2rem;
  }
  .strip-copy small.truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cal-toolbar {
    position: sticky;
    top: calc(var(--adm-nav-h, 56px) + 4px);
    z-index: 12;
    gap: 8px;
    padding: 10px;
  }
  .fab {
    position: fixed;
    right: 16px;
    bottom: calc(var(--adm-bottom-h, 68px) + env(safe-area-inset-bottom, 0px) + 16px);
    z-index: 45;
    width: 56px;
    height: 56px;
    border: none;
    border-radius: 50%;
    background: var(--adm-accent);
    color: #fff;
    box-shadow: 0 12px 28px rgba(193, 127, 89, 0.45);
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .fab:active { transform: scale(0.96); }
  .adm-page.cal { padding-bottom: 72px; }
}
</style>
