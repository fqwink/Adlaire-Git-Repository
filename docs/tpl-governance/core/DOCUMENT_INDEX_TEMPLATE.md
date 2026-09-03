# ドキュメント索引

**対象**: `{PROJECT_NAME}`
**位置づけ**: 参照索引
**責務**: ドキュメント一覧、参照順序、読了対象、役割確認

---

## 1. 基本方針

本書は、`{PROJECT_NAME}` のドキュメント参照索引である。

本書は、`AGENTS.md`、2類ポリシー、3類マスター仕様書、マスター開発計画の代替ではない。

作業者は、必ず最初に `AGENTS.md` を読む。その後、本書を索引として、作業に必要な文書を確認する。

`docs/tpl-governance/` は、AdlaireGroup 共通ガバナンス雛形の正本である。各プロジェクトの運用正本とは分離し、共通方針の展開元として参照する。

---

## 2. 参照順序

1. `AGENTS.md`
2. `docs/DOCUMENT_INDEX.md`
3. 2類ポリシー
4. 3類マスター仕様書
5. マスター開発計画
6. プロジェクト固有計画・候補リスト
7. `README.md`

---

## 3. 1類ルールブック

| ドキュメント | 役割 |
|---|---|
| `AGENTS.md` | 最上位ルールブック |

---

## 4. 2類ポリシー

| ドキュメント | 役割 |
|---|---|
| `docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` | 2類ポリシー総則 |
| `docs/policies/DOCUMENT_CHARTER.md` | ドキュメント憲章 |
| `docs/policies/TECHNICAL_REQUIREMENTS_POLICY.md` | 技術要件 |
| `docs/policies/VERSION_POLICY.md` | 開発版バージョン、安定版バージョン |
| `docs/policies/RELEASE_POLICY.md` | リリース |
| `docs/policies/TEST_POLICY.md` | テスト |
| `docs/policies/LICENSE_POLICY.md` | ライセンス |
| `docs/policies/SECURITY_POLICY.md` | セキュリティ |
| `docs/policies/DATA_POLICY.md` | データ |
| `docs/policies/DEPENDENCY_POLICY.md` | 依存関係 |
| `docs/policies/DEPLOYMENT_POLICY.md` | デプロイ |

---

## 5. 3類マスター仕様書

| ドキュメント | 役割 |
|---|---|
| `docs/specs/{PROJECT_NAME}_SYSTEM_DESIGN.md` | システム全体のマスター仕様書 |
| `docs/specs/{PRODUCT_NAME}_SPECIFICATION.md` | プロダクト本体のマスター仕様書 |

---

## 6. 読了対象

すべての作業で最低限読む対象は以下とする。

- `AGENTS.md`
- `docs/DOCUMENT_INDEX.md`
- 2類ポリシー
- 3類マスター仕様書
- マスター開発計画
- `README.md`

---

## 7. 共通雛形

| パス | 役割 |
|---|---|
| `docs/tpl-governance/` | AdlaireGroup 共通ガバナンス雛形の正本 |
| `docs/tpl-governance/core/` | 共通コア。最上位ルールブック、ドキュメント索引、ドキュメント憲章、2類ポリシー総則 |
| `docs/tpl-governance/policy-slots/` | 共通方針を維持したままプロジェクト固有値を具体化する2類ポリシー枠 |

採用技術、固定バージョン、ライセンス、デプロイ方式、データ保存、依存関係、セキュリティ要件は共通方針として扱う。

### 7.1 ガバナンス改良時の参照

ガバナンス改良時は、`AGENTS.md`、2類ポリシー総則、ドキュメント憲章、共通雛形、policy slots の順に責務境界を確認する。

共通方針に該当する変更は共通雛形へ反映する。プロジェクト固有仕様、固有機能、固有配置値、固有Phase計画は共通雛形へ反映しない。
