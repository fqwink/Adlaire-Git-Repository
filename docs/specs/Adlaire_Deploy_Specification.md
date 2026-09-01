# Adlaire Deploy マスター仕様書

**位置づけ**: 3類マスター仕様書
**対象**: Adlaire Deploy
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**文書バージョン**: v.2.14
**ステータス**: Phase 10 Adlaire Deploy オンプレミス / VPS 前提固定

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

Adlaire Deploy は、Deno single binary または Deno runtime 上の TypeScript CLI として実行する。Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules`、外部デプロイフレームワークを前提にしてはならない。

Deno Deploy 環境対応は白紙とし、標準採用、将来候補、参考互換対象として扱わない。再検討する場合は、方針変更として1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画を改訂し、ユーザー承認を得る。

---

## 5. 基本方針

- Deno single binary を正本成果物として扱う。
- Docker image 配布は正式化しない。
- Docker は運用選択肢の一つであり、配布正本ではない。
- 標準採用は Deno 標準ライブラリ（`jsr:@std/*`）に限定する。
- 必要な parser 等の外部ライブラリは、非 npm 依存であることを条件に、明示的な例外採用として管理する。
- Node.js runtime、npm ecosystem、npm 互換 package、`npm:` specifier、`package.json`、`node_modules`、外部デプロイフレームワークを採用しない。
- Adlaire Deploy 専用 database を持たない。
- Adlaire Git Repository 本体の libSQL database を直接操作しない。
- GitHub Releases は配置先候補の一つとして扱うが、唯一の配布経路として固定しない。
- system 側と data 側を分離する。
- data 側は host filesystem を正本とする。
- VPS、self-host、専用サーバーは SSH 使用可能を最低必須条件とする。
- Deno Deploy 環境対応は白紙とする。
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

## 13. 仕様固定範囲

Phase 10 では、Adlaire Deploy の以下を仕様固定範囲とする。

- 実行主体
- 実行対象環境
- 入力 manifest
- 成果物取得元
- 成果物検証
- SSH 接続検証
- remote 環境検証
- system / data 分離検証
- backup 計画
- system rollback 計画
- health check 計画
- 実行結果 manifest
- error report
- 既存 `scripts/deploy/` との責務境界

上記にない機能は、Phase 10 実装対象として扱わない。追加する場合は、本書、マスター開発計画、必要な2類ポリシーを改訂し、ユーザー承認を得る。

---

## 14. 実行主体

Adlaire Deploy は、Adlaire Git Repository 本体から独立した CLI として実行する。

標準実行名は `adlaire-deploy` とする。実装初期に Deno source から実行する場合も、最終的な実行単位は Deno single binary 化できる構成にする。

Adlaire Deploy は常駐 service として起動しない。HTTP server、queue worker、scheduler、daemon、database-backed job runner は Phase 10 の対象外とする。

Adlaire Deploy は、1回の実行ごとに入力 manifest を読み、検証し、plan、verification result、result manifest、error report を出力して終了する。

---

## 15. 標準コマンド

Phase 10 の標準コマンドは以下とする。

| Command | 役割 | system 変更 | data 変更 |
|---|---|---:|---:|
| `adlaire-deploy plan --manifest <path>` | deployment plan を生成する | なし | なし |
| `adlaire-deploy verify --manifest <path>` | artifact、SSH、remote、path、health endpoint を検証する | なし | なし |
| `adlaire-deploy dry-run --manifest <path>` | 変更せず、plan、backup、rollback、検証結果をまとめて出力する | なし | なし |
| `adlaire-deploy apply-system --manifest <path>` | 承認済み範囲で system 側の配置と current 切替を行う | あり | なし |
| `adlaire-deploy rollback-system --manifest <path>` | 承認済み範囲で system 側のみ rollback する | あり | なし |

`plan`、`verify`、`dry-run` は、実ファイル配置、symlink 切替、service restart、backup 実体作成を行ってはならない。

`apply-system` と `rollback-system` は仕様として定義するが、実装着手と実サーバ実行には別途ユーザー承認を必要とする。

---

## 16. Deployment Manifest 仕様

Deployment manifest は、Adlaire Deploy の唯一の正規入力とする。

標準形式は JSON とする。YAML、TOML、database record、環境変数のみの入力は Phase 10 の標準 manifest 形式として採用しない。

manifest は最低限以下の top-level fields を持つ。

| Field | 必須 | 内容 |
|---|---:|---|
| `schemaVersion` | 必須 | manifest schema version。Phase 10 では `1` とする |
| `deploymentId` | 必須 | 実行単位の識別子 |
| `project` | 必須 | 対象 project 名。Phase 10 では `adlaire-git-repository` を標準とする |
| `version` | 必須 | 対象正式バージョン |
| `artifact` | 必須 | 成果物取得元、checksum、architecture |
| `target` | 必須 | SSH 接続先、root、system / data path |
| `mode` | 必須 | `plan`、`verify`、`dry-run`、`apply-system`、`rollback-system` のいずれか |
| `backup` | 必須 | backup 計画対象、保存先、実行可否 |
| `rollback` | 必須 | rollback 対象 release、system rollback 条件 |
| `healthCheck` | 必須 | 配置後検証 endpoint と期待結果 |
| `approval` | 必須 | 承認対象、承認済み実行範囲、実行禁止範囲 |

`deploymentId` は、同じ実行の plan、verification result、deployment result、error report を紐づけるために使う。database primary key として扱ってはならない。

---

## 17. Artifact 仕様

Phase 10 の標準 artifact は Deno single binary とする。

artifact は最低限以下を持つ。

| Field | 必須 | 内容 |
|---|---:|---|
| `sourceType` | 必須 | `local` または `github-release` |
| `source` | 必須 | local path または GitHub Releases asset URL |
| `fileName` | 必須 | artifact file name |
| `architecture` | 必須 | `aarch64-unknown-linux-gnu` または `x86_64-unknown-linux-gnu` |
| `sha256` | 必須 | SHA-256 checksum |
| `sizeBytes` | 任意 | 期待 size |

`architecture` は、対象 remote の `uname -m` から判定した architecture と一致しなければならない。

`sourceType=github-release` は GitHub Releases を成果物取得元候補として扱う。GitHub Releases を唯一の配布経路として固定してはならない。

Docker image は Phase 10 の配布正本ではない。Docker を使う場合も、artifact 正本は Deno single binary とする。

---

## 18. Target / SSH 仕様

target は最低限以下を持つ。

| Field | 必須 | 内容 |
|---|---:|---|
| `host` | 必須 | SSH 接続先 host |
| `port` | 必須 | SSH port。未指定既定値による暗黙接続は禁止 |
| `user` | 必須 | SSH user |
| `identityFile` | 必須 | SSH private key path |
| `appRoot` | 必須 | 標準 root。例: `/opt/adlaire-git-repository` |
| `systemRoot` | 必須 | system 側 root |
| `dataRoot` | 必須 | data 側 root |
| `backupRoot` | 必須 | backup root |
| `useSudo` | 必須 | sudo 要否 |

SSH 接続では、shell command 文字列の組み立てにユーザー入力を直接連結してはならない。remote command の引数は検証済み値のみを使う。

Adlaire Deploy は SSH private key、password、token、secret を manifest、result、log、error report に出力してはならない。

---

## 19. Preflight 仕様

`verify` と `dry-run` は、最低限以下の preflight を行う。

- manifest schema version 検証
- version 表記検証
- deployment mode 検証
- artifact source 検証
- SHA-256 checksum 検証
- architecture 検証
- SSH 接続確認
- remote `uname -m` 確認
- remote 必須コマンド確認
- `appRoot`、`systemRoot`、`dataRoot`、`backupRoot` の path 検証
- system / data 分離確認
- data 側保護対象の存在確認
- backup 書き込み先確認
- health check endpoint 形式確認
- rollback 対象 release 確認

remote 必須コマンドは最低限以下とする。

```text
sh
uname
mkdir
cp
mv
ln
chmod
sha256sum または shasum
```

Docker 運用を対象にする場合のみ、`docker` と `docker compose` または同等コマンドを追加確認する。

---

## 20. Plan / Result / Error 仕様

Adlaire Deploy は、実行ごとに以下のいずれかを出力する。

- deploy plan
- verification result
- deployment result
- rollback plan
- error report

すべての出力は JSON とし、最低限以下を持つ。

| Field | 必須 | 内容 |
|---|---:|---|
| `schemaVersion` | 必須 | 出力 schema version。Phase 10 では `1` とする |
| `deploymentId` | 必須 | 入力 manifest と同じ識別子 |
| `mode` | 必須 | 実行 mode |
| `status` | 必須 | `success`、`failed`、`blocked` のいずれか |
| `startedAt` | 必須 | 実行開始時刻 |
| `finishedAt` | 必須 | 実行終了時刻 |
| `checks` | 必須 | 検証項目と結果 |
| `actions` | 必須 | 実行予定または実行済み action |
| `errors` | 必須 | error list。空配列可 |

`plan`、`verify`、`dry-run` の `actions` は実行予定を示すだけであり、実行済み変更として扱ってはならない。

---

## 21. Error 分類

Adlaire Deploy の error は、最低限以下に分類する。

| Code | 意味 |
|---|---|
| `MANIFEST_INVALID` | manifest schema、必須項目、値形式が不正 |
| `APPROVAL_REQUIRED` | 実行範囲が承認済み範囲を超えている |
| `ARTIFACT_NOT_FOUND` | artifact を取得できない |
| `CHECKSUM_MISMATCH` | checksum が一致しない |
| `ARCHITECTURE_MISMATCH` | target architecture と artifact が一致しない |
| `SSH_UNAVAILABLE` | SSH 接続できない |
| `REMOTE_REQUIREMENT_MISSING` | remote 必須コマンドまたは path が不足 |
| `SYSTEM_DATA_CONFLICT` | system / data 分離が破られている |
| `BACKUP_NOT_READY` | backup 計画または保存先が成立しない |
| `HEALTH_CHECK_FAILED` | health check が失敗 |
| `ROLLBACK_NOT_READY` | rollback 対象または条件が成立しない |
| `FORBIDDEN_DATABASE_OPERATION` | database 直接操作、migration、query、restore を要求している |

error report には、原因、影響範囲、次に確認すべき項目を含める。ただし secret 値、token、SSH private key、password を含めてはならない。

---

## 22. Security / Data 保護仕様

Adlaire Deploy は、デプロイ自動化の利便性よりも data 保全と整合性を優先する。ただし、シンプル、軽量、データ保全、整合性、運用性、デプロイ性は同等に満たすべき品質として扱う。

以下を禁止する。

- data 側を system 側の release directory 配下へ配置すること
- Docker named volume を data 正本として扱うこと
- database file を開いて query、migration、restore を実行すること
- secret を manifest、plan、result、log、error report へ出力すること
- checksum 未検証 artifact を配置対象にすること
- architecture 不一致 artifact を配置対象にすること
- SSH 接続先、user、identity、path を未承認のまま実行すること
- `apply-system` または `rollback-system` を `dry-run` と同じ承認範囲で実行すること

data 側の backup 実体作成、database file copy、Git bare repository copy は、承認済み範囲でのみ実行できる。database 復元、data 復元、secrets 復元、Git bare repository 復元は通常実行モードから除外し、別途ユーザー承認を必須とする。

---

## 23. scripts/deploy との関係

`scripts/deploy/` 配下の shell script 群は、Adlaire Deploy の移行元・暫定標準である。

Adlaire Deploy は、既存 script の責務を以下のように置き換える。

| 既存 script | Adlaire Deploy 側の責務 |
|---|---|
| `verify-server.sh` | `verify` の SSH、remote、path、必須コマンド検証 |
| `verify-release.sh` | `verify` の artifact、process、health check、主要確認 |
| `backup.sh` | backup plan 生成と承認済み backup 実行候補 |
| `deploy.sh` | `plan`、`dry-run`、承認済み `apply-system` |
| `rollback.sh` | rollback plan 生成と承認済み `rollback-system` |

Phase 10 実装が完了し、検証済みの移行先としてユーザー承認されるまで、既存 script 群を削除または置換してはならない。

---

## 24. 完成条件

Adlaire Deploy のマスター仕様は、以下を満たす場合に仕様固定済みとして扱う。

- DB 不使用の定義が明確である。
- 実行主体が CLI として定義されている。
- 標準コマンドと実行モードが定義されている。
- deployment manifest の必須項目が定義されている。
- artifact 仕様が定義されている。
- target / SSH 仕様が定義されている。
- preflight 項目が定義されている。
- plan、result、error report の出力仕様が定義されている。
- error 分類が定義されている。
- security / data 保護仕様が定義されている。
- 既存 `scripts/deploy/` との関係が定義されている。
- Phase 10 の実装対象、対象外、検証範囲、完了条件がマスター開発計画と整合している。

---

## 25. Phase 10 完了条件

Phase 10 の完了条件は以下とする。

- Adlaire Deploy が3類マスター仕様書として定義されている。
- Adlaire Deploy のマスター仕様が仕様固定済みとして扱える。
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
