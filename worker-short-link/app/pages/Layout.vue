<script setup lang="ts">
import { Head } from "@inertiajs/vue3";
import { JLI_DOMAIN, REPO_URL, SITE_NAME } from "consts";

const DEFAULT_DESCRIPTION =
  "ro80t's short link は無料のURL短縮サービスです。どんなに長いURLでも jli.li の短いリンクにまとめられます。";

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    url: string;
  }>(),
  {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
);
</script>

<template>
  <Head>
    <title>{{ title }}</title>
    <meta name="description" :content="description" />
    <meta name="keywords" content="URL短縮サービス, ro80t, jli.li, URL短縮, 短縮" />
    <meta name="theme-color" content="#0d9488" />
    <meta name="format-detection" content="telephone=no,email=no,address=no" />

    <meta property="og:url" :content="url" />
    <meta property="og:type" content="website" />
    <meta property="og:title" :content="title" />
    <meta property="og:description" :content="description" />
    <meta property="og:site_name" :content="SITE_NAME" />

    <meta name="twitter:card" content="summary" />
  </Head>

  <header class="header">
    <div class="header-inner">
      <a class="brand" href="/">ro80t's <span class="brand-domain">short link</span></a>
      <span class="brand-tag">{{ JLI_DOMAIN }}</span>
    </div>
  </header>

  <main class="main">
    <slot />
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <p>オープンソースです — <a :href="REPO_URL">GitHub</a> で全てのコードを公開しています。</p>
      <p>© ro80t</p>
    </div>
  </footer>
</template>
