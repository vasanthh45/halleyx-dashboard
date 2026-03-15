<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">Dashboard</h2>
      <button class="btn-primary" @click="$router.push('/dashboard-config')">
        Configure Dashboard
      </button>
    </div>

    <div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <h3>No widgets configured</h3>
      <p>Click Configure Dashboard to get started</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>