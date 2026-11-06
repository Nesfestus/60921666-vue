import { defineStore } from 'pinia'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    errorMessage: '',
  }),

  actions: {
    async login(credentials) {
      this.errorMessage = ''

      try {
        const response = await axios.post(
          `${backendUrl}/api/login`,
          credentials,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        )

        this.token = response.data.token
        localStorage.setItem('token', this.token)

        await this.getUser()
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Не удалось выполнить вход'

        console.error(error)
      }
    },

    async getUser() {
      this.errorMessage = ''

      if (!this.token) {
        this.user = null
        this.isAuthenticated = false
        return
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/user`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              Accept: 'application/json',
            },
          },
        )

        this.user = response.data
        this.isAuthenticated = true
      } catch (error) {
        this.user = null
        this.isAuthenticated = false

        if (error.response?.status === 401) {
          this.token = null
          localStorage.removeItem('token')
        }

        this.errorMessage =
          error.response?.data?.message || 'Не удалось получить данные пользователя'

        console.error(error)
      }
    },

    async logout() {
      this.errorMessage = ''

      try {
        await axios.post(
          `${backendUrl}/api/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              Accept: 'application/json',
            },
          },
        )

        this.token = null
        this.user = null
        this.isAuthenticated = false

        localStorage.removeItem('token')
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Не удалось выполнить выход'

        console.error(error)
      }
    },

  },

})
