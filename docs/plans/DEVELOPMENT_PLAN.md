# マスター開発計画

**位置づけ**: マスター開発計画
**対象**: Auris / Adlaire Git Repository 全体
**計画バージョン**: v.0.39
**現行フェーズ基準バージョン**: v.0.7
**ステータス**: Phase 6 完了

---

## 1. 目的

本書は、Auris / Adlaire Git Repository の実装をフェーズ単位で進めるための **マスター開発計画** である。

本書は、3類マスター仕様書に基づいて策定する。開発計画は仕様そのものを決める文書ではなく、マスター仕様書に定義された仕様を、フェーズ、実装順序、検証範囲、完了条件へ落とし込むための文書である。

実装は、1類ルールブック、2類ポリシー、3類マスター仕様書に従い、本書で定義したフェーズ計画に基づいて進める。

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
- Phase 9、Phase 19、Phase 29 のような 9系フェーズは補助的なリリース判定フェーズとし、ケースバイケースで安定版リリースフェーズになる場合と、ならない場合がある。
- 9系フェーズを安定版リリースフェーズとして扱う場合は、マスター開発計画と2類ポリシーに明記し、ユーザー承認を得る。
- リリース提案、リリース配置、リリース成果物、リリース自動化は `docs/policies/RELEASE_POLICY.md` に従う。リリース配置は GitHub Releases を主配置とし、リポジトリ内には軽量な配置記録、release notes 元資料、manifest、checksum、運用手順を必要に応じて配置する。
- ドキュメント参照導線は `docs/DOCUMENT_INDEX.md` を索引として確認する。AdlaireGroup 共通の最上位ドキュメント雛形は `docs/tpl-governance/` 配下で管理し、現行プロジェクトの正本とは分離する。
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
- Adlaire Git Repository 本体の標準運用基盤は、self-host、Docker、VPS、専用サーバーを前提とする。
- Deno Deploy、Turso Cloud、その他 libSQL 系クラウドDBサービスは標準採用ではなく、将来候補として保留する。検討する場合は、補助API、管理機能、Webhook 受信、読み取り専用ミラー等の補助的用途を優先して評価し、Git repository 実体保存、Git 操作、永続ファイル、バックアップ、復旧、データ所在、認証情報管理、運用費用、Deno 固定バージョン、Node.js / npm 非依存方針との整合を確認する。
- Turso Cloud 等のクラウドDBサービスを検討する場合も、Database Gateway と内製 `libsql` driver の接続先差し替えとして扱い、アプリケーション上位層へサービス固有APIやサービス名を露出してはならない。

---

## 4. フェーズ別バージョン方針

フェーズ番号は累積方式とし、Phase 0 から単調に進める。

安定版リリース後もフェーズ番号を戻してはならない。Phase 7 の次は Phase 8、Phase 17 の次は Phase 18、Phase 27 の次は Phase 28 として扱う。

`Major` は累積フェーズ番号ではなく、安定版リリース系列を表す。

初回安定版リリース前は、Phase が進んでも `Major` を `0` のまま維持する。初回安定版リリースとして承認されたフェーズで、`Major` を `1` へ進める。

安定版リリースを表す `Major` 更新は、7系フェーズをデフォルトとし、9系フェーズは補助的にケースバイケースで扱う。5系フェーズと6系フェーズでは `Major` を更新しない。

| フェーズ | 基準バージョン | ステータス | 扱い |
|---|---:|---|---|
| Phase 0 | v.0.1 | 完了 | 実装前の文書整備、設計整理、計画策定 |
| Phase 1 | v.0.2 | 実装完了・開発検証段階 | Git 基本機能、認証、Repository CRUD、SQLite 基盤、Docker/Deno 実行環境 |
| Phase 2 | v.0.3 | 完了 | GitHub 互換の Pull Request、Code Review、Issue、Wiki、Webhook、Release、REST API 基本機能。WYSIWYG エディター実装時期は未定 |
| Phase 3 | v.0.4 | 完了 | Organizations 最小運用、Teams 最小運用、Projects 最小運用、Adlaire 内製 Deno Module Registry 最小実装、運用基盤拡張 |
| Phase 4 | v.0.5 | 完了 | Phase 1 から Phase 3 までの統合、仕様整合、移行準備、検証導線整理 |
| Phase 5 | v.0.6 | 完了 | 補助的リリース判定、デザイン関連の改良・改修。安定版リリース対象外 |
| Phase 6 | v.0.7 | 完了 | 大規模バグ修正、ドキュメント整合性向上をデフォルト方針とする安定版リリース準備フェーズ |
| Phase 7 | v.0.8 / 安定版承認時 v.1.8 | 未着手 | デフォルト安定版リリースフェーズ |
| Phase 8 | v.0.9 / 初回安定版済みの場合 v.1.9 | 未着手 | 7系安定版判定後の長期運用準備、保留解除候補の再評価、検証 |
| Phase 9 | v.0.10 / 初回安定版済みの場合 v.1.10 | 未着手 | 補助的リリース判定フェーズ。ケースバイケースで安定版対象 |

上記は各フェーズの基準バージョンである。表の `Major` は安定版リリース系列であり、累積フェーズ番号ではない。初回安定版リリース前は `v.0.x` 系を維持する。

フェーズ内でドキュメント更新、バグ修正、検証追加、仕様整理が発生する場合は、`Minor` を累積で進める。次フェーズへ進む場合も、`Minor` は直前の正式記録バージョンより大きい累積値にする。

例:

```text
v.0.1 -> v.0.2 -> v.0.3 -> v.0.4 -> v.0.5
```

初回安定版リリースとして承認された場合の例:

```text
v.0.7 -> v.1.8
```

`Major` を更新する場合も、`Minor` はリセットしない。フェーズ番号、`Major`、`Minor` のいずれも過去の値へ戻してはならない。

### 4.1 採用バージョン決定方針

開発言語、ランタイム、データベース、Git、Docker、外部コマンド、外部ライブラリ、フレームワーク、採用バージョン、固定バージョンは、ユーザーが決定する。

採用バージョンの基本方針は、各技術の **最新の安定版** とする。

Deno、SQLite、libSQL、Git、Docker、Docker Compose、Deno 標準ライブラリ、Deno で利用する外部コマンド、例外採用する外部ライブラリ、その他ユーザー承認を得て採用する技術は、採用または更新の時点で公式情報を確認し、最新の安定版を採用候補とする。

Deno 標準ライブラリを最優先候補とする。ただし、Deno 標準ライブラリの個別モジュールを採用する場合も、必要性、対象モジュール、固定バージョン、検証方法を提示し、ユーザー承認を得る。

JSR レジストリの公開ライブラリは採用可能とする。ただし、ユーザー承認を得るまで採用禁止とする。JSR レジストリの公開ライブラリであっても、npm 互換、`npm:` specifier、`package.json`、`node_modules`、Node.js runtime、npm ecosystem への依存を前提とするものは採用禁止とする。JSR へ公開する package は、公開可能なオープンソースコードであることを前提とし、クローズドライセンス、内部専用、非公開資産は JSR へ公開してはならない。

クローズドな Adlaire 内製 Deno package の配布は、短期的には Private Git + Deno import、Deno workspace、vendor 管理を候補とし、中長期的には Adlaire 内製 Deno Module Registry を標準目標とする。Adlaire 内製 Deno Module Registry は、Adlaire Git Repository 本体へ早期実装する方針とする。

npm registry 互換レジストリは、Node.js / npm ecosystem リスクと衝突するため標準採用しない。

TypeScript は **6系の最新安定版** を採用方針とする。Deno に同梱される TypeScript を利用する場合も、TypeScript 6系の最新安定版であることを採用条件とする。

承認済み固定採用バージョンは以下とする。

| 技術 | 固定採用バージョン | 扱い |
|---|---:|---|
| Deno | `v2.9.5` | 標準ランタイム |
| TypeScript | `v6.0.3` | 6系の最新安定版として採用 |
| SQLite | `v3.53.4` | Phase 1 標準データベース |
| libSQL | `libsql-server v0.24.32` | 将来移行候補。Phase 1 の実装対象外 |
| Git | `v2.55.0` 系 | Git 操作用外部コマンド |
| Docker Engine | `v29.7.2` | 開発・検証用コンテナ基盤 |
| Docker Compose | `v5.4.0` | 開発・検証用 compose |

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
- Deno ランタイムによる実行環境
- Dockerfile / compose による Docker 上の Deno 実行環境
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
- Docker 前提の本番運用固定化

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
- Docker 上の Deno ランタイム起動と `/health`

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
- Docker 上の Deno ランタイム環境、永続データ volume、healthcheck
- 意味のある単体テスト、統合テスト、E2E 検証

### 6.8 検証結果

Phase 1 の完了判定では、以下の検証を必須結果として扱う。

- `deno task fmt --check`
- `deno task lint`
- `deno task test`
- `deno task compile`
- Docker build
- Docker コンテナ内の Deno / Git / SQLite / Git Smart HTTP backend 確認
- Docker コンテナ起動後の `/health` 確認
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
- WYSIWYG エディター本体の実装
- WYSIWYG エディター連携の正式採用
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

WYSIWYG エディターは、実装時期、採用Phase、連携範囲が未定である。Phase 2 の実装対象へ含める場合は、事前に3類マスター仕様書、マスター開発計画、検証範囲を改訂し、ユーザー承認を得る。

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
- Team の作成、一覧、member 追加、member 一覧
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

- Docker build 成功
- `deno fmt --check` 成功
- `deno lint` 成功
- `deno test`: 22 passed / 0 failed
- `deno compile` 成功
- `adlaire-git-repository-check-ok`

---

## 9. Phase 4: 補助的リリース判定前統合

### 9.1 基準バージョン

Phase 4 の基準バージョンは `v.0.5` とする。

### 9.2 目的

Phase 1 から Phase 3 までの開発成果を統合し、補助的リリース判定フェーズである Phase 5 に進むための仕様整合、バグ修正、移行準備、検証整理を行う。

### 9.3 リリース方針

Phase 4 は安定版リリースフェーズではない。Phase 4 では例外なく安定版リリース方針を持たない。

### 9.4 実施対象

- Phase 1 から Phase 3 までの統合確認
- 1類ルールブック、2類ポリシー、3類マスター仕様書、マスター開発計画、マスター実装機能候補リストの仕様整合
- SQLite / libSQL 移行可能性を維持するための永続化境界確認
- 移行手順、バックアップ、復旧、ロールバック前提の整理
- 補助的リリース判定前の検証導線整理

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

## 10. Phase 5: 補助的リリース判定

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

- Phase 1 から Phase 4 までの成果に対する補助的リリース判定材料が整理されている。
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

Phase 5 の UI 表示契約は、Phase 6 以降の安定版準備 baseline として `tests/integration/phase6_release_preparation_test.ts` に継承する。

---

## 11. Phase 6: 安定版リリース準備

### 11.1 基準バージョン

Phase 6 の基準バージョンは `v.0.7` とする。

### 11.2 目的

Phase 5 の補助的リリース判定とデザイン関連改良・改修を受けて、大規模なバグ修正とドキュメント整合性向上をデフォルト方針として行う。必要に応じて移行準備、検証強化、技術負債整理も行う。Phase 6 は、Phase 7 のデフォルト安定版リリース判定へ進むための安定版リリース準備フェーズである。

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
- AdlaireGroup 関連プロジェクト、プロダクトへ共通展開する最上位ドキュメント雛形として `docs/tpl-governance/` を整備し、共通コアと個別具体化用 policy slots を分離した。
- 既知バグは標準検証と主要 workflow test の範囲では確認されていない。
- Phase 6 は安定版リリースフェーズではなく、リリース対象外であることを確認した。

### 11.7 移行・ロールバック前提

Phase 6 では database schema、SQLite driver、Database Gateway、Repository 層、Service 層の責務境界を変更しない。

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
- リポジトリ内に配置する release notes 元資料、manifest、checksum、運用手順の必要性確認
- 既知制約、対象外機能、保留候補の明示
- backup / restore 手順の最終確認
- 主要 workflow の最終検証

### 11.9 Phase 6 検証結果

Phase 6 完了時点の標準検証は `tools/check-adlaire-git-repository.sh` とする。

検証結果は以下とする。

```text
24 passed | 0 failed
adlaire-git-repository-check-ok
```

Phase 6 の安定版準備 baseline は `tests/integration/phase6_release_preparation_test.ts` で検証する。

---

## 12. Phase 7: デフォルト安定版リリース

### 12.1 基準バージョン

Phase 7 の基準バージョンは、安定版リリース判定前は `v.0.8` とする。Phase 7 を初回安定版リリースとして承認する場合は、安定版系列 `v.1.8` へ進める。

### 12.2 目的

Phase 6 までの成果を対象に、7系フェーズのデフォルト安定版リリースとして正式なリリース判定を行う。

### 12.3 リリース方針

Phase 7 は7系フェーズであり、デフォルト安定版リリースフェーズである。ただし、安定版リリース判定条件を満たさない場合はリリースしてはならない。

---

## 13. Phase 8: 長期運用準備

### 13.1 基準バージョン

Phase 8 の基準バージョンは、Phase 7 で初回安定版リリース済みの場合は `v.1.9` とする。初回安定版リリースが未実施の場合は `v.0.9` とする。

### 13.2 目的

Phase 7 の7系安定版判定後の長期運用準備、検証、移行性確認、保留解除候補の再評価を行う。

### 13.3 リリース方針

Phase 8 は安定版リリースフェーズではない。Phase 8 では例外なく安定版リリース方針を持たない。

### 13.4 実施対象

- 長期運用準備
- 移行性確認
- 監査、保守、運用手順の整理
- 保留解除候補の再評価

Phase 8 で保留解除を検討できる候補は、`docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md` の保留候補を基準とする。ただし、保留解除候補の再評価は実装承認ではない。正式な実装対象にする場合は、3類マスター仕様書、本書、検証範囲へ反映し、ユーザー承認を得る。

---

## 14. Phase 9: 補助的リリース判定

### 14.1 基準バージョン

Phase 9 の基準バージョンは、Phase 7 で初回安定版リリース済みの場合は `v.1.10` とする。初回安定版リリースが未実施の場合は `v.0.10` とする。

### 14.2 目的

Phase 8 までの成果を対象に、補助的なリリース判定を行う。

### 14.3 リリース方針

Phase 9 は補助的なリリース判定フェーズである。

Phase 9 は、ケースバイケースで安定版リリースフェーズになる場合と、ならない場合がある。安定版リリース対象にする場合は、2類ポリシー、3類マスター仕様書、マスター開発計画に明記し、ユーザー承認を得る。

---

## 15. 実装着手前チェック

各フェーズの実装に着手する前に、以下を確認する。

- `AGENTS.md` を読んでいる。
- 2類ドキュメント群のうち、ドキュメント憲章と作業責務に対応する責務別ポリシーを読んでいる。
- `docs/specs/Auris_System_Design.md` を読んでいる。
- 対象となる個別3類マスター仕様書を読んでいる。
- 対象フェーズの目的、対象、対象外、検証範囲を提示している。
- ソースコード実装についてユーザー承認を得ている。
- `main` へ直接 push せず、PR 経由で取り込む前提で作業している。

---

## 16. 計画変更手順

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

## 17. 改訂履歴

| バージョン | 対象フェーズ | 基準バージョン | 内容 |
|---:|---|---:|---|
| v.0.1 | Phase 0 | v.0.1 | マスター開発計画の初期策定 |
| v.0.2 | Phase 1 | v.0.2 | Phase 1 実装完了、Docker 上の Deno ランタイム環境、主要検証結果、Phase 2 着手条件を反映 |
| v.0.3 | Phase 2 | v.0.3 | 計画バージョンとフェーズ基準バージョンを分離し、Phase 2 着手前仕様、実装順序、必須検証を追加 |
| v.0.4 | 全フェーズ共通 | - | 開発計画は3類マスター仕様書に基づいて策定される原則を明記 |
| v.0.5 | Phase 2 | v.0.3 | WYSIWYG エディターの実装時期、採用Phase、連携範囲を未定としてPhase 2計画から分離 |
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
| v.0.31 | 全フェーズ共通 | - | Adlaire Git Repository 本体は self-host、Docker、VPS、専用サーバーを標準運用基盤とし、Deno Deploy、Turso Cloud、libSQL 系クラウドDBサービスは将来候補として保留する方針を反映 |
| v.0.32 | Phase 3 | v.0.4 | Phase 3 を実装中へ更新し、Organizations 最小運用の実装済み範囲、未実装範囲、検証範囲を反映 |
| v.0.33 | Phase 3 | v.0.4 | Teams、Projects、Adlaire 内製 Deno Module Registry、Webhook event dispatch、Audit log 参照、Operations status、libSQL 再評価参照の最小運用を実装し、Phase 3 完了へ更新 |
| v.0.34 | Phase 4 | v.0.5 | Phase 1 から Phase 3 までの統合として Organization 所有 private repository の権限境界を Issue、Pull Request、Code Review、Wiki、Webhook、Release へ統合し、仕様整合、移行境界、検証導線を整理して Phase 4 完了へ更新 |
| v.0.35 | 全フェーズ共通 | - | フェーズ単位でドキュメント等の整合性向上を必須化し、リポジトリ整合性が取れていない状態で次フェーズへ進むことを禁止する方針を反映 |
| v.0.36 | Phase 5 | v.0.6 | Web UI の情報設計、画面レイアウト、視覚表現、操作導線、アクセシビリティ、可読性を改善し、Phase 5 完了へ更新 |
| v.0.37 | Phase 6 | v.0.7 | 安定版リリース準備として、既知バグ確認、ドキュメント整合性向上、移行・ロールバック前提整理、検証導線強化を行い、Phase 6 完了へ更新 |
| v.0.38 | 全フェーズ共通 | - | リリース提案、GitHub Releases を主配置とするリリース配置、承認後のリリース自動化方針への参照を反映 |
| v.0.39 | Phase 6 | v.0.7 | Document Index と AdlaireGroup 共通 `tpl-governance` 雛形を Phase 6 のドキュメント整合性向上として整理 |
