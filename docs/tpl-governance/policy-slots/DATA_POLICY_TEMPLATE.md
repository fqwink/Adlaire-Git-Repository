# データポリシー

**対象**: `{PROJECT_NAME}`
**位置づけ**: 2類責務別ポリシー
**責務**: データ保存、移行、削除、バックアップ、復旧

---

## 1. 共通方針

データ保存、移行、削除、バックアップ、復旧は AdlaireGroup 共通方針として扱う。

各プロジェクトは、共通方針を破らない範囲で保存対象、保存先、保持期間、復旧手順などの固有値を具体化する。

## 2. 個別具体化必須項目

- 保存対象データ
- 個人情報の扱い
- データ所在
- backup / restore
- migration
- export / import
- retention
- 削除方針

データベースを利用するプロジェクトは、標準データベースと互換・移行元データベースの保存先、バックアップ対象、復元対象、migration 方針、rollback 方針を区別して定義する。

データは、差し替え可能な system 側から分離し、host filesystem を正本とする data 側へ保存する。最低限、database、repository 実体、config、secrets、logs、backups、manifests の扱いを定義する。

Docker 運用を選択する場合も、data 側は container lifecycle に依存させず、host bind mount を基本とする。Docker named volume を data 正本として扱ってはならない。

クラウドDBホスティングを採用するか未定の場合は、未定であること、採用時に評価すべきデータ所在、認証情報管理、バックアップ、復旧、運用費用、承認条件を明記する。

## 3. 承認

データ保存、移行、削除、バックアップ、復旧に関する方針変更は、プロジェクトの承認工程に従って決定する。
