# Adlaire Deploy マスター仕様書

**位置づけ**: 3類マスター仕様書
**対象**: Adlaire Deploy
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**文書バージョン**: v.2.11
**ステータス**: Phase 10 着手仕様

---

## 1. 目的

Adlaire Deploy は、Adlaire Git Repository の付随システムとして、Deno single binary 正本成果物の取得、検証、配置、backup、rollback、manifest 記録を一貫して扱う内製デプロイメントシステムである。

Adlaire Deploy は、Adlaire Git Repository 本体へ統合しない。付随システムとして同居し、Adlaire Git Repository 本体の release、manifest、checksum、health check、deployment scripts、audit log と連携する。

Adlaire Deploy の目的は、GitHub Releases asset upload の成否だけに依存しない配布・取得・検証・展開導線を確立し、self-host、VPS、専用サーバー上で再現性のある運用を可能にすることである。

---

## 2. 上位ドキュメントとの関係

本書は3類マスター仕様書であり、1類ルールブック `AGENTS.md`、2類ポリシー、`docs/specs/Auris_System_Design.md`、`docs/plans/DEVELOPMENT_PLAN.md` に従う。

Adlaire Deploy の実装は、本書とマスター開発計画に定義された範囲に限る。仕様未定の機能、外部依存、配布方式、サーバ操作を独断で実装してはならない。

---

## 3. 基本方針

- Deno single binary を正本成果物として扱う。
- Docker image 配布は正式化しない。
- Docker は運用選択肢の一つであり、配布正本ではない。
- Node.js runtime、npm ecosystem、外部デプロイフレームワークを採用しない。
- GitHub Releases は配置先候補の一つとして扱うが、唯一の配布経路として固定しない。
- system 側と data 側を分離する。
- data 側は host filesystem を正本とする。
- 承認工程を省かず、対象、配置先、検証、backup、rollback 範囲を提示してから実行する。

---

## 4. 最小実装対象

Phase 10 の Adlaire Deploy 最小実装対象は以下とする。

- deployment manifest の読み込み
- Deno single binary 成果物の取得元定義
- checksum 検証
- 対象 architecture 判定
- system release directory への配置
- `system/current` の切り替え計画作成
- data 側 backup 計画作成
- rollback 計画作成
- dry-run 実行
- 実行結果 manifest の生成

Phase 10 では、初回から本番サーバへ破壊的変更を行う deploy 実行を標準対象にしない。まず dry-run、plan、verify を中心に実装し、実際の remote deploy 実行は別途承認された後続段階で扱う。

---

## 5. 対象外

Phase 10 では以下を対象外とする。

- Docker image 配布の正式化
- Container registry
- GitHub Actions
- 外部デプロイフレームワーク
- Node.js / npm 前提ツール
- 本番データ復元の自動実行
- rollback の data 復元自動実行
- 複数サーバー同時 rolling deploy
- blue-green deployment
- zero downtime 切替
- GUI
- SaaS 型クラウドデプロイ基盤

---

## 6. 入力と出力

Adlaire Deploy の入力は、最低限以下とする。

- 対象 version
- 対象 architecture
- 成果物取得元
- checksum
- 配置先 root
- system release path
- data root
- backup 対象
- health check endpoint
- rollback 対象 release

Adlaire Deploy の出力は、最低限以下とする。

- deploy plan
- verification result
- backup plan
- rollback plan
- deployment manifest
- error report

manifest、checksum、log は運用記録であり、リポジトリ内の変更履歴ファイルとして保持しない。

---

## 7. 連携境界

Adlaire Deploy は、Adlaire Git Repository 本体と以下の境界で連携する。

| 連携対象 | 方針 |
|---|---|
| GitHub Releases | 成果物取得元候補として扱う |
| release manifest | version、commit、artifact、checksum、validation を確認する |
| deployment scripts | 既存 `scripts/deploy/` を移行元・暫定標準として参照する |
| `/health` | 配置後検証に利用する |
| system / data 構成 | 2類デプロイポリシーの標準配置に従う |
| audit log | 将来の実行履歴連携候補とする |

Adlaire Deploy は Adlaire Git Repository の application code と密結合しない。連携は manifest、filesystem path、health endpoint、command execution の境界で行う。

---

## 8. 完了条件

Phase 10 の完了条件は以下とする。

- Adlaire Deploy が3類マスター仕様書として定義されている。
- Adlaire Deploy が保留候補ではなく Phase 10 の正式着手対象として整理されている。
- Docker image 配布を正式化しない方針と矛盾していない。
- Deno single binary 正本成果物方針と矛盾していない。
- `scripts/deploy/` の既存雛形との関係が整理されている。
- Phase 10 の実装対象、対象外、検証範囲、完了条件がマスター開発計画に定義されている。
- リポジトリ全体の整合性確認と整合性向上を完了している。
