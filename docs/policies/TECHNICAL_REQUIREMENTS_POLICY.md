# 技術要件ポリシー

**位置づけ**: 2類責務別ポリシー
**責務**: 採用技術、ランタイム、依存関係、固定採用バージョン、技術承認
**ステータス**: 初期策定

---

## 1. 基本方針

開発言語、ランタイム、データベース、Git、外部コマンド、外部ライブラリ、フレームワーク、採用バージョン、固定バージョン、更新方針は、ユーザーが決定する。

エージェントは候補提示、比較、調査、リスク整理、推奨案の提示を行ってよい。ただし、ユーザー承認なしに採用決定、バージョン固定、方針確定、実装反映をしてはならない。

## 2. 採用技術方針

- 標準ランタイムは Deno とする。
- 標準言語は TypeScript とする。
- TypeScript は 6系の最新安定版を採用方針とする。
- Node.js ランタイムは採用禁止とする。
- Docker は、開発、検証、本番、デプロイ、調査、一時確認、補助用途を含む全用途で例外なく採用禁止とする。
- フレームワークは、内製したもの以外の採用を禁止する。
- Deno 標準ライブラリを最優先候補とする。ただし、Deno 標準ライブラリの個別モジュールを採用する場合も、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。
- JSR レジストリの公開ライブラリは採用可能とする。ただし、ユーザー承認を得るまで採用禁止とする。
- JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。
- JSR は公開可能なオープンソース package の公開候補に限る。クローズドライセンス、内部専用、非公開資産は JSR へ公開しない。
- npm registry 互換レジストリは、Node.js / npm ecosystem リスクと衝突するため標準採用しない。
- クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する方針とする。
- 外部ライブラリは必要最小限とし、採用する場合は例外採用としてユーザー承認を得る。
- 例外採用した外部ライブラリは、内製ラッパー、内製 driver、または内製 Gateway の内部に閉じ込める。

## 3. 承認済み固定採用バージョン

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | Phase 1 標準データベース |
| libSQL | `libsql-server v0.24.32` | 将来移行候補。Phase 1 の実装対象外 |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

## 3.1 レジストリ方針

Deno ランタイムにおける外部依存は、以下の優先順位で検討する。

1. Deno 標準ライブラリ
2. 内製実装
3. 承認済みの JSR レジストリ package
4. その他の外部依存

Deno 標準ライブラリは最優先候補である。ただし、個別モジュールの採用は自動承認ではない。採用する場合は、対象モジュール、固定バージョン、利用範囲、検証方法、ライセンス影響を整理し、ユーザー承認を得る。

JSR レジストリの公開 package は採用可能であり、Deno / TypeScript / ESM と相性がよい。ただし、ユーザー承認なしに採用してはならない。JSR package を採用する場合は、必要最小限の例外採用として扱い、3類マスター仕様書とマスター開発計画に利用範囲を反映する。

JSR レジストリの公開 package であっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。JSR で公開されていることは、npm 互換依存の採用許可を意味しない。

JSR へ公開する package は、公開可能なオープンソースコードであることを前提とする。クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package は、JSR へ公開しない。短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。

Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体の早期実装対象として扱う。初期実装では、Deno / TypeScript / ESM 前提の module 配布、package metadata、version 管理、checksum、認証・認可、監査ログ、Deno native import / download endpoint を対象候補とする。

Adlaire 内製 Deno Module Registry は、npm registry 互換レジストリではない。`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提にしてはならない。

npm registry 互換レジストリ、`npm:` specifier、`package.json` 前提運用、`node_modules` 前提運用は、Node.js / npm ecosystem リスクと衝突するため標準採用しない。採用検討が必要な場合は、例外採用ではなく方針変更候補として扱い、1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画を改訂し、ユーザー承認を得る。

## 3.2 Docker 採用禁止方針

Docker は、本プロジェクトおよび AdlaireGroup 共通方針として採用禁止とする。

この禁止は、開発環境、検証環境、本番環境、デプロイ、調査、一時確認、補助用途、CI補助、ローカル再現環境、外部ツール実行を含む全用途へ適用する。

禁止対象には、最低限以下を含む。

- Docker Desktop
- Docker Engine
- Docker Compose
- Dockerfile
- docker-compose.yml / docker-compose.yaml / compose.yaml
- Docker image
- Docker container
- Docker volume
- Docker registry
- `docker build`
- `docker run`
- `docker compose`
- `docker pull`
- `docker push`

Docker 採用禁止は例外なしとする。個別承認による例外採用、補助用途としての一時利用、検証だけの利用、他プロジェクトの慣習を理由にした利用を認めない。

開発と検証は、ホストOS上に固定採用バージョンの Deno、Git、SQLite を導入し、Deno task、内製検証スクリプト、必要最小限の外部コマンドで実行する。

本番とデプロイは、Deno single binary、ホストOSのファイルシステム、systemd または同等のサービス管理、release directory、`current` symlink、事前バックアップ、health check、rollback 手順を基本構成とする。

Docker に依存する成果物、手順、検証、仕様、計画、テンプレートを追加してはならない。既存の Docker 参照を発見した場合は、技術要件ポリシー違反として整理し、ホストOS実行またはDeno single binary運用へ置き換える。

## 4. データベース方針

採用対象のデータベースエンジンは SQLite と libSQL のみに限定する。

Phase 1 は SQLite を標準データベースとして進める。libSQL は SQLite からの将来移行候補として保持する。

SQLite を直接触る設計は、将来の libSQL 移行計画の弊害になるため禁止する。アプリケーションコードは、必ず Database Gateway と専用 driver 層を経由して永続化処理を行う。

クラウドDBホスティングを採用するかどうかは未定とする。採用する場合は、libSQL の接続先または運用形態の候補として扱い、ユーザー承認を得る。

---

## 5. 標準運用基盤方針

Adlaire Git Repository 本体の標準運用基盤は、self-host、VPS、専用サーバーを前提とする。

Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を直接管理できることを、本体運用基盤の前提条件とする。

Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。検討する場合は、3類マスター仕様書とマスター開発計画へ採用理由、対象範囲、対象外、リスク、検証範囲を反映し、ユーザー承認を得る。

Deno Deploy を採用候補にする場合も、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を前提にしてはならない。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。
