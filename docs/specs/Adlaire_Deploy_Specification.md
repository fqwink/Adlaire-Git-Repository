# Adlaire Deploy マスター仕様書

**位置づけ**: 3類マスター仕様書
**対象**: Adlaire Deploy
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**文書バージョン**: v.2.12
**ステータス**: Phase 10 DB 不使用仕様確定

---

## 1. 目的

Adlaire Deploy は、Adlaire Git Repository の付随システムとして、Deno single binary 正本成果物の取得、検証、配置、backup、rollback、manifest 記録を一貫して扱う内製デプロイメントシステムである。

Adlaire Deploy は、Adlaire Git Repository 本体へ統合しない。付随システムとして同居し、Adlaire Git Repository 本体の release、manifest、checksum、health check、deployment scripts、audit log と連携する。

Adlaire Deploy は、Adlaire Deploy 専用 database を持たない。Adlaire Git Repository 本体の libSQL database へ直接接続せず、database schema、migration、query、restore を実行しない。Adlaire Deploy の状態、計画、結果、検証記録は、manifest、log、plan file として host filesystem 上に保存する。

Adlaire Deploy の目的は、GitHub Releases asset upload の成否だけに依存しない配布・取得・検証・展開導線を確立し、self-host、VPS、専用サーバー上で再現性のある運用を可能にすることである。

---

## 2. 上位ドキュメントとの関係

本書は3類マスター仕様書であり、1類ルールブック `AGENTS.md`、2類ポリシー、`docs/specs/Auris_System_Design.md`、`docs/plans/DEVELOPMENT_PLAN.md` に従う。

Adlaire Deploy の実装は、本書とマスター開発計画に定義された範囲に限る。仕様未定の機能、外部依存、配布方式、サーバ操作を独断で実装してはならない。

Adlaire Deploy の実装、デプロイ実行、SSH 接続先設定、本番サーバ反映、backup 実行、rollback 実行は、対象範囲と検証方法を提示し、別途ユーザー承認を得てから行う。

---

## 3. 定義

Adlaire Deploy は、DB 不使用のデプロイメント制御システムである。

本書における DB 不使用とは、以下をすべて満たすことを指す。

- Adlaire Deploy 専用 database を作成しない。
- Adlaire Deploy の実行履歴、状態、計画、結果を database に保存しない。
- Adlaire Git Repository 本体の libSQL database へ直接接続しない。
- application database の schema、migration、query、seed、restore を実行しない。
- database driver、ORM、SQL builder、migration framework を Adlaire Deploy の実装依存として採用しない。
- libSQL database file は保護対象 data file として扱い、backup 計画、存在確認、path 検証、file copy の対象に限る。

Adlaire Deploy の標準状態保存は、host filesystem 上の manifest、plan、result、log である。

---

## 4. 前提条件

Adlaire Deploy の標準対象環境は、self-host、VPS、専用サーバーである。

VPS、self-host、専用サーバーを対象にする場合は、最低必須条件として SSH が使用可能でなければならない。SSH が使用できない環境は、Adlaire Deploy の標準対象外とする。

SSH を利用する場合は、接続先 host、port、user、認証方式、鍵の扱い、配置 root、実行可能コマンド、sudo 要否、system / data の path を事前に提示し、ユーザー承認を得る。

Adlaire Deploy は、Deno single binary または Deno runtime 上の TypeScript CLI として実行する。Node.js runtime、npm ecosystem、外部デプロイフレームワークを前提にしてはならない。

---

## 5. 基本方針

- Deno single binary を正本成果物として扱う。
- Docker image 配布は正式化しない。
- Docker は運用選択肢の一つであり、配布正本ではない。
- Node.js runtime、npm ecosystem、外部デプロイフレームワークを採用しない。
- Adlaire Deploy 専用 database を持たない。
- Adlaire Git Repository 本体の libSQL database を直接操作しない。
- GitHub Releases は配置先候補の一つとして扱うが、唯一の配布経路として固定しない。
- system 側と data 側を分離する。
- data 側は host filesystem を正本とする。
- VPS、self-host、専用サーバーは SSH 使用可能を最低必須条件とする。
- 承認工程を省かず、対象、配置先、検証、backup、rollback 範囲を提示してから実行する。

---

## 6. ファイルベース状態管理

Adlaire Deploy は database を使わず、以下のファイル群で計画、結果、検証記録を管理する。

| 種別 | 標準配置 | 役割 |
|---|---|---|
| deploy plan | `shared/manifests/deploy-plans/` | 配置対象、成果物、checksum、target、実行手順を記録する |
| deploy result | `shared/manifests/deploy-results/` | 実行結果、成功、失敗、検証結果を記録する |
| rollback plan | `shared/manifests/rollback-plans/` | system 側 rollback 対象、復旧手順、制約を記録する |
| verification record | `shared/manifests/verification/` | preflight、checksum、health check、path 検証を記録する |
| deploy log | `shared/logs/deploy/` | 実行ログを保存する |

これらは運用記録であり、リポジトリ内の変更履歴ファイルとして保持しない。

---

## 7. Phase 10 実装対象

Phase 10 では、DB 不使用で実装できる Adlaire Deploy の機能を実装対象とする。

Phase 10 の実装対象は以下とする。

- deployment manifest の読み込み
- deployment manifest の構文検証
- 対象 version の検証
- 対象 architecture の判定
- Deno single binary 成果物の取得元定義
- local artifact 参照
- GitHub Releases artifact 参照
- checksum 検証
- artifact size、permission、実行可能性の検証
- SSH 接続事前検証
- remote 必須コマンド検証
- target root、system root、data root、backup root の path 検証
- system / data 分離構成の検証
- data 側保護対象の列挙
- data 側 backup 計画作成
- database file を含む data file の backup 対象化
- system release directory への配置計画作成
- `system/current` の切り替え計画作成
- health check 計画作成
- rollback 計画作成
- dry-run 実行
- deploy plan file の生成
- verification result file の生成
- deployment result manifest の生成
- error report の生成
- `scripts/deploy/` 配下の標準デプロイ雛形との責務整理

Phase 10 では、初回から本番サーバへ破壊的変更を行う deploy 実行を標準対象にしない。まず plan、verify、dry-run を中心に実装し、system 側への実配置、`system/current` 切替、rollback 実行、backup 実行は、個別に実行対象、影響範囲、検証方法を提示し、ユーザー承認を得た範囲で段階的に扱う。

---

## 8. Database の扱い

Adlaire Deploy は database を使用しない。

Adlaire Deploy が扱ってよい database 関連要素は、host filesystem 上の data file としての libSQL database file、移行元 SQLite database file、backup file、manifest に記載された path に限る。

Adlaire Deploy は database file の中身を解釈しない。SQL を発行しない。migration を実行しない。schema を変更しない。restore を自動実行しない。

database file を含む data backup は、file として保護する。database 復元、data 復元、migration、破壊的変更を伴う操作は、通常 deploy 自動化の対象外とし、必ず別途ユーザー承認を得る。

---

## 9. 入力と出力

Adlaire Deploy の入力は、最低限以下とする。

- 対象 version
- 対象 architecture
- 成果物取得元
- checksum
- deployment mode
- SSH target
- SSH user
- SSH port
- SSH identity
- 配置先 root
- system release path
- data root
- backup 対象
- backup target
- health check endpoint
- rollback 対象 release

Adlaire Deploy の出力は、最低限以下とする。

- deploy plan
- preflight verification result
- artifact verification result
- backup plan
- rollback plan
- deployment manifest
- deployment result
- error report

manifest、checksum、log は運用記録であり、リポジトリ内の変更履歴ファイルとして保持しない。

---

## 10. 実行モード

Adlaire Deploy の実行モードは以下を基準とする。

| Mode | 役割 |
|---|---|
| `plan` | deployment manifest を読み込み、実行計画を生成する |
| `verify` | artifact、checksum、architecture、SSH、path、system / data 分離、health endpoint を検証する |
| `dry-run` | 実配置を行わず、配置、backup、rollback の計画と検証結果を出力する |
| `apply-system` | 承認済み範囲で system 側の成果物配置と `system/current` 切替を行う |
| `rollback-system` | 承認済み範囲で system 側のみ rollback する |

`apply-system` と `rollback-system` は、仕様上の実行モードとして定義する。ただし、実装着手、実サーバ実行、本番反映は別途ユーザー承認を必要とする。

data 復元、database 復元、secrets 復元、Git bare repository 復元は、Adlaire Deploy の通常実行モードに含めない。

---

## 11. 対象外

Phase 10 では以下を対象外とする。

- Adlaire Deploy 専用 database
- Adlaire Git Repository 本体 database への直接接続
- database schema 変更
- database migration 実行
- database query 実行
- database restore 自動実行
- Docker image 配布の正式化
- Container registry
- GitHub Actions
- 外部デプロイフレームワーク
- Node.js / npm 前提ツール
- 本番データ復元の自動実行
- rollback の data 復元自動実行
- SSH を使用できない VPS、self-host、専用サーバーへの標準対応
- 複数サーバー同時 rolling deploy
- blue-green deployment
- zero downtime 切替
- GUI
- SaaS 型クラウドデプロイ基盤

---

## 12. 連携境界

Adlaire Deploy は、Adlaire Git Repository 本体と以下の境界で連携する。

| 連携対象 | 方針 |
|---|---|
| GitHub Releases | 成果物取得元候補として扱う |
| release manifest | version、commit、artifact、checksum、validation を確認する |
| deployment scripts | 既存 `scripts/deploy/` を移行元・暫定標準として参照する |
| `/health` | 配置後検証に利用する |
| system / data 構成 | 2類デプロイポリシーの標準配置に従う |
| libSQL database file | data file として backup 計画、path 検証、保護対象列挙に限って扱う |
| audit log | 将来の実行履歴連携候補とする |

Adlaire Deploy は Adlaire Git Repository の application code と密結合しない。連携は manifest、filesystem path、health endpoint、command execution、SSH の境界で行う。

---

## 13. 完了条件

Phase 10 の完了条件は以下とする。

- Adlaire Deploy が3類マスター仕様書として定義されている。
- Adlaire Deploy が DB 不使用の付随システムとして定義されている。
- Adlaire Deploy が保留候補ではなく Phase 10 の正式着手対象として整理されている。
- Docker image 配布を正式化しない方針と矛盾していない。
- Deno single binary 正本成果物方針と矛盾していない。
- VPS、self-host、専用サーバーでは SSH 使用可能を最低必須条件として定義している。
- DB 不使用で実装可能な機能が Phase 10 実装対象として整理されている。
- Adlaire Deploy が Adlaire Git Repository 本体 database を直接操作しないことを説明できる。
- `scripts/deploy/` の既存雛形との関係が整理されている。
- Phase 10 の実装対象、対象外、検証範囲、完了条件がマスター開発計画に定義されている。
- リポジトリ全体の整合性確認と整合性向上を完了している。
