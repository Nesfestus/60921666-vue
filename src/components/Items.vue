<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import PrimeButton from 'primevue/button'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'

export default {
  name: 'ItemsPage',

  components: {
    DataTable,
    Column,
    PrimeButton,
  },

  data() {
    return {
      dataStore: useDataStore(),
      authStore: useAuthStore(),
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

    canCreateMovie() {
      return Number(this.authStore.user?.is_admin) === 1
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
    <div class="page-header">
      <h1>Список фильмов</h1>

      <PrimeButton
        v-if="canCreateMovie"
        label="Добавить фильм"
        icon="pi pi-plus"
        @click="$router.push('/items/create')"
      />
    </div>

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

      <Column header="Постер">
        <template #body="{ data }">
          <img
            v-if="data.picture_url"
            :src="data.picture_url"
            :alt="`Постер фильма ${data.name}`"
            class="movie-poster"
            loading="lazy"
          />
          <span v-else>Нет постера</span>
        </template>
      </Column>

      <Column field="duration" header="Продолжительность" />
    </DataTable>
  </main>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.movie-poster {
  display: block;
  width: 72px;
  height: 108px;
  object-fit: cover;
  border-radius: 6px;
}
</style>
