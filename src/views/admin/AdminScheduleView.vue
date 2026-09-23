<template>
  <section class="adm-page schedule">
    <header class="adm-hero">
      <div>
        <p class="adm-eyebrow">Planning</p>
        <h1 class="adm-title">Horaires</h1>
        <p class="adm-subtitle">
          Grilles à date d’effet, exceptions de jour et créneaux bloqués.
          La réservation publique suit ces règles ; tu peux toujours forcer un RDV dans le calendrier.
        </p>
      </div>
      <Button label="Nouvelle grille" icon="pi pi-plus" @click="openCreateVersion" />
    </header>

    <p v-if="loading" class="loading-veil"><i class="pi pi-spin pi-spinner" /> Chargement…</p>

    <template v-else>
      <!-- Versions -->
      <div class="block adm-panel">
        <div class="block-head">
          <h2>Grilles hebdomadaires</h2>
          <p>Chaque grille s’applique à partir de sa date, jusqu’à la suivante.</p>
        </div>

        <div v-if="!versions.length" class="empty">Aucune grille — lance la migration backend.</div>

        <article v-for="v in versions" :key="v.id" class="version-card" :class="{ 'version-card--active': v.id === activeVersionId }">
          <header class="version-head">
            <div>
              <p class="version-from">À partir du {{ formatFrDate(v.effectiveFrom) }}</p>
              <h3>{{ v.name || 'Sans nom' }}</h3>
              <Tag v-if="v.id === activeVersionId" value="Active aujourd’hui" severity="success" rounded />
            </div>
            <div class="version-actions">
              <Button icon="pi pi-pencil" rounded text @click="openEditVersion(v)" title="Modifier" />
              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                :disabled="versions.length <= 1"
                title="Supprimer"
                @click="removeVersion(v)"
              />
            </div>
          </header>
          <ul class="week-preview">
            <li v-for="day in v.weekly" :key="day.weekday">
              <span class="wd">{{ dayLabels[day.weekday] }}</span>
              <span :class="['wk', `wk--${day.kind}`]">{{ day.label }}</span>
            </li>
          </ul>
        </article>
      </div>

      <!-- Exceptions -->
      <div class="block adm-panel">
        <div class="block-head row">
          <div>
            <h2>Exceptions de jour</h2>
            <p>Fermer, ouvrir ou modifier un jour précis.</p>
          </div>
          <Button label="Ajouter" icon="pi pi-plus" size="small" outlined @click="openException()" />
        </div>
        <div v-if="!exceptions.length" class="empty">Aucune exception.</div>
        <ul v-else class="list">
          <li v-for="ex in exceptions" :key="ex.id">
            <div>
              <strong>{{ formatFrDate(ex.date) }}</strong>
              <span :class="['wk', `wk--${ex.kind}`]">{{ ex.label }}</span>
            </div>
            <div class="row-actions">
              <Button icon="pi pi-pencil" rounded text size="small" @click="openException(ex)" />
              <Button icon="pi pi-trash" rounded text size="small" severity="danger" @click="removeException(ex)" />
            </div>
          </li>
        </ul>
      </div>

      <!-- Blocks -->
      <div class="block adm-panel">
        <div class="block-head row">
          <div>
            <h2>Créneaux bloqués</h2>
            <p>Plage libre retirée de la réservation (formation, urgence…).</p>
          </div>
          <Button label="Bloquer" icon="pi pi-ban" size="small" outlined @click="openBlock()" />
        </div>
        <div v-if="!blockedSlots.length" class="empty">Aucun créneau bloqué.</div>
        <ul v-else class="list">
          <li v-for="b in blockedSlots" :key="b.id">
            <div>
              <strong>{{ formatDateTime(b.start) }} → {{ formatDateTime(b.end) }}</strong>
              <span class="muted">{{ b.reason || 'Sans motif' }}</span>
            </div>
            <div class="row-actions">
              <Button icon="pi pi-pencil" rounded text size="small" @click="openBlock(b)" />
              <Button icon="pi pi-trash" rounded text size="small" severity="danger" @click="removeBlock(b)" />
            </div>
          </li>
        </ul>
      </div>
    </template>

    <!-- Dialog version -->
    <Dialog
      v-model:visible="versionDialog"
      modal
      :header="editingVersionId ? 'Modifier la grille' : 'Nouvelle grille'"
      :style="{ width: 'min(720px, 96vw)' }"
      :draggable="false"
    >
      <form class="form" @submit.prevent="saveVersion">
        <div class="form-row">
          <label>
            <span>Date de début</span>
            <InputText v-model="versionForm.effectiveFrom" type="date" required class="w-full" />
          </label>
          <label>
            <span>Nom (ex. Hiver 2026)</span>
            <InputText v-model="versionForm.name" class="w-full" placeholder="Optionnel" />
          </label>
        </div>

        <p v-if="!editingVersionId" class="hint">
          La nouvelle grille est une copie de celle active à cette date — tu ajustes ensuite.
        </p>

        <div v-for="day in versionForm.weekly" :key="day.weekday" class="day-edit">
          <div class="day-edit-head">
            <strong>{{ dayLabels[day.weekday] }}</strong>
            <Select
              v-model="day.kind"
              :options="kindOptions"
              option-label="label"
              option-value="value"
              class="kind-select"
              @change="onKindChange(day)"
            />
          </div>
          <InputText v-model="day.label" class="w-full" placeholder="Libellé affiché" />
          <div v-if="day.kind === 'open'" class="ranges">
            <div v-for="(r, idx) in day.ranges" :key="idx" class="range-row">
              <InputText v-model="r.start" type="time" required />
              <span>→</span>
              <InputText v-model="r.end" type="time" required />
              <Button
                type="button"
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                :disabled="day.ranges.length <= 1"
                @click="day.ranges.splice(idx, 1)"
              />
            </div>
            <Button type="button" label="Ajouter une plage" icon="pi pi-plus" size="small" text @click="day.ranges.push({ start: '09:30', end: '20:00' })" />
          </div>
        </div>

        <div class="form-actions">
          <Button type="button" label="Annuler" severity="secondary" outlined @click="versionDialog = false" />
          <Button type="submit" label="Enregistrer" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <!-- Dialog exception -->
    <Dialog v-model:visible="exceptionDialog" modal header="Exception de jour" :style="{ width: 'min(440px, 94vw)' }" :draggable="false">
      <form class="form" @submit.prevent="saveException">
        <label>
          <span>Date</span>
          <InputText v-model="exceptionForm.date" type="date" required class="w-full" />
        </label>
        <label>
          <span>Statut</span>
          <Select v-model="exceptionForm.kind" :options="kindOptions" option-label="label" option-value="value" class="w-full" @change="onExceptionKindChange" />
        </label>
        <label>
          <span>Libellé</span>
          <InputText v-model="exceptionForm.label" class="w-full" />
        </label>
        <div v-if="exceptionForm.kind === 'open'" class="ranges">
          <div v-for="(r, idx) in exceptionForm.ranges" :key="idx" class="range-row">
            <InputText v-model="r.start" type="time" required />
            <span>→</span>
            <InputText v-model="r.end" type="time" required />
            <Button type="button" icon="pi pi-times" text rounded severity="danger" :disabled="exceptionForm.ranges.length <= 1" @click="exceptionForm.ranges.splice(idx, 1)" />
          </div>
          <Button type="button" label="Ajouter une plage" icon="pi pi-plus" size="small" text @click="exceptionForm.ranges.push({ start: '09:30', end: '20:00' })" />
        </div>
        <div class="form-actions">
          <Button type="button" label="Annuler" severity="secondary" outlined @click="exceptionDialog = false" />
          <Button type="submit" label="Enregistrer" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <!-- Dialog block -->
    <Dialog v-model:visible="blockDialog" modal header="Créneau bloqué" :style="{ width: 'min(440px, 94vw)' }" :draggable="false">
      <form class="form" @submit.prevent="saveBlock">
        <label>
          <span>Début</span>
          <InputText v-model="blockForm.start" type="datetime-local" required class="w-full" />
        </label>
        <label>
          <span>Fin</span>
          <InputText v-model="blockForm.end" type="datetime-local" required class="w-full" />
        </label>
        <label>
          <span>Motif</span>
          <InputText v-model="blockForm.reason" class="w-full" placeholder="Optionnel" />
        </label>
        <div class="form-actions">
          <Button type="button" label="Annuler" severity="secondary" outlined @click="blockDialog = false" />
          <Button type="submit" label="Enregistrer" :loading="saving" />
        </div>
      </form>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import axiosInstance from '@/services/api';
import { useScheduleStore } from '@/stores/scheduleStore';
import type {
  BlockedSlotPayload,
  DayKind,
  ScheduleExceptionPayload,
  ScheduleVersionPayload,
  TimeRange,
} from '@/utils/openingHours';
import { formatMin } from '@/utils/openingHours';

type RangeInput = { start: string; end: string };
type DayEdit = {
  weekday: number;
  kind: DayKind;
  label: string;
  ranges: RangeInput[];
};

const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const kindOptions = [
  { value: 'open', label: 'Ouvert' },
  { value: 'closed', label: 'Fermé' },
  { value: 'external', label: 'Extérieur' },
];

const toast = useToast();
const confirm = useConfirm();
const schedule = useScheduleStore();

const loading = ref(true);
const saving = ref(false);
const versions = computed(() => schedule.versions);
const exceptions = computed(() => schedule.exceptions);
const blockedSlots = computed(() => schedule.blockedSlots);

const activeVersionId = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  const applicable = [...versions.value]
    .filter((v) => v.effectiveFrom <= today)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return applicable[0]?.id ?? null;
});

const versionDialog = ref(false);
const editingVersionId = ref<number | null>(null);
const versionForm = reactive({
  effectiveFrom: '',
  name: '',
  weekly: [] as DayEdit[],
});

const exceptionDialog = ref(false);
const editingExceptionId = ref<number | null>(null);
const exceptionForm = reactive({
  date: '',
  kind: 'closed' as DayKind,
  label: '',
  ranges: [{ start: '09:30', end: '20:00' }] as RangeInput[],
});

const blockDialog = ref(false);
const editingBlockId = ref<number | null>(null);
const blockForm = reactive({ start: '', end: '', reason: '' });

const minToTime = (min: number) => formatMin(min);
const timeToMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const rangesToInputs = (ranges: TimeRange[]): RangeInput[] =>
  ranges.length
    ? ranges.map((r) => ({ start: minToTime(r.startMin), end: minToTime(r.endMin) }))
    : [{ start: '09:30', end: '20:00' }];

const inputsToRanges = (ranges: RangeInput[]): TimeRange[] =>
  ranges.map((r) => ({ startMin: timeToMin(r.start), endMin: timeToMin(r.end) }));

const blankWeekly = (): DayEdit[] =>
  dayLabels.map((_, weekday) => ({
    weekday,
    kind: 'closed' as DayKind,
    label: 'Fermé',
    ranges: [{ start: '09:30', end: '20:00' }],
  }));

const weeklyFromVersion = (v: ScheduleVersionPayload): DayEdit[] =>
  blankWeekly().map((day) => {
    const src = v.weekly.find((d) => d.weekday === day.weekday);
    if (!src) return day;
    return {
      weekday: src.weekday,
      kind: src.kind,
      label: src.label,
      ranges: rangesToInputs(src.ranges),
    };
  });

const onKindChange = (day: DayEdit) => {
  if (day.kind === 'open') {
    if (!day.ranges.length) day.ranges = [{ start: '09:30', end: '20:00' }];
    if (!day.label || day.label === 'Fermé' || day.label === 'Prestation extérieure') {
      day.label = day.ranges.map((r) => `${r.start.replace(':', 'h')} – ${r.end.replace(':', 'h')}`).join(' · ');
    }
  } else if (day.kind === 'external') {
    day.ranges = [];
    day.label = 'Prestation extérieure';
  } else {
    day.ranges = [];
    day.label = 'Fermé';
  }
};

const onExceptionKindChange = () => {
  if (exceptionForm.kind === 'open') {
    if (!exceptionForm.ranges.length) exceptionForm.ranges = [{ start: '09:30', end: '20:00' }];
    if (!exceptionForm.label) exceptionForm.label = 'Ouvert exceptionnellement';
  } else if (exceptionForm.kind === 'external') {
    exceptionForm.label = exceptionForm.label || 'Prestation extérieure';
  } else {
    exceptionForm.label = exceptionForm.label || 'Fermé';
  }
};

const formatFrDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T'));
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const toLocalInput = (iso: string) => {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T'));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const load = async () => {
  loading.value = true;
  try {
    await schedule.fetchAdmin();
  } catch {
    toast.add({ severity: 'error', summary: 'Chargement impossible', life: 3500 });
  } finally {
    loading.value = false;
  }
};

const openCreateVersion = () => {
  editingVersionId.value = null;
  const base = versions.value.find((v) => v.id === activeVersionId.value) ?? versions.value[versions.value.length - 1];
  versionForm.effectiveFrom = new Date().toISOString().slice(0, 10);
  versionForm.name = '';
  versionForm.weekly = base ? weeklyFromVersion(base) : blankWeekly();
  versionDialog.value = true;
};

const openEditVersion = (v: ScheduleVersionPayload) => {
  editingVersionId.value = v.id;
  versionForm.effectiveFrom = v.effectiveFrom;
  versionForm.name = v.name ?? '';
  versionForm.weekly = weeklyFromVersion(v);
  versionDialog.value = true;
};

const saveVersion = async () => {
  saving.value = true;
  try {
    const weekly = versionForm.weekly.map((day) => ({
      weekday: day.weekday,
      kind: day.kind,
      label: day.label,
      ranges: day.kind === 'open' ? inputsToRanges(day.ranges) : [],
    }));

    if (editingVersionId.value) {
      await axiosInstance.put(`admin/schedule/versions/${editingVersionId.value}`, {
        effectiveFrom: versionForm.effectiveFrom,
        name: versionForm.name,
        weekly,
      });
    } else {
      await axiosInstance.post('admin/schedule/versions', {
        effectiveFrom: versionForm.effectiveFrom,
        name: versionForm.name,
        copyFromVersionId: activeVersionId.value,
        weekly,
      });
    }
    versionDialog.value = false;
    await schedule.fetchAdmin();
    toast.add({ severity: 'success', summary: 'Grille enregistrée', life: 2500 });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Enregistrement impossible',
      detail: e?.response?.data?.message || 'Erreur',
      life: 4000,
    });
  } finally {
    saving.value = false;
  }
};

const removeVersion = (v: ScheduleVersionPayload) => {
  confirm.require({
    message: `Supprimer la grille « ${v.name || v.effectiveFrom} » ?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axiosInstance.delete(`admin/schedule/versions/${v.id}`);
        await schedule.fetchAdmin();
        toast.add({ severity: 'success', summary: 'Grille supprimée', life: 2500 });
      } catch (e: any) {
        toast.add({ severity: 'error', summary: e?.response?.data?.message || 'Suppression impossible', life: 3500 });
      }
    },
  });
};

const openException = (ex?: ScheduleExceptionPayload) => {
  editingExceptionId.value = ex?.id ?? null;
  exceptionForm.date = ex?.date ?? new Date().toISOString().slice(0, 10);
  exceptionForm.kind = ex?.kind ?? 'closed';
  exceptionForm.label = ex?.label ?? 'Fermé';
  exceptionForm.ranges = rangesToInputs(ex?.ranges ?? []);
  exceptionDialog.value = true;
};

const saveException = async () => {
  saving.value = true;
  try {
    const payload = {
      date: exceptionForm.date,
      kind: exceptionForm.kind,
      label: exceptionForm.label,
      ranges: exceptionForm.kind === 'open' ? inputsToRanges(exceptionForm.ranges) : [],
    };
    if (editingExceptionId.value) {
      await axiosInstance.put(`admin/schedule/exceptions/${editingExceptionId.value}`, payload);
    } else {
      await axiosInstance.post('admin/schedule/exceptions', payload);
    }
    exceptionDialog.value = false;
    await schedule.fetchAdmin();
    toast.add({ severity: 'success', summary: 'Exception enregistrée', life: 2500 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.message || 'Erreur', life: 3500 });
  } finally {
    saving.value = false;
  }
};

const removeException = (ex: ScheduleExceptionPayload) => {
  confirm.require({
    message: `Supprimer l’exception du ${formatFrDate(ex.date)} ?`,
    header: 'Confirmation',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await axiosInstance.delete(`admin/schedule/exceptions/${ex.id}`);
      await schedule.fetchAdmin();
    },
  });
};

const openBlock = (b?: BlockedSlotPayload) => {
  editingBlockId.value = b?.id ?? null;
  blockForm.start = b ? toLocalInput(b.start) : '';
  blockForm.end = b ? toLocalInput(b.end) : '';
  blockForm.reason = b?.reason ?? '';
  blockDialog.value = true;
};

const saveBlock = async () => {
  saving.value = true;
  try {
    const payload = {
      start: blockForm.start.length === 16 ? `${blockForm.start}:00` : blockForm.start,
      end: blockForm.end.length === 16 ? `${blockForm.end}:00` : blockForm.end,
      reason: blockForm.reason,
    };
    if (editingBlockId.value) {
      await axiosInstance.put(`admin/schedule/blocked-slots/${editingBlockId.value}`, payload);
    } else {
      await axiosInstance.post('admin/schedule/blocked-slots', payload);
    }
    blockDialog.value = false;
    await schedule.fetchAdmin();
    toast.add({ severity: 'success', summary: 'Créneau bloqué enregistré', life: 2500 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.message || 'Erreur', life: 3500 });
  } finally {
    saving.value = false;
  }
};

const removeBlock = (b: BlockedSlotPayload) => {
  confirm.require({
    message: 'Supprimer ce créneau bloqué ?',
    header: 'Confirmation',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await axiosInstance.delete(`admin/schedule/blocked-slots/${b.id}`);
      await schedule.fetchAdmin();
    },
  });
};

onMounted(load);
</script>

<style scoped>
.block { margin-bottom: 22px; padding: 22px 24px; }
.block-head { margin-bottom: 16px; }
.block-head h2 { margin: 0 0 4px; font-size: 1.15rem; }
.block-head p { margin: 0; color: var(--adm-muted, #6b6560); font-size: 0.88rem; }
.block-head.row { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; }

.version-card {
  border: 1px solid var(--adm-border, #e8e2da);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 12px;
  background: #fff;
}
.version-card--active { border-color: #7a8f6e; box-shadow: 0 0 0 1px rgba(122, 143, 110, 0.25); }
.version-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.version-from { margin: 0; font-size: 0.78rem; color: var(--adm-muted, #6b6560); text-transform: uppercase; letter-spacing: 0.06em; }
.version-head h3 { margin: 2px 0 8px; font-size: 1.05rem; }
.version-actions { display: flex; gap: 2px; }

.week-preview { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.week-preview li { display: grid; grid-template-columns: 110px 1fr; gap: 10px; font-size: 0.9rem; }
.wd { color: var(--adm-muted, #6b6560); }

.wk--open { color: #3d5a3a; }
.wk--closed { color: #8a7f76; }
.wk--external { color: #8a6a3a; font-style: italic; }

.list { list-style: none; margin: 0; padding: 0; }
.list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--adm-border, #e8e2da);
}
.list li:last-child { border-bottom: none; }
.list strong { display: block; margin-bottom: 2px; }
.muted { color: var(--adm-muted, #6b6560); font-size: 0.85rem; }
.row-actions { display: flex; gap: 2px; flex-shrink: 0; }
.empty { color: var(--adm-muted, #6b6560); font-size: 0.9rem; padding: 8px 0; }

.form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.hint { margin: 0; font-size: 0.85rem; color: var(--adm-muted, #6b6560); }

.day-edit {
  border: 1px solid var(--adm-border, #e8e2da);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.day-edit-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.kind-select { width: 160px; }
.ranges { display: flex; flex-direction: column; gap: 8px; }
.range-row { display: flex; align-items: center; gap: 8px; }

.loading-veil { padding: 40px; text-align: center; color: var(--adm-muted, #6b6560); }

@media (max-width: 700px) {
  .form-row { grid-template-columns: 1fr; }
  .week-preview li { grid-template-columns: 90px 1fr; }
}
</style>
