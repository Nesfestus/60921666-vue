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
      loadingMovie: false,
      loadError: '',
    }
  },

  computed: {
    movieId() {
      return this.$route.params.id
    },

    isEdit() {
      return Boolean(this.movieId)
    },
  },

  watch: {
    movieId: {
      immediate: true,
      handler: 'loadMovie',
    },
  },

  methods: {
    async loadMovie(id) {
      this.movie = { name: '', duration: '', picture: null }
      this.loadError = ''
      this.loadingMovie = Boolean(id)
      this.$refs.pictureInput?.clear()

      if (!id) return

      try {
        const movie = await this.dataStore.get_movie(id)

        if (!movie?.id) {
          throw new Error('Фильм не найден.')
        }

        this.movie = {
          name: movie.name,
          duration: movie.duration,
          picture: null,
        }
      } catch (error) {
        this.loadError =
          error.response?.data?.message ??
          error.message ??
          'Не удалось загрузить фильм.'
      } finally {
        this.loadingMovie = false
      }
    },

    onPictureChange(event) {
      this.movie.picture = event.files[0] ?? null
    },

    async submitMovie() {
      if (this.submitting || this.loadingMovie || this.loadError) return

      this.submitting = true

      try {
        const result = this.isEdit
          ? await this.dataStore.update_movie(this.movieId, this.movie)
          : await this.dataStore.create_movie(this.movie)

        this.$toast.add({
          severity: 'success',
          summary: this.isEdit ? 'Фильм обновлён' : 'Фильм добавлен',
          detail: result.message,
          life: 8000,
        })

        if (this.isEdit) {
          this.movie.picture = null
        } else {
          this.movie = { name: '', duration: '', picture: null }
        }

        this.$refs.pictureInput?.clear()
      } catch (error) {
        const response = error.response
        let detail = response?.data?.message || 'Не удалось связаться с сервером.'

        if (response?.status === 422) {
          detail = Object.values(response.data.errors ?? {})
            .flat()
            .join(' ')
        } else if (response?.status === 401) {
          detail = 'Для сохранения фильма необходимо войти в аккаунт.'
        }

        this.$toast.add({
          severity: 'error',
          summary:
            response?.status === 422
              ? 'Проверьте данные'
              : 'Ошибка сохранения',
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
  <main class="page-container">
    <PrimeButton
      type="button"
      label="К фильмам"
      icon="pi pi-arrow-left"
      severity="secondary"
      text
      :disabled="submitting || loadingMovie"
      class="back-button"
      @click="$router.push('/items')"
    />
    <div class="page-heading">
      <div>
        <h1 class="page-title">
          {{ isEdit ? 'Редактирование фильма' : 'Добавление фильма' }}
        </h1>
        <p class="page-description">
          {{
            isEdit
              ? 'Измените данные фильма. Постер можно оставить прежним.'
              : 'Заполните данные и выберите постер.'
          }}
        </p>
      </div>
    </div>

    <p v-if="loadingMovie" class="page-description" role="status">
      Загрузка данных фильма...
    </p>
    <p v-if="loadError" class="page-error" role="alert">
      {{ loadError }}
    </p>

    <form
      v-if="!loadingMovie && !loadError"
      class="surface-panel form-panel movie-form"
      @submit.prevent="submitMovie"
    >
      <div class="form-field">
        <label for="movie-name">Название фильма</label>
        <InputText
          id="movie-name"
          v-model="movie.name"
          placeholder="Например, Интерстеллар"
          :disabled="submitting"
        />
      </div>

      <div class="form-field">
        <label for="movie-duration">Продолжительность, мин</label>
        <InputText
          id="movie-duration"
          v-model="movie.duration"
          type="number"
          placeholder="120"
          :disabled="submitting"
        />
      </div>

      <div class="form-field">
        <span id="movie-picture-label" class="form-label">Постер фильма</span>
        <FileUpload
          ref="pictureInput"
          mode="basic"
          name="picture"
          accept="image/jpeg,image/png,image/webp"
          :multiple="false"
          :auto="false"
          customUpload
          :disabled="submitting"
          :chooseLabel="
            movie.picture?.name ||
            (isEdit ? 'Выбрать новый постер' : 'Выберите файл')
          "
          chooseIcon="pi pi-file"
          :chooseButtonProps="{
            type: 'button',
            severity: 'secondary',
            outlined: true,
            class: 'poster-select-button',
            'aria-labelledby': 'movie-picture-label',
            'aria-describedby': 'movie-picture-help',
          }"
          class="poster-upload"
          @select="onPictureChange"
          @clear="movie.picture = null"
        >
          <template #filelabel><span></span></template>
        </FileUpload>
        <small id="movie-picture-help" class="field-help">
          JPG, PNG или WEBP, размер до 2 МБ.
          <span v-if="isEdit">
            Если новый файл не выбран, сохранится текущий постер.
          </span>
        </small>
      </div>

      <div class="form-actions">
        <PrimeButton
          type="submit"
          :label="isEdit ? 'Сохранить изменения' : 'Добавить фильм'"
          :icon="isEdit ? 'pi pi-check' : 'pi pi-plus'"
          :loading="submitting"
        />
      </div>
    </form>
  </main>
</template>

<style scoped>
.back-button {
  margin: 0 0 20px;
  padding-left: 0;
}
.movie-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.movie-form :deep(.p-fileupload) {
  width: 100%;
}
.movie-form :deep(.p-fileupload-basic-content) {
  width: 100%;
  min-width: 0;
}
.movie-form :deep(.poster-select-button) {
  width: 100%;
  min-width: 0;
  justify-content: flex-start;
}
.movie-form :deep(.poster-select-button .p-button-label) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
</style>
