# Adlaire Git Repository

**現行フェーズ**: Phase 7 / v.1.8

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
├── scripts/
│   ├── deploy/
│   │   ├── deploy.env.example
│   │   ├── deploy.sh
│   │   ├── rollback.sh
│   │   ├── backup.sh
│   │   ├── verify-server.sh
│   │   └── verify-release.sh
│   └── docker/
│       ├── deno.sh
│       └── verify-build.sh
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
    │   ├── DEPLOYMENT_POLICY.md
    │   ├── TEST_POLICY.md
    │   └── LICENSE_POLICY.md
    ├── specs/
    │   ├── Auris_System_Design.md
    │   └── Adlaire_Git_Repository_Specification.md
    └── tpl-governance/
        ├── core/
        └── policy-slots/
```

`AGENTS.md` は本リポジトリの最上位ルールブックである。`docs/DOCUMENT_INDEX.md` は参照索引であり、正本ではない。`docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` は2類ドキュメント群の総則であり、ドキュメント憲章と責務別ポリシーは `docs/policies/` 配下で管理する。`docs/specs/Auris_System_Design.md` は、3類マスター仕様書群におけるシステム全体の最上位マスター仕様書である。`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` は候補整理の正本であり、実装承認ではない。`docs/tpl-governance/` は AdlaireGroup 関連プロジェクト、プロダクトへ共通展開する共通ガバナンス雛形の正本であり、現行プロジェクト固有の正本ではない。ソースコード実装作業は、1類ルールブック、2類ドキュメント群、3類マスター仕様書、`docs/plans/DEVELOPMENT_PLAN.md` の承認済みフェーズ計画に基づいて行う。

本プロジェクトの変更が AdlaireGroup 共通方針に該当する場合は、`docs/tpl-governance/` の更新要否を判定し、必要な場合は同一変更範囲で雛形も整合させる。

フェーズ単位で、必ずドキュメント等の整合性向上を行う。リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。

本番サーバ環境へのデプロイは、承認工程を省かず、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。詳細は [docs/policies/DEPLOYMENT_POLICY.md](./docs/policies/DEPLOYMENT_POLICY.md) を参照する。

デプロイ実行方式は、shell script + SSH + systemd を標準採用し、`gh` と systemd timer を補助採用とする。Docker は検証、テスト、ビルド、Deno single binary 生成に限り補助採用し、本番、デプロイ、運用基盤、公開経路、永続データ管理では利用しない。

ローカルに Deno が存在しない場合、実行系検証は VPS、承認済み検証サーバ、または承認済み固定 Deno Docker image で行う。Docker で検証、テスト、ビルド、binary 生成をまとめて実行する場合は、`scripts/docker/verify-build.sh` を使う。

標準デプロイ雛形は [scripts/deploy/](./scripts/deploy/) で管理する。`deploy.env.example` を基準に環境固有値を定義し、`deploy.sh`、`backup.sh`、`verify-server.sh`、`verify-release.sh`、`rollback.sh` を承認済み範囲で実行する。`deploy.env` には接続先や環境固有値を含めるため、コミットしてはならない。

安定版リリースの標準 Linux バイナリは、ARM64 と x86_64 の2種類を配置対象とする。VPS デプロイ時は `uname -m` で `aarch64` または `x86_64` を確認し、`deploy.env` の `ARTIFACT_PATH` で対象アーキテクチャの成果物を指定する。

Phase 7 は7系フェーズのデフォルト安定版リリース判定フェーズであり、`v.1.8` を初回安定版リリースとして扱う。
