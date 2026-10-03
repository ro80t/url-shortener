<script setup lang="ts">
import { computed, ref } from "vue";
import { JLI_URL, OWN_DOMAINS, REPO_URL } from "consts";
import { useJsonPost } from "../composables/useJsonPost";
import ResultCard from "../components/ResultCard.vue";
import Layout from "./Layout.vue";

defineProps<{ url: string }>();

const compress = useJsonPost<{ id: string }>("/api/compress", "エラーが発生し短縮に失敗しました。");
const decompress = useJsonPost<{ link: string }>(
  "/api/decompress",
  "解凍に失敗しました。登録されていないURLの可能性があります。",
);

/* Shorten */

const originalUrl = ref("");
const inputError = ref("");

const compressError = computed(() => inputError.value || compress.error.value);
const shortUrl = computed(() =>
  compress.data.value ? new URL(compress.data.value.id, JLI_URL).toString() : "",
);
const compressMessage = computed(() => {
  const original = originalUrl.value.length;
  const short = shortUrl.value.length;
  if (original < short) return "元URLのほうが短いので、元URLを使うのをおすすめします。";
  if (original === short) return `元URLと長さは変わりませんでした。(両方: ${short}文字)`;
  return `${original}文字 → ${short}文字 に短縮しました`;
});

function submitCompress() {
  compress.reset();
  inputError.value = "";

  let parsed: URL;
  try {
    parsed = new URL(originalUrl.value);
  } catch {
    inputError.value = "URL以外の文字列は短縮できません";
    return;
  }
  if (OWN_DOMAINS.has(parsed.hostname)) {
    inputError.value = "本サービスの短縮URLドメインは短縮することが出来ません";
    return;
  }

  compress.post({ link: originalUrl.value });
}

/* Expand — accepts either a short URL pasted whole or just its id */

const decompressInput = ref("");
const decompressId = computed(() => {
  const value = decompressInput.value.trim();
  try {
    const parsed = new URL(value);
    if (OWN_DOMAINS.has(parsed.hostname)) return parsed.pathname.slice(1);
  } catch {
    // Not a URL, so treat the input as a bare id
  }
  return value;
});
</script>

<template>
  <Layout :url="url">
    <section class="hero">
      <h1>長いURLを、短いリンクに。</h1>
      <p>URLを貼って押すだけ。登録不要・無料で {{ JLI_URL }} の短縮リンクを発行します。</p>

      <form class="field" novalidate @submit.prevent="submitCompress">
        <input
          v-model="originalUrl"
          type="url"
          spellcheck="false"
          autocomplete="off"
          placeholder="https://example.com/very/long/url"
          aria-label="短縮したいURL"
        />
        <button type="submit" :disabled="compress.pending.value">
          {{ compress.pending.value ? "短縮中…" : "短縮する" }}
        </button>
      </form>

      <div aria-live="polite">
        <p v-if="compressError" class="error">{{ compressError }}</p>
        <ResultCard v-else-if="shortUrl" :message="compressMessage" :url="shortUrl" copyable />
      </div>
    </section>

    <section class="card">
      <h2>短縮したURLを解凍する</h2>
      <form class="field" novalidate @submit.prevent="decompress.post({ id: decompressId })">
        <input
          v-model="decompressInput"
          type="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="rdNwqj または短縮URL"
          aria-label="短縮URLまたはそのID"
        />
        <button type="submit" :disabled="decompress.pending.value">
          {{ decompress.pending.value ? "解凍中…" : "解凍する" }}
        </button>
      </form>
      <small class="hint">{{ JLI_URL }}/rdNwqj の rdNwqj 部分がIDです。</small>

      <div aria-live="polite">
        <p v-if="decompress.error.value" class="error">{{ decompress.error.value }}</p>
        <ResultCard
          v-else-if="decompress.data.value"
          message="元URL"
          :url="decompress.data.value.link"
        />
      </div>
    </section>

    <section class="card">
      <h2>なぜURLを短縮するのか</h2>
      <p>
        SNSにURLを貼るとき、URLが長すぎて文字数制限に引っかかった経験はありませんか？そんなときに使えるのがURL短縮サービスです。
      </p>
      <p class="example">https://example.com/a/very/long/path?with=query → {{ JLI_URL }}/rdNwqj</p>
      <p>
        これにより、文字数制限のあるSNSでも投稿の幅が広がります。<br />
        <small class="hint">※元々短いURLは、元のURLの方が短くなる場合があります。</small>
      </p>
    </section>

    <section class="card">
      <h2>Q &amp; A</h2>

      <details>
        <summary>本当に安全ですか？</summary>
        <p>
          本サイトはオープンソースです。<a :href="REPO_URL">GitHub</a>
          で全てのコードを公開しているので、挙動はすべて確認できます。
        </p>
      </details>

      <details>
        <summary>作成したリンクは永久に機能しますか？</summary>
        <p>
          はい。このサービスが終わらない限り機能し続けます。悪意のあるURLでない限り削除されることもありません。
        </p>
      </details>

      <details>
        <summary>短縮URLの削除申請はどうすればいいですか？</summary>
        <p>
          <a :href="`${REPO_URL}/issues`">GitHub Issues</a>
          からご連絡ください。リンク先が悪意のある場合にのみ削除対応が可能です。
        </p>
      </details>
    </section>
  </Layout>
</template>
