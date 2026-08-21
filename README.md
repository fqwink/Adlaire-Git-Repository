# Adlaire Git Repository

**現行フェーズ**: Phase 6 / v.0.7

## ドキュメント

- 最上位ルールブック: [AGENTS.md](./AGENTS.md)
- ドキュメント索引: [docs/DOCUMENT_INDEX.md](./docs/DOCUMENT_INDEX.md)
- ポリシー群: [docs/policies/](./docs/policies/)
- マスター開発計画: [docs/plans/DEVELOPMENT_PLAN.md](./docs/plans/DEVELOPMENT_PLAN.md)
- マスター実装機能候補リスト: [docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md](./docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md)
- マスター仕様書群: [docs/specs/](./docs/specs/)
- AdlaireGroup 共通ガバナンス雛形: [docs/tpl-governance/](./docs/tpl-governance/)

## 現在のドキュメント構成

```text
/
├── AGENTS.md
├── README.md
└── docs/
    ├── DOCUMENT_INDEX.md
    ├── plans/
    │   ├── DEVELOPMENT_PLAN.md
    │   └── MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md
    ├── policies/
    │   ├── DEVELOPMENT_POLICY_RULEBOOK.md
    │   ├── DOCUMENT_CHARTER.md
    │   ├── TECHNICAL_REQUIREMENTS_POLICY.md
    │   ├── VERSION_POLICY.md
    │   ├── RELEASE_POLICY.md
    │   ├── TEST_POLICY.md
    │   └── LICENSE_POLICY.md
    ├── specs/
    │   ├── Auris_System_Design.md
    │   ├── Adlaire_Git_Repository_Specification.md
    │   └── WYSIWYG_Editor_Specification.md
    └── tpl-governance/
        ├── core/
        └── policy-slots/
```

`AGENTS.md` は本リポジトリの最上位ルールブックである。`docs/DOCUMENT_INDEX.md` は参照索引であり、正本ではない。`docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` は2類ドキュメント群の総則であり、ドキュメント憲章と責務別ポリシーは `docs/policies/` 配下で管理する。`docs/specs/Auris_System_Design.md` は、3類マスター仕様書群におけるシステム全体の最上位マスター仕様書である。`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` は候補整理の正本であり、実装承認ではない。`docs/tpl-governance/` は AdlaireGroup 関連プロジェクト、プロダクトへ共通展開する雛形置き場であり、現行プロジェクトの正本ではない。ソースコード実装作業は、1類ルールブック、2類ドキュメント群、3類マスター仕様書、`docs/plans/DEVELOPMENT_PLAN.md` の承認済みフェーズ計画に基づいて行う。

フェーズ単位で、必ずドキュメント等の整合性向上を行う。リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。
