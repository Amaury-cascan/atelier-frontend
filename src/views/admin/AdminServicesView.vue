<template>
  <section class="adm-page services">
    <header class="adm-hero">
      <div>
        <p class="adm-eyebrow">Catalogue</p>
        <h1 class="adm-title">Prestations</h1>
        <p class="adm-subtitle">Gère le menu du salon : prix, durée, catégories et visibilité.</p>
      </div>
      <Button label="Nouvelle prestation" icon="pi pi-plus" @click="openCreate" />
    </header>

    <div class="toolbar adm-panel">
      <SelectButton
        v-model="filter"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
      <span class="count adm-muted">{{ filteredServices.length }} prestation{{ filteredServices.length > 1 ? 's' : '' }}</span>
      <Button icon="pi pi-refresh" severity="secondary" outlined rounded @click="load" :loading="loading" />
    </div>

    <div class="table-panel adm-panel">
      <DataTable
        :value="filteredServices"
        :loading="loading"
        striped-rows
        size="small"
        paginator
        :rows="10"
        :rows-per-page-options="[10, 25, 50]"
        data-key="id"
        class="svc-table"
      >
        <Column header="" style="width: 4.5rem">
          <template #body="{ data }">
            <div class="thumb">
              <img v-if="data.picture" :src="imageUrl(data.picture)" :alt="data.name" />
              <span v-else class="thumb-ph"><i class="pi pi-sparkles" /></span>
            </div>
          </template>
        </Column>
        <Column field="name" header="Nom" sortable>
          <template #body="{ data }">
            <strong class="svc-name">{{ data.name }}</strong>
            <small v-if="data.description" class="svc-desc">{{ data.description }}</small>
          </template>
        </Column>
        <Column field="category" header="Catégorie" sortable />
        <Column field="price" header="Prix" sortable style="width: 6.5rem">
          <template #body="{ data }">{{ data.price }} €</template>
        </Column>
        <Column field="duration" header="Durée" sortable style="width: 6.5rem">
          <template #body="{ data }">{{ data.duration }} min</template>
        </Column>
        <Column field="active" header="Statut" style="width: 7rem">
          <template #body="{ data }">
            <Tag
              :value="data.active ? 'Active' : 'Inactive'"
              :severity="data.active ? 'success' : 'secondary'"
              rounded
            />
          </template>
        </Column>
        <Column header="" style="width: 9rem">
          <template #body="{ data }">
            <div class="row-actions">
              <Button icon="pi pi-pencil" text rounded severity="secondary" title="Modifier" aria-label="Modifier" @click="openEdit(data)" />
              <Button
                v-if="data.active"
                icon="pi pi-eye-slash"
                text
                rounded
                severity="danger"
                title="Désactiver"
                aria-label="Désactiver"
                @click="deactivate(data)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="empty">Aucune prestation{{ filter === 'active' ? ' active' : '' }}.</div>
        </template>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editingId ? 'Modifier la prestation' : 'Nouvelle prestation'"
      :style="{ width: 'min(540px, 94vw)' }"
      :draggable="false"
    >
      <form class="form" @submit.prevent="save">
        <label>
          <span>Nom</span>
          <InputText v-model="form.name" required class="w-full" />
        </label>
        <div class="row2">
          <label>
            <span>Prix (€)</span>
            <InputNumber v-model="form.price" :min="0" class="w-full" input-class="w-full" />
          </label>
          <label>
            <span>Durée (min)</span>
            <InputNumber v-model="form.duration" :min="5" :step="5" class="w-full" input-class="w-full" />
          </label>
        </div>
        <label>
          <span>Catégorie</span>
          <Select
            v-model="form.categoryId"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="Choisir…"
            class="w-full"
          />
        </label>
        <label>
          <span>Description</span>
          <Textarea v-model="form.description" rows="3" required class="w-full" auto-resize />
        </label>
        <label>
          <span>Statut</span>
          <Select
            v-model="form.active"
            :options="activeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </label>
        <label>
          <span>Image</span>
          <input type="file" accept="image/*" class="file-input" @change="onFile" />
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
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { adminApi, imageUrl } from '@/services/adminApi';

type ServiceRow = {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  picture?: string | null;
  active: boolean;
  categoryId: number;
  category: string;
};
type CategoryRow = { id: number; name: string };

const toast = useToast();
const confirm = useConfirm();

const services = ref<ServiceRow[]>([]);
const categories = ref<CategoryRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const imageFile = ref<File | null>(null);
const filter = ref<'active' | 'all'>('active');

const filterOptions = [
  { label: 'Actives', value: 'active' },
  { label: 'Toutes', value: 'all' },
];
const activeOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

const form = reactive({
  name: '',
  price: 0,
  duration: 60,
  description: '',
  categoryId: 0 as number,
  active: true,
});

const filteredServices = computed(() =>
  filter.value === 'active' ? services.value.filter((s) => s.active) : services.value,
);

const load = async () => {
  loading.value = true;
  try {
    const [s, c] = await Promise.all([adminApi.listServices(), adminApi.listCategories()]);
    services.value = s.data.services;
    categories.value = c.data.categories;
  } catch {
    toast.add({ severity: 'error', summary: 'Chargement impossible', detail: 'Les prestations n’ont pas pu être récupérées.', life: 3500 });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.name = '';
  form.price = 0;
  form.duration = 60;
  form.description = '';
  form.categoryId = categories.value[0]?.id ?? 0;
  form.active = true;
  imageFile.value = null;
  editingId.value = null;
};

const openCreate = () => {
  resetForm();
  dialogOpen.value = true;
};

const openEdit = (s: ServiceRow) => {
  editingId.value = s.id;
  form.name = s.name;
  form.price = s.price;
  form.duration = s.duration;
  form.description = s.description;
  form.categoryId = s.categoryId;
  form.active = s.active;
  imageFile.value = null;
  dialogOpen.value = true;
};

const onFile = (e: Event) => {
  imageFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
};

const save = async () => {
  if (!form.name || !form.categoryId) {
    toast.add({ severity: 'warn', summary: 'Champs manquants', life: 2800 });
    return;
  }
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('price', String(form.price));
    fd.append('duration', String(form.duration));
    fd.append('description', form.description);
    fd.append('categoryId', String(form.categoryId));
    fd.append('active', form.active ? '1' : '0');
    if (imageFile.value) fd.append('image', imageFile.value);

    if (editingId.value) await adminApi.updateService(editingId.value, fd);
    else await adminApi.createService(fd);

    dialogOpen.value = false;
    toast.add({ severity: 'success', summary: 'Prestation enregistrée', life: 2200 });
    await load();
  } catch {
    toast.add({ severity: 'error', summary: 'Enregistrement impossible', life: 3200 });
  } finally {
    saving.value = false;
  }
};

const deactivate = (s: ServiceRow) => {
  confirm.require({
    message: `Désactiver « ${s.name} » ? Elle ne sera plus proposée à la réservation.`,
    header: 'Désactivation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Désactiver',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await adminApi.deleteService(s.id);
        toast.add({ severity: 'success', summary: 'Prestation désactivée', life: 2200 });
        await load();
      } catch {
        toast.add({ severity: 'error', summary: 'Désactivation impossible', life: 3000 });
      }
    },
  });
};

onMounted(load);
</script>

<style scoped>
.services .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.services .count { margin-right: auto; font-size: 0.85rem; }
.table-panel { overflow: hidden; padding: 4px 0 0; }
.svc-table :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  color: var(--adm-muted, #6e675f);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}
.thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3e8e0;
  display: grid;
  place-items: center;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-ph { color: #c17f59; font-size: 0.9rem; opacity: 0.7; }
.svc-name { display: block; font-weight: 600; color: var(--adm-text, #2a2622); }
.svc-desc {
  display: block;
  color: var(--adm-muted, #6e675f);
  font-size: 0.75rem;
  margin-top: 2px;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-actions { display: flex; gap: 2px; justify-content: flex-end; }
.empty { padding: 28px; text-align: center; color: var(--adm-muted, #6e675f); }
.form { display: flex; flex-direction: column; gap: 14px; }
.form label { display: flex; flex-direction: column; gap: 6px; }
.form label > span { font-size: 0.78rem; color: var(--adm-muted, #6e675f); font-weight: 600; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.file-input {
  border: 1px dashed var(--adm-border, #e6dfd6);
  border-radius: 10px;
  padding: 12px;
  background: #faf7f4;
  font: inherit;
  font-size: 0.85rem;
}
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.w-full { width: 100%; }
@media (max-width: 640px) {
  .row2 { grid-template-columns: 1fr; }
  .svc-desc { display: none; }
  .toolbar {
    flex-wrap: wrap;
  }
  .toolbar :deep(.p-selectbutton) { width: 100%; }
  .toolbar :deep(.p-selectbutton .p-togglebutton) { flex: 1; }
}
</style>
