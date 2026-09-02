# リリースポリシー

**対象**: `{PROJECT_NAME}`
**位置づけ**: 2類責務別ポリシー
**責務**: リリース対象、リリース配置、成果物、公開判断

---

## 1. 共通方針

リリース対象、リリース配置、成果物、公開判断は AdlaireGroup 共通方針として扱う。

各プロジェクトは、共通方針を破らない範囲で成果物名、配置先、release notes、検証条件などの固有値を具体化する。

リリース履歴の正本は GitHub Releases 等の承認済みリリース配置先とし、リポジトリ内に変更履歴、リリース履歴、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を履歴ファイルとして保持しない。

Adlaire Pipeline を採用候補にする場合は、`Adlaire Pipeline Release`、`Adlaire Pipeline Runner`、`Adlaire Pipeline Artifact`、`Adlaire Pipeline Deploy`、`Adlaire Pipeline Audit` の責務を分離する。Adlaire Pipeline の開発言語は Go 採用方針とする。初期方針で付随システムとして扱う場合は、本体統合、データベース、依存関係、実行基盤、既存リリース配置先の廃止を自動決定してはならない。

デプロイ、バックアップ、検証で生成される operational な manifest、checksum、log は変更履歴ファイルではなく運用記録として扱い、デプロイメントポリシーの責務範囲で管理する。

## 2. 個別具体化必須項目

- リリース対象
- リリース条件
- リリース禁止条件
- リリース配置先
- リリース成果物
- release notes
- rollback 方針
- 自動化範囲
- Adlaire Pipeline を採用候補にする場合の責務範囲
- Adlaire Pipeline の未定技術項目。ただし開発言語は Go 採用方針とする
- 既存リリース配置先からの移行条件

## 3. 承認

リリース提案、公開判断、配置先、成果物、tag 作成、公開済みリリースの変更は、プロジェクトの承認工程に従って決定する。
