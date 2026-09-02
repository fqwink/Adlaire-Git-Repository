# Adlaire 公式 SDK マスター仕様書

**位置づけ**: 3類マスター仕様書
**対象**: Adlaire 公式 SDK
**ライセンス**: クローズドライセンス
**文書バージョン**: v.2.26
**ステータス**: SDK 仕様正本新設

---

## 1. 目的

本書は、Adlaire 公式 SDK のマスター仕様書である。

Adlaire 公式 SDK は、Adlaire Git Repository のヘッドレスアーキテクチャにおけるクライアント接続境界である。

SDK は、HTML / CSS / Vanilla JavaScript で構成される静的フロントエンド、モバイルアプリ、外部システムが、Adlaire Git Repository 本体へ接続するための標準境界を提供する。

本書は、SDK の目的、責務、配置、生成方式、配布方式、リリース方針、禁止事項、未確定範囲を定義する。

---

## 2. 上位ドキュメントとの関係

本書は、1類ルールブックである `AGENTS.md`、2類ポリシー、`docs/specs/Auris_System_Design.md` に従う。

Adlaire Git Repository 本体との接続境界は、`docs/specs/Adlaire_Git_Repository_Specification.md` と整合させる。

SDK の実装時期、フェーズ、検証範囲、完了条件は、`docs/plans/DEVELOPMENT_PLAN.md` を正本として管理する。

本書と上位ドキュメントに矛盾がある場合は、上位ドキュメントを正とし、本書を修正する。

---

## 3. 現行正本仕様

Adlaire 公式 SDK の現行正本仕様は以下とする。

- SDK は Adlaire Git Repository 本体ではなく、クライアント接続境界として扱う。
- SDK は Adlaire Git Repository 本体へ同梱しない。
- SDK は独立リリース対象とする。
- SDK のリポジトリ分離は現時点では未定とする。
- 当面は現行リポジトリ内の `sdk/` で管理する。
- SDK は TypeScript で実装する。
- Vanilla JavaScript から利用できる JavaScript を生成する。
- SDK の生成方式は Deno runtime とする。
- SDK 配布方式は現行リポジトリで扱い、リポジトリ分離時は分離先リポジトリで扱う。
- SDK 固定採用バージョンは2類技術要件ポリシーに従う。
- SDK リリース開始フェーズは2類リリースポリシーとマスター開発計画に従う。
- SDK は Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` の禁止方針を緩和しない。

---

## 4. 責務

SDK の責務は以下とする。

- Adlaire Git Repository API への接続境界を提供する。
- 認証情報の取り扱いをクライアント側で一貫させる。
- Repository、Issue、Pull Request、Wiki、Release、Webhook、Organization、Team、Project 等の公開 API 利用を統一する。
- Vanilla JavaScript から利用可能な生成物を提供する。
- UI 実装、モバイルアプリ、外部システムが本体内部構造へ直接依存しないようにする。

SDK は、Adlaire Git Repository 本体の内部 Service、Repository、Database Gateway、driver、Git 操作処理へ直接依存してはならない。

---

## 5. 配置

SDK は、当面 `sdk/` 配下で管理する。

`sdk/` は Adlaire Git Repository 本体の Go 実装領域ではない。

SDK のリポジトリ分離は現時点では未定である。分離する場合は、分離先リポジトリ、履歴移行、配布方式、リリース方式、バージョン連携を提示し、ユーザー承認を得る。

---

## 6. 生成方式

SDK は TypeScript で実装し、Vanilla JavaScript から利用できる JavaScript を生成する。

生成方式は Deno runtime とする。

Deno runtime を利用することは、Adlaire Git Repository 本体の標準開発言語を Deno + TypeScript に戻すことを意味しない。本体の標準開発言語は Go のままとする。

SDK 生成においても、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を導入してはならない。

---

## 7. 配布とリリース

SDK は本体へ同梱せず、独立リリース対象とする。

現時点の SDK 配布方式は、現行リポジトリで扱う。リポジトリ分離時は、分離先リポジトリで扱う。

SDK のリリース開始フェーズ、リリース成果物、配置先、release notes、checksum、manifest は、2類リリースポリシーとマスター開発計画に従い、リリース作業ごとにユーザー承認を得る。

SDK のリリースは Adlaire Git Repository 本体の安定版リリースを自動的に意味しない。本体の安定版リリースも SDK のリリースを自動的に意味しない。

---

## 8. 対象外

現時点では以下を対象外とする。

- SDK 実装
- SDK API 詳細仕様の確定
- SDK 実装開始フェーズの確定
- SDK リリース実行
- SDK リポジトリ分離
- npm package としての配布
- Node.js runtime 前提の生成、検証、配布
- 外部フレームワーク採用
- 無承認の外部ライブラリ採用

---

## 9. 完了条件

本書は、以下を満たす状態を SDK マスター仕様の現行正本とする。

- SDK が本体ではなくクライアント接続境界であることを説明できる。
- SDK が本体非同梱、独立リリース対象であることを説明できる。
- `sdk/` 配置、リポジトリ分離未定、現行リポジトリ配布を説明できる。
- TypeScript 実装、Vanilla JavaScript 向け JavaScript 生成、Deno runtime 生成を説明できる。
- Node.js / npm 禁止方針を緩和しないことを説明できる。
- SDK 実装、API 詳細、実装開始フェーズ、リリース実行が未確定範囲として分離されている。
