

<template>
  <Toast position="top-right" />
  <Menubar :model="items">
    <template #item="{ item, props }">
      <router-link
        v-if="item.route"
        v-slot="{ href, navigate }"
        :to="item.route"
        custom
      >
        <a
          :href="href"
          v-bind="props.action"
          @click="navigate"
          class="flex items-center gap-2 px-4 py-2"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </router-link>
    </template>

    <template #end>
      <div
        v-if="isAuthenticated && user"
        class="flex items-center gap-3"
      >
        <span class="pi pi-user"></span>
        {{ user.name }}
        <PrimeButton label="Выйти" @click="logout" />
      </div>

      <form
        v-else
        @submit.prevent="login"
        class="flex items-center gap-2"
      >
        <InputText
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="Логин"
        />

        <InputText
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="Пароль"
        />

        <PrimeButton type="submit" label="Войти" />

        <div v-if="authError" class="error">
          {{ authError }}
        </div>
      </form>
    </template>
  </Menubar>

  <router-view />
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import PrimeButton from 'primevue/button'
import Menubar from 'primevue/menubar'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'

export default {
  components: {
    PrimeButton,
    Menubar,
    InputText,
    Toast,
  },

  data() {
    return {
      email: '',
      password: '',
      authStore: useAuthStore(),

      items: [
        {
          label: 'Главная страница',
          icon: 'pi pi-home',
          route: '/',
        },
        {
          label: 'Категории',
          icon: 'pi pi-folder',
          route: '/categories',
        },
        {
          label: 'Товары',
          icon: 'pi pi-box',
          route: '/items',
        },
      ],
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
