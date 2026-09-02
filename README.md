# Adlaire Git Repository

**現行フェーズ**: Phase 11 Go 採用方針 / ヘッドレスアーキテクチャ方針 / Docker の Adlaire Pipeline 経由方針 / v.2.10 baseline
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
    │   └── Adlaire_Git_Repository_Specification.md
    └── tpl-governance/
        ├── core/
        └── policy-slots/
```

`AGENTS.md` は本リポジトリの最上位ルールブックである。`docs/DOCUMENT_INDEX.md` は参照索引であり、正本ではない。`docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md` は2類ドキュメント群の総則であり、ドキュメント憲章と責務別ポリシーは `docs/policies/` 配下で管理する。`docs/specs/Auris_System_Design.md` は、3類マスター仕様書群におけるシステム全体の最上位マスター仕様書である。`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` は候補整理の正本であり、実装承認ではない。`docs/tpl-governance/` は AdlaireGroup 関連プロジェクト、プロダクトへ共通展開する共通ガバナンス雛形の正本であり、現行プロジェクト固有の正本ではない。ソースコード実装作業は、1類ルールブック、2類ドキュメント群、3類マスター仕様書、`docs/plans/DEVELOPMENT_PLAN.md` の承認済みフェーズ計画に基づいて行う。

3類マスター仕様書は、Phase 8 の現行正本仕様、フェーズ別履歴、保留候補、対象外範囲を分離して管理する。Phase 7 / `v.1.8` は初回安定版リリース済みの履歴であり、Phase 8 以降の仕様判断では現行正本仕様を参照する。

本プロジェクトの変更が AdlaireGroup 共通方針に該当する場合は、`docs/tpl-governance/` の更新要否を判定し、必要な場合は同一変更範囲で雛形も整合させる。

フェーズ単位で、必ずドキュメント等の整合性向上を行う。リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。

本番サーバ環境へのデプロイは、承認工程を省かず、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。詳細は [docs/policies/DEPLOYMENT_POLICY.md](./docs/policies/DEPLOYMENT_POLICY.md) を参照する。

Go single binary を正本成果物とする。Docker は Adlaire Git Repository 本体の直接標準運用選択肢ではなく、Adlaire Pipeline 経由で生成、管理、配布、利用する対象とする。

Adlaire Git Repository は、UI を差し替え可能にするため、ヘッドレスアーキテクチャ設計思想を採用する。UI は Adlaire Git Repository 本体に固定せず、本体は特定 UI に依存しない。UI および外部システムとの接続は、原則として Adlaire 公式 SDK を通じて行う。

最小本番構成は、1 VPS 上に差し替え可能な system 側と host filesystem による data 側を同居させる構成とする。libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は保護対象 data 側として `shared/` 配下に分離し、host filesystem を正本とする。Go single binary、起動管理定義は差し替え可能な system 側として扱う。Docker image は Adlaire Pipeline 経由で扱う。

標準データベースは libSQL とし、唯一の標準DBとして完全確定する。DB 使用なし案、PostgreSQL、Key-value DB、SQLite 標準運用、その他のデータベースエンジンは採用候補として扱わない。SQLite 互換維持は行わず、SQLite は既存データ移行元確認用としてのみ扱う。`DB_DRIVER=sqlite` は通常運用では拒否し、承認済みの移行元確認時に `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` を指定した場合のみ扱う。クラウドDBホスティングは未定であり、採用する場合も `DB_DRIVER=libsql` の接続先差し替えとして扱う。

Adlaire Git Repository 本体は Go を標準開発言語とし、Deno + TypeScript は本体開発言語として終了方針とする。Adlaire Pipeline も Go 採用方針とする。AdlaireGroup 関連プロジェクトでは、Deno + TypeScript と Go 単体の2系統を有効な開発言語選択肢として扱う。

Go 標準ライブラリを優先する。Go module、JSR レジストリの公開ライブラリ、その他外部ライブラリは必要最小限とし、明示的な例外採用としてユーザー承認を得る。npm 互換 package、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem を伴う依存は例外なく採用しない。

libSQL は必要最小限の外部依存例外として扱うが、npm 互換 package を使わず、Database Gateway と内製 `libsql` driver 境界に閉じ込める。`@libsql/client` 等の npm 互換 client は撤去済みであり、再導入しない。libSQL 接続は、Node.js runtime が存在しない前提で、Deno runtime だけで動作する内製 HTTP/Hrana driver 経路へ集約する。

ローカルに Go が存在しない場合、実行系検証は VPS または承認済み検証サーバで行う。Docker で検証、テスト、ビルド、binary 生成をまとめて実行する場合は、Adlaire Pipeline 経由で扱う。

標準デプロイ雛形は [scripts/deploy/](./scripts/deploy/) で管理する。`deploy.env.example` を基準に環境固有値を定義し、`deploy.sh`、`backup.sh`、`verify-server.sh`、`verify-release.sh`、`rollback.sh` を承認済み範囲で実行する。実値を含む環境設定、接続先、秘密情報はコミットしてはならない。

リリース配置は現行では GitHub Releases を正式配置元とする。Go single binary、release notes、checksum、manifest は GitHub Releases 側へ配置し、リポジトリ内にリリース履歴ファイル、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を保持しない。

Adlaire Pipeline は、リリース基盤システムと自動実行基盤システムを担う内製付随システム候補として扱う。将来的な機能群は、`Adlaire Pipeline Release`、`Adlaire Pipeline Runner`、`Adlaire Pipeline Artifact`、`Adlaire Pipeline Deploy`、`Adlaire Pipeline Audit` とする。`Adlaire Pipeline Artifact` は成果物管理、`Adlaire Pipeline Deploy` はデプロイ反映、`Adlaire Pipeline Audit` は実行履歴・監査を扱う候補とする。初期方針では Adlaire Git Repository 本体へ統合せず、将来的な統合、一部統合、付随維持、AdlaireGroup 共通基盤化は仕様確定後に判断する。Adlaire Pipeline の開発言語は Go 採用方針とする。データベース、依存関係、実行基盤は現時点では未定であり、別途承認なしに固定しない。

Phase 8.5 では、標準アプリケーション設定と標準デプロイ雛形を system / data 分離構成へ整合した。`ADLAIRE_APP_ROOT=/opt/adlaire-git-repository` を基準に、稼働版 release / current は `system/` 側、libSQL database、Git bare repositories、config、secrets、logs、backups、manifests は `shared/` 側へ分離する。

安定版リリースの標準 Linux バイナリは、ARM64 と x86_64 の2種類を正本成果物とする。VPS デプロイ時は `uname -m` で `aarch64` または `x86_64` を確認し、対象アーキテクチャの Go single binary を配置する。Docker image を扱う場合は、Adlaire Pipeline 経由で扱う。

Phase 7 は7系フェーズのデフォルト安定版リリース判定フェーズであり、`v.1.8` を初回安定版リリースとして完了済みである。Phase 8 はDB仕様完成としてlibSQL標準化を扱う。Phase 8.1 は本体整合性、Phase 8.5 はAdlaire Git Repository本体とデータ領域の分割、Phase 8.7 は安定化として完了済みである。Phase 9 は Phase 8 系成果のバグ修正ゼロ化、安定版判定、リリース準備を扱う。Phase 10 では現行リリース配置を GitHub Releases として整合し、Adlaire Pipeline を将来のリリース、自動実行、成果物管理、デプロイ反映、実行履歴・監査を担う付随システム候補として整理した。Phase 11 では Go 移行準備、ヘッドレスアーキテクチャ方針、Adlaire 公式 SDK 接続方針、Docker の Adlaire Pipeline 経由方針を整理する。
