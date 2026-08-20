# マスター開発計画

**位置づけ**: マスター開発計画
**対象**: Auris / Adlaire Git Repository 全体
**基準バージョン**: v.1.2
**ステータス**: Phase 1 実装完了・安定版候補

---

## 1. 目的

本書は、Auris / Adlaire Git Repository の実装をフェーズ単位で進めるための **マスター開発計画** である。

実装は、1類ルールブック、2類ポリシー、3類マスター仕様書に従い、本書で定義したフェーズ計画に基づいて進める。

---

## 2. 上位ドキュメントとの関係

本書は、以下の上位ドキュメントに従う。

1. `AGENTS.md`
2. `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md`
3. `docs/specs/Auris_System_Design.md`
4. 個別3類マスター仕様書

本書と上位ドキュメントに矛盾がある場合は、上位ドキュメントを正とし、本書を修正する。

---

## 3. 開発計画の基本方針

- 開発計画はフェーズ単位で策定する。
- 各フェーズには、必ず対応するバージョンを割り当てる。
- ソースコード実装作業は、対象フェーズ、対象仕様、検証範囲を提示し、ユーザー承認を得てから着手する。
- フェーズ途中で実装範囲を変更する場合は、本書、2類ポリシー、必要な3類マスター仕様書を更新し、ユーザー承認を得る。
- 正式リリース対象は安定版のみとする。
- バージョン表記は `v.{Major}.{Minor}` に統一し、`Minor` は累積方式でリセットしない。

---

## 4. フェーズ別バージョン方針

フェーズは、安定版リリース世代である `Major` と対応させる。

| フェーズ | 基準バージョン | ステータス | 扱い |
|---|---:|---|---|
| Phase 0 | v.0.1 | 完了 | 実装前の文書整備、設計整理、計画策定 |
| Phase 1 | v.1.2 | 実装完了・安定版候補 | Git 基本機能、認証、Repository CRUD、SQLite 基盤、Docker/Deno 実行環境の最小安定版候補 |
| Phase 2 | v.2.3 | 未着手 | Pull Request、Issue、Wiki、Webhook、開発支援機能の安定版候補 |
| Phase 3 | v.3.4 | 未着手 | Organizations、Teams、Projects、運用拡張の安定版候補 |

上記は各フェーズの基準バージョンである。フェーズ内でドキュメント更新、バグ修正、検証追加、仕様整理が発生する場合は、`Minor` を累積で進める。

例:

```text
v.0.1 -> v.0.2 -> v.1.3 -> v.2.4 -> v.3.5
```

`Major` を更新する場合も、`Minor` はリセットしない。

### 4.1 採用バージョン決定方針

開発言語、ランタイム、データベース、Git、Docker、外部コマンド、外部ライブラリ、フレームワーク、採用バージョン、固定バージョンは、ユーザーが決定する。

採用バージョンの基本方針は、各技術の **最新の安定版** とする。

TypeScript は **6系** を採用方針とする。Deno に同梱される TypeScript を利用する場合も、TypeScript 6系であることを採用条件とする。

エージェントは、候補提示、比較、調査、リスク整理、推奨案の提示を行ってよい。ただし、ユーザーの明示承認なしに採用決定、バージョン固定、方針確定、実装反映を行ってはならない。

採用バージョンは、ユーザー承認を得るまで未確定として扱う。

Phase 1 の具体的な固定バージョンは、現時点では本書で固定しない。採用または更新の時点で公式情報から最新の安定版を確認し、候補、理由、影響範囲、検証方法を提示し、ユーザー承認を得てから本書、2類ポリシー、3類マスター仕様書、実装設定へ反映する。

---

## 5. Phase 0: 実装前整備

### 5.1 目的

ソースコード実装へ進む前に、ルール、ポリシー、マスター仕様書、開発計画の整合性を確定する。

### 5.2 対象

- `AGENTS.md` の最上位ルール整理
- `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` の開発計画・バージョン・リリース方針整理
- `docs/specs/` 配下のマスター仕様書整合
- SQLite / libSQL 方針の整理
- 実装フェーズと基準バージョンの確定

### 5.3 対象外

- アプリケーションコード実装
- テストコード実装
- DB schema / migration 作成
- 外部ライブラリ導入
- Node.js ランタイム導入

### 5.4 完了条件

- 本書が作成されている。
- 1類、2類、3類ドキュメントから本書への参照が整理されている。
- Phase 1 の実装対象、対象外、検証範囲、承認条件が明確になっている。

---

## 6. Phase 1: Git 基本機能

### 6.1 基準バージョン

Phase 1 の基準バージョンは `v.1.2` とする。

### 6.1.1 ステータス

Phase 1 は、承認済み実装範囲について実装完了とする。

ただし、正式な安定版リリースは、Pull Request のレビュー、マージ、リリース判定を完了した後に行う。PR が `main` にマージされるまでは、Phase 1 は **安定版候補** として扱う。

### 6.2 目的

セルフホスト型 Git ホスティング基盤として、最小限の Git 操作、認証、リポジトリ管理、SQLite 永続化、Web UI を成立させる。

### 6.3 実装対象

- Git clone / push / pull / fetch
- Branch / Tag 管理
- ユーザー登録、ログイン、認証、認可
- SSH 公開鍵管理
- HTTP Basic Auth
- Personal Access Token 管理
- Repository CRUD
- Visibility 制御
- README 表示
- 最小 Web UI
- 操作ログ
- SQLite driver
- Database Gateway
- SQLite から libSQL へ移行しやすい永続化境界
- Deno ランタイムによる実行環境
- Dockerfile / compose による Docker 上の Deno 実行環境
- 基本テスト

### 6.4 対象外

- libSQL driver 実装
- Turso Cloud 等のクラウドDBホスティング採用
- Pull Request
- Issue
- Wiki
- Webhook
- Organizations / Teams
- 複数インスタンス運用
- Docker 前提の本番運用固定化

### 6.5 必須検証

- Git 基本操作
- 認証・認可
- Repository CRUD
- private repository のアクセス制御
- SQLite 永続化
- Database Gateway 経由のDBアクセス
- XSS 対策
- Node.js ランタイム非依存
- 外部フレームワーク非採用
- Deno ランタイム上での `fmt` / `lint` / `test` / `compile`
- Docker 上の Deno ランタイム起動と `/health`

### 6.6 完了条件

- Phase 1 の実装対象が3類マスター仕様書に基づいて成立している。
- DBアクセスが SQLite 固有処理へ直接依存していない。
- libSQL への将来移行を妨げる構造になっていない。
- 主要検証が完了している。
- 既知バグが残っていない。
- 安定版リリース判定を行える状態である。

### 6.7 実装結果

Phase 1 では、以下を実装済みとする。

- Deno / TypeScript / `Deno.serve` による HTTP アプリケーション基盤
- SQLite CLI driver と Database Gateway
- ユーザー登録、HTTP Basic 認証、Personal Access Token 認証
- SSH 公開鍵管理 API
- Repository CRUD、Visibility 制御、private repository アクセス制御
- Git Smart HTTP による clone / push / pull / fetch
- Branch / Tag / README / commit / tree / blob 参照 API
- 最小 Web UI
- 監査ログ記録
- Docker 上の Deno ランタイム環境、永続データ volume、healthcheck
- 意味のある単体テスト、統合テスト、E2E 検証

### 6.8 検証結果

Phase 1 の完了判定では、以下の検証を必須結果として扱う。

- `deno task fmt --check`
- `deno task lint`
- `deno task test`
- `deno task compile`
- Docker build
- Docker コンテナ内の Deno / Git / SQLite / Git Smart HTTP backend 確認
- Docker コンテナ起動後の `/health` 確認
- Personal Access Token 認証付き Git `push` / `clone` / `fetch` / `pull`
- private repository の匿名 API / Git アクセス拒否
- HTTP Basic 認証による API アクセス

### 6.9 リリース判定

Phase 1 は安定版候補として成立している。

正式リリース可否は、以下を満たした時点で判定する。

- PR がレビューされ、`main` へマージされている。
- `main` 上で Phase 1 必須検証が再実行されている。
- 既知バグが残っていない。
- リリース対象が安定版として扱えることを確認している。

---

## 7. Phase 2: 開発支援機能

### 7.1 基準バージョン

Phase 2 の基準バージョンは `v.2.3` とする。

### 7.2 目的

チーム開発に必要なレビュー、課題管理、文書管理、通知連携を追加する。

Phase 2 は、Phase 1 の PR が `main` へマージされ、安定版リリース判定が完了してから着手する。

### 7.3 実装対象

- Pull Request
- Code Review
- Issue
- Wiki
- Webhook
- Star / Watch
- Release 管理
- REST API 基本機能
- WYSIWYG エディター連携

### 7.4 対象外

- Organizations / Teams の本格運用
- Projects
- Discussions
- 複数インスタンス運用
- libSQL driver の正式採用
- クラウドDBホスティング採用

### 7.4.1 着手条件

Phase 2 に着手する前に、以下を満たすこと。

- Phase 1 の作業ブランチが PR 経由で `main` にマージされている。
- Phase 1 の作業ブランチがルールに従って閉じられている。
- Phase 1 の安定版リリース判定が完了している。
- Phase 2 の実装対象、対象外、検証範囲についてユーザー承認を得ている。
- Pull Request / Issue / Wiki / Webhook / WYSIWYG 連携の仕様差分が3類マスター仕様書に反映されている。

### 7.5 完了条件

- Pull Request、Issue、Wiki が3類マスター仕様書に基づいて動作する。
- Webhook と REST API 基本機能の権限確認が成立している。
- WYSIWYG エディター連携で XSS 対策が成立している。
- 既知バグが残っていない。
- 安定版リリース判定を行える状態である。

---

## 8. Phase 3: 組織・運用拡張

### 8.1 基準バージョン

Phase 3 の基準バージョンは `v.3.4` とする。

### 8.2 目的

組織管理、チーム管理、プロジェクト管理、運用自動化を追加し、内部向け Git ホスティング基盤としての運用性を高める。

### 8.3 実装対象

- Organizations
- Teams
- Projects
- Discussions
- REST API 拡張
- Webhook 拡張
- 高度な監査ログ
- 運用自動化
- 複数インスタンス運用の検討
- libSQL driver 採用可否の再評価

### 8.4 対象外

- SQLite / libSQL 以外のデータベースエンジン採用
- Node.js ランタイム採用
- 外部フレームワーク採用
- クラウドDBホスティングの無承認採用

### 8.5 完了条件

- 組織・チーム単位の権限管理が成立している。
- 運用機能が3類マスター仕様書に基づいて成立している。
- libSQL またはクラウドDBホスティングを採用する場合は、別途ユーザー承認と仕様更新が完了している。
- 既知バグが残っていない。
- 安定版リリース判定を行える状態である。

---

## 9. 実装着手前チェック

各フェーズの実装に着手する前に、以下を確認する。

- `AGENTS.md` を読んでいる。
- `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` を読んでいる。
- `docs/specs/Auris_System_Design.md` を読んでいる。
- 対象となる個別3類マスター仕様書を読んでいる。
- 対象フェーズの目的、対象、対象外、検証範囲を提示している。
- ソースコード実装についてユーザー承認を得ている。
- `main` へ直接 push せず、PR 経由で取り込む前提で作業している。

---

## 10. 計画変更手順

本書を変更する場合は、以下の順序で進める。

1. 1類ルールブックに違反しないことを確認する。
2. 2類ポリシーとの整合を確認する。
3. 3類マスター仕様書との整合を確認する。
4. 変更理由を明確にする。
5. ユーザー承認を得る。
6. 承認済み範囲のみ変更する。
7. コミットする。
8. PR 経由で `main` に取り込む。

---

## 11. 改訂履歴

| バージョン | 内容 |
|---:|---|
| v.0.1 | マスター開発計画の初期策定 |
| v.1.2 | Phase 1 実装完了、Docker 上の Deno ランタイム環境、主要検証結果、Phase 2 着手条件を反映 |
