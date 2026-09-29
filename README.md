# JLI Project

https://jli.li のリポジトリです。

## 何故JLIという名前なんですか？

ドメインにした時jli.liという文字列が短く見えていいなと思ってドメインを取りました。

なので具体的な意味はありません

## 何故オープンソース？

Team ThunLightsにはRustが得意なプログラマーが居ないためもしコードに間違いなどあれば、Pull Requestをしてほしいからです。

またTeam ThunLightsは現在進行形でRustが得意なプログラマーを募集中です。

詳しくは[こちら](https://github.com/ThunLights#%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC%E5%8B%9F%E9%9B%86)をご覧ください

## 構成

Bun workspaces + Turborepo によるモノレポで、Cloudflare Workers 2本 + Neon(Postgres, Hyperdrive経由・Drizzle ORM)を構成しています。

- `packages/db/`: Drizzle スキーマ・DBクライアント(両Workerから共有)
- `worker-short-link/`: 短縮リンク発行API・フロントサイト (`short-link.ro80t.com`)
- `worker-shortener-domain/`: 短縮リンクのリダイレクト専用 (`jli.li`)

## セットアップ方法

### 1. Neon(Postgres)のデータベースを作成し、`packages/db/drizzle/0000_shocking_fixer.sql` を実行する

スキーマを変更した場合は `packages/db` で `bun run generate` すると新しいマイグレーションSQLが生成されます。

### 2. Cloudflareダッシュボードで、そのNeonの接続文字列を使ってHyperdriveを1つ作成する

### 3. 発行されたHyperdriveのIDを、両方の `wrangler.toml` の `[[hyperdrive]] id` に設定する

### 4. 依存関係をインストールする

```console
bun install
```

### 5. デプロイする(Turboが両Workerを実行)

```console
bun run deploy
```

### 6. Cloudflareダッシュボードで `short-link.ro80t.com` と `jli.li` のルートを各Workerに割り当てる

## 更新一覧

バージョン一覧を書いておきます。

### Version 1.0

リリース: 2024/10/06

色々苦戦しつつも何とかリリース

HTMLが一部完成してないので早いうちに改善したい
