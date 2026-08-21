# AdlaireGroup 共通ガバナンス雛形

**位置づけ**: AdlaireGroup 関連プロジェクト、プロダクト向け共通雛形置き場
**責務**: 最上位ルールブック、ポリシー、ドキュメント体系のデフォルト構成を管理する
**ステータス**: 初期整備済み

---

## 1. 目的

本ディレクトリは、AdlaireGroup 関連プロジェクト、プロダクトへ共通採用する最上位ドキュメント体系の雛形を配置するための領域である。

`templates/` という汎用ディレクトリ名は使用しない。テンプレート用途であることは `tpl` の略称で示し、対象がガバナンス文書であることを `governance` で示す。

---

## 2. 雛形構成

本ディレクトリは、共通コアと個別具体化用 policy slots に分ける。

共通コアは、AdlaireGroup 関連プロジェクト、プロダクトで共通採用する最上位ドキュメント体系の必須雛形である。

policy slots は、各プロジェクトで個別具体化する2類ポリシーの必須枠である。policy slots は現行プロジェクトのポリシー本体ではなく、各プロジェクトで具体値、採用技術、運用条件を定義するための雛形である。

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

雛形を追加する場合も、変更前に変更対象、変更理由、変更案、影響範囲、検証方法を提示し、ユーザー承認を得る。
