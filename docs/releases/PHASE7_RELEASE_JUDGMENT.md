# Phase 7 安定版リリース判定材料

**位置づけ**: Phase 7 リリース判定材料
**対象**: Auris / Adlaire Git Repository
**対象フェーズ**: Phase 7
**判定前バージョン**: v.0.8
**安定版承認時バージョン**: v.1.8
**作成日**: 2026-08-21
**ステータス**: 初回安定版リリース承認済み

---

## 1. 目的

本書は、Phase 7 のデフォルト安定版リリース判定に必要な材料と、初回安定版リリース `v.1.8` の承認結果を整理するための文書である。

ユーザー承認に基づき、`v.1.8` への移行、tag 作成、GitHub Releases 作成、成果物配置、release notes 公開を実施対象とする。

---

## 2. 判定対象

| 項目 | 内容 |
|---|---|
| 対象フェーズ | Phase 7 |
| 判定前バージョン | v.0.8 |
| 安定版承認時バージョン | v.1.8 |
| 対象範囲 | Phase 6 までに main へ取り込まれた成果、および Phase 7 着手時の整合変更 |
| 対象外 | Phase 8 以降の長期運用準備、保留候補の実装、追加機能開発 |

---

## 3. Phase 6 までの成果

Phase 6 までに、以下の成果が main へ取り込まれている。

- Git 基本機能、認証、Repository CRUD、SQLite 基盤、Deno single binary 実行環境
- Pull Request、Code Review、Issue、Wiki、Webhook、Release、REST API 基本機能
- Organizations、Teams、Projects、Adlaire 内製 Deno Module Registry 最小実装
- Phase 1 から Phase 3 までの統合確認、仕様整合、移行準備、検証導線整理
- Phase 5 の Web UI デザイン関連改良・改修
- Phase 6 の大規模バグ修正、ドキュメント整合性向上、主要 workflow 検証強化
- Phase 7 着手として、基準バージョンを `v.0.8` へ更新し、トップページ表示と表示契約テストを整合

---

## 4. 既知バグ

Phase 6 完了時点および Phase 7 着手時点の標準検証範囲では、既知バグは確認されていない。

Phase 6 で修正済みの代表的な既知バグは以下である。

- 認証、権限、Git Smart HTTP、SQLite 外部キー、入力エラー応答、重複応答
- Registry 一覧制御
- HTTP Authorization scheme の大小文字処理
- Webhook secret API 非露出
- Team member の Organization member 境界

既知バグが新たに確認された場合、安定版リリース判定前に修正し、再検証しなければならない。

---

## 5. 主要 workflow 検証結果

Phase 7 着手時点の標準検証は成功している。

```text
32 passed | 0 failed
adlaire-git-repository-check-ok
```

標準検証で確認した主な項目は以下である。

- `deno fmt --check`
- `deno lint`
- `deno test`
- `deno compile`
- Repository 作成、表示、権限確認
- private repository access
- Issue workflow
- Pull Request / Code Review workflow
- Wiki、Webhook、Release 基本 workflow
- Organizations / Teams / Projects / Registry workflow
- Git Smart HTTP の clone / fetch / pull / push
- Phase 7 の表示契約
- Phase 6 既知バグ再発防止テスト

---

## 6. 既知制約

現時点の既知制約は以下である。

- 本プロジェクトはクローズドライセンスである。
- 標準運用基盤は self-host / VPS / 専用サーバーを前提とする。
- Deno single binary は現行方針として正本成果物であり、Docker は運用選択肢の一つである。
- Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは標準採用ではなく将来候補として保留する。
- SQLite を標準データベースとし、libSQL は将来移行候補として保持する。
- Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` 前提の構成は採用禁止である。
- 外部フレームワークは採用禁止であり、外部ライブラリは必要最小限の例外採用に限る。
- UI は GitHub 互換対象外であり、本プロジェクト独自 UI とする。

---

## 7. 対象外機能

Phase 7 の安定版リリース判定では、以下を対象外とする。

- Phase 8 以降の長期運用準備
- 保留候補の実装
- GitHub UI 互換
- 追加の外部依存採用
- libSQL への実移行
- クラウドDBホスティング採用
- Deno Deploy 採用
- npm registry 互換レジストリ
- 汎用 Package registry
- Container registry

---

## 8. 保留候補

保留候補は、`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` を正とする。

Phase 7 では、保留候補を実装対象へ戻さない。保留候補を実装対象へ戻す場合は、保留解除理由、必要性、影響範囲を整理し、3類マスター仕様書、マスター開発計画、検証範囲へ反映し、ユーザー承認を得る。

---

## 9. Backup / Restore 前提

安定版リリース判定では、最低限以下を backup / restore 前提として確認する。

- `dataDir` 配下の SQLite database を事前バックアップする。
- bare repository 保存領域を事前バックアップする。
- 設定ファイル、環境変数、配布 binary を復旧可能な形で管理する。
- 起動後に `/health`、トップページ、Repository 一覧、主要 API workflow を確認する。
- ロールバック時は、対象バージョンの binary、SQLite database、bare repository の整合を保つ。

---

## 10. リリース配置案

安定版リリース成果物の主配置は GitHub Releases とする。

GitHub Releases には、以下を配置候補とする。

- リリース成果物
- release notes
- checksum
- manifest

リポジトリ内には、履歴として追跡すべき軽量な release notes 元資料、manifest、checksum、運用手順を配置できる。

リリース配置先の最終決定、tag 作成、GitHub Releases 作成、成果物アップロードは、別途ユーザー承認を得るまで実施しない。

---

## 11. 判定欄

| 判定項目 | 状態 |
|---|---|
| 既知バグ | 標準検証範囲では未確認 |
| セキュリティ要件 | 主要認証・認可・権限境界を検証済み |
| 主要 workflow | 標準検証で成功 |
| ドキュメント整合性 | Phase 7 着手時点で整合済み |
| ライセンス方針 | クローズドライセンス |
| リリース配置 | GitHub Releases 案 |
| 安定版リリース可否 | 可 |

---

## 12. 次アクション

Phase 7 の安定版リリースとして、以下を実施する。

- 初回安定版リリース判定
- `v.1.8` への移行
- tag `v.1.8` 作成
- GitHub Releases `v.1.8` 作成
- Deno single binary の成果物配置
- release notes 公開
- checksum / manifest 生成
