<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import { useDataStore } from '../stores/dataStore'

export default {
  name: 'CategoriesPage',

  components: {
    DataTable,
    Column,
    Select,
  },

  data() {
    return {
      dataStore: useDataStore(),
      perpage: 5,
      offset: 0,
    }
  },

  computed: {
    halls() {
      return this.dataStore.halls
    },

    hallsTotal() {
      return this.dataStore.halls_total
    },
  },

  async mounted() {
    await Promise.all([
      this.dataStore.get_halls(0, this.perpage),
      this.dataStore.get_halls_total(),
    ])
  },

  methods: {
    async onRowsChange(rows) {
      await this.onPageChange({ first: 0, rows })
    },

    async onPageChange(event) {
      this.offset = event.first
      this.perpage = event.rows

      const page = Math.floor(this.offset / this.perpage)

      await this.dataStore.get_halls(page, this.perpage)
    },
  },
}
</script>

<template>
  <main class="page-container">
    <div class="page-heading">
      <div>
        <h1 class="page-title">Залы</h1>
        <p class="page-description">Кинозалы кинотеатра</p>
      </div>
    </div>

    <p v-if="dataStore.errorMessage" class="page-error" role="alert">
      {{ dataStore.errorMessage }}
    </p>

    <section class="surface-panel" aria-label="Список залов">
      <DataTable
        :value="halls"
        dataKey="id"
        class="cinema-table halls-table"
        lazy
        paginator
        :loading="dataStore.loading"
        :rows="perpage"
        :totalRecords="hallsTotal"
        :first="offset"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        currentPageReportTemplate="{first} - {last} из {totalRecords}"
        @page="onPageChange"
      >
        <template #header>
          <div class="cinema-table-toolbar">
            <span class="halls-count">
              Всего залов: <strong>{{ hallsTotal }}</strong>
            </span>

            <div class="cinema-page-size">
              <label for="halls-page-size">На странице</label>

              <Select
                inputId="halls-page-size"
                :modelValue="perpage"
                :options="[2, 5, 10]"
                :disabled="dataStore.loading"
                @update:modelValue="onRowsChange"
              />
            </div>
          </div>
        </template>

        <Column
          field="id"
          header="№"
          headerClass="table-id"
          bodyClass="table-id"
        />

        <Column field="name" header="Название зала">
          <template #body="{ data }">
            <span class="hall-name">
              <span class="pi pi-building" aria-hidden="true"></span>
              {{ data.name }}
            </span>
          </template>
        </Column>

        <template #empty>
          Нет залов для отображения.
        </template>
      </DataTable>
    </section>
  </main>
</template>

<style scoped>
.cinema-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.halls-count {
  color: var(--cinema-muted);
  font-size: 14px;
  font-weight: 400;
}

.halls-count strong {
  color: var(--cinema-text);
}

.cinema-page-size {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.cinema-page-size label {
  color: var(--cinema-muted);
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

.cinema-page-size :deep(.p-select) {
  min-width: 80px;
}

.halls-table :deep(.p-datatable-header) {
  padding: 16px 20px;
  border-color: var(--cinema-border);
  background: var(--cinema-panel);
}

.hall-name {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
}

.hall-name .pi {
  color: var(--cinema-muted);
}
</style>
