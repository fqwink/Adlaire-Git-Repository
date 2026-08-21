# Auris システム設計マスター仕様書

**位置づけ**: 3類マスター仕様書の最上位
**対象**: Auris / Adlaire Git Repository 全体
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**文書バージョン**: v.1.8
**ステータス**: Phase 7 初回安定版リリース

---

## 1. 目的

本書は、Auris / Adlaire Git Repository 全体の最上位マスター仕様書である。

本プロジェクトの機能範囲、技術方針、セキュリティ方針、実装フェーズ、運用方針は、本書を基準として判断する。

---

## 2. 上位ドキュメントとの関係

本書は3類マスター仕様書であり、1類ルールブックである `AGENTS.md` および2類ドキュメント群に従う。

2類ドキュメント群の総則は `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` とする。ドキュメント体系、責務境界、開発計画の扱いは `docs/policies/DOCUMENT_CHARTER.md` に従い、技術要件、バージョン、リリース、テスト、ライセンスの詳細方針は `docs/policies/` 配下の責務別ポリシーに従う。

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
| データベース | SQLite |
| Git 操作 | `Deno.Command` |
| フロントエンド | HTML / CSS / Vanilla JavaScript |
| 配布 | Deno single binary |

Node.js ランタイムは採用しない。

外部フレームワークは採用しない。外部ライブラリが必要な場合は、例外採用としてユーザー承認を得る。

Deno 標準ライブラリを最優先候補とする。ただし、個別モジュールの採用は自動承認ではなく、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。

JSR レジストリの公開ライブラリは採用可能とする。ただし、ユーザー承認を得るまで採用してはならない。JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。JSR へ公開する package は公開可能なオープンソースコードであることを前提とし、クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する方針とする。

npm registry 互換レジストリは、Node.js / npm ecosystem リスクと衝突するため標準採用しない。

例外採用した外部ライブラリは、内製ラッパー、内製driver、または内製Gatewayの内部に閉じ込める。外部ライブラリのAPIをアプリケーション上位層へ直接露出させず、設計上は内製化された境界を通して利用する。

採用バージョンは、各技術の最新の安定版を基本方針とする。Deno、SQLite、libSQL、Git、Docker、Docker Compose、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリは、採用または更新の時点で公式情報を確認し、最新の安定版を採用候補とする。TypeScript は 6系の最新安定版を採用方針とする。

承認済み固定採用バージョンは以下とする。

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | Phase 1 標準データベース |
| libSQL | `libsql-server v0.24.32` | 将来移行候補。Phase 1 の実装対象外 |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
| Docker Engine | `v29.7.2` | 開発・検証用コンテナ基盤 |
| Docker Compose | `v5.4.0` | 開発・検証用 compose |

上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

### 4.1 データベース方針

採用対象のデータベースエンジンは SQLite と libSQL のみに限定する。

SQLite と libSQL は、本プロジェクトで許容する必要最小限の外部依存とする。

Phase 1 は SQLite を標準データベースとして進める。

SQLite は、Phase 1 の標準データベースとして採用する必要最小限の外部依存である。

libSQL は、SQLite からの将来移行候補として扱う。libSQL の採用も必要最小限の外部依存に該当するが、SQLite 互換、移行容易性、将来の同期・分散構成への拡張余地という採用メリットが高いため、例外採用候補として正式に保持する。

libSQL の実採用タイミング、driver 実装、運用形態は、Phase 計画とユーザー承認に基づいて決定する。libSQL を採用する場合も、外部ライブラリAPIを直接利用せず、内製 `libsql` driver と Database Gateway の内部に閉じ込める。

Turso Cloud 等の libSQL 系クラウドDBホスティングを採用するかどうかは未定とする。クラウドDBホスティングはデータベースエンジンの追加採用ではなく、libSQL の接続先または運用形態の候補として扱う。検討する場合は、標準運用方針、クローズドライセンス、データ管理責任、認証情報管理、運用コスト、障害時の復旧方針を3類マスター仕様書に追記してから判断する。

SQLite から libSQL へ移行しやすくするため、データベースアクセスは専用層に集約し、アプリケーション各所から直接 SQLite 固有処理へ依存しない設計とする。

### 4.2 データベース抽象化方針

SQLite を直接触る設計は、将来の libSQL 移行計画の弊害になるため禁止する。

アプリケーションコードは、必ずデータベースアクセス専用層を経由して永続化処理を行う。UI、HTTP ハンドラー、認証処理、Git 操作処理、ドメインサービスから SQLite 接続、SQL 実行、トランザクション制御、migration 実行を直接呼び出してはならない。

データベースアクセス専用層は、以下の責務を持つ。

- 接続生成と接続設定の管理
- SQL 実行の集約
- トランザクション境界の管理
- schema と migration の適用
- SQLite 標準互換 SQL の維持
- 将来の `sqlite` / `libsql` driver 差し替え境界の提供

Phase 1 では driver 実装は SQLite のみとする。ただし、インターフェース、設定名、ディレクトリ構造は libSQL への移行計画を最初から立てやすい構成として固定する。

クラウドDBホスティングを採用する場合も、上位層からは libSQL driver の接続先差し替えとして扱い、`turso` 等のホスティングサービス名をアプリケーション上位層の依存名にしてはならない。

### 4.3 標準運用方針

Adlaire Git Repository 本体の標準運用方針は、self-host、Docker、VPS、専用サーバーを前提とする。

Git ホスティング本体は、Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を中核とする。そのため、標準実行基盤は、これらを直接管理しやすい self-host / Docker / VPS / 専用サーバーを基準にする。

Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。採用を検討する場合は、補助API、管理機能、Webhook 受信、読み取り専用ミラー等の補助的用途を優先して評価し、Git repository 実体保存、Git 操作、永続ファイル、バックアップ、復旧、データ所在、認証情報管理、運用費用、Deno 固定バージョン、Node.js / npm 非依存方針との整合を確認する。

Deno Deploy を採用候補にする場合も、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を前提にしてはならない。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱う。アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。

---

## 5. 個別マスター仕様書

| ドキュメント | 役割 |
|---|---|
| `docs/specs/Adlaire_Git_Repository_Specification.md` | Git ホスティング基盤本体の仕様 |
| `docs/specs/WYSIWYG_Editor_Specification.md` | ブロックベース WYSIWYG エディターの仕様 |

---

## 6. 実装フェーズ

各フェーズの基準バージョン、対象外範囲、検証範囲、完了条件は `docs/plans/DEVELOPMENT_PLAN.md` をマスター開発計画として参照する。

フェーズ番号は累積方式とし、安定版リリース後もリセットしない。バージョンの `Major` は安定版リリース系列を表し、初回安定版リリース前は `0` を維持する。`Minor` はプロジェクト全体の累積変更番号として扱う。

### 6.1 Phase 1

基準バージョン: `v.0.2`

- Git 基本操作
- ユーザー登録とログイン
- 認証・認可
- リポジトリ作成、参照、更新、削除
- README 表示
- 最小 Web UI
- 操作ログ
- 基本テスト

### 6.2 Phase 2

基準バージョン: `v.0.3`

- Pull Request
- Code Review
- Issue
- Wiki
- Webhook
- Release 管理
- REST API 基本機能

WYSIWYG エディターの実装時期、採用Phase、連携範囲は未定とする。採用する場合は、3類マスター仕様書、マスター開発計画、検証範囲を改訂し、ユーザー承認を得てから実装対象へ含める。

### 6.3 Phase 3

基準バージョン: `v.0.4`

- Organizations 最小運用
- Teams 最小運用
- Projects 最小運用
- Adlaire 内製 Deno Module Registry 最小実装
- REST API 対象リソース拡張
- Webhook 対象イベント拡張
- 高度な監査ログ
- 運用自動化
- libSQL driver 採用可否の再評価

Discussions、Organizations / Teams 本格運用、Projects 本格運用、複数インスタンス本格運用は保留候補とし、保留解除とユーザー承認があるまで Phase 3 の実装対象へ含めない。

Phase 3 は最小運用として完了している。Team による repository 権限付与、Projects 本格運用、Registry の複数 module file / 依存解決 / 削除、libSQL driver 正式採用、クラウドDBホスティング採用は Phase 3 の対象外とする。

### 6.4 Phase 4

基準バージョン: `v.0.5`

- Phase 1 から Phase 3 までの統合
- 仕様整合
- バグ修正
- 移行準備
- 補助的リリース判定前の検証整理

Phase 4 は完了している。

Phase 4 では、Phase 3 で追加した Organization 所有 repository の権限モデルを、Phase 1 と Phase 2 で実装済みの Issue、Pull Request、Code Review、Wiki、Webhook、Release へ統合した。

Repository 配下機能は、個別に owner 文字列を比較するのではなく、RepositoryAccess 境界を経由して Organization owner、Organization member、admin、public repository の参照可否を判定する。

SQLite は現行 driver として維持し、libSQL は将来移行候補として保持する。Phase 4 では libSQL driver、クラウドDBホスティング、その他データベースエンジンを採用しない。

### 6.5 Phase 5

基準バージョン: `v.0.6`

- 補助的リリース判定
- デザイン関連の改良・改修方針整理
- Web UI 情報設計
- 画面レイアウト整理
- 視覚表現統一
- 操作導線改善
- アクセシビリティと可読性改善

Phase 5 のデザイン関連改良・改修は、GitHub UI 互換ではなく、本プロジェクト独自 UI として行う。外部フレームワークを採用してはならない。

Phase 5 では、トップページの Web UI を対象に、情報設計、画面レイアウト、視覚表現、操作導線、アクセシビリティ、可読性を改善する。既存 API と既存ドメイン機能は変更せず、ユーザー登録、API token 発行、Repository 作成、Repository 一覧更新の主要導線を維持する。

Phase 5 は安定版リリースフェーズとして扱わない。

### 6.6 Phase 6

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

### 6.7 Phase 7

基準バージョン: `v.0.8`

- 7系フェーズのデフォルト安定版リリース判定
- リリースノート整理
- 最終リポジトリ整合性確認と整合性向上

Phase 7 を初回安定版リリースとして承認する場合は、安定版系列 `v.1.8` へ進める。安定版リリース判定条件を満たさない場合はリリースしてはならない。

### 6.8 Phase 8

基準バージョン: `v.0.9`

- 7系安定版判定後の長期運用準備
- 移行性確認
- 監査、保守、運用手順整理
- 保留解除候補の再評価

Phase 8 は安定版リリースフェーズとして扱わない。保留解除候補の再評価は実装承認ではなく、正式な実装対象にする場合は、3類マスター仕様書、マスター開発計画、検証範囲へ反映し、ユーザー承認を得る。

### 6.9 Phase 9

基準バージョン: `v.0.10`

- 補助的リリース判定
- 9系フェーズを安定版対象にするかどうかの判断

Phase 9 は補助的リリース判定フェーズである。ケースバイケースで安定版リリースフェーズになる場合と、ならない場合がある。安定版リリース対象にする場合は、2類ポリシー、3類マスター仕様書、マスター開発計画に明記し、ユーザー承認を得る。

---

## 7. セキュリティ方針

- 認証と認可を分離する。
- private リポジトリへのアクセスは必ず権限確認する。
- パスワード、トークン、秘密情報は平文保存しない。
- ユーザー入力は検証し、HTML 出力はエスケープまたはサニタイズする。
- Git 操作では shell 展開に依存しない。
- パストラバーサルを禁止する。
- 秘密情報をコミットしない。

---

## 8. リリース方針

正式リリース対象は安定版のみとする。

安定版リリースフェーズは、Phase 7、Phase 17、Phase 27 のような 7系フェーズをデフォルト方針とする。

Phase 5、Phase 15、Phase 25 のような 5系フェーズは、補助的なリリース判定、設計・デザイン改良、仕様整理のためのフェーズとし、安定版リリースフェーズとして扱わない。

Phase 6、Phase 16、Phase 26 のような 6系フェーズは、大規模なバグ修正とドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズとする。必要に応じて移行準備と検証強化も行う。6系フェーズ自体は安定版リリースフェーズとして扱わない。

Phase 9、Phase 19、Phase 29 のような 9系フェーズは、補助的なリリース判定フェーズとして扱う。9系フェーズはケースバイケースで安定版リリースフェーズになる場合と、ならない場合がある。

リリースするには、以下を満たす必要がある。

- 7系フェーズである。または、9系フェーズとして安定版リリース対象に明示承認されている。
- 3類マスター仕様書の対象範囲を満たしている。
- 主要検証が完了している。
- 既知バグが残っていない。
- セキュリティ要件を満たしている。
- バージョン表記が `v.{Major}.{Minor}` 形式である。

---

## 9. Git 運用方針

`main` への直接 push は禁止する。

すべての変更は作業ブランチから Pull Request を作成し、Pull Request 経由で `main` に取り込む。

Pull Request がマージされた作業ブランチは、自動的に閉じる方針とする。

---

## 10. 禁止事項

- Node.js ランタイムの採用
- 外部フレームワークの無承認採用
- 外部ライブラリの無承認採用
- 外部ライブラリAPIをアプリケーション上位層へ直接露出する設計
- `main` への直接 push
- 仕様書にない機能の独断実装
- 認証・認可を迂回する実装
- 秘密情報のコミット
