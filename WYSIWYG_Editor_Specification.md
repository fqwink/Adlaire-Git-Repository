# 🎨 Adlaire Block-Based WYSIWYG Editor Specification

**プロジェクト**: Adlaire Git Repository Phase 1  
**アーキテクチャ**: ブロックベース（Editor.js イメージ）  
**実装言語**: TypeScript（Deno ランタイムのみ）  
**出力形式**: JSON  
**ライブラリ化**: ✅ 他プロダクト再利用想定  
**ブロックタイプ**: 7 種類（Phase 1） → 29 種類（Phase 3 対応提案）  
**作成日**: 2026-08-20  
**ステータス**: ✅ 実装準備完了  
**バージョン**: 3.0（TypeScript 統一・Deno ランタイム・ブロック拡張対応）

---

## 📑 目次

1. [コンセプト](#コンセプト)
2. [ブロックベースアーキテクチャ](#ブロックベースアーキテクチャ)
3. [実装・ビルド戦略](#実装ビルド戦略)
4. [JSON データ仕様](#jsonデータ仕様)
5. [ブロックタイプ](#ブロックタイプ)
6. [UI/UX 設計](#uiux-設計)
7. [ユーザーインタラクション](#ユーザーインタラクション)
8. [実装詳細](#実装詳細)
9. [JSON 例](#json-例)
10. [セキュリティ](#セキュリティ)
11. [テスト計画](#テスト計画)
12. [実装スケジュール](#実装スケジュール)
13. [チェックリスト](#チェックリスト)

---

## コンセプト

### 「Editor.js イメージのブロックベース WYSIWYG エディター」

```
ユーザー入力
    ↓
ブロック単位での操作・編集
    ↓
ブロック配列の JSON データ
    ↓
JSON から HTML へのリアルタイムレンダリング
    ↓
保存・復元・エクスポート（すべて JSON）
```

### 主要特徴

| 特徴 | 説明 |
|------|------|
| **ブロックベース** | 見出し・段落・リスト等が独立したブロック単位 |
| **JSON 出力** | すべてのコンテンツが JSON フォーマットで管理 |
| **ドラッグ&ドロップ** | ブロック間の移動・並び替えを直感的に実行 |
| **スラッシュコマンド** | `/heading` で見出しに変換・`/list` でリストに変換 |
| **インラインツールバー** | テキスト選択で太字・リンク・コード等をワンクリック適用 |
| **リアルタイムプレビュー** | JSON から HTML へ動的にレンダリング |
| **完全な制御性** | JSON データを直接編集・拡張可能 |

---

## 実装・ビルド戦略

### TypeScript 統一・ユニバーサル JS 対応

```
開発フェーズ: TypeScript（型安全・IDE補完）
    ↓
ビルド: TypeScript → JavaScript
    ↓
出力:
  1. ブラウザ用 (UMD / ESM)
  2. Node.js 用 (CommonJS / ESM)
  3. CDN 配布用 (minified)
```

### ディレクトリ構成

```
adlaire-wysiwyg-editor/
├── src/                          # TypeScript ソース
│   ├── core/
│   │   ├── BlockEditor.ts        # コアエンジン
│   │   ├── Block.ts              # ブロック定義
│   │   ├── Renderer.ts           # JSON → HTML
│   │   └── types.ts              # 型定義
│   ├── plugins/
│   │   ├── SlashCommands.ts
│   │   ├── InlineToolbar.ts
│   │   └── DragDrop.ts
│   ├── utils/
│   │   ├── security.ts           # XSS 対策
│   │   ├── validation.ts         # JSON 検証
│   │   └── helpers.ts
│   └── index.ts                  # エントリーポイント
├── dist/                         # ビルド出力
│   ├── wysiwyg-editor.js         # UMD (ブラウザ)
│   ├── wysiwyg-editor.esm.js     # ESM
│   ├── wysiwyg-editor.cjs.js     # CommonJS
│   ├── wysiwyg-editor.min.js     # Minified
│   └── wysiwyg-editor.d.ts       # 型定義
├── package.json                  # npm パッケージ定義
├── tsconfig.json                 # TypeScript 設定
├── webpack.config.js             # ビルド設定
└── README.md
```

### ビルド体系

#### package.json スクリプト

```json
{
  "name": "@adlaire/wysiwyg-editor",
  "version": "1.0.0",
  "description": "Block-based WYSIWYG editor for web applications",
  "main": "dist/wysiwyg-editor.cjs.js",
  "module": "dist/wysiwyg-editor.esm.js",
  "browser": "dist/wysiwyg-editor.js",
  "types": "dist/wysiwyg-editor.d.ts",
  "files": ["dist", "src"],
  
  "scripts": {
    "build": "npm run build:ts && npm run build:bundle",
    "build:ts": "tsc",
    "build:bundle": "webpack --mode production",
    "dev": "webpack serve --mode development",
    "test": "jest",
    "lint": "eslint src",
    "prepublish": "npm run build"
  },
  
  "devDependencies": {
    "typescript": "^5.2.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "ts-loader": "^9.4.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

#### TypeScript → JavaScript ビルド

```bash
# 開発時
npm run dev

# 本番ビルド
npm run build

# テスト
npm test

# Lint
npm run lint
```

### 出力フォーマット

#### 1. UMD（ブラウザ直接使用）

```html
<!-- CDN から読み込み -->
<script src="https://cdn.example.com/wysiwyg-editor.min.js"></script>

<script>
  // グローバル変数としてアクセス
  const editor = new AdlaireWYSIWYGEditor({
    container: '#editor'
  });
</script>
```

**生成されるコード:**
```javascript
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' 
    ? module.exports = factory() 
    : typeof define === 'function' && define.amd 
    ? define(factory) 
    : (global.AdlaireWYSIWYGEditor = factory());
}(this, (function () {
  // BlockEditor クラス
  class BlockEditor { ... }
  return BlockEditor;
})));
```

#### 2. ESM（モダン JS）

```javascript
// Node.js / Deno / モダンブラウザ
import { BlockEditor, Renderer } from '@adlaire/wysiwyg-editor';

const editor = new BlockEditor({
  container: '#editor'
});
```

#### 3. CommonJS（Node.js）

```javascript
// Node.js / Electron
const { BlockEditor, Renderer } = require('@adlaire/wysiwyg-editor');

const editor = new BlockEditor({
  container: '#editor'
});
```

### ライブラリ化・再利用方針

#### Adlaire Git Repository での使用

```typescript
// Backend (Deno)
import { BlockEditor } from './editor/BlockEditor.ts';

const editor = new BlockEditor();
editor.addBlock('heading');
const json = editor.toJSON();
```

#### 他プロダクトでの使用

```typescript
// 別プロジェクト (TypeScript)
import { BlockEditor } from '@adlaire/wysiwyg-editor';

const editor = new BlockEditor();
const doc = editor.toJSON();

// HTML に変換
import { Renderer } from '@adlaire/wysiwyg-editor';
const renderer = new Renderer();
const html = renderer.render(doc);
```

```html
<!-- HTML + JavaScript -->
<div id="editor"></div>

<script src="https://cdn.example.com/wysiwyg-editor.min.js"></script>
<script>
  const editor = new AdlaireWYSIWYGEditor({
    container: '#editor'
  });
</script>
```

### npm パッケージ公開

```bash
# npm に公開
npm publish

# 他プロジェクトでインストール
npm install @adlaire/wysiwyg-editor

# または yarn
yarn add @adlaire/wysiwyg-editor
```

---

### 構造図

```
┌─────────────────────────────────────────┐
│      ユーザーインターフェース              │
│  ・ブロック操作（編集・移動）              │
│  ・ドラッグ&ドロップ                     │
│  ・スラッシュコマンド                     │
│  ・インラインツールバー                   │
├─────────────────────────────────────────┤
│    ブロック管理エンジン                   │
│  ・ブロック追加・削除・更新               │
│  ・ブロック順序管理                      │
│  ・状態管理（Undo/Redo）                 │
├─────────────────────────────────────────┤
│    JSON データレイヤー                    │
│  ブロック配列                            │
│  {                                      │
│    blocks: [                            │
│      { type, data, ... },               │
│      { type, data, ... }                │
│    ]                                    │
│  }                                      │
├─────────────────────────────────────────┤
│    レンダリングエンジン                   │
│  JSON → HTML への動的変換                │
├─────────────────────────────────────────┤
│    永続化層（SQLite）                    │
│  JSON ドキュメント保存・読込              │
└─────────────────────────────────────────┘
```

### ブロック概念

```
各ブロックは独立したユニット

┌──────────────────┐
│ Heading Block    │
│ ==================
│ type: "heading"  │
│ level: 1         │
│ text: "タイトル"  │
└──────────────────┘

┌──────────────────┐
│ Paragraph Block  │
│ ==================
│ type: "paragraph"│
│ text: "段落..."  │
└──────────────────┘

┌──────────────────┐
│ List Block       │
│ ==================
│ type: "list"     │
│ style: "ordered" │
│ items: [...]     │
└──────────────────┘

※ 各ブロックが独立
  → ブロック単位での編集
  → ドラッグで移動可能
  → 個別に削除・置換可能
```

---

## JSON データ仕様

### トップレベルスキーマ

```json
{
  "version": "2.0",
  "time": 1692547200000,
  "blocks": [
    { /* ブロック1 */ },
    { /* ブロック2 */ },
    { /* ブロック3 */ }
  ]
}
```

### ブロック共通フォーマット

```json
{
  "id": "block_1234567890",
  "type": "heading|paragraph|list|code|quote|image|divider",
  "data": {
    /* ブロックタイプ固有のデータ */
  }
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|----------|-----|------|
| `id` | string | ブロックの一意識別子（自動生成） |
| `type` | string | ブロックタイプ（heading, paragraph等） |
| `data` | object | ブロックタイプ固有のデータ |

---

## ブロックタイプ

### 現在のブロックタイプ（Phase 1・7種類）

#### 1. Heading（見出し）

```json
{
  "id": "block_001",
  "type": "heading",
  "data": {
    "level": 1,
    "text": "タイトル"
  }
}
```

| フィールド | 説明 |
|----------|------|
| `level` | 見出しレベル（1=H1, 2=H2, 3=H3） |
| `text` | 見出しテキスト |

---

#### 2. Paragraph（段落）

```json
{
  "id": "block_002",
  "type": "paragraph",
  "data": {
    "text": "段落のテキスト"
  }
}
```

---

#### 3. List（リスト）

```json
{
  "id": "block_003",
  "type": "list",
  "data": {
    "style": "unordered",
    "items": [
      { "text": "Item 1", "nested": [] },
      { "text": "Item 2", "nested": [] }
    ]
  }
}
```

---

#### 4. Code（コードブロック）

```json
{
  "id": "block_004",
  "type": "code",
  "data": {
    "code": "function hello() { ... }",
    "language": "javascript"
  }
}
```

---

#### 5. Quote（引用）

```json
{
  "id": "block_005",
  "type": "quote",
  "data": {
    "text": "引用のテキスト",
    "author": "引用者名"
  }
}
```

---

#### 6. Image（画像）

```json
{
  "id": "block_006",
  "type": "image",
  "data": {
    "url": "https://example.com/image.png",
    "alt": "Alt text"
  }
}
```

---

#### 7. Divider（区切り線）

```json
{
  "id": "block_007",
  "type": "divider"
}
```

---

### 拡張提案ブロックタイプ（22種類追加）

#### 【A. コンテンツ拡張】12種類

##### A1. Checkbox / Checklist（チェックリスト）⭐ 推奨

```json
{
  "type": "checklist",
  "data": {
    "items": [
      { "text": "Task 1", "checked": false },
      { "text": "Task 2", "checked": true }
    ]
  }
}
```

**用途**: ToDoリスト・チェックリスト・タスク管理  
**実装難度**: ★☆☆（低）

---

##### A2. Callout / Alert（注意書き）⭐ 推奨

```json
{
  "type": "callout",
  "data": {
    "type": "info|warning|error|success",
    "icon": "ℹ️|⚠️|❌|✅",
    "title": "重要な情報",
    "text": "これは警告です"
  }
}
```

**用途**: 注意喚起・情報提示・警告・成功メッセージ  
**実装難度**: ★☆☆（低）

---

##### A3. Table（テーブル）

```json
{
  "type": "table",
  "data": {
    "headers": ["名前", "年齢", "職業"],
    "rows": [
      ["Alice", "25", "エンジニア"],
      ["Bob", "30", "デザイナー"]
    ]
  }
}
```

**用途**: データテーブル・リスト表示・比較表  
**実装難度**: ★★☆（中）

---

##### A4. Embed（埋め込み）

```json
{
  "type": "embed",
  "data": {
    "provider": "youtube",
    "url": "https://www.youtube.com/watch?v=...",
    "caption": "ビデオのタイトル"
  }
}
```

**対応**: YouTube, Twitter, GitHub Gist, Codepen等  
**用途**: マルチメディアコンテンツ埋め込み  
**実装難度**: ★★★（高）

---

##### A5. Audio（音声）

```json
{
  "type": "audio",
  "data": {
    "url": "https://example.com/audio.mp3",
    "title": "音声ファイル",
    "controls": true
  }
}
```

**用途**: 音声ファイル・ポッドキャスト埋め込み  
**実装難度**: ★☆☆（低）

---

##### A6. Video（動画）

```json
{
  "type": "video",
  "data": {
    "url": "https://example.com/video.mp4",
    "poster": "https://example.com/poster.jpg",
    "width": 640,
    "height": 480
  }
}
```

**用途**: ローカル動画・自ホスト動画埋め込み  
**実装難度**: ★☆☆（低）

---

##### A7. Toggle / Collapsible（折りたたみ）

```json
{
  "type": "toggle",
  "data": {
    "title": "詳細情報",
    "isOpen": false,
    "blocks": [
      { "type": "paragraph", "data": { "text": "隠れたコンテンツ" } }
    ]
  }
}
```

**用途**: 長いコンテンツの折りたたみ・詳細情報表示  
**実装難度**: ★★☆（中）

---

##### A8. Math / LaTeX（数式）

```json
{
  "type": "math",
  "data": {
    "formula": "E = mc^2",
    "format": "latex",
    "displayMode": true
  }
}
```

**用途**: 科学・数学・エンジニアドキュメント  
**実装難度**: ★★★（高）

---

##### A9. Mermaid / Diagram（図・チャート）

```json
{
  "type": "mermaid",
  "data": {
    "diagram": "graph TD\n  A --> B\n  B --> C",
    "type": "flowchart"
  }
}
```

**用途**: フローチャート・UML・ガントチャート  
**実装難度**: ★★★（高）

---

##### A10. Columns（複数列レイアウト）

```json
{
  "type": "columns",
  "data": {
    "columnCount": 2,
    "columns": [
      [ { "type": "paragraph", "data": { "text": "左側" } } ],
      [ { "type": "paragraph", "data": { "text": "右側" } } ]
    ]
  }
}
```

**用途**: 2列・3列レイアウト  
**実装難度**: ★★★（高）

---

##### A11. Spacer（スペーサー）⭐ 推奨

```json
{
  "type": "spacer",
  "data": {
    "height": 32
  }
}
```

**用途**: ブロック間の余白調整  
**実装難度**: ★☆☆（低）

---

##### A12. Separator / Divider 拡張⭐ 推奨

```json
{
  "type": "separator",
  "data": {
    "style": "solid|dashed|dotted",
    "color": "#cccccc",
    "height": 1
  }
}
```

**用途**: スタイル付きの区切り線  
**実装難度**: ★☆☆（低）

---

#### 【B. データ・メタデータ】5種類

##### B1. JSON / Raw Data

```json
{
  "type": "json",
  "data": {
    "content": "{ \"key\": \"value\" }",
    "formatted": true
  }
}
```

**用途**: JSON データ表示・API レスポンス  
**実装難度**: ★★☆（中）

---

##### B2. YAML

```json
{
  "type": "yaml",
  "data": {
    "content": "name: Project\nversion: 1.0.0"
  }
}
```

**用途**: YAML 設定ファイル表示  
**実装難度**: ★★☆（中）

---

##### B3. Frontmatter

```json
{
  "type": "frontmatter",
  "data": {
    "metadata": {
      "title": "ドキュメント",
      "author": "Author Name",
      "date": "2026-08-20"
    }
  }
}
```

**用途**: ドキュメント メタデータ  
**実装難度**: ★★☆（中）

---

##### B4. Reference / Internal Link

```json
{
  "type": "reference",
  "data": {
    "targetId": "document_123",
    "targetTitle": "関連ドキュメント",
    "preview": true
  }
}
```

**用途**: ドキュメント間のリンク  
**実装難度**: ★★★（高）

---

##### B5. TOC（目次自動生成）

```json
{
  "type": "toc",
  "data": {
    "maxDepth": 3,
    "autoGenerate": true
  }
}
```

**用途**: ドキュメント の自動目次生成  
**実装難度**: ★★☆（中）

---

#### 【C. ユーザーインタラクション】5種類

##### C1. Label / Tag（ラベル・タグ）⭐ 推奨

```json
{
  "type": "label",
  "data": {
    "labels": [
      { "name": "important", "color": "#ff0000" },
      { "name": "draft", "color": "#ffa500" }
    ]
  }
}
```

**用途**: ドキュメント分類・フィルタリング  
**実装難度**: ★☆☆（低）

---

##### C2. Rating（レーティング）⭐ 推奨

```json
{
  "type": "rating",
  "data": {
    "label": "このドキュメントは有用ですか？",
    "rating": 4,
    "maxRating": 5
  }
}
```

**用途**: フィードバック・評価・投票  
**実装難度**: ★☆☆（低）

---

##### C3. Progress Bar（進捗バー）⭐ 推奨

```json
{
  "type": "progress",
  "data": {
    "label": "プロジェクト進度",
    "percentage": 75,
    "color": "#4CAF50"
  }
}
```

**用途**: 進度管理・ステータス表示  
**実装難度**: ★☆☆（低）

---

##### C4. Comment（コメント・注釈）

```json
{
  "type": "comment",
  "data": {
    "author": "user_123",
    "timestamp": 1692547200000,
    "text": "このセクションについての質問",
    "resolved": false
  }
}
```

**用途**: レビューコメント・ディスカッション  
**実装難度**: ★★★（高）

---

##### C5. Mention（@メンション）

```json
{
  "type": "paragraph",
  "data": {
    "text": "Hey @alice, これを確認してください",
    "mentions": [{ "userId": "user_456", "name": "alice" }]
  }
}
```

**用途**: ユーザーへの通知・コラボレーション  
**実装難度**: ★★☆（中）

---

### ブロックタイプ実装計画

| フェーズ | ブロック数 | 含有タイプ | 実装難度 |
|---------|----------|---------|--------|
| **Phase 1（推奨）** | 14個 | コア7 + 推奨7 | ★☆☆ |
| **Phase 2** | 20個 | Phase1 + 中級6 | ★★☆ |
| **Phase 3** | 29個 | Phase2 + 高級9 | ★★★ |

**Phase 1 推奨 7 ブロック（追加）**:
✅ Checkbox, Callout, Spacer, Separator, Label, Rating, Progress

**理由**: 実装が簡単・ユーザー価値高・ビジネス効果大・4-5週間で対応可能

---

## UI/UX 設計

### エディター全体レイアウト

```
┌──────────────────────────────────────┐
│ Header: Adlaire Editor               │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ◢ Block 1 (Heading)           │  │ ← ドラッグハンドル
│  │ タイトル                        │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ◢ Block 2 (Paragraph)          │  │
│  │ ユーザーが"/"入力               │  │
│  │ ↓スラッシュコマンドメニュー表示  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ◢ Block 3 (List)               │  │
│  │ - Item 1                       │  │
│  │ - Item 2                       │  │
│  │   ツール: [B] [I] [🔗]        │  │
│  └────────────────────────────────┘  │
│                                      │
│ [+ ブロック追加]                     │
│                                      │
├──────────────────────────────────────┤
│ 文字数: 123 | ブロック数: 3          │
└──────────────────────────────────────┘
```

### ドラッグハンドル

```
各ブロックの左側に◢ が表示
  ↓
ユーザーが◢をドラッグ
  ↓
ブロックが移動・順序が変わる
  ↓
JSON 配列内の順序も自動更新
```

### スラッシュコマンド

```
ユーザーが"/"を入力 → メニュー表示

/heading      → Heading ブロック
/paragraph    → Paragraph ブロック
/list         → List ブロック（順序なし）
/ordered      → List ブロック（順序付き）
/code         → Code ブロック
/quote        → Quote ブロック
/image        → Image ブロック
/divider      → Divider
```

### インラインツールバー

```
ユーザーがテキストを選択
  ↓
┌─────────────────────────────────────┐
│ [B] [I] [U] [🔗] [{}] [···]        │
└─────────────────────────────────────┘
  ↓
ボタンをクリック → フォーマット適用
```

---

## ユーザーインタラクション

### シナリオ1: 見出しを作成

```
1. エディターに"タイトル"と入力
   → Paragraph ブロック作成

2. ブロックの先頭で"/"と入力
   → スラッシュコマンドメニュー表示

3. "/heading"をクリック
   → Paragraph が Heading に変換
   → JSON の type が "paragraph" → "heading" に変更

4. プレビューが自動更新
   → <h1>タイトル</h1> に表示
```

### シナリオ2: ブロック順序を変更

```
1. 3つのブロックがある状態

   Block 1 (Heading)
   Block 2 (Paragraph)
   Block 3 (List)

2. Block 1 の◢をドラッグして Block 2 の下へ

   Block 2 (Paragraph)
   Block 1 (Heading)
   Block 3 (List)

3. JSON の blocks 配列が自動並び替え
   → [block_2, block_1, block_3]
```

### シナリオ3: テキストにフォーマット適用

```
1. Paragraph ブロックで"重要な情報"と入力

2. "重要な情報"を選択
   → インラインツールバー表示

3. [B]（太字）をクリック
   → テキストが **重要な情報** に変換
   → JSON の data.text が更新
   → プレビューが <strong>重要な情報</strong> に変更
```

---

## 実装詳細

### コアライブラリ構成（TypeScript）

#### types.ts - 型定義

```typescript
// ブロック型
export type BlockType = 
  | 'heading' 
  | 'paragraph' 
  | 'list' 
  | 'code' 
  | 'quote' 
  | 'image' 
  | 'divider';

// ブロックインターフェース
export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

// エディタードキュメント
export interface EditorDocument {
  version: string;
  time: number;
  blocks: Block[];
}

// エディターオプション
export interface EditorOptions {
  container?: string | HTMLElement;
  initialData?: EditorDocument;
  readOnly?: boolean;
  onChange?: (data: EditorDocument) => void;
  onSave?: (data: EditorDocument) => void;
}

// レンダラー設定
export interface RendererOptions {
  sanitize?: boolean;
  customRenderers?: Record<BlockType, (block: Block) => string>;
}
```

#### BlockEditor.ts - コアエンジン

```typescript
import { Block, EditorDocument, EditorOptions, BlockType } from './types';

export class BlockEditor {
  private blocks: Block[] = [];
  private history: EditorDocument[] = [];
  private historyIndex: number = -1;
  private options: EditorOptions;
  private container: HTMLElement | null = null;

  constructor(options: EditorOptions = {}) {
    this.options = options;
    this.initializeContainer();
    this.loadInitialData();
  }

  private initializeContainer(): void {
    if (typeof this.options.container === 'string') {
      this.container = document.querySelector(this.options.container);
    } else if (this.options.container instanceof HTMLElement) {
      this.container = this.options.container;
    }
  }

  private loadInitialData(): void {
    if (this.options.initialData?.blocks) {
      this.blocks = this.options.initialData.blocks;
    }
  }

  // ブロック追加
  public addBlock(type: BlockType, afterBlockId?: string): Block {
    const newBlock: Block = {
      id: this.generateId(),
      type,
      data: this.getDefaultData(type)
    };

    if (afterBlockId) {
      const index = this.blocks.findIndex(b => b.id === afterBlockId);
      if (index !== -1) {
        this.blocks.splice(index + 1, 0, newBlock);
      } else {
        this.blocks.push(newBlock);
      }
    } else {
      this.blocks.push(newBlock);
    }

    this.saveHistory();
    this.notifyChange();
    return newBlock;
  }

  // ブロック削除
  public removeBlock(blockId: string): void {
    const index = this.blocks.findIndex(b => b.id === blockId);
    if (index !== -1 && this.blocks.length > 1) {
      this.blocks.splice(index, 1);
      this.saveHistory();
      this.notifyChange();
    }
  }

  // ブロック移動
  public moveBlock(blockId: string, direction: 'up' | 'down'): void {
    const index = this.blocks.findIndex(b => b.id === blockId);
    if (direction === 'up' && index > 0) {
      [this.blocks[index], this.blocks[index - 1]] = 
      [this.blocks[index - 1], this.blocks[index]];
    } else if (direction === 'down' && index < this.blocks.length - 1) {
      [this.blocks[index], this.blocks[index + 1]] = 
      [this.blocks[index + 1], this.blocks[index]];
    }
    this.saveHistory();
    this.notifyChange();
  }

  // ブロック更新
  public updateBlock(blockId: string, data: Record<string, any>): void {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      block.data = { ...block.data, ...data };
      this.saveHistory();
      this.notifyChange();
    }
  }

  // ブロック型変換
  public convertBlock(blockId: string, newType: BlockType): void {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      block.type = newType;
      block.data = this.getDefaultData(newType);
      this.saveHistory();
      this.notifyChange();
    }
  }

  // JSON 出力
  public toJSON(): EditorDocument {
    return {
      version: '2.0',
      time: Date.now(),
      blocks: this.blocks
    };
  }

  // JSON から復元
  public fromJSON(doc: EditorDocument): void {
    this.blocks = doc.blocks;
    this.history = [];
    this.historyIndex = -1;
    this.notifyChange();
  }

  // Undo
  public undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  // Redo
  public redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  // ゲッター
  public getBlocks(): Block[] {
    return this.blocks;
  }

  public getBlock(blockId: string): Block | undefined {
    return this.blocks.find(b => b.id === blockId);
  }

  public getBlockCount(): number {
    return this.blocks.length;
  }

  // プライベートメソッド
  private generateId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultData(type: BlockType): Record<string, any> {
    const defaults: Record<BlockType, Record<string, any>> = {
      heading: { level: 1, text: '' },
      paragraph: { text: '' },
      list: { style: 'unordered', items: [] },
      code: { code: '', language: 'javascript' },
      quote: { text: '', author: '' },
      image: { url: '', alt: '', caption: '' },
      divider: {}
    };
    return defaults[type] || {};
  }

  private saveHistory(): void {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.toJSON())));
    this.historyIndex++;
  }

  private restoreState(doc: EditorDocument): void {
    this.blocks = JSON.parse(JSON.stringify(doc.blocks));
    this.notifyChange();
  }

  private notifyChange(): void {
    if (this.options.onChange) {
      this.options.onChange(this.toJSON());
    }
  }
}

// デフォルトエクスポート
export default BlockEditor;
```

#### Renderer.ts - JSON → HTML レンダリング

```typescript
import { Block, EditorDocument, RendererOptions, BlockType } from './types';
import { sanitizeHTML, sanitizeURL } from '../utils/security';

export class Renderer {
  private options: RendererOptions;

  constructor(options: RendererOptions = {}) {
    this.options = {
      sanitize: true,
      ...options
    };
  }

  public render(doc: EditorDocument): string {
    return doc.blocks
      .map(block => this.renderBlock(block))
      .join('\n');
  }

  private renderBlock(block: Block): string {
    // カスタムレンダラーがあればそれを使用
    if (this.options.customRenderers?.[block.type]) {
      return this.options.customRenderers[block.type](block);
    }

    switch (block.type) {
      case 'heading':
        return this.renderHeading(block);
      case 'paragraph':
        return this.renderParagraph(block);
      case 'list':
        return this.renderList(block);
      case 'code':
        return this.renderCode(block);
      case 'quote':
        return this.renderQuote(block);
      case 'image':
        return this.renderImage(block);
      case 'divider':
        return this.renderDivider(block);
      default:
        return '';
    }
  }

  private renderHeading(block: Block): string {
    const tag = `h${block.data.level || 1}`;
    const text = this.options.sanitize 
      ? sanitizeHTML(block.data.text) 
      : block.data.text;
    return `<${tag}>${text}</${tag}>`;
  }

  private renderParagraph(block: Block): string {
    const text = this.options.sanitize 
      ? sanitizeHTML(block.data.text) 
      : block.data.text;
    return `<p>${text}</p>`;
  }

  private renderList(block: Block): string {
    const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
    const items = block.data.items
      .map((item: any) => {
        const text = this.options.sanitize 
          ? sanitizeHTML(item.text) 
          : item.text;
        return `<li>${text}</li>`;
      })
      .join('\n');
    return `<${tag}>\n${items}\n</${tag}>`;
  }

  private renderCode(block: Block): string {
    const code = this.options.sanitize 
      ? sanitizeHTML(block.data.code) 
      : block.data.code;
    const lang = block.data.language || 'javascript';
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
  }

  private renderQuote(block: Block): string {
    const text = this.options.sanitize 
      ? sanitizeHTML(block.data.text) 
      : block.data.text;
    return `<blockquote>${text}</blockquote>`;
  }

  private renderImage(block: Block): string {
    const url = sanitizeURL(block.data.url);
    if (!url) return '';
    const alt = block.data.alt || '';
    return `<img src="${url}" alt="${alt}" />`;
  }

  private renderDivider(): string {
    return '<hr />';
  }
}

// デフォルトエクスポート
export default Renderer;
```

#### security.ts - セキュリティユーティリティ

```typescript
export function sanitizeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char] || char);
}

export function sanitizeURL(url: string): string | null {
  const allowedProtocols = ['http://', 'https://', 'mailto:', '/'];
  const isAllowed = allowedProtocols.some(protocol => 
    url.toLowerCase().startsWith(protocol)
  );
  return isAllowed ? url : null;
}

export function validateJSON(data: any): boolean {
  try {
    if (!data.version || !Array.isArray(data.blocks)) {
      return false;
    }

    for (const block of data.blocks) {
      if (!block.id || !block.type || typeof block.data !== 'object') {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
```

#### index.ts - エントリーポイント

```typescript
// コアエクスポート
export { BlockEditor as default } from './core/BlockEditor';
export { BlockEditor } from './core/BlockEditor';
export { Renderer } from './core/Renderer';

// 型エクスポート
export type { 
  Block, 
  EditorDocument, 
  EditorOptions, 
  BlockType,
  RendererOptions 
} from './core/types';

// ユーティリティエクスポート
export { 
  sanitizeHTML, 
  sanitizeURL, 
  validateJSON 
} from './utils/security';

// ライブラリ情報
export const version = '1.0.0';
export const name = '@adlaire/wysiwyg-editor';
```

---

---

## JSON 例

### 完全なドキュメント例

```json
{
  "version": "2.0",
  "time": 1692547200000,
  "blocks": [
    {
      "id": "block_001",
      "type": "heading",
      "data": {
        "level": 1,
        "text": "プロジェクト概要"
      }
    },
    {
      "id": "block_002",
      "type": "paragraph",
      "data": {
        "text": "このプロジェクトについての説明です。"
      }
    },
    {
      "id": "block_003",
      "type": "heading",
      "data": {
        "level": 2,
        "text": "主要機能"
      }
    },
    {
      "id": "block_004",
      "type": "list",
      "data": {
        "style": "unordered",
        "items": [
          {
            "text": "ブロックベース編集",
            "nested": []
          },
          {
            "text": "JSON 出力",
            "nested": []
          },
          {
            "text": "ドラッグ&ドロップ",
            "nested": []
          }
        ]
      }
    },
    {
      "id": "block_005",
      "type": "quote",
      "data": {
        "text": "Editor.js のようなシンプルで強力なエディター",
        "author": "開発チーム"
      }
    },
    {
      "id": "block_006",
      "type": "code",
      "data": {
        "code": "const editor = new BlockEditor();\neditor.addBlock('heading');",
        "language": "javascript"
      }
    }
  ]
}
```

---

## セキュリティ

### XSS 対策

```typescript
function escapeHTML(text: string): string {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char] || char);
}
```

### URL 検証

```typescript
function sanitizeURL(url: string): string | null {
  const allowedProtocols = ['http://', 'https://', 'mailto:', '/'];
  const isAllowed = allowedProtocols.some(p => url.startsWith(p));
  return isAllowed ? url : null;
}
```

### JSON 検証

```typescript
function validateJSON(data: any): boolean {
  try {
    // スキーマバリデーション
    if (!data.version || !Array.isArray(data.blocks)) {
      return false;
    }
    
    for (const block of data.blocks) {
      if (!block.id || !block.type || typeof block.data !== 'object') {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}
```

---

## テスト計画

### ユニットテスト

```
ブロック管理テスト
  ✅ ブロック追加
  ✅ ブロック削除
  ✅ ブロック移動
  ✅ ブロック型変換
  
レンダリングテスト
  ✅ JSON → HTML 変換
  ✅ すべてのブロック型対応
  ✅ HTMLエスケープ
  
セキュリティテスト
  ✅ XSS 検出・対策
  ✅ URL 検証
  ✅ JSON 検証

目標: > 85% カバレッジ
```

### 統合テスト

```
ユーザーフロー1: ドキュメント作成
  1. エディター起動
  2. テキスト入力
  3. スラッシュコマンドで変換
  4. JSON 出力
  5. 保存・復元

ユーザーフロー2: ブロック操作
  1. 複数ブロック作成
  2. ドラッグで並び替え
  3. JSON 更新確認
  4. プレビュー更新確認
```

### パフォーマンステスト

```
大規模ドキュメント（500+ ブロック）処理
  目標: < 500ms

リアルタイムプレビュー更新
  目標: < 200ms

メモリ使用量
  目標: < 20MB
```

---

## 実装スケジュール

### Week 1: 設計・環境構築（3-4日）

```
□ TypeScript プロジェクト初期化
  ├─ tsconfig.json 設定
  ├─ Webpack 設定（複数フォーマット出力）
  └─ ESLint/Prettier セットアップ

□ ディレクトリ構成・ファイル作成
  ├─ src/core/ (BlockEditor, Renderer, types)
  ├─ src/utils/ (security, validation)
  └─ dist/ ディレクトリ準備

□ 型定義完成
  ├─ Block, EditorDocument, BlockType 等
  ├─ エディターオプション
  └─ レンダラー設定

□ ビルドパイプライン構築
  ├─ TypeScript → JavaScript コンパイル
  ├─ UMD/ESM/CommonJS 出力設定
  ├─ Minification 設定
  └─ ビルドスクリプト完成
```

### Week 2-3: コア機能実装（10-12日）

```
□ BlockEditor クラス実装
  ├─ ブロック追加・削除・移動・型変換
  ├─ JSON 出力・入力
  ├─ Undo/Redo 実装
  └─ テスト完了（ユニット）

□ Renderer クラス実装
  ├─ JSON → HTML 変換
  ├─ 全ブロックタイプ対応
  ├─ セキュリティ対策
  └─ テスト完了（ユニット）

□ ユーティリティ実装
  ├─ XSS 対策（sanitizeHTML）
  ├─ URL 検証（sanitizeURL）
  ├─ JSON 検証（validateJSON）
  └─ テスト完了

□ TypeScript → JavaScript ビルド
  ├─ tsc コンパイル完了
  ├─ UMD バンドル生成
  ├─ ESM バンドル生成
  ├─ CommonJS バンドル生成
  └─ Minified 版生成

□ 型定義ファイル生成
  ├─ wysiwyg-editor.d.ts 生成
  └─ IDE 補完確認
```

### Week 4: テスト・最適化・リリース準備（5-7日）

```
□ 統合テスト
  ├─ TypeScript コード統合テスト
  ├─ JavaScript 出力物テスト（すべてのフォーマット）
  ├─ ブラウザ互換性テスト
  └─ Node.js 環境テスト

□ パフォーマンス最適化
  ├─ バンドルサイズ確認（< 100KB minified）
  ├─ 処理速度最適化
  └─ メモリ使用量最適化

□ ドキュメント作成
  ├─ API ドキュメント（TypeScript）
  ├─ 使用方法ガイド（ブラウザ/Node.js/Deno）
  ├─ 型定義の説明
  └─ 拡張方法ガイド

□ npm パッケージ化
  ├─ package.json 最終設定
  ├─ npm publish テスト
  ├─ README.md 作成
  └─ CHANGELOG.md 作成

□ 本番環境デプロイ
  ├─ Adlaire Git Repository に統合
  ├─ npm レジストリに公開
  ├─ CDN に配布（オプション）
  └─ 監視・ログ設定完了
```

---

---

## チェックリスト

### 実装前

- [ ] TypeScript 環境確認
  - [ ] Node.js 16+ インストール
  - [ ] npm/yarn 利用可能
  - [ ] IDE で TypeScript 補完が機能

- [ ] ビルドツール確認
  - [ ] Webpack 理解
  - [ ] TypeScript Compiler 設定可能
  - [ ] npm スクリプト作成可能

- [ ] 全チームメンバーが本仕様書読了
- [ ] JSON スキーマの理解確認
- [ ] ライブラリ化の意図を理解

### TypeScript 実装完了チェック

**コア実装**
- [ ] BlockEditor クラス完成（すべてのメソッド）
- [ ] Renderer クラス完成（全ブロックタイプ対応）
- [ ] types.ts （型定義完全）
- [ ] security.ts（セキュリティ関数完全）
- [ ] index.ts（エクスポート完全）

**TypeScript テスト**
- [ ] tsc で型チェック成功
- [ ] ESLint でエラーなし
- [ ] ユニットテスト > 85%

### ビルド・出力完了チェック

**ビルド成果物**
- [ ] dist/wysiwyg-editor.js（UMD）生成成功
- [ ] dist/wysiwyg-editor.esm.js（ESM）生成成功
- [ ] dist/wysiwyg-editor.cjs.js（CommonJS）生成成功
- [ ] dist/wysiwyg-editor.min.js（Minified）生成成功
- [ ] dist/wysiwyg-editor.d.ts（型定義）生成成功

**出力物テスト**
- [ ] UMD - ブラウザで動作確認
- [ ] ESM - モダンブラウザで動作確認
- [ ] CommonJS - Node.js で動作確認
- [ ] 型定義 - IDE で補完確認

**バンドルサイズ**
- [ ] wysiwyg-editor.js < 150KB
- [ ] wysiwyg-editor.min.js < 50KB
- [ ] wysiwyg-editor.esm.js < 150KB

### npm パッケージ化完了チェック

- [ ] package.json 完成
  - [ ] name: @adlaire/wysiwyg-editor
  - [ ] version: 1.0.0
  - [ ] main, module, browser, types フィールド
  - [ ] scripts (build, dev, test, lint)

- [ ] npm publish テスト成功
- [ ] npm install で取得可能確認

### ドキュメント完了チェック

- [ ] README.md（使用方法）
  - [ ] ブラウザ使用例
  - [ ] Node.js 使用例
  - [ ] TypeScript/JavaScript 両対応
  - [ ] CDN リンク記載

- [ ] API ドキュメント
  - [ ] BlockEditor クラスすべてのメソッド
  - [ ] Renderer クラスすべてのメソッド
  - [ ] 型定義の説明

- [ ] サンプルコード
  - [ ] 基本的な使用例
  - [ ] JSON データの例
  - [ ] カスタマイズ例

### 再利用準備完了チェック

- [ ] 他プロジェクトで npm install 可能
- [ ] CDN で <script> 読み込み可能
- [ ] Deno で import 可能（オプション）
- [ ] TypeScript プロジェクトで型補完可能

### Phase 1 最終完了条件

**コアブロック（7個）**
- [ ] Heading（完全）
- [ ] Paragraph（完全）
- [ ] List（完全）
- [ ] Code（完全）
- [ ] Quote（完全）
- [ ] Image（完全）
- [ ] Divider（完全）

**推奨拡張ブロック（7個）**
- [ ] Checkbox（完全）
- [ ] Callout（完全）
- [ ] Spacer（完全）
- [ ] Separator 拡張（完全）
- [ ] Label（完全）
- [ ] Rating（完全）
- [ ] Progress（完全）

**コア機能**
- [ ] ブロック追加・削除・移動・型変換（完全）
- [ ] JSON 出力・入力・バリデーション（完全）
- [ ] ドラッグ&ドロップ（完全）
- [ ] スラッシュコマンド（完全）
- [ ] インラインツールバー（完全）
- [ ] Undo/Redo（完全）
- [ ] リアルタイムプレビュー（完全）
- [ ] 全 14 ブロックタイプ対応（完全）

**品質**
- [ ] ユニットテスト > 85% カバレッジ
- [ ] 統合テスト合格（すべてのビルド出力）
- [ ] パフォーマンステスト合格
- [ ] セキュリティ監査合格
- [ ] TypeScript 型チェック成功
- [ ] ESLint エラーなし

**ドキュメント**
- [ ] ユーザーガイド完成
- [ ] API ドキュメント完成
- [ ] 型定義ドキュメント完成
- [ ] デプロイメント手順書作成

**デプロイ**
- [ ] npm レジストリ公開
- [ ] Adlaire Git Repository に統合
- [ ] 監視・ログ設定完了
- [ ] ロールバック手順確認

---

## まとめ

### ブロックベース JSON エディター（TypeScript ライブラリ化・ブロック拡張対応）の特徴

```
✨ 豊富なブロックタイプ
  - Phase 1: 14 ブロック（コア7 + 推奨7）
  - Phase 2: 20 ブロック（+ 中級6）
  - Phase 3: 29 ブロック（+ 高級9）
  - 段階的な機能拡張で対応

✨ TypeScript で統一開発
  - 型安全・IDE補完・保守性向上
  - Deno ランタイムのみで実行

✨ 複数フォーマット出力
  - UMD（ブラウザ直接使用）
  - ESM（モダン JS）
  - CommonJS（Node.js）
  - すべて同じソースから自動生成

✨ ライブラリとして再利用可能
  - npm に公開
  - 他プロジェクトで npm install
  - CDN で <script> 読み込み
  - TypeScript/JavaScript 両対応

✨ Editor.js イメージ
  - シンプルで強力
  - 29 種類のブロックタイプ
  - ブロック単位での直感的操作
  - 完全な制御性（JSON）

✨ JSON 標準フォーマット
  - 業界標準で扱いやすい
  - API でデータ活用可能
  - バージョン管理に適している
```

### 実装のメリット

```
🎯 機能充実度
  → 7 種類 → 14 種類 → 29 種類へ段階的拡張
  → ビジネス要件に柔軟に対応

🎯 開発効率
  → TypeScript で型安全に開発
  → ビルドで自動的に複数フォーマット生成
  → Deno で シンプル実行

🎯 ユーザー体験
  → Notion ライクの高度な WYSIWYG
  → 多様なコンテンツに対応
  → 4-5週間で本番対応

🎯 柔軟性
  → JSON で完全に制御可能
  → 複数プロダクトで活用可能
  → ブロックタイプの拡張が容易

🎯 拡張性
  → Phase 別での段階的実装
  → 新ブロックタイプ追加が簡単
  → カスタム拡張も可能

🎯 再利用性
  → npm パッケージ化
  → 社内ライブラリとして活用
  → オープンソース化も可能
```

### 技術スタック（最終確定）

```
開発:
  ✅ TypeScript 5.2+
  ✅ Node.js 16+
  ✅ npm / yarn

ビルド:
  ✅ TypeScript Compiler (tsc)
  ✅ Webpack
  ✅ Terser（minification）

テスト:
  ✅ Jest（TypeScript テスト）
  ✅ ESLint（コード品質）
  ✅ Prettier（フォーマット）

出力:
  ✅ UMD バンドル（ブラウザ）
  ✅ ESM バンドル（モダン JS）
  ✅ CommonJS バンドル（Node.js）
  ✅ Minified + Source maps
  ✅ 型定義ファイル（.d.ts）
```

### 活用シナリオ

```
【Adlaire Git Repository】
  TypeScript コード → JavaScript ビルド
  → ブラウザ・Deno で実行

【他プロジェクト A】
  npm install @adlaire/wysiwyg-editor
  → TypeScript/JavaScript で import
  → 高度な WYSIWYG エディター利用

【他プロジェクト B】
  <script src="https://cdn/.../wysiwyg-editor.min.js"></script>
  → グローバル変数で利用
  → HTML だけで組み込み可能

【カスタマイズ】
  TypeScript ソース拡張
  → 自分でビルド
  → カスタム機能追加
```

---

**作成日**: 2026-08-20  
**バージョン**: 2.1（TypeScript 統一・ライブラリ化対応）  
**ステータス**: ✅ 実装準備完了

本仕様書に基づき、TypeScript で実装し、
複数フォーマットにビルドして、Phase 1 を完成させます。🚀
