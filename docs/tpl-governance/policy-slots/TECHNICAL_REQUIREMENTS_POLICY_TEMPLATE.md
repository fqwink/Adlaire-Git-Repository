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

Docker は、本番、デプロイ、運用基盤、公開経路、永続データ管理では採用禁止とする。

Docker は、検証、テスト、ビルド、single binary 生成など、プロジェクトで承認された実行系検証・ビルド用途に限り補助採用できる。

Docker を利用する場合も、プロジェクトの禁止ランタイム、禁止 package ecosystem、依存関係方針に違反してはならない。

本番禁止対象には、最低限以下を含める。

- Docker Desktop
- Docker Engine
- Docker Compose
- Dockerfile
- docker-compose.yml / docker-compose.yaml / compose.yaml
- Docker image
- Docker container
- Docker volume
- Docker registry
- `docker build`
- `docker run`
- `docker compose`
- `docker pull`
- `docker push`

## 4. 承認

技術採用、固定バージョン、更新方針は、プロジェクトの承認工程に従って決定する。
