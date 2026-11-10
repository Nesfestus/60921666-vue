<script>
import PrimeButton from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useDataStore } from '@/stores/dataStore'

export default {
  name: 'CreateMoviePage',

  components: {
    PrimeButton,
    InputText,
  },

  data() {
    return {
      dataStore: useDataStore(),
      movie: {
        name: '',
        duration: '',
        picture: null,
      },
      submitting: false,
    }
  },

  methods: {
    onPictureChange(event) {
      this.movie.picture = event.target.files[0] ?? null
    },

    async submitMovie() {
      if (this.submitting) return

      this.submitting = true

      try {
        const result = await this.dataStore.create_movie(this.movie)

        this.$toast.add({
          severity: 'success',
          summary: 'Фильм добавлен',
          detail: result.message,
          life: 8000,
        })

        this.movie = { name: '', duration: '', picture: null }
        this.$refs.pictureInput.value = ''
      } catch (error) {
        const response = error.response
        let detail = response?.data?.message || 'Не удалось связаться с сервером.'

        if (response?.status === 422) {
          detail = Object.values(response.data.errors ?? {}).flat().join(' ')
        } else if (response?.status === 403) {
          detail = 'Добавлять фильмы может только администратор.'
        } else if (response?.status === 401) {
          detail = 'Для добавления фильма необходимо войти в аккаунт.'
        }

        this.$toast.add({
          severity: 'error',
          summary: response?.status === 422 ? 'Проверьте данные' : 'Ошибка добавления',
          detail,
          life: 10000,
        })
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<template>
  <main class="create-movie">
    <h1>Добавление фильма</h1>

    <form class="movie-form" @submit.prevent="submitMovie">
      <label for="movie-name">Название фильма</label>
      <InputText id="movie-name" v-model="movie.name" :disabled="submitting" />

      <label for="movie-duration">Продолжительность в минутах</label>
      <InputText
        id="movie-duration"
        v-model="movie.duration"
        type="number"
        :disabled="submitting"
      />

      <label for="movie-picture">Постер фильма</label>
      <input
        id="movie-picture"
        ref="pictureInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :disabled="submitting"
        @change="onPictureChange"
      />
      <small>JPG, PNG или WEBP, размер до 2 МБ</small>

      <div class="form-actions">
        <PrimeButton type="submit" label="Добавить фильм" :loading="submitting" />
        <PrimeButton
          type="button"
          label="К списку фильмов"
          severity="secondary"
          :disabled="submitting"
          @click="$router.push('/items')"
        />
      </div>
    </form>
  </main>
</template>

<style scoped>
.create-movie {
  max-width: 600px;
  margin: 32px auto;
  padding: 0 20px;
}

.movie-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}
</style>
