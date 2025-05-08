<template>
  <div :class="isDev ? 'debug-screens' : ''">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const isDev = !import.meta.env.PROD;
// const runtimeConfig = useRuntimeConfig(); // Assuming it might be used elsewhere, so commented out for now if only for umami
// const websiteID = runtimeConfig.public.umamiWebsiteID; // Remove this line

if (!useLoginAccount().value) {
  navigateTo('/login', {replace: true});
}

useHead({
  // script: [] // Clear the script array or remove the script key if no other scripts are added here
  // If there were other head elements, keep them. For now, just removing the script part related to Umami.
});
</script>

<style>
.highlight {
  color: red;
}
</style>
