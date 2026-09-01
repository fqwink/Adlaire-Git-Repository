# 技術要件ポリシー

**位置づけ**: 2類責務別ポリシー
**責務**: 採用技術、ランタイム、依存関係、固定採用バージョン、技術承認
**ステータス**: JSR Deno runtime 前提方針整合

---

## 1. 基本方針

開発言語、ランタイム、データベース、Git、外部コマンド、外部ライブラリ、フレームワーク、採用バージョン、固定バージョン、更新方針は、ユーザーが決定する。

エージェントは候補提示、比較、調査、リスク整理、推奨案の提示を行ってよい。ただし、ユーザー承認なしに採用決定、バージョン固定、方針確定、実装反映をしてはならない。

## 2. 採用技術方針

- 標準ランタイムは Deno とする。
- 標準言語は TypeScript とする。
- TypeScript は 6系の最新安定版を採用方針とする。
- Node.js ランタイムは採用禁止とする。
- Deno single binary 形式を正本成果物とする。
- Docker は、正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つとする。
- Docker 使用時も非 Docker の binary 直実行時も、同じ system / data 分離構成にする。
- libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として分離する。
- フレームワークは、内製したもの以外の採用を禁止する。
- 標準採用は Deno 標準ライブラリ（`jsr:@std/*`）に限定する。ただし、Deno 標準ライブラリの個別モジュールを採用する場合も、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。
- JSR レジストリの公開ライブラリは、Deno 標準ライブラリ（`jsr:@std/*`）を除き、必要最小限の外部ライブラリ例外採用として扱う。採用する場合は、ユーザー承認を得るまで採用禁止とする。
- JSR レジストリの公開ライブラリを採用する場合は、Node.js ランタイム環境が存在しない前提で、Deno runtime だけで動作することを必須条件とする。
- JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは例外なく採用禁止とする。
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
| SQLite | `v3.53.4` | 既存データ移行元確認用。互換維持・最小検証用として扱わない |
| libSQL | `libsql-server v0.24.32` | 標準データベース |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

### 3.1 承認済み例外外部依存

Adlaire Git Repository の標準DBは libSQL とし、libSQL は必要最小限の外部依存例外として扱う。

| 項目 | 内容 |
|---|---|
| 対象 | libSQL server / libSQL database |
| 固定バージョン | `libsql-server v0.24.32` |
| 利用範囲 | Database Gateway と内製 `libsql` driver 境界 |
| 採用理由 | 標準DBを libSQL に統一し、DBアクセスを専用境界へ集約するため |
| 禁止事項 | npm 互換 package、`npm:` specifier、Node.js runtime、`package.json`、`node_modules`、npm ecosystem、Repository 層より上位への外部API露出 |

この例外は、libSQL を標準DBとして扱うための最小限の外部依存例外である。npm 互換 package、`npm:` specifier、Node.js runtime、npm registry 互換レジストリ、`package.json`、`node_modules`、npm ecosystem の採用を承認するものではない。

libSQL に接続する実装は、内製 `LibsqlDriver` と Database Gateway の内部に閉じ込める。HTTP handler、Service 層、Repository 層、Git 操作処理、Web UI から外部 libSQL API を直接 import または利用してはならない。

`@libsql/client` 等の npm 互換 libSQL client は採用禁止とする。既存実装または設定に npm 由来の libSQL client、`npm:` import、npm 由来の `deno.lock` 解決結果、FFI / native loader 前提の権限が残る場合は、現行方針へ反する是正対象として扱い、別途承認を得て撤去または置換する。

FFI または native loader を前提にする外部 libSQL client は標準採用しない。`--allow-ffi`、`--allow-sys`、native binary loader、platform-specific package を必要とする場合は、npm 依存を含まないこと、Deno single binary / Docker 運用と整合すること、最小権限であることを提示し、別途ユーザー承認を得る。

## 3.2 レジストリ方針

Deno ランタイムにおける外部依存は、以下の優先順位で検討する。

1. Deno 標準ライブラリ（`jsr:@std/*`）
2. 内製実装
3. 承認済みの非 npm 依存 JSR レジストリ package
4. その他の外部依存

Deno 標準ライブラリ（`jsr:@std/*`）は標準採用の唯一の外部 module 群である。ただし、個別モジュールの採用は自動承認ではない。採用する場合は、対象モジュール、固定バージョン、利用範囲、検証方法、ライセンス影響を整理し、ユーザー承認を得る。

JSR レジストリの公開 package は、Deno 標準ライブラリ（`jsr:@std/*`）を除き、必要最小限の外部ライブラリ例外採用として扱う。採用する場合は、ユーザー承認なしに採用してはならない。必要な parser 等を採用する場合も、3類マスター仕様書とマスター開発計画に利用範囲を反映する。

JSR レジストリの公開 package を採用する場合は、Node.js ランタイム環境が存在しない前提で、Deno runtime だけで動作することを必須条件とする。Node.js runtime、`node` command、`node:` built-in、`package.json`、`node_modules`、npm scripts、native Node addon を要求する JSR package は採用してはならない。

JSR レジストリの公開 package であっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。JSR で公開されていることは、npm 互換依存の採用許可を意味しない。

JSR へ公開する package は、公開可能なオープンソースコードであることを前提とする。クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package は、JSR へ公開しない。短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。

Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体の早期実装対象として扱う。初期実装では、Deno / TypeScript / ESM 前提の module 配布、package metadata、version 管理、checksum、認証・認可、監査ログ、Deno native import / download endpoint を対象候補とする。

Adlaire 内製 Deno Module Registry は、npm registry 互換レジストリではない。`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提にしてはならない。

npm registry 互換レジストリ、`npm:` specifier、`package.json` 前提運用、`node_modules` 前提運用は、Node.js / npm ecosystem リスクと衝突するため採用禁止とする。npm 依存は、標準採用、例外採用、開発補助、検証補助、ビルド補助のいずれとしても採用してはならない。

## 3.3 Binary / Docker 標準採用方針

Deno single binary 形式を、本プロジェクトおよび AdlaireGroup 共通方針における正本成果物とする。

Docker は正本成果物ではなく、Deno single binary を Docker image に同梱して実行する運用選択肢の一つである。

Docker を使用する場合も、Docker を使用せず Deno single binary を host OS 上で直接実行する場合も、同じ system / data 分離構成にする。Deno single binary、Docker image、container、起動管理定義は差し替え可能な system 側として扱う。

Deno single binary 形式、Docker 形式のいずれでも、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を導入してはならない。

標準対象は、最低限以下とする。

- Deno single binary
- host OS 上での Deno single binary 直実行
- `docker run`
- `docker compose`
- Dockerfile
- Docker image
- Docker container
- Deno single binary を含む Docker image
- 1 VPS 上での system 側と host filesystem data 側の同居構成
- 固定 Deno Docker image による `deno task fmt`
- 固定 Deno Docker image による `deno task lint`
- 固定 Deno Docker image による `deno task test`
- 固定 Deno Docker image による `deno task compile`
- 固定 Deno Docker image による `deno task compile:linux-arm64`
- 固定 Deno Docker image による `deno task compile:linux-x86_64`
- 固定 Deno Docker image による `deno task compile:release`

検証・ビルド用の標準 Docker image は `denoland/deno:2.9.5` とする。本番用 Docker image は、承認済み Deno single binary を同梱する最小 image とし、実行時に Node.js / npm ecosystem を含めてはならない。

禁止対象には、最低限以下を含む。

- 本番サーバ上の Docker Desktop
- Docker named volume を標準の data 正本として扱うこと
- libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests を container lifecycle に依存させること
- Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を含む Docker image
- 外部 Docker デプロイフレームワーク

Docker Desktop は本番サーバ標準構成として採用しない。Docker 運用を選択する場合、本番サーバでは Docker Engine と Docker Compose または同等の Docker 実行基盤を用いる。

検証、テスト、ビルド、Deno single binary 生成は、ホストOS上の固定採用バージョン Deno、または承認済み固定 Deno Docker image のいずれかで実行できる。

本番とデプロイは、Deno single binary 正本成果物、必要に応じた Docker image、host filesystem data 領域、事前バックアップ、health check、rollback 手順を基本構成とする。デプロイ、検証、バックアップ、ロールバックの詳細は `docs/policies/DEPLOYMENT_POLICY.md` を正本とする。

system 側と data 側を分離する。Deno single binary、Docker image、container、起動管理定義は差し替え可能な system 側とし、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として扱う。Docker 運用を選択する場合、data 側は原則として host bind mount で container へ接続し、Docker named volume へ丸投げしてはならない。

標準アプリケーション設定では、`ADLAIRE_APP_ROOT` から `ADLAIRE_SHARED_DIR` と `ADLAIRE_DATA_DIR` を導き、libSQL database は `shared/data/database/adlaire.libsql`、Git bare repositories は `shared/data/repositories` に配置する。Docker 使用時も binary 直実行時も、この data 側パスを共通化する。

## 4. データベース方針

標準採用するデータベースエンジンは libSQL とする。

標準データベースは libSQL とする。

SQLite は既存データの移行元確認用としてのみ扱う。SQLite 互換維持、SQLite 最小ローカル検証用運用、SQLite 標準DB運用は行わない。

SQLite または libSQL を直接触る設計は禁止する。アプリケーションコードは、必ず Database Gateway と専用 driver 層を経由して永続化処理を行う。

標準 driver は `DB_DRIVER=libsql` とする。`DB_DRIVER=sqlite` は標準運用、互換維持、最小ローカル検証用として扱わず、既存データ移行確認が必要な場合に限って別途承認を得て扱う。実装上も通常運用では `DB_DRIVER=sqlite` を拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ許可する。クラウドDBホスティングを採用するかどうかは未定とする。採用する場合は、libSQL の接続先または運用形態の候補として扱い、ユーザー承認を得る。

---

## 5. 標準運用基盤方針

Adlaire Git Repository 本体の標準運用基盤は、self-host、VPS、専用サーバーを前提とする。

最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。Docker 使用時も非 Docker の binary 直実行時も、Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を host filesystem 基準で直接確認できることを、本体運用基盤の前提条件とする。

Deno Deploy 環境対応は白紙とし、標準採用、将来候補、参考互換対象として扱わない。再検討する場合は、方針変更として1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画を改訂し、ユーザー承認を得る。

Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。検討する場合は、3類マスター仕様書とマスター開発計画へ採用理由、対象範囲、対象外、リスク、検証範囲を反映し、ユーザー承認を得る。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。
