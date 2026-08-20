# Auris — 開発規約

> **[`design/Auris_System_Design.md`](./design/Auris_System_Design.md) は本プロジェクトの最高上位準拠ドキュメントである。**
> すべてのシステム開発（設計・実装・バージョニング・リリース・バグ修正・機能追加・機能改良・廃止）は
> **`design/Auris_System_Design.md` の仕様に基づいて行うこと。**

> **開発ポリシールールブック（[`design/DEVELOPMENT_POLICY_RULEBOOK.md`](./design/DEVELOPMENT_POLICY_RULEBOOK.md)）は開発プロセスの絶対原則である。**
> 計画・実装・リリース等のすべての開発作業に着手する前に、
> **必ず `design/DEVELOPMENT_POLICY_RULEBOOK.md` を参照し、その規定に従うこと。**

---

## 必須参照ドキュメント

| 優先順位 | ドキュメント | 役割 |
|---------|-------------|------|
| **最高上位** | [`design/Auris_System_Design.md`](./design/Auris_System_Design.md) | **システム設計概要書（最高上位準拠）** — すべての開発はこの仕様に基づく |
| **開発プロセス** | [`design/DEVELOPMENT_POLICY_RULEBOOK.md`](./design/DEVELOPMENT_POLICY_RULEBOOK.md) | **開発ポリシールールブック（絶対原則）** — バージョン規約・リリース計画・廃止／追加機能／機能改良／バグ修正の各ポリシー |
| 参考 | [`README.md`](./README.md) | 配置パターン別デプロイ手順（パターン A: 同一サーバー / パターン B: FE/BE 分離） |
| 参考 | [`DEPLOY.md`](./DEPLOY.md) | デプロイ詳細手順 |

---

## 遵守事項

- **すべての開発は `design/Auris_System_Design.md` の仕様に準拠すること。** 同ドキュメントに記載のない機能を独断で実装してはならない。
- **仕様変更・機能追加・設計変更は、まず `design/Auris_System_Design.md` を改訂してから実装に着手すること。**
- **バージョン表記**は `design/DEVELOPMENT_POLICY_RULEBOOK.md` のバージョン規則 `Ver.{Major}.{Minor}-{Build}` に必ず従う。
- **バグ修正・機能改良・追加機能**を行う際は、同ルールブックの該当ポリシーと実装順序（バグ修正 → 機能改良 → 追加機能 → バグ修正）を遵守する。
- **リリース判定基準**（軽微なバグを含むいかなるバグ残存時もリリース禁止）を必ず確認する。
- `design/Auris_System_Design.md` および開発ポリシールールブックと矛盾する作業を行ってはならない。
