<template>
  <div id="app" class="min-h-screen bg-white text-gray-900">
    <header class="border-b border-gray-300 px-4 py-6">
      <h1 class="text-3xl font-bold">
        <RouterLink to="/" class="hover:text-gray-700">Baker Schedule Calculator</RouterLink>
      </h1>
      <p class="text-gray-600 text-sm mt-1">Plan your sourdough bake backward from your target time</p>
    </header>

    <main class="max-w-2xl mx-auto p-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}
</style>
