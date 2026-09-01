# デプロイポリシー

**位置づけ**: 2類責務別ポリシー
**責務**: デプロイ、運用基盤、環境管理、本番サーバ反映、バックアップ、検証、ロールバック
**ステータス**: Phase 10 Adlaire Deploy 仕様固定方針

---

## 1. 基本方針

本番サーバ環境へのデプロイは、自動化を標準とする。

自動化は、承認工程を省略するためのものではない。デプロイ先、対象バージョン、成果物、バックアップ範囲、検証範囲、ロールバック条件、自動実行範囲を提示し、ユーザー承認を得てから実行する。

Deno single binary を正本成果物とする。

Docker は正本成果物ではなく、Deno single binary を Docker image に同梱して実行する運用選択肢の一つである。

Docker を使用する場合も、Docker を使用せず Deno single binary を host OS 上で直接実行する場合も、同じ system / data 分離構成にする。

Adlaire Deploy は Phase 10 の着手対象とする。Adlaire Git Repository 本体へ統合せず、付随システムとして同居・連携し、Deno single binary 正本成果物の取得、checksum 検証、配置、backup、rollback、manifest 記録を扱う。

Adlaire Deploy は DB 不使用とする。Adlaire Deploy 専用 database を持たず、Adlaire Git Repository 本体の libSQL database へ直接接続しない。実行計画、検証結果、実行結果、rollback 計画は、host filesystem 上の manifest、plan、log として扱う。

Adlaire Deploy は `adlaire-deploy` CLI として扱う。標準入力は JSON deployment manifest とし、`plan`、`verify`、`dry-run` は system 側と data 側を変更してはならない。`apply-system` と `rollback-system` は、承認済み範囲で system 側のみを変更する候補として扱い、実行には別途ユーザー承認を必要とする。

VPS、self-host、専用サーバーを対象にする場合は、SSH 使用可能を最低必須条件とする。SSH が使用できない環境は、標準デプロイ対象外とする。

最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。Deno single binary、Docker image、container、起動管理定義は差し替え可能な system 側として扱い、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は保護対象 data 側として host filesystem を正本にする。

標準デプロイは、Deno single binary 正本成果物を self-host、VPS、専用サーバーへ配置する方式を基準とする。Docker を利用する場合は、正本成果物である Deno single binary を Docker image に同梱し、host filesystem 上の data 領域を bind mount して実行する。

## 2. デプロイ実行方式の採用区分

デプロイ実行方式は、シンプル、軽量、データ保全、整合性、運用性、デプロイ性を同等に満たすことを基準に採用区分を定義する。

| 区分 | 対象 | 扱い |
|---|---|---|
| 採用 | Deno single binary | 正本成果物。Docker 使用有無に関係なく system 側の基準成果物とする |
| 採用 | host OS 上の binary 直実行 | Docker を使用しない標準運用選択肢。data 側は Docker 使用時と同じ host filesystem 構成にする |
| 採用 | Docker | 標準運用選択肢の一つ。Deno single binary を Docker image に同梱して実行する |
| 採用 | Docker Compose | Docker 運用選択時の 1 VPS 最小構成起動方式。compose 設定は system 側として扱い、data 側は host bind mount で接続する |
| 採用 | shell script + SSH | 標準デプロイ補助方式。承認済み範囲で、binary または image 転送、起動定義更新、backup、再起動、検証、manifest 記録を自動化する |
| 補助採用 | `gh` | Pull Request、tag、GitHub Releases、成果物配置、release notes、PR説明更新など GitHub 側の補助操作に限って利用する |
| 補助採用 | systemd timer | バックアップ、定期検証、保守系の定期実行候補として利用する。アプリケーション本体の標準起動方式ではない |
| 採用 | Adlaire Deploy | Deno製の内製デプロイメントシステム。Phase 10 の着手対象として、DB 不使用の `adlaire-deploy` CLI、JSON manifest、binary 正本成果物の取得、検証、配置、backup、rollback、plan / result / error 記録を扱う |
| 保留 | GitHub Actions | 標準採用しない。外部CIとしての採用可否は保留し、必要時に別途提案と承認を要する |
| 保留 | 外部デプロイフレームワーク | 標準採用しない。必要性、依存関係、運用リスクを整理し、別途承認を得るまで採用しない |
| 採用 | systemd または同等の起動管理 | binary 直実行を選択する場合の起動管理候補。作成または変更は別途承認を得る |
| 不採用 | Docker named volume 標準運用 | data 正本を Docker named volume に丸投げする運用は禁止 |
| 不採用 | Node.js系 | Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を前提とする方式は採用禁止 |

`gh` は GitHub 上のリリース、Pull Request、tag、成果物配置を補助するためのツールとして扱い、本番サーバ上のアプリケーション実行基盤、依存関係管理、デプロイフレームワークとして扱ってはならない。

## 3. 標準デプロイ対象

標準デプロイは、最低限以下を対象とする。

- Deno single binary 正本成果物の配置
- Docker 運用を選択する場合の Docker image 配置または読み込み
- Docker 運用を選択する場合の Docker Compose 設定の配置または確認
- binary 直実行を選択する場合の起動管理定義の配置または確認
- 設定ファイルの配置または確認
- libSQL database の保全
- Git bare repository 保存領域の保全
- log 保存領域の確認
- Docker 運用を選択する場合の host bind mount による data 領域の接続
- binary 直実行または Docker による稼働版切り替え
- deploy manifest の記録
- Adlaire Deploy を使う場合の DB 不使用 JSON manifest、plan、result、error、log の記録

標準配置は以下を基準とする。

```text
/opt/adlaire-git-repository/
├── system/
│   ├── releases/
│   │   └── v.2.10-YYYYMMDD-HHMMSS/
│   │       └── adlaire-git-repository
│   ├── current -> releases/v.2.10-YYYYMMDD-HHMMSS/
│   ├── bin/
│   │   └── adlaire-git-repo
│   ├── docker/
│   │   ├── compose.yml
│   │   └── images/
│   │       └── adlaire-git-repo-v2.10.tar
│   └── service/
│       └── adlaire-git-repository.service
└── shared/
    ├── data/
    │   ├── database/
    │   │   └── adlaire.libsql
    │   └── repositories/
    ├── config/
    │   └── adlaire.env
    ├── secrets/
    ├── logs/
    ├── backups/
    └── manifests/
```

`system/releases` と `system/current` は差し替え可能な system 側として扱う。`shared/data/database`、`shared/data/repositories`、`shared/config`、`shared/secrets`、`shared/logs`、`shared/backups`、`shared/manifests` は保護対象 data 側として扱う。

標準アプリケーション設定では、`ADLAIRE_APP_ROOT=/opt/adlaire-git-repository` から `ADLAIRE_SHARED_DIR=/opt/adlaire-git-repository/shared`、`ADLAIRE_DATA_DIR=/opt/adlaire-git-repository/shared/data`、`ADLAIRE_REPOSITORY_ROOT=/opt/adlaire-git-repository/shared/data/repositories` を導く。標準 libSQL database は `file:/opt/adlaire-git-repository/shared/data/database/adlaire.libsql` とする。

Docker 運用を選択する場合の container 内配置は以下を基準とする。

```text
/app/adlaire-git-repo
/data
/repositories
/config
/secrets
/logs
/manifests
```

## 4. 標準デプロイスクリプト

標準デプロイ雛形は `scripts/deploy/` 配下で管理する。

Adlaire Deploy を進める場合でも、`scripts/deploy/` 配下の shell script 雛形は移行元・暫定標準として維持する。既存 shell script の削除、置換、実行方式変更は、別途ユーザー承認を得る。

| ファイル | 責務 |
|---|---|
| `scripts/deploy/deploy.env.example` | 環境固有値の雛形。実値を入れた `deploy.env` はコミットしてはならない |
| `scripts/deploy/deploy.sh` | binary または Docker image 転送、バックアップ、起動定義確認、再起動、検証の全体実行 |
| `scripts/deploy/backup.sh` | libSQL database、移行元 SQLite database、Git bare repository 保存領域、設定、secrets、logs、manifests のバックアップ |
| `scripts/deploy/verify-server.sh` | SSH 接続先、本番サーバ必須コマンド、binary または Docker 実行基盤、標準ディレクトリの事前確認 |
| `scripts/deploy/verify-release.sh` | process または container 状態、`/health`、DB quick check、Git repository 保存領域の配置後確認 |
| `scripts/deploy/rollback.sh` | 直前 binary または Docker image / tag へ戻し、再起動と配置後確認を行う |

Adlaire Deploy の Phase 10 実装が完了し、検証済みの移行先として承認されるまで、上記 script 群を標準デプロイ雛形として維持する。

標準デプロイスクリプトは、初回本番デプロイ、デプロイ先サーバ決定、SSH 接続方式、binary 直実行または Docker 運用の選択、Docker Engine / Docker Compose 導入、起動管理定義作成、バックアップ保存先決定、ロールバック実行、データ復元を自動承認するものではない。

`deploy.sh` は通常デプロイの自動化雛形であり、本番データ復元を行ってはならない。libSQL database 復元、移行元 SQLite database 復元、Git bare repository 復元、設定復元、secrets 復元を伴うロールバックは、必ず別承認を得る。

Adlaire Deploy は、database を使う運用記録基盤として実装してはならない。既存 shell script から Adlaire Deploy へ移行する場合も、database file は保護対象 data file として扱い、database の中身を解釈しない。Adlaire Deploy の詳細な実行主体、標準コマンド、manifest、artifact、target / SSH、preflight、出力、error 分類、security / data 保護は `docs/specs/Adlaire_Deploy_Specification.md` を正本とする。

## 5. 標準自動化範囲

ユーザー承認後に限り、以下を自動実行してよい。

- 本番サーバ環境の前提確認
- SSH 接続事前検証
- system / data 分離構成の検証
- Adlaire Deploy の DB 不使用 JSON manifest、plan、result、error、log 生成
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
- process または container の再起動
- `/health` 検証
- 主要APIまたは最小workflow検証
- deploy log、manifest、検証結果の記録

## 6. バックアップ方針

本番デプロイ前には、必ずバックアップを取得する。

バックアップ対象は最低限以下とする。

- libSQL database
- Git bare repository 保存領域
- 設定ファイル
- secrets
- logs
- manifests
- 現行 Deno single binary
- Docker 運用を選択している場合の現行 Docker image または image tag 情報
- deploy manifest

標準雛形では、service が稼働していた場合は一時停止し、libSQL database と関連 sidecar、Git bare repository、config、secrets、logs、manifests、現行 system release 参照、現行 system release 実体を取得してから service を再起動する。

libSQL database のファイルバックアップは、標準雛形ではサービス停止を伴う cold backup とする。`sqlite3` CLI による SQLite backup API を標準前提にしてはならない。

バックアップは、復元可能性を検証できる形式で保存する。保存先、保持世代、暗号化、外部退避の有無は、デプロイ先決定時にユーザー承認を得る。

## 7. 検証方針

デプロイ自動化には、デプロイ前検証とデプロイ後検証を含める。

デプロイ前検証は最低限以下を含む。

- 対象バージョンと成果物の確認
- checksum または同等の改ざん確認
- 本番サーバのディスク容量確認
- SSH 接続確認
- 必須コマンド確認
- バックアップ書き込み確認
- system / data 分離構成確認

デプロイ後検証は最低限以下を含む。

- process または container 起動状態確認
- `/health` 確認
- トップページ確認
- Repository 一覧または主要API確認
- Git clone / fetch / push の代表確認
- libSQL database と Git bare repository の参照確認

Adlaire Deploy の検証では、Adlaire Deploy 専用 database が作成されていないこと、Adlaire Git Repository 本体 database へ直接接続していないこと、実行結果が host filesystem 上の manifest、plan、log として記録されることを確認する。

ローカル環境に Deno が存在しない場合、実行系検証はローカルで完了扱いにしてはならない。この場合は、Deno 固定採用バージョンを満たす VPS または承認済み検証サーバ上で、実行系検証とテストを実施する。

VPS で実施する実行系検証は、最低限以下を含む。

- `deno task fmt`
- `deno task lint`
- `deno task test`
- `deno task compile`
- `deno task compile:linux-arm64`
- `deno task compile:linux-x86_64`
- `deno task compile:release`
- `scripts/docker/verify-build.sh` による Docker 上の検証、テスト、ビルド、binary 生成
- `tools/check-adlaire-git-repository.sh` または同等の内製検証スクリプト
- `/health` と主要workflowの確認

VPS 接続先、接続方式、配置パス、検証対象バージョン、検証データ、検証後の削除または保持方針は、実行前にユーザー承認を得る。

## 8. ロールバック方針

デプロイに失敗した場合、またはデプロイ後検証に失敗した場合は、ロールバックを実行できる状態にしておく。

標準ロールバックは、直前の Deno single binary、Docker 運用を選択している場合の直前 Docker image または image tag、直前起動定義、直前バックアップ、host filesystem data 領域を用いる。

system rollback は旧 Deno single binary または旧 Docker image / tag へ戻す操作とする。data rollback は別承認を必須とする。本番データへ影響するロールバック、libSQL database 復元、移行元 SQLite database 復元、Git bare repository 復元、設定復元、secrets 復元は、必ずユーザー承認を得てから実行する。

## 9. 別承認が必要な範囲

以下は、デプロイ自動化の対象としてまとめて扱わず、必ず別途承認を得る。

- 初回本番デプロイ
- デプロイ先サーバ決定
- SSH 接続方式、接続ユーザー、配置パス決定
- SSH 接続先 host、port、認証方式、identity、sudo 要否の決定
- binary 直実行または Docker 運用の選択
- Docker Engine / Docker Compose 導入または更新
- systemd または同等の起動管理定義の作成または変更
- バックアップ保存先、保持世代、暗号化方針決定
- 本番データへ影響する操作
- libSQL database 復元
- Git bare repository 復元
- ロールバック実行
- 公開経路、ドメイン、TLS 設定変更
- Adlaire Deploy から database を直接操作する方針への変更

## 10. リリースポリシーとの関係

`docs/policies/RELEASE_POLICY.md` は、tag、GitHub Releases、release notes、manifest、checksum、成果物公開を管理する。

本ポリシーは、公開済みまたは承認済み成果物を本番サーバ環境へ反映するデプロイ、検証、バックアップ、ロールバックを管理する。

リリースとデプロイを同時に自動化する場合も、それぞれの承認対象、成果物、検証範囲、失敗時対応を分けて提示しなければならない。
