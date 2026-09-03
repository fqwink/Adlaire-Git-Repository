# 技術要件ポリシー

**位置づけ**: 2類責務別ポリシー
**責務**: 採用技術、ランタイム、依存関係、固定採用バージョン、技術承認
**ステータス**: Go 採用方針 / ヘッドレスアーキテクチャ・SDK 方針整合

---

## 1. 基本方針

開発言語、ランタイム、データベース、Git、外部コマンド、外部ライブラリ、フレームワーク、採用バージョン、固定バージョン、更新方針は、ユーザーが決定する。

エージェントは候補提示、比較、調査、リスク整理、推奨案の提示を行ってよい。ただし、ユーザー承認なしに採用決定、バージョン固定、方針確定、実装反映をしてはならない。

## 2. 採用技術方針

- Adlaire Git Repository 本体の標準開発言語は Go とする。
- Adlaire Git Repository 本体は Go single binary を正本成果物とする。
- Deno + TypeScript は、本リポジトリ本体の開発言語として終了方針とする。
- Adlaire Pipeline は、リリース基盤システムおよび自動実行基盤システムを担う機能として、Adlaire Git Repository 本体内部の CI/CD Domain に統合する方針とし、Go を採用方針とする。
- AdlaireGroup 関連プロジェクト、プロダクトでは、Deno + TypeScript と Go 単体の2系統を有効な開発言語選択肢として扱う。各プロジェクトは、成果物形式、運用要件、保守性、依存関係、セキュリティ要件に基づいて個別に選定する。
- Node.js ランタイムは採用禁止とする。
- Go single binary 形式を正本成果物とする。
- Docker は、Adlaire Git Repository 本体の直接標準運用選択肢ではなく、Adlaire Pipeline 経由で生成、管理、配布、利用する対象とする。
- libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として分離する。
- Adlaire Git Repository は、UI を差し替え可能にするため、ヘッドレスアーキテクチャ設計思想を採用する。UI は Adlaire Git Repository 本体に固定せず、本体は特定 UI に依存しない。HTML / CSS / Vanilla JavaScript で構成され、静的コンテンツ専用サーバー等で動作するフロントエンドや、モバイルアプリ等のクライアントを可能にする。UI、静的フロントエンド、モバイルアプリ、外部システムからの接続は、Adlaire 公式 SDK に一本化する。公開 API の直接利用は、SDK 未実装期間を含めて禁止する。
- Adlaire 公式 SDK は、Adlaire Git Repository 本体の機能ドメインではなく、本体から切り離した外部接続境界として扱う。SDK は TypeScript で実装し、Vanilla JavaScript から利用できる JavaScript を生成する方針とする。SDK は本体へ同梱せず独立リリース対象とする。SDK のリポジトリ分離は現時点では未定とし、当面は現行リポジトリ内の `sdk/` で管理する。SDK の生成方式は Deno runtime とする。SDK 配布方式は現行リポジトリで扱い、リポジトリ分離時は分離先リポジトリで扱う。SDK 固定採用バージョンと SDK リリース開始は、2類ポリシーとタスク管理ファイルに従う。SDK は Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` の禁止方針を緩和しない。
- Adlaire Git Repository 本体には、機能ドメインアーキテクチャ設計思想を適用する。現行の本体機能ドメインは、`Management Domain`、`Repository Domain`、`Collaboration Domain`、`CI/CD Domain`、`System / Data Foundation` とする。`Access Domain` は採用せず、認証、認可、ユーザー、権限、組織、チーム、管理系の責務は `Management Domain` に含める。
- フレームワークは、内製したもの以外の採用を禁止する。
- Go 標準ライブラリを優先する。
- Deno + TypeScript を採用する別プロジェクトでは、Deno 標準ライブラリ（`jsr:@std/*`）を優先する。ただし、Deno 標準ライブラリの個別モジュールを採用する場合も、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。
- Go module、JSR レジストリの公開ライブラリ、その他外部ライブラリは、必要最小限の外部ライブラリ例外採用として扱う。採用する場合は、ユーザー承認を得るまで採用禁止とする。
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
| Go | `v1.27.1` | 標準開発言語 |
| Deno | `v2.9.5` | 旧標準ランタイム。本体開発言語として終了方針。既存資産確認用 |
| TypeScript | `v6.0.3` | 旧標準言語。本体開発言語として終了方針。既存資産確認用 |
| SQLite | `v3.53.4` | 既存データ移行元確認用。互換維持・最小検証用として扱わない |
| libSQL | `libsql-server v0.24.32` | 標準データベース |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
上記にない技術、Go で利用する外部コマンド、Deno + TypeScript 旧資産確認に必要な Deno 標準ライブラリの個別モジュール、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

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

標準 libSQL driver は、Go runtime と Go 標準ライブラリを前提に libSQL server の HTTP/Hrana endpoint へ接続する内製 driver とする。Node.js runtime、npm ecosystem、FFI、native loader、platform-specific package を前提にする外部 libSQL client は標準採用しない。

## 3.2 レジストリ方針

外部依存は、採用言語に関係なく必要最小限とする。Go 採用方針では、以下の優先順位で検討する。

1. Go 標準ライブラリ
2. 内製実装
3. 承認済みの Go module
4. その他の外部依存

Deno + TypeScript を採用する別プロジェクトでは、以下の優先順位で検討する。

1. Deno 標準ライブラリ（`jsr:@std/*`）
2. 内製実装
3. 承認済みの非 npm 依存 JSR レジストリ package
4. その他の外部依存

Go 標準ライブラリおよび Deno 標準ライブラリ（`jsr:@std/*`）を優先する。ただし、個別モジュール、外部コマンド、外部ライブラリ、Go module の採用は自動承認ではない。採用する場合は、対象、固定バージョン、利用範囲、検証方法、ライセンス影響を整理し、ユーザー承認を得る。

JSR レジストリの公開 package は、Deno 標準ライブラリ（`jsr:@std/*`）を除き、必要最小限の外部ライブラリ例外採用として扱う。採用する場合は、ユーザー承認なしに採用してはならない。必要な parser 等を採用する場合も、3類マスター仕様書とタスク管理ファイルに利用範囲を反映する。

JSR レジストリの公開 package を採用する場合は、Node.js ランタイム環境が存在しない前提で、Deno runtime だけで動作することを必須条件とする。Node.js runtime、`node` command、`node:` built-in、`package.json`、`node_modules`、npm scripts、native Node addon を要求する JSR package は採用してはならない。

JSR レジストリの公開 package であっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。JSR で公開されていることは、npm 互換依存の採用許可を意味しない。

JSR へ公開する package は、公開可能なオープンソースコードであることを前提とする。クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package は、JSR へ公開しない。短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。

Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体の早期実装対象として扱う。初期実装では、Deno / TypeScript / ESM 前提の module 配布、package metadata、version 管理、checksum、認証・認可、監査ログ、Deno native import / download endpoint を対象候補とする。

Adlaire 内製 Deno Module Registry は、npm registry 互換レジストリではない。`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提にしてはならない。

npm registry 互換レジストリ、`npm:` specifier、`package.json` 前提運用、`node_modules` 前提運用は、Node.js / npm ecosystem リスクと衝突するため採用禁止とする。npm 依存は、標準採用、例外採用、開発補助、検証補助、ビルド補助のいずれとしても採用してはならない。

## 3.3 Binary / Docker 標準採用方針

Go single binary 形式を、本プロジェクトにおける正本成果物とする。

AdlaireGroup 共通方針では、プロジェクトごとに Go single binary または Deno single binary を選定できる。ただし、Adlaire Git Repository 本体と、同本体内部の CI/CD Domain として扱う Adlaire Pipeline は Go single binary 方針とする。

Docker は、Adlaire Git Repository 本体の直接標準運用選択肢ではなく、Adlaire Pipeline 経由で生成、管理、配布、利用する対象とする。Go single binary、起動管理定義は差し替え可能な system 側として扱う。

Go single binary 形式、Docker 形式のいずれでも、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を導入してはならない。

標準対象は、最低限以下とする。

- Go single binary
- host OS 上での Go single binary 直実行
- 1 VPS 上での system 側と host filesystem data 側の同居構成
- Go fmt / test / build
- Go single binary の Linux ARM64 build
- Go single binary の Linux x86_64 build
- Go single binary の release build

Go 実装移行時の方針ディレクトリ構成は以下とする。現時点では構成方針であり、ファイル作成またはソース実装の承認ではない。

```text
/
├── AGENTS.md
├── README.md
├── go.mod
├── main.go
├── internal/
├── sdk/
├── scripts/
├── tools/
└── docs/
```

`web/` は標準方針ディレクトリとして採用しない。フロントエンドは本体へ固定せず、SDK 経由で接続する静的フロントエンドまたは外部クライアントとして扱う。

Docker image、Dockerfile、`docker run`、`docker compose`、Docker container は、Adlaire Pipeline 経由で扱う対象とし、Adlaire Pipeline の仕様確定、実装、検証、ユーザー承認が完了するまで本体の直接標準運用対象にしない。

禁止対象には、最低限以下を含む。

- 本番サーバ上の Docker Desktop
- Docker named volume を標準の data 正本として扱うこと
- libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests を container lifecycle に依存させること
- Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を含む Docker image
- 外部 Docker デプロイフレームワーク

Docker Desktop は本番サーバ標準構成として採用しない。Docker image、Dockerfile、Docker Engine、Docker Compose、Docker 実行基盤を扱う場合は、Adlaire Pipeline 経由の対象として別途仕様化し、ユーザー承認を得る。

検証、テスト、ビルド、Go single binary 生成は、ホストOS上の固定採用バージョン Go で実行する。Docker を用いる検証、テスト、ビルド、image 生成は、Adlaire Pipeline 経由の対象として扱う。

本番とデプロイは、Go single binary 正本成果物、host filesystem data 領域、事前バックアップ、health check、rollback 手順を基本構成とする。Docker image を扱う場合は Adlaire Pipeline 経由とする。デプロイ、検証、バックアップ、ロールバックの詳細は `docs/policies/DEPLOYMENT_POLICY.md` を正本とする。

system 側と data 側を分離する。Go single binary、起動管理定義は差し替え可能な system 側とし、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として扱う。Docker を扱う場合も、data 側を Docker named volume へ丸投げしてはならない。

標準アプリケーション設定では、`ADLAIRE_APP_ROOT` から `ADLAIRE_SHARED_DIR` と `ADLAIRE_DATA_DIR` を導き、アプリケーションの標準 `DB_URL` は `http://127.0.0.1:8081` の libSQL server endpoint とする。libSQL database の保護対象ファイルは `shared/data/database/adlaire.libsql`、Git bare repositories は `shared/data/repositories` に配置する。

## 4. データベース方針

標準採用するデータベースエンジンは libSQL とする。

標準データベースは libSQL とする。

SQLite は既存データの移行元確認用としてのみ扱う。SQLite 互換維持、SQLite 最小ローカル検証用運用、SQLite 標準DB運用は行わない。

SQLite または libSQL を直接触る設計は禁止する。アプリケーションコードは、必ず Database Gateway と専用 driver 層を経由して永続化処理を行う。

標準 driver は `DB_DRIVER=libsql` とする。`DB_DRIVER=sqlite` は標準運用、互換維持、最小ローカル検証用として扱わず、既存データ移行確認が必要な場合に限って別途承認を得て扱う。実装上も通常運用では `DB_DRIVER=sqlite` を拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ許可する。クラウドDBホスティングを採用するかどうかは未定とする。採用する場合は、libSQL の接続先または運用形態の候補として扱い、ユーザー承認を得る。

---

## 5. 標準運用基盤方針

Adlaire Git Repository 本体の標準運用基盤は、self-host、VPS、専用サーバーを前提とする。

最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を host filesystem 基準で直接確認できることを、本体運用基盤の前提条件とする。

Deno Deploy 環境対応は白紙とし、標準採用、将来候補、参考互換対象として扱わない。再検討する場合は、方針変更として1類ルールブック、2類ポリシー、3類マスター仕様書、タスク管理ファイルを改訂し、ユーザー承認を得る。

Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。検討する場合は、3類マスター仕様書とタスク管理ファイルへ採用理由、対象範囲、対象外、リスク、検証範囲を反映し、ユーザー承認を得る。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。
