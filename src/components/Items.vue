<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import PrimeButton from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'

export default {
  name: 'ItemsPage',

  components: {
    DataTable,
    Column,
    PrimeButton,
    InputText,
    Select,
    ConfirmPopup,
    Toast,
  },

  data() {
    return {
      dataStore: useDataStore(),
      authStore: useAuthStore(),
      perpage: 5,
      offset: 0,
      search: '',
      appliedSearch: '',
      failedPosters: {},
      deleting: false,
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

    confirmDelete(event, movie) {
      this.$confirm.require({
        target: event.currentTarget,
        message: `Удалить фильм «${movie.name}»?`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Отмена',
          severity: 'secondary',
          outlined: true,
        },
        acceptProps: {
          label: 'Удалить',
          severity: 'danger',
        },
        accept: () => {
          this.deleteMovie(movie.id)
        },
      })
    },

    async deleteMovie(id) {
      if (this.deleting) return

      this.deleting = true

      try {
        const result = await this.dataStore.delete_movie(id)

        await this.dataStore.get_movies_total(this.appliedSearch)

        // Если последняя страница опустела, выбираем доступную страницу
        const lastPage = Math.max(
          0,
          Math.ceil(this.moviesTotal / this.perpage) - 1,
        )

        const page = Math.min(
          Math.floor(this.offset / this.perpage),
          lastPage,
        )

        this.offset = page * this.perpage

        await this.dataStore.get_movies(
          page,
          this.perpage,
          this.appliedSearch,
        )

        this.$toast.add({
          severity: 'success',
          summary: 'Удаление фильма',
          detail: result.message,
          life: 5000,
        })
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка удаления',
          detail:
            error.response?.data?.message ??
            'Не удалось выполнить запрос на удаление.',
          life: 6000,
        })
      } finally {
        this.deleting = false
      }
    },

    async onSearch() {
      this.appliedSearch = this.search.trim()
      this.offset = 0

      await Promise.all([
        this.dataStore.get_movies(0, this.perpage, this.appliedSearch),
        this.dataStore.get_movies_total(this.appliedSearch),
      ])
    },

    async onRowsChange(rows) {
      await this.onPageChange({ first: 0, rows })
    },

    async onPageChange(event) {
      this.offset = event.first
      this.perpage = event.rows

      const page = Math.floor(this.offset / this.perpage)

      await this.dataStore.get_movies(
        page,
        this.perpage,
        this.appliedSearch,
      )
    },
  },
}
</script>

<template>
  <main class="page-container">
    <div class="page-heading">
      <div>
        <h1 class="page-title">Фильмы</h1>
        <p class="page-description">Каталог фильмов кинотеатра</p>
      </div>

      <PrimeButton
        v-if="canCreateMovie"
        label="Добавить фильм"
        icon="pi pi-plus"
        @click="$router.push('/items/create')"
      />
    </div>

    <p v-if="dataStore.errorMessage" class="page-error" role="alert">
      {{ dataStore.errorMessage }}
    </p>

    <section class="surface-panel" aria-label="Каталог фильмов">
      <div class="panel-heading">
        Всего фильмов: <strong>{{ moviesTotal }}</strong>
      </div>

      <DataTable
        :value="movies"
        dataKey="id"
        class="cinema-table movies-table"
        :tableStyle="{ minWidth: '480px' }"
        lazy
        paginator
        :loading="dataStore.loading"
        :rows="perpage"
        :totalRecords="moviesTotal"
        :first="offset"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        currentPageReportTemplate="{first} - {last} из {totalRecords}"
        @page="onPageChange"
      >
        <template #header>
          <div class="cinema-table-toolbar">
            <form class="search-form" @submit.prevent="onSearch">
              <InputText
                v-model="search"
                type="search"
                placeholder="Название фильма"
                aria-label="Поиск фильма по названию"
                class="search-input"
                :disabled="dataStore.loading"
              />

              <PrimeButton
                type="submit"
                label="Найти"
                icon="pi pi-search"
                :disabled="dataStore.loading"
              />
            </form>

            <div class="cinema-page-size">
              <label for="movies-page-size">На странице</label>

              <Select
                inputId="movies-page-size"
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

        <Column field="name" header="Фильм">
          <template #body="{ data }">
            <div class="film-cell">
              <img
                v-if="data.picture_url && !failedPosters[data.picture_url]"
                :src="data.picture_url"
                :alt="`Постер фильма ${data.name}`"
                class="movie-poster"
                loading="lazy"
                @error="failedPosters[data.picture_url] = true"
              />

              <span
                v-else
                class="movie-poster poster-placeholder"
                aria-hidden="true"
              >
                <span class="pi pi-image"></span>
              </span>

              <div class="film-details">
                <span class="film-title">{{ data.name }}</span>

                <small v-if="!data.picture_url">
                  Нет постера
                </small>
                <small v-else-if="failedPosters[data.picture_url]">
                  Постер недоступен
                </small>
              </div>
            </div>
          </template>
        </Column>

        <Column
          field="duration"
          header="Продолжительность"
          class="duration-column"
        >
          <template #body="{ data }">
            <span class="movie-duration">
              {{ data.duration }} <span>мин</span>
            </span>
          </template>
        </Column>

        <Column header="Действия" class="actions-column">
          <template #body="{ data }">
            <div class="table-row-actions">
              <PrimeButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                :aria-label="`Редактировать фильм «${data.name}»`"
                :disabled="deleting || dataStore.loading"
                @click="$router.push(`/items/create/${data.id}`)"
              />

              <PrimeButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                :aria-label="`Удалить фильм «${data.name}»`"
                :disabled="deleting || dataStore.loading"
                @click="confirmDelete($event, data)"
              />
            </div>
          </template>
        </Column>

        <template #empty>
          Нет фильмов для отображения.
        </template>
      </DataTable>
      <ConfirmPopup />
      <Toast />
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

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
}

.search-input {
  width: 280px;
  max-width: 100%;
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

.movies-table :deep(.p-datatable-header) {
  padding: 16px 20px;
  border-color: var(--cinema-border);
  background: var(--cinema-panel);
}

.film-cell {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
}

.movie-poster {
  display: block;
  width: 48px;
  height: 72px;
  flex-shrink: 0;
  border: 1px solid var(--cinema-border);
  border-radius: 6px;
  object-fit: cover;
}

.poster-placeholder {
  display: grid;
  place-items: center;
  background: var(--cinema-subtle);
  color: var(--cinema-muted);
}

.film-details {
  min-width: 0;
}

.film-title {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.film-details small {
  display: block;
  margin-top: 4px;
  color: var(--cinema-muted);
  font-size: 12px;
}

.movies-table :deep(.duration-column) {
  width: 190px;
  text-align: right;
}

.movies-table :deep(.duration-column .p-datatable-column-header-content) {
  justify-content: flex-end;
}

.movie-duration {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.movie-duration > span {
  color: var(--cinema-muted);
}

.movies-table :deep(.actions-column) {
  width: 140px;
  text-align: center;
}

.movies-table :deep(.actions-column .p-datatable-column-header-content) {
  justify-content: center;
}

.table-row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

@media (max-width: 640px) {
  .search-form {
    width: 100%;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    width: auto;
  }

  .film-cell {
    gap: 12px;
  }

  .movies-table :deep(.duration-column) {
    width: 150px;
  }
}
</style>
