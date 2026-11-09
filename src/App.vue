<template>
  <header>
    <nav>

      <ul>
        <li>
          <router-link to="/">Главная</router-link>
        </li>
        <li>
          <router-link to="/categories">Категории</router-link>
        </li>
        <li>
          <router-link to="/items">Товары</router-link>
        </li>
      </ul>

      <div v-if="isAuthenticated && user">
        Welcome, {{ user.name }}
        <button @click="logout">Logout</button>
      </div>

      <div v-else>
        <form @submit.prevent="login">
          <div>
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
            />
          </div>

          <div>
            <label for="password">Password:</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
            />
          </div>

          <button type="submit">Login</button>

          <p v-if="authError" class="error">
            {{ authError }}
          </p>
        </form>
      </div>
    </nav>
  </header>

  <router-view></router-view>

</template>

<script>
import {useAuthStore} from '@/stores/authStore'

export default {
  data() {
    return {
      email: '',
      password: '',
      authStore: useAuthStore(),
    }
  },

  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated
    },

    user() {
      return this.authStore.user
    },

    authError() {
      return this.authStore.errorMessage
    },
  },

  methods: {
    async login() {
      await this.authStore.login({
        email: this.email,
        password: this.password,
      })
    },

    async logout() {
      await this.authStore.logout()
    },
  },

  mounted() {
    if (this.authStore.token) {
      this.authStore.getUser()
    }
  },
}
</script>

<style scoped>
.error {
  color: red;
}
</style>
