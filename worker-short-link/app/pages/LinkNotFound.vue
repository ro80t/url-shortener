<script setup lang="ts">
import Layout from "./Layout.vue";

defineProps<{ url: string }>();
</script>

<template>
  <Layout title="リダイレクト先が見つかりません" :url="url">
    <div class="contents-block">
      <h1>リダイレクト先が見つかりませんでした</h1>
      <h2>URLを間違えていませんか？</h2>
    </div>
  </Layout>
</template>
