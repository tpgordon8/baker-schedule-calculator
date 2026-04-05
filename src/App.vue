<template>
  <div id="app" class="min-h-screen bg-white text-gray-900 flex flex-col">
    <header class="border-b border-gray-300 px-4 py-6 sm:py-8">
      <h1 class="text-2xl sm:text-3xl font-bold">
        <RouterLink to="/" class="hover:text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-gray-900 rounded px-2">
          Baker Schedule Calculator
        </RouterLink>
      </h1>
      <p class="text-gray-600 text-sm mt-2">Plan your bake backward from your target time</p>
    </header>

    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6 sm:py-8">
      <RouterView />
    </main>

    <footer class="border-t border-gray-300 px-4 py-4 text-center text-xs text-gray-600 mt-8">
      <p>Made for ADHD bakers who want to understand their schedule</p>
    </footer>
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
