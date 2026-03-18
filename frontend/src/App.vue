<template>
  <div class="app-layout">
    
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-logo">
        <h1>Halleyx</h1>
        <p>Dashboard Builder</p>
      </div>
      <nav class="sidebar-nav">
        <router-link
          to="/"
          class="nav-link"
          :class="{ active: $route.path === '/' }"
        >
          Dashboard
        </router-link>
        <router-link
          to="/orders"
          class="nav-link"
          :class="{ active: $route.path === '/orders' }"
        >
          Customer Orders
        </router-link>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <router-view />
    </div>

  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
