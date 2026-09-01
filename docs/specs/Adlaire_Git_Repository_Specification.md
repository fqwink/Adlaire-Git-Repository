# Adlaire Git Repository

**文書バージョン**: v.2.12
**ステータス**: Phase 10 Adlaire Deploy DB 不使用仕様確定
**ベース**: GitPrep（セルフホスト型 Git ホスティング）
**技術スタック**: Deno + TypeScript + libSQL + Git

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
- 外部依存は必要最小限とし、Deno 標準ライブラリ、標準DBの libSQL、既存データ移行元確認用の SQLite を中心に扱う
- ワンバイナリで起動

**対象ユーザー**
- 開発者（ソースコード push / pull）
- プロジェクトオーナー（リポジトリ管理）
- IT 管理者（ユーザー・アクセス管理）

---

## 本書の読み方

本書は、Adlaire Git Repository 本体の個別3類マスター仕様書である。

現行仕様判断では、以下を優先して読む。

1. 本書の「現行正本仕様」
2. `docs/specs/Auris_System_Design.md`
3. 本書の各機能仕様
4. `docs/plans/DEVELOPMENT_PLAN.md`
5. フェーズ別の実装履歴と検証記録

Phase 1 から Phase 7 までの記述は、実装済みまたはリリース済みの履歴を含む。履歴は削除せず保持するが、現行方針と異なる古い表記がある場合は、本書の現行正本仕様、`docs/specs/Auris_System_Design.md`、2類ポリシー、マスター開発計画を正とする。

本書の完成は、ソースコード実装承認を意味しない。新規実装、既存実装変更、DB driver 実装、schema 変更、テスト変更、デプロイ実行は、別途ユーザー承認を得る。

## 現行正本仕様

Adlaire Git Repository 本体の現行正本仕様は以下とする。

- Adlaire Group 内部向けのセルフホスト型 Git ホスティング基盤とする。
- 基本的な機能互換は GitHub 互換基準とする。
- UI、画面デザイン、画面レイアウト、視覚表現は GitHub 互換対象外とする。
- 標準ランタイムは Deno、標準言語は TypeScript とする。
- 標準データベースは libSQL とする。
- SQLite 互換維持は行わず、SQLite は既存データ移行元確認用としてのみ扱う。
- DBアクセスは Database Gateway、Repository 層、driver 層を経由し、SQLite または libSQL を上位層から直接触らない。
- `DB_DRIVER=libsql` を標準 driver とする。
- `DB_DRIVER=sqlite` は標準運用、互換維持、最小ローカル検証用として扱わず、既存データ移行元確認が必要な場合に限って別途承認を得て扱う。実装上も通常運用では拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ許可する。
- Deno single binary を正本成果物とする。
- Docker は正本成果物である Deno single binary を image に同梱して実行する運用選択肢の一つとする。
- Docker 使用時も非 Docker の binary 直実行時も、同じ system / data 分離構成とする。
- data 側は host filesystem を正本とし、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests を保護対象とする。
- Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは標準採用ではなく、将来候補として保留する。
- Node.js runtime、npm ecosystem、外部フレームワーク、無承認外部ライブラリは採用しない。
- Adlaire Deploy は Phase 10 の着手対象であり、Adlaire Git Repository 本体へ統合せず、DB 不使用の付随システムとして同居・連携する。

## マスター仕様完成条件

本書は、以下を満たす状態をマスター仕様完成版とする。

- 現行正本仕様、フェーズ別履歴、保留候補、対象外範囲を分離している。
- GitHub 機能互換方針と GitHub UI 非互換方針を同時に定義している。
- Repository、User、Auth、Git Smart HTTP、Issue、Pull Request、Code Review、Wiki、Webhook、Release、Organizations、Teams、Projects、Adlaire 内製 Deno Module Registry、Audit、Operations、REST API、Web UI、Deployment、Database の主要境界を追跡できる。
- libSQL 標準DB方針と SQLite 互換維持なし方針が矛盾していない。
- Deno single binary 正本成果物方針、Docker 運用選択肢、host filesystem data 正本方針が矛盾していない。
- 保留候補は、保留解除とユーザー承認なしに実装対象へ戻らない。
- 仕様書、マスター開発計画、マスター実装機能候補リスト、README の参照関係が整合している。

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

Phase 3 時点の libSQL 再評価では、SQLite を当時の現行 driver として維持し、Database Gateway 境界を保ったまま将来の libSQL 移行可能性を保持した。現行正本仕様では libSQL を標準DB、SQLite を既存データ移行元確認用として扱い、SQLite 互換維持は行わない。

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
| **DB** | libSQL（Database Gateway / libSQL driver 経由） |
| **Git** | Deno.Command |
| **認証** | SSH / HTTP Basic |
| **UI** | HTML + Vanilla JavaScript（内製） |

**原則**:
- Deno 標準機能と承認済みの最小外部依存のみ
- フレームワーク採用禁止（内製化のみ）
- Deno 標準ライブラリを最優先候補とする。ただし、個別モジュールの採用はユーザー承認を必須とする
- JSR レジストリの公開ライブラリは採用可能とする。ただし、ユーザー承認を得るまで採用禁止とする
- JSR レジストリの公開ライブラリであっても、npm 互換、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。承認済み例外ライブラリとして明記された場合を除き、`npm:` specifier を導入してはならない
- JSR へ公開する package は、公開可能なオープンソースコードであることを前提とする
- クローズドライセンス、内部専用、非公開資産は JSR へ公開しない
- クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする
- Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する
- npm registry 互換レジストリは標準採用しない
- 必要最小限の外部ライブラリ
- 外部ライブラリは内製ラッパー、内製driver、または Database Gateway の内部に閉じ込める
- Deno、SQLite、libSQL、Git、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリは、各技術の最新の安定版を採用方針とする
- TypeScript は 6系の最新安定版を採用方針とする
- Deno single binary 形式を正本成果物とする
- Docker は正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つとする
- Docker 使用時も非 Docker の binary 直実行時も同じ system / data 分離構成にする
- libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として system 側から分離する
- 承認済み固定採用バージョンは、下表に従う

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | 既存データ移行元確認用。互換維持・最小検証用として扱わない |
| libSQL | `libsql-server v0.24.32` | 標準データベース |
| `@libsql/client` | `v0.17.4` | Phase 8 DB driver 実装の承認済み例外ライブラリ |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定とする。

### データベース採用方針

標準採用するデータベースエンジンは libSQL とする。

SQLite は既存データ移行元確認用としてのみ扱う。

標準データベースは libSQL とする。

SQLite 互換維持、SQLite 最小ローカル検証用運用、SQLite 標準DB運用は行わない。

libSQL は必要最小限の外部依存に該当するが、DB抽象化設計との相性、将来の同期・分散構成への拡張余地という採用メリットが高いため、標準データベースとして扱う。

libSQL driver は Phase 8 の承認済み実装対象とする。`@libsql/client v0.17.4` は承認済み例外ライブラリとして採用する。外部ライブラリAPIは内製 `libsql` driver と Database Gateway の内部に閉じ込め、サービス層やRepository層へ直接露出させない。`deno.lock` は承認済み例外ライブラリの解決結果を固定するために管理し、未承認の依存追加を許可するものではない。

`@libsql/client` の native loader が Deno 実行時に FFI と system 情報の `cpus`、`networkInterfaces`、`hostname` 参照を要求するため、Deno task では `--allow-ffi` と `--allow-sys=cpus,networkInterfaces,hostname` を許可対象に加える。`--allow-ffi` は libSQL native loader のための承認済み権限であり、アプリケーションコードから Deno FFI API を直接使うことは認めない。これは libSQL driver 実行に必要な最小権限であり、`--allow-sys` 全許可や libSQL driver 以外の system 情報参照を標準化するものではない。

Turso Cloud 等のクラウドDBホスティングを採用するかどうかは未定とする。クラウドDBホスティングは新しいデータベースエンジンではなく、libSQL の接続先または運用形態の候補として扱う。採用する場合は、外部サービス依存、データ所在、認証トークン管理、バックアップ、障害時の復旧、運用費用を評価し、例外採用としてユーザー承認を得る。

libSQL 標準化のため、DBアクセスは Database Gateway と専用 driver 層に集約する。SQLite 互換維持は行わず、libSQL 固有機能へ依存する場合はマスター仕様書に明記する。

### 標準運用基盤方針

Adlaire Git Repository 本体の標準運用基盤は、self-host、VPS、専用サーバーを前提とする。

最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。Docker 使用時も非 Docker の binary 直実行時も、この構成を変えてはならない。Git ホスティング本体は、Git bare repository の永続保存、`git` コマンド実行、ファイルシステム、容量管理、バックアップ、復旧、権限管理を中核とする。そのため、data 側は container lifecycle に依存させず、host filesystem 上で直接保全できる構成を基準にする。

本番サーバ環境へのデプロイは、Deno single binary 正本成果物、必要に応じた Docker image、host filesystem data 領域、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。詳細は `docs/policies/DEPLOYMENT_POLICY.md` を正本とする。

Adlaire Deploy は Phase 10 の着手対象であり、個別3類マスター仕様書 `docs/specs/Adlaire_Deploy_Specification.md` を正本とする。Adlaire Git Repository 本体へ統合せず、DB 不使用の付随システムとして同居・連携し、Release manifest、checksum、health check endpoint、Audit log、標準デプロイ雛形、SSH、filesystem path の境界を保持する。

Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは、標準採用ではなく将来候補として保留する。検討する場合は、補助API、管理機能、Webhook 受信、読み取り専用ミラー等の補助的用途を優先して評価し、Git repository 実体保存、Git 操作、永続ファイル、バックアップ、復旧、データ所在、認証情報管理、運用費用、Deno 固定バージョン、Node.js / npm 非依存方針との整合を確認する。

Deno Deploy を採用候補にする場合も、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を前提にしてはならない。

Turso Cloud 等のクラウドDBサービスを採用候補にする場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。

### データベースアクセス層仕様

SQLite または libSQL を直接触る設計は禁止する。

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
libSQL driver（標準） / SQLite driver（移行元確認用）
```

各層の責務は以下とする。

| 層 | 責務 |
|---|---|
| サービス層 | ユースケース、権限確認、トランザクション要求 |
| Repository 層 | エンティティ単位の保存・取得・検索 |
| Database Gateway | 接続、SQL 実行、トランザクション、driver 差し替え境界 |
| libSQL driver | 標準DBアクセス実装 |
| SQLite driver | 既存データ移行元確認用。標準運用、互換維持、最小ローカル検証用として扱わない |

禁止事項:

- HTTP ハンドラーから SQLite または libSQL 接続を直接生成すること
- サービス層から生 SQL を直接実行すること
- Git 操作処理から DB ファイルを直接読み書きすること
- migration をアプリケーション各所に分散させること
- SQLite / libSQL 固有機能を Repository 層より上位へ漏らすこと

標準 driver は `DB_DRIVER=libsql` とする。`DB_DRIVER=sqlite` は標準運用、互換維持、最小ローカル検証用として扱わず、既存データ移行元確認が必要な場合に限って別途承認を得て扱う。実装上も通常運用では拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ許可する。クラウドDBホスティングを採用する場合も、`DB_DRIVER=libsql` の接続先設定として扱い、`DB_DRIVER=turso` 等のホスティングサービス名を driver 名にしてはならない。

移行計画を立てやすくするため、初期実装時点から以下を固定する。

- `DB_DRIVER` による driver 選択
- `DB_URL` による接続先指定
- `DB_AUTH_TOKEN` による認証情報指定
- libSQL 前提の schema と query 方針
- Repository 層より上位へ driver 固有 API を漏らさない境界
- 外部ライブラリAPIを Database Gateway より上位へ漏らさない境界
- libSQL 標準運用と既存データ移行元 SQLite 確認を分離したテスト構成

schema、migration、seed は専用ディレクトリに集約し、Database Gateway からのみ適用する。

### Phase 8 DB 仕様

Phase 8 は、Adlaire Git Repository 本体の DB 仕様完成フェーズである。

Phase 8 では、標準データベースを libSQL として扱い、SQLite 互換維持を行わない。SQLite は既存データ移行元確認用に限定し、標準運用、互換維持、最小ローカル検証用として扱わない。

Phase 8 の DB 接続仕様は以下とする。

| 項目 | 仕様 |
|---|---|
| 標準 driver | `DB_DRIVER=libsql` |
| 接続先 | `DB_URL` |
| 認証情報 | `DB_AUTH_TOKEN` |
| driver ライブラリ | `@libsql/client v0.17.4` を承認済み例外ライブラリとして使用 |
| migration 適用 | Database Gateway 経由 |
| schema / seed | 専用ディレクトリへ集約 |
| SQLite | 既存データ移行元確認用。利用時は別途承認 |
| Cloud DB hosting | 未定。採用時も libSQL 接続先差し替えとして扱う |

Phase 8 では、DB driver の外部ライブラリ API を Database Gateway より上位へ露出させない。Repository 層は永続化要求を表現し、接続、SQL 実行、トランザクション、migration、driver 差し替えは Database Gateway と driver 層の責務とする。

Phase 8 の対象外は以下とする。

- SQLite 互換維持
- SQLite 標準DB運用
- SQLite 最小ローカル検証用運用
- `DB_DRIVER=sqlite` の標準化
- `DB_DRIVER=turso` 等のホスティングサービス名の driver 化
- Turso Cloud、Deno Deploy、その他クラウドDBホスティングの標準採用
- HTTP ハンドラー、Web UI、サービス層、Git 操作処理からの DB 直接アクセス
- 承認なしの schema、migration、seed、テストコード、外部依存の変更

Phase 8 の検証では、標準 driver が libSQL であること、SQLite が移行元確認用に限定されていること、上位層へ driver 固有 API が漏れていないこと、主要 workflow が Database Gateway 経由で永続化されることを確認する。

### Phase 8.1 本体整合性仕様

Phase 8.1 は、Phase 8 の DB 仕様に合わせて Adlaire Git Repository 本体を整合するフェーズである。

Phase 8.1 では、以下を確認対象とする。

- 1類ルールブック
- 2類ポリシー
- 3類マスター仕様書
- マスター開発計画
- マスター実装機能候補リスト
- README
- 実装と DB schema
- テストと検証導線
- バージョン表記
- Pull Request 説明

Phase 8.1 では、SQLite 標準運用、SQLite 互換維持、libSQL 将来候補扱い、DB 直接アクセスを前提にした記述または実装が残っていないことを確認する。矛盾が見つかった場合は、Phase 8.1 の完了前に補正する。

`DB_DRIVER=sqlite` は通常運用経路として利用できない。既存データ移行元確認が承認済みの場合に限り、`ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定して SQLite driver を使用できる。この条件は、SQLite 互換維持または SQLite 標準運用を意味しない。

### Phase 8.5 System / Data 分離仕様

Phase 8.5 は、Adlaire Git Repository 本体の system 側と data 側を分離するフェーズである。

system 側は差し替え可能な構成要素として扱う。

| system 側 | 扱い |
|---|---|
| Deno single binary | 正本成果物 |
| Docker image | 正本 binary を同梱する運用選択肢 |
| Docker container | 実行単位 |
| docker compose | Docker 運用時の起動定義 |
| systemd service または同等 | binary 直実行時の起動管理候補 |
| deploy script | 承認済み範囲の配置・検証補助 |

data 側は保護対象として扱い、host filesystem を正本とする。

| data 側 | 扱い |
|---|---|
| libSQL database | 標準DBの永続データ |
| 移行元 SQLite database | 既存データ移行元確認用 |
| Git bare repositories | Git repository 実体 |
| config | 設定 |
| secrets | 秘密情報 |
| logs | 運用ログ |
| backups | バックアップ |
| manifests | デプロイ、バックアップ、検証の運用記録 |

Docker 使用時も、Docker を使用しない binary 直実行時も、同じ data 側構成を使用する。Docker named volume を data 正本として扱ってはならない。

標準パスは以下とする。

```text
ADLAIRE_APP_ROOT=/opt/adlaire-git-repository
ADLAIRE_SHARED_DIR=/opt/adlaire-git-repository/shared
ADLAIRE_DATA_DIR=/opt/adlaire-git-repository/shared/data
ADLAIRE_REPOSITORY_ROOT=/opt/adlaire-git-repository/shared/data/repositories
DB_URL=file:/opt/adlaire-git-repository/shared/data/database/adlaire.libsql
```

標準デプロイ雛形では、`system/releases` と `system/current` を稼働版差し替え単位とし、`shared/logs/deploy.log` と `shared/manifests` を運用記録の保存先とする。

### Phase 8.7 安定化仕様

Phase 8.7 は、Phase 8、Phase 8.1、Phase 8.5 の成果を対象にした安定化フェーズである。

Phase 8.7 では、DB 標準化、Database Gateway 境界、system / data 分離、backup / restore / rollback、主要 workflow、ドキュメント整合性に関する既知バグを洗い出し、修正する。

Phase 8.7 の検証は、意味のあるテストまたは代替検証に限定する。失敗時に壊れた仕様を説明できないテスト、内部実装に過剰依存するテスト、確信にも説明にも寄与しない冗長なテストを追加してはならない。

### Phase 9 安定版判定仕様

Phase 9 は、Phase 8 系の成果を対象に安定版リリース可否を判定するフェーズである。

Phase 9 では、以下を判定対象とする。

- libSQL 標準DB運用
- SQLite 互換維持なし方針
- Database Gateway、Repository 層、driver 層の責務境界
- system / data 分離構成
- Deno single binary 正本成果物
- Docker image を運用選択肢とする方針
- backup、restore、rollback の説明可能性
- 主要 workflow の検証結果
- 既知バグ、既知制約、対象外機能
- リポジトリ全体の整合性

Phase 9 はリリース実行を自動承認しない。tag 作成、GitHub Releases 作成、成果物配置、release notes 公開、`main` 反映は、リリース提案を提示し、別途ユーザー承認を得るまで行わない。

Phase 9 で安定版リリースを行う場合、リリース履歴の正本は GitHub Releases とする。リポジトリ内に変更履歴、リリース履歴、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を履歴ファイルとして保持しない。

### Phase 10 Adlaire Deploy 連携仕様

Phase 10 は、Adlaire Deploy の着手フェーズである。

Adlaire Git Repository 本体は、Adlaire Deploy を内部統合しない。Adlaire Deploy は DB 不使用の付随システムとして同居・連携し、Deno single binary 正本成果物の取得、checksum 検証、配置、backup、rollback、manifest 記録を扱う。

Adlaire Deploy は、Adlaire Deploy 専用 database を持たず、Adlaire Git Repository 本体の libSQL database へ直接接続しない。Adlaire Git Repository 本体は、Deploy 用 database schema、Deploy 用 migration、Deploy 用 application API を Phase 10 の前提として追加しない。

Adlaire Git Repository 本体が Phase 10 で提供または維持する連携境界は以下とする。

- release manifest
- checksum
- health check endpoint
- 標準デプロイ雛形
- system / data 分離済み filesystem path
- deploy manifest 保存先
- SSH 接続前提
- audit log 連携余地

Phase 10 では、Adlaire Deploy 専用 database、Adlaire Git Repository 本体 database への直接接続、database schema 変更、database migration 実行、database restore 自動実行、Docker image 配布の正式化、Container registry、GitHub Actions、外部デプロイフレームワーク、Node.js / npm 前提ツール、本番データ復元の自動実行、SSH を使用できない VPS、self-host、専用サーバーへの標準対応は対象外とする。

`deno.json` の内部バージョン更新、Adlaire Deploy の実装コード追加、デプロイ実行、成果物配置は、対象範囲と検証方法を提示し、別途ユーザー承認を得てから行う。

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
      └─ libSQL driver / SQLite migration source reader
    ↓
[Storage]
  ├─ libSQL Database (metadata)
  └─ Bare Git Repos (FS)
```

---

## deno.json v.2.10 Phase 9 baseline

正式バージョン表記は `v.{Major}.{Minor}` とする。`deno.json` に互換性上 `Major.Minor.Patch` 形式を記載する場合は、正式表記に対応する内部表記として扱う。

初回安定版リリース前は正式表記を `v.0.{Minor}` とし、`deno.json` 側では `0.{Minor}.0` に対応させる。安定版リリース系列では正式表記を `v.{Major}.{Minor}` とし、`deno.json` 側では `{Major}.{Minor}.0` に対応させる。たとえば `2.10.0` は正式表記 `v.2.10` に対応する。

```json
{
  "name": "adlaire-git-repository",
  "version": "2.10.0",
  "license": "CLOSED",
  "exports": "./src/main.ts",
  "imports": {
    "@libsql/client": "npm:@libsql/client@0.17.4"
  },
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-write --allow-env --allow-run --allow-ffi --allow-sys=cpus,networkInterfaces,hostname src/main.ts",
    "fmt": "deno fmt deno.json src/ tests/",
    "lint": "deno lint",
    "test": "deno test --allow-net=127.0.0.1,localhost --allow-read --allow-write --allow-env --allow-run --allow-ffi --allow-sys=cpus,networkInterfaces,hostname tests/",
    "compile": "deno compile --allow-net --allow-read --allow-write --allow-env --allow-run --allow-ffi --allow-sys=cpus,networkInterfaces,hostname --output=dist/adlaire-git-repo src/main.ts",
    "compile:linux-arm64": "deno compile --target aarch64-unknown-linux-gnu --allow-net --allow-read --allow-write --allow-env --allow-run --allow-ffi --allow-sys=cpus,networkInterfaces,hostname --output=dist/adlaire-git-repo-v2.10-aarch64-unknown-linux-gnu src/main.ts",
    "compile:linux-x86_64": "deno compile --target x86_64-unknown-linux-gnu --allow-net --allow-read --allow-write --allow-env --allow-run --allow-ffi --allow-sys=cpus,networkInterfaces,hostname --output=dist/adlaire-git-repo-v2.10-x86_64-unknown-linux-gnu src/main.ts",
    "compile:release": "deno task compile:linux-arm64 && deno task compile:linux-x86_64",
    "docker:verify-build": "sh scripts/docker/verify-build.sh"
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
├── deno.lock
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
│   │   ├── libsql_driver.ts
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
DB: /opt/adlaire-git-repository/shared/data/database/adlaire.libsql
Git repos: /opt/adlaire-git-repository/shared/data/repositories/
ログ: /opt/adlaire-git-repository/shared/logs/
バックアップ: /opt/adlaire-git-repository/shared/backups/
ローカルディスク: 50GB SSD
```

**容量目安**
- DB metadata: 50-100MB
- Git repos: 10-15GB
- ログ他: 2-3GB
- 合計: ~20GB（十分な余裕）

**バックアップ戦略**
標準バックアップ雛形は `scripts/deploy/backup.sh` とする。

バックアップ対象は libSQL database、移行元 SQLite database、Git bare repository、設定、secrets、logs、manifests、現行 system release、backup manifest とする。標準雛形では service が稼働していた場合に一時停止し、data 側の主要保護対象、現行 system release 参照、現行 system release 実体を取得してから service を再起動する。libSQL database のファイルバックアップは cold backup とし、`sqlite3` CLI による SQLite backup API を標準前提にしない。

定期実行は systemd timer を補助採用候補とし、実行間隔、保持期間、外部保管、暗号化、復元手順は `docs/policies/DEPLOYMENT_POLICY.md` に従い、ユーザー承認後に確定する。

---

### Phase 2: PR/Issue/Wiki/Webhook/Release

**構成**
```
DB: /opt/adlaire-git-repository/shared/data/database/adlaire.libsql
Git repos: /opt/adlaire-git-repository/shared/data/repositories/
ログ: /opt/adlaire-git-repository/shared/logs/
バックアップ: /opt/adlaire-git-repository/shared/backups/
ローカルディスク: 50GB SSD
```

**容量目安**
- DB metadata: 500MB-1GB
- Git repos: 25-35GB
- ログ他: 5-10GB
- 合計: ~30-40GB（容量監視必須）

**バックアップ戦略**
```
標準雛形: scripts/deploy/backup.sh
対象: libSQL database + 移行元 SQLite database + Git bare repository + 設定 + 現行 release + manifest
定期実行候補: systemd timer
保持期間・外部保管・暗号化: ユーザー承認後に確定
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
  - DB metadata をNAS上に配置
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

バックアップは `docs/policies/DEPLOYMENT_POLICY.md` を正本とし、標準雛形は `scripts/deploy/backup.sh` で管理する。

標準バックアップは、最低限以下を対象とする。

- libSQL database
- Git bare repository 保存領域
- 設定ファイル
- secrets
- logs
- manifests
- 現行 system release
- backup manifest

`cron` ではなく、systemd timer を補助採用候補として扱う。定期バックアップの有効化、実行間隔、保存先、保持世代、暗号化、外部退避は、デプロイ先決定時にユーザー承認を得る。

**リカバリ手順**

データ復元を伴うリカバリは、通常デプロイ自動化の対象外とする。

libSQL database 復元、移行元 SQLite database 復元、Git bare repository 復元、設定復元は本番データへ影響するため、必ず別途ユーザー承認を得る。

リカバリ時の標準確認項目は以下とする。

- Docker container の停止または保護状態確認
- 復元対象 backup manifest の確認
- libSQL database 復元可否の確認
- Git bare repository 保存領域の復元可否確認
- Docker container 再作成
- `/health` 確認
- libSQL database と Git bare repository の参照確認

**Phase 3（NAS 利用時）**
```
NAS は自動複製機能 or スナップショット機能を活用
リカバリ: NAS スナップショットから復元（数秒）
```

---

### アップグレード手順

標準アップグレードは、`scripts/deploy/deploy.sh` を用いた Deno single binary 配置、必要に応じた Deno single binary 入り Docker image の配置、compose 設定確認、process または container 再起動、配置後検証を基本とする。

```bash
# 1. 新バイナリの compile と Docker image 生成
$ deno task compile

# 2. デプロイ環境設定を確認
$ cp scripts/deploy/deploy.env.example scripts/deploy/deploy.env
# deploy.env へ接続先、配置先、Docker image/tag、compose 設定などを設定する。
# deploy.env はコミットしてはならない。

# 3. 事前確認
$ scripts/deploy/verify-server.sh

# 4. バックアップ、Docker image 配置、container 再作成、配置後検証
$ scripts/deploy/deploy.sh

# 5. 必要に応じて配置後検証を再実行
$ scripts/deploy/verify-release.sh
```

初回本番デプロイ、デプロイ先サーバ、SSH接続方式、接続ユーザー、配置パス、Docker Engine / Docker Compose 導入または更新、バックアップ保存先、保持世代、暗号化方針は、必ず別途ユーザー承認を得る。

複数インスタンス、ロードバランサー切替、ダウンタイムなしアップグレードは将来候補とし、採用時に3類マスター仕様書、マスター開発計画、デプロイポリシーへ反映する。

---

### ロールバック手順

通常ロールバックは、`scripts/deploy/rollback.sh` により指定した release directory へ戻し、process または container 再起動と配置後検証を行う。

```bash
TARGET_RELEASE=v.2.10-YYYYMMDD-HHMMSS scripts/deploy/rollback.sh
```

ロールバック実行は、必ず別途ユーザー承認を得る。

libSQL database 復元、移行元 SQLite database 復元、Git bare repository 復元、設定復元、secrets 復元を伴うロールバックは、通常ロールバックとは分離し、本番データへ影響する操作として別承認を必須とする。

---

### ログ管理

**ログ保管**
```
場所: /opt/adlaire-git-repository/shared/logs/
内容:
  - HTTP アクセスログ
  - Git 操作ログ
  - エラーログ
```

**ログローテーション**

ログローテーションは、標準運用基盤決定時に systemd、logrotate、または同等のホストOS標準機能で具体化する。

保持期間、圧縮、削除条件、外部退避の有無は、デプロイ先決定時にユーザー承認を得る。

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

Phase 5 では、Web UI のデザイン関連改良・改修方針を整理する。

Phase 5 のデザイン関連改良・改修は、情報設計、画面レイアウト、視覚表現、操作導線、アクセシビリティ、可読性の改善を対象とする。UI は GitHub 互換の対象外であり、本プロジェクト独自 UI として改良・改修する。

Phase 5 のデザイン関連改良・改修では、外部フレームワークを採用してはならない。外部ライブラリまたは外部ツールが必要な場合は、2類ポリシーに従い、例外採用としてユーザー承認を得る。

Phase 5 では、トップページの Web UI を対象に、ヘッダー、ステータス領域、ユーザー登録、API token 発行、Repository 作成、Repository 一覧の情報設計と表示品質を改善する。既存 API と既存ドメイン機能は変更せず、外から見た主要ワークフローを維持する。

## Phase 6 安定版準備仕様

Phase 6 は、Phase 7 のデフォルト安定版リリース判定へ進むための準備フェーズである。Phase 6 自体は安定版リリース対象ではない。

Phase 6 では、database schema、Database Gateway、Repository 層、Service 層の責務境界を維持する。既存 API と既存ドメイン機能は維持しつつ、認証、権限、Git Smart HTTP、SQLite 外部キー、入力エラー応答、重複応答、Registry 一覧制御、HTTP Authorization scheme の大小文字処理、Webhook secret API 非露出、Team member の Organization member 境界等の既知バグ修正、ドキュメント整合性向上、移行・ロールバック前提整理、主要 workflow 検証を行う。

Phase 6 から Phase 5 相当へ戻す場合、データ構造の migration は不要である。ロールバックは、libSQL database、移行元 SQLite database、bare repository、設定、配布 binary のバックアップを前提に行う。

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

CI/CD とデプロイ自動化は、`docs/policies/DEPLOYMENT_POLICY.md` を正本として扱う。

標準運用方式は、Deno single binary 直実行と Docker 実行の双方を標準化対象とする。Deno single binary 正本成果物の配置、必要に応じた Docker image 配置、環境確認、バックアップ、process または container 再起動、health check、主要workflow検証、deploy manifest 記録を、承認済み範囲で自動化する。

shell script + SSH は binary または Docker image 転送、起動定義更新、backup、再起動、検証の補助方式とする。`gh` は Pull Request、tag、GitHub Releases、成果物配置、release notes、PR説明更新など GitHub 側の補助操作に限って補助採用する。systemd timer は、バックアップ、定期検証、保守系の定期実行候補として補助採用する。

Adlaire Deploy は Phase 10 の着手対象とし、Adlaire Git Repository 本体へ統合せず、DB 不使用の付随システムとして同居・連携する。shell script 運用で固まった要件は、Adlaire Deploy の移行元・暫定標準として扱う。

GitHub Actions と外部デプロイフレームワークは保留とする。Docker は運用選択肢の一つとし、正本成果物は Deno single binary とする。Node.js系は不採用とする。

---

## デプロイ自動化仕様

本番サーバ環境へのデプロイは、承認工程を省かず、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。

標準自動化は以下を含む。

- 本番サーバ環境の前提確認
- Deno single binary 正本成果物の取得または転送
- Docker 運用を選択する場合の Docker image の取得または転送
- Docker 運用を選択する場合の Docker Compose 設定の確認
- binary 直実行を選択する場合の起動管理定義の確認
- 配置前検証
- libSQL database のバックアップ
- Git bare repository 保存領域のバックアップ
- 設定ファイルのバックアップ
- secrets のバックアップ
- log 保存領域の確認
- manifests のバックアップ
- Docker 運用を選択する場合の Docker image 読み込み
- process または container 再起動
- `/health` 検証
- 主要APIまたは最小workflow検証
- deploy manifest と検証結果の記録

初回本番デプロイ、デプロイ先サーバ、SSH接続方式、接続ユーザー、配置パス、binary 直実行または Docker 運用の選択、Docker Engine / Docker Compose 導入または更新、起動管理定義作成、バックアップ保存先、保持世代、暗号化方針、ロールバック実行、本番データへ影響する操作は、必ず別途ユーザー承認を得る。

デプロイ実行方式は、Deno single binary 正本成果物の配置を基準とする。Docker は標準運用選択肢の一つであり、Docker Compose は Docker 運用選択時の 1 VPS 最小構成起動方式とする。shell script + SSH は binary または Docker image 転送、起動定義更新、backup、再起動、検証の補助方式とする。`gh` は Pull Request、tag、GitHub Releases、成果物配置、release notes、PR説明更新など GitHub 側の補助操作に限って補助採用する。systemd timer は、バックアップ、定期検証、保守系の定期実行候補として補助採用する。

Adlaire Deploy は Phase 10 の着手対象とし、DB 不使用で Deno single binary 正本成果物の取得、checksum 検証、配置、backup、rollback、manifest 記録を扱う。VPS、self-host、専用サーバーでは SSH 使用可能を最低必須条件とする。GitHub Actions と外部デプロイフレームワークは保留とし、必要性、依存関係、運用リスクを整理し、ユーザー承認を得るまで標準採用しない。

Docker は、正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つとする。Node.js系は不採用とする。Node.js runtime、npm ecosystem、`package.json`、`node_modules` を前提とするデプロイ方式は採用してはならない。承認済み例外ライブラリとして明記された場合を除き、`npm:` specifier を導入してはならない。

ローカルに Deno が存在しない場合、実行系検証はローカルで完了扱いにしない。この場合は、Deno 固定採用バージョンを満たす VPS、承認済み検証サーバ、または承認済み固定 Deno Docker image で、Deno task、内製検証スクリプト、`/health`、主要workflow確認を実施する。

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

Deno single binary 形式を正本成果物とする。Docker は、正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つである。標準デプロイは、Deno single binary を VPS または専用サーバーへ配置し、host filesystem 上の data 領域を正本として実行する方式を基準とする。Docker を選択する場合は、同じ data 領域を host bind mount で接続する。

標準構成は以下を基本とする。

- `deno compile` による single binary 生成
- 安定版リリースでは ARM64 Linux と x86_64 Linux の2種類の single binary 生成
- Docker 運用を選択する場合の Deno single binary を含む Docker image 生成
- 承認済み固定 Deno Docker image による検証、テスト、ビルド、Deno single binary 生成
- binary 直実行または Docker Compose による起動
- Docker 運用を選択する場合の host bind mount による data 領域接続
- libSQL database、移行元 SQLite database、Git repository、config、secrets、log、backups、manifests の host filesystem 上での永続保存
- 配置前バックアップ
- `/health` による health check
- 直前 binary または Docker image / tag への system rollback

Docker named volume を標準の data 正本として扱ってはならない。data 側は container lifecycle に依存させず、host filesystem を正本とする。

---



### 準備

- [ ] Deno `v2.9.5` を基準にした実行環境確認
- [ ] Git `v2.55.0` 系を基準にした実行環境確認
- [ ] Repository 作成
- [ ] Team onboarding
- [ ] CI/CD パイプライン

### 開発

- [ ] libSQL schema 設計
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
- [ ] ARM64 Linux binary compile
- [ ] x86_64 Linux binary compile
- [ ] リリースドキュメント

---

## 完成

```
✅ Adlaire Group 内部向け Git ホスティングプロバイダー
✅ Deno + TypeScript + libSQL + Git
✅ ソースコード管理に特化
✅ シンプル・軽量（GitPrep ベース）
✅ ワンバイナリ起動
✅ 外部ライブラリは内製境界に閉じ込める
✅ フレームワーク採用禁止（内製化）
```
