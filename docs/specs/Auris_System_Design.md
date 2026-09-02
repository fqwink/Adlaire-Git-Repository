# Auris システム設計マスター仕様書

**位置づけ**: 3類マスター仕様書の最上位
**対象**: Auris / Adlaire Git Repository 全体
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**文書バージョン**: v.2.18
**ステータス**: GitHub Releases リリース配置一本化方針整合

---

## 1. 目的

本書は、Auris / Adlaire Git Repository 全体の最上位マスター仕様書である。

本プロジェクトの機能範囲、技術方針、セキュリティ方針、実装フェーズ、運用方針は、本書を基準として判断する。

本書における「マスター仕様完成」とは、現行方針として採用済みの仕様、保留中の仕様、対象外の仕様、過去フェーズの履歴を分離し、実装判断に必要な正本仕様を本書と個別3類マスター仕様書から追跡できる状態を指す。

Phase 7 の初回安定版リリース `v.1.8` は履歴として保持する。Phase 8 以降の現行仕様判断では、本書の現在仕様、個別3類マスター仕様書、マスター開発計画、2類ポリシーを正本として扱う。

---

## 2. 上位ドキュメントとの関係

本書は3類マスター仕様書であり、1類ルールブックである `AGENTS.md` および2類ドキュメント群に従う。

2類ドキュメント群の総則は `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` とする。ドキュメント体系、責務境界、開発計画の扱いは `docs/policies/DOCUMENT_CHARTER.md` に従い、技術要件、バージョン、リリース、デプロイ、テスト、ライセンスの詳細方針は `docs/policies/` 配下の責務別ポリシーに従う。

フェーズ単位の実装計画、フェーズ別バージョン、実装対象、対象外、検証範囲、完了条件は、マスター開発計画である `docs/plans/DEVELOPMENT_PLAN.md` で管理する。

実装機能候補、優先実装候補、保留候補、候補選定基準は、マスター実装機能候補リストである `docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` で管理する。ただし、同ファイルは候補整理であり、実装承認ではない。候補を実装対象へ確定する場合は、本書、個別3類マスター仕様書、マスター開発計画へ反映し、ユーザー承認を得る。

候補リストは、機能候補と選定理由を管理する。正式仕様、実装対象、対象外、Phase 割り当て、完了条件、検証範囲は、本書、個別3類マスター仕様書、マスター開発計画で管理する。

矛盾がある場合は、以下の順に優先する。

1. `AGENTS.md`
2. 2類ドキュメント群
3. 本書
4. 個別マスター仕様書
5. `docs/plans/DEVELOPMENT_PLAN.md`
6. `docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md`

---

## 3. システム概要

Adlaire Git Repository は、Adlaire Group 内部向けのセルフホスト型 Git ホスティング基盤である。

基本的な機能互換は GitHub 互換基準とする。

GitHub 互換とは、Repository、Issue、Pull Request、Code Review、Wiki、Release、Webhook、REST API、Personal Access Token、Organization / Team、Projects、Discussions 等の機能体系、用語、主要ワークフローについて、GitHub 利用経験を前提に理解・移行しやすい振る舞いを目指すことを指す。

ただし、UI、画面デザイン、画面レイアウト、視覚表現は GitHub 互換の対象外とする。UI は本プロジェクト独自の設計とし、GitHub の画面、デザイン、ブランド表現、商標表現を模倣しない。

GitHub 互換は本書および個別3類マスター仕様書に定義された範囲に限る。GitHub の全機能、外部サービス依存、商標・ブランド表現、GitHub 固有サービスへの直接依存を無条件に採用してはならない。現時点で不要な機能は、GitHub に存在する機能であっても実装対象から除外する。

オープンソースの Git プロバイダーやセルフホスト型 Git ホスティング製品は、サブの機能互換インスパイア対象として扱う。ただし、これらは主たる互換基準ではない。Gitea、Forgejo、GitLab、GitPrep 等の機能、画面、API、運用モデルをそのまま互換対象として扱わず、本プロジェクトの仕様として再定義したうえで、現時点で必要な機能かどうかを判断する。

主な提供範囲は以下とする。

- Git リポジトリ管理
- Git clone / push / pull / fetch
- ユーザー登録、ログイン、認証、認可
- SSH 公開鍵管理
- HTTP Basic 認証
- Personal Access Token 管理
- Web UI によるリポジトリ閲覧と管理
- README、Wiki、Issue、Pull Request などの開発支援機能
- 操作ログと監査ログ
- バックアップとリリース運用

---

## 4. 技術方針

| 領域 | 方針 |
|---|---|
| ランタイム | Deno |
| 言語 | TypeScript |
| HTTP | `Deno.serve` |
| データベース | libSQL |
| Git 操作 | `Deno.Command` |
| フロントエンド | HTML / CSS / Vanilla JavaScript |
| 配布 | Deno single binary |

Node.js ランタイムは採用しない。

外部フレームワークは採用しない。外部ライブラリが必要な場合は、例外採用としてユーザー承認を得る。ただし、npm 互換 package、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem を伴う外部ライブラリは例外なく採用しない。

標準採用は Deno 標準ライブラリ（`jsr:@std/*`）に限定する。ただし、個別モジュールの採用は自動承認ではなく、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。

JSR レジストリの公開ライブラリは、Deno 標準ライブラリ（`jsr:@std/*`）を除き、必要最小限の外部ライブラリ例外採用として扱う。採用する場合は、ユーザー承認を得るまで採用してはならない。JSR レジストリの公開ライブラリを採用する場合は、Node.js ランタイム環境が存在しない前提で、Deno runtime だけで動作することを必須条件とする。JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは例外なく採用禁止とする。JSR へ公開する package は公開可能なオープンソースコードであることを前提とし、クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する方針とする。

npm registry 互換レジストリは、Node.js / npm ecosystem リスクと衝突するため標準採用しない。

例外採用した外部ライブラリは、内製ラッパー、内製driver、または内製Gatewayの内部に閉じ込める。外部ライブラリのAPIをアプリケーション上位層へ直接露出させず、設計上は内製化された境界を通して利用する。

採用バージョンは、各技術の最新の安定版を基本方針とする。Deno、libSQL、既存データ移行元確認用 SQLite、Git、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリは、採用または更新の時点で公式情報を確認し、最新の安定版を採用候補とする。TypeScript は 6系の最新安定版を採用方針とする。

Deno single binary 形式を正本成果物とする。Docker は正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つである。Docker 使用時も非 Docker の binary 直実行時も、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として system 側から分離する。

承認済み固定採用バージョンは以下とする。

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | 既存データ移行元確認用。互換維持・最小検証用として扱わない |
| libSQL | `libsql-server v0.24.32` | 標準データベース |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

### 4.1 データベース方針

標準採用するデータベースエンジンは libSQL とする。

libSQL は本プロジェクトの唯一の標準DBとして完全確定する。DB 使用なし案、PostgreSQL、Key-value DB、SQLite 標準運用、その他のデータベースエンジンは、現行正本仕様における採用候補として扱わない。

SQLite は既存データ移行元確認用としてのみ扱う。

標準データベースは libSQL とする。

SQLite 互換維持、SQLite 最小ローカル検証用運用、SQLite 標準DB運用は行わない。

libSQL は、移行容易性、将来の同期・分散構成への拡張余地という採用メリットが高いため、標準データベースとして扱う。

libSQL driver は Phase 8 の承認済み実装対象とする。libSQL は必要最小限の外部依存例外として扱うが、npm 互換 package を使わず、内製 `libsql` driver と Database Gateway の内部に閉じ込める。

`@libsql/client` 等の npm 互換 libSQL client は撤去済みとし、再導入してはならない。libSQL 採用は維持し、Node.js runtime が存在しない前提で Deno runtime だけで動作する内製 HTTP/Hrana driver 経路へ集約する。

`@libsql/client` 等の npm 互換 libSQL client は採用禁止とする。既存実装または設定に npm 由来の libSQL client、`npm:` import、npm 由来の `deno.lock` 解決結果、FFI / native loader 前提の権限が残る場合は、現行方針へ反する是正対象として扱い、撤去または置換する。

libSQL client / driver は、Node.js runtime、npm ecosystem、`package.json`、`node_modules` が存在しない前提で、Deno runtime だけで動作することを必須条件とする。標準 driver は、Deno `fetch` による内製 HTTP/Hrana driver とする。

Turso 公式の `@tursodatabase/serverless/compat` および `@tursodatabase/serverless` は、`fetch` のみで動作する libSQL over HTTP 系 client 候補として調査対象にできる。ただし、npm package としての取得経路、Deno runtime only 条件、固定バージョン、権限、self-host / VPS 上の libSQL server 接続可否を確認し、別途ユーザー承認を得るまで採用確定または実装反映してはならない。

Turso Cloud 等の libSQL 系クラウドDBホスティングを採用するかどうかは未定とする。クラウドDBホスティングはデータベースエンジンの追加採用ではなく、libSQL の接続先または運用形態の候補として扱う。検討する場合は、標準運用方針、クローズドライセンス、データ管理責任、認証情報管理、運用コスト、障害時の復旧方針を3類マスター仕様書に追記してから判断する。

libSQL を標準にするため、データベースアクセスは専用層に集約し、アプリケーション各所から直接 driver 固有処理へ依存しない設計とする。

### 4.2 データベース抽象化方針

SQLite または libSQL を直接触る設計は禁止する。

アプリケーションコードは、必ずデータベースアクセス専用層を経由して永続化処理を行う。UI、HTTP ハンドラー、認証処理、Git 操作処理、ドメインサービスから SQLite または libSQL 接続、SQL 実行、トランザクション制御、migration 実行を直接呼び出してはならない。

データベースアクセス専用層は、以下の責務を持つ。

- 接続生成と接続設定の管理
- SQL 実行の集約
- トランザクション境界の管理
- schema と migration の適用
- libSQL 前提の schema と query 方針
- 既存データ移行元確認が必要な場合の SQLite 取扱境界

標準 driver は `DB_DRIVER=libsql` とする。`DB_DRIVER=sqlite` は標準運用、互換維持、最小ローカル検証用として扱わず、既存データ移行元確認が必要な場合に限って別途承認を得て扱う。実装上も通常運用では `DB_DRIVER=sqlite` を拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ許可する。

クラウドDBホスティングを採用する場合も、上位層からは libSQL driver の接続先差し替えとして扱い、`turso` 等のホスティングサービス名をアプリケーション上位層の依存名にしてはならない。

### 4.3 標準運用方針

Adlaire Git Repository 本体の標準運用方針は、self-host、VPS、専用サーバーを前提とする。

Git ホスティング本体は、Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を中核とする。そのため、標準実行基盤は、これらを直接管理しやすい self-host / VPS / 専用サーバーを基準にする。

本番サーバ環境へのデプロイは、Deno single binary 正本成果物、必要に応じた Docker image、host filesystem data 領域、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。詳細は `docs/policies/DEPLOYMENT_POLICY.md` を正本とする。

標準運用方式は、Deno single binary 直実行と Docker 実行の双方を標準化対象とする。ただし、正本成果物は Deno single binary であり、Docker は運用選択肢の一つである。最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。shell script + SSH は binary または Docker image 転送、起動定義更新、backup、再起動、検証の補助方式とし、`gh` と systemd timer は補助採用とする。リリース配置は GitHub Releases へ一本化する。GitHub Actions と外部デプロイフレームワークは保留、Node.js系は不採用とする。ローカルに Deno が存在しない場合、実行系検証は VPS、承認済み検証サーバ、または承認済み固定 Deno Docker image で行う。

Deno Deploy 環境対応は白紙とし、標準採用、将来候補、参考互換対象として扱わない。再検討する場合は、方針変更として1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画を改訂し、ユーザー承認を得る。

Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。採用を検討する場合は、補助API、管理機能、Webhook 受信、読み取り専用ミラー等の補助的用途を優先して評価し、Git repository 実体保存、Git 操作、永続ファイル、バックアップ、復旧、データ所在、認証情報管理、運用費用、Node.js / npm 非依存方針との整合を確認する。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱う。アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。

---

## 5. 個別マスター仕様書

| ドキュメント | 役割 |
|---|---|
| `docs/specs/Adlaire_Git_Repository_Specification.md` | Git ホスティング基盤本体の仕様 |

---

## 6. 現行正本仕様

現行正本仕様は以下とする。

- Adlaire Git Repository は、Adlaire Group 内部向けのセルフホスト型 Git ホスティング基盤である。
- 基本的な機能互換は GitHub 互換基準とする。
- UI、画面デザイン、画面レイアウト、視覚表現は GitHub 互換対象外とする。
- 標準ランタイムは Deno、標準言語は TypeScript とする。
- 標準データベースは libSQL とする。
- SQLite 互換維持は行わず、SQLite は既存データ移行元確認用としてのみ扱う。
- SQLite または libSQL を直接触る設計は禁止し、Database Gateway と driver 境界を経由する。
- Deno single binary を正本成果物とする。
- Docker は、正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つとする。
- Docker 使用時も非 Docker の binary 直実行時も、system 側と data 側を分離する。
- data 側は host filesystem を正本とし、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests を保護対象とする。
- 標準運用基盤は self-host、VPS、専用サーバーを前提とする。
- リリース配置は GitHub Releases へ一本化する。
- Deno Deploy 環境対応は白紙とし、標準採用、将来候補、参考互換対象として扱わない。
- Turso Cloud、その他 libSQL 系クラウドDBサービスは標準採用ではなく将来候補として保留する。
- Node.js runtime、npm ecosystem、npm 依存、外部フレームワーク、無承認外部ライブラリは採用しない。

## 6.1 リリース配置

リリース配置は GitHub Releases へ一本化する。

Deno single binary、release notes、checksum、manifest は GitHub Releases 側へ配置する。リポジトリ内に、変更履歴、リリース履歴、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を履歴ファイルとして保持してはならない。

GitHub Releases の作成、成果物配置、release notes 公開、tag 作成は、リリース提案を提示し、ユーザー承認を得てから実行する。

## 7. 完成判定

マスター仕様完成版は、以下を満たす必要がある。

- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、マスター実装機能候補リストの役割が分離されている。
- 現行仕様、過去フェーズ履歴、保留候補、対象外範囲が混在せず、判断基準を追跡できる。
- libSQL 標準DB方針、SQLite 互換維持なし方針、Database Gateway 境界が矛盾していない。
- Deno single binary 正本成果物方針、Docker 運用選択肢、system / data 分離方針が矛盾していない。
- GitHub 機能互換方針と UI 非互換方針が同時に明記されている。
- 保留機能は、ユーザー承認なしに実装対象へ戻らないように定義されている。
- マスター仕様完成はソースコード実装承認を意味しない。

---

## 8. 実装フェーズ

各フェーズの基準バージョン、対象外範囲、検証範囲、完了条件は `docs/plans/DEVELOPMENT_PLAN.md` をマスター開発計画として参照する。

フェーズ番号は累積方式とし、安定版リリース後もリセットしない。バージョンの `Major` は安定版リリース系列を表し、初回安定版リリース前は `0` を維持する。`Minor` はプロジェクト全体の累積変更番号として扱う。

### 8.1 Phase 1

基準バージョン: `v.0.2`

- Git 基本操作
- ユーザー登録とログイン
- 認証・認可
- リポジトリ作成、参照、更新、削除
- README 表示
- 最小 Web UI
- 操作ログ
- 基本テスト

### 8.2 Phase 2

基準バージョン: `v.0.3`

- Pull Request
- Code Review
- Issue
- Wiki
- Webhook
- Release 管理
- REST API 基本機能

### 8.3 Phase 3

基準バージョン: `v.0.4`

- Organizations 最小運用
- Teams 最小運用
- Projects 最小運用
- Adlaire 内製 Deno Module Registry 最小実装
- REST API 対象リソース拡張
- Webhook 対象イベント拡張
- 高度な監査ログ
- 運用自動化
- libSQL 標準化後の DB 方針整理

Discussions、Organizations / Teams 本格運用、Projects 本格運用、複数インスタンス本格運用は保留候補とし、保留解除とユーザー承認があるまで Phase 3 の実装対象へ含めない。

Phase 3 は最小運用として完了している。Team による repository 権限付与、Projects 本格運用、Registry の複数 module file / 依存解決 / 削除、libSQL driver 正式採用、クラウドDBホスティング採用は Phase 3 の対象外とする。

### 8.4 Phase 4

基準バージョン: `v.0.5`

- Phase 1 から Phase 3 までの統合
- 仕様整合
- バグ修正
- 移行準備
- 後続フェーズへ進むための検証整理

Phase 4 は完了している。

Phase 4 では、Phase 3 で追加した Organization 所有 repository の権限モデルを、Phase 1 と Phase 2 で実装済みの Issue、Pull Request、Code Review、Wiki、Webhook、Release へ統合した。

Repository 配下機能は、個別に owner 文字列を比較するのではなく、RepositoryAccess 境界を経由して Organization owner、Organization member、admin、public repository の参照可否を判定する。

SQLite は現行 driver として維持し、libSQL は将来移行候補として保持する。Phase 4 では libSQL driver、クラウドDBホスティング、その他データベースエンジンを採用しない。

### 8.5 Phase 5

基準バージョン: `v.0.6`

- デザイン関連の改良・改修方針整理
- Web UI 情報設計
- 画面レイアウト整理
- 視覚表現統一
- 操作導線改善
- アクセシビリティと可読性改善

Phase 5 のデザイン関連改良・改修は、GitHub UI 互換ではなく、本プロジェクト独自 UI として行う。外部フレームワークを採用してはならない。

Phase 5 では、トップページの Web UI を対象に、情報設計、画面レイアウト、視覚表現、操作導線、アクセシビリティ、可読性を改善する。既存 API と既存ドメイン機能は変更せず、ユーザー登録、API token 発行、Repository 作成、Repository 一覧更新の主要導線を維持する。

Phase 5 は安定版リリースフェーズとして扱わない。

### 8.6 Phase 6

基準バージョン: `v.0.7`

- 大規模なバグ修正
- ドキュメント整合性向上
- 移行準備
- ロールバック手順整理
- 検証強化
- Phase 7 安定版リリース判定への準備

Phase 6 は、大規模なバグ修正とドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズである。Phase 6 自体は安定版リリースフェーズとして扱わない。

Phase 6 では、database schema、Database Gateway、Repository 層、Service 層の責務境界を維持する。Phase 7 の安定版リリース判定へ進む前に、認証、権限、Git Smart HTTP、SQLite 外部キー、入力エラー応答、重複応答、Registry 一覧制御、HTTP Authorization scheme の大小文字処理、Webhook secret API 非露出、Team member の Organization member 境界等の既知バグ修正、ドキュメント整合性向上、移行・ロールバック前提整理、主要 workflow 検証を完了する。

すべてのフェーズでは、フェーズ完了前にドキュメント等の整合性向上を必ず行う。リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。

### 8.7 Phase 7

基準バージョン: `v.0.8`

- 7系フェーズのデフォルト安定版リリース判定
- リリースノート整理
- 最終リポジトリ整合性確認と整合性向上

Phase 7 を初回安定版リリースとして承認する場合は、安定版系列 `v.1.8` へ進める。安定版リリース判定条件を満たさない場合はリリースしてはならない。

### 8.8 Phase 8

基準バージョン: `v.1.9`

Phase 8 は DB 仕様完成フェーズである。

Phase 8 では、Adlaire Git Repository の標準データベースを libSQL として確定し、SQLite 互換維持を行わない現行正本仕様を実装可能な粒度へ整理する。

Phase 8 の実施対象は以下とする。

- libSQL 標準DB仕様の確定
- `DB_DRIVER=libsql` を標準 driver とする接続仕様
- `DB_URL` と `DB_AUTH_TOKEN` による接続先・認証情報の扱い
- npm 依存を含まない libSQL 外部依存例外と内製 libSQL driver 境界
- Database Gateway、Repository 層、driver 層の責務境界
- libSQL 前提の schema、migration、seed 管理方針
- 既存データ移行元確認用 SQLite の取扱境界
- DB backup、restore、rollback の責務境界
- DB 関連テストと検証導線の整理
- DB 方針に伴う3類マスター仕様書、2類ポリシー、マスター開発計画、README の整合性確認

Phase 8 の対象外は以下とする。

- SQLite 互換維持
- SQLite 標準DB運用
- SQLite 最小ローカル検証用運用
- `DB_DRIVER=sqlite` の標準運用化
- `DB_DRIVER=turso` 等のクラウドDBホスティング名を driver 名にすること
- Deno Deploy 環境対応
- Turso Cloud、その他クラウドDBホスティングの標準採用
- Database Gateway を経由しない DB 直接アクセス
- 承認なしの libSQL 外部ライブラリ導入、schema 変更、migration 実装

Phase 8 は安定版リリースフェーズとして扱わない。Phase 8 では例外なく安定版リリース方針を持たない。

### 8.8.1 Phase 8.1

基準バージョン: `v.1.9`

Phase 8.1 は本体整合性フェーズである。

Phase 8.1 では、Phase 8 の DB 仕様完成に合わせて、Adlaire Git Repository 本体の仕様、計画、実装、検証導線、README、Pull Request 説明の整合性を確認し、古い SQLite 標準運用、SQLite 互換維持、libSQL 将来候補扱いの表記を現行正本仕様へ合わせる。

Phase 8.1 の完了条件は以下とする。

- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、README の DB 方針が矛盾していない。
- 実装が Database Gateway、Repository 層、driver 層の境界に従っていることを説明できる。
- SQLite 互換維持を前提にした完了条件、検証条件、運用条件が残っていない。
- `DB_DRIVER=sqlite` が通常運用経路として使われず、承認済みの移行元確認用ゲートを通した場合のみ使われる。
- リポジトリ整合性確認を実施し、矛盾または古い表記を補正している。

### 8.8.5 Phase 8.5

基準バージョン: `v.1.9`

Phase 8.5 はシステム分割フェーズである。

Phase 8.5 では、Adlaire Git Repository 本体とデータ領域を分割する。Deno single binary、Docker image、container、compose、service、起動管理定義は差し替え可能な system 側として扱う。libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は保護対象 data 側として扱う。

Phase 8.5 の標準構成は、1 VPS 上に system 側と host filesystem data 側を同居させる最小構成とする。Docker 使用時も非 Docker の binary 直実行時も、data 側の正本は host filesystem とし、Docker named volume を data 正本として扱わない。

標準アプリケーション設定では、`ADLAIRE_APP_ROOT` から `ADLAIRE_SHARED_DIR` と `ADLAIRE_DATA_DIR` を導き、libSQL database は `shared/data/database/adlaire.libsql`、Git bare repositories は `shared/data/repositories` に配置する。

標準デプロイ雛形では、`system/releases` と `system/current` を system 側、`shared/config`、`shared/secrets`、`shared/logs`、`shared/backups`、`shared/manifests` を data 側として扱う。

Phase 8.5 の完了条件は以下とする。

- system 側と data 側の保存対象、責務、バックアップ対象を説明できる。
- Docker 運用と binary 直実行で同じ data 側構成を維持できる。
- data 側が container lifecycle に依存しない。
- deploy、backup、verify、rollback の対象と保護対象がデプロイポリシーと矛盾していない。

### 8.8.7 Phase 8.7

基準バージョン: `v.1.9`

Phase 8.7 は安定化フェーズである。

Phase 8.7 では、Phase 8、Phase 8.1、Phase 8.5 の成果を対象に、バグ修正、検証強化、ドキュメント整合性向上を行う。

Phase 8.7 の完了条件は以下とする。

- DB 標準化、Database Gateway 境界、system / data 分離に関する既知バグが残っていない。
- 意味のあるテストまたは代替検証により、主要 workflow と DB 永続化境界を説明できる。
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、README、実装、テスト、検証導線、バージョン表記、Pull Request 説明の整合性が確認されている。
- Phase 9 の安定版判定へ進むための既知制約、対象外、リスク、検証未完了項目を説明できる。

### 8.9 Phase 9

基準バージョン: `v.2.10`

Phase 9 は、Phase 8 系の成果を対象とする安定版判定フェーズである。

Phase 9 では、Phase 8 の libSQL 標準化、Phase 8.1 の本体整合性、Phase 8.5 の system / data 分離、Phase 8.7 の安定化が完了していることを前提に、安定版リリース可否を判定する。

Phase 9 の判定対象は以下とする。

- libSQL 標準DB運用
- SQLite 互換維持なし方針
- Database Gateway、Repository 層、driver 層の責務境界
- system / data 分離構成
- backup、restore、rollback の説明可能性
- 主要 workflow の検証結果
- 既知バグ、既知制約、対象外機能
- リリース成果物、配置先、検証方法、ロールバック前提
- リポジトリ全体の整合性

Phase 9 は安定版判定フェーズであり、自動的なリリース実行フェーズではない。安定版リリース対象にする場合は、リリース提案、検証範囲、成果物、配置先、自動実行範囲を提示し、別途ユーザー承認を得る。

Phase 9 の完了条件は以下とする。

- Phase 8 系の完了条件を満たしている。
- リリース禁止条件に該当しないことを説明できる。
- GitHub Releases をリリース履歴の正本とする方針に従っている。
- Deno single binary の成果物、必要な checksum、manifest、release notes の扱いを説明できる。
- ARM64 と x86_64 の Linux binary 成果物方針を説明できる。
- 安定版リリースを行う場合は、別途ユーザー承認を得ている。
- Phase 9 のバグ精査で追加の既知バグが確認されない、または確認されたバグが修正済みである。

### 8.10 Phase 10

基準バージョン: `v.2.10`

Phase 10 は、リリース配置を GitHub Releases へ一本化するための整合フェーズである。

Phase 10 では、Deno single binary、release notes、checksum、manifest の配置先を GitHub Releases に統一し、リポジトリ内にリリース履歴ファイル、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を保持しない方針を明確にする。

Phase 10 では、新しい内製デプロイメントシステム、GitHub Actions、外部デプロイフレームワーク、Container registry、Docker image 配布の正式化、Node.js / npm 前提ツールは対象外とする。

Phase 10 の完了条件は以下とする。

- リリース配置が GitHub Releases へ一本化されている。
- 3類マスター仕様書、2類リリースポリシー、2類デプロイポリシー、マスター開発計画、README の記述が矛盾していない。
- 標準デプロイ雛形 `scripts/deploy/` は、GitHub Releases に配置された Deno single binary を本番サーバへ反映する補助導線として説明できる。
- リポジトリ整合性確認と整合性向上を完了している。

---

## 9. セキュリティ方針

- 認証と認可を分離する。
- private リポジトリへのアクセスは必ず権限確認する。
- パスワード、トークン、秘密情報は平文保存しない。
- ユーザー入力は検証し、HTML 出力はエスケープまたはサニタイズする。
- Git 操作では shell 展開に依存しない。
- パストラバーサルを禁止する。
- 秘密情報をコミットしない。

---

## 10. リリース方針

正式リリース対象は安定版のみとする。

安定版リリースフェーズは、Phase 7、Phase 17、Phase 27 のような 7系フェーズをデフォルト方針とする。

Phase 5、Phase 15、Phase 25 のような 5系フェーズは、設計・デザイン改良、仕様整理のためのフェーズとし、安定版リリースフェーズとして扱わない。

Phase 6、Phase 16、Phase 26 のような 6系フェーズは、大規模なバグ修正とドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズとする。必要に応じて移行準備と検証強化も行う。6系フェーズ自体は安定版リリースフェーズとして扱わない。

Phase 9 は安定版判定フェーズとして扱う。Phase 19、Phase 29 のような後続9系フェーズは、補助的なリリース判定フェーズとして扱い、ケースバイケースで安定版リリースフェーズになる場合と、ならない場合がある。

リリースするには、以下を満たす必要がある。

- 7系フェーズである。または、Phase 9 または後続9系フェーズとして安定版リリース対象に明示承認されている。
- 3類マスター仕様書の対象範囲を満たしている。
- 主要検証が完了している。
- 既知バグが残っていない。
- セキュリティ要件を満たしている。
- バージョン表記が `v.{Major}.{Minor}` 形式である。

---

## 11. Git 運用方針

`main` への直接 push は禁止する。

すべての変更は作業ブランチから Pull Request を作成し、Pull Request 経由で `main` に取り込む。

Pull Request がマージされた作業ブランチは、自動的に閉じる方針とする。

---

## 12. 禁止事項

- Node.js ランタイムの採用
- 外部フレームワークの無承認採用
- 外部ライブラリの無承認採用
- 外部ライブラリAPIをアプリケーション上位層へ直接露出する設計
- `main` への直接 push
- 仕様書にない機能の独断実装
- 認証・認可を迂回する実装
- 秘密情報のコミット
