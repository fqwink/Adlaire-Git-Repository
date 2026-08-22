# 技術要件ポリシー

**対象**: `{PROJECT_NAME}`
**位置づけ**: 2類責務別ポリシー
**責務**: 採用技術、ランタイム、依存関係、固定バージョン、技術承認

---

## 1. 個別具体化必須項目

- 開発言語
- ランタイム
- データベース
- フレームワーク
- 外部コマンド
- 開発環境
- 禁止技術
- 固定採用バージョン
- 更新方針

## 2. 共通禁止技術

Docker は、開発、検証、本番、デプロイ、調査、一時確認、補助用途を含む全用途で例外なく採用禁止とする。

禁止対象には、最低限以下を含める。

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

## 3. 承認

技術採用、固定バージョン、更新方針は、プロジェクトの承認工程に従って決定する。
