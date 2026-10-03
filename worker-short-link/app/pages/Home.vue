<script setup lang="ts">
import { ref } from "vue";
import { JLI_URL, OWN_DOMAINS, REPO_URL } from "consts";
import Layout from "./Layout.vue";

defineProps<{ url: string }>();

const originalUrl = ref("");
const compressing = ref(false);
const compressError = ref("");
const compressed = ref<{ url: string; message: string } | null>(null);
const copied = ref(false);

const decompressInput = ref("");
const decompressing = ref(false);
const decompressError = ref("");
const decompressed = ref("");

async function compress() {
  compressError.value = "";
  compressed.value = null;
  copied.value = false;

  let url: URL;
  try {
    url = new URL(originalUrl.value);
  } catch {
    compressError.value = "URL以外の文字列は短縮できません";
    return;
  }
  if (OWN_DOMAINS.has(url.hostname)) {
    compressError.value = "本サービスの短縮URLドメインは短縮することが出来ません";
    return;
  }

  compressing.value = true;
  try {
    const response = await fetch("/api/compress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link: originalUrl.value }),
    });
    if (response.status !== 200) {
      compressError.value = "エラーが発生し短縮に失敗しました。";
      return;
    }

    const json = (await response.json()) as { id: string };
    const shortUrl = new URL(json.id, JLI_URL).toString();
    const message =
      originalUrl.value.length < shortUrl.length
        ? "元URLのほうが短いので、元URLを使うのをおすすめします。"
        : originalUrl.value.length === shortUrl.length
          ? `元URLと長さは変わりませんでした。(両方: ${shortUrl.length}文字)`
          : `${originalUrl.value.length}文字 → ${shortUrl.length}文字 に短縮しました`;
    compressed.value = { url: shortUrl, message };
  } finally {
    compressing.value = false;
  }
}

async function copy() {
  if (!compressed.value) return;
  try {
    await navigator.clipboard.writeText(compressed.value.url);
    copied.value = true;
  } catch {
    copied.value = false;
  }
}

async function decompress() {
  decompressError.value = "";
  decompressed.value = "";

  const ownDomainPattern = [...OWN_DOMAINS].map((d) => d.replace(/\./g, "\.")).join("|");
  const match = decompressInput.value
    .trim()
    .match(new RegExp(`^https:\/\/(?:${ownDomainPattern})\/(.+)`));
  const id = match ? match[1] : decompressInput.value.trim();

  decompressing.value = true;
  try {
    const response = await fetch("/api/decompress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.status !== 200) {
      decompressError.value = "解凍に失敗しました。登録されていないURLの可能性があります。";
      return;
    }

    const json = (await response.json()) as { link: string };
    decompressed.value = json.link;
  } finally {
    decompressing.value = false;
  }
}
</script>

<template>
  <Layout :url="url">
    <section class="hero">
      <h1>長いURLを、短いリンクに。</h1>
      <p>URLを貼って押すだけ。登録不要・無料で {{ JLI_URL }} の短縮リンクを発行します。</p>

      <form class="field" novalidate @submit.prevent="compress">
        <input
          v-model="originalUrl"
          type="url"
          spellcheck="false"
          autocomplete="off"
          placeholder="https://example.com/very/long/url"
          aria-label="短縮したいURL"
        />
        <button type="submit" :disabled="compressing">
          {{ compressing ? "短縮中…" : "短縮する" }}
        </button>
      </form>

      <div aria-live="polite">
        <p v-if="compressError" class="error">{{ compressError }}</p>
        <div v-else-if="compressed" class="result">
          <p class="result-message">{{ compressed.message }}</p>
          <div class="result-row">
            <a class="result-url" :href="compressed.url">{{ compressed.url }}</a>
            <button type="button" @click="copy">{{ copied ? "コピー済み" : "コピー" }}</button>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>短縮したURLを解凍する</h2>
      <form class="field" novalidate @submit.prevent="decompress">
        <input
          v-model="decompressInput"
          type="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="rdNwqj または短縮URL"
          aria-label="短縮URLまたはそのID"
        />
        <button type="submit" :disabled="decompressing">
          {{ decompressing ? "解凍中…" : "解凍する" }}
        </button>
      </form>
      <small class="hint">{{ JLI_URL }}/rdNwqj の rdNwqj 部分がIDです。</small>

      <div aria-live="polite">
        <p v-if="decompressError" class="error">{{ decompressError }}</p>
        <div v-else-if="decompressed" class="result">
          <p class="result-message">元URL</p>
          <div class="result-row">
            <a class="result-url" :href="decompressed">{{ decompressed }}</a>
          </div>
        </div>
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
