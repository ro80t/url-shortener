<script setup lang="ts">
import Layout from "./Layout.vue";

defineProps<{ url: string }>();
</script>

<template>
  <Layout title="ページが見つかりません" :url="url">
    <div class="notfound">
      <p class="code">404</p>
      <h1>ページが見つかりませんでした</h1>
      <p><a href="/">トップページへ戻る</a></p>
    </div>
  </Layout>
</template>
