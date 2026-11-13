<script>
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'HomePage',
  data() {
    return { authStore: useAuthStore() }
  },
  computed: {
    greeting() {
      const name = this.authStore.user?.name
      return name ? `Добро пожаловать, ${name}` : 'Добро пожаловать'
    },
  },
}
</script>

<template>
  <main class="page-container">
    <div class="page-heading">
      <div>
        <p class="home-greeting">{{ greeting }}</p>
        <h1 class="page-title">Управление кинотеатром</h1>
        <p class="page-description">Фильмы и залы в одном приложении.</p>
      </div>
    </div>

    <div class="home-sections">
      <RouterLink to="/items" class="navigation-card">
        <span class="navigation-card-icon pi pi-video" aria-hidden="true"></span>
        <h2>Фильмы</h2>
        <p>Каталог, постеры и продолжительность фильмов.</p>
        <span class="navigation-card-link">
          Открыть каталог <span class="pi pi-arrow-right" aria-hidden="true"></span>
        </span>
      </RouterLink>
      <RouterLink to="/categories" class="navigation-card">
        <span class="navigation-card-icon pi pi-building" aria-hidden="true"></span>
        <h2>Залы</h2>
        <p>Список кинозалов кинотеатра.</p>
        <span class="navigation-card-link">
          Открыть список <span class="pi pi-arrow-right" aria-hidden="true"></span>
        </span>
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.home-greeting {
  margin: 0 0 12px;
  color: var(--cinema-muted);
  font-size: 14px;
}
.home-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.navigation-card {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--cinema-border);
  border-radius: var(--cinema-radius);
  background: var(--cinema-panel);
  color: var(--cinema-text);
  text-decoration: none;
}
.navigation-card:hover {
  border-color: var(--cinema-accent);
  background: var(--cinema-hover);
}
.navigation-card-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 20px;
  place-items: center;
  border-radius: 10px;
  background: var(--cinema-accent-soft);
  color: var(--cinema-accent);
  font-size: 20px;
}
.navigation-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}
.navigation-card p {
  margin: 0;
  color: var(--cinema-muted);
  font-size: 14px;
}
.navigation-card-link {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 28px;
  color: var(--cinema-accent);
  font-size: 14px;
  font-weight: 600;
}
@media (max-width: 640px) {
  .home-sections {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
