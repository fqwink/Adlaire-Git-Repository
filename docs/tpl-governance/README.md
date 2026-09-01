# AdlaireGroup 共通ガバナンス雛形

**位置づけ**: AdlaireGroup 関連プロジェクト、プロダクト向け共通ガバナンス雛形の正本
**責務**: 最上位ルールブック、ポリシー、ドキュメント体系、共通方針のデフォルト構成を管理する
**ステータス**: 初期整備済み

---

## 1. 目的

本ディレクトリは、AdlaireGroup 関連プロジェクト、プロダクトへ共通採用する最上位ドキュメント体系と共通方針の正本雛形を配置するための領域である。

このリポジトリは、Adlaire Git Repository 本体の開発リポジトリであると同時に、AdlaireGroup 共通ガバナンス雛形の管理元である。共通雛形の正本は、本ディレクトリ `docs/tpl-governance/` 配下に限定する。

本プロジェクト固有の `AGENTS.md`、`docs/policies/`、`docs/specs/`、`docs/plans/` は、Adlaire Git Repository の運用正本である。これらをそのまま他プロジェクトへ配布してはならない。

`templates/` という汎用ディレクトリ名は使用しない。テンプレート用途であることは `tpl` の略称で示し、対象がガバナンス文書であることを `governance` で示す。

---

## 2. 雛形構成

本ディレクトリは、共通コアと共通方針の具体化用 policy slots に分ける。

共通コアは、AdlaireGroup 関連プロジェクト、プロダクトで共通採用する最上位ドキュメント体系の必須雛形である。

policy slots は、各プロジェクトで共通方針を維持したまま具体化する2類ポリシーの必須枠である。policy slots は方針を自由に変更する場所ではない。採用技術、固定バージョン、ライセンス、デプロイ方式、データ保存、依存関係、セキュリティ要件は AdlaireGroup 共通方針として扱い、各プロジェクトではプロジェクト名、配置先、サーバ名、ドメイン、仕様書名、Phase 計画、実装対象機能などの固有値を具体化する。

デプロイ方式とデータ保存を持つプロジェクトでは、差し替え可能な system 側と host filesystem を正本とする data 側を分離する。Docker 使用時も非 Docker の binary 直実行時も、data 側の正本は同じ構成とし、Docker named volume に丸投げしてはならない。

```text
docs/tpl-governance/
  core/
    AGENTS_TEMPLATE.md
    DOCUMENT_INDEX_TEMPLATE.md
    DOCUMENT_CHARTER_TEMPLATE.md
    DEVELOPMENT_POLICY_RULEBOOK_TEMPLATE.md
  policy-slots/
    TECHNICAL_REQUIREMENTS_POLICY_TEMPLATE.md
    VERSION_POLICY_TEMPLATE.md
    RELEASE_POLICY_TEMPLATE.md
    TEST_POLICY_TEMPLATE.md
    LICENSE_POLICY_TEMPLATE.md
    SECURITY_POLICY_TEMPLATE.md
    DATA_POLICY_TEMPLATE.md
    DEPENDENCY_POLICY_TEMPLATE.md
    DEPLOYMENT_POLICY_TEMPLATE.md
```

## 3. 更新判定

本プロジェクトの `AGENTS.md`、2類ポリシー、3類マスター仕様書、マスター開発計画、README を変更する場合は、その変更が AdlaireGroup 共通方針に該当するかを必ず判定する。

以下に該当する変更は、本ディレクトリへ反映する。

- `AGENTS.md` 最優先、読了義務、承認工程、Pull Request 経由、`main` 直接 push 禁止、ドキュメント整合性などの作業原則
- 採用技術、固定バージョン、ランタイム、外部依存、レジストリ、ライセンス、デプロイ、データ保存、バックアップ、セキュリティ、テスト、リリースに関する共通方針
- AdlaireGroup 関連プロジェクト、プロダクトへ横展開すべき禁止事項、承認条件、運用条件

以下に該当する変更は、本ディレクトリへ反映しない。

- Adlaire Git Repository 固有の機能仕様
- Git ホスティング固有の画面、API、DB schema、Phase 実装対象
- プロジェクト固有の配置パス、ドメイン、サーバ名、運用環境名
- 一時的な例外対応。ただし、共通ルール化する場合は反映対象とする

判断が微妙な場合は、現行プロジェクト固有文書の文章をそのまま雛形へ流さず、policy slots に具体化枠として追加する。

Pull Request 説明には、雛形更新あり / なしと、その理由を記載する。

## 4. 変更手順

雛形を追加する場合も、変更前に変更対象、変更理由、変更案、影響範囲、検証方法を提示し、ユーザー承認を得る。
