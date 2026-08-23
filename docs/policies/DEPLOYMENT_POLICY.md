# デプロイポリシー

**位置づけ**: 2類責務別ポリシー
**責務**: デプロイ、運用基盤、環境管理、本番サーバ反映、バックアップ、検証、ロールバック
**ステータス**: 初期策定

---

## 1. 基本方針

本番サーバ環境へのデプロイは、自動化を標準とする。

自動化は、承認工程を省略するためのものではない。デプロイ先、対象バージョン、成果物、バックアップ範囲、検証範囲、ロールバック条件、自動実行範囲を提示し、ユーザー承認を得てから実行する。

Docker は、本番、デプロイ、運用基盤、公開経路、永続データ管理では採用禁止とする。

Docker は、検証、テスト、ビルド、Deno single binary 生成に限り利用できる。Docker を利用する場合も、本番サーバへ Docker image、container、volume、registry、Dockerfile、Compose 設定を持ち込んではならない。

標準デプロイは、Deno single binary を self-host、VPS、専用サーバーへ配置し、ホストOS上で直接実行する方式とする。

## 2. デプロイ実行方式の採用区分

デプロイ実行方式は、シンプル、軽量、データ保全、整合性、運用性、デプロイ性を同等に満たすことを基準に採用区分を定義する。

| 区分 | 対象 | 扱い |
|---|---|---|
| 採用 | shell script + SSH + systemd | 標準デプロイ実行方式。承認済み範囲で、成果物転送、配置、service restart、検証、manifest 記録を自動化する |
| 補助採用 | `gh` | Pull Request、tag、GitHub Releases、成果物配置、release notes、PR説明更新など GitHub 側の補助操作に限って利用する |
| 補助採用 | systemd timer | バックアップ、定期検証、保守系の定期実行候補として利用する |
| 補助採用 | Docker | 検証、テスト、ビルド、Deno single binary 生成に限って利用する。標準 image は `denoland/deno:2.9.5` とし、本番、デプロイ、運用基盤、永続データ管理には利用しない |
| 中期候補 | Deno製 内製デプロイツール | shell script 運用で固まった要件を内製化する候補。採用時は別途ユーザー承認を得る |
| 保留 | GitHub Actions | 標準採用しない。外部CIとしての採用可否は保留し、必要時に別途提案と承認を要する |
| 保留 | 外部デプロイフレームワーク | 標準採用しない。必要性、依存関係、運用リスクを整理し、別途承認を得るまで採用しない |
| 不採用 | Docker 本番利用 | 本番、デプロイ、運用基盤、公開経路、永続データ管理での Docker 利用は禁止 |
| 不採用 | Node.js系 | Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を前提とする方式は採用禁止 |

`gh` は GitHub 上のリリース、Pull Request、tag、成果物配置を補助するためのツールとして扱い、本番サーバ上のアプリケーション実行基盤、依存関係管理、デプロイフレームワークとして扱ってはならない。

## 3. 標準デプロイ対象

標準デプロイは、最低限以下を対象とする。

- Deno single binary の配置
- 設定ファイルの配置または確認
- SQLite database の保全
- Git bare repository 保存領域の保全
- log 保存領域の確認
- systemd または同等のサービス管理
- release directory と `current` symlink による稼働版切り替え
- deploy manifest の記録

## 4. 標準デプロイスクリプト

標準デプロイ雛形は `scripts/deploy/` 配下で管理する。

| ファイル | 責務 |
|---|---|
| `scripts/deploy/deploy.env.example` | 環境固有値の雛形。実値を入れた `deploy.env` はコミットしてはならない |
| `scripts/deploy/deploy.sh` | 成果物転送、バックアップ、release directory 作成、`current` symlink 切替、service restart、検証の全体実行 |
| `scripts/deploy/backup.sh` | SQLite database、Git bare repository 保存領域、設定、現行 release のバックアップ |
| `scripts/deploy/verify-server.sh` | SSH 接続先、本番サーバ必須コマンド、標準ディレクトリの事前確認 |
| `scripts/deploy/verify-release.sh` | service 状態、`/health`、SQLite quick check、Git repository 保存領域の配置後確認 |
| `scripts/deploy/rollback.sh` | `current` symlink を指定 release へ戻し、service restart と配置後確認を行う |

標準デプロイスクリプトは、初回本番デプロイ、デプロイ先サーバ決定、SSH 接続方式、systemd unit 作成、バックアップ保存先決定、ロールバック実行、データ復元を自動承認するものではない。

`deploy.sh` は通常デプロイの自動化雛形であり、本番データ復元を行ってはならない。SQLite database 復元、Git bare repository 復元、設定復元を伴うロールバックは、必ず別承認を得る。

## 5. 標準自動化範囲

ユーザー承認後に限り、以下を自動実行してよい。

- 本番サーバ環境の前提確認
- Deno single binary の取得または転送
- 配置前検証
- SQLite database のバックアップ
- Git bare repository 保存領域のバックアップ
- 設定ファイルのバックアップ
- log 保存領域の確認
- release directory 作成
- 成果物配置
- `current` symlink 切り替え
- service restart
- `/health` 検証
- 主要APIまたは最小workflow検証
- deploy log、manifest、検証結果の記録

## 6. バックアップ方針

本番デプロイ前には、必ずバックアップを取得する。

バックアップ対象は最低限以下とする。

- SQLite database
- Git bare repository 保存領域
- 設定ファイル
- 現行 Deno single binary
- deploy manifest

バックアップは、復元可能性を検証できる形式で保存する。保存先、保持世代、暗号化、外部退避の有無は、デプロイ先決定時にユーザー承認を得る。

## 7. 検証方針

デプロイ自動化には、デプロイ前検証とデプロイ後検証を含める。

デプロイ前検証は最低限以下を含む。

- 対象バージョンと成果物の確認
- checksum または同等の改ざん確認
- 本番サーバのディスク容量確認
- 必須コマンド確認
- バックアップ書き込み確認

デプロイ後検証は最低限以下を含む。

- service 起動状態確認
- `/health` 確認
- トップページ確認
- Repository 一覧または主要API確認
- Git clone / fetch / push の代表確認
- SQLite database と Git bare repository の参照確認

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

標準ロールバックは、直前の release directory、直前の Deno single binary、直前バックアップ、`current` symlink を用いる。

本番データへ影響するロールバック、SQLite database 復元、Git bare repository 復元は、必ずユーザー承認を得てから実行する。

## 9. 別承認が必要な範囲

以下は、デプロイ自動化の対象としてまとめて扱わず、必ず別途承認を得る。

- 初回本番デプロイ
- デプロイ先サーバ決定
- SSH 接続方式、接続ユーザー、配置パス決定
- systemd unit または同等のサービス定義作成・変更
- バックアップ保存先、保持世代、暗号化方針決定
- 本番データへ影響する操作
- SQLite database 復元
- Git bare repository 復元
- ロールバック実行
- 公開経路、ドメイン、TLS 設定変更

## 10. リリースポリシーとの関係

`docs/policies/RELEASE_POLICY.md` は、tag、GitHub Releases、release notes、manifest、checksum、成果物公開を管理する。

本ポリシーは、公開済みまたは承認済み成果物を本番サーバ環境へ反映するデプロイ、検証、バックアップ、ロールバックを管理する。

リリースとデプロイを同時に自動化する場合も、それぞれの承認対象、成果物、検証範囲、失敗時対応を分けて提示しなければならない。
