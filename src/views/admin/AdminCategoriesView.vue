<template>
  <section class="adm-page categories">
    <header class="adm-hero">
      <div>
        <p class="adm-eyebrow">Catalogue</p>
        <h1 class="adm-title">Catégories</h1>
        <p class="adm-subtitle">Organise les prestations par univers, avec une image d’ambiance.</p>
      </div>
      <Button label="Nouvelle catégorie" icon="pi pi-plus" @click="openCreate" />
    </header>

    <p v-if="loading" class="loading-veil"><i class="pi pi-spin pi-spinner" /> Chargement…</p>

    <div v-else class="masonry">
      <article v-for="c in categories" :key="c.id" class="tile adm-panel">
        <div class="media">
          <img v-if="c.picture" :src="imageUrl(c.picture)" :alt="c.name" />
          <div v-else class="media-ph"><i class="pi pi-image" /></div>
          <div class="overlay">
            <Button icon="pi pi-pencil" rounded title="Modifier" aria-label="Modifier" @click="openEdit(c)" />
            <Button icon="pi pi-trash" rounded severity="danger" title="Supprimer" aria-label="Supprimer" @click="remove(c)" />
          </div>
        </div>
        <div class="body">
          <h2>{{ c.name }}</h2>
          <p>{{ c.description }}</p>
          <Tag :value="`${c.servicesCount} prestation${c.servicesCount > 1 ? 's' : ''}`" severity="secondary" rounded />
        </div>
      </article>

      <div v-if="!categories.length" class="empty adm-panel">
        <i class="pi pi-folder-open" />
        <p>Aucune catégorie pour le moment.</p>
        <Button label="Créer la première" icon="pi pi-plus" @click="openCreate" />
      </div>
    </div>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'"
      :style="{ width: 'min(520px, 94vw)' }"
      :draggable="false"
    >
      <form class="form" @submit.prevent="save">
        <label>
          <span>Nom</span>
          <InputText v-model="form.name" required class="w-full" />
        </label>
        <label>
          <span>Description</span>
          <Textarea v-model="form.description" rows="3" required class="w-full" auto-resize />
        </label>
        <label>
          <span>Image {{ editingId ? '(optionnelle)' : '' }}</span>
          <input
            type="file"
            accept="image/*"
            class="file-input"
            :required="!editingId"
            @change="onFile"
          />
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
import { onMounted, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { adminApi, imageUrl } from '@/services/adminApi';

type CategoryRow = {
  id: number;
  name: string;
  description: string;
  picture: string;
  servicesCount: number;
};

const toast = useToast();
const confirm = useConfirm();

const categories = ref<CategoryRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const imageFile = ref<File | null>(null);
const form = reactive({ name: '', description: '' });

const load = async () => {
  loading.value = true;
  try {
    const { data } = await adminApi.listCategories();
    categories.value = data.categories;
  } catch {
    toast.add({ severity: 'error', summary: 'Chargement impossible', detail: 'Les catégories n’ont pas pu être récupérées.', life: 3500 });
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingId.value = null;
  form.name = '';
  form.description = '';
  imageFile.value = null;
  dialogOpen.value = true;
};

const openEdit = (c: CategoryRow) => {
  editingId.value = c.id;
  form.name = c.name;
  form.description = c.description;
  imageFile.value = null;
  dialogOpen.value = true;
};

const onFile = (e: Event) => {
  imageFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
};

const save = async () => {
  if (!editingId.value && !imageFile.value) {
    toast.add({ severity: 'warn', summary: 'Image requise', detail: 'Ajoute une image pour créer la catégorie.', life: 2800 });
    return;
  }
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    if (imageFile.value) fd.append('image', imageFile.value);
    if (editingId.value) await adminApi.updateCategory(editingId.value, fd);
    else await adminApi.createCategory(fd);
    dialogOpen.value = false;
    toast.add({ severity: 'success', summary: 'Catégorie enregistrée', life: 2200 });
    await load();
  } catch {
    toast.add({ severity: 'error', summary: 'Enregistrement impossible', life: 3200 });
  } finally {
    saving.value = false;
  }
};

const remove = (c: CategoryRow) => {
  confirm.require({
    message: `Supprimer « ${c.name} » ? Les prestations liées peuvent être impactées.`,
    header: 'Suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await adminApi.deleteCategory(c.id);
        toast.add({ severity: 'success', summary: 'Catégorie supprimée', life: 2200 });
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
.loading-veil {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--adm-muted, #6e675f);
  padding: 24px 0;
}
.masonry {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.tile {
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
}
.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 50px rgba(45, 42, 38, 0.1);
}
.media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #f3e8e0;
  overflow: hidden;
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.tile:hover .media img { transform: scale(1.04); }
.media-ph {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #c17f59;
  font-size: 2rem;
  opacity: 0.45;
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(42, 38, 34, 0.45);
  opacity: 0;
  transition: opacity 0.25s ease;
}
.tile:hover .overlay { opacity: 1; }
.body { padding: 16px 18px 18px; }
.body h2 {
  margin: 0 0 6px;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 1.45rem;
  font-weight: 400;
  color: var(--adm-text, #2a2622);
}
.body p {
  margin: 0 0 12px;
  color: var(--adm-muted, #6e675f);
  font-size: 0.88rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--adm-muted, #6e675f);
}
.empty i { font-size: 1.8rem; color: #c17f59; }
.form { display: flex; flex-direction: column; gap: 14px; }
.form label { display: flex; flex-direction: column; gap: 6px; }
.form label > span { font-size: 0.78rem; color: var(--adm-muted, #6e675f); font-weight: 600; }
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
  .masonry {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .overlay {
    opacity: 1;
    background: linear-gradient(transparent 45%, rgba(42, 38, 34, 0.7));
    align-items: flex-end;
    padding-bottom: 12px;
  }
}
</style>
