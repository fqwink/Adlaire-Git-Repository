# Adlaire Git Repository

**文書バージョン**: v.1.8
**ステータス**: Phase 7 初回安定版リリース
**ベース**: GitPrep（セルフホスト型 Git ホスティング）
**技術スタック**: Deno + TypeScript + SQLite + Git

---

## ビジョン

**何を作るか**
- Adlaire Group 内部向け Git ホスティングプロバイダー
- Adlaire Group プロジェクト・プロダクトのソースコード管理
- セルフホスト型（内部サーバー管理）

**対象**
- Adlaire Group 全社プロジェクト
- 社内プロダクト開発
- 内部ツール / ライブラリ管理

**特徴**
- 基本的な機能互換は GitHub 互換基準とする
- オープンソース Git プロバイダーはサブの機能互換インスパイア対象とする
- Git 基本操作と開発支援機能を段階的に実装する
- UI は GitHub 互換の対象外とし、本プロジェクト独自の利用体験として段階的に拡張する
- 外部依存は必要最小限とし、Deno 標準ライブラリ、SQLite、将来移行候補の libSQL を中心に扱う
- ワンバイナリで起動

**対象ユーザー**
- 開発者（ソースコード push / pull）
- プロジェクトオーナー（リポジトリ管理）
- IT 管理者（ユーザー・アクセス管理）

---

## GitHub 互換方針

本プロジェクトの基本的な機能互換は、GitHub 互換基準とする。

GitHub 互換とは、GitHub の機能概念、用語、主要ワークフロー、権限確認、API の考え方に近い振る舞いを持ち、GitHub 利用経験のある利用者が理解・移行しやすいことを指す。

互換対象の中心は以下とする。

- Repository、Branch、Tag、Release
- Issue、Pull Request、Code Review
- Wiki、Projects、Discussions
- Organization、Team、User、権限管理
- Webhook、REST API、Personal Access Token、SSH key
- README、commit、tree、blob、diff、履歴表示

GitHub 互換は、マスター仕様書とマスター開発計画で定義された範囲に限る。GitHub の全機能を無条件に実装対象へ含めるものではない。現時点で不要な機能は、GitHub に存在する機能であっても実装対象から除外する。

UI、画面デザイン、画面レイアウト、視覚表現は GitHub 互換の対象外とする。UI は本プロジェクト独自の設計とし、GitHub の画面、デザイン、ブランド表現、商標表現を模倣しない。

GitHub Actions、GitHub Pages、汎用 Package registry、Container registry、Copilot、Advanced Security 等は、個別に採用可否、実装時期、必要性、外部依存、セキュリティ、ライセンスを評価し、ユーザー承認を得るまで実装対象に含めない。

汎用 Package registry は、今後の計画として検討する。ただし、現時点では保留方針とし、実装対象、推奨候補フェーズ、実装予定として扱わない。

Adlaire 内製 Deno Module Registry は、汎用 Package registry とは分離して扱う。Adlaire 内製 Deno Module Registry は、クローズドな Adlaire 内製 Deno package を Adlaire Git Repository 本体から配布するための中長期計画であり、早期フェーズで本体実装に着手する方針とする。

GitHub 互換を目標とする場合でも、GitHub 固有サービスへの直接依存、GitHub の商標・ブランド表現の無承認利用、GitHub API の完全再現を前提にした無承認実装は行わない。

## Adlaire 内製 Deno Module Registry 方針

Adlaire 内製 Deno Module Registry は、Adlaire Group 内部向けの Deno / TypeScript / ESM module 配布基盤とする。

本機能は、Adlaire Git Repository 本体へ早期実装する中長期計画対象である。初期実装では、以下を候補範囲とする。

- package metadata 管理
- version 管理
- module artifact または module source の登録
- checksum 管理
- Deno native import / download endpoint
- repository、organization、team、user に基づく認証・認可
- publish / update / delete / download の監査ログ

Adlaire 内製 Deno Module Registry は npm registry 互換レジストリではない。`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提にしてはならない。

汎用 Package registry、npm registry 互換、Container registry は、本仕様の Adlaire 内製 Deno Module Registry とは別機能として扱う。汎用 Package registry は今後の計画として検討するが、保留解除とユーザー承認を得るまで実装対象に含めない。

## Phase 3 Organizations 最小運用仕様

Organizations は、リポジトリ所有者をユーザー単位だけでなく組織単位へ拡張するための Phase 3 最小運用機能とする。

Phase 3 の Organizations 最小運用では、以下を実装対象とする。

- Organization の作成
- Organization の一覧
- Organization の詳細取得
- Organization member の追加
- `owner` / `member` の最小 role 管理
- Organization owner による Organization 所有 repository の作成
- Organization member による Organization 所有 private repository の参照
- Organization owner または admin による Organization 所有 repository の更新
- 操作ログへの `organization.create` / `organization.member.add` 記録

Organizations の API は、Organization 単位の REST API として提供する。

```text
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/{slug}
POST   /api/organizations/{slug}/members
```

Organization 作成時の必須項目は `slug` と `name` とする。作成者は自動的に `owner` member として登録する。

Organization member 追加時の必須項目は `username` とする。`role` は `owner` または `member` とし、未指定の場合は `member` とする。

Phase 3 の Organizations 最小運用では、以下を対象外とする。

- Teams
- Projects
- Organization 設定画面
- Organization 削除
- Organization member 削除
- Organization member role 更新
- Organization の公開プロフィール
- Organization 単位の詳細な権限プリセット
- Organization invite flow
- 請求、プラン、外部ID連携

Organization owner は Organization 所有 repository に対して書込権限を持つ。Organization member は Organization 所有 private repository を参照できるが、repository 更新、visibility 変更、削除はできない。

## Phase 4 Repository 権限統合仕様

Phase 4 では、Repository 配下機能の権限判定を `RepositoryService` の RepositoryAccess 境界へ統合する。

対象機能は以下とする。

- Issue
- Pull Request
- Code Review
- Wiki
- Webhook
- Webhook event dispatch
- Release

Repository 配下機能は、repository owner 文字列と actor username の単純比較を権限判定の正本として扱ってはならない。Organization 所有 repository、user 所有 repository、public repository、admin 権限を同じ境界で扱うため、参照操作は `requireVisibleRepository` 相当、書込操作は `requireWritableRepository` 相当の権限境界を経由する。

Organization owner は、Organization 所有 repository の Issue、Pull Request、Wiki、Webhook、Release に対して書込操作を実行できる。

Organization member は、Organization 所有 private repository の Issue、Pull Request、Code Review、Wiki、Release を参照できる。Organization member による書込操作は、対象機能の仕様で別途許可されている場合を除き、Organization owner または admin の書込権限とは区別する。

Phase 4 の統合検証では、Organization 所有 private repository を対象に、Issue、Pull Request、Wiki、Release、Webhook event dispatch が repository 権限境界に基づいて成立することを確認する。

## Phase 3 Teams 最小運用仕様

Teams は、Organization 配下でユーザーを作業単位へまとめるための Phase 3 最小運用機能とする。

Phase 3 の Teams 最小運用では、以下を実装対象とする。

- Organization 配下の Team 作成
- Organization 配下の Team 一覧
- Organization member に限定した Team member の追加
- Team member の一覧
- 操作ログへの `team.create` / `team.member.add` 記録

Teams の API は、Organization 配下の REST API として提供する。

```text
GET    /api/organizations/{slug}/teams
POST   /api/organizations/{slug}/teams
GET    /api/organizations/{slug}/teams/{teamSlug}/members
POST   /api/organizations/{slug}/teams/{teamSlug}/members
```

Phase 3 の Teams 最小運用では、Team による repository 権限付与、Team 削除、Team member 削除、Team member role、Team 設定画面、Team invite flow は対象外とする。

## Phase 3 Projects 最小運用仕様

Projects は、Repository 配下で作業単位を整理するための Phase 3 最小運用機能とする。

Phase 3 の Projects 最小運用では、以下を実装対象とする。

- Repository 配下の Project 作成
- Repository 配下の Project 一覧
- Project の `open` / `closed` 状態管理
- 操作ログへの `project.create` / `project.update` 記録

Projects の API は、Repository 配下の REST API として提供する。

```text
GET    /api/repositories/{owner}/{name}/projects
POST   /api/repositories/{owner}/{name}/projects
PATCH  /api/repositories/{owner}/{name}/projects/{number}
```

Phase 3 の Projects 最小運用では、カンバンビュー、Project item、Issue / Pull Request 連携、複数 view、集計、Automation は対象外とする。

## Phase 3 Adlaire 内製 Deno Module Registry 最小運用仕様

Adlaire 内製 Deno Module Registry は、Adlaire Group 内部向けの Deno / TypeScript / ESM module 配布基盤として、Phase 3 では最小運用を実装する。

Phase 3 の Registry 最小運用では、以下を実装対象とする。

- Package metadata の作成
- Package 一覧
- Version 登録
- Version 一覧
- Module source の保存
- SHA-256 checksum の記録
- Deno native import / download endpoint
- Package / Version 操作の監査ログ

Registry の API は、Registry 単位の REST API として提供する。

```text
GET    /api/registry/packages
POST   /api/registry/packages
GET    /api/registry/packages/{scope}/{name}/versions
POST   /api/registry/packages/{scope}/{name}/versions
GET    /api/registry/packages/{scope}/{name}/versions/{version}/download
```

`scope` は user または Organization の owner 名として扱う。Organization scope への publish は Organization owner または admin に限定する。

Phase 3 の Registry 最小運用では、npm registry 互換、`package.json`、`node_modules`、Node.js runtime、npm ecosystem、汎用 Package registry、Container registry、削除、非公開 token scope、署名付き artifact、複数 module file、依存解決は対象外とする。

## Phase 3 運用・監査・移行性確認仕様

Phase 3 では、運用性と将来移行性の最小確認として、以下を実装対象とする。

- Webhook の任意 event dispatch
- Audit log の admin 参照
- Operations status の参照
- libSQL 採用可否の再評価結果参照

API は以下とする。

```text
POST   /api/repositories/{owner}/{name}/webhook-events
GET    /api/audit-logs
GET    /api/operations/status
GET    /api/operations/libsql-evaluation
```

Phase 3 の libSQL 再評価では、SQLite を現行 driver として維持し、Database Gateway 境界を保ったまま将来の libSQL 移行可能性を保持する。Phase 3 では libSQL driver とクラウドDBホスティングを正式採用しない。

## Phase 2 開発支援機能最小仕様

Issue は、リポジトリ単位でバグ、タスク、要望を管理するための開発支援機能とする。

Phase 2 の Issue 最小実装では、以下を実装対象とする。

- Issue の作成
- Issue の一覧
- Issue の詳細取得
- Issue のタイトル、本文、状態の更新
- Issue の `open` / `closed` 状態管理
- リポジトリ単位の連番
- 作成者の記録
- 操作ログへの `issue.create` / `issue.update` 記録
- Repository 権限に基づく参照制御
- Issue 作成者、Repository owner、admin による更新制御

Issue の API は、Repository 配下の REST API として提供する。

```text
GET    /api/repositories/{owner}/{name}/issues
POST   /api/repositories/{owner}/{name}/issues
GET    /api/repositories/{owner}/{name}/issues/{number}
PATCH  /api/repositories/{owner}/{name}/issues/{number}
```

`GET /issues` は、`state=open` または `state=closed` による絞り込みを許可する。`state` を指定しない場合は、対象Repositoryで参照可能なすべてのIssueを返す。

Issue 作成時の必須項目は `title` とする。`body` は任意とし、未指定の場合は空文字として扱う。

Phase 2 の Issue 最小実装では、以下を対象外とする。

- Label
- Assignee
- Milestone
- Comment
- Attachment
- Mention
- Issue template
- Project 連携
- Pull Request との自動リンク
- Webhook イベント送信

これらの対象外機能を追加する場合は、マスター開発計画と本仕様書を改訂し、ユーザー承認を得てから実装する。

### Pull Request / Code Review 最小仕様

Pull Request は、リポジトリ単位で変更提案、レビュー、マージ状態を管理するための開発支援機能とする。

Phase 2 の Pull Request / Code Review 最小実装では、以下を実装対象とする。

- Pull Request の作成
- Pull Request の一覧
- Pull Request の詳細取得
- Pull Request のタイトル、本文、状態、マージコミットSHAの更新
- Pull Request の `open` / `closed` / `merged` 状態管理
- Pull Request のリポジトリ単位の連番
- Code Review の作成
- Code Review の一覧
- Code Review の `commented` / `approved` / `changes_requested` 状態管理
- Repository 権限に基づく参照制御
- Repository owner、admin による Pull Request 更新制御
- 操作ログへの `pull_request.create` / `pull_request.update` / `code_review.create` 記録

Pull Request / Code Review の API は、Repository 配下の REST API として提供する。

```text
GET    /api/repositories/{owner}/{name}/pulls
POST   /api/repositories/{owner}/{name}/pulls
GET    /api/repositories/{owner}/{name}/pulls/{number}
PATCH  /api/repositories/{owner}/{name}/pulls/{number}
GET    /api/repositories/{owner}/{name}/pulls/{number}/reviews
POST   /api/repositories/{owner}/{name}/pulls/{number}/reviews
```

Pull Request 作成時の必須項目は `title`、`sourceBranch`、`targetBranch` とする。`body` は任意とし、未指定の場合は空文字として扱う。

`state=merged` へ更新する場合は `mergeCommitSha` を必須とする。Phase 2 最小実装では、実 Git branch の差分計算、競合検出、自動マージ、CI 状態連携、レビュー必須条件は対象外とする。

### Wiki 最小仕様

Wiki は、リポジトリ単位の簡易文書管理機能とする。

Phase 2 の Wiki 最小実装では、以下を実装対象とする。

- Wiki page の作成または更新
- Wiki page の一覧
- Wiki page の詳細取得
- `slug` による page 識別
- 更新ごとの version 加算
- Repository 権限に基づく参照制御
- Repository owner、admin による編集制御
- 操作ログへの `wiki.upsert` 記録

Wiki の API は、Repository 配下の REST API として提供する。

```text
GET    /api/repositories/{owner}/{name}/wiki
POST   /api/repositories/{owner}/{name}/wiki
GET    /api/repositories/{owner}/{name}/wiki/{slug}
```

Phase 2 最小実装では、Wiki page の過去本文履歴、添付ファイル、ページ間リンク解決、Markdown レンダリングは対象外とする。API は JSON として本文を返すため、HTML レンダリング時の XSS 対策は、Web UI 実装フェーズで別途検証対象とする。

### Webhook 最小仕様

Webhook は、Repository owner または admin が、リポジトリ単位で外部通知先を登録するための開発支援機能とする。

Phase 2 の Webhook 最小実装では、以下を実装対象とする。

- Webhook の作成
- Webhook の一覧
- `http` / `https` URL の検証
- event 名の検証
- secret の保存
- API 応答で secret を返さないこと
- `ping` event の署名付き HTTP POST 送信
- delivery の成功または失敗記録
- Repository owner、admin による参照・作成・ping 制御
- 操作ログへの `webhook.create` / `webhook.ping` 記録

Webhook の API は、Repository 配下および Webhook 単位の REST API として提供する。

```text
GET    /api/repositories/{owner}/{name}/webhooks
POST   /api/repositories/{owner}/{name}/webhooks
POST   /api/webhooks/{id}/ping
```

`ping` event 送信時は、`x-adlaire-event: ping` と `x-adlaire-signature-256: sha256={HMAC_SHA256}` を付与する。

Phase 2 最小実装では、任意 event の自動発火、再送管理、配送キュー、Webhook 更新・削除、受信側 Webhook の署名検証エンドポイントは対象外とする。

### Release 最小仕様

Release は、リポジトリ単位でタグ名に紐づく公開メタデータを管理するための機能とする。

Phase 2 の Release 最小実装では、以下を実装対象とする。

- Release の作成
- Release の一覧
- Release の詳細取得
- `tagName` の一意性管理
- `draft` 状態の保存
- Repository 権限に基づく参照制御
- Repository owner、admin による作成制御
- 操作ログへの `release.create` 記録

Release の API は、Repository 配下の REST API として提供する。

```text
GET    /api/repositories/{owner}/{name}/releases
POST   /api/repositories/{owner}/{name}/releases
GET    /api/repositories/{owner}/{name}/releases/{tagName}
```

Phase 2 最小実装では、Git tag の実在確認、成果物アップロード、release asset、公開範囲の細分化、Release 更新・削除は対象外とする。

## OSS Git プロバイダー参考方針

オープンソースの Git プロバイダーやセルフホスト型 Git ホスティング製品は、サブの機能互換インスパイア対象として扱う。

参考対象には、Gitea、Forgejo、GitLab、GitPrep 等を含めてよい。

ただし、これらは主たる互換基準ではない。特定 OSS Git プロバイダーとの機能互換、API 互換、UI 互換、画面設計互換、運用モデル互換を目標にしてはならない。

参考にした機能を採用する場合は、本プロジェクトの目的、セキュリティ方針、依存関係方針、運用方針に合わせて3類マスター仕様書へ再定義し、現時点で必要な機能かどうかを判断し、ユーザー承認を得てから実装対象に含める。

実装機能候補、優先実装候補、保留候補は、`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` を参照する。同ファイルは候補整理であり、実装承認ではない。候補を実装対象へ確定する場合は、本書、`docs/specs/Auris_System_Design.md`、`docs/plans/DEVELOPMENT_PLAN.md` へ反映し、ユーザー承認を得る。

候補リストは、機能候補と選定理由を管理する。正式仕様、実装対象、対象外、Phase 割り当て、完了条件、検証範囲は、本書、`docs/specs/Auris_System_Design.md`、`docs/plans/DEVELOPMENT_PLAN.md` で管理する。

---

## 確定済み基本機能

### Git 操作

- ✅ git clone (HTTP/HTTPS + SSH)
- ✅ git push
- ✅ git pull / fetch
- ✅ Branch / Tag 管理
- ✅ Release 管理

### ユーザー・認証

- ✅ ユーザー登録 / ログイン
- ✅ SSH key 管理
- ✅ HTTP Basic Auth
- ✅ API token (PAT)

### リポジトリ管理

- ✅ Repo CRUD (public / private)
- ✅ Repository settings
- ✅ Visibility 制御

### Web UI

- ✅ リポジトリ一覧
- ✅ コード閲覧
- ✅ Commit 履歴
- ✅ ユーザー管理画面（管理者向け）

**実装**: HTML + Vanilla JavaScript（内製・フレームワークなし）

### その他

- ✅ 操作ログ記録
- ✅ Webhook 基本
- ✅ README 表示

---

## 技術スタック

| 層 | 技術 |
|----|------|
| **言語** | TypeScript |
| **ランタイム** | Deno |
| **HTTP** | Deno.serve |
| **DB** | SQLite（Database Gateway / SQLite driver 経由） |
| **Git** | Deno.Command |
| **認証** | SSH / HTTP Basic |
| **UI** | HTML + Vanilla JavaScript（内製） |

**原則**:
- Deno 標準機能と承認済みの最小外部依存のみ
- フレームワーク採用禁止（内製化のみ）
- Deno 標準ライブラリを最優先候補とする。ただし、個別モジュールの採用はユーザー承認を必須とする
- JSR レジストリの公開ライブラリは採用可能とする。ただし、ユーザー承認を得るまで採用禁止とする
- JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする
- JSR へ公開する package は、公開可能なオープンソースコードであることを前提とする
- クローズドライセンス、内部専用、非公開資産は JSR へ公開しない
- クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする
- Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する
- npm registry 互換レジストリは標準採用しない
- 必要最小限の外部ライブラリ
- 外部ライブラリは内製ラッパー、内製driver、または Database Gateway の内部に閉じ込める
- Deno、SQLite、libSQL、Git、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリは、各技術の最新の安定版を採用方針とする
- TypeScript は 6系の最新安定版を採用方針とする
- Docker は、開発、検証、本番、デプロイ、調査、一時確認、補助用途を含む全用途で例外なく採用禁止とする
- 承認済み固定採用バージョンは、下表に従う

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | Phase 1 標準データベース |
| libSQL | `libsql-server v0.24.32` | 将来移行候補。Phase 1 の実装対象外 |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

### データベース採用方針

採用対象のデータベースエンジンは SQLite と libSQL のみに限定する。

SQLite と libSQL は、本プロジェクトで許容する必要最小限の外部依存とする。

Phase 1 は SQLite を標準データベースとして実装する。

SQLite は、Phase 1 の標準データベースとして採用する必要最小限の外部依存である。

libSQL は、SQLite 互換を活かした将来の移行候補として保持する。libSQL も必要最小限の外部依存に該当するが、SQLite からの移行容易性、DB抽象化設計との相性、将来の同期・分散構成への拡張余地という採用メリットが高いため、例外採用候補として扱う。

ただし、Phase 1 では libSQL を実装対象に含めない。libSQL driver の実装は、Phase 計画、移行計画、検証計画、ユーザー承認を揃えてから行う。libSQL を採用する場合も、外部ライブラリAPIは内製 `libsql` driver と Database Gateway の内部に閉じ込め、サービス層やRepository層へ直接露出させない。

Turso Cloud 等のクラウドDBホスティングを採用するかどうかは未定とする。クラウドDBホスティングは新しいデータベースエンジンではなく、libSQL の接続先または運用形態の候補として扱う。採用する場合は、外部サービス依存、データ所在、認証トークン管理、バックアップ、障害時の復旧、運用費用を評価し、例外採用としてユーザー承認を得る。

将来移行を容易にするため、DBアクセスは Database Gateway と専用 driver 層に集約する。SQL は可能な限り SQLite 標準互換に保ち、libSQL 固有機能へ直接依存する場合はマスター仕様書に明記する。

### 標準運用基盤方針

Adlaire Git Repository 本体の標準運用基盤は、self-host、VPS、専用サーバーを前提とする。

Git ホスティング本体は、Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を中核とする。そのため、本体の標準運用基盤は、これらを直接管理しやすい self-host / VPS / 専用サーバーを基準にする。

Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。検討する場合は、補助API、管理機能、Webhook 受信、読み取り専用ミラー等の補助的用途を優先して評価し、Git repository 実体保存、Git 操作、永続ファイル、バックアップ、復旧、データ所在、認証情報管理、運用費用、Deno 固定バージョン、Node.js / npm 非依存方針との整合を確認する。

Deno Deploy を採用候補にする場合も、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を前提にしてはならない。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。

### データベースアクセス層仕様

直接 SQLite を触る設計は、libSQL への移行計画の弊害になるため禁止する。

アプリケーションコードは、以下の層を経由してデータベースへアクセスする。

```text
HTTP ハンドラー / Web UI / Git 操作 / 認証処理
    ↓
サービス層
    ↓
Repository 層
    ↓
Database Gateway
    ↓
SQLite driver（Phase 1）
```

各層の責務は以下とする。

| 層 | 責務 |
|---|---|
| サービス層 | ユースケース、権限確認、トランザクション要求 |
| Repository 層 | エンティティ単位の保存・取得・検索 |
| Database Gateway | 接続、SQL 実行、トランザクション、driver 差し替え境界 |
| SQLite driver | Phase 1 の実DBアクセス実装 |

禁止事項:

- HTTP ハンドラーから SQLite 接続を直接生成すること
- サービス層から生 SQL を直接実行すること
- Git 操作処理から DB ファイルを直接読み書きすること
- migration をアプリケーション各所に分散させること
- SQLite 固有機能を Repository 層より上位へ漏らすこと

Phase 1 では `DB_DRIVER=sqlite` を前提値とする。将来追加できる driver は `DB_DRIVER=libsql` のみに限定する。クラウドDBホスティングを採用する場合も、`DB_DRIVER=libsql` の接続先設定として扱い、`DB_DRIVER=turso` 等のホスティングサービス名を driver 名にしてはならない。

移行計画を立てやすくするため、初期実装時点から以下を固定する。

- `DB_DRIVER` による driver 選択
- `DB_URL` による接続先指定
- `DB_AUTH_TOKEN` による認証情報指定
- SQLite 標準互換 SQL を優先するクエリ方針
- Repository 層より上位へ driver 固有 API を漏らさない境界
- 外部ライブラリAPIを Database Gateway より上位へ漏らさない境界
- SQLite から libSQL への移行検証手順を追加しやすいテスト構成

schema、migration、seed は専用ディレクトリに集約し、Database Gateway からのみ適用する。

---

## アーキテクチャ

```
[Git Client]
    ↓
[Deno Runtime]
  ├─ HTTP Server (Deno.serve)
  ├─ Git Smart HTTP Protocol handler
  ├─ Git Ops (clone / push / pull)
  ├─ Auth (SSH / Basic)
  ├─ Web UI handler
  └─ Database Gateway
      └─ SQLite driver
    ↓
[Storage]
  ├─ SQLite Database (metadata)
  └─ Bare Git Repos (FS)
```

---

## deno.json

正式バージョン表記は `v.{Major}.{Minor}` とする。`deno.json` に互換性上 `Major.Minor.Patch` 形式を記載する場合は、正式表記に対応する内部表記として扱う。

初回安定版リリース前は正式表記を `v.0.{Minor}` とし、`deno.json` 側では `0.{Minor}.0` に対応させる。安定版リリース系列では正式表記を `v.{Major}.{Minor}` とし、`deno.json` 側では `{Major}.{Minor}.0` に対応させる。たとえば `1.8.0` は正式表記 `v.1.8` に対応する。

```json
{
  "name": "adlaire-git-repository",
  "version": "1.8.0",
  "license": "CLOSED",
  "exports": "./src/main.ts",
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-write --allow-env --allow-run src/main.ts",
    "fmt": "deno fmt deno.json src/ tests/",
    "lint": "deno lint",
    "test": "deno test --allow-net=127.0.0.1,localhost --allow-read --allow-write --allow-env --allow-run tests/",
    "compile": "deno compile --allow-net --allow-read --allow-write --allow-env --allow-run --output=dist/adlaire-git-repo src/main.ts"
  },
  "compilerOptions": {
    "strict": true,
    "lib": ["deno.ns", "dom", "dom.iterable"]
  }
}
```

---

## プロジェクト構成

```
adlaire-git-repository/
├── AGENTS.md
├── README.md
├── deno.json
├── dist/                  (生成物)
│   └── adlaire-git-repo   (single binary)
├── tools/
│   └── check-adlaire-git-repository.sh
├── src/
│   ├── main.ts              (エントリーポイント)
│   ├── server.ts            (HTTP サーバー)
│   ├── config.ts            (設定)
│   ├── database/
│   │   ├── gateway.ts       (Database Gateway)
│   │   ├── schema.sql
│   │   ├── sql.ts
│   │   ├── sqlite_cli_driver.ts
│   │   └── types.ts
│   ├── domain/
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── issue.ts
│   │   ├── organization.ts
│   │   ├── phase2.ts
│   │   ├── phase3.ts
│   │   ├── repository.ts
│   │   ├── repository_path.ts
│   │   ├── ssh_key.ts
│   │   ├── user.ts
│   │   └── validation_error.ts
│   ├── git/
│   │   ├── git_service.ts
│   │   └── http_backend.ts
│   ├── http/
│   │   └── responses.ts
│   ├── repositories/
│   │   ├── audit_log_repository.ts
│   │   ├── issue_repository.ts
│   │   ├── organization_repository.ts
│   │   ├── phase2_repository.ts
│   │   ├── phase3_repository.ts
│   │   ├── repository_repository.ts
│   │   └── user_repository.ts
│   └── services/
│   │   ├── audit_service.ts
│   │   ├── auth_service.ts
│   │   ├── issue_service.ts
│   │   ├── organization_service.ts
│   │   ├── phase2_service.ts
│   │   ├── phase3_service.ts
│   │   └── repository_service.ts
├── tests/
│   ├── integration/
│   ├── support/
│   └── unit/
└── docs/
    ├── DOCUMENT_INDEX.md
    ├── plans/
    ├── policies/
    ├── specs/
    └── tpl-governance/
```

---

## セキュリティ

### 認証

- SSH keys (RSA / Ed25519)
- HTTP Basic Auth (HTTPS only)
- API tokens (hashed in DB)

### 暗号化

- HTTPS only (本番)
- Password hashing（方式は3類マスター仕様書とユーザー承認に基づき、外部ライブラリを使う場合は例外採用として扱う）
- Token storage (hashed)

### Audit

- 全操作ログ
- User tracking
- IP logging
- Timestamp 記録

---

## インストール・デプロイ

### ローカル開発

```bash
git clone https://github.com/adlaire/adlaire-git-repository.git
cd adlaire-git-repository
deno task dev
# http://localhost:8080
```

### Single Binary デプロイ

```bash
deno task compile
# ./dist/adlaire-git-repo が生成される

# VPS/オンプレで実行
./dist/adlaire-git-repo --port 8080
```

---

## デプロイ方針（Phase別）

### 共通基準

**推奨ホスティング（両者から選択）**

**【Option A】Xserver VPS 2GB プラン（推奨1）**
- CPU: 2 cores
- メモリ: 2GB
- ディスク: 50GB SSD
- 月額: ~1,100円
- 特徴: Xserver ブランド信頼性・ドメイン連携
- 注意: Phase 2-3 で容量監視必須

**【Option B】ConoHa VPS 2GB プラン（推奨2）**
- CPU: 2 cores
- メモリ: 2GB
- ディスク: 100GB SSD
- 月額: ~1,100円（キャンペーン時 678円～）
- 特徴: ディスク容量充実・容量管理が楽
- 推奨: 容量管理の負担を減らしたい場合

**選択基準**
```
✅ Xserver VPS: ドメイン管理・ブランド重視
✅ ConoHa VPS: ディスク容量・容量管理の楽さ重視
```

---

## ストレージ戦略

### Phase 1: Git基本機能

**構成**
```
SQLite: /home/gitrepo/db/gitrepo.db
Git repos: /home/gitrepo/repos/
ローカルディスク: 50GB SSD
```

**容量目安**
- SQLite: 50-100MB
- Git repos: 10-15GB
- ログ他: 2-3GB
- 合計: ~20GB（十分な余裕）

**バックアップ戦略**
```bash
# 日次バックアップ（cron で夜間実行）
$ sqlite3 /home/gitrepo/db/gitrepo.db ".dump" > /backup/gitrepo_$(date +\%Y\%m\%d).sql
$ tar -czf /backup/repos_$(date +\%Y\%m\%d).tar.gz /home/gitrepo/repos/

保持期間: 7日分
```

---

### Phase 2: PR/Issue/Wiki/Webhook/Release

**構成**
```
SQLite: /home/gitrepo/db/gitrepo.db
Git repos: /home/gitrepo/repos/
ローカルディスク: 50GB SSD
```

**容量目安**
- SQLite: 500MB-1GB
- Git repos: 25-35GB
- ログ他: 5-10GB
- 合計: ~30-40GB（容量監視必須）

**バックアップ戦略**
```
頻度: 1日 1回（夜間）
方法: SQLite dump + Git repos tar
保管: /backup（ローカル or 外部）
保持期間: 7日分
```

**リソース監視**
```
CPU使用率 > 80% → 4GB プランへアップグレード検討
メモリ使用率 > 85% → 4GB プランへアップグレード検討
ディスク使用率 > 80% → 古いログ削除
ディスク使用率 > 90% → 4GB プランへアップグレード or 容量削除
```

---

### Phase 3: Projects + Teams

**Option A: 単一インスタンス（容量限界に達した場合）**
```
推奨: 4GB プラン以上へアップグレード
理由: 50GB SSD では容量不足
```

**Option B: 複数インスタンス（推奨）**
```
VPS: Xserver 2GB プラン × 3台
共有ストレージ: NAS
  - SQLite をNAS上に配置
  - Git repos を NAS上に配置
  - 各VPSはマウントして利用

各インスタンスのディスク使用:
  OS + ローカルキャッシュ: 5-10GB
  ディスク余裕: 40GB以上
```

**バックアップ戦略**
```
方法: NAS へ自動同期（rsync / lsyncd）
頻度: リアルタイム同期推奨
保持期間: 30日分
リカバリ: NAS から復元（ダウンタイムなし）
```

---

## 運用方針

### バックアップ・リカバリ

**Phase 1-2**

```bash
# 自動バックアップ設定
$ crontab -e

# 毎日 02:00 に実行
0 2 * * * /opt/adlaire-git-repo/backup.sh

# backup.sh の内容
#!/bin/bash
DATE=$(date +\%Y\%m\%d)
BACKUP_DIR="/backup"

# SQLite バックアップ
sqlite3 /home/gitrepo/db/gitrepo.db ".dump" > $BACKUP_DIR/gitrepo_$DATE.sql

# Git repos バックアップ
tar -czf $BACKUP_DIR/repos_$DATE.tar.gz /home/gitrepo/repos/

# 7日以上前のバックアップを削除
find $BACKUP_DIR -mtime +7 -delete
```

**リカバリ手順**
```bash
# 1. サービス停止
$ systemctl stop adlaire-git-repo

# 2. バックアップから復元
$ sqlite3 /home/gitrepo/db/gitrepo.db < /backup/gitrepo_YYYYMMDD.sql
$ tar -xzf /backup/repos_YYYYMMDD.tar.gz -C /home/gitrepo/

# 3. サービス起動
$ systemctl start adlaire-git-repo

# 4. ヘルスチェック
$ curl http://localhost:8080/health
```

**Phase 3（NAS 利用時）**
```
NAS は自動複製機能 or スナップショット機能を活用
リカバリ: NAS スナップショットから復元（数秒）
```

---

### アップグレード手順

**Phase 1-2（ダウンタイムあり）**

```bash
# 1. 新バイナリの compile
$ deno task compile

# 2. バックアップ実行
$ /opt/adlaire-git-repo/backup.sh

# 3. サービス停止
$ systemctl stop adlaire-git-repo

# 4. 新バイナリへ置き換え
$ cp ./dist/adlaire-git-repo /opt/adlaire-git-repo/adlaire-git-repo

# 5. SQLite マイグレーション（必要な場合のみ）
# ドキュメントで指定あれば実行

# 6. サービス起動
$ systemctl start adlaire-git-repo

# 7. ヘルスチェック
$ curl http://localhost:8080/health

所要時間: 5-10分
推奨: 月1回深夜に実施
```

**Phase 3（複数インスタンス・ダウンタイムなし）**

```bash
# ロードバランサー（nginx等）を使用

# 各インスタンスを順番にアップグレード
for INSTANCE in server1 server2 server3; do
  # 1. ロードバランサーから切離し
  nginx_remove_upstream $INSTANCE

  # 2. アップグレード実行（Phase 1-2と同じ手順）
  ssh $INSTANCE
    systemctl stop adlaire-git-repo
    cp ./dist/adlaire-git-repo /opt/adlaire-git-repo/
    systemctl start adlaire-git-repo
    curl http://localhost:8080/health

  # 3. ロードバランサーに復帰
  nginx_add_upstream $INSTANCE

  # 4. 次のインスタンスへ（5分待機）
  sleep 300
done

ダウンタイム: なし
所要時間: 各インスタンス 5分 × 3 = 順次実施
```

---

### ロールバック手順

**問題発生時**

```bash
# 1. サービス停止
$ systemctl stop adlaire-git-repo

# 2. 前日のバックアップから復元
$ sqlite3 /home/gitrepo/db/gitrepo.db < /backup/gitrepo_YYYYMMDD.sql

# 3. 旧バイナリで起動
$ cp /opt/adlaire-git-repo/adlaire-git-repo.old /opt/adlaire-git-repo/adlaire-git-repo
$ systemctl start adlaire-git-repo

# 4. ヘルスチェック
$ curl http://localhost:8080/health

# 5. 問題原因を調査・修正
# 修正完了後に新バイナリで再度デプロイ
```

---

### ログ管理

**ログ保管**
```
場所: /var/log/adlaire-git-repo/
内容:
  - HTTP アクセスログ
  - Git 操作ログ
  - エラーログ
```

**ログローテーション**
```bash
# logrotate 設定
$ cat /etc/logrotate.d/adlaire-git-repo

/var/log/adlaire-git-repo/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 gitrepo gitrepo
}

# 毎日ローテーション、7日分保持
```

**ログ削除**
```bash
# 7日以上前のログを自動削除
$ crontab -e
0 3 * * * find /var/log/adlaire-git-repo -mtime +7 -delete
```

---

## Phase別デプロイ構成サマリー

### Phase 1: Git基本機能

**Xserver VPS**
```
VPS: 2GB × 1
ディスク: 50GB SSD
容量目安: ~20GB 使用（60%の余裕あり）
リソース: CPU 15-20% / メモリ 800-1000MB
バックアップ: 日次（ローカル）
アップグレード: ダウンタイムあり（月1回深夜）
推奨度: ⭐⭐⭐⭐ (十分)
```

**ConoHa VPS**
```
VPS: 2GB × 1
ディスク: 100GB SSD
容量目安: ~20GB 使用（80%の余裕あり）
リソース: CPU 15-20% / メモリ 800-1000MB
バックアップ: 日次（ローカル）
アップグレード: ダウンタイムあり（月1回深夜）
推奨度: ⭐⭐⭐⭐⭐ (最適・余裕あり)
```

---

### Phase 2: PR/Issue/Wiki/Webhook/Release

**Xserver VPS**
```
VPS: 2GB × 1（容量監視必須）
ディスク: 50GB SSD
容量目安: ~30-40GB 使用（10-20%の余裕）
リソース: CPU 25-35% / メモリ 1200-1500MB
バックアップ: 日次（ローカル or 外部）
監視: ディスク/メモリ/CPU 連続監視
対応:
  - ディスク > 80% → 古いログ削除
  - ディスク > 90% → 4GB プランへアップグレード
アップグレード: ダウンタイムあり（月1回深夜）
推奨度: ⭐⭐⭐ (容量管理の負担あり)
```

**ConoHa VPS**
```
VPS: 2GB × 1（容量に余裕）
ディスク: 100GB SSD
容量目安: ~30-40GB 使用（60-70%の余裕）
リソース: CPU 25-35% / メモリ 1200-1500MB
バックアップ: 日次（ローカル or 外部）
監視: ディスク/メモリ/CPU（定期的でOK）
対応: 容量管理の負担が少ない
アップグレード: ダウンタイムあり（月1回深夜）
推奨度: ⭐⭐⭐⭐⭐ (最適・容量管理が楽)
```

---

### Phase 3: Projects + Teams

**Xserver VPS**
```
【Option A】4GB プランへアップグレード
  - VPS: Xserver 4GB × 1
  - 月額: ~2,200円
  - ディスク: 100GB SSD
  - メリット: シンプル構成
  - デメリット: コスト増

【Option B】複数インスタンス構成
  - VPS: Xserver 2GB × 3台
  - 月額: 3,300円
  - 共有ストレージ: NAS
  - アップグレード: ダウンタイムなし
  - メリット: 可用性高い
  - デメリット: 運用複雑

推奨: Option B（複数インスタンス）
```

**ConoHa VPS**
```
【Option A】4GB プランへアップグレード
  - VPS: ConoHa 4GB × 1
  - 月額: ~2,500円
  - ディスク: 200GB SSD
  - メリット: 容量が最も充実
  - デメリット: コスト増

【Option B】複数インスタンス構成
  - VPS: ConoHa 2GB × 3台
  - 月額: 3,300円
  - 共有ストレージ: NAS
  - アップグレード: ダウンタイムなし
  - メリット: 可用性高い・容量充実
  - デメリット: 運用複雑

推奨: Option B（複数インスタンス）
```

---

## VPS選択ガイド

```
【Xserver VPS がおすすめ】
  ✅ ドメイン管理も Xserver で統一したい
  ✅ Xserver ブランドの信頼性を重視
  ✅ 長期利用で割引を活用したい
  ⚠ Phase 2以降は容量監視が必須
  ⚠ Phase 3では 4GB プランへのアップグレード検討

【ConoHa VPS がおすすめ】
  ✅ ディスク容量に余裕が欲しい
  ✅ 容量管理の手間を減らしたい
  ✅ 初期構築からスケーリングを視野に
  ✅ キャンペーン活用で安価運用
  ✅ Phase 1-3 全てで容量に余裕
```

---

## Web UI デザイン仕様

Phase 5 では、補助的リリース判定に合わせて、Web UI のデザイン関連改良・改修方針を整理する。

Phase 5 のデザイン関連改良・改修は、情報設計、画面レイアウト、視覚表現、操作導線、アクセシビリティ、可読性の改善を対象とする。UI は GitHub 互換の対象外であり、本プロジェクト独自 UI として改良・改修する。

Phase 5 のデザイン関連改良・改修では、外部フレームワークを採用してはならない。外部ライブラリまたは外部ツールが必要な場合は、2類ポリシーに従い、例外採用としてユーザー承認を得る。

Phase 5 では、トップページの Web UI を対象に、ヘッダー、ステータス領域、ユーザー登録、API token 発行、Repository 作成、Repository 一覧の情報設計と表示品質を改善する。既存 API と既存ドメイン機能は変更せず、外から見た主要ワークフローを維持する。

## Phase 6 安定版準備仕様

Phase 6 は、Phase 7 のデフォルト安定版リリース判定へ進むための準備フェーズである。Phase 6 自体は安定版リリース対象ではない。

Phase 6 では、database schema、Database Gateway、Repository 層、Service 層の責務境界を維持する。既存 API と既存ドメイン機能は維持しつつ、認証、権限、Git Smart HTTP、SQLite 外部キー、入力エラー応答、重複応答、Registry 一覧制御、HTTP Authorization scheme の大小文字処理、Webhook secret API 非露出、Team member の Organization member 境界等の既知バグ修正、ドキュメント整合性向上、移行・ロールバック前提整理、主要 workflow 検証を行う。

Phase 6 から Phase 5 相当へ戻す場合、データ構造の migration は不要である。ロールバックは、SQLite database、bare repository、設定、配布 binary のバックアップを前提に行う。

## Phase 7 安定版リリース判定仕様

Phase 7 は、Phase 6 までの成果を対象に、7系フェーズのデフォルト安定版リリース判定を行うフェーズである。

Phase 7 の基準バージョンは、安定版リリース判定前は `v.0.8` とする。初回安定版リリースとして承認された場合のみ、安定版系列 `v.1.8` へ進める。

Phase 7 では、既存 API、既存ドメイン機能、database schema、Database Gateway、Repository 層、Service 層の責務境界を維持する。安定版リリース判定では、既知バグ、主要 workflow、リリースノート、既知制約、対象外機能、backup / restore 手順、リポジトリ全体の整合性を確認する。

Phase 7 はデフォルト安定版リリース判定フェーズであるが、自動的な公開フェーズではない。Phase 7 着手時点では、tag 作成、GitHub Releases 作成、成果物配置、release notes 公開、`v.1.8` への移行は、リリース提案と別途ユーザー承認を得るまで行わない。

ユーザー承認に基づき、Phase 7 は初回安定版リリース `v.1.8` として確定する。リリース成果物は Deno single binary を主対象とし、GitHub Releases に release notes、manifest、checksum とともに配置する。

### 採用デザイン

**構成3: Clean Modern + 独自ナビゲーション + Dark Mode 統合版**

```
基本構造:
  - サイドバー: Clean Modern（プロジェクト・ユーザー管理）
  - トップナビゲーション: 独自設計（Repositories/Issues/PR等の用語は機能互換に基づく）
  - ダークモード: オプション・ユーザー設定で切り替え
  - カラー: #00a968（Emerald Green）統一

メリット:
  ✅ Clean Modern の実装シンプルさ
  ✅ GitHub の機能用語に近い理解しやすさ
  ✅ Dark Mode の長時間利用対応
  ✅ 複雑な操作と直感的なUIの融合
  ✅ Phase 1-3 全てに対応可能
```

---

### ページ構成（ライトテーマ）

```
┌─────────────────────────────────────────────┐
│ Header (Dark: #1a1a2e)                      │
│  Logo  [ Repositories | Issues | PRs | Wiki]│
├──────────────┬──────────────────────────────┤
│   Sidebar    │     Main Content              │
│ (Design 1)   │   (Design 3 Style)            │
│              │                              │
│📁 All Repos  │ [Tabs: Code|Issues|PR|...]   │
│⭐ Starred    │                              │
│👤 My Proj    │ Repository List / Details    │
│👥 Orgs       │                              │
│              │                              │
│⚙️ Settings   │                              │
│📋 Admin      │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

---

### ページ構成（ダークテーマ）

```
┌─────────────────────────────────────────────┐
│ Header (Dark: #0d1117)                      │
│  Logo  [ Repositories | Issues | PRs | Wiki]│
├──────────────┬──────────────────────────────┤
│   Sidebar    │     Main Content              │
│ (Dark: #1a1a2e)  (Dark: #0d1117)            │
│              │                              │
│📁 All Repos  │ [Tabs: Code|Issues|PR|...]   │
│⭐ Starred    │                              │
│👤 My Proj    │ Repository List / Details    │
│👥 Orgs       │                              │
│              │                              │
│⚙️ Settings   │                              │
│📋 Admin      │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

---

### カラースキーム

**ライトテーマ**
```
Primary Color:      #00a968 (Emerald Green)
Dark Background:    #1a1a2e (Header)
Light Background:   #f9f9f9 (Sidebar)
White:              #ffffff (Content)
Text Dark:          #333333 (Body text)
Text Light:         #666666 (Secondary)
Border:             #e0e0e0
Hover:              #f5f5f5
```

**ダークテーマ**
```
Primary Color:      #00a968 (Emerald Green)
Dark Background:    #0d1117 (Main)
Surface:            #161b22 (Cards/Components)
Sidebar:            #1a1a2e
Text Light:         #c9d1d9
Text Secondary:     #8b949e
Border:             #30363d
Hover:              #1c2128
```

---

### コンポーネント仕様

#### Header（共通）

```
構成:
  - Logo + Brand Name（左）
  - ナビゲーションタブ（中央）
  - ユーザーメニュー + テーマ切り替え（右）

ナビゲーションタブ:
  - Repositories
  - Issues
  - Pull Requests
  - Wiki
  - Discussions（Phase 3）
  - Admin（管理者のみ）

高さ: 60px
```

#### Sidebar（Design 1ベース）

```
構成:
  【セクション1】メイン操作
    - 📁 All Repositories
    - ⭐ Starred
    - 👤 My Projects
    - 👥 Organizations

  【セクション2】システム管理
    - ⚙️ Settings
    - 📋 Admin

スタイル:
  - 幅: 250px
  - Background: Light #f9f9f9 / Dark #1a1a2e
  - アクティブ: #00a968（背景色）
  - ホバー: Light #e8e8e8 / Dark #2a2a3e

レスポンシブ:
  - Mobile: 引き出し式メニュー（ハンバーガー）
  - Tablet: 常表示
  - Desktop: 常表示
```

#### Main Content（Design 3ベース）

```
構成:
  - Header Tabs（Code/Issues/PR等）
  - Filter/Search Bar
  - Content Area（Repository List/Details等）

タブ:
  - Code: リポジトリ一覧・詳細
  - Issues: Issue トラッキング
  - Pull Requests: PR レビュー
  - Wiki: ドキュメント
  - Discussions: チームコミュニケーション

スタイル:
  - Tabs: Light #ffffff / Dark #161b22
  - Border: #e0e0e0 / #30363d
  - Active Tab Border: #00a968
```

#### Repository Card

```
構成:
  - Repository Name（プライマリカラーのリンク）
  - Description
  - Tags（言語等）
  - Metadata（⭐ Star数・更新日時等）

スタイル:
  - Border: 1px solid #e0e0e0 / #30363d
  - Border Radius: 6px
  - Padding: 16px
  - Hover: Border Color → #00a968
```

#### テーマ切り替え

```
場所: Header 右側（ユーザーメニュー近く）

実装:
  - 太陽/月アイコン切り替え
  - ユーザー設定に保存（LocalStorage / DB）
  - システム設定も対応（OS ダークモード自動検出）

オプション:
  - Light Mode
  - Dark Mode
  - Auto (OS 設定に依存)
```

---

### Typography

```
Font Family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

Font Sizes:
  - Header: 20px / 600 weight
  - Page Title: 24px / 700 weight
  - Section Title: 18px / 600 weight
  - Body Text: 14px / 400 weight
  - Small Text: 12px / 400 weight
  - Labels: 13px / 500 weight

Line Height:
  - Headers: 1.2
  - Body: 1.6
  - Labels: 1.4
```

---

### レスポンシブ ブレークポイント

```
Mobile (< 768px):
  - Sidebar: 引き出し式メニュー
  - Main Content: 全幅
  - Tabs: 横スクロール対応
  - Grid: 1列

Tablet (768px - 1024px):
  - Sidebar: 常表示（縮小版）
  - Main Content: 残り幅
  - Grid: 1-2列

Desktop (> 1024px):
  - Sidebar: 常表示（標準）
  - Main Content: 残り幅
  - Grid: 複数列
```

---

### アクセシビリティ

```
✅ WCAG 2.1 AA準拠

コントラスト:
  - Text: 4.5:1（AAA）
  - UI Components: 3:1（AA）

キーボード操作:
  - Tab 順序最適化
  - Focus visible インジケーター
  - Escape キーでモーダル閉じる

スクリーンリーダー:
  - ARIA ラベル設定
  - Semantic HTML 使用
  - Link/Button 役割明確化

Focus Indicators:
  - Color: #00a968
  - Outline: 2px solid
  - Offset: 2px
```

---

### アニメーション

```
Transition:
  - Hover状態: 0.2s ease
  - Color change: 0.2s ease
  - Opacity: 0.15s ease

No Jank:
  - will-change 使用（パフォーマンス最適化）
  - transform 推奨（GPU加速）

Preferes-reduced-motion:
  - システム設定で自動検出
  - アニメーション無効化対応
```

---

### パフォーマンス目標

```
Load Time:
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1

Optimization:
  ✅ Lazy loading images
  ✅ CSS minification
  ✅ JavaScript bundling
  ✅ Gzip compression
  ✅ CDN caching
```

---

### 実装フェーズ

**Phase 1: Git基本機能**
```
実装:
  - Header（ライトテーマのみ）
  - Sidebar（基本機能）
  - Repository List
  - Detail View

デザイン完成度: 75%
テーマ: ライトテーマのみ
```

**Phase 2: PR/Issue/Wiki/Webhook/Release**
```
追加:
  - Issues/PR タブ
  - Wiki セクション
  - ダークテーマ基本実装
  - テーマ切り替え機能

デザイン完成度: 85%
テーマ: ライト + ダーク（β）
```

**Phase 3: Projects + Teams**
```
追加:
  - Projects (Kanban) ビュー
  - Organizations/Teams UI
  - Discussions タブ
  - ダークテーマ完全実装
  - Advanced UI components

デザイン完成度: 95%
テーマ: ライト + ダーク（正式版）
```

---



```
□ SSH キーペア設定
□ ファイアウォール設定（SSH/HTTP/HTTPS のみ許可）
□ SSL証明書取得（Let's Encrypt）
□ nginx リバースプロキシ設定
□ バックアップ環境構築
□ ログローテーション設定
□ ヘルスチェック確認
□ 負荷テスト実施
□ セキュリティ監査
□ 運用マニュアル整備
```

---

## 実装機能候補リストとの関係

GitHub 機能、OSS Git ホスティング機能、将来拡張機能の候補分類、優先候補、保留候補、選定理由は `docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` で管理する。

本書では、正式仕様として確定した機能の振る舞い、データ、権限、セキュリティ、運用要件を管理する。候補リストに記載された機能であっても、本書、`docs/specs/Auris_System_Design.md`、`docs/plans/DEVELOPMENT_PLAN.md` に反映され、ユーザー承認を得るまでは実装対象ではない。

Phase 別の実装対象、対象外、完了条件、検証範囲は `docs/plans/DEVELOPMENT_PLAN.md` を正とする。候補リストと本書またはマスター開発計画に差異がある場合は、本書とマスター開発計画を正とし、候補リストを整理する。

---

---

## CI/CD 自動化方針

### 基本方針

**短期**: GitHub Actions 採用
- 効率優先
- GitHub でコード管理 → 自動ビルド・デプロイ
- SSH で VPS へ転送・実行

**長期**: 内製化方針は検討段階
- 自社製 CI/CD ツール開発検討中
- 実装タイミング未定

---

## CI/CD 自動化ツール比較

### クラウド型

**GitHub Actions（推奨）**
```
利点:
  ✅ GitHub 標準機能
  ✅ public repo なら無料
  ✅ SSH デプロイ可能
  ✅ Deno サポート
  ✅ 追加セットアップ不要

欠点:
  ❌ GitHub 依存
  ❌ ネットワークレイテンシー（小）

価格: 無料（public repo）
推奨度: ⭐⭐⭐⭐⭐ (最適)
```

**GitLab CI/CD**
```
利点:
  ✅ GitLab 標準
  ✅ 無料プラン充実
  ✅ SSH デプロイ可能

欠点:
  ❌ GitHub でコード管理する場合は非適

価格: 無料（基本機能）
推奨度: ⭐⭐⭐ (GitHub 使用時は不推奨)
```

**CircleCI**
```
利点:
  ✅ クラウドホスト型
  ✅ SSH デプロイ可能
  ✅ 高機能

欠点:
  ❌ 有料（フリープランあり）

価格: 有料（月 $30-）
推奨度: ⭐⭐ (有料・代替手段あり)
```

---

### 自ホスト型

**Jenkins**
```
利点:
  ✅ 完全自由度・高機能
  ✅ VPS 上で実行可能
  ✅ 拡張性高い

欠点:
  ❌ セットアップ複雑
  ❌ 管理負荷高い
  ❌ 学習コスト高い

価格: 無料（OSS）
推奨度: ⭐⭐ (エンタープライズ向け)
```

**DroneCI**
```
利点:
  ✅ 軽量・シンプル
  ✅ 小規模チーム向け

欠点:
  ❌ 現行の Docker 採用禁止方針と衝突する
  ❌ カスタマイズ性は Jenkins より低い

価格: 無料（OSS）
推奨度: 採用不可
```

**Gitea Actions / Forgejo CI**
```
利点:
  ✅ セルフホスト型 Git 統合
  ✅ GitHub Actions 互換
  ✅ Adlaire Git Repository との親和性高い

欠点:
  ❌ まだ検討段階（内製化時）

価格: 無料（OSS）
推奨度: ⭐⭐⭐⭐ (内製化時に有力候補)
```

---

## GitHub Actions デプロイ例

### ワークフロー設定（.github/workflows/deploy.yml）

```yaml
name: Deploy Adlaire Git Repository

on:
  push:
    branches: [main]
  workflow_dispatch:  # 手動実行も可

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: vx.x.x

      - name: Run tests
        run: deno task test

      - name: Lint
        run: deno lint src/

      - name: Format check
        run: deno fmt --check src/

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: vx.x.x

      - name: Compile binary
        run: deno task compile

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: adlaire-git-repo
          path: ./dist/adlaire-git-repo

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: adlaire-git-repo

      - name: Deploy to VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
          VPS_SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$VPS_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H $VPS_HOST >> ~/.ssh/known_hosts

          # VPS へ転送
          scp -i ~/.ssh/id_ed25519 \
            ./dist/adlaire-git-repo \
            $VPS_USER@$VPS_HOST:/tmp/adlaire-git-repo.new

          # VPS 側でデプロイ実行
          ssh -i ~/.ssh/id_ed25519 $VPS_USER@$VPS_HOST << 'EOF'
          set -e

          # バックアップ実行
          /opt/adlaire-git-repo/backup.sh

          # サービス停止
          systemctl stop adlaire-git-repo

          # バイナリ置き換え
          mv /tmp/adlaire-git-repo.new /opt/adlaire-git-repo/adlaire-git-repo
          chmod +x /opt/adlaire-git-repo/adlaire-git-repo

          # サービス起動
          systemctl start adlaire-git-repo

          # ヘルスチェック
          sleep 2
          curl -f http://localhost:8080/health || exit 1
          EOF

      - name: Notify on success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '✅ デプロイ成功'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '❌ デプロイ失敗 - ロールバック実施'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### GitHub Secrets 登録

```bash
# VPS_HOST: git.example.com
# VPS_USER: gitrepo
# VPS_SSH_KEY: (Ed25519 秘密鍵)
# SLACK_WEBHOOK: (Slack 通知用・オプション)
```

### SSH キー生成（VPS 側）

```bash
# VPS 上で実行
$ ssh-keygen -t ed25519 -f /home/gitrepo/.ssh/github-actions -N ""

# 公開鍵を authorized_keys に追加
$ cat /home/gitrepo/.ssh/github-actions.pub >> /home/gitrepo/.ssh/authorized_keys

# 秘密鍵を GitHub Secrets に登録
$ cat /home/gitrepo/.ssh/github-actions
# コンテンツをコピー → GitHub Secrets に登録
```

---

## 内製化検討事項

### Gitea Actions / Forgejo CI 統合（未定）

**検討中の課題**
```
□ Adlaire Git Repository と同一サーバー上で CI/CD 実行
□ ビルド・テスト・デプロイを自動化
□ GitHub Actions 互換ワークフロー対応
□ スケーラビリティ（複数インスタンス対応）

実装タイミング: Phase 3以降検討
```

---

---

## 標準デプロイ方式

### 基本方針

Docker は全用途で例外なく採用禁止とする。標準デプロイは、Deno single binary を VPS または専用サーバーへ配置し、ホストOS上で直接実行する方式に限定する。

標準構成は以下を基本とする。

- `deno compile` による single binary 生成
- release directory への成果物配置
- `current` symlink による稼働版切り替え
- systemd または同等のサービス管理
- SQLite database、Git repository、log のホストOSファイルシステム上での永続保存
- 配置前バックアップ
- `/health` による health check
- 直前 release directory への rollback

開発、検証、本番、デプロイのいずれでも、コンテナ前提の成果物、設定、手順、検証を追加してはならない。

---



### 準備

- [ ] Deno インストール（固定バージョンはユーザー承認後に確定）
- [ ] Git インストール（固定バージョンはユーザー承認後に確定）
- [ ] Repository 作成
- [ ] Team onboarding
- [ ] CI/CD パイプライン

### 開発

- [ ] SQLite schema 設計
- [ ] HTTP server 実装
- [ ] Git Smart HTTP 実装
- [ ] Authentication 実装
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### リリース

- [ ] Security audit
- [ ] Performance test
- [ ] Binary compile
- [ ] リリースドキュメント

---

## 完成

```
✅ Adlaire Group 内部向け Git ホスティングプロバイダー
✅ Deno + TypeScript + SQLite + Git
✅ ソースコード管理に特化
✅ シンプル・軽量（GitPrep ベース）
✅ ワンバイナリ起動
✅ 外部ライブラリは内製境界に閉じ込める
✅ フレームワーク採用禁止（内製化）
```
