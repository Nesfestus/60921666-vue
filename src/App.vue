<template>
  <div class="app-shell">
    <Toast position="top-right" class="cinema-toast" />

    <header class="app-header">
      <div class="app-header-inner">
        <Menubar :model="items" class="app-menubar" aria-label="Основная навигация">
          <template #start>
            <RouterLink to="/" class="app-brand" aria-label="Cinema, главная страница">
              <span class="app-brand-icon pi pi-video" aria-hidden="true"></span>
              <span>Cinema</span>
            </RouterLink>
          </template>

          <template #item="{ item, props }">
            <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a
                v-bind="props.action"
                :href="href"
                class="app-nav-link"
                :class="{ 'app-nav-link-active': isCurrentSection(item.route) }"
                :aria-current="isCurrentSection(item.route) ? 'page' : undefined"
                @click="navigate"
              >
                <span :class="item.icon" aria-hidden="true"></span>
                <span>{{ item.label }}</span>
              </a>
            </RouterLink>
          </template>

          <template #end>
            <div v-if="isAuthenticated && user" class="header-account">
              <span class="account-name">
                <span class="pi pi-user" aria-hidden="true"></span>
                {{ user.name }}
              </span>
              <PrimeButton label="Выйти" severity="secondary" outlined @click="logout" />
            </div>

            <form v-else class="header-login" @submit.prevent="login">
              <InputText
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="username"
                placeholder="Email"
                aria-label="Email"
              />
              <InputText
                id="password"
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="Пароль"
                aria-label="Пароль"
              />
              <PrimeButton type="submit" label="Войти" />
            </form>
          </template>
        </Menubar>

        <p v-if="authError" class="page-error auth-error" role="alert">{{ authError }}</p>
      </div>
    </header>

    <RouterView />

    <footer class="app-footer">
      <div class="app-footer-inner">
        <span>Cinema</span>
        <span>Управление кинотеатром</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import PrimeButton from 'primevue/button'
import Menubar from 'primevue/menubar'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'

export default {
  components: { PrimeButton, Menubar, InputText, Toast },

  data() {
    return {
      email: '',
      password: '',
      authStore: useAuthStore(),
      items: [
        { label: 'Главная', icon: 'pi pi-home', route: '/' },
        { label: 'Фильмы', icon: 'pi pi-video', route: '/items' },
        { label: 'Залы', icon: 'pi pi-building', route: '/categories' },
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
    isCurrentSection(route) {
      if (route === '/') return this.$route.path === '/'
      return this.$route.path === route || this.$route.path.startsWith(`${route}/`)
    },

    async login() {
      await this.authStore.login({ email: this.email, password: this.password })
    },

    async logout() {
      await this.authStore.logout()
    },
  },

  mounted() {
    if (this.authStore.token) this.authStore.getUser()
  },
}
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--cinema-border);
  background: var(--cinema-panel);
}
.app-header-inner,
.app-footer-inner {
  max-width: var(--cinema-page-width);
  margin: 0 auto;
  padding: 16px 32px;
}
.app-menubar {
  gap: 24px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--cinema-text);
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
}
.app-brand-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
  background: var(--cinema-accent-soft);
  color: var(--cinema-accent);
  font-size: 19px;
}
.app-nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 7px;
  color: var(--cinema-muted);
  font-size: 14px;
  text-decoration: none;
}
.app-nav-link-active {
  background: var(--cinema-accent-soft);
  color: var(--cinema-accent);
}
.header-account,
.account-name {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  font-size: 14px;
}
.account-name {
  gap: 8px;
  overflow-wrap: anywhere;
}
.header-login {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-login .p-inputtext {
  width: 160px;
  min-width: 0;
  font-size: 14px;
}
.auth-error {
  margin: 16px 0 0;
  font-size: 14px;
}
.app-footer {
  border-top: 1px solid var(--cinema-border);
}
.app-footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--cinema-muted);
  font-size: 12px;
}
.cinema-toast {
  width: min(25rem, calc(100vw - 32px));
}
@media (max-width: 1100px) {
  .app-menubar {
    flex-wrap: wrap;
    gap: 12px;
  }
  .header-login .p-inputtext {
    width: 135px;
  }
}
@media (max-width: 640px) {
  .app-header-inner,
  .app-footer-inner {
    padding: 14px 16px;
  }
  .app-menubar :deep(.p-menubar-end) {
    max-width: 100%;
  }
  .header-login {
    width: 100%;
    flex-wrap: wrap;
  }
  .header-login .p-inputtext {
    width: 100%;
    flex: 1 1 140px;
    font-size: 16px;
  }
  .header-account {
    gap: 8px;
  }
  .app-footer-inner span:last-child {
    display: none;
  }
}
</style>
