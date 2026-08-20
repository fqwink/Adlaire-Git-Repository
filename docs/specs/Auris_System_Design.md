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
- `main` への直接 push
- 仕様書にない機能の独断実装
- 認証・認可を迂回する実装
- 秘密情報のコミット
