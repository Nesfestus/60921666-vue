
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './authStore'

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL

export const useDataStore = defineStore('data', {
  state: () => ({
    movies: [],
    movies_total: 0,
    halls: [],
    halls_total: 0,
    loading: false,
    errorMessage: '',
  }),

  actions: {
    async get_movies(page = 0, perpage = 5) {
      this.loading = true
      this.errorMessage = ''

      try {
        const authStore = useAuthStore()

        const response = await axios.get(`${backendUrl}/api/movie`, {
          params: { page, perpage },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        })

        this.movies = response.data
      } catch (error) {
        this.errorMessage = 'Не удалось загрузить фильмы'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async get_movies_total() {
      try {
        const authStore = useAuthStore()

        const response = await axios.get(`${backendUrl}/api/movies_total`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        })

        this.movies_total = response.data
      } catch (error) {
        this.errorMessage = 'Не удалось получить количество фильмов'
        console.error(error)
      }
    },

    async get_halls(page = 0, perpage = 5) {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await axios.get(`${backendUrl}/api/hall`, {
          params: { page, perpage },
        })

        this.halls = response.data
      } catch (error) {
        this.errorMessage = 'Не удалось загрузить залы'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async get_halls_total() {
      try {
        const response = await axios.get(`${backendUrl}/api/halls_total`)
        this.halls_total = response.data
      } catch (error) {
        this.errorMessage = 'Не удалось получить количество залов'
        console.error(error)
      }
    },
  },
})
