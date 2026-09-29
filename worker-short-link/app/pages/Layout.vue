<script setup lang="ts">
import { Head } from "@inertiajs/vue3";

const SITE_NAME = "URL短縮サービス / jli.li";
const DEFAULT_DESCRIPTION =
  "URL短縮サービスです。どんなに長いURLでも小さくまとめることが出来ます。";

const props = withDefaults(
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
    <meta name="keywords" content="URL短縮サービス, jli.li, jli, URL短縮, 短縮" />
    <meta name="theme-color" content="#008b8b" />
    <meta name="format-detection" content="telephone=no,email=no,address=no" />

    <meta property="og:url" :content="url" />
    <meta property="og:type" content="website" />
    <meta property="og:title" :content="title" />
    <meta property="og:description" :content="description" />
    <meta property="og:site_name" content="URL短縮サービス / jli.li" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thunlights" />
    <meta name="twitter:creator" content="@thunlights" />
  </Head>

  <div class="header">
    <div class="header-block">
      <a href="/">
        <p class="header-title">JLI.li (URL 短縮サービス)</p>
      </a>
    </div>
  </div>

  <div class="main">
    <slot />
  </div>

  <div class="footer">
    <p>
      This project is publicly available in Github
      <a href="https://github.com/thunlights/jli">code</a>
    </p>
    <p>Supported By <a href="https://www.thunlights.com">Team ThunLights</a></p>
  </div>
</template>
