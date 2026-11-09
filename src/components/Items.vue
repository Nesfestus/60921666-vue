
<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useDataStore } from '../stores/dataStore'

export default {
  name: 'ItemsPage',

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
    movies() {
      return this.dataStore.movies
    },

    moviesTotal() {
      return this.dataStore.movies_total
    },
  },

  async mounted() {
    await Promise.all([
      this.dataStore.get_movies(0, this.perpage),
      this.dataStore.get_movies_total(),
    ])
  },

  methods: {
    async onPageChange(event) {
      this.offset = event.first
      this.perpage = event.rows

      const page = Math.floor(this.offset / this.perpage)

      await this.dataStore.get_movies(page, this.perpage)
    },
  },
}
</script>

<template>
  <main>
    <h1>Список фильмов</h1>

    <p v-if="dataStore.errorMessage">
      {{ dataStore.errorMessage }}
    </p>

    <DataTable
      :value="movies"
      lazy
      paginator
      :loading="dataStore.loading"
      :rows="perpage"
      :rowsPerPageOptions="[2, 5, 10]"
      :totalRecords="moviesTotal"
      :first="offset"
      @page="onPageChange"
    >
      <Column field="id" header="№" />
      <Column field="name" header="Название фильма" />
      <Column field="duration" header="Продолжительность" />
    </DataTable>
  </main>
</template>
