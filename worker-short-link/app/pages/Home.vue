<script setup lang="ts">
import { ref } from "vue";
import { JLI_URL, OWN_DOMAINS } from "consts";
import Layout from "./Layout.vue";

defineProps<{ url: string }>();

type Result =
  | { error: string }
  | { compressUrl: string; message: string }
  | { link: string }
  | null;

const originalUrl = ref("");
const compressResult = ref<Result>(null);

const decompressInput = ref("");
const decompressResult = ref<Result>(null);

async function compress() {
  compressResult.value = null;

  let url: URL;
  try {
    url = new URL(originalUrl.value);
  } catch {
    compressResult.value = { error: "URL以外の文字列は短縮できません" };
    return;
  }
  if (OWN_DOMAINS.has(url.hostname)) {
    compressResult.value = { error: "本サービスの短縮URLドメインは短縮することが出来ません" };
    return;
  }

  const response = await fetch("/api/compress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link: originalUrl.value }),
  });

  if (response.status !== 200) {
    compressResult.value = { error: "エラーが発生し短縮に失敗しました。" };
    return;
  }

  const json = (await response.json()) as { id: string };
  const compressUrl = new URL(json.id, JLI_URL).toString();
  const message =
    originalUrl.value.length < compressUrl.length
      ? "元URLのほうがサイズが小さいので元URLを使うのをおすすめします。"
      : originalUrl.value.length === compressUrl.length
        ? `元URLとサイズは変わりませんでした。(両方: ${compressUrl.length}文字)`
        : `圧縮に成功 ${originalUrl.value.length}文字 → ${compressUrl.length}文字 に圧縮しました`;
  compressResult.value = { compressUrl, message };
}

async function decompress() {
  decompressResult.value = null;

  const ownDomainPattern = [...OWN_DOMAINS].map((d) => d.replace(/\./g, "\\.")).join("|");
  const match = decompressInput.value.match(
    new RegExp(`^https:\\/\\/(?:${ownDomainPattern})\\/(.+)`),
  );
  const id = match ? match[1] : decompressInput.value;

  const response = await fetch("/api/decompress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (response.status !== 200) {
    decompressResult.value = {
      error: "解凍に失敗しました。登録されていないURLの可能性があります。",
    };
    return;
  }

  const json = (await response.json()) as { link: string };
  decompressResult.value = { link: json.link };
}
</script>

<template>
  <Layout :url="url">
    <div class="contents-block">
      <div class="search">
        <input
          v-model="originalUrl"
          type="url"
          spellcheck="false"
          placeholder="ここにURLを入力"
          autocomplete="off"
          @keyup.enter="compress"
        /><button @click="compress">短縮</button>
        <div id="compress-result">
          <p v-if="compressResult && 'error' in compressResult" style="color: red">
            {{ compressResult.error }}
          </p>
          <template v-else-if="compressResult && 'compressUrl' in compressResult">
            <p class="result-title">{{ compressResult.message }}</p>
            <a class="result-compress" :href="compressResult.compressUrl">{{
              compressResult.compressUrl
            }}</a>
          </template>
        </div>
      </div>
    </div>
    <div class="contents-block">
      <div class="search search-decompress">
        <p class="contents-title">短縮したURLを解凍することも出来ます。</p>
        <input
          v-model="decompressInput"
          type="url"
          spellcheck="false"
          placeholder="ここに短縮したURLのIDを入力"
          autocomplete="off"
          @keyup.enter="decompress"
        /><button @click="decompress">解凍</button><br />
        <small>https://jli.li/rdNwqj の rdNwqj部分がIDです。</small>
        <div id="decompress-result">
          <p v-if="decompressResult && 'error' in decompressResult" style="color: red">
            {{ decompressResult.error }}
          </p>
          <p v-else-if="decompressResult && 'link' in decompressResult" class="result-compress">
            元URL: {{ decompressResult.link }}
          </p>
        </div>
      </div>
    </div>
    <div class="contents-block">
      <div class="about">
        <div class="about-title">
          <p><b>なぜURLを短縮するのですか？</b></p>
        </div>
        <div class="about-description">
          <p>
            SNSでURLを貼る時にURLが長いせいで文字数制限のせいで投稿できないといった経験はありませんか？
          </p>
          <p>そんな時に使えるのがURL短縮サービスです。</p>
          <p>以下のようにurlを短縮することが出来ます。</p>
          <p>https://www.thunlights.com/ → https://jli.li/rdNwqj</p>
          <p>これにより、文字数制限のあるSNSでの投稿の幅がより広がります。</p>
          <small>※元々短いURLに関しては元のURLの方が短くなる可能性があります。</small>
        </div>
      </div>
    </div>
    <div class="contents-block">
      <div class="about">
        <div class="about-title">
          <p><b>Q & A</b></p>
        </div>
        <div class="about-description">
          <b><p>Q.本当に安全ですか？</p></b>
          <p>本サイトはオープンソースです。 GitHubにて全てのコードを公開しています。</p>
          <p>詳しくは<a href="https://github.com/thunlights/jli">こちら</a>をご覧ください</p>
          <b><p>Q.作成したリンクは永久に機能しますか？</p></b>
          <p>はい。このサービスが終わらない限り永久に機能します。</p>
          <p>悪意のあるURLでない限り削除されることもありません</p>
          <b><p>Q.短縮URLの削除申請はどのようにしたらいいですか？</p></b>
          <p><a href="https://x.com/thunlights">公式Twitter</a>のDMにて可能です。</p>
          <p>リンク先が悪意のある場合にのみ削除対応可能です。</p>
        </div>
      </div>
    </div>
  </Layout>
</template>
