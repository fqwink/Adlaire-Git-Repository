# 技術要件ポリシー

**対象**: `{PROJECT_NAME}`
**位置づけ**: 2類責務別ポリシー
**責務**: 採用技術、ランタイム、依存関係、固定バージョン、技術承認

---

## 1. 共通方針

採用技術、ランタイム、依存関係、固定バージョン、技術承認は AdlaireGroup 共通方針として扱う。

各プロジェクトは、共通方針を破らない範囲でプロジェクトに必要な技術、外部コマンド、固定採用バージョンなどの固有値を具体化する。

## 2. 個別具体化必須項目

- 開発言語
- ランタイム
- データベース
- フレームワーク
- 外部コマンド
- 開発環境
- 禁止技術
- 固定採用バージョン
- 更新方針
- 承認済み例外ライブラリ

各プロジェクトは、Deno + TypeScript または Go 単体のどちらかを開発言語として選定する。選定はプロジェクト特性、成果物形式、運用要件、依存関係、セキュリティ要件に基づき、ユーザー承認を得て行う。

Go 採用プロジェクトでは Go 標準ライブラリを優先する。Deno + TypeScript 採用プロジェクトでは Deno 標準ライブラリ（`jsr:@std/*`）を優先する。

必要な parser 等の外部ライブラリは、明示的な例外採用として管理する。Go module、JSR レジストリの公開 package、その他外部ライブラリは、採用言語に関係なく必要最小限とし、ユーザー承認を得る。

JSR レジストリの公開 package を採用する場合は、Node.js ランタイム環境が存在しない前提で、Deno runtime だけで動作することを必須条件とする。

Node.js runtime、npm ecosystem、npm 互換 package、`npm:` specifier、`package.json`、`node_modules` を伴う依存は、実行時、開発時、検証時、ビルド時のいずれでも採用してはならない。

データベースを採用するプロジェクトは、標準データベース、互換・移行元データベース、検証用データベース、クラウドDBホスティング採用可否、driver 名、上位層へ露出してよい抽象境界を明記する。

アプリケーション上位層は、標準データベースまたは互換データベースの固有APIへ直接依存してはならない。必要な場合は、Database Gateway、driver 層、repository 層など、プロジェクトで定義した内製境界を経由する。

例外採用した外部ライブラリがある場合は、package 名、固定バージョン、import 経路、利用範囲、採用理由、禁止事項を明記する。例外採用は、その package の利用範囲に限定し、禁止ランタイム、禁止 package ecosystem、未承認依存の一般採用を意味しない。npm 依存は例外採用対象にしてはならない。

## 3. 共通 Binary / Docker 方針

Go 採用プロジェクトでは Go single binary 形式を正本成果物とする。Deno + TypeScript 採用プロジェクトでは Deno single binary 形式を正本成果物候補として扱う。

Docker は正本成果物ではなく、承認済み正本 binary を Docker image に同梱して実行する運用選択肢の一つである。

Docker 使用時も非 Docker の binary 直実行時も、同じ system / data 分離構成にする。

binary 形式、Docker 形式のいずれでも、プロジェクトの禁止ランタイム、禁止 package ecosystem、依存関係方針に違反してはならない。

保護対象 data 側は host filesystem を正本として system 側から分離する。正本 binary、Docker image、container、起動管理定義は差し替え可能な system 側として扱う。

各プロジェクトは、system 側と data 側の標準パス、設定環境変数、database 保存先、repository 保存先、config、secrets、logs、backups、manifests の配置を技術要件またはデプロイポリシーに定義する。

Docker named volume を標準の data 正本として扱ってはならない。data 側は原則として host bind mount で container へ接続する。

禁止対象には、最低限以下を含める。

- Docker Desktop の本番サーバ標準採用
- Docker named volume への data 正本の丸投げ
- Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を含む Docker image
- 外部 Docker デプロイフレームワーク

## 4. 承認

技術採用、固定バージョン、更新方針は、プロジェクトの承認工程に従って決定する。
