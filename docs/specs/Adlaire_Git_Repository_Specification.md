# Adlaire Git Repository

**文書バージョン**: v.0.1
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
- 外部依存ゼロ（Deno std のみ）
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

GitHub Actions、GitHub Pages、Package registry、Container registry、Copilot、Advanced Security 等は、個別に採用可否、実装時期、必要性、外部依存、セキュリティ、ライセンスを評価し、ユーザー承認を得るまで実装対象に含めない。

GitHub 互換を目標とする場合でも、GitHub 固有サービスへの直接依存、GitHub の商標・ブランド表現の無承認利用、GitHub API の完全再現を前提にした無承認実装は行わない。

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
- Deno std のみ
- フレームワーク採用禁止（内製化のみ）
- 必要最小限の外部ライブラリ
- 外部ライブラリは内製ラッパー、内製driver、または Database Gateway の内部に閉じ込める
- Deno、SQLite、libSQL、Git、Docker、Docker Compose、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリは、各技術の最新の安定版を採用方針とする
- TypeScript は 6系の最新安定版を採用方針とする
- 承認済み固定採用バージョンは、下表に従う

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

### データベース採用方針

採用対象のデータベースエンジンは SQLite と libSQL のみに限定する。

SQLite と libSQL は、本プロジェクトで許容する必要最小限の外部依存とする。

Phase 1 は SQLite を標準データベースとして実装する。

SQLite は、Phase 1 の標準データベースとして採用する必要最小限の外部依存である。

libSQL は、SQLite 互換を活かした将来の移行候補として保持する。libSQL も必要最小限の外部依存に該当するが、SQLite からの移行容易性、DB抽象化設計との相性、将来の同期・分散構成への拡張余地という採用メリットが高いため、例外採用候補として扱う。

ただし、Phase 1 では libSQL を実装対象に含めない。libSQL driver の実装は、Phase 計画、移行計画、検証計画、ユーザー承認を揃えてから行う。libSQL を採用する場合も、外部ライブラリAPIは内製 `libsql` driver と Database Gateway の内部に閉じ込め、サービス層やRepository層へ直接露出させない。

Turso Cloud 等のクラウドDBホスティングを採用するかどうかは未定とする。クラウドDBホスティングは新しいデータベースエンジンではなく、libSQL の接続先または運用形態の候補として扱う。採用する場合は、外部サービス依存、データ所在、認証トークン管理、バックアップ、障害時の復旧、運用費用を評価し、例外採用としてユーザー承認を得る。

将来移行を容易にするため、DBアクセスは Database Gateway と専用 driver 層に集約する。SQL は可能な限り SQLite 標準互換に保ち、libSQL 固有機能へ直接依存する場合はマスター仕様書に明記する。

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

初回安定版リリース前は正式表記を `v.0.{Minor}` とし、`deno.json` 側では `0.{Minor}.0` に対応させる。たとえば `0.2.0` は正式表記 `v.0.2` に対応する。

```json
{
  "name": "adlaire-git-repository",
  "version": "0.2.0",
  "license": "CLOSED",
  "exports": "./src/main.ts",
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-write --allow-env --allow-run src/main.ts",
    "fmt": "deno fmt deno.json src/ tests/",
    "lint": "deno lint",
    "test": "deno test --allow-read --allow-write --allow-env --allow-run tests/",
    "compile": "deno compile --allow-net --allow-read --allow-write --allow-env --allow-run --output=adlaire-git-repo src/main.ts"
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
├── Dockerfile
├── README.md
├── compose.yaml
├── deno.json
├── src/
│   ├── main.ts              (エントリーポイント)
│   ├── server.ts            (HTTP サーバー)
│   ├── config.ts            (設定)
│   ├── database/
│   │   ├── gateway.ts       (Database Gateway)
│   │   ├── sqlite_cli_driver.ts
│   │   ├── sql.ts
│   │   ├── schema.sql
│   │   └── types.ts
│   ├── domain/
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── repository.ts
│   │   ├── repository_path.ts
│   │   ├── ssh_key.ts
│   │   └── user.ts
│   ├── git/
│   │   ├── git_service.ts
│   │   └── http_backend.ts
│   ├── http/
│   │   └── responses.ts
│   ├── repositories/
│   │   ├── audit_log_repository.ts
│   │   ├── repository_repository.ts
│   │   └── user_repository.ts
│   └── services/
│   │   ├── audit_service.ts
│   │   ├── auth_service.ts
│   │   └── repository_service.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── support/
└── docs/
    ├── plans/
    ├── policies/
    └── specs/
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
# ./adlaire-git-repo が生成される

# VPS/オンプレで実行
./adlaire-git-repo --port 8080
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

### Phase 2: PR/Issue + Wiki

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
$ cp ./adlaire-git-repo /opt/adlaire-git-repo/adlaire-git-repo

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
    cp ./adlaire-git-repo /opt/adlaire-git-repo/
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

### Phase 2: PR/Issue + Wiki

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

**Phase 2: PR/Issue + Wiki**
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
  ✅ Docker ベース
  ✅ 小規模チーム向け

欠点:
  ❌ Docker 前提
  ❌ カスタマイズ性は Jenkins より低い

価格: 無料（OSS）
推奨度: ⭐⭐⭐ (代替案・自ホスト向け)
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
          path: ./adlaire-git-repo

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
            ./adlaire-git-repo \
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

## Docker サポート（選択肢）

### 基本方針

**Single Binary（基本・推奨）**
```
deno compile でバイナリ生成 → VPS で直接実行
メリット: シンプル・追加導入なし
推奨: ほとんどのケース
```

**Docker（選択肢）**
```
Dockerfile でイメージビルド → Docker コンテナで実行
メリット: 環境統一・運用自動化・複数インスタンス管理
推奨: Phase 3 複数インスタンス / 運用自動化重視
```

---

### Dockerfile

```dockerfile
# Multi-stage build

# Stage 1: Builder
FROM denoland/deno:latest as builder

WORKDIR /app

COPY . .

# Deno permissions: allow all (本番では制限推奨)
RUN deno compile \
  --allow-all \
  --output=adlaire-git-repo \
  src/main.ts

# Stage 2: Runtime
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
  git \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Builder stage から バイナリをコピー
COPY --from=builder /app/adlaire-git-repo .

# SQLite データベース・Git リポジトリ用ディレクトリ
RUN mkdir -p /app/db /app/repos /app/logs

# 非 root ユーザー作成
RUN useradd -m -u 1000 gitrepo && chown -R gitrepo:gitrepo /app
USER gitrepo

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./adlaire-git-repo", "--port", "8080"]
```

---

### docker-compose.yml

```yaml
version: '3.8'

services:
  adlaire-git-repo:
    build:
      context: .
      dockerfile: Dockerfile

    container_name: adlaire-git-repo

    ports:
      - "8080:8080"

    volumes:
      # SQLite データベース永続化
      - git-db:/app/db
      # Git リポジトリ永続化
      - git-repos:/app/repos
      # ログ永続化
      - git-logs:/app/logs

    environment:
      # 必要に応じて環境変数設定
      - LOG_LEVEL=info
      - DB_PATH=/app/db/gitrepo.db

    restart: unless-stopped

    networks:
      - adlaire-network

    # リソース制限（Xserver VPS 2GB 想定）
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M

  # Nginx リバースプロキシ（オプション）
  nginx:
    image: nginx:alpine

    container_name: adlaire-nginx

    ports:
      - "80:80"
      - "443:443"

    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro

    depends_on:
      - adlaire-git-repo

    restart: unless-stopped

    networks:
      - adlaire-network

volumes:
  git-db:
  git-repos:
  git-logs:

networks:
  adlaire-network:
    driver: bridge
```

---

### Docker ビルド・実行方法

**イメージビルド**
```bash
# Dockerfile からイメージビルド
$ docker build -t adlaire-git-repo:latest .

# または docker-compose で
$ docker-compose build
```

**コンテナ実行（単体）**
```bash
$ docker run -d \
  --name adlaire-git-repo \
  -p 8080:8080 \
  -v git-db:/app/db \
  -v git-repos:/app/repos \
  -v git-logs:/app/logs \
  adlaire-git-repo:latest
```

**docker-compose で実行**
```bash
# コンテナ起動
$ docker-compose up -d

# ログ確認
$ docker-compose logs -f adlaire-git-repo

# コンテナ停止
$ docker-compose down

# コンテナ再起動
$ docker-compose restart
```

**ヘルスチェック**
```bash
$ curl http://localhost:8080/health
```

---

### GitHub Actions で Docker デプロイ

```yaml
# .github/workflows/docker-deploy.yml

name: Build & Deploy Docker Image

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: vx.x.x

      - name: Run tests
        run: deno task test

      - name: Build Docker image
        run: docker build -t adlaire-git-repo:${{ github.sha }} .

      - name: Tag latest
        run: docker tag adlaire-git-repo:${{ github.sha }} adlaire-git-repo:latest

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

          # Docker イメージを tar で VPS へ転送
          docker save adlaire-git-repo:latest | gzip > image.tar.gz
          scp -i ~/.ssh/id_ed25519 image.tar.gz $VPS_USER@$VPS_HOST:/tmp/

          # VPS でロードと再起動
          ssh -i ~/.ssh/id_ed25519 $VPS_USER@$VPS_HOST << 'EOF'
          set -e

          # イメージをロード
          docker load < /tmp/image.tar.gz

          # バックアップ実行
          docker-compose exec -T adlaire-git-repo /opt/backup.sh || true

          # コンテナ再起動
          docker-compose down
          docker-compose up -d

          # ヘルスチェック
          sleep 3
          curl -f http://localhost:8080/health || exit 1
          EOF
```

---

### Docker デプロイ手順（Phase別）

**Phase 1-2: Single binary（推奨）**
```
VPS で deno compile バイナリを直接実行
理由: シンプル・追加導入なし
```

**Phase 2: Docker へ移行（オプション）**
```
docker-compose で管理開始
メリット: ログ/ボリューム管理が標準化
```

**Phase 3: 複数インスタンス**
```
【Option A】Single binary × 複数 VPS
  各 VPS で deno compile バイナリ実行
  NAS で共有ストレージ

【Option B】Docker × 複数コンテナ
  各 VPS で docker-compose 実行
  ボリュームで NAS マウント
  推奨: 運用自動化重視の場合
```

---

## Single Binary vs Docker 選択ガイド

```
【Single Binary を選ぶ】
  ✅ シンプルさ重視
  ✅ 追加導入・学習コスト削減
  ✅ 小規模運用
  ✅ Deno + bash で十分
  推奨: Phase 1-2

【Docker を選ぶ】
  ✅ 環境統一（開発 ↔ 本番）
  ✅ 複数インスタンス管理簡素化
  ✅ ログ・ボリューム標準化
  ✅ CI/CD パイプライン統一
  ✅ コンテナオーケストレーション準備
  推奨: Phase 3 / 運用自動化重視
```

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
