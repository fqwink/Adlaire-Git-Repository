# Adlaire Git Repository

## ドキュメント

- 最上位ルールブック: [AGENTS.md](./AGENTS.md)
- ポリシー群: [docs/policies/](./docs/policies/)
- マスター開発計画: [docs/plans/DEVELOPMENT_PLAN.md](./docs/plans/DEVELOPMENT_PLAN.md)
- マスター実装機能候補リスト: [docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md](./docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md)
- マスター仕様書群: [docs/specs/](./docs/specs/)

## 現在のドキュメント構成

```text
/
├── AGENTS.md
├── README.md
└── docs/
    ├── plans/
    │   ├── DEVELOPMENT_PLAN.md
    │   └── MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md
    ├── policies/
    │   └── DEVELOPMENT_POLICY_RULEBOOK.md
    └── specs/
        ├── Auris_System_Design.md
        ├── Adlaire_Git_Repository_Specification.md
        └── WYSIWYG_Editor_Specification.md
```

`AGENTS.md` は本リポジトリの最上位ルールブックである。`docs/specs/Auris_System_Design.md` は、3類マスター仕様書群におけるシステム全体の最上位マスター仕様書である。`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` は候補整理の正本であり、実装承認ではない。ソースコード実装作業は、1類ルールブック、2類ポリシー、このマスター仕様書、`docs/plans/DEVELOPMENT_PLAN.md` の承認済みフェーズ計画に基づいて行う。
