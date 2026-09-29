<script setup lang="ts">
import Layout from "./Layout.vue";

defineProps<{ url: string }>();
</script>

<template>
  <Layout title="ページが見つかりません" :url="url">
    <div class="contents-block">
      <h1>404</h1>
      <p>ページが見つかりませんでした。</p>
    </div>
  </Layout>
</template>
