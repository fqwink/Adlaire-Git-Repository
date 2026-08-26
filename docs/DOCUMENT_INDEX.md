# ドキュメント索引

**位置づけ**: 参照索引
**責務**: ドキュメント一覧、参照順序、読了対象、役割確認
**ステータス**: Phase 8 DB / libSQL 標準化

---

## 1. 基本方針

本書は、Auris / Adlaire Git Repository のドキュメント参照索引である。

本書は、`AGENTS.md`、2類ポリシー、3類マスター仕様書、マスター開発計画の代替ではない。

作業者は、必ず最初に `AGENTS.md` を読む。その後、本書を索引として、作業に必要な2類ポリシー、3類マスター仕様書、マスター開発計画、関連文書を確認する。

作業者は、最上位ドキュメント読了工程と同時に、直前作業の Pull Request merge 状態、作業ブランチのクローズ状態、ローカルとリモートの整合性を確認する。

本書と正本が矛盾する場合は、正本を優先し、本書を修正して整合させる。

---

## 2. 参照順序

作業時の参照順序は以下とする。

1. `AGENTS.md`
2. `docs/DOCUMENT_INDEX.md`
3. 2類ポリシー
4. 3類マスター仕様書
5. マスター開発計画
6. マスター実装機能候補リスト
7. `README.md`

`docs/DOCUMENT_INDEX.md` は2番目に確認するが、優先順位上の正本ではない。正本性は `AGENTS.md` と各2類・3類ドキュメントの定義に従う。

---

## 3. 1類ルールブック

| ドキュメント | 役割 |
|---|---|
| `AGENTS.md` | 本リポジトリの最上位ルールブック。絶対原則、禁止事項、優先順位、承認義務、作業手順を定義する |

---

## 4. 2類ポリシー

| ドキュメント | 役割 |
|---|---|
| `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` | 2類ドキュメント群の総則、共通原則、参照順序、変更手順 |
| `docs/policies/DOCUMENT_CHARTER.md` | ドキュメント憲章。ドキュメント体系、責務境界、開発計画、フェーズ単位の改訂方針 |
| `docs/policies/TECHNICAL_REQUIREMENTS_POLICY.md` | 採用技術、ランタイム、依存関係、固定採用バージョン、技術承認 |
| `docs/policies/VERSION_POLICY.md` | バージョン表記、累積方式、Major / Minor 更新条件 |
| `docs/policies/RELEASE_POLICY.md` | 安定版リリース、リリース対象、リリース禁止条件、リリース配置、自動化方針 |
| `docs/policies/DEPLOYMENT_POLICY.md` | デプロイ、運用基盤、本番サーバ反映、バックアップ、検証、ロールバック |
| `docs/policies/TEST_POLICY.md` | 意味のあるテスト、テストピラミッド、テスト追加・削除判断 |
| `docs/policies/LICENSE_POLICY.md` | クローズドライセンス、権利帰属、外部公開、ライセンス変更 |

---

## 5. 3類マスター仕様書

| ドキュメント | 役割 |
|---|---|
| `docs/specs/Auris_System_Design.md` | システム全体のマスター仕様書。機能範囲、アーキテクチャ、非機能要件、セキュリティ方針の基準 |
| `docs/specs/Adlaire_Git_Repository_Specification.md` | Adlaire Git Repository 本体のマスター仕様書 |

3類マスター仕様書は、現行正本仕様、フェーズ別履歴、保留候補、対象外範囲を分離して読む。Phase 7 初回安定版リリース `v.1.8` は履歴として保持し、Phase 8 以降の仕様判断では、各マスター仕様書の現行正本仕様、2類ポリシー、マスター開発計画を基準にする。

---

## 6. 計画・候補リスト

| ドキュメント | 役割 |
|---|---|
| `docs/plans/DEVELOPMENT_PLAN.md` | マスター開発計画。フェーズ単位の開発計画、基準バージョン、実装対象、対象外、検証範囲、完了条件 |
| `docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` | マスター実装機能候補リスト。優先実装候補、保留候補、候補選定基準 |

---

## 7. 利用者向け文書

| ドキュメント | 役割 |
|---|---|
| `README.md` | 利用者向け手順、開発・デプロイ補足 |

---

## 8. AdlaireGroup 共通テンプレート

| パス | 役割 |
|---|---|
| `docs/tpl-governance/` | AdlaireGroup 関連プロジェクト、プロダクトへ展開する最上位ドキュメント体系の共通ガバナンス雛形の正本 |
| `docs/tpl-governance/core/` | 共通コア。最上位ルールブック、ドキュメント索引、ドキュメント憲章、2類ポリシー総則の雛形 |
| `docs/tpl-governance/policy-slots/` | 共通方針具体化用 policy slots。技術要件、バージョン、リリース、テスト、ライセンス、セキュリティ、データ、依存関係、デプロイの必須枠 |

`docs/tpl-governance/` 配下は、現行プロジェクト固有の正本ではなく、AdlaireGroup 関連プロジェクト、プロダクトへ共通展開するための共通ガバナンス雛形の正本である。

本プロジェクトの `AGENTS.md`、2類ポリシー、3類マスター仕様書、マスター開発計画を変更する場合は、変更内容が AdlaireGroup 共通方針に該当するかを判定し、該当する場合は `docs/tpl-governance/` も同一変更範囲で更新する。

採用技術、固定バージョン、ライセンス、デプロイ方式、データ保存、依存関係、セキュリティ要件は共通方針として扱う。プロジェクト固有値、仕様書名、Phase 計画、実装対象機能は、共通方針を破らない範囲で各プロジェクトが具体化する。

### 8.1 共通コア

| ドキュメント | 役割 |
|---|---|
| `docs/tpl-governance/core/AGENTS_TEMPLATE.md` | 最上位ルールブックの共通雛形 |
| `docs/tpl-governance/core/DOCUMENT_INDEX_TEMPLATE.md` | ドキュメント索引の共通雛形 |
| `docs/tpl-governance/core/DOCUMENT_CHARTER_TEMPLATE.md` | ドキュメント憲章の共通雛形 |
| `docs/tpl-governance/core/DEVELOPMENT_POLICY_RULEBOOK_TEMPLATE.md` | 2類ポリシー総則の共通雛形 |

### 8.2 policy slots

| ドキュメント | 役割 |
|---|---|
| `docs/tpl-governance/policy-slots/TECHNICAL_REQUIREMENTS_POLICY_TEMPLATE.md` | 技術要件ポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/VERSION_POLICY_TEMPLATE.md` | バージョンポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/RELEASE_POLICY_TEMPLATE.md` | リリースポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/TEST_POLICY_TEMPLATE.md` | テストポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/LICENSE_POLICY_TEMPLATE.md` | ライセンスポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/SECURITY_POLICY_TEMPLATE.md` | セキュリティポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/DATA_POLICY_TEMPLATE.md` | データポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/DEPENDENCY_POLICY_TEMPLATE.md` | 依存関係ポリシーの個別具体化枠 |
| `docs/tpl-governance/policy-slots/DEPLOYMENT_POLICY_TEMPLATE.md` | デプロイポリシーの個別具体化枠 |

---

## 9. 読了対象

すべての作業で最低限読む対象は以下とする。

- `AGENTS.md`
- `docs/DOCUMENT_INDEX.md`
- 2類ドキュメント群の全ファイル
- 3類マスター仕様書群の全ファイル
- `docs/plans/DEVELOPMENT_PLAN.md`
- `docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md`
- `README.md`

作業内容が特定責務に関わる場合は、該当する2類ポリシーと3類マスター仕様書を重点的に確認する。
