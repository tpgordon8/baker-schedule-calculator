<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Manage Templates</h2>

    <p class="text-sm text-gray-600 mb-4">
      Create your own templates or modify existing ones. Use these to quickly start new bakes with your preferred settings.
    </p>

    <!-- Template Manager Component -->
    <TemplateManager />

    <!-- Navigation -->
    <div class="flex gap-2 mt-6">
      <RouterLink to="/" class="btn btn-primary flex-1">
        Back to Home
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import TemplateManager from '../components/TemplateManager.vue'
</script>
