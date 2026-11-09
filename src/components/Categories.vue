
<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useDataStore } from '../stores/dataStore'

export default {
  name: 'CategoriesPage',

  components: {
    DataTable,
    Column,
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
  <main>
    <h1>Список залов</h1>

    <p v-if="dataStore.errorMessage">
      {{ dataStore.errorMessage }}
    </p>

    <DataTable
      :value="halls"
      lazy
      paginator
      :loading="dataStore.loading"
      :rows="perpage"
      :rowsPerPageOptions="[2, 5, 10]"
      :totalRecords="hallsTotal"
      :first="offset"
      @page="onPageChange"
    >
      <Column field="id" header="№" />
      <Column field="name" header="Название зала" />
    </DataTable>
  </main>
</template>
