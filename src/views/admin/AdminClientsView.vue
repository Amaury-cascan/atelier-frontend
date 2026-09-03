<template>
  <section class="adm-page clients">
    <header class="adm-hero">
      <div>
        <p class="adm-eyebrow">Fichier clientèle</p>
        <h1 class="adm-title">Clients</h1>
        <p class="adm-subtitle">Retrouve une cliente, consulte son historique et mets à jour ses coordonnées.</p>
      </div>
      <Button label="Nouvelle cliente" icon="pi pi-user-plus" @click="openCreate" />
    </header>

    <div class="toolbar adm-panel">
      <IconField class="search-field">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Nom, email, téléphone…"
          class="w-full"
          @keyup.enter="load"
        />
      </IconField>
      <Button label="Rechercher" icon="pi pi-search" severity="secondary" outlined @click="load" />
      <Button icon="pi pi-refresh" severity="secondary" outlined rounded @click="load" :loading="loading" />
    </div>

    <div class="table-panel adm-panel">
      <DataTable
        :value="clients"
        :loading="loading"
        striped-rows
        size="small"
        paginator
        :rows="12"
        :rows-per-page-options="[12, 25, 50]"
        data-key="id"
        class="cli-table"
      >
        <Column header="Cliente" sortable field="name">
          <template #body="{ data }">
            <div class="client-cell">
              <span class="avatar">{{ initials(data) }}</span>
              <div>
                <strong>{{ data.firstName }} {{ data.name }}</strong>
                <small v-if="data.connu">Via {{ data.connu }}</small>
              </div>
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" sortable />
        <Column field="phoneNumber" header="Téléphone" />
        <Column field="appointmentsCount" header="RDV" sortable style="width: 5.5rem">
          <template #body="{ data }">
            <Tag :value="String(data.appointmentsCount)" rounded severity="secondary" />
          </template>
        </Column>
        <Column header="" style="width: 10rem">
          <template #body="{ data }">
            <div class="row-actions">
              <Button icon="pi pi-eye" text rounded severity="secondary" title="Fiche" aria-label="Fiche" @click="openShow(data)" />
              <Button icon="pi pi-pencil" text rounded severity="secondary" title="Modifier" aria-label="Modifier" @click="openEdit(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" title="Supprimer" aria-label="Supprimer" @click="remove(data)" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="empty">Aucune cliente trouvée.</div>
        </template>
      </DataTable>
    </div>

    <!-- Fiche détail -->
    <Dialog
      v-model:visible="detailOpen"
      modal
      :header="detailTitle"
      :style="{ width: 'min(640px, 94vw)' }"
      :draggable="false"
    >
      <div v-if="detail" class="detail">
        <div class="detail-meta adm-panel">
          <p><i class="pi pi-envelope" /> {{ detail.client.email }}</p>
          <p><i class="pi pi-phone" /> {{ detail.client.phoneNumber }}</p>
          <p v-if="detail.client.connu"><i class="pi pi-share-alt" /> Source : {{ detail.client.connu }}</p>
        </div>
        <h3 class="timeline-title">Historique des rendez-vous</h3>
        <ul v-if="detail.appointments.length" class="timeline">
          <li v-for="a in detail.appointments" :key="a.id">
            <span class="dot" />
            <div>
              <strong>{{ formatDate(a.date) }}</strong>
              <span>{{ a.service || 'Sans service' }}</span>
            </div>
            <em>{{ a.price }} €</em>
          </li>
        </ul>
        <p v-else class="empty soft">Aucun rendez-vous pour le moment.</p>
      </div>
      <template #footer>
        <Button label="Fermer" severity="secondary" outlined @click="detailOpen = false" />
      </template>
    </Dialog>

    <!-- Création / édition -->
    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editingId ? 'Modifier la cliente' : 'Nouvelle cliente'"
      :style="{ width: 'min(520px, 94vw)' }"
      :draggable="false"
    >
      <form class="form" @submit.prevent="save">
        <div class="row2">
          <label>
            <span>Prénom</span>
            <InputText v-model="form.firstName" required class="w-full" />
          </label>
          <label>
            <span>Nom</span>
            <InputText v-model="form.name" required class="w-full" />
          </label>
        </div>
        <label>
          <span>Email</span>
          <InputText v-model="form.email" type="email" required class="w-full" />
        </label>
        <label>
          <span>Téléphone</span>
          <InputText v-model="form.phoneNumber" required class="w-full" />
        </label>
        <label>
          <span>Comment m'avez-vous connue ?</span>
          <InputText v-model="form.connu" class="w-full" placeholder="Instagram, bouche-à-oreille…" />
        </label>
        <div class="form-actions">
          <Button type="button" label="Annuler" severity="secondary" outlined @click="dialogOpen = false" />
          <Button type="submit" label="Enregistrer" :loading="saving" />
        </div>
      </form>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { adminApi } from '@/services/adminApi';

type ClientRow = {
  id: number;
  name: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  connu?: string | null;
  appointmentsCount: number;
};

type AppointmentRow = { id: number; date: string; service?: string | null; price: number };
type ClientDetail = { client: ClientRow; appointments: AppointmentRow[] };

const toast = useToast();
const confirm = useConfirm();

const clients = ref<ClientRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const search = ref('');
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const detail = ref<ClientDetail | null>(null);
const detailOpen = ref(false);
const form = reactive({ name: '', firstName: '', email: '', phoneNumber: '', connu: '' });

const detailTitle = computed(() =>
  detail.value ? `${detail.value.client.firstName} ${detail.value.client.name}` : 'Fiche cliente',
);

const initials = (c: ClientRow) =>
  `${(c.firstName || '?')[0]}${(c.name || '?')[0]}`.toUpperCase();

const formatDate = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const load = async () => {
  loading.value = true;
  try {
    const { data } = await adminApi.listClients(search.value);
    clients.value = data.clients;
  } catch {
    toast.add({ severity: 'error', summary: 'Chargement impossible', detail: 'Les clientes n’ont pas pu être récupérées.', life: 3500 });
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingId.value = null;
  Object.assign(form, { name: '', firstName: '', email: '', phoneNumber: '', connu: '' });
  dialogOpen.value = true;
};

const openEdit = (c: ClientRow) => {
  editingId.value = c.id;
  Object.assign(form, {
    name: c.name,
    firstName: c.firstName,
    email: c.email,
    phoneNumber: c.phoneNumber,
    connu: c.connu || '',
  });
  dialogOpen.value = true;
};

const openShow = async (c: ClientRow) => {
  try {
    const { data } = await adminApi.getClient(c.id);
    detail.value = data;
    detailOpen.value = true;
  } catch {
    toast.add({ severity: 'error', summary: 'Fiche inaccessible', life: 3000 });
  }
};

const save = async () => {
  saving.value = true;
  try {
    const payload = { ...form };
    if (editingId.value) await adminApi.updateClient(editingId.value, payload);
    else await adminApi.createClient(payload);
    dialogOpen.value = false;
    toast.add({ severity: 'success', summary: 'Cliente enregistrée', life: 2200 });
    await load();
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Enregistrement impossible',
      detail: e?.response?.data?.message || undefined,
      life: 3500,
    });
  } finally {
    saving.value = false;
  }
};

const remove = (c: ClientRow) => {
  confirm.require({
    message: `Supprimer ${c.firstName} ${c.name} ? Cette action est définitive.`,
    header: 'Suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await adminApi.deleteClient(c.id);
        toast.add({ severity: 'success', summary: 'Cliente supprimée', life: 2200 });
        await load();
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Suppression impossible',
          detail: e?.response?.data?.message || undefined,
          life: 3500,
        });
      }
    },
  });
};

onMounted(load);
</script>

<style scoped>
.clients .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.search-field { flex: 1; min-width: 200px; }
.table-panel { overflow: hidden; }
.cli-table :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  color: var(--adm-muted, #6e675f);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}
.client-cell { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(193, 127, 89, 0.14);
  color: #c17f59;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.client-cell strong { display: block; font-weight: 600; }
.client-cell small { color: var(--adm-muted, #6e675f); font-size: 0.75rem; }
.row-actions { display: flex; gap: 2px; justify-content: flex-end; }
.empty { padding: 28px; text-align: center; color: var(--adm-muted, #6e675f); }
.empty.soft { padding: 12px 0; }
.detail-meta {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.detail-meta p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--adm-text, #2a2622);
}
.detail-meta i { color: #c17f59; }
.timeline-title {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-weight: 400;
  font-size: 1.35rem;
  margin: 0 0 12px;
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 8px;
  max-height: 320px;
  overflow: auto;
  border-left: 2px solid rgba(193, 127, 89, 0.25);
}
.timeline li {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 12px;
  padding: 10px 0 10px 18px;
}
.timeline .dot {
  position: absolute;
  left: -7px;
  top: 16px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c17f59;
  box-shadow: 0 0 0 3px rgba(193, 127, 89, 0.2);
}
.timeline strong { display: block; font-size: 0.88rem; }
.timeline span { color: var(--adm-muted, #6e675f); font-size: 0.82rem; }
.timeline em { font-style: normal; font-weight: 600; color: #c17f59; align-self: center; }
.form { display: flex; flex-direction: column; gap: 14px; }
.form label { display: flex; flex-direction: column; gap: 6px; }
.form label > span { font-size: 0.78rem; color: var(--adm-muted, #6e675f); font-weight: 600; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.w-full { width: 100%; }
@media (max-width: 640px) {
  .row2 { grid-template-columns: 1fr; }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar :deep(.p-iconfield),
  .toolbar :deep(.p-inputtext) {
    width: 100%;
  }
}
</style>
