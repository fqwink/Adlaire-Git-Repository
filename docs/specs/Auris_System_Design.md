# Auris システム設計マスター仕様書

**位置づけ**: 3類マスター仕様書の最上位
**対象**: Auris / Adlaire Git Repository 全体
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**バージョン**: v.0.1
**ステータス**: 初期整備中

---

## 1. 目的

本書は、Auris / Adlaire Git Repository 全体の最上位マスター仕様書である。

本プロジェクトの機能範囲、技術方針、セキュリティ方針、実装フェーズ、運用方針は、本書を基準として判断する。

---

## 2. 上位ドキュメントとの関係

本書は3類マスター仕様書であり、1類ルールブックである `AGENTS.md` および2類ポリシーである `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` に従う。

矛盾がある場合は、以下の順に優先する。

1. `AGENTS.md`
2. `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md`
3. 本書
4. 個別マスター仕様書

---

## 3. システム概要

Adlaire Git Repository は、Adlaire Group 内部向けのセルフホスト型 Git ホスティング基盤である。

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

例外採用した外部ライブラリは、内製ラッパー、内製driver、または内製Gatewayの内部に閉じ込める。外部ライブラリのAPIをアプリケーション上位層へ直接露出させず、設計上は内製化された境界を通して利用する。

### 4.1 データベース方針

採用対象のデータベースエンジンは SQLite と libSQL のみに限定する。

Phase 1 は SQLite を標準データベースとして進める。

libSQL は、SQLite からの将来移行候補として扱う。libSQL の採用は外部ライブラリまたは外部基盤の例外採用に該当するが、SQLite 互換、移行容易性、将来の同期・分散構成への拡張余地という採用メリットが高いため、やむを得ない例外採用候補として正式に保持する。

libSQL の実採用タイミング、driver 実装、運用形態は、Phase 計画とユーザー承認に基づいて決定する。libSQL を採用する場合も、外部ライブラリAPIを直接利用せず、内製 `libsql` driver と Database Gateway の内部に閉じ込める。

Turso Cloud 等の libSQL 系クラウドDBホスティングを採用するかどうかは未定とする。クラウドDBホスティングはデータベースエンジンの追加採用ではなく、libSQL の接続先または運用形態の候補として扱う。検討する場合は、セルフホスト方針、クローズドライセンス、データ管理責任、認証情報管理、運用コスト、障害時の復旧方針を3類マスター仕様書に追記してから判断する。

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

---

## 5. 個別マスター仕様書

| ドキュメント | 役割 |
|---|---|
| `docs/specs/Adlaire_Git_Repository_Specification.md` | Git ホスティング基盤本体の仕様 |
| `docs/specs/WYSIWYG_Editor_Specification.md` | ブロックベース WYSIWYG エディターの仕様 |

---

## 6. 実装フェーズ

### 6.1 Phase 1

- Git 基本操作
- ユーザー登録とログイン
- 認証・認可
- リポジトリ作成、参照、更新、削除
- README 表示
- 最小 Web UI
- 操作ログ
- 基本テスト

### 6.2 Phase 2

- Pull Request
- Issue
- Wiki
- Webhook
- Star / Watch
- Release 管理
- REST API 基本機能
- WYSIWYG エディター連携

### 6.3 Phase 3

- Projects
- Organizations / Teams
- Discussions
- REST API 拡張
- 複数インスタンス運用
- 高度な監査ログ
- 運用自動化

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

リリースするには、以下を満たす必要がある。

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
