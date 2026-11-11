<script>
import PrimeButton from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useDataStore } from '@/stores/dataStore'
import FileUpload from 'primevue/fileupload'

export default {
  name: 'CreateMoviePage',

  components: {
    PrimeButton,
    InputText,
    FileUpload,
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
      this.movie.picture = event.files[0] ?? null
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
        this.$refs.pictureInput.clear()
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

      <span id="movie-picture-label">Постер фильма</span>

      <FileUpload
        ref="pictureInput"
        mode="basic"
        name="picture"
        accept="image/jpeg,image/png,image/webp"
        :multiple="false"
        :auto="false"
        customUpload
        :disabled="submitting"
        :chooseLabel="movie.picture?.name || 'Выберите файл'"
        chooseIcon="pi pi-file"
        :chooseButtonProps="{
    severity: 'secondary',
    outlined: true,
    'aria-labelledby': 'movie-picture-label',
    style: {
      width: '100%',
      justifyContent: 'flex-start',
      minWidth: '0',
    },
  }"
        class="poster-upload"
        @select="onPictureChange"
        @clear="movie.picture = null"
      >
        <template #filelabel>
          <span></span>
        </template>
      </FileUpload>
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

.poster-upload {
  width: 100%;
}

.poster-upload :deep(.p-fileupload-basic-content) {
  width: 100%;
}

.poster-upload :deep(.p-button-label) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

</style>
