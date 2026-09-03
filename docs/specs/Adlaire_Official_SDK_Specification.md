# Adlaire 公式 SDK マスター仕様書

**位置づけ**: 3類マスター仕様書
**対象**: Adlaire 公式 SDK
**ライセンス**: クローズドライセンス
**文書バージョン**: v.2.33
**ステータス**: SDK マスター仕様改善

---

## 1. 目的

本書は、Adlaire 公式 SDK のマスター仕様書である。

Adlaire 公式 SDK は、Adlaire Git Repository のヘッドレスアーキテクチャにおけるクライアント接続境界である。

SDK は、HTML / CSS / Vanilla JavaScript で構成される静的フロントエンド、モバイルアプリ、外部システムが、Adlaire Git Repository 本体へ接続するための唯一の標準境界を提供する。

公開 API の直接利用は、SDK 未実装期間を含めて禁止する。SDK は外部接続専用であり、Adlaire Git Repository 本体内部の機能ドメイン間通信には使用しない。

本書は、SDK の目的、責務、配置、生成方式、配布方式、リリース方針、禁止事項、未確定範囲を定義する。

---

## 2. 上位ドキュメントとの関係

本書は、1類ルールブックである `AGENTS.md`、2類ポリシー、`docs/specs/Auris_System_Design.md` に従う。

Adlaire Git Repository 本体との接続境界は、`docs/specs/Adlaire_Git_Repository_Specification.md` と整合させる。

SDK の実装時期、フェーズ、検証範囲、完了条件は、`docs/plans/DEVELOPMENT_PLAN.md` を正本として管理する。

本書と上位ドキュメントに矛盾がある場合は、上位ドキュメントを正とし、本書を修正する。

---

## 3. 現行正本仕様

Adlaire 公式 SDK の現行正本仕様は以下とする。

- SDK は Adlaire Git Repository 本体の機能ドメインではなく、本体から切り離した外部接続境界として扱う。
- SDK は Adlaire Git Repository 本体へ同梱しない。
- SDK は独立リリース対象とする。
- SDK のリポジトリ分離は現時点では未定とする。
- 当面は現行リポジトリ内の `sdk/` で管理する。
- SDK は TypeScript で実装する。
- Vanilla JavaScript から利用できる JavaScript を生成する。
- SDK の生成方式は Deno runtime とする。
- SDK 配布方式は現行リポジトリで扱い、リポジトリ分離時は分離先リポジトリで扱う。
- SDK 固定採用バージョンは2類技術要件ポリシーに従う。
- SDK リリース開始フェーズは2類リリースポリシーとマスター開発計画に従う。
- SDK は Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` の禁止方針を緩和しない。
- SDK は Adlaire Git Repository 本体の公開 API を利用する。
- UI、静的フロントエンド、モバイルアプリ、外部システムは、SDK を通じて接続し、公開 API を直接利用しない。
- SDK は本体内部の機能ドメイン間通信に使用しない。
- SDK は本体内部の Service、Repository、Database Gateway、driver、Git 操作処理へ直接依存しない。
- SDK は UI framework、画面実装、状態管理 framework を提供しない。
- SDK は GitHub API 互換 client ではなく、Adlaire Git Repository の公開 API client とする。

---

## 4. 責務

SDK の責務は以下とする。

- Adlaire Git Repository API への接続境界を提供する。
- 認証情報の取り扱いをクライアント側で一貫させる。
- Repository、Issue、Pull Request、Wiki、Release、Webhook、Organization、Team、Project 等の公開 API 利用を統一する。
- Vanilla JavaScript から利用可能な生成物を提供する。
- UI 実装、モバイルアプリ、外部システムが本体内部構造へ直接依存しないようにする。

SDK は、Adlaire Git Repository 本体の内部 Service、Repository、Database Gateway、driver、Git 操作処理へ直接依存してはならない。

---

## 4.1 SDK の公開境界

SDK は、Adlaire Git Repository の公開 API を扱うための client boundary とする。外部利用者に対する接続境界は SDK に一本化し、公開 API の直接利用を標準接続面として提供しない。

SDK の公開境界は以下とする。

| 領域 | SDK の責務 |
|---|---|
| 接続 | base URL、request、response、timeout、retry 対象外範囲の管理 |
| 認証 | Personal Access Token、Basic 認証等の公開 API 用 credential の扱い |
| Repository | Repository 一覧、作成、取得、更新、削除、visibility、README、settings の公開 API 操作 |
| Git 関連メタデータ | branch、tag、commit、tree、blob、diff 等の公開 API 操作 |
| 開発支援 | Issue、Pull Request、Code Review、Wiki、Webhook、Release の公開 API 操作 |
| 組織 | Organization、Team、Project の公開 API 操作 |
| Registry | Adlaire 内製 Deno Module Registry の公開 API 操作 |
| 運用 | health、operations status、audit log 等の公開 API 操作 |
| 型定義 | TypeScript 利用時の公開 API 入出力型 |
| JavaScript 生成物 | Vanilla JavaScript から利用可能な出力 |

SDK は、本体公開 API の安定した利用面を提供する。SDK の public API は、本体内部構造ではなく、本体公開 API の仕様に対応させる。

SDK は Adlaire Git Repository 本体の機能ドメインではない。Management、Repository、Collaboration、CI/CD、System / Data Foundation の内部通信や内部依存解決に SDK を使ってはならない。

SDK が安定して扱う境界は、本体公開 API の request / response、認証方式、HTTP status、error response、resource 名、リリース済み互換範囲に限る。SDK は本体内部の Service、Repository、Database Gateway、driver、Git 操作処理、host filesystem path を互換対象にしてはならない。

SDK が依存してよい契約と、依存してはならない内部構造は以下とする。

| 分類 | 対象 | 扱い |
|---|---|---|
| 依存可 | 本体公開 API の resource、method、path | SDK の接続対象として扱う |
| 依存可 | request / response body の公開 field | SDK の入出力型候補として扱う |
| 依存可 | HTTP status、error response、認証方式 | SDK の error / result 判定候補として扱う |
| 依存可 | release 済み公開互換範囲 | SDK 互換性の基準として扱う |
| 依存不可 | 本体内部 Service、Repository、Database Gateway、driver | SDK public API の根拠にしない |
| 依存不可 | DB schema、migration、SQL、Git コマンド内部組み立て | SDK から参照しない |
| 依存不可 | host filesystem path、secrets、環境固有値 | SDK の戻り値、error、log に含めない |
| 依存不可 | UI 実装、DOM構造、CSS class | SDK の互換対象にしない |

## 4.2 SDK が提供しないもの

SDK は以下を提供しない。

- UI component
- CSS framework
- SPA framework
- routing framework
- form framework
- database driver
- Git command wrapper
- server runtime
- 本体内 Service への直接呼び出し
- 本体内 Repository 層への直接呼び出し
- Database Gateway または libSQL driver への直接呼び出し
- GitHub API 互換 client
- npm package 配布
- Node.js runtime 前提の build、test、bundle、publish

SDK は、UI を差し替え可能にするための接続境界であり、UI 実装そのものではない。

---

## 5. 配置

SDK は、当面 `sdk/` 配下で管理する。

`sdk/` は Adlaire Git Repository 本体の Go 実装領域ではない。

`sdk/` は、SDK の TypeScript source、生成設定、公開 API 型、生成済み JavaScript 成果物、SDK 用検証導線を管理する候補領域とする。ただし、具体的なファイル構成、生成コマンド、成果物名、配布対象ファイルは、SDK 実装開始時にマスター開発計画へ反映し、ユーザー承認を得てから確定する。

SDK のリポジトリ分離は現時点では未定である。分離する場合は、分離先リポジトリ、履歴移行、配布方式、リリース方式、バージョン連携を提示し、ユーザー承認を得る。

---

## 6. 生成方式

SDK は TypeScript で実装し、Vanilla JavaScript から利用できる JavaScript を生成する。

生成方式は Deno runtime とする。

Deno runtime を利用することは、Adlaire Git Repository 本体の標準開発言語を Deno + TypeScript に戻すことを意味しない。本体の標準開発言語は Go のままとする。

SDK 生成においても、Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を導入してはならない。

SDK 生成では、以下を標準方針とする。

| 項目 | 方針 |
|---|---|
| 実装言語 | TypeScript |
| 生成 runtime | Deno runtime |
| 出力 | Vanilla JavaScript から利用できる JavaScript |
| 型 | TypeScript source で公開 API 入出力型を定義する |
| 依存関係 | Deno 標準ライブラリを優先し、外部ライブラリは例外採用として別途承認 |
| 禁止 | Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` |

SDK の生成物は、browser から利用できることを前提とする。生成物が server runtime 固有 API に依存する場合は、SDK の標準成果物として扱わない。

SDK 生成成果物の検証条件は以下とする。

| 項目 | 検証条件 |
|---|---|
| Node.js 非依存 | Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を要求しない |
| Browser 利用 | Vanilla JavaScript から読み込める形式である |
| 秘密情報 | build 時または生成物内に token、password、環境固有値を含めない |
| 公開境界 | 本体内部構造ではなく公開 API だけを呼び出す |
| 型と出力 | TypeScript source と JavaScript output の対応を説明できる |
| 検証導線 | SDK 実装開始時に、生成、lint 相当、最低限の利用検証を提案し、承認後に確定する |

上記は生成成果物の検証条件であり、SDK 実装開始、具体的な生成コマンド、配布対象ファイルの承認ではない。

### 6.0.1 SDK 実装前チェック

SDK 仕様を根拠に実装または生成導線へ進む場合は、最低限以下を確認する。

| 確認項目 | 判定基準 |
|---|---|
| 接続境界 | SDK が本体公開 API だけを利用し、本体内部構造へ依存していない |
| 生成 runtime | Deno runtime による生成であり、Adlaire Git Repository 本体の開発言語を Deno + TypeScript へ戻すものではない |
| Node.js / npm 非依存 | Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を要求しない |
| Browser 利用 | Vanilla JavaScript から利用できる JavaScript output を説明できる |
| API 未確定 | client 名、関数名、戻り値形式、error 形式を未承認のまま固定していない |
| 配布 | 本体非同梱、独立リリース、現行リポジトリ配布、リポジトリ分離未定の扱いが維持されている |
| 承認 | SDK 実装、生成コマンド、配布対象、リリース開始フェーズの別承認要否を説明できる |

上記を満たさない場合、その変更は SDK 実装対象として扱わない。

### 6.0.2 SDK 仕様改善チェック

SDK 仕様を改善する場合は、以下を確認する。

| 確認項目 | 判定基準 |
|---|---|
| SDK責務 | 変更内容がクライアント接続境界、生成、配布、互換性、公開API利用のいずれかに属する |
| 本体非依存 | 本体内部の Service、Repository、Database Gateway、driver、Git 操作処理、host filesystem path を SDK 契約にしていない |
| API 未確定維持 | client 名、関数名、戻り値形式、error 形式、生成コマンドを未承認のまま固定していない |
| 生成境界 | TypeScript 実装、Deno runtime 生成、Vanilla JavaScript 向け output の方針と矛盾しない |
| 禁止依存 | Node.js runtime、npm ecosystem、`npm:` specifier、`package.json`、`node_modules` を要求しない |
| 上位整合 | `docs/specs/Auris_System_Design.md`、本体仕様書、2類ポリシー、マスター開発計画と矛盾しない |

SDK 仕様の改善は、SDK の接続境界と未確定範囲を明確にするために行う。本体の公開 API そのもの、DB driver、Git 操作、system / data 分離、Adlaire Pipeline の実装詳細は本書で固定しない。

## 6.1 Client lifecycle 方針

SDK は、利用側アプリケーションが明示的に client を生成し、設定を渡して利用する形を基本方針とする。

client lifecycle で扱う範囲は以下とする。

| 領域 | 方針 |
|---|---|
| 初期化 | base URL、認証情報、timeout 等の接続設定を受け取る |
| request | 公開 API 仕様に基づいて method、path、query、body、header を構成する |
| response | HTTP status と response body を利用側が判断できる形へ変換する |
| error | network、timeout、認証、認可、validation、not found、conflict、server error を区別できるようにする |
| 終了処理 | browser 利用を前提に、明示的な常駐 process や server runtime 管理を持たない |

SDK は、認証情報の保存先、UI 状態、routing、form state、cache policy、retry policy の詳細、offline queue、background sync を勝手に決めてはならない。これらを扱う場合は、利用側アプリケーションまたは後続の承認済みSDK仕様で定義する。

具体的な client 名、関数名、戻り値形式、例外方式、Result object 方式は未確定とする。

## 6.2 API 設計方針

SDK の API は、Adlaire Git Repository の公開 API を薄く安全に扱う client API とする。

SDK API は、以下を満たす必要がある。

- 本体公開 API の resource 単位に整理する。
- 認証情報の渡し方を統一する。
- request body、query、path parameter の組み立てを client 側で一貫させる。
- HTTP status、error code、validation error を利用者が判別できる形で返す。
- secret、token、password、内部 file path、driver 固有情報をログや error object へ不用意に含めない。
- 本体公開 API の破壊的変更を SDK public API へ無検証で反映しない。

SDK の初期 resource 候補は以下とする。

| 種別 | resource 候補 |
|---|---|
| 基本 | health、session、user |
| Repository | repositories、branches、tags、commits、tree、blob、readme |
| 開発支援 | issues、pull requests、code reviews、wiki、webhooks、releases |
| 組織 | organizations、teams、projects |
| Registry | packages、versions、downloads |
| 運用 | audit logs、operations status |

上記は SDK の設計対象候補であり、実装承認ではない。SDK 実装時は、対象 resource、対象外 resource、検証範囲をマスター開発計画へ反映し、ユーザー承認を得る。

## 6.3 認証方針

SDK は、Adlaire Git Repository の公開 API が認める認証方式だけを扱う。

初期認証候補は以下とする。

- Personal Access Token
- HTTP Basic 認証
- cookie / session を公開 API が正式に扱う場合の session 認証

SDK は、秘密情報の保存先を勝手に決めてはならない。browser local storage、session storage、cookie、mobile secure storage、環境変数等の保存場所は、利用側アプリケーションの責務として扱う。

SDK は、token refresh、OAuth、外部 IdP 連携、SAML、OIDC、device flow を現行仕様として提供しない。これらを扱う場合は、本体マスター仕様書、SDK マスター仕様書、マスター開発計画へ反映し、ユーザー承認を得る。

## 6.4 Error / Result 方針

SDK は、成功結果と失敗結果を利用側が判別しやすい形で返す。

SDK の error は、最低限以下を区別できる必要がある。

- network error
- timeout
- authentication error
- authorization error
- validation error
- not found
- conflict
- server error

ただし、具体的な戻り値形式、例外方式、Result object 方式、error code 名は未確定とし、SDK 実装開始時に提案してユーザー承認を得る。

## 6.5 互換性方針

SDK の互換性は、本体公開 API の互換性と連動する。ただし、本体内部実装、DB schema、driver、Service 層、Repository 層の変更は、公開 API が維持される限り SDK の破壊的変更として扱わない。

SDK 互換性で守る対象は以下とする。

- 公開 API resource の意味
- request parameter の意味
- response field の意味
- HTTP status と error 分類
- 認証方式の扱い
- JavaScript 生成物からの利用可能性

SDK 互換性で守らない対象は以下とする。

- 本体内部 file path
- 本体内部関数名
- DB schema 名
- driver 実装詳細
- UI 実装の状態管理
- build / generate の内部手順

SDK の破壊的変更を行う場合は、SDK マスター仕様書、本体マスター仕様書、マスター開発計画、リリース方針を同一変更範囲で整合し、ユーザー承認を得る。

---

## 7. 配布とリリース

SDK は本体へ同梱せず、独立リリース対象とする。

現時点の SDK 配布方式は、現行リポジトリで扱う。リポジトリ分離時は、分離先リポジトリで扱う。

SDK のリリース開始フェーズ、リリース成果物、配置先、release notes、checksum、manifest は、2類リリースポリシーとマスター開発計画に従い、リリース作業ごとにユーザー承認を得る。

SDK のリリースは Adlaire Git Repository 本体の安定版リリースを自動的に意味しない。本体の安定版リリースも SDK のリリースを自動的に意味しない。

SDK の配布対象候補は以下とする。

| 成果物 | 扱い |
|---|---|
| TypeScript source | SDK 実装の正本候補 |
| JavaScript output | Vanilla JavaScript 利用向けの配布成果物候補 |
| type definition | TypeScript 利用者向けの補助成果物候補 |
| checksum | リリース時の検証対象候補 |
| manifest | リリース時の成果物一覧候補 |
| release notes | SDK 独立リリース時の説明対象候補 |

SDK の配布方式は、現時点では現行リポジトリ配布とする。npm package 配布、JSR 公開、CDN 配布、外部 package registry 配布は現行仕様では採用しない。採用する場合は、ライセンス、公開可否、Node.js / npm 非依存、生成方式、成果物検証、配布先、リリース運用を整理し、ユーザー承認を得る。

---

## 8. 対象外

現時点では以下を対象外とする。

- SDK 実装
- SDK public API の具体的な関数名、戻り値形式、error 形式の確定
- SDK 実装開始フェーズの確定
- SDK リリース実行
- SDK リポジトリ分離
- npm package としての配布
- JSR 公開
- CDN 配布
- GitHub API 互換 client 化
- UI component 提供
- UI framework 提供
- state management framework 提供
- routing framework 提供
- Git command wrapper 提供
- database driver 提供
- Node.js runtime 前提の生成、検証、配布
- 外部フレームワーク採用
- 無承認の外部ライブラリ採用

---

## 8.1 未確定範囲

未確定範囲は以下とする。

| 領域 | 未確定内容 |
|---|---|
| 実装開始フェーズ | マスター開発計画で別途確定する |
| SDK 固定採用バージョン | 2類技術要件ポリシーに従い、別途承認で固定する |
| ファイル構成 | SDK 実装開始時に確定する |
| 生成コマンド | SDK 実装開始時に確定する |
| public API 形式 | SDK 実装開始時に確定する |
| error 形式 | SDK 実装開始時に確定する |
| client lifecycle の具体API | SDK 実装開始時に確定する |
| SDK 互換性の具体バージョン連携 | SDK リリース開始時に確定する |
| 生成成果物の具体ファイル名 | SDK 実装開始時に確定する |
| 生成成果物の具体検証コマンド | SDK 実装開始時に確定する |
| release 成果物 | SDK リリース開始時に確定する |
| リポジトリ分離 | 未定 |

未確定範囲は、ユーザー承認なしに実装またはリリース対象へ移してはならない。

未確定範囲を検討する場合は、SDK 仕様として確定する項目、マスター開発計画へ落とす項目、本体公開 API の同時改訂が必要な項目を分ける。検討だけで SDK 実装、生成導線、配布対象、リリース対象へ昇格させてはならない。

---

## 9. 完了条件

本書は、以下を満たす状態を SDK マスター仕様の現行正本とする。

- SDK が本体ではなくクライアント接続境界であることを説明できる。
- SDK が本体非同梱、独立リリース対象であることを説明できる。
- `sdk/` 配置、リポジトリ分離未定、現行リポジトリ配布を説明できる。
- TypeScript 実装、Vanilla JavaScript 向け JavaScript 生成、Deno runtime 生成を説明できる。
- Node.js / npm 禁止方針を緩和しないことを説明できる。
- SDK の公開境界、提供する resource 候補、認証方針、error 方針を説明できる。
- SDK の client lifecycle と互換性方針を説明できる。
- SDK が依存してよい本体公開契約と、依存してはならない本体内部構造を説明できる。
- SDK 生成成果物の検証条件を説明できる。
- SDK 実装前チェックにより、接続境界、生成 runtime、Node.js / npm 非依存、未確定API、配布条件、承認要否を確認できる。
- SDK 仕様改善チェックにより、SDK責務、本体非依存、API未確定維持、生成境界、禁止依存、上位整合を確認できる。
- SDK が UI framework、Git command wrapper、database driver、GitHub API 互換 client ではないことを説明できる。
- SDK 実装、public API 詳細、実装開始フェーズ、リリース実行が未確定範囲として分離されている。
- SDK 仕様、本体仕様、Auris システム設計、マスター開発計画、README の参照関係が矛盾していない。
