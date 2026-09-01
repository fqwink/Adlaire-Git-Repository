# マスター開発計画

**位置づけ**: マスター開発計画
**対象**: Auris / Adlaire Git Repository 全体
**計画バージョン**: v.2.14
**現行フェーズ基準バージョン**: v.2.14
**ステータス**: Phase 10 npm 依存全面禁止方針整合

---

## 1. 目的

本書は、Auris / Adlaire Git Repository の実装をフェーズ単位で進めるための **マスター開発計画** である。

本書は、3類マスター仕様書に基づいて策定する。開発計画は仕様そのものを決める文書ではなく、マスター仕様書に定義された仕様を、フェーズ、実装順序、検証範囲、完了条件へ落とし込むための文書である。

実装は、1類ルールブック、2類ポリシー、3類マスター仕様書に従い、本書で定義したフェーズ計画に基づいて進める。

Phase 7 の初回安定版リリース `v.1.8` は完了済みの履歴である。Phase 8 は DB 仕様完成フェーズとして libSQL 標準化を扱い、Phase 8.1 は本体整合性、Phase 8.5 はシステム分割、Phase 8.7 は安定化として完了済みである。Phase 9 は Phase 8 系成果のバグ修正ゼロ化、安定版判定、リリース準備として完了済みの履歴である。`v.2.10` の公開配布は保留し、Phase 10 の現行フェーズ基準バージョンは `v.2.11` とする。Phase 10 は Adlaire Deploy を主対象として、DB 不使用で binary 正本成果物の配布・取得・検証・配置を内製化し、実行主体、標準コマンド、manifest、artifact、SSH target、preflight、出力、error、security / data 保護を仕様固定する。Phase 10 以降の計画判断では、3類マスター仕様書の現行正本仕様、2類ポリシー、本書の現行フェーズ定義を基準にする。

本計画における「マスター仕様完成」は、実装承認ではない。仕様完成後にソースコード実装、DB driver 実装、schema 変更、テスト変更、デプロイ実行を行う場合は、対象範囲と検証方法を提示し、別途ユーザー承認を得る。

---

## 2. 上位ドキュメントとの関係

本書は、以下の上位ドキュメントに従う。

1. `AGENTS.md`
2. 2類ドキュメント群
3. `docs/specs/Auris_System_Design.md`
4. 個別3類マスター仕様書

本書と上位ドキュメントに矛盾がある場合は、上位ドキュメントを正とし、本書を修正する。

関連する候補整理ドキュメントとして、`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` を参照する。

`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` はマスター実装機能候補リストであり、優先実装候補、保留候補、候補選定基準を整理する。ただし、同ファイルは実装承認ではない。候補を各フェーズの実装対象へ確定する場合は、3類マスター仕様書、本書の対象フェーズ、検証範囲へ反映し、ユーザー承認を得る。

候補リストは、機能候補と選定理由を管理する。正式な実装対象、対象外、Phase 割り当て、完了条件、検証範囲は、本書と3類マスター仕様書で管理する。

---

## 3. 開発計画の基本方針

- 開発計画はフェーズ単位で策定する。
- 開発計画はフェーズ単位で改訂する。
- 開発計画は3類マスター仕様書に基づいて策定する。
- 開発計画は、マスター仕様書にない機能、構造、技術判断、リリース対象を独自に追加してはならない。
- 基本的な機能互換は GitHub 互換基準とする。ただし、UI、画面デザイン、画面レイアウト、視覚表現は GitHub 互換の対象外とする。互換範囲は3類マスター仕様書と承認済みフェーズ計画に定義された範囲に限る。
- 現時点で不要な機能は、GitHub に存在する機能であっても実装対象から除外する。
- オープンソースの Git プロバイダーはサブの機能互換インスパイア対象として扱う。ただし、主たる互換基準ではなく、参考にした機能は3類マスター仕様書へ再定義し、現時点で必要な機能かどうかを判断し、ユーザー承認を得てから実装対象に含める。
- 実装機能候補の整理は `docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` で管理する。同ファイルに記載された候補は、ユーザー承認と本書への反映があるまで実装対象ではない。
- 各フェーズには、必ず対応するバージョンを割り当てる。
- ソースコード実装作業は、対象フェーズ、対象仕様、検証範囲を提示し、ユーザー承認を得てから着手する。
- フェーズ途中で実装範囲を変更する場合は、本書、2類ポリシー、必要な3類マスター仕様書を更新し、ユーザー承認を得る。
- 正式リリース対象は安定版のみとする。
- 安定版リリースフェーズは、Phase 7、Phase 17、Phase 27 のような 7系フェーズをデフォルト方針とする。
- Phase 5、Phase 15、Phase 25 のような 5系フェーズは、補助的なリリース判定、設計・デザイン改良、仕様整理のためのフェーズとし、安定版リリースフェーズとして扱わない。
- Phase 6、Phase 16、Phase 26 のような 6系フェーズは、大規模なバグ修正とドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズとする。必要に応じて移行準備と検証強化も行う。6系フェーズ自体は安定版リリースフェーズとして扱わない。
- Phase 9 は安定版判定フェーズとする。Phase 19、Phase 29 のような後続9系フェーズは補助的なリリース判定フェーズとし、ケースバイケースで安定版リリースフェーズになる場合と、ならない場合がある。
- 後続9系フェーズを安定版リリースフェーズとして扱う場合は、マスター開発計画と2類ポリシーに明記し、ユーザー承認を得る。
- リリース提案、リリース配置、リリース成果物、リリース自動化は `docs/policies/RELEASE_POLICY.md` に従う。リリース履歴の正本は GitHub Releases とし、リポジトリ内に変更履歴、リリース履歴、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を履歴ファイルとして保持しない。
- 本番サーバ環境へのデプロイは、承認工程を省かず、バックアップ、検証、ロールバック前提を含めて自動化を標準とし、詳細は `docs/policies/DEPLOYMENT_POLICY.md` に従う。
- Deno single binary 形式を正本成果物とする。Docker は、正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つとする。Docker 使用時も非 Docker の binary 直実行時も、1 VPS 上の差し替え可能な system 側と host filesystem data 側を分離する同じ構成にする。shell script + SSH は binary または image 転送、起動定義更新、backup、再起動、検証の補助方式とし、`gh` と systemd timer を補助採用とする。Adlaire Deploy は Phase 10 の着手対象とし、Adlaire Git Repository 本体へ統合せず、DB 不使用の `adlaire-deploy` CLI 付随システムとして同居・連携する。GitHub Actions と外部デプロイフレームワークは保留、Node.js系は不採用とする。
- 標準データベースは libSQL とする。SQLite 互換維持は行わず、SQLite は既存データ移行元確認用としてのみ扱う。
- ローカルに Deno が存在しない場合、実行系検証は停止ではなく VPS または承認済み検証サーバで実施する方針とする。
- ドキュメント参照導線は `docs/DOCUMENT_INDEX.md` を索引として確認する。AdlaireGroup 共通ガバナンス雛形の正本は `docs/tpl-governance/` 配下で管理し、現行プロジェクト固有の正本とは分離する。
- `docs/tpl-governance/` は AdlaireGroup 共通ガバナンス雛形の正本とし、本プロジェクトの変更が共通方針に該当する場合は更新要否を判定し、必要な場合は同一変更範囲で雛形も整合させる。
- フェーズ番号は累積方式とし、安定版リリース後もリセットしない。
- バージョン表記は `v.{Major}.{Minor}` に統一する。`Major` は安定版リリース系列を表し、初回安定版リリース前は `0` を維持する。`Minor` は累積変更番号として扱い、リセットしない。
- 本書の計画バージョンと各フェーズの基準バージョンは分けて管理する。計画バージョンは本書の改訂履歴を示し、フェーズ基準バージョンは実装・検証対象の基準を示す。
- 本書を改訂する場合は、対象フェーズ、対象フェーズの基準バージョン、改訂理由、実装対象・対象外・検証範囲・完了条件への影響をフェーズ単位で記録する。
- 複数フェーズへ影響する変更であっても、影響範囲をフェーズごとに分けて整理する。
- フェーズ単位で、必ずドキュメント等の整合性向上を行う。
- 各フェーズの完了前に、リポジトリ全体の整合性確認と整合性向上を必ず行う。
- リポジトリ整合性確認では、1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、マスター実装機能候補リスト、README、実装、テスト、検証導線、バージョン表記、Pull Request 説明の矛盾や古い表記を確認する。
- リポジトリ整合性確認で矛盾が見つかった場合、補正が完了するまでフェーズを完了扱いにしてはならない。
- リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。
- Adlaire Git Repository 本体の標準運用基盤は、self-host、VPS、専用サーバーを前提とする。Docker 使用時も非 Docker の binary 直実行時も、保護対象 data 側は host filesystem を正本として system 側から分離する。
- Deno Deploy 環境対応は白紙とし、標準採用、将来候補、参考互換対象として扱わない。Turso Cloud、その他 libSQL 系クラウドDBサービスは標準採用ではなく、将来候補として保留する。検討する場合は、補助API、管理機能、Webhook 受信、読み取り専用ミラー等の補助的用途を優先して評価し、Git repository 実体保存、Git 操作、永続ファイル、バックアップ、復旧、データ所在、認証情報管理、運用費用、Node.js / npm 非依存方針との整合を確認する。
- Turso Cloud 等のクラウドDBサービスを検討する場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。

---

## 4. フェーズ別バージョン方針

フェーズ番号は累積方式とし、Phase 0 から単調に進める。

安定版リリース後もフェーズ番号を戻してはならない。Phase 7 の次は Phase 8、Phase 17 の次は Phase 18、Phase 27 の次は Phase 28 として扱う。

`Major` は累積フェーズ番号ではなく、安定版リリース系列を表す。

初回安定版リリース前は、Phase が進んでも `Major` を `0` のまま維持する。初回安定版リリースとして承認されたフェーズで、`Major` を `1` へ進める。

安定版リリースを表す `Major` 更新は、7系フェーズをデフォルトとする。ただし、Phase 9 はユーザー承認に基づく安定版判定フェーズとして扱う。Phase 19、Phase 29 のような後続9系フェーズは補助的にケースバイケースで扱う。5系フェーズと6系フェーズでは `Major` を更新しない。

| フェーズ | 基準バージョン | ステータス | 扱い |
|---|---:|---|---|
| Phase 0 | v.0.1 | 完了 | 実装前の文書整備、設計整理、計画策定 |
| Phase 1 | v.0.2 | 実装完了・開発検証段階 | Git 基本機能、認証、Repository CRUD、SQLite 基盤、Deno single binary 実行環境 |
| Phase 2 | v.0.3 | 完了 | GitHub 互換の Pull Request、Code Review、Issue、Wiki、Webhook、Release、REST API 基本機能 |
| Phase 3 | v.0.4 | 完了 | Organizations 最小運用、Teams 最小運用、Projects 最小運用、Adlaire 内製 Deno Module Registry 最小実装、運用基盤拡張 |
| Phase 4 | v.0.5 | 完了 | Phase 1 から Phase 3 までの統合、仕様整合、移行準備、検証導線整理 |
| Phase 5 | v.0.6 | 完了 | デザイン関連の改良・改修、仕様整理。安定版リリース対象外 |
| Phase 6 | v.0.7 | 完了 | 大規模バグ修正、ドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズ |
| Phase 7 | v.1.8 | 完了 | 初回安定版リリース |
| Phase 8 | v.1.9 | 完了 | DB。libSQL 標準化、SQLite 互換維持なし、DB 方針整理 |
| Phase 8.1 | v.1.9 | 完了 | 本体整合性。DB 方針変更に合わせた本体仕様、計画、実装、検証導線の整合 |
| Phase 8.5 | v.1.9 | 完了 | システム分割。Adlaire Git Repository 本体とデータ領域の分割 |
| Phase 8.7 | v.1.9 | 完了 | 安定化。バグ修正、検証強化、ドキュメント整合性 |
| Phase 9 | v.2.10 | 完了 | バグ修正ゼロ化、安定版判定、リリース準備 |
| Phase 10 | v.2.14 | 着手 | Adlaire Deploy。DB 不使用で binary 正本成果物の取得、検証、配置、backup、rollback、manifest、plan / result / error 記録を内製化。Deno Deploy 環境対応は白紙 |

上記は各フェーズの基準バージョンである。表の `Major` は安定版リリース系列であり、累積フェーズ番号ではない。初回安定版リリース前は `v.0.x` 系を維持する。

フェーズ内でドキュメント更新、バグ修正、検証追加、仕様整理が発生する場合は、`Minor` を累積で進める。次フェーズへ進む場合も、`Minor` は直前の正式記録バージョンより大きい累積値にする。

例:

```text
v.0.1 -> v.0.2 -> v.0.3 -> v.0.4 -> v.0.5
```

初回安定版リリースとして承認された場合の例:

```text
v.0.8 -> v.1.8
```

`Major` を更新する場合も、`Minor` はリセットしない。フェーズ番号、`Major`、`Minor` のいずれも過去の値へ戻してはならない。

### 4.1 採用バージョン決定方針

開発言語、ランタイム、データベース、Git、外部コマンド、外部ライブラリ、フレームワーク、採用バージョン、固定バージョンは、ユーザーが決定する。

採用バージョンの基本方針は、各技術の **最新の安定版** とする。

Deno、SQLite、libSQL、Git、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリ、その他ユーザー承認を得て採用する技術は、採用または更新の時点で公式情報を確認し、最新の安定版を採用候補とする。

Deno single binary 形式を正本成果物とする。Docker は、正本成果物である Deno single binary を Docker image に同梱して実行する運用選択肢の一つとする。Docker 使用時も非 Docker の binary 直実行時も、libSQL database、移行元 SQLite database、Git bare repositories、config、secrets、logs、backups、manifests は host filesystem を正本とする data 側として分離する。

標準採用は Deno 標準ライブラリ（`jsr:@std/*`）に限定する。ただし、Deno 標準ライブラリの個別モジュールを採用する場合も、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。

JSR レジストリの公開ライブラリは、Deno 標準ライブラリ（`jsr:@std/*`）を除き、必要最小限の外部ライブラリ例外採用として扱う。採用する場合は、ユーザー承認を得るまで採用禁止とする。JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは例外なく採用禁止とする。JSR へ公開する package は、公開可能なオープンソースコードであることを前提とし、クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する方針とする。

npm registry 互換レジストリは、Node.js / npm ecosystem リスクと衝突するため標準採用しない。

TypeScript は **6系の最新安定版** を採用方針とする。Deno に同梱される TypeScript を利用する場合も、TypeScript 6系の最新安定版であることを採用条件とする。

承認済み固定採用バージョンは以下とする。

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | 既存データ移行元確認用。互換維持・最小検証用として扱わない |
| libSQL | `libsql-server v0.24.32` | 標準データベース |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
エージェントは、候補提示、比較、調査、リスク整理、推奨案の提示を行ってよい。ただし、ユーザーの明示承認なしに採用決定、バージョン固定、方針確定、実装反映を行ってはならない。

上記にない技術、Deno 標準ライブラリの個別モジュール、Deno で利用する外部コマンド、例外採用する外部ライブラリの固定バージョンは、個別にユーザー承認を得るまで未確定として扱う。

採用または更新の時点で公式情報から最新の安定版を確認し、候補、理由、影響範囲、検証方法を提示し、ユーザー承認を得てから本書、2類ポリシー、3類マスター仕様書、実装設定へ反映する。

### 4.2 計画バージョンとフェーズ基準バージョン

本書の計画バージョンは、マスター開発計画そのものの改訂履歴を示す。

フェーズ基準バージョンは、各フェーズの実装・検証・判定対象を示す。

計画バージョンの更新は、フェーズ基準バージョンの変更を自動的に意味しない。フェーズ基準バージョンを変更する場合は、対象フェーズ、変更理由、影響範囲、上位ドキュメントとの整合を本書に明記する。

本書を改訂した場合は、改訂履歴に計画バージョンと改訂内容を記録する。

### 4.3 フェーズ単位の改訂記録

本書の改訂は、フェーズ単位で記録する。

改訂履歴には、最低限以下を残す。

- 計画バージョン
- 対象フェーズ
- 対象フェーズの基準バージョン
- 改訂内容
- 上位ドキュメントとの整合

全フェーズ共通の方針を変更する場合は、対象フェーズを「全フェーズ共通」として記録し、必要に応じて各フェーズの実装対象、対象外、検証範囲、完了条件へ反映する。

### 4.4 フェーズ完了時のリポジトリ整合性確認と整合性向上

各フェーズの完了判定では、フェーズ固有の実装対象、対象外、検証範囲、完了条件に加えて、リポジトリ全体の整合性確認と整合性向上を必須とする。

ドキュメント等の整合性向上は、任意の品質改善ではなく、フェーズ単位で必ず実施するルールであり、ポリシーである。

リポジトリ整合性確認では、最低限以下を確認する。

- `AGENTS.md` とフェーズ作業が矛盾していないこと
- 2類ポリシーとフェーズ作業が矛盾していないこと
- 3類マスター仕様書と実装、テスト、検証導線が矛盾していないこと
- マスター開発計画とマスター実装機能候補リストの役割が混同されていないこと
- フェーズの実装対象、対象外、検証範囲、完了条件が最新状態へ更新されていること
- `deno.json`、check script、README、仕様書の実行コマンド例が矛盾していないこと
- 正式バージョン表記と内部バージョン表記の対応が崩れていないこと
- Node.js ランタイム、外部フレームワーク、無承認外部ライブラリが混入していないこと
- Pull Request のタイトル、本文、変更内容、検証結果がフェーズ状態と一致していること

上記に矛盾または古い表記が残る場合は、補正完了までフェーズ完了として扱ってはならない。

リポジトリ整合性が取れていない状態で、次のフェーズに進んではならない。

---

## 5. Phase 0: 実装前整備

### 5.1 目的

ソースコード実装へ進む前に、ルール、ポリシー、マスター仕様書、開発計画の整合性を確定する。

### 5.2 対象

- `AGENTS.md` の最上位ルール整理
- 2類ドキュメント群のドキュメント憲章・技術要件・バージョン・リリース方針整理
- `docs/specs/` 配下のマスター仕様書整合
- SQLite / libSQL 方針の整理
- 実装フェーズと基準バージョンの確定

### 5.3 対象外

- アプリケーションコード実装
- テストコード実装
- DB schema / migration 作成
- 外部ライブラリ導入
- Node.js ランタイム導入

### 5.4 完了条件

- 本書が作成されている。
- 1類、2類、3類ドキュメントから本書への参照が整理されている。
- Phase 1 の実装対象、対象外、検証範囲、承認条件が明確になっている。

---

## 6. Phase 1: Git 基本機能

### 6.1 基準バージョン

Phase 1 の基準バージョンは `v.0.2` とする。

### 6.1.1 ステータス

Phase 1 は、承認済み実装範囲について実装完了とする。

Phase 1 は安定版リリースフェーズではない。Phase 1 では例外なく安定版リリース方針を持たず、開発検証段階として扱う。

### 6.2 目的

セルフホスト型 Git ホスティング基盤として、最小限の Git 操作、認証、リポジトリ管理、SQLite 永続化、Web UI を成立させる。

### 6.3 実装対象

- Git clone / push / pull / fetch
- Branch / Tag 管理
- ユーザー登録、ログイン、認証、認可
- SSH 公開鍵管理
- HTTP Basic Auth
- Personal Access Token 管理
- Repository CRUD
- Visibility 制御
- README 表示
- 最小 Web UI
- 操作ログ
- SQLite driver
- Database Gateway
- SQLite から libSQL へ移行しやすい永続化境界
- Deno ランタイムによるホストOS実行環境
- Deno single binary による実行環境
- 基本テスト

### 6.4 対象外

- libSQL driver 実装
- Turso Cloud 等のクラウドDBホスティング採用
- Pull Request
- Issue
- Wiki
- Webhook
- Organizations / Teams
- 複数インスタンス運用
- コンテナ前提の本番運用固定化

### 6.5 必須検証

- Git 基本操作
- 認証・認可
- Repository CRUD
- private repository のアクセス制御
- SQLite 永続化
- Database Gateway 経由のDBアクセス
- XSS 対策
- Node.js ランタイム非依存
- 外部フレームワーク非採用
- Deno ランタイム上での `fmt` / `lint` / `test` / `compile`
- ホストOS上の Deno ランタイム起動と `/health`
- Deno single binary の起動と `/health`

### 6.6 完了条件

- Phase 1 の実装対象が3類マスター仕様書に基づいて成立している。
- DBアクセスが SQLite 固有処理へ直接依存していない。
- libSQL への将来移行を妨げる構造になっていない。
- 主要検証が完了している。
- 既知バグが残っていない。
- 次フェーズに進むための開発検証結果を説明できる状態である。

### 6.7 実装結果

Phase 1 では、以下を実装済みとする。

- Deno / TypeScript / `Deno.serve` による HTTP アプリケーション基盤
- SQLite CLI driver と Database Gateway
- ユーザー登録、HTTP Basic 認証、Personal Access Token 認証
- SSH 公開鍵管理 API
- Repository CRUD、Visibility 制御、private repository アクセス制御
- Git Smart HTTP による clone / push / pull / fetch
- Branch / Tag / README / commit / tree / blob 参照 API
- 最小 Web UI
- 監査ログ記録
- ホストOS上の Deno ランタイム環境、永続データディレクトリ、healthcheck
- Deno single binary 実行環境
- 意味のある単体テスト、統合テスト、E2E 検証

### 6.8 検証結果

Phase 1 の完了判定では、以下の検証を必須結果として扱う。

- `deno task fmt --check`
- `deno task lint`
- `deno task test`
- `deno task compile`
- ホストOS上の Deno / Git / SQLite / Git Smart HTTP backend 確認
- Deno single binary 起動後の `/health` 確認
- Personal Access Token 認証付き Git `push` / `clone` / `fetch` / `pull`
- private repository の匿名 API / Git アクセス拒否
- HTTP Basic 認証による API アクセス

### 6.9 フェーズ判定

Phase 1 は開発検証段階として成立している。

Phase 1 では安定版リリース判定を行わない。Phase 1 の判定対象は、次フェーズへ進めるだけの仕様整合、主要検証、既知バグ整理が完了しているかに限定する。

Phase 1 から次フェーズへ進むには、以下を満たすこと。

- PR がレビューされ、`main` へマージされている。
- `main` 上で Phase 1 必須検証が再実行されている。
- 既知バグが整理され、次フェーズ着手可否を判断できる状態である。
- 安定版リリース対象ではないことを確認している。

---

## 7. Phase 2: 開発支援機能

### 7.1 基準バージョン

Phase 2 の基準バージョンは `v.0.3` とする。

### 7.2 目的

チーム開発に必要なレビュー、課題管理、文書管理、通知連携を、GitHub 互換方針に基づく機能互換として追加する。

Phase 2 は、Phase 1 の PR が `main` へマージされ、Phase 1 の開発検証判定が完了してから着手する。

Phase 2 の初回実装対象は、ユーザー承認に基づき Issue 最小実装とする。

Phase 2 は、ユーザー承認に基づき、Pull Request、Code Review、Issue、Wiki、Webhook、Release、REST API 基本機能の最小実装までを完了対象とする。

### 7.3 実装対象

- Pull Request
- Code Review
- Issue
- Wiki
- Webhook
- Release 管理
- REST API 基本機能

### 7.3.1 Issue 最小実装対象

Issue 最小実装では、以下を対象とする。

- Issue の作成
- Issue の一覧
- Issue の詳細取得
- Issue のタイトル、本文、状態の更新
- `open` / `closed` 状態管理
- Repository 権限に基づく参照制御
- Issue 作成者、Repository owner、admin による更新制御
- 操作ログへの記録

Label、Assignee、Milestone、Comment、Attachment、Mention、Issue template、Project 連携、Pull Request との自動リンク、Webhook イベント送信は対象外とする。

### 7.3.2 Phase 2 最小完了対象

Phase 2 最小完了では、以下を対象とする。

- Pull Request の作成、一覧、詳細取得、更新、`open` / `closed` / `merged` 状態管理
- Code Review の作成、一覧、`commented` / `approved` / `changes_requested` 状態管理
- Issue の作成、一覧、詳細取得、更新、`open` / `closed` 状態管理
- Wiki page の作成または更新、一覧、詳細取得、version 加算
- Webhook の作成、一覧、`ping` event の署名付き HTTP POST、delivery 成功・失敗記録
- Release の作成、一覧、詳細取得、draft 状態保存
- Repository 権限に基づく参照・更新制御
- Database Gateway 経由の SQLite 永続化
- 操作ログへの主要 action 記録
- REST API による主要ワークフロー提供
- リポジトリ全体の Phase 2 表記、実行コマンド例、候補リスト、上位仕様との整合性確認と整合性向上

### 7.4 対象外

- Organizations / Teams の本格運用
- Projects
- Discussions
- Star / Watch
- 複数インスタンス運用
- libSQL driver の正式採用
- クラウドDBホスティング採用
- Pull Request の実 Git 差分計算、自動マージ、競合検出、CI 連携
- Wiki page の過去本文履歴、添付ファイル、Markdown レンダリング
- Webhook の任意 event 自動発火、配送キュー、再送管理、更新・削除
- Release の Git tag 実在確認、成果物アップロード、更新・削除

### 7.4.1 着手条件

Phase 2 に着手する前に、以下を満たすこと。

- Phase 1 の作業ブランチが PR 経由で `main` にマージされている。
- Phase 1 の作業ブランチがルールに従って閉じられている。
- Phase 1 の開発検証判定が完了している。
- Phase 2 は安定版リリースフェーズではないことを確認している。
- Phase 2 の実装対象、対象外、検証範囲についてユーザー承認を得ている。
- Pull Request / Issue / Wiki / Webhook の仕様差分が3類マスター仕様書に反映されている。
- GitHub 互換として扱う範囲、GitHub と互換にしない範囲、将来検討に回す範囲が3類マスター仕様書に明記されている。
- UI、画面デザイン、画面レイアウト、視覚表現が GitHub 互換対象外であることが3類マスター仕様書に明記されている。

### 7.4.2 着手前に改訂する仕様

Phase 2 に着手する前に、最低限以下の仕様を3類マスター仕様書へ反映する。

- Pull Request の作成、更新、一覧、詳細取得、レビュー、マージ状態管理
- Code Review のコメント、承認、変更要求、権限確認
- Issue の作成、更新、状態管理、担当者、ラベル
- Wiki の保存形式、編集権限、version 管理
- Webhook のイベント種別、署名付き `ping` 送信、失敗時の記録
- Release 管理のタグ名メタデータ、draft 状態、参照範囲
- REST API 基本機能の認証、認可、エラー形式
- GitHub 互換として扱う用語、URL、API の考え方、権限確認
- GitHub 互換対象外として扱うUI、画面デザイン、画面レイアウト、視覚表現

仕様が未確定の項目は、Phase 2 の実装対象に含めてはならない。

### 7.4.3 実装順序

Phase 2 の実装は、以下の順序を原則とする。

1. Phase 2 仕様差分の確定
2. GitHub 互換範囲と非互換範囲の確定
3. 権限モデルと監査ログ対象の整理
4. Pull Request / Code Review の最小単位
5. Issue / Wiki の最小単位
6. Webhook / REST API 基本機能
7. Release 管理
8. 意味のあるテストと主要検証

順序を変更する場合は、変更理由と影響範囲を本書または対象3類マスター仕様書に記録する。

### 7.4.4 必須検証

Phase 2 の完了判定では、以下を必須検証として扱う。

- Pull Request の作成、レビュー、マージ状態管理、権限確認
- Code Review コメントと承認状態の永続化
- Issue の作成、更新、検索、権限確認
- Wiki の編集、version 加算、JSON API としての本文返却
- Webhook の署名付き `ping` 送信、成功時と失敗時の delivery 記録
- REST API 基本機能の認証、認可、エラー応答
- GitHub 互換として定義した用語、主要ワークフロー、権限確認が3類マスター仕様書どおりに成立していること
- Database Gateway を経由した永続化が維持されていること
- libSQL への将来移行を妨げる SQLite 固有処理が上位層へ漏れていないこと
- Node.js ランタイム、外部フレームワーク、無承認外部ライブラリへ依存していないこと

### 7.5 完了条件

- Pull Request、Code Review、Issue、Wiki、Webhook、Release が3類マスター仕様書に基づいて最小ワークフローとして動作する。
- GitHub 互換として定義した主要ワークフローを説明できる。
- Webhook と REST API 基本機能の権限確認が成立している。
- Phase 2 必須検証が完了している。
- Database Gateway を経由した永続化境界が維持されている。
- Node.js ランタイム、外部フレームワーク、無承認外部ライブラリへ依存していない。
- 既知バグが残っていない。
- 次フェーズに進むための開発検証結果を説明できる状態である。
- Phase 2 実装範囲と、1類ルールブック、2類ポリシー、3類マスター仕様書、マスター実装機能候補リスト、検証導線の表記が整合している。

---

## 8. Phase 3: 組織・運用拡張

### 8.1 基準バージョン

Phase 3 の基準バージョンは `v.0.4` とする。

### 8.2 目的

組織管理、チーム管理、プロジェクト管理の最小運用、Adlaire 内製 Deno Module Registry 最小実装、運用自動化を追加し、内部向け Git ホスティング基盤としての運用性と内製 Deno package 配布基盤を高める。

### 8.3 実装対象

- Organizations 最小運用
- Teams 最小運用
- Projects 最小運用
- Adlaire 内製 Deno Module Registry 最小実装
- REST API 対象リソース拡張
- Webhook 対象イベント拡張
- 高度な監査ログ
- 運用自動化
- libSQL driver 採用可否の再評価

Adlaire 内製 Deno Module Registry 最小実装では、Deno / TypeScript / ESM 前提の package metadata、version 管理、module 登録、checksum、認証・認可、監査ログ、Deno native import / download endpoint を候補範囲とする。

### 8.3.1 Phase 3 実装済み範囲

Phase 3 では、最小運用として以下を実装済み範囲とする。

- Organization の作成、一覧、詳細取得
- Organization member の追加
- `owner` / `member` の最小 role 管理
- 作成者を Organization owner member として登録する処理
- Organization owner による Organization 所有 repository の作成
- Organization member による Organization 所有 private repository の参照
- Organization owner または admin による Organization 所有 repository の更新
- `organization.create` / `organization.member.add` の監査ログ記録
- Team の作成、一覧、Organization member に限定した Team member 追加、Team member 一覧
- `team.create` / `team.member.add` の監査ログ記録
- Repository 配下の Project 作成、一覧、`open` / `closed` 状態管理
- `project.create` / `project.update` の監査ログ記録
- Adlaire 内製 Deno Module Registry の package metadata 作成、一覧、version 登録、version 一覧、module source 保存、checksum 記録、download endpoint
- `registry.package.create` / `registry.version.publish` / `registry.version.download` の監査ログ記録
- Webhook の任意 event dispatch
- Audit log の admin 参照
- Operations status の参照
- libSQL 採用可否の再評価結果参照
- Phase 3 API の統合テスト

### 8.4 対象外

- SQLite / libSQL 以外のデータベースエンジン採用
- Node.js ランタイム採用
- 外部フレームワーク採用
- クラウドDBホスティングの無承認採用
- Discussions
- Organizations / Teams 本格運用
- Projects 本格運用
- 複数インスタンス本格運用
- npm registry 互換レジストリ、汎用 Package registry、Container registry
- Team による repository 権限付与
- Team 削除、Team member 削除、Team member role
- Project item、Issue / Pull Request 連携、複数 view、集計、Automation
- Registry package / version 削除、複数 module file、依存解決、署名付き artifact
- libSQL driver 正式採用

汎用 Package registry は今後の計画として検討する。ただし、Phase 3 では保留方針とし、Adlaire 内製 Deno Module Registry 最小実装の対象範囲へ含めない。

Discussions は保留候補のままとし、Issue と Wiki で当面代替する。保留解除する場合は、3類マスター仕様書、マスター開発計画、検証範囲へ反映し、ユーザー承認を得る。

### 8.5 完了条件

- 組織・チーム単位の最小権限管理が成立している。
- Projects 最小運用の対象範囲と対象外範囲を説明できる。
- Adlaire 内製 Deno Module Registry 最小実装の対象範囲と対象外範囲を説明できる。
- 運用機能が3類マスター仕様書に基づいて成立している。
- libSQL またはクラウドDBホスティングを採用する場合は、別途ユーザー承認と仕様更新が完了している。
- 既知バグが残っていない。
- 次フェーズに進むための開発検証結果を説明できる状態である。
- リポジトリ全体の整合性確認と整合性向上が完了している。

### 8.6 検証結果

Phase 3 完了時点の標準検証は `tools/check-adlaire-git-repository.sh` とする。

検証結果は以下とする。

- `deno fmt --check` 成功
- `deno lint` 成功
- `deno test`: 22 passed / 0 failed
- `deno compile` 成功
- `adlaire-git-repository-check-ok`

---

## 9. Phase 4: 後続フェーズ前統合

### 9.1 基準バージョン

Phase 4 の基準バージョンは `v.0.5` とする。

### 9.2 目的

Phase 1 から Phase 3 までの開発成果を統合し、Phase 5 のデザイン・仕様整理へ進むための仕様整合、バグ修正、移行準備、検証整理を行う。

### 9.3 リリース方針

Phase 4 は安定版リリースフェーズではない。Phase 4 では例外なく安定版リリース方針を持たない。

### 9.4 実施対象

- Phase 1 から Phase 3 までの統合確認
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、マスター実装機能候補リストの仕様整合
- SQLite / libSQL 移行可能性を維持するための永続化境界確認
- 移行手順、バックアップ、復旧、ロールバック前提の整理
- 後続フェーズ前の検証導線整理

### 9.5 完了条件

- Phase 1 から Phase 3 までの成果を組み合わせた主要ワークフローを説明できる。
- Phase 5 に進む前の仕様矛盾、古い表記、検証導線の不足が整理されている。
- SQLite / libSQL 以外のデータベースエンジン、Node.js ランタイム、外部フレームワーク、無承認外部ライブラリに依存していない。
- 既知バグが残っていない。
- リポジトリ全体の整合性確認と整合性向上が完了している。

### 9.6 Phase 4 実装完了範囲

Phase 4 では、Phase 3 で導入した Organization 所有 repository の権限モデルを、Phase 1 から Phase 2 で実装済みの repository 配下機能へ統合した。

実装完了範囲は以下とする。

- Issue の参照、作成、更新時に、Organization 所有 private repository の参照権限を `RepositoryService` の権限境界で判定する。
- Pull Request、Code Review、Wiki、Webhook、Release の参照および書込操作を `RepositoryService` の権限境界で判定する。
- Organization owner は Organization 所有 repository に対して書込操作を実行できる。
- Organization member は Organization 所有 private repository の参照操作を実行できる。
- Webhook event dispatch は Organization 所有 repository でも repository 書込権限に基づいて実行できる。
- HTTP handler、Issue service、Phase 2 service から個別の repository owner 判定を重複実装せず、RepositoryAccess 境界を経由する。

Phase 4 では、新しい外部依存、Node.js ランタイム、外部フレームワーク、SQLite / libSQL 以外のデータベースエンジンは採用していない。

### 9.7 Phase 4 検証範囲

Phase 4 の追加検証では、Organization 所有 private repository を対象に、以下の組み合わせワークフローを確認する。

- Organization 作成
- Organization member 追加
- Organization 所有 private repository 作成
- Organization member による Issue 作成と一覧取得
- Organization member による Pull Request 作成と一覧取得
- Organization owner による Wiki 作成と Organization member による参照
- Organization owner による Release 作成と Organization member による参照
- Organization owner による Webhook 作成と Webhook event dispatch

標準検証は `tools/check-adlaire-git-repository.sh` とする。

Phase 4 完了時点で、Database Gateway、SQLite driver、Repository 層、Service 層の責務境界に変更はない。SQLite は現行 driver として維持し、libSQL は将来移行候補として保持する。libSQL driver、Turso Cloud 等のクラウドDBホスティング、その他データベースエンジンは Phase 4 の採用対象外である。

---

## 10. Phase 5: デザイン・仕様整理

### 10.1 基準バージョン

Phase 5 の基準バージョンは `v.0.6` とする。Phase 5 は安定版リリースフェーズとして扱わず、安定版系列 `v.1.6` へ進めてはならない。

### 10.2 目的

Phase 1 から Phase 4 までの成果を対象に、補助的なリリース判定を行う。あわせて、Web UI、画面デザイン、画面レイアウト、視覚表現、操作導線、アクセシビリティの改良・改修方針を整理する。

### 10.3 リリース方針

Phase 5 は補助的なリリース判定フェーズである。ただし、Phase 5 は安定版リリースフェーズではない。Phase 5 では例外なく安定版リリース方針を持たない。

### 10.4 デザイン関連改良・改修方針

Phase 5 では、Phase 1 から Phase 4 までに成立した機能を前提に、デザイン関連の改良・改修方針を整理する。

対象は以下とする。

- Web UI の情報設計
- 画面レイアウトの整理
- 視覚表現の統一
- 操作導線の改善
- モバイル、デスクトップ双方の表示確認
- アクセシビリティと可読性の改善

Phase 5 のデザイン関連作業は、UI 互換ではなく本プロジェクト独自 UI として行う。GitHub の画面、デザイン、ブランド表現、商標表現を模倣してはならない。

Phase 5 のデザイン関連作業では、外部フレームワークを採用してはならない。外部ライブラリまたは外部ツールを採用する場合は、2類ポリシーに従い、例外採用としてユーザー承認を得る。

### 10.5 完了条件

- Phase 1 から Phase 4 までの成果に対するデザイン・仕様整理材料が整理されている。
- デザイン関連の改良・改修対象、対象外、検証範囲を説明できる。
- Web UI が3類マスター仕様書の UI 方針に違反していない。
- GitHub UI 互換、外部フレームワーク、無承認外部ライブラリに依存していない。
- 既知バグが残っていない。
- リポジトリ全体の整合性確認と整合性向上が完了している。

### 10.6 Phase 5 実装完了範囲

Phase 5 では、既存 API と既存ドメイン機能を変更せず、トップページの Web UI を対象にデザイン関連の改良・改修を行った。

実装完了範囲は以下とする。

- トップページの Phase 表記を `Phase 5 / v.0.6` へ更新
- ヘッダー、ステータス領域、フォーム領域、Repository 一覧領域の情報設計を整理
- ユーザー登録、API token 発行、Repository 作成、Repository 更新の主要導線を維持
- Repository 一覧を owner/name、clone URL、visibility の役割ごとに読み取りやすく整理
- モバイル、デスクトップ双方で破綻しにくい responsive layout を追加
- focus visible、status live region、色、余白、文字サイズ、状態表示を整理
- 外部フレームワーク、外部ライブラリ、Node.js runtime、npm ecosystem を採用しない

### 10.7 Phase 5 検証結果

Phase 5 完了時点の標準検証は `tools/check-adlaire-git-repository.sh` とする。

検証結果は以下とする。

```text
24 passed | 0 failed
adlaire-git-repository-check-ok
```

Phase 5 の UI 表示契約は、Phase 6 以降の安定版準備 baseline として継承した。現行フェーズでは `tests/integration/phase9_release_judgment_test.ts` で表示契約を検証する。

---

## 11. Phase 6: 安定版リリース準備

### 11.1 基準バージョン

Phase 6 の基準バージョンは `v.0.7` とする。

### 11.2 目的

Phase 5 のデザイン関連改良・改修を受けて、大規模なバグ修正とドキュメント整合性向上をデフォルト方針として行う。必要に応じて移行準備、検証強化、技術負債整理も行う。Phase 6 は、Phase 7 のデフォルト安定版リリース判定へ進むための安定版リリース準備フェーズである。

### 11.3 リリース方針

Phase 6 は安定版リリースフェーズではない。Phase 6 では例外なく安定版リリース方針を持たない。

### 11.4 実施対象

- 大規模なバグ修正
- ドキュメント整合性向上
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、実装、検証導線の整合性確認と整合性向上
- 移行手順とロールバック手順の整理
- 主要ワークフローの検証強化
- セキュリティ、認証、権限管理、データ永続化、Git 操作の再確認
- Phase 7 安定版リリース判定へ進むための残課題整理

### 11.5 完了条件

- 大規模なバグ修正が完了し、既知バグが残っていない。
- ドキュメント全体の整合性が確認されている。
- Phase 7 の安定版リリース判定に必要な検証範囲、移行手順、ロールバック手順、残課題を説明できる。
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、実装、テスト、検証導線が矛盾していない。
- Phase 6 が安定版リリースフェーズではないことを確認している。

### 11.6 Phase 6 実施完了範囲

Phase 6 では、Phase 7 のデフォルト安定版リリース判定へ進むため、既知バグ確認、ドキュメント整合性向上、移行・ロールバック前提整理、検証導線強化を行った。

実施完了範囲は以下とする。

- `deno.json` の内部バージョンを `0.7.0` へ更新し、正式表記 `v.0.7` と対応させた。
- トップページの Phase 表記を `Phase 6 / v.0.7` へ更新した。
- Phase 5 の UI 表示契約テストを Phase 6 の安定版準備 baseline test として継承した。
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、README、実装、テスト、検証導線、バージョン表記の整合性を確認した。
- `docs/DOCUMENT_INDEX.md` を参照索引として新設し、最上位ドキュメント、2類ポリシー、3類マスター仕様書、計画文書、README の参照導線を整理した。
- AdlaireGroup 関連プロジェクト、プロダクトへ共通展開する最上位ドキュメント雛形として `docs/tpl-governance/` を整備し、共通コアと共通方針具体化用 policy slots を分離した。
- Phase 6 バグ精査で確認した認証、権限、Git Smart HTTP、SQLite 外部キー、入力エラー応答、重複応答、Registry 一覧漏えい、HTTP Authorization scheme の大小文字処理、Webhook secret API 露出、Team member の Organization member 境界漏れを修正し、再発防止テストを追加した。
- 既知バグは標準検証と主要 workflow test の範囲では確認されていない。
- Phase 6 は安定版リリースフェーズではなく、リリース対象外であることを確認した。

### 11.7 移行・ロールバック前提

Phase 6 では database schema、Database Gateway、Repository 層、Service 層の責務境界を維持する。SQLite driver は Database Gateway 内部の責務として、各 SQLite CLI 実行で外部キー制約を有効化する。

Phase 6 から Phase 5 相当へ戻す場合、データ構造の migration は不要である。ロールバックは以下を前提とする。

- `dataDir` 配下の SQLite database と bare repository を事前バックアップする。
- `dist/adlaire-git-repo` または配布 binary を Phase 5 相当の成果物へ戻す。
- 起動後に `/health`、トップページ、Repository 一覧、主要 API workflow を確認する。
- `deno.json` の内部バージョン表記は、Phase 5 相当へ戻す場合のみ `0.6.0` と対応させる。

### 11.8 Phase 7 残課題

Phase 7 へ進む前に確認すべき残課題は以下とする。

- 安定版リリース判定を行うかどうかのユーザー承認
- リリースノートの整理
- GitHub Releases を主配置とするリリース配置案の確認
- リポジトリ内に変更履歴ファイルを保持しない方針との整合確認
- 既知制約、対象外機能、保留候補の明示
- backup / restore 手順の最終確認
- 主要 workflow の最終検証

### 11.9 Phase 6 検証結果

Phase 6 完了時点の標準検証は `tools/check-adlaire-git-repository.sh` とする。

検証結果は以下とする。

```text
32 passed | 0 failed
adlaire-git-repository-check-ok
```

Phase 6 の安定版準備 baseline は Phase 7 の安定版リリース判定 baseline として継承した。現行フェーズでは `tests/integration/phase9_release_judgment_test.ts` で表示契約を検証する。

### 11.10 Phase 6 再確認結果

本来の Phase 6 作業として、既知バグ確認、ドキュメント整合性確認、主要 workflow 検証を再実施した。

再確認結果は以下とする。

- `src/` と `tests/` に未処理の `TODO`、`FIXME`、`BUG` 表記は確認されていない。
- 標準検証 `tools/check-adlaire-git-repository.sh` は成功した。
- 検証結果は `32 passed | 0 failed` および `adlaire-git-repository-check-ok` である。
- Phase 6 バグ精査で確認した既知バグについて、`tests/integration/phase6_bug_audit_test.ts` に再発防止の統合テストを追加した。
- 追加精査で確認した、既存管理者による管理者追加不能、JSON Content-Type 誤受理、HTTP Authorization scheme の大小文字誤判定、Webhook secret API 露出、Team member の Organization member 境界漏れを修正した。
- Phase 6 追加バグ精査後のドキュメント整合性向上として、`docs/specs/Auris_System_Design.md`、`docs/specs/Adlaire_Git_Repository_Specification.md`、`docs/DOCUMENT_INDEX.md` の Phase 6 表記、既知バグ修正範囲、現在の実ファイル構成を整合した。
- Phase 6 は安定版リリースフェーズではなく、引き続きリリース対象外である。
- Phase 7 へ進む場合は、Phase 6 の PR を main へ取り込んだ後、Phase 7 用ブランチで安定版リリース判定フェーズとして着手する。

---

## 12. Phase 7: デフォルト安定版リリース

### 12.1 基準バージョン

Phase 7 の基準バージョンは、安定版リリース判定前は `v.0.8` とする。Phase 7 を初回安定版リリースとして承認する場合は、安定版系列 `v.1.8` へ進める。

### 12.2 目的

Phase 6 までの成果を対象に、7系フェーズのデフォルト安定版リリースとして正式なリリース判定を行う。

### 12.3 リリース方針

Phase 7 は7系フェーズであり、デフォルト安定版リリースフェーズである。ただし、安定版リリース判定条件を満たさない場合はリリースしてはならない。

Phase 7 着手時点では、自動的な安定版公開を意味しない。初回安定版リリース判定、`v.1.8` への移行、tag 作成、GitHub Releases 作成、成果物配置、release notes 公開は、リリース提案を提示し、別途ユーザー承認を得るまで実施しない。

Phase 7 はユーザー承認に基づき、初回安定版リリース `v.1.8` として確定する。

### 12.4 実施対象

- Phase 6 までの成果に対する安定版リリース可否判定
- リリースノートの整理
- GitHub Releases を主配置とするリリース配置案の確認
- リポジトリ内に変更履歴ファイルを保持しない方針との整合確認
- 既知制約、対象外機能、保留候補の明示
- backup / restore 手順の最終確認
- 主要 workflow の最終検証
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、マスター実装機能候補リスト、README、実装、テスト、検証導線、バージョン表記、Pull Request 説明の整合性確認と整合性向上

### 12.5 Phase 7 着手時点の対象外

- ユーザー承認前の初回安定版リリース判定
- ユーザー承認前の `v.1.8` への移行
- ユーザー承認前の tag 作成
- ユーザー承認前の GitHub Releases 作成
- ユーザー承認前の成果物配置
- ユーザー承認前の release notes 公開
- Phase 8 以降の長期運用準備
- 保留候補の実装

### 12.6 必須検証

Phase 7 の標準検証は `tools/check-adlaire-git-repository.sh` とする。

最低限、以下を確認する。

- `deno fmt --check`
- `deno lint`
- `deno test`
- `deno compile`
- 主要 workflow 統合テスト
- Phase 7 の表示契約
- 既知バグ再発防止テスト

### 12.7 完了条件

- Phase 6 までの成果に対する既知バグが標準検証範囲で確認されていない。
- リリースノート、既知制約、対象外機能、保留候補を説明できる。
- backup / restore 手順とロールバック前提を説明できる。
- 主要 workflow の検証結果を説明できる。
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、マスター実装機能候補リスト、README、実装、テスト、検証導線、バージョン表記、Pull Request 説明の整合性が確認されている。
- 初回安定版リリースを行う場合は、リリース提案を提示し、別途ユーザー承認を得ている。

### 12.8 Phase 7 着手範囲

Phase 7 は、Phase 6 の PR が GitHub の `main` へ取り込まれた後、Phase 7 用ブランチで着手する。

Phase 7 着手時点では、`deno.json` の内部バージョンを `0.8.0` へ更新し、正式表記 `v.0.8` と対応させる。トップページの Phase 表記は `Phase 7 / v.0.8` とした。

この変更は、安定版リリース判定フェーズへの移行を示すものであり、着手時点では初回安定版リリース、`v.1.8` への移行、tag 作成、GitHub Releases 作成、成果物配置、release notes 公開を意味しなかった。

### 12.9 Phase 7 初回安定版リリース範囲

Phase 7 は、ユーザー承認に基づき初回安定版リリース `v.1.8` として確定する。

Phase 7 初回安定版リリースでは、`deno.json` の内部バージョンを `1.8.0` へ更新し、正式表記 `v.1.8` と対応させる。トップページの Phase 表記は `Phase 7 / v.1.8` とする。

リリース成果物の主配置は GitHub Releases とし、リリースノート、manifest、checksum、Deno single binary を配置対象とする。

---

## 13. Phase 8: DB仕様完成

### 13.1 基準バージョン

Phase 8 の基準バージョンは `v.1.9` とする。Phase 7 で初回安定版リリース `v.1.8` が完了済みであるため、Phase 8 は安定版系列の DB フェーズとして扱う。

### 13.2 目的

libSQL 標準化を中心に DB 仕様を完成させる。SQLite 互換維持は行わない。

### 13.3 リリース方針

Phase 8 は安定版リリースフェーズではない。Phase 8 では例外なく安定版リリース方針を持たない。

### 13.4 実施対象

- libSQL 標準DB仕様の確定
- `DB_DRIVER=libsql` を標準 driver とする接続仕様
- `DB_URL` と `DB_AUTH_TOKEN` による接続先・認証情報の扱い
- npm 依存を含まない libSQL 外部依存例外と内製 libSQL driver 境界
- Database Gateway、Repository 層、driver 層の責務境界
- libSQL 前提の schema、migration、seed 管理方針
- 既存データ移行元確認用 SQLite の取扱境界
- DB backup、restore、rollback の責務境界
- DB 関連テストと検証導線の整理
- 3類マスター仕様書、2類ポリシー、README との整合性確認

### 13.4.1 対象外

- SQLite 互換維持
- SQLite 標準DB運用
- SQLite 最小ローカル検証用運用
- `DB_DRIVER=sqlite` の標準運用化
- `DB_DRIVER=turso` 等のクラウドDBホスティング名を driver 名にすること
- Deno Deploy 環境対応
- Turso Cloud、その他クラウドDBホスティングの標準採用
- Database Gateway を経由しない DB 直接アクセス
- 承認なしの libSQL 外部ライブラリ導入
- 承認なしの schema、migration、seed、テストコード、実装設定変更

### 13.4.2 必須検証

- 標準 driver が `DB_DRIVER=libsql` として定義されていること
- npm 依存を含まない libSQL driver 境界が内製 `LibsqlDriver` の内部に閉じていること
- SQLite が既存データ移行元確認用に限定されていること
- Database Gateway、Repository 層、driver 層の責務境界が仕様書と矛盾していないこと
- DB driver 固有 API が上位層へ漏れない構成になっていること
- DB backup、restore、rollback の責務境界がデプロイポリシーと矛盾していないこと
- リポジトリ全体に旧 SQLite 互換維持、SQLite 標準運用、libSQL 将来候補扱いの古い表記が残っていないこと

### 13.4.3 完了条件

- Phase 8 の DB 仕様が3類マスター仕様書と本書に具体化されている。
- libSQL 標準DB方針、SQLite 互換維持なし方針、Database Gateway 境界が矛盾していない。
- 実装変更へ進む場合の対象、対象外、検証範囲、承認条件を説明できる。
- リポジトリ整合性確認を実施し、矛盾または古い表記を補正している。

### 13.5 Phase 8.1: 本体整合性

DB 方針変更に合わせて、Adlaire Git Repository 本体の仕様、計画、実装、検証導線を整合する。

#### 13.5.1 実施対象

- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画の DB 方針整合
- マスター実装機能候補リストと正式仕様の責務分離確認
- README と実際のファイル構成、運用導線の整合
- 実装と DB schema が Database Gateway 境界に従っていることの確認
- テストと検証導線が libSQL 標準DB方針を説明できることの確認
- Pull Request 説明へ整合性確認結果を反映

#### 13.5.2 完了条件

- 旧 SQLite 標準運用、SQLite 互換維持、libSQL 将来候補扱いの表記が判断基準として残っていない。
- Phase 8 の仕様、計画、実装、検証導線が矛盾していない。
- `DB_DRIVER=sqlite` が通常運用経路として使われず、承認済みの移行元確認用ゲートを通した場合のみ使われる。
- リポジトリ整合性確認を完了している。

#### 13.5.3 Phase 8.1 実施中範囲

Phase 8.1 では、Phase 8 の libSQL driver 実装後に残る本体整合性を扱う。

実施中範囲は以下とする。

- 現行フェーズ表記を `Phase 8.1 / v.1.9` へ整合する。
- `DB_DRIVER=sqlite` を通常運用で拒否し、承認済みの移行元確認時のみ `ADLAIRE_ALLOW_SQLITE_MIGRATION_SOURCE=1` で許可する。
- `@libsql/client` 等の npm 互換 libSQL client、`npm:` import、npm 由来の `deno.lock` 解決結果、FFI / native loader 前提の権限が残る場合は、現行方針へ反する是正対象として扱う。
- libSQL driver の利用範囲が、npm 依存を含まない内製 `LibsqlDriver` と Database Gateway の内部に閉じる計画であることを確認する。
- 実装または設定の撤去・置換へ進む場合は、別途ソースコード実装承認を得る。
- Database Gateway、Repository 層、driver 層の境界を確認する。
- 1類ルールブック、2類ポリシー、3類マスター仕様書、README、テスト、検証導線、Pull Request 説明の整合性を確認する。

### 13.6 Phase 8.5: システム分割

Adlaire Git Repository 本体とデータ領域を分割する。本体は差し替え可能な system 側、DB、Git bare repositories、config、secrets、logs、backups、manifests は保護対象 data 側として扱う。

#### 13.6.1 実施対象

- system 側と data 側の責務整理
- Docker 運用と binary 直実行で共通する data 側構成の整理
- host filesystem を data 正本とする運用方針の確認
- Docker named volume を data 正本にしない禁止事項の確認
- deploy、backup、verify、rollback の対象整理

#### 13.6.2 system 側

- Deno single binary
- Docker image
- Docker container
- docker compose
- systemd service または同等の起動管理定義
- deploy script

#### 13.6.3 data 側

- libSQL database
- 移行元 SQLite database
- Git bare repositories
- config
- secrets
- logs
- backups
- manifests

#### 13.6.4 完了条件

- system 側と data 側の保存対象、責務、バックアップ対象を説明できる。
- Docker 運用と binary 直実行で同じ data 側構成を維持できる。
- data 側が container lifecycle に依存していない。
- デプロイポリシー、技術要件ポリシー、3類マスター仕様書と矛盾していない。

#### 13.6.5 Phase 8.5 実装完了範囲

Phase 8.5 では、Adlaire Git Repository 本体の設定、デプロイ雛形、検証導線を system / data 分離構成へ整合した。

実装完了範囲は以下とする。

- `ADLAIRE_APP_ROOT` から `ADLAIRE_SHARED_DIR`、`ADLAIRE_DATA_DIR`、標準 libSQL database path、Git bare repository root を導出する。
- 標準 libSQL database を `shared/data/database/adlaire.libsql` に配置する。
- Git bare repository root を `shared/data/repositories` に配置する。
- アプリケーション起動時に、data 側の database directory と repository root を作成する。
- `scripts/deploy/` の release / current を `system/` 側へ移し、deploy log / manifests / backups / config / secrets / logs / data を `shared/` 側へ分離する。
- `backup.sh` の対象に secrets、logs、manifests、現行 system release 参照を含める。
- `verify-server.sh` と `verify-release.sh` で system 側と data 側の標準配置を確認する。
- トップページと Operations status の現行フェーズ表記を `Phase 8.5 / v.1.9` へ更新する。
- Phase 8.5 の system / data 分離を確認する統合テストと、設定既定値を確認する単体テストを更新する。

#### 13.6.6 Phase 8.5 検証範囲

Phase 8.5 の標準検証は `tools/check-adlaire-git-repository.sh` とする。

最低限、以下を確認する。

- `git diff --check`
- `tools/check-adlaire-git-repository.sh`
- `scripts/docker/verify-build.sh`
- deploy script 群の `sh -n`
- `ADLAIRE_APP_ROOT`、`ADLAIRE_SHARED_DIR`、`ADLAIRE_DATA_DIR`、`ADLAIRE_REPOSITORY_ROOT` の設定導出
- `shared/data/database` と `shared/data/repositories` の作成
- 旧 `APP_ROOT/releases`、`APP_ROOT/current`、`APP_ROOT/deploy/deploy.log` 参照が deploy script に残っていないこと

### 13.7 Phase 8.7: 安定化

バグ修正、検証強化、ドキュメント整合性を行う。

#### 13.7.1 実施対象

- DB 標準化に関するバグ精査
- Database Gateway 境界に関するバグ精査
- system / data 分離に関するバグ精査
- backup、restore、rollback の説明可能性確認
- 主要 workflow の検証強化
- 意味のあるテストまたは代替検証の整理
- ドキュメント整合性向上

#### 13.7.2 Phase 8.7 実施完了範囲

Phase 8.7 では、Phase 8 系の安定化として以下を実施した。

- トップページと Operations status の現行フェーズ表記を `Phase 8.7 / v.1.9` へ更新する。
- `backup.sh` が `system/current` の symlink だけではなく、解決後の現行 system release 実体をバックアップするように修正する。
- `rollback.sh` の実引数である `TARGET_RELEASE` と、仕様書・README のロールバック例を整合する。
- DB 標準化、Database Gateway 境界、system / data 分離、backup / rollback に関する検証導線を強化する。
- Phase 8.7 の安定化作業に伴い、1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、README、実装、テスト、検証導線、バージョン表記の整合性を確認した。

#### 13.7.3 Phase 8.7 検証結果

Phase 8.7 の標準検証では、以下を確認した。

- DB driver 直接利用、未承認依存、Node.js project files、旧 system / data path、rollback 例の不整合を精査した。
- `tools/check-adlaire-git-repository.sh` は静的チェックを通過し、ローカル Deno 不在の既知条件で停止した。
- 承認済み固定 Deno Docker image による `scripts/docker/verify-build.sh` は成功した。
- Docker 検証では `deno task fmt`、`deno task lint`、`deno task test`、`deno task compile`、`deno task compile:release` が成功した。
- テスト結果は `39 passed | 0 failed` である。

#### 13.7.4 完了条件

- DB 標準化、Database Gateway 境界、system / data 分離に関する既知バグが残っていない。
- 主要 workflow と DB 永続化境界を、意味のあるテストまたは代替検証により説明できる。
- 確信にも説明にも寄与しない冗長なテストを追加していない。
- Phase 9 の安定版判定へ進むための既知制約、対象外、リスク、検証未完了項目を説明できる。
- リポジトリ全体の整合性確認と整合性向上を完了している。

---

## 14. Phase 9: 安定版判定

### 14.1 基準バージョン

Phase 9 の基準バージョンは `v.2.10` とする。

### 14.2 目的

Phase 8 までの成果を対象に、安定版判定を行う。

### 14.3 リリース方針

Phase 9 は安定版判定フェーズである。安定版リリース対象にする場合は、リリース提案、検証範囲、成果物、配置先を提示し、ユーザー承認を得る。

Phase 9 はリリース実行を自動承認しない。tag 作成、GitHub Releases 作成、成果物配置、release notes 公開、`main` 反映は、別途ユーザー承認を得るまで行わない。

### 14.4 判定対象

- Phase 8 の libSQL 標準DB仕様
- Phase 8.1 の本体整合性
- Phase 8.5 の system / data 分離
- Phase 8.7 の安定化
- Database Gateway、Repository 層、driver 層の責務境界
- backup、restore、rollback の説明可能性
- 主要 workflow の検証結果
- 既知バグ、既知制約、対象外機能
- リポジトリ全体の整合性

### 14.5 リリース禁止条件

以下に該当する場合、Phase 9 で安定版リリースしてはならない。

- Phase 8 系の完了条件を満たしていない。
- 既知バグが残っている。
- DB 標準化、Database Gateway 境界、system / data 分離に矛盾がある。
- backup、restore、rollback の説明可能性が不足している。
- 主要 workflow の検証結果を説明できない。
- 3類マスター仕様書、2類ポリシー、マスター開発計画、README、実装、テスト、検証導線、バージョン表記、Pull Request 説明に矛盾が残っている。
- リリース提案、検証範囲、成果物、配置先、自動実行範囲を提示していない。
- ユーザー承認を得ていない。

### 14.6 成果物と配置

安定版リリースを行う場合、成果物の主配置は GitHub Releases とする。

標準 Linux binary は ARM64 と x86_64 の2種類を対象とする。Deno single binary を正本成果物とし、Docker image は正本 binary を同梱する運用選択肢として扱う。

リリース履歴の正本は GitHub Releases とする。リポジトリ内に変更履歴、リリース履歴、release notes 元資料、リリース配置記録、リリース用 manifest、リリース用 checksum を履歴ファイルとして保持しない。

### 14.7 完了条件

- Phase 8 系の完了条件を満たしている。
- リリース禁止条件に該当しないことを説明できる。
- 安定版リリースを行う場合は、別途ユーザー承認を得ている。
- GitHub Releases をリリース履歴の正本とする方針に従っている。
- Deno single binary、必要な checksum、manifest、release notes、Docker image の扱いを説明できる。
- リポジトリ整合性確認と整合性向上を完了している。

### 14.8 Phase 9 実施範囲

Phase 9 では、ユーザー承認に基づき、追加のバグ精査と修正ゼロ化、安定版判定、リリース準備を行う。

実施範囲は以下とする。

- Phase 8 系成果に対する追加バグ精査
- 確認されたバグの修正と再発防止テスト追加
- 追加バグが確認されない状態、または確認済みバグが修正済みである状態の説明
- `deno.json` 内部バージョン `2.10.0` と正式表記 `v.2.10` の整合
- ARM64 と x86_64 の Linux binary 成果物名の `v2.10` 整合
- deploy / rollback の既定リリースバージョンと説明の `v.2.10` 整合
- GitHub Releases を主配置とするリリース準備
- リポジトリ全体の整合性確認と整合性向上

Phase 9 PR が GitHub の `main` へ取り込まれるまで、tag 作成、GitHub Releases 作成、成果物配置、release notes 公開は実施しない。

---

## 15. Phase 10: Adlaire Deploy 着手

### 15.1 基準バージョン

Phase 10 の基準バージョンは `v.2.11` とする。

### 15.2 目的

Phase 10 では、Adlaire Deploy を Adlaire Git Repository の付随システムとして着手する。

Adlaire Deploy は Adlaire Git Repository 本体へ統合しない。Adlaire Deploy 専用 database を持たず、Adlaire Git Repository 本体の libSQL database へ直接接続しない。`adlaire-deploy` CLI、JSON deployment manifest、Deno single binary 正本成果物の取得、checksum 検証、preflight、配置、backup、rollback、plan / result / error 記録を扱い、GitHub Releases asset upload の成否だけに依存しない配布・取得・検証・展開導線を確立する。

VPS、self-host、専用サーバーを対象にする場合は、SSH 使用可能を最低必須条件とする。

### 15.3 実装対象

- `docs/specs/Adlaire_Deploy_Specification.md` の3類マスター仕様書化
- Adlaire Deploy の DB 不使用定義
- `adlaire-deploy` CLI の実行主体定義
- 標準コマンドの定義
- JSON deployment manifest の読み込み
- JSON deployment manifest の構文検証
- 対象 version の検証
- 対象 architecture 判定
- Deno single binary 成果物の取得元定義
- local artifact 参照
- GitHub Releases artifact 参照
- checksum 検証
- artifact size、permission、実行可能性の検証
- SSH 接続事前検証
- remote 必須コマンド検証
- target root、system root、data root、backup root の path 検証
- system / data 分離構成の検証
- data 側保護対象の列挙
- system release directory への配置計画作成
- `system/current` 切り替え計画作成
- data 側 backup 計画作成
- database file を含む data file の backup 対象化
- health check 計画作成
- rollback 計画作成
- dry-run 実行
- deploy plan file の生成
- verification result file の生成
- deployment result manifest の生成
- error 分類の定義
- error report の生成
- security / data 保護仕様の定義
- `scripts/deploy/` 配下の標準デプロイ雛形との責務整理

### 15.4 対象外

- Adlaire Deploy 専用 database
- Adlaire Git Repository 本体 database への直接接続
- database schema 変更
- database migration 実行
- database query 実行
- database restore 自動実行
- Docker image 配布の正式化
- Container registry
- GitHub Actions
- 外部デプロイフレームワーク
- Node.js / npm 前提ツール
- 初回から本番サーバへ破壊的変更を行う remote deploy 実行
- 本番データ復元の自動実行
- rollback の data 復元自動実行
- SSH を使用できない VPS、self-host、専用サーバーへの標準対応
- 複数サーバー同時 rolling deploy
- blue-green deployment
- zero downtime 切替
- GUI
- SaaS 型クラウドデプロイ基盤

### 15.5 検証範囲

- Adlaire Deploy 仕様書、デプロイポリシー、マスター開発計画、README の整合
- Adlaire Deploy の実行主体、標準コマンド、manifest、artifact、target / SSH、preflight、出力、error 分類、security / data 保護の整合
- Adlaire Deploy が DB 不使用であること
- Adlaire Deploy 専用 database を作成していないこと
- Adlaire Git Repository 本体 database へ直接接続していないこと
- Deno single binary 正本成果物方針との整合
- Docker image 配布を正式化しない方針との整合
- Node.js runtime、npm ecosystem、外部デプロイフレームワークを導入していないこと
- dry-run が本番データまたは system/current を変更しないこと
- checksum 不一致を拒否できること
- 成果物欠落時に失敗理由を説明できること
- SSH 接続前提を検証できること
- system 側と data 側の分離を破らないこと
- database file を data file としてのみ扱い、中身を解釈していないこと
- `scripts/deploy/` 配下の標準デプロイ雛形との関係が説明できること

### 15.6 完了条件

- Adlaire Deploy が3類マスター仕様書として定義されている。
- Adlaire Deploy のマスター仕様が仕様固定済みとして扱える。
- Adlaire Deploy の実行主体、標準コマンド、manifest、artifact、target / SSH、preflight、出力、error 分類、security / data 保護が定義されている。
- Adlaire Deploy が DB 不使用の付随システムとして定義されている。
- Adlaire Deploy が保留候補ではなく Phase 10 の正式着手対象として整理されている。
- Phase 10 の実装対象、対象外、検証範囲、完了条件が本書に定義されている。
- Adlaire Git Repository 本体と Adlaire Deploy の責務境界が、統合ではなく付随システムとして説明できる。
- GitHub Releases は配置先候補の一つであり、唯一の配布経路として固定していない。
- VPS、self-host、専用サーバーでは SSH 使用可能を最低必須条件として定義している。
- DB 不使用で実装可能な機能が Phase 10 実装対象として整理されている。
- `v.2.10` の公開配布保留と Phase 10 着手方針が矛盾していない。
- リポジトリ整合性確認と整合性向上を完了している。

---

## 16. 実装着手前チェック

各フェーズの実装に着手する前に、以下を確認する。

- `AGENTS.md` を読んでいる。
- 2類ドキュメント群のうち、ドキュメント憲章と作業責務に対応する責務別ポリシーを読んでいる。
- `docs/specs/Auris_System_Design.md` を読んでいる。
- 対象となる個別3類マスター仕様書を読んでいる。
- 対象フェーズの目的、対象、対象外、検証範囲を提示している。
- ソースコード実装についてユーザー承認を得ている。
- `main` へ直接 push せず、PR 経由で取り込む前提で作業している。

---

## 17. 計画変更手順

本書を変更する場合は、以下の順序で進める。

1. 1類ルールブックに違反しないことを確認する。
2. 2類ポリシーとの整合を確認する。
3. 3類マスター仕様書との整合を確認する。
4. 変更理由を明確にする。
5. ユーザー承認を得る。
6. 承認済み範囲のみ変更する。
7. コミットする。
8. PR 経由で `main` に取り込む。

---

## 18. 改訂履歴

| バージョン | 対象フェーズ | 基準バージョン | 内容 |
|---:|---|---:|---|
| v.0.1 | Phase 0 | v.0.1 | マスター開発計画の初期策定 |
| v.0.2 | Phase 1 | v.0.2 | Phase 1 実装完了、Deno ランタイム環境、主要検証結果、Phase 2 着手条件を反映 |
| v.0.3 | Phase 2 | v.0.3 | 計画バージョンとフェーズ基準バージョンを分離し、Phase 2 着手前仕様、実装順序、必須検証を追加 |
| v.0.4 | 全フェーズ共通 | - | 開発計画は3類マスター仕様書に基づいて策定される原則を明記 |
| v.0.5 | Phase 2 | v.0.3 | 仕様未確定項目をPhase 2計画から分離 |
| v.0.6 | 全フェーズ共通 | - | GitHub 互換方針の対象となる機能体系、用語、主要ワークフローを反映 |
| v.0.7 | 全フェーズ共通 | - | UI、画面デザイン、画面レイアウト、視覚表現を GitHub 互換対象外として明記 |
| v.0.8 | 全フェーズ共通 | - | 機能互換は GitHub 互換方針とする表現へ統一 |
| v.0.9 | 全フェーズ共通 | - | オープンソース Git プロバイダーは機能面の参考対象であり互換方針ではないことを明記 |
| v.0.10 | 全フェーズ共通 | - | 基本的な機能互換は GitHub 互換基準、OSS Git プロバイダーはサブの機能互換インスパイア対象と明記 |
| v.0.11 | 全フェーズ共通 | - | マスター実装機能候補リストとの関係を明記 |
| v.0.12 | 全フェーズ共通 | - | TypeScript は6系の最新安定版を採用方針とすることを明記 |
| v.0.13 | 全フェーズ共通 | - | TypeScript 以外の採用技術も最新安定版を採用方針とすることを明記 |
| v.0.14 | 全フェーズ共通 | - | 承認済み固定採用バージョンを明記 |
| v.0.15 | 全フェーズ共通 | - | マスター実装機能候補リストとマスター仕様書の役割重複を整理 |
| v.0.16 | 全フェーズ共通 | - | 2類責務別ポリシー群への参照整合を反映 |
| v.0.17 | 全フェーズ共通 | - | 開発計画の改訂単位をフェーズ単位に統一 |
| v.0.18 | 全フェーズ共通 | - | ドキュメント憲章と2類ドキュメント群の表記整合を反映 |
| v.0.19 | 全フェーズ共通 | - | 安定版未リリース中は `v.0.x` 系を維持するバージョン整合を反映 |
| v.0.20 | Phase 2 | v.0.3 | Phase 2 の Issue 最小実装開始、対象範囲、対象外、検証範囲を反映 |
| v.0.21 | Phase 2 | v.0.3 | Phase 2 の Pull Request、Code Review、Issue、Wiki、Webhook、Release、REST API 基本機能の最小実装完了範囲と検証結果を反映 |
| v.0.22 | Phase 2 | v.0.3 | リポジトリ全体の Phase 2 表記、実行コマンド例、候補リスト、上位仕様との整合性確認を完了し、Phase 2 完了へ更新 |
| v.0.23 | 全フェーズ共通 | - | フェーズ完了時のリポジトリ整合性確認を全フェーズ共通の義務として明記 |
| v.0.24 | 全フェーズ共通 | - | Deno 標準ライブラリ優先、承認済み JSR 公開ライブラリ採用可、未承認 JSR 採用禁止、クローズド資産の JSR 公開禁止、Adlaire 内製 Deno Module Registry 方針を反映 |
| v.0.25 | Phase 3 | v.0.4 | Adlaire 内製 Deno Module Registry を中長期計画かつ早期の本体実装対象として Phase 3 へ反映 |
| v.0.26 | 全フェーズ共通 | - | JSR 公開ライブラリであっても npm 互換、npm specifier、Node.js / npm ecosystem 依存を前提とするものは採用禁止であることを明記 |
| v.0.27 | Phase 3 | v.0.4 | 汎用 Package registry は今後の計画として検討するが、現時点では保留方針であり Phase 3 実装対象外であることを明記 |
| v.0.28 | Phase 5 | v.0.6 | Phase 5 にデザイン関連の改良・改修方針を追加 |
| v.0.29 | Phase 5 / Phase 6 | v.0.6 / v.0.7 | 5系フェーズを安定版リリース対象外とし、6系フェーズを大規模バグ修正、ドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズとして定義 |
| v.0.30 | Phase 3 / Phase 4 / Phase 8 | v.0.4 / v.0.5 / v.0.9 | マスター実装機能候補リストに合わせ、Phase 3 を最小運用と内製 Deno Module Registry、Phase 4 を統合・仕様整合・移行準備、Phase 8 を長期運用準備と保留解除候補再評価へ再編 |
| v.0.31 | 全フェーズ共通 | - | Adlaire Git Repository 本体は self-host、VPS、専用サーバーを標準運用基盤とし、当時のクラウド実行環境と libSQL 系クラウドDBサービスを将来候補として保留する旧方針を反映 |
| v.0.32 | Phase 3 | v.0.4 | Phase 3 を実装中へ更新し、Organizations 最小運用の実装済み範囲、未実装範囲、検証範囲を反映 |
| v.0.33 | Phase 3 | v.0.4 | Teams、Projects、Adlaire 内製 Deno Module Registry、Webhook event dispatch、Audit log 参照、Operations status、libSQL 再評価参照の最小運用を実装し、Phase 3 完了へ更新 |
| v.0.34 | Phase 4 | v.0.5 | Phase 1 から Phase 3 までの統合として Organization 所有 private repository の権限境界を Issue、Pull Request、Code Review、Wiki、Webhook、Release へ統合し、仕様整合、移行境界、検証導線を整理して Phase 4 完了へ更新 |
| v.0.35 | 全フェーズ共通 | - | フェーズ単位でドキュメント等の整合性向上を必須化し、リポジトリ整合性が取れていない状態で次フェーズへ進むことを禁止する方針を反映 |
| v.0.36 | Phase 5 | v.0.6 | Web UI の情報設計、画面レイアウト、視覚表現、操作導線、アクセシビリティ、可読性を改善し、Phase 5 完了へ更新 |
| v.0.37 | Phase 6 | v.0.7 | 安定版リリース準備として、既知バグ確認、ドキュメント整合性向上、移行・ロールバック前提整理、検証導線強化を行い、Phase 6 完了へ更新 |
| v.0.38 | 全フェーズ共通 | - | リリース提案、GitHub Releases を主配置とするリリース配置、承認後のリリース自動化方針への参照を反映 |
| v.0.39 | Phase 6 | v.0.7 | Document Index と AdlaireGroup 共通 `tpl-governance` 雛形を Phase 6 のドキュメント整合性向上として整理 |
| v.0.40 | Phase 6 | v.0.7 | 本来の Phase 6 作業として、既知バグ確認、主要 workflow 検証、標準検証結果を再確認 |
| v.0.41 | Phase 6 | v.0.7 | Phase 6 バグ精査で確認した認証、権限、Git Smart HTTP、SQLite 外部キー、入力エラー応答、重複応答、Registry 一覧漏えいを修正し、再発防止テストと標準検証結果を反映 |
| v.0.42 | Phase 6 | v.0.7 | Phase 6 追加バグ精査で確認した管理者追加、JSON Content-Type、HTTP Authorization scheme、Webhook secret API 露出、Team member の Organization member 境界漏れを修正し、再発防止テストを追加 |
| v.0.43 | Phase 6 | v.0.7 | Phase 6 追加バグ精査後のドキュメント整合性向上として、仕様書の既知バグ修正範囲、プロジェクト構成、Document Index の状態表記を整合 |
| v.0.44 | 全フェーズ共通 | - | 当時の方針として Docker を全用途で例外なく採用禁止とし、開発・検証・本番・デプロイをホストOS実行と Deno single binary 方針へ統一 |
| v.0.45 | 全フェーズ共通 / Phase 8 | v.1.9 | 本番サーバ環境へのデプロイ自動化を標準方針とし、バックアップ、検証、ロールバック前提を含める方針を反映 |
| v.0.46 | 全フェーズ共通 / Phase 8 | v.1.9 | デプロイ実行方式の採用区分と、ローカル Deno 不在時の VPS 実行系検証方針を反映 |
| v.0.47 | 全フェーズ共通 | - | AdlaireGroup 共通ガバナンス雛形の正本位置づけと、プロジェクト変更時の雛形更新判定を反映 |
| v.0.48 | Phase 8 | v.1.9 | `scripts/deploy/` 配下に標準デプロイ雛形を追加し、shell script + SSH + systemd によるデプロイ、バックアップ、検証、通常ロールバック導線を具体化 |
| v.1.9 | Phase 8 | v.1.9 | PR #29 マージ後のリポジトリ整合性向上として、個別3類マスター仕様書の旧デプロイ、バックアップ、ログ、ストレージ記述を標準デプロイ雛形と2類デプロイポリシーへ整合 |
| v.1.10 | Phase 8 | v.1.9 | VPS デプロイ前提のリポジトリ整合性向上として、安定版リリースの標準 Linux binary を ARM64 と x86_64 の2種類に統一 |
| v.1.11 | Phase 8 | v.1.9 | 検証、テスト、ビルド、Deno single binary 生成に限定して Docker を補助採用し、本番、デプロイ、運用基盤、永続データ管理では Docker 不採用を維持する方針へ改訂 |
| v.1.12 | 全フェーズ共通 | - | Pull Request 作成後のユーザー側 merge、後続作業開始時の merge 完了確認、作業ブランチクローズ、ローカル・リモート整合性確認を標準運用として明記 |
| v.1.13 | 全フェーズ共通 / Phase 8 | v.1.9 | 本番標準運用方式を Docker のみに統一し、1 VPS 上で Docker system 側と host filesystem data 側を同居させる最小構成、Deno single binary 維持、保護対象 data 分離方針を明記 |
| v.1.14 | 全フェーズ共通 / Phase 8 | v.1.9 | Deno single binary を正本成果物とし、Docker は正本 binary を image に同梱して実行する運用選択肢の一つへ再整理。Docker 使用時も非 Docker の binary 直実行時も同じ system / data 分離構成に統一 |
| v.1.15 | 全フェーズ共通 / Phase 8 | v.1.9 | 標準データベースを libSQL へ変更し、SQLite は互換・移行元・最小ローカル検証用として保持する方針へ整理 |
| v.1.16 | Phase 8 | v.1.9 | 3類マスター仕様書を現行正本仕様、フェーズ別履歴、保留候補、対象外範囲に分離し、マスター仕様完成版として整合 |
| v.1.17 | Phase 8 | v.1.9 | Adlaire Deploy を公式付随システムとして定義し、個別マスター仕様書、連携境界、既存デプロイ雛形との関係を整理 |
| v.1.18 | Phase 8 | v.1.9 | Adlaire Deploy を仕様未定の将来候補へ戻し、当面は Adlaire Git Repository 本体優先の長期運用準備へ整理 |
| v.1.19 | Phase 8 / Phase 9 | v.1.9 / v.2.10 | Phase 8 をDBフェーズへ再定義し、Phase 8.1本体整合性、Phase 8.5システム分割、Phase 8.7安定化、Phase 9安定版判定へ整理 |
| v.1.20 | Phase 8 / Phase 9 | v.1.9 / v.2.10 | Phase 8 をDB仕様完成、Phase 8.1を本体整合性、Phase 8.5をsystem/data分離、Phase 8.7を安定化、Phase 9を安定版判定として、対象、対象外、検証範囲、完了条件まで具体化 |
| v.1.21 | Phase 8 | v.1.9 | Phase 8 当時の旧方針として、npm 互換 libSQL client を用いた driver 実装、標準DB設定、検証導線、デプロイDB配置例を整合 |
| v.1.22 | Phase 8.1 | v.1.9 | Phase 8.1 本体整合性として、当時の現行フェーズ表記、SQLite 移行元確認用ゲート、旧 npm 互換 libSQL client 解決固定用の `deno.lock`、旧 native loader 用権限、Database Gateway 境界、README、検証導線、Pull Request 説明の整合対象を反映 |
| v.1.23 | Phase 8.5 | v.1.9 | Phase 8.5 システム分割として、`ADLAIRE_APP_ROOT` / `ADLAIRE_SHARED_DIR` から data 側標準パスを導出し、deploy / backup / verify / rollback 雛形を `system/` と `shared/` へ整合 |
| v.1.24 | Phase 8.7 | v.1.9 | Phase 8.7 安定化として、現行フェーズ表記、現行 system release 実体バックアップ、rollback 例、検証導線、ドキュメント整合性を更新 |
| v.2.10 | Phase 9 | v.2.10 | Phase 9 安定版判定・リリース準備として、バグ修正ゼロ化、現行フェーズ表記、内部バージョン、release binary 名、deploy / rollback 例、検証導線、ドキュメント整合性を更新 |
| v.2.11 | Phase 10 | v.2.11 | Adlaire Deploy を付随システムとして着手し、個別3類マスター仕様書、実装対象、対象外、検証範囲、完了条件を定義 |
| v.2.12 | Phase 10 | v.2.11 | Adlaire Deploy を DB 不使用、SSH 使用可能を最低必須条件、DB 不使用で実装可能な機能を Phase 10 対象とする仕様へ改訂 |
| v.2.13 | Phase 10 | v.2.11 | Adlaire Deploy の実行主体、標準コマンド、JSON manifest、artifact、SSH target、preflight、出力、error、security / data 保護、scripts/deploy 移行境界を仕様固定 |
| v.2.14 | Phase 10 / Phase 8 | v.2.14 / v.1.9 | Deno Deploy 環境対応を白紙化し、オンプレミス、VPS、専用サーバー前提へ再固定。標準採用を Deno 標準ライブラリ（`jsr:@std/*`）に限定し、libSQL は npm 依存を含まない外部依存例外、npm 互換 package と全 npm 依存は禁止として整合 |
