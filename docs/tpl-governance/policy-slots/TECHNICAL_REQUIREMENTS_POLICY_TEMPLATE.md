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

## 3. 共通 Docker 方針

Docker は、本番サーバ運用、デプロイ、運用基盤の標準方式とする。

single binary 形式は維持し、Docker image 内で実行する。

Docker を利用する場合も、プロジェクトの禁止ランタイム、禁止 package ecosystem、依存関係方針に違反してはならない。

保護対象 data 側は host filesystem を正本として system 側から分離する。Docker image と container は差し替え可能な system 側として扱う。

Docker named volume を標準の data 正本として扱ってはならない。data 側は原則として host bind mount で container へ接続する。

禁止対象には、最低限以下を含める。

- Docker Desktop の本番サーバ標準採用
- Docker named volume への data 正本の丸投げ
- Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を含む Docker image
- 外部 Docker デプロイフレームワーク

## 4. 承認

技術採用、固定バージョン、更新方針は、プロジェクトの承認工程に従って決定する。
