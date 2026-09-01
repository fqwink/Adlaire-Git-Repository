# デプロイポリシー

**対象**: `{PROJECT_NAME}`
**位置づけ**: 2類責務別ポリシー
**責務**: デプロイ、運用基盤、環境管理、公開経路

---

## 1. 共通方針

デプロイ方式、運用基盤、環境管理、公開経路、バックアップ、検証、ロールバックは AdlaireGroup 共通方針として扱う。

各プロジェクトは、共通方針を破らない範囲で配置先、接続方式、サーバ名、ドメイン、環境変数などの固有値を具体化する。

## 2. 個別具体化必須項目

- 標準運用基盤
- 対象環境
- 環境変数
- 配置先
- deploy 手順
- rollback 手順
- backup 手順
- deploy 前検証
- deploy 後検証
- 監視
- 障害対応

## 3. 共通デプロイ制約

Deno single binary 形式を正本成果物とする。

Docker は正本成果物ではなく、Deno single binary を Docker image に同梱して実行する運用選択肢の一つである。

標準デプロイ方式は、各プロジェクトの技術要件ポリシーに従い、Docker 使用時も非 Docker の binary 直実行時も同じ system / data 分離構成として定義する。

標準配置は、差し替え可能な system 側と、host filesystem を正本とする data 側へ分離する。system 側には release、current、binary、Docker image、compose、service、deploy script を置き、data 側には database、Git repository 等の永続データ、config、secrets、logs、backups、manifests を置く。

Docker 運用を選択する場合も、data 側は host bind mount で接続し、Docker named volume を data 正本として扱ってはならない。

## 4. 標準自動化

本番サーバ環境へのデプロイは、承認工程を省かず、バックアップ、検証、ロールバック前提を含めて自動化を標準とする。

自動化対象は、Deno single binary 配置、必要に応じた Docker image 配置、環境確認、バックアップ、process または container 再起動、health check、主要workflow検証、deploy manifest 記録を最低限含める。

deploy log、backup、manifest は data 側の保護対象として保存する。release / current の切り替えは system 側の操作として扱い、本番 data の復元を伴う rollback は別承認対象として定義する。

## 5. 標準デプロイスクリプト

各プロジェクトは、Deno single binary 正本方針、Docker 運用選択肢、Node.js 系禁止方針に従う標準デプロイスクリプトの配置、責務、実行条件を定義する。

最低限、以下の責務を分離する。

- 全体実行
- バックアップ
- サーバ事前確認
- 配置後検証
- 通常ロールバック
- 環境固有値の雛形

環境固有値、接続情報、秘密情報を含む実設定ファイルはコミットしてはならない。

標準デプロイスクリプトは、初回本番デプロイ、デプロイ先サーバ決定、SSH 接続方式、service 定義、バックアップ保存先、ロールバック実行、データ復元を自動承認するものではない。

## 6. 実行方式の採用区分

各プロジェクトは、デプロイ実行方式を以下の区分で定義する。

- 採用
- 補助採用
- 中期候補
- 保留
- 不採用

採用区分には、対象ツール、利用範囲、禁止条件、承認条件を明記する。

## 7. 検証環境

ローカル環境で標準ランタイムを利用できない場合、実行系検証をローカルで完了扱いにしてはならない。

実行系検証は、プロジェクトの固定採用バージョンを満たす VPS、self-host、専用サーバー、または承認済み検証サーバで実施する。

検証先、接続方式、配置パス、検証対象バージョン、検証データ、検証後の削除または保持方針は、実行前に承認を得る。

## 8. 承認

デプロイ先、運用基盤、公開経路、rollback 方針は、プロジェクトの承認工程に従って決定する。
