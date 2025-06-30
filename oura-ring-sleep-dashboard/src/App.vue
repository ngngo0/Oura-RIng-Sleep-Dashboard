<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 1000; /* make sure it stays on top */
  background-color: #2C5F5D; /* or whatever your background is */
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--color-border);
  box-sizing: border-box;
}

.logo {
  display: block;
  margin: 0;
}

nav {
  display: flex;
  gap: 2rem;
  font-size: 2rem;
  text-align: left;
  margin-top: 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: none;

}

/* Responsive: stack vertically on small screens */
@media (max-width: 1023px) {
  header {
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }

  .logo {
    margin-bottom: 1rem;
  }

  nav {
    flex-direction: column;
    gap: 1rem;
    font-size: 1.5rem;
    margin-top: 0;
  }

  nav a {
    padding: 0;
  }
}
</style>


<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>