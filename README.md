# Adlaire Git Repository

**現行フェーズ**: Phase 10 Adlaire Deploy 仕様固定 / v.2.14 baseline
**直近安定版リリース**: Phase 7 / v.1.8

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
├── deno.json
├── deno.lock
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
    │   ├── Adlaire_Git_Repository_Specification.md
    │   └── Adlaire_Deploy_Specification.md
    └── tpl-governance/
        ├── core/
        └── policy-slots/
```

`AGENTS.md` は本リポジトリの最上位ルールブックである。`docs/DOCUMENT_INDEX.md` は参照索引であり、正本ではない。`docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` は2類ドキュメント群の総則であり、ドキュメント憲章と責務別ポリシーは `docs/policies/` 配下で管理する。`docs/specs/Auris_System_Design.md` は、3類マスター仕様書群におけるシステム全体の最上位マスター仕様書である。`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` は候補整理の正本であり、実装承認ではない。`docs/tpl-governance/` は AdlaireGroup 関連プロジェクト、プロダクトへ共通展開する共通ガバナンス雛形の正本であり、現行プロジェクト固有の正本ではない。ソースコード実装作業は、1類ルールブック、2類ドキュメント群、3類マスター仕様書、`docs/plans/DEVELOPMENT_PLAN.md` の承認済みフェーズ計画に基づいて行う。

Adlaire Deploy は Phase 10 の着手対象である。Adlaire Git Repository 本体へ統合せず、DB 不使用の付随システムとして同居・連携し、Deno single binary 正本成果物の取得、checksum 検証、配置、backup、rollback、manifest 記録を扱う。Adlaire Deploy 専用 database は持たず、Adlaire Git Repository 本体の libSQL database へ直接接続しない。標準実行主体は `adlaire-deploy` CLI とし、JSON deployment manifest を正規入力として、`plan`、`verify`、`dry-run`、`apply-system`、`rollback-system` を扱う。VPS、self-host、専用サーバーでは SSH 使用可能を最低必須条件とする。Deno Deploy 環境対応は白紙とする。詳細は [docs/specs/Adlaire_Deploy_Specification.md](./docs/specs/Adlaire_Deploy_Specification.md) を参照する。

3類マスター仕様書は、Phase 8 の現行正本仕様、フェーズ別履歴、保留候補、対象外範囲を分離して管理する。Phase 7 / `v.1.8` は初回安定版リリース済みの履歴であり、Phase 8 以降の仕様判断では現行正本仕様を参照する。

本プロジェクトの変更が AdlaireGroup 共通方針に該当する場合は、`docs/tpl-governance/` の更新要否を判定し、必要な場合は同一変更範囲で雛形も整合させる。

フェーズ単位で、必ずドキュメント等の整合性向上を行う。リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。

本番サーバ環境へのデプロイは、承認工程を省かず、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。詳細は [docs/policies/DEPLOYMENT_POLICY.md](./docs/policies/DEPLOYMENT_POLICY.md) を参照する。

Deno single binary を正本成果物とする。Docker は正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つである。Docker を使用する場合も、Docker を使用せず binary を host OS 上で直接実行する場合も、同じ system / data 分離構成にする。

最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は保護対象 data 側として `shared/` 配下に分離し、host filesystem を正本とする。Deno single binary、Docker image / container、起動管理定義は差し替え可能な system 側として扱う。

標準データベースは libSQL とする。SQLite 互換維持は行わず、SQLite は既存データ移行元確認用としてのみ扱う。`DB_DRIVER=sqlite` は通常運用では拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ扱う。クラウドDBホスティングは未定であり、採用する場合も `DB_DRIVER=libsql` の接続先差し替えとして扱う。

標準採用は Deno 標準ライブラリ（`jsr:@std/*`）に限定する。必要な parser 等の外部ライブラリは、非 npm 依存であることを条件に、明示的な例外採用として管理する。npm 互換 package、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem を伴う依存は例外なく採用しない。

libSQL は必要最小限の外部依存例外として扱うが、npm 互換 package を使わず、Database Gateway と内製 `libsql` driver 境界に閉じ込める。`@libsql/client` 等の npm 互換 libSQL client、npm 由来の `deno.lock` 解決結果、FFI / native loader 前提の権限が残る場合は、現行方針へ反する是正対象として扱う。

ローカルに Deno が存在しない場合、実行系検証は VPS、承認済み検証サーバ、または承認済み固定 Deno Docker image で行う。Docker で検証、テスト、ビルド、binary 生成をまとめて実行する場合は、`scripts/docker/verify-build.sh` を使う。

標準デプロイ雛形は [scripts/deploy/](./scripts/deploy/) で管理する。`deploy.env.example` を基準に環境固有値を定義し、`deploy.sh`、`backup.sh`、`verify-server.sh`、`verify-release.sh`、`rollback.sh` を承認済み範囲で実行する。実値を含む環境設定、接続先、秘密情報はコミットしてはならない。

Phase 8.5 では、標準アプリケーション設定と標準デプロイ雛形を system / data 分離構成へ整合した。`ADLAIRE_APP_ROOT=/opt/adlaire-git-repository` を基準に、稼働版 release / current は `system/` 側、libSQL database、Git bare repositories、config、secrets、logs、backups、manifests は `shared/` 側へ分離する。

安定版リリースの標準 Linux バイナリは、ARM64 と x86_64 の2種類を正本成果物とする。VPS デプロイ時は `uname -m` で `aarch64` または `x86_64` を確認し、対象アーキテクチャの Deno single binary を配置する。Docker を選択する場合は、その正本 binary を Docker image に同梱して配置する。

Phase 7 は7系フェーズのデフォルト安定版リリース判定フェーズであり、`v.1.8` を初回安定版リリースとして完了済みである。Phase 8 はDB仕様完成としてlibSQL標準化を扱う。Phase 8.1 は本体整合性、Phase 8.5 はAdlaire Git Repository本体とデータ領域の分割、Phase 8.7 は安定化として完了済みである。Phase 9 は Phase 8 系成果のバグ修正ゼロ化、安定版判定、リリース準備を扱う。`v.2.10` の公開配布は保留し、Phase 10 では Adlaire Deploy を主対象として、DB 不使用で binary 正本成果物の配布・取得・検証・配置を内製化し、実行主体、標準コマンド、manifest、artifact、SSH target、preflight、出力、error、security / data 保護を仕様固定する。
