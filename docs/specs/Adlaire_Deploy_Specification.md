# Adlaire Deploy マスター仕様書

**位置づけ**: 3類個別マスター仕様書
**対象**: Adlaire Git Repository 公式付随デプロイメントシステム
**ライセンス**: クローズドライセンス
**標準ランタイム**: Deno
**標準言語**: TypeScript
**文書バージョン**: v.0.1
**ステータス**: Phase 8 仕様策定

---

## 1. 目的

本書は、Adlaire Deploy の個別マスター仕様書である。

Adlaire Deploy は、Adlaire Git Repository の本番デプロイ、検証、バックアップ、ロールバック、deploy manifest 記録を扱う公式付随システムである。

Adlaire Deploy は Adlaire Git Repository 本体へ統合しない。本体と同一リポジトリ内に同居し、責務を分離した付随システムとして管理する。

---

## 2. 上位ドキュメントとの関係

本書は3類個別マスター仕様書であり、以下に従う。

1. `AGENTS.md`
2. 2類ポリシー
3. `docs/specs/Auris_System_Design.md`
4. `docs/policies/DEPLOYMENT_POLICY.md`
5. `docs/plans/DEVELOPMENT_PLAN.md`

本書と `docs/policies/DEPLOYMENT_POLICY.md` が矛盾する場合は、2類ポリシーであるデプロイポリシーを正とする。

Adlaire Deploy の具体仕様、責務、CLI、plan、manifest、backup、verify、rollback、連携境界は本書を正本とする。

---

## 3. 位置づけ

Adlaire Deploy は、Adlaire Git Repository の公式付随システムである。

統合システムではない。Adlaire Git Repository 本体の必須起動要件にしてはならない。

同一リポジトリ内で管理するが、責務、仕様、実装境界、検証範囲は本体から分離する。

```text
Adlaire-Git-Repository/
├── Adlaire Git Repository 本体
└── 公式付随システム: Adlaire Deploy
```

Adlaire Deploy が停止、未導入、未設定であっても、Adlaire Git Repository 本体の既存機能が停止してはならない。

---

## 4. 責務

Adlaire Deploy の責務は以下とする。

- deploy plan の作成
- デプロイ対象バージョン、成果物、接続先、配置方式の確認
- 本番サーバまたは検証サーバの前提確認
- Deno single binary 正本成果物の checksum 検証
- Docker 運用を選択する場合の Docker image 検証
- 配置前バックアップ
- binary または Docker image の配置
- systemd または Docker Compose の起動確認
- `/health` 確認
- 主要 workflow 確認
- deploy manifest の記録
- system rollback の準備と実行
- deploy log と検証結果の記録

Adlaire Deploy は、以下を自動承認してはならない。

- 初回本番デプロイ
- デプロイ先サーバ決定
- SSH 接続方式、接続ユーザー、配置パス決定
- binary 直実行または Docker 運用の選択
- Docker Engine / Docker Compose 導入または更新
- systemd または同等の起動管理定義作成
- バックアップ保存先、保持世代、暗号化方針決定
- 本番データへ影響する操作
- libSQL / SQLite database 復元
- Git bare repository 復元
- data rollback
- 公開経路、ドメイン、TLS 設定変更

---

## 5. Adlaire Git Repository との連携方針

Adlaire Deploy は Adlaire Git Repository と連携する。ただし、密結合してはならない。

初期連携範囲は以下とする。

- Release manifest の参照
- checksum の検証
- Deno single binary の配置
- Docker image の配置または読み込み
- backup 実行
- `/health` 確認
- deploy manifest 出力
- rollback 対象の記録

将来連携候補は以下とする。

- Adlaire Git Repository Web UI での deploy 状態表示
- Audit log への deploy 結果取り込み
- Deploy history 表示
- 承認フロー連携
- 複数 VPS 対応
- systemd timer による定期検証

将来連携候補は、実装承認ではない。実装対象にする場合は、本書、マスター開発計画、検証範囲へ反映し、ユーザー承認を得る。

---

## 6. 技術方針

Adlaire Deploy は Deno / TypeScript で実装する方針とする。

Deno 標準機能を優先し、外部依存は原則として導入しない。外部ライブラリ、Deno 標準ライブラリ個別モジュール、JSR package を採用する場合は、2類ポリシーに従い、必要性、対象、固定バージョン、検証方法を提示し、ユーザー承認を得る。

Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules`、外部デプロイフレームワークは採用しない。

Adlaire Deploy の成果物は、将来的に Deno single binary 化できる構成にする。

---

## 7. 実行方式

初期実行方式は CLI とする。

CLI は、最低限以下の command を候補とする。

```text
adlaire-deploy plan
adlaire-deploy verify-server
adlaire-deploy backup
adlaire-deploy deploy
adlaire-deploy verify-release
adlaire-deploy rollback
adlaire-deploy manifest
```

上記は仕様候補であり、ソースコード実装承認ではない。実装時は、command 名、引数、設定ファイル形式、出力形式、失敗時の扱いを改めて提示し、ユーザー承認を得る。

---

## 8. データ保全

Adlaire Deploy は system / data 分離方針に従う。

data 側は host filesystem を正本とし、以下を保護対象とする。

- libSQL / SQLite database
- Git bare repositories
- config
- secrets
- logs
- backups
- manifests

Adlaire Deploy は、Docker named volume を data 正本として扱ってはならない。

本番データ復元、data rollback、database 復元、Git bare repository 復元は、通常デプロイまたは通常ロールバックとは分離し、必ず別承認を得る。

---

## 9. 既存 shell script 雛形との関係

`scripts/deploy/` 配下の shell script は、Adlaire Deploy の初期仕様元および移行元として扱う。

Adlaire Deploy は、既存 shell script の責務をすぐに削除せず、以下の順で段階移行する。

1. `scripts/deploy/` の責務を本書へ仕様化する。
2. CLI の plan / verify / manifest から内製化する。
3. backup / deploy / rollback を内製化する。
4. shell script を互換レイヤーまたは移行済み補助として再整理する。

既存 shell script の削除、置換、実行方式変更は、別途ユーザー承認を得る。

---

## 10. 対象外

Phase 8 の仕様策定時点では、以下を対象外とする。

- Adlaire Git Repository 本体への完全統合
- 本体起動要件化
- Web UI からの deploy 実行
- 自動承認付き本番デプロイ
- 自動 data rollback
- クラウドDBホスティング固有APIへの直接依存
- GitHub Actions 採用
- 外部デプロイフレームワーク採用
- Node.js / npm 前提のデプロイ基盤

---

## 11. 完了条件

Adlaire Deploy 仕様策定の完了条件は以下とする。

- Adlaire Deploy が公式付随システムであることが明記されている。
- Adlaire Git Repository 本体と統合しないことが明記されている。
- 同一リポジトリ内に同居するが、責務分離することが明記されている。
- 連携範囲と将来連携候補が分離されている。
- デプロイ、バックアップ、検証、ロールバック、manifest の責務が定義されている。
- 承認工程を省略しないことが明記されている。
- 本番データへ影響する操作が別承認であることが明記されている。
- 既存 `scripts/deploy/` との関係が定義されている。

---

## 12. 改訂履歴

| バージョン | 内容 |
|---:|---|
| v.0.1 | Adlaire Deploy を Adlaire Git Repository の公式付随システムとして新設し、責務、連携方針、対象外、既存 shell script 雛形との関係を定義 |
